import hashlib
import time
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from one_liner.client import RouterClient

from .session import get_session_id

"""
LOCK NOTES: 

- User leaves tab open: stays open until the TTL expires (ttl_s, default to 120 seconds)
- User closes tab: lease will remain until TTL expires, but idle timeout may release it sooner.
- User periodically sends heartbeats (renew calls) to extend the TTL without counting as activity.
- User performs actions (rpc calls) -> triggers touch function -> refreshes idle timeout.
- Idle_timeout (default to 10 minutes). No activity within this period will release the lease. User will find out on the next renewal call

User cases: 

- Stop doing stuff for 10 minutes - you lose token
- Close/crash tab/browser - can reconnect no problem, but you have a 120 second window (shorter if you havent done anything for over 9 minutes)
- You ask friend to finish their stuff, you have to wait 120 second before you can connect after they close lol...
"""


@dataclass
class _Lease:
    session_id: str
    expires_at: float
    last_activity: float


@dataclass
class _TokenOwner:
    owner_id: str | None
    owned_by_this_client: bool


class WriteLock:
    def __init__(self, client: RouterClient, ttl_s: float = 120.0, idle_timeout_s: float = 600.0):
        self.client = client
        self.ttl_s = ttl_s
        self.idle_timeout_s = idle_timeout_s
        self._lease: _Lease | None = None

    def get_lease(self, session_id: str, force: bool = False) -> bool:
        """
        Get the lease for the given session, optionally forcing acquisition.

        Parameters:
            session_id: The ID of the session attempting to acquire the lease.
            force: Whether to force acquisition of the lease, even if it is held by another session.

        Returns:
            True if the lease was successfully acquired for the session, False otherwise.
        """
        # Check token status - attempt to grab write token if missing or invalid
        if force or not self.client.has_write_token() or not self.client.has_write_access():
            try:
                # timeout_s=None would retry forever in a tight loop, blocking the event loop
                self.client.get_write_token(force=force, timeout_s=0)
            except PermissionError:
                return False

        # Lease taken by another session - don't want to force grab
        if self._is_lease_taken(session_id) and not force:
            return False

        # Create new lease for this session
        now = time.monotonic()
        self._lease = _Lease(session_id, now + self.ttl_s, now)

        return True

    def has_lease(self, session_id: str) -> bool:
        """
        Check whether the given session currently holds the lease.

        Parameters:
            session_id: The ID of the session to check for lease ownership.

        Returns:
            True if the session currently holds the lease, False otherwise.
        """
        # Get current lease - check if it is held by the given session
        return self._lease is not None and self._lease.session_id == session_id

    def has_token(self) -> bool:
        """
        Check whether the client currently has a write token.

        Returns:
            True if the client has a write token, False otherwise.
        """
        return self.client.has_write_token() and self.client.has_write_access()

    def renew_lease_ttl(self, session_id: str) -> bool:
        """
        Renew the TTL of the lease for the given session, without counting as activity.

        Parameters:
            session_id: The ID of the session attempting to renew the lease.

        Returns:
            True if the lease was successfully renewed for the session, False otherwise.
        """
        # Check if current lease is held by this session
        if self._lease is None or self._lease.session_id != session_id:
            return False

        # Extend the lease TTL for this session
        self._lease.expires_at = time.monotonic() + self.ttl_s
        return True

    def renew_lease_activity(self, session_id: str) -> None:
        """
        Record activity for the given session, updating the last activity timestamp of the lease.

        Parameters:
            session_id: The ID of the session performing activity.
        """
        # Update last activity timestamp if the lease is held by this session
        if self._lease is not None and self._lease.session_id == session_id:
            self._lease.last_activity = time.monotonic()

    def release_lease(self, session_id: str) -> bool:
        """
        Release the lease and write token if held by the given session.

        Parameters:
            session_id: The ID of the session releasing the lease.

        Returns:
            True if the lease was released, False if the session did not hold it.
        """
        if self._lease is None or self._lease.session_id != session_id:
            return False

        self._lease = None
        if self.client.has_write_token():
            self.client.release_write_token()
        return True

    def get_owner(self) -> _TokenOwner:
        if (
            not self.client.has_write_token()
            or not self.client.has_write_access()
            or self.client.get_write_token_owner() != self.client.name
        ):
            return _TokenOwner(owner_id=self.client.get_write_token_owner(), owned_by_this_client=False)
        if self._lease is None:
            return _TokenOwner(owner_id="", owned_by_this_client=True)
        # Session ids are auth cookies; expose only a one-way fingerprint.
        fingerprint = hashlib.sha256(self._lease.session_id.encode()).hexdigest()[:8]
        return _TokenOwner(owner_id=fingerprint, owned_by_this_client=True)

    def check_and_expire_lease_and_token(self) -> bool:
        """
        Check and expire and release lease and write token based on:
        - Whether the write token is held
        - Whether write access is available
        - Whether the lease TTL has expired
        - Whether the lease idle timeout has been exceeded

        Returns:
            True if the lease or token was expired and released, False otherwise.
        """
        now = time.monotonic()

        # If no write token - release lease
        if not self.client.has_write_token():
            self._lease = None
            return True
        # If write token, but no write access - release lease AND write token
        elif not self.client.has_write_access():
            # Release lease and give up write token, no longer has write access
            self._lease = None
            self.client.release_write_token()
            return True
        # Token owner doesn't match the current client (someone else holds the token)
        elif self.client.get_write_token_owner() != self.client.name:
            # Release the lease since the token owner doesn't match the current client
            self._lease = None
            return True

        # If TTL expired or idle timeout exceeded, release lease and write token
        if self._lease is not None and (
            self._lease.expires_at <= now  # Lease TTL expired
            or now - self._lease.last_activity > self.idle_timeout_s  # Idle timeout expired
        ):
            self._lease = None
            self.client.release_write_token()
            return True

        return False

    def _is_lease_taken(self, session_id: str):
        return self._lease is not None and self._lease.session_id != session_id


################################################################################
#
#   Write Lock API for FastAPI
#
################################################################################


def get_write_lock(request: Request) -> WriteLock:
    """Get the write lock instance from the request."""
    return request.app.state.write_lock


async def record_activity(
    session_id: str = Depends(get_session_id),
    write_lock: WriteLock = Depends(get_write_lock),
) -> None:
    """Record activity for the current session by touching the lease (extends session activity time)."""
    write_lock.renew_lease_activity(session_id)


async def require_write(
    session_id: str = Depends(get_session_id),
    write_lock: WriteLock = Depends(get_write_lock),
) -> None:
    """Require the caller to hold the lease (write lock)."""
    if not write_lock.has_token() or not write_lock.has_lease(session_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Write token required")
