"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { User, Plus, Edit2, Trash2, BookOpen, Calendar } from 'lucide-react'

const supabase = createClient()

interface Child {
  id: string
  parent_id: string
  name: string
  age?: number
  school_year?: string
  special_needs?: string
  subjects_of_interest?: string[]
  learning_style?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface ChildrenManagerProps {
  onChildAdded?: (child: Child) => void
}

export default function ChildrenManager({ onChildAdded }: ChildrenManagerProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    school_year: '',
    special_needs: '',
    subjects_of_interest: [] as string[],
    learning_style: '',
    notes: ''
  })

  const schoolYears = [
    'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
    'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'
  ]

  const commonSubjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Music',
    'Physical Education', 'Computing', 'Design Technology', 'Modern Languages',
    'Religious Education', 'Philosophy', 'Psychology', 'Business Studies'
  ]

  const learningStyles = [
    'Visual Learner', 'Auditory Learner', 'Kinesthetic Learner', 'Reading/Writing Learner'
  ]

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to manage children')
        return
      }

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setChildren(data || [])
    } catch (err) {
      setError('Failed to load children')
      console.error('Error loading children:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      school_year: '',
      special_needs: '',
      subjects_of_interest: [],
      learning_style: '',
      notes: ''
    })
    setEditingChild(null)
    setShowForm(false)
  }

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects_of_interest: prev.subjects_of_interest.includes(subject)
        ? prev.subjects_of_interest.filter(s => s !== subject)
        : [...prev.subjects_of_interest, subject]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const childData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        parent_id: user.id
      }

      if (editingChild) {
        // Update existing child
        const { error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', editingChild.id)

        if (error) throw error
      } else {
        // Create new child
        const { data, error } = await supabase
          .from('children')
          .insert(childData)
          .select()
          .single()

        if (error) throw error

        if (onChildAdded && data) {
          onChildAdded(data)
        }
      }

      resetForm()
      await loadChildren()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save child')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (child: Child) => {
    setFormData({
      name: child.name,
      age: child.age?.toString() || '',
      school_year: child.school_year || '',
      special_needs: child.special_needs || '',
      subjects_of_interest: child.subjects_of_interest || [],
      learning_style: child.learning_style || '',
      notes: child.notes || ''
    })
    setEditingChild(child)
    setShowForm(true)
  }

  const handleDelete = async (childId: string) => {
    if (!confirm('Are you sure you want to delete this child? This will also delete all related bookings.')) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error
      await loadChildren()
    } catch {
      setError('Failed to delete child')
    } finally {
      setLoading(false)
    }
  }

  if (loading && children.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Children</h2>
          <p className="text-gray-600">Manage your children&apos;s profiles and learning preferences</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </button>
      </div>

      {/* Add/Edit Child Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingChild ? 'Edit Child' : 'Add New Child'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="child-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  id="child-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="child-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  id="child-age"
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* School Year */}
              <div>
                <label htmlFor="school-year" className="block text-sm font-medium text-gray-700 mb-1">
                  School Year
                </label>
                <select
                  id="school-year"
                  value={formData.school_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, school_year: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select school year</option>
                  {schoolYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Learning Style */}
              <div>
                <label htmlFor="learning-style" className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Style
                </label>
                <select
                  id="learning-style"
                  value={formData.learning_style}
                  onChange={(e) => setFormData(prev => ({ ...prev, learning_style: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select learning style</option>
                  {learningStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subjects of Interest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects of Interest
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {commonSubjects.map(subject => (
                  <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.subjects_of_interest.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Needs */}
            <div>
              <label htmlFor="special-needs" className="block text-sm font-medium text-gray-700 mb-1">
                Special Educational Needs
              </label>
              <textarea
                id="special-needs"
                value={formData.special_needs}
                onChange={(e) => setFormData(prev => ({ ...prev, special_needs: e.target.value }))}
                rows={3}
                placeholder="Please describe any special educational needs or accommodations required..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="child-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="child-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Any additional information about your child's learning preferences, interests, or goals..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingChild ? 'Update Child' : 'Add Child'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children List */}
      <div className="space-y-4">
        {children.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No children added yet</p>
            <p className="text-sm text-gray-500">
              Add your children to start booking tutoring sessions
            </p>
          </div>
        ) : (
          children.map((child) => (
            <div key={child.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{child.name}</h3>
                    {child.age && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        Age {child.age}
                      </span>
                    )}
                    {child.school_year && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        {child.school_year}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    {child.learning_style && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Learning Style: {child.learning_style}</span>
                      </div>
                    )}
                    
                    {child.subjects_of_interest && child.subjects_of_interest.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-1">Subjects of Interest:</p>
                        <div className="flex flex-wrap gap-1">
                          {child.subjects_of_interest.map(subject => (
                            <span
                              key={subject}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {child.special_needs && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-1">Special Educational Needs:</p>
                        <p className="text-gray-600">{child.special_needs}</p>
                      </div>
                    )}

                    {child.notes && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-1">Notes:</p>
                        <p className="text-gray-600">{child.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Added {new Date(child.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(child)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit child"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete child"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
