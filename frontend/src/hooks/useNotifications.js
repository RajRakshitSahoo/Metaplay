import { useState, useEffect } from 'react'
import api from '../utils/api'
import { getSocket } from '../utils/socket'

export function useNotifications() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    api.get('/notifications').then(({ data }) => {
      if (data.success) setCount(data.notifications.filter(n => !n.isRead).length)
    }).catch(() => {})

    const socket = getSocket()
    if (!socket) return
    const handler = () => setCount(c => c + 1)
    socket.on('notification:new', handler)
    return () => socket.off('notification:new', handler)
  }, [])

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setCount(0)
  }

  return { count, markAllRead }
}

export default useNotifications
