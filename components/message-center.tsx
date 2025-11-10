'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Send, Search, Plus } from 'lucide-react'
import { safeString } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject?: string
  content: string
  is_read: boolean
  created_at: string
  sender?: { full_name?: string; avatar_url?: string }
  recipient?: { full_name?: string; avatar_url?: string }
}

interface Contact {
  id: string
  full_name?: string
  avatar_url?: string
  user_type: string
}

interface MessageCenterProps {
  currentUserId: string
  messages: Message[]
  contacts: Contact[]
}

export function MessageCenter({ currentUserId, messages: initialMessages, contacts }: MessageCenterProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Group messages by conversation
  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id
    if (!acc[otherUserId]) {
      acc[otherUserId] = []
    }
    acc[otherUserId].push(message)
    return acc
  }, {} as Record<string, Message[]>)

  const filteredContacts = contacts.filter(contact =>
    safeString(contact.full_name).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedConversation = selectedContact ? conversations[selectedContact.id] || [] : []

  async function sendMessage() {
    if (!selectedContact || !newMessage.trim()) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUserId,
            recipient_id: selectedContact.id,
            subject: subject.trim() || null,
            content: newMessage.trim(),
            message_type: 'general'
          }
        ])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fkey(full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      setMessages([data, ...messages])
      setNewMessage('')
      setSubject('')

      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${safeString(selectedContact.full_name)}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again later."
      toast({
        title: "Error sending message",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  async function markAsRead(messageId: string) {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', currentUserId)

      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Contacts List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conversations</CardTitle>
            <Button size="sm" onClick={() => setIsComposing(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredContacts.map((contact) => {
              const conversation = conversations[contact.id] || []
              const lastMessage = conversation[0]
              const unreadCount = conversation.filter(msg =>
                !msg.is_read && msg.recipient_id === currentUserId
              ).length

              return (
                <div
                  key={contact.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                  onClick={() => {
                    setSelectedContact(contact)
                    setIsComposing(false)
                    // Mark messages as read
                    conversation.forEach(msg => {
                      if (!msg.is_read && msg.recipient_id === currentUserId) {
                        markAsRead(msg.id)
                      }
                    })
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {safeString(contact.full_name).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {safeString(contact.full_name)}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{contact.user_type}</p>
                      {lastMessage && (
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Message View */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedContact ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedContact.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {safeString(selectedContact.full_name).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{safeString(selectedContact.full_name)}</span>
              </div>
            ) : isComposing ? (
              'New Message'
            ) : (
              'Select a conversation'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedContact && !isComposing ? (
            <>
              {/* Messages */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {selectedConversation.length > 0 ? (
                  selectedConversation.reverse().map((message) => {
                    const isFromCurrentUser = message.sender_id === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isFromCurrentUser
                            ? 'bg-[#8A2BE1] text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          {message.subject && (
                            <p className="font-semibold text-sm mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isFromCurrentUser ? 'text-purple-200' : 'text-gray-500'
                            }`}>
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <Input
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : isComposing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="recipient-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Recipient
                </label>
                <select
                  id="recipient-select"
                  aria-label="Select message recipient"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  onChange={(e) => {
                    const contact = contacts.find(c => c.id === e.target.value)
                    if (contact) setSelectedContact(contact)
                  }}
                >
                  <option value="">Choose a contact...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {safeString(contact.full_name)} ({contact.user_type})
                    </option>
                  ))}
                </select>
              </div>

              {selectedContact && (
                <div className="space-y-2">
                  <Input
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      Send Message
                    </Button>
                    <Button variant="outline" onClick={() => setIsComposing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
