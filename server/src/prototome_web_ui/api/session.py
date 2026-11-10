import secrets
from collections.abc import Awaitable, Callable

from fastapi import Request, Response

SESSION_COOKIE = "prototome_session"


async def ensure_session_cookie(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Assign each browser a random session id cookie on its first request."""
    sid = request.cookies.get(SESSION_COOKIE)
    is_new = sid is None
    if is_new:
        sid = secrets.token_urlsafe(16)
    request.state.session_id = sid
    response = await call_next(request)
    if is_new:
        # No secure=True: served over plain http on the LAN.
        response.set_cookie(SESSION_COOKIE, sid, httponly=True, samesite="strict")
    return response


def get_session_id(request: Request) -> str:
    return request.state.session_id
