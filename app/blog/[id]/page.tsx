import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function BlogPostPage({ params }: { params: { id: string } }) {
  // This is a placeholder - you would fetch the actual blog post data
  const post = {
    id: params.id,
    title: 'Sample Blog Post',
    content: 'This is a sample blog post content.',
    author: 'Tutelage Team',
    date: '2025-01-08',
    image: '/images/blog_image.webp'
  }

  if (!post) {
    notFound()
  }

  return (
    <main className="py-20">
      <div className="container mx-auto px-6">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
              <span>By {post.author}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 object-cover rounded-lg"
            />
          </header>
          
          <div className="prose prose-lg max-w-none">
            <p>{post.content}</p>
          </div>
          
          <div className="mt-8">
            <Button asChild>
              <Link href="/blog">← Back to Blog</Link>
            </Button>
          </div>
        </article>
      </div>
    </main>
  )
}