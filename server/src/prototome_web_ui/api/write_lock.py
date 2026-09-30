import time
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status

from .session import get_session_id

EXAMPLE_WRITE_TOKEN = "example-write-token"

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


class WriteLock:
    def __init__(self, token: str, ttl_s: float = 120.0, idle_timeout_s: float = 600.0):
        self.token = token
        self.ttl_s = ttl_s
        self.idle_timeout_s = idle_timeout_s
        self._lease: _Lease | None = None

    def _active(self) -> _Lease | None:
        """Return the active lease if it exists and has not expired, otherwise None."""

        now = time.monotonic()

        # Expire the lease if it has passed its TTL or idle timeout.
        #   TTL expires when browser stops sending heartbeats (renew calls)
        #   Idle timeout expires when the holder has not performed any activity (touch calls)
        if self._lease is not None and (
            self._lease.expires_at <= now or now - self._lease.last_activity > self.idle_timeout_s
        ):
            self._lease = None
        return self._lease

    def is_locked(self) -> bool:
        """Check if the write lock is currently held by any session."""
        return self._active() is not None

    def is_holder(self, session_id: str) -> bool:
        """Check if the current session holds the lease."""
        lease = self._active()
        return lease is not None and lease.session_id == session_id

    def held_by_other(self, session_id: str) -> bool:
        """Check if the lease is held by another session."""
        lease = self._active()
        return lease is not None and lease.session_id != session_id

    def acquire(self, session_id: str, force: bool = False) -> bool:
        """Claim the lease (counts as activity). `force` takes it from another holder."""
        if self.held_by_other(session_id) and not force:
            return False
        now = time.monotonic()
        self._lease = _Lease(session_id, now + self.ttl_s, now)
        return True

    def renew(self, session_id: str) -> bool:
        """Extend the lease WITHOUT counting as activity (effects TTL)."""
        lease = self._active()
        if lease is None or lease.session_id != session_id:
            return False
        lease.expires_at = time.monotonic() + self.ttl_s
        return True

    def touch(self, session_id: str) -> None:
        """Record activity for the current session (effects idle timeout)."""
        lease = self._active()
        if lease is not None and lease.session_id == session_id:
            lease.last_activity = time.monotonic()

    def release(self, session_id: str) -> None:
        """Release the lease if the current session holds it."""
        if self.is_holder(session_id):
            self._lease = None


################################################################################
#
#   Write Lock API
#
################################################################################


def get_write_lock(request: Request) -> WriteLock:
    """Get the write lock instance from the request."""
    return request.app.state.write_lock


async def record_activity(
    session_id: str = Depends(get_session_id),
    write_lock: WriteLock = Depends(get_write_lock),
) -> None:
    """Record activity for the current session by touching the write lock."""
    write_lock.touch(session_id)


async def require_write(
    session_id: str = Depends(get_session_id),
    write_lock: WriteLock = Depends(get_write_lock),
) -> None:
    """Require the caller to hold the write lock."""
    if not write_lock.is_holder(session_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Write token required")
