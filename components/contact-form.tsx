'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/client'
import { useToast } from '@/hooks/use-toast'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name,
            email,
            subject,
            message
          }
        ])

      if (error) throw error

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      })

      // Reset form
      const form = document.getElementById('contact-form') as HTMLFormElement
      form.reset()
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="contact-form" action={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="block text-gray-800 font-semibold mb-2">Name:</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE1]"
        />
      </div>
      <div>
        <Label htmlFor="email" className="block text-gray-800 font-semibold mb-2">Email:</Label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE1]"
        />
      </div>
      <div>
        <Label htmlFor="subject" className="block text-gray-800 font-semibold mb-2">Subject:</Label>
        <Input
          type="text"
          id="subject"
          name="subject"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE1]"
        />
      </div>
      <div>
        <Label htmlFor="message" className="block text-gray-800 font-semibold mb-2">Message:</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE1]"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#8A2BE1] hover:bg-[#5d1a9a] text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
