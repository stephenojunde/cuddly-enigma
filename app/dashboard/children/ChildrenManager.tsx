'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, User as UserIcon, Calendar, BookOpen, Award, AlertCircle } from 'lucide-react'

interface Child {
  id: string
  parent_id: string
  name: string
  date_of_birth: string | null
  school_year: string | null
  special_needs: string | null
  subjects_of_interest: string[]
  current_level: Record<string, string>
  target_level: Record<string, string>
  notes: string | null
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  email: string
  full_name?: string
  user_type?: string
}

const SCHOOL_YEARS = [
  'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
  'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'
]

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Music', 
  'Physical Education', 'Computing', 'Religious Education', 'French', 'Spanish', 
  'German', 'Drama', 'Design Technology', 'Psychology', 'Sociology', 'Economics',
  'Business Studies', 'Chemistry', 'Physics', 'Biology'
]

const ACADEMIC_LEVELS = [
  'Working Towards', 'Expected', 'Greater Depth', 'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'A*', 'A', 'B', 'C', 'D', 'E'
]

export default function ChildrenManager({ user, initialChildren }: { user: User; profile: Profile | null; initialChildren: Child[] }) {
  const [children, setChildren] = useState<Child[]>(initialChildren)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state for adding/editing children
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    school_year: '',
    special_needs: '',
    subjects_of_interest: [] as string[],
    current_level: {} as Record<string, string>,
    target_level: {} as Record<string, string>,
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      date_of_birth: '',
      school_year: '',
      special_needs: '',
      subjects_of_interest: [],
      current_level: {},
      target_level: {},
      notes: '',
    })
    setSelectedChild(null)
  }

  const openEditDialog = (child: Child) => {
    setSelectedChild(child)
    setFormData({
      name: child.name,
      date_of_birth: child.date_of_birth || '',
      school_year: child.school_year || '',
      special_needs: child.special_needs || '',
      subjects_of_interest: child.subjects_of_interest || [],
      current_level: child.current_level || {},
      target_level: child.target_level || {},
      notes: child.notes || '',
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = formData.subjects_of_interest.includes(subject)
      ? formData.subjects_of_interest.filter(s => s !== subject)
      : [...formData.subjects_of_interest, subject]
    
    setFormData(prev => ({ ...prev, subjects_of_interest: newSubjects }))
  }

  const handleLevelChange = (subject: string, level: string, type: 'current' | 'target') => {
    setFormData(prev => ({
      ...prev,
      [type === 'current' ? 'current_level' : 'target_level']: {
        ...prev[type === 'current' ? 'current_level' : 'target_level'],
        [subject]: level
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const childData = {
        parent_id: user.id,
        name: formData.name,
        date_of_birth: formData.date_of_birth || null,
        school_year: formData.school_year || null,
        special_needs: formData.special_needs || null,
        subjects_of_interest: formData.subjects_of_interest,
        current_level: formData.current_level,
        target_level: formData.target_level,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      }

      if (selectedChild) {
        // Update existing child
        const { data, error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', selectedChild.id)
          .select()
          .single()

        if (error) throw error

        setChildren(prev => prev.map(child => 
          child.id === selectedChild.id ? { ...child, ...data } : child
        ))

        toast({
          title: "Child updated successfully",
          description: `${formData.name}'s profile has been updated.`,
        })
      } else {
        // Create new child
        const { data, error } = await supabase
          .from('children')
          .insert([{ ...childData, created_at: new Date().toISOString() }])
          .select()
          .single()

        if (error) throw error

        setChildren(prev => [data, ...prev])

        toast({
          title: "Child added successfully",
          description: `${formData.name} has been added to your children.`,
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving child:', error)
      toast({
        title: "Error",
        description: "Failed to save child information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (childId: string, childName: string) => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error

      setChildren(prev => prev.filter(child => child.id !== childId))

      toast({
        title: "Child removed",
        description: `${childName} has been removed from your children.`,
      })
    } catch (error) {
      console.error('Error deleting child:', error)
      toast({
        title: "Error",
        description: "Failed to remove child. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="space-y-6">
      {/* Add Child Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Children ({children.length})</h2>
          <p className="text-sm text-gray-500">Manage profiles and track academic progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-[#8A2BE1] hover:bg-[#7B27D1]">
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedChild ? 'Edit Child Profile' : 'Add New Child'}
              </DialogTitle>
              <DialogDescription>
                {selectedChild 
                  ? 'Update your child\'s information and academic details'
                  : 'Add a new child to track their academic progress'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter child's full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="school_year">School Year</Label>
                  <Select value={formData.school_year} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, school_year: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school year" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_YEARS.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="special_needs">Special Educational Needs</Label>
                  <Input
                    id="special_needs"
                    value={formData.special_needs}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_needs: e.target.value }))}
                    placeholder="e.g., Dyslexia, ADHD (optional)"
                  />
                </div>
              </div>

              {/* Subjects of Interest */}
              <div>
                <Label>Subjects of Interest</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {SUBJECTS.map(subject => (
                    <div
                      key={subject}
                      onClick={() => handleSubjectToggle(subject)}
                      className={`p-2 rounded-md border cursor-pointer text-center text-sm transition-colors ${
                        formData.subjects_of_interest.includes(subject)
                          ? 'bg-[#8A2BE1] text-white border-[#8A2BE1]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#8A2BE1]'
                      }`}
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Levels (only show if subjects selected) */}
              {formData.subjects_of_interest.length > 0 && (
                <div>
                  <Label>Academic Levels</Label>
                  <div className="space-y-3 mt-2">
                    {formData.subjects_of_interest.map(subject => (
                      <div key={subject} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg">
                        <div className="font-medium">{subject}</div>
                        <div>
                          <Label className="text-xs">Current Level</Label>
                          <Select 
                            value={formData.current_level[subject] || ''} 
                            onValueChange={(value) => handleLevelChange(subject, value, 'current')}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Current" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACADEMIC_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Target Level</Label>
                          <Select 
                            value={formData.target_level[subject] || ''} 
                            onValueChange={(value) => handleLevelChange(subject, value, 'target')}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Target" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACADEMIC_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about your child..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : selectedChild ? 'Update Child' : 'Add Child'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Children List */}
      {children.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first child to track their academic progress</p>
            <Button onClick={openAddDialog} className="bg-[#8A2BE1] hover:bg-[#7B27D1]">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-[#8A2BE1]" />
                      {child.name}
                    </CardTitle>
                    <CardDescription>
                      {child.school_year && (
                        <span className="flex items-center gap-1 mt-1">
                          <BookOpen className="h-4 w-4" />
                          {child.school_year}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(child)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {child.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {child.name} from your children. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(child.id, child.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove Child
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {child.date_of_birth && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Age {calculateAge(child.date_of_birth)}
                  </div>
                )}

                {child.special_needs && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-700">{child.special_needs}</span>
                  </div>
                )}

                {child.subjects_of_interest && child.subjects_of_interest.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Subjects</div>
                    <div className="flex flex-wrap gap-1">
                      {child.subjects_of_interest.slice(0, 3).map(subject => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {child.subjects_of_interest.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{child.subjects_of_interest.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {Object.keys(child.current_level).length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Progress
                    </div>
                    <div className="space-y-1">
                      {Object.entries(child.current_level).slice(0, 2).map(([subject, level]) => (
                        <div key={subject} className="flex justify-between text-xs">
                          <span className="text-gray-600">{subject}</span>
                          <span className="font-medium">{level}</span>
                        </div>
                      ))}
                      {Object.keys(child.current_level).length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{Object.keys(child.current_level).length - 2} more subjects
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
