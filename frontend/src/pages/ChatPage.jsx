import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiSend, FiSmile, FiHash, FiArrowLeft, FiUser } from 'react-icons/fi'
import api from '../utils/api'
import { getSocket } from '../utils/socket'
import useAuthStore from '../store/authStore'
import useGameStore from '../store/gameStore'

const EMOJIS = ['😀','😎','🎮','🏆','🔥','💪','👑','⚡','🎯','🤖','😂','🤔','😤','🥳','💀','🙏','👏','🎉']

export default function ChatPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { lobbyMessages, addLobbyMessage, setLobbyMessages } = useGameStore()
  const [tab, setTab] = useState(userId ? 'private' : 'lobby')
  const [message, setMessage] = useState('')
  const [chatData, setChatData] = useState(null)
  const [privateMessages, setPrivateMessages] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [myChats, setMyChats] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const inputRef = useRef(null)

  // Load initial data
  useEffect(() => {
    api.get('/chat/lobby').then(({ data }) => {
      if (data.success) setLobbyMessages(data.messages || [])
    }).catch(() => {})
    api.get('/chat/my-chats').then(({ data }) => {
      if (data.success) setMyChats(data.chats || [])
    }).catch(() => {})
  }, [])

  // Load private chat
  useEffect(() => {
    if (!userId) { setTab('lobby'); return }
    setTab('private')
    api.get(`/chat/private/${userId}`).then(({ data }) => {
      if (data.success) {
        setChatData(data.chat)
        setPrivateMessages(data.chat.messages || [])
        // Get other user info
        const other = data.chat.participants?.find(p => p._id !== user?._id)
        setOtherUser(other)
      }
    }).catch(() => {})
  }, [userId, user?._id])

  // Socket listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleLobbyMsg = (msg) => addLobbyMessage(msg)
    const handlePrivateMsg = ({ chatId, message: msg }) => {
      if (chatData?._id === chatId || tab === 'private') {
        setPrivateMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    }
    const handlePrivateSent = ({ chatId, message: msg }) => {
      setPrivateMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }
    const handleTypingStart = ({ from, chatId }) => {
      if (chatData?._id === chatId) setTypingUser(from)
    }
    const handleTypingStop = () => setTypingUser(null)

    socket.on('lobby:message', handleLobbyMsg)
    socket.on('private:message', handlePrivateMsg)
    socket.on('private:message:sent', handlePrivateSent)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('lobby:message', handleLobbyMsg)
      socket.off('private:message', handlePrivateMsg)
      socket.off('private:message:sent', handlePrivateSent)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [chatData, tab, addLobbyMessage])

  // Auto scroll
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [lobbyMessages, privateMessages])

  const sendMessage = useCallback(() => {
    const trimmed = message.trim()
    if (!trimmed) return
    const socket = getSocket()

    if (tab === 'lobby') {
      if (socket?.connected) {
        socket.emit('lobby:message', { content: trimmed })
      } else {
        // Fallback: add locally
        addLobbyMessage({
          username: user?.username, avatar: user?.avatar,
          content: trimmed, createdAt: new Date().toISOString()
        })
      }
    } else if (tab === 'private' && chatData && userId) {
      if (socket?.connected) {
        socket.emit('private:message', {
          chatId: chatData._id,
          content: trimmed,
          toUserId: userId
        })
      } else {
        // Fallback: REST API
        api.post(`/chat/${chatData._id}/message`, { content: trimmed }).then(({ data }) => {
          if (data.success) setPrivateMessages(prev => [...prev, data.message])
        })
      }
    }
    setMessage('')
    setShowEmojis(false)
    inputRef.current?.focus()
  }, [message, tab, chatData, userId, user, addLobbyMessage])

  const handleTyping = (val) => {
    setMessage(val)
    const socket = getSocket()
    if (tab === 'private' && socket && userId && chatData) {
      socket.emit('typing:start', { chatId: chatData._id, toUserId: userId })
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        socket.emit('typing:stop', { chatId: chatData._id, toUserId: userId })
      }, 1500)
    }
  }

  const messages = tab === 'lobby' ? lobbyMessages : privateMessages

  const MessageBubble = ({ msg }) => {
    const senderId = msg.sender?._id || msg.sender
    const isOwn = senderId === user?._id || msg.username === user?.username
    const displayName = msg.username || msg.sender?.username || 'Unknown'
    const avatarSeed = msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
    const content = msg.content || msg.message || ''

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : ''}`}>
        <img src={avatarSeed} alt="" className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0"
          onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}` }} />
        <div className={`max-w-[70%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
          <span className="text-xs text-white/30 font-body px-1">{displayName}</span>
          <div className={`px-4 py-2 rounded-2xl text-sm font-body break-words
            ${isOwn
              ? 'bg-neon-cyan/20 border border-neon-cyan/30 text-white rounded-br-sm'
              : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
            }`}>
            {content}
          </div>
          <span className="text-xs text-white/20 px-1">
            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <div className="hidden sm:flex w-56 flex-col bg-bg-secondary/50 border-r border-white/5 p-3 overflow-y-auto">
        <div className="text-xs font-cyber text-white/40 tracking-widest px-2 mb-3">CHANNELS</div>
        <button onClick={() => { setTab('lobby'); navigate('/app/chat') }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body mb-1 transition-all
          ${!userId ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
          <FiHash className="w-4 h-4" /> Lobby
        </button>

        {myChats.length > 0 && (
          <>
            <div className="text-xs font-cyber text-white/30 tracking-widest px-2 my-3">DIRECT MESSAGES</div>
            {myChats.map(chat => {
              const other = chat.participants?.find(p => p._id !== user?._id)
              return other ? (
                <Link key={chat._id} to={`/app/chat/${other._id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all mb-1
                  ${userId === other._id ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  <img src={other.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.username}`}
                    alt="" className="w-5 h-5 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs">{other.username}</div>
                    {chat.lastMessage && (
                      <div className="text-xs text-white/20 truncate">{chat.lastMessage.content}</div>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${other.status === 'online' ? 'bg-green-400' : 'bg-white/20'}`} />
                </Link>
              ) : null
            })}
          </>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-bg-secondary/30 flex-shrink-0">
          <Link to="/app/chat" className="text-white/40 hover:text-white sm:hidden">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <FiHash className="text-neon-cyan flex-shrink-0" />
          <span className="font-cyber text-sm text-white">
            {tab === 'lobby' ? 'Lobby' : otherUser?.username || 'Direct Message'}
          </span>
          <span className="text-xs text-white/30 font-body ml-1">
            {tab === 'lobby' ? 'Global chat' : ''}
          </span>
          {otherUser && tab === 'private' && (
            <div className={`w-2 h-2 rounded-full ml-1 ${otherUser.status === 'online' ? 'bg-green-400' : 'bg-white/20'}`} />
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-white/30 font-body text-sm">
                  {tab === 'lobby' ? 'Say hello to everyone!' : `Start a conversation with ${otherUser?.username || 'your friend'}!`}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={msg._id || i} msg={msg} />)
          )}
          {typingUser && (
            <div className="flex items-center gap-2 text-white/40 text-xs font-body pl-9">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              {typingUser} is typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="px-5 pb-2 flex flex-wrap gap-1.5 bg-bg-secondary/50 border-t border-white/5">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { setMessage(m => m + e); inputRef.current?.focus() }}
                  className="text-xl hover:scale-125 transition-transform p-0.5">{e}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/5 flex gap-2 flex-shrink-0 bg-bg-secondary/20">
          <button onClick={() => setShowEmojis(!showEmojis)}
            className={`p-2.5 rounded-lg transition-colors flex-shrink-0 ${showEmojis ? 'text-neon-cyan bg-neon-cyan/10' : 'text-white/40 hover:text-neon-cyan hover:bg-white/5'}`}>
            <FiSmile className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            value={message}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            className="input-cyber flex-1 min-w-0"
            placeholder={tab === 'lobby' ? 'Message lobby...' : `Message ${otherUser?.username || ''}...`}
          />
          <button onClick={sendMessage} disabled={!message.trim()}
            className="p-2.5 text-neon-cyan disabled:opacity-30 hover:bg-neon-cyan/10 rounded-lg transition-all border border-transparent hover:border-neon-cyan/30 flex-shrink-0">
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
