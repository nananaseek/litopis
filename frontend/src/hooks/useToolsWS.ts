import { useEffect, useRef } from 'react'

interface ToolEvent {
  type: string
  tool_id?: string
  owner_id?: string
}

export function useToolsWS(onEvent: (event: ToolEvent) => void, enabled = true) {
  const cbRef = useRef(onEvent)
  cbRef.current = onEvent

  useEffect(() => {
    if (!enabled) return

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const url = `${proto}//${host}/api/v1/ws/tools`

    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>
    let alive = true

    function connect() {
      if (!alive) return
      ws = new WebSocket(url)

      ws.onmessage = (msg) => {
        try {
          const event: ToolEvent = JSON.parse(msg.data)
          cbRef.current(event)
        } catch { /* ignore malformed */ }
      }

      ws.onclose = () => {
        if (alive) reconnectTimer = setTimeout(connect, 2000)
      }

      ws.onerror = () => ws?.close()
    }

    connect()

    return () => {
      alive = false
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [enabled])
}
