import { useEffect, useState } from 'react'
import { getSocket } from '../utils/socket'

export function useSocket(event, handler) {
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !event || !handler) return
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [event, handler])
}

export function useSocketEmit() {
  const emit = (event, data) => {
    const socket = getSocket()
    if (socket?.connected) socket.emit(event, data)
  }
  return emit
}

export default useSocket
