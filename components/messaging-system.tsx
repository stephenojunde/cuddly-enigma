"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/client'
import { Send, MessageCircle, User, Search, MoreVertical, Paperclip, Smile } from 'lucide-react'
import Image from 'next/image'

const supabase = createClient()

interface User {
  id: string
  full_name: string
  avatar_url?: string
  user_type: 'parent' | 'teacher' | 'school' | 'admin'
}

interface Conversation {
  id: string
  participants: string[]
  conversation_type: 'direct' | 'group' | 'booking_related'
  title?: string
  booking_id?: string
  is_active: boolean
  last_message_at: string
  created_at: string
  other_participant?: User
  last_message?: {
    content: string
    sender_id: string
    created_at: string
  }
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message_type: 'text' | 'image' | 'file' | 'system'
  content: string
  attachment_url?: string
  reply_to?: string
  is_read: boolean
  read_at?: string
  created_at: string
  sender?: User
}

export default function MessagingSystem() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const setupRealtimeSubscriptions = useCallback(() => {
    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (currentConversation && payload.new.conversation_id === currentConversation.id) {
            loadMessages(currentConversation.id)
          }
          loadConversations() // Refresh conversation list
        }
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [currentConversation])

  const initialize = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to access messages')
        return
      }

      // Load current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setCurrentUser(profile)

      // Load conversations
      await loadConversations()
      
      // Load users for new conversations
      await loadUsers()

      // Set up real-time subscriptions
      setupRealtimeSubscriptions()
    } catch (err) {
      setError('Failed to initialize messaging')
      console.error('Error initializing messaging:', err)
    } finally {
      setLoading(false)
    }
  }, [setupRealtimeSubscriptions])

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id)
      markMessagesAsRead(currentConversation.id)
    }
  }, [currentConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(
            content,
            sender_id,
            created_at
          )
        `)
        .contains('participants', [user.id])
        .eq('is_active', true)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Process conversations to get other participants
      const processedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantIds = conv.participants.filter((p: string) => p !== user.id)
          let otherParticipant = null

          if (otherParticipantIds.length > 0) {
            const { data: participantData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, user_type')
              .eq('id', otherParticipantIds[0])
              .single()

            otherParticipant = participantData
          }

          return {
            ...conv,
            other_participant: otherParticipant,
            last_message: conv.messages?.[0] || null
          }
        })
      )

      setConversations(processedConversations)
    } catch (err) {
      console.error('Error loading conversations:', err)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url, user_type)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .neq('id', user.id)
        .in('user_type', ['parent', 'teacher'])
        .order('full_name')

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentConversation || !currentUser) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          sender_id: currentUser.id,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentConversation.id)

      setNewMessage('')
      await loadMessages(currentConversation.id)
      await loadConversations()
    } catch (err) {
      setError('Failed to send message')
      console.error('Error sending message:', err)
    }
  }

  const createNewConversation = async () => {
    if (selectedUsers.length === 0 || !currentUser) return

    try {
      const participants = [currentUser.id, ...selectedUsers]
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participants,
          conversation_type: 'direct',
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setShowNewConversation(false)
      setSelectedUsers([])
      await loadConversations()
      
      // Select the new conversation
      const newConv = conversations.find(c => c.id === data.id)
      if (newConv) setCurrentConversation(newConv)
    } catch (err) {
      setError('Failed to create conversation')
      console.error('Error creating conversation:', err)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-md p-4 z-10">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Start new conversation"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setCurrentConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {conversation.other_participant?.avatar_url ? (
                      <Image
                        src={conversation.other_participant.avatar_url}
                        alt={conversation.other_participant.full_name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title || conversation.other_participant?.full_name || 'Unknown'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message.content}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conversation.other_participant?.user_type === 'teacher' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {conversation.other_participant?.user_type === 'teacher' ? 'Tutor' : 'Parent'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {currentConversation.other_participant?.avatar_url ? (
                      <Image
                        src={currentConversation.other_participant.avatar_url}
                        alt={currentConversation.other_participant.full_name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {currentConversation.title || currentConversation.other_participant?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentConversation.other_participant?.user_type === 'teacher' ? 'Tutor' : 'Parent'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600" title="More options">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentUser?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === currentUser?.id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Start New Conversation</h3>
            
            <div className="space-y-2 mb-4">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(prev => [...prev, user.id])
                      } else {
                        setSelectedUsers(prev => prev.filter(id => id !== user.id))
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.avatar_url ? (
                      <Image 
                        src={user.avatar_url} 
                        alt={user.full_name} 
                        width={32}
                        height={32}
                        className="rounded-full object-cover" 
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.user_type === 'teacher' ? 'Tutor' : 'Parent'}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={createNewConversation}
                disabled={selectedUsers.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Start Conversation
              </button>
              <button
                onClick={() => {
                  setShowNewConversation(false)
                  setSelectedUsers([])
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
