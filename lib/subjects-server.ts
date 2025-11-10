import { createClient } from '@/lib/server'

// Server-side: Fetch all active subjects from database
export async function getSubjects(category?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('subjects')
    .select('id, name, category, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: subjects, error } = await query

  if (error) {
    console.warn('Error fetching subjects:', error)
    // Fallback to common subjects if database query fails
    return [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature',
      'English Language', 'History', 'Geography', 'French', 'Spanish',
      'Computer Science', 'Economics', 'Psychology', 'Art', 'Music'
    ]
  }

  return subjects?.map(subject => subject.name) || []
}

// Server-side: Fetch all active teaching levels from database
export async function getTeachingLevels() {
  const supabase = await createClient()
  
  const { data: levels, error } = await supabase
    .from('teaching_levels')
    .select('id, name, description, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('Error fetching teaching levels:', error)
    // Fallback to common levels if database query fails
    return ['Primary', 'KS1', 'KS2', 'KS3', 'GCSE', 'A-Level', 'University', 'Adult']
  }

  return levels?.map(level => level.name) || []
}
