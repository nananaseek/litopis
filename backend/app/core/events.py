import asyncio
from collections.abc import Callable, Coroutine
from typing import Any

EventCallback = Callable[[dict[str, Any]], Coroutine[Any, Any, None]]

_subscribers: set[EventCallback] = set()
_lock = asyncio.Lock()


async def subscribe(callback: EventCallback) -> None:
    async with _lock:
        _subscribers.add(callback)


async def unsubscribe(callback: EventCallback) -> None:
    async with _lock:
        _subscribers.discard(callback)


async def broadcast(event: dict[str, Any]) -> None:
    async with _lock:
        listeners = list(_subscribers)
    for cb in listeners:
        try:
            await cb(event)
        except Exception:
            pass
