'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Check, X, Eye, MessageSquare, AlertTriangle, Star, Mail, Flag } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  tutor: { name: string }
  reviewer: { full_name: string }
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

interface ReportedContent {
  id: string
  content_type: string
  content_id: string
  reason: string
  description: string
  reporter_id: string
  status: string
  created_at: string
}

interface ContentManagementProps {
  pendingReviews: Review[]
  contactMessages: ContactMessage[]
  reportedContent: ReportedContent[]
}

export function ContentManagement({ 
  pendingReviews: initialReviews, 
  contactMessages: initialMessages,
  reportedContent: initialReports
}: ContentManagementProps) {
  const [pendingReviews, setPendingReviews] = useState(initialReviews)
  const [contactMessages, setContactMessages] = useState(initialMessages)
  const [reportedContent, setReportedContent] = useState(initialReports)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  async function approveReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) throw error

      setPendingReviews(pendingReviews.filter(review => review.id !== reviewId))
      
      toast({
        title: "Review approved",
        description: "The review has been published",
      })
    } catch (error: any) {
      toast({
        title: "Error approving review",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function rejectReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      setPendingReviews(pendingReviews.filter(review => review.id !== reviewId))
      
      toast({
        title: "Review rejected",
        description: "The review has been removed",
      })
    } catch (error: any) {
      toast({
        title: "Error rejecting review",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function markMessageAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error

      setContactMessages(contactMessages.filter(msg => msg.id !== messageId))
      
      toast({
        title: "Message marked as read",
        description: "The message has been processed",
      })
    } catch (error: any) {
      toast({
        title: "Error updating message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function resolveReport(reportId: string, action: 'resolved' | 'dismissed') {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ status: action })
        .eq('id', reportId)

      if (error) throw error

      setReportedContent(reportedContent.filter(report => report.id !== reportId))
      
      toast({
        title: `Report ${action}`,
        description: `The content report has been ${action}`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating report",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <Tabs defaultValue="reviews" className="space-y-6">
      <TabsList>
        <TabsTrigger value="reviews">
          Reviews ({pendingReviews.length})
        </TabsTrigger>
        <TabsTrigger value="messages">
          Messages ({contactMessages.length})
        </TabsTrigger>
        <TabsTrigger value="reports">
          Reports ({reportedContent.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reviews">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Review and approve tutor reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.length > 0 ? (
                pendingReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-600">
                            by {review.reviewer.full_name}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Review for: {review.tutor.name}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          {review.comment}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => approveReview(review.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectReview(review.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No pending reviews</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="messages">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Unread Messages</CardTitle>
              <CardDescription>Contact form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {contactMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{message.name}</p>
                        <p className="text-sm text-gray-600">{message.email}</p>
                        <p className="text-sm font-medium mt-1">{message.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedMessage && (
            <Card>
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
                <CardDescription>From: {selectedMessage.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Subject</h4>
                  <p className="text-sm">{selectedMessage.subject}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Message</h4>
                  <p className="text-sm whitespace-pre-line">{selectedMessage.message}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => markMessageAsRead(selectedMessage.id)}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Content Reports</CardTitle>
            <CardDescription>User-reported content requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportedContent.length > 0 ? (
                reportedContent.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg border-orange-200 bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Flag className="h-4 w-4 text-orange-500" />
                          <Badge variant="secondary">{report.content_type}</Badge>
                          <Badge variant="outline">{report.reason}</Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Content ID: {report.content_id}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reported: {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => resolveReport(report.id, 'resolved')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveReport(report.id, 'dismissed')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No pending reports</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
