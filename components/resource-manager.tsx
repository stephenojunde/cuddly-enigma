'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { FileText, Video, Link, Download, Plus, Search, Filter, BookOpen, Globe, Lock } from 'lucide-react'

interface Resource {
  id: string
  title: string
  description?: string
  resource_type: string
  subject?: string
  grade_level?: string
  file_url?: string
  external_url?: string
  created_by: string
  is_public: boolean
  created_at: string
}

interface ResourceManagerProps {
  resources: Resource[]
  currentUserId: string
  userType: string
}

const RESOURCE_TYPES = [
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'link', label: 'Link', icon: Link },
  { value: 'worksheet', label: 'Worksheet', icon: BookOpen }
]

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'History', 'Geography', 
  'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music'
]

const GRADE_LEVELS = [
  'Primary (Ages 5-11)', 'Secondary (Ages 11-16)', 'A-Level (Ages 16-18)', 'University', 'Adult Learning'
]

export function ResourceManager({ resources: initialResources, currentUserId, userType }: ResourceManagerProps) {
  const [resources, setResources] = useState(initialResources)
  const [filteredResources, setFilteredResources] = useState(initialResources)
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [showMyResourcesOnly, setShowMyResourcesOnly] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    resource_type: 'document',
    subject: '',
    grade_level: '',
    external_url: '',
    is_public: false
  })

  const applyFilters = () => {
    let filtered = resources

    if (searchTerm) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter) {
      filtered = filtered.filter(resource => resource.resource_type === typeFilter)
    }

    if (subjectFilter) {
      filtered = filtered.filter(resource => resource.subject === subjectFilter)
    }

    if (gradeFilter) {
      filtered = filtered.filter(resource => resource.grade_level === gradeFilter)
    }

    if (showMyResourcesOnly) {
      filtered = filtered.filter(resource => resource.created_by === currentUserId)
    }

    setFilteredResources(filtered)
  }

  const addResource = async () => {
    if (!newResource.title || !newResource.resource_type) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and resource type.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...newResource,
          created_by: currentUserId
        }])
        .select()
        .single()

      if (error) throw error

      setResources([data, ...resources])
      setFilteredResources([data, ...filteredResources])
      setNewResource({
        title: '',
        description: '',
        resource_type: 'document',
        subject: '',
        grade_level: '',
        external_url: '',
        is_public: false
      })
      setIsAddingResource(false)
      
      toast({
        title: "Resource added",
        description: "Your resource has been saved.",
      })
    } catch (error: any) {
      toast({
        title: "Error adding resource",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleResourceVisibility = async (resourceId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_public: isPublic })
        .eq('id', resourceId)
        .eq('created_by', currentUserId) // Only allow updating own resources

      if (error) throw error

      setResources(resources.map(resource => 
        resource.id === resourceId ? { ...resource, is_public: isPublic } : resource
      ))
      setFilteredResources(filteredResources.map(resource => 
        resource.id === resourceId ? { ...resource, is_public: isPublic } : resource
      ))
      
      toast({
        title: "Resource updated",
        description: `Resource is now ${isPublic ? 'public' : 'private'}`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating resource",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getResourceIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.value === type)
    return resourceType ? resourceType.icon : FileText
  }

  const myResources = resources.filter(r => r.created_by === currentUserId)
  const publicResources = resources.filter(r => r.is_public && r.created_by !== currentUserId)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {RESOURCE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {GRADE_LEVELS.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <div className="flex items-center space-x-2">
              <Switch
                id="my-resources"
                checked={showMyResourcesOnly}
                onCheckedChange={(checked) => {
                  setShowMyResourcesOnly(checked)
                  applyFilters()
                }}
              />
              <Label htmlFor="my-resources">My Resources Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Resources ({filteredResources.length})</TabsTrigger>
            <TabsTrigger value="my">My Resources ({myResources.length})</TabsTrigger>
            <TabsTrigger value="public">Public Resources ({publicResources.length})</TabsTrigger>
          </TabsList>
          
          {(userType === 'teacher' || userType === 'school') && (
            <Button onClick={() => setIsAddingResource(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          )}
        </div>

        {/* Add Resource Form */}
        {isAddingResource && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Resource</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newResource.title}
                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                    placeholder="Resource title"
                  />
                </div>
                <div>
                  <Label>Resource Type *</Label>
                  <Select value={newResource.resource_type} onValueChange={(value) => setNewResource({...newResource, resource_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={newResource.subject} onValueChange={(value) => setNewResource({...newResource, subject: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade Level</Label>
                  <Select value={newResource.grade_level} onValueChange={(value) => setNewResource({...newResource, grade_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  placeholder="Describe the resource and how it can be used"
                />
              </div>
              
              <div>
                <Label>External URL (if applicable)</Label>
                <Input
                  value={newResource.external_url}
                  onChange={(e) => setNewResource({...newResource, external_url: e.target.value})}
                  placeholder="https://example.com/resource"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={newResource.is_public}
                  onCheckedChange={(checked) => setNewResource({...newResource, is_public: checked})}
                />
                <Label htmlFor="is-public">Make this resource public</Label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addResource}>Add Resource</Button>
                <Button variant="outline" onClick={() => setIsAddingResource(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const IconComponent = getResourceIcon(resource.resource_type)
              const isOwner = resource.created_by === currentUserId
              
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {resource.is_public ? (
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                            {isOwner && <Badge variant="outline" className="text-xs">Mine</Badge>}
                          </div>
                        </div>
                      </div>
                      {isOwner && (
                        <Switch
                          checked={resource.is_public}
                          onCheckedChange={(checked) => toggleResourceVisibility(resource.id, checked)}
                          size="sm"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {resource.subject && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{resource.subject}</span>
                        </div>
                      )}
                      
                      {resource.grade_level && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.grade_level}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {resource.external_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                              <Link className="h-4 w-4 mr-2" />
                              Open
                            </a>
                          </Button>
                        )}
                        {resource.file_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.file_url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No resources found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search criteria or add some resources.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myResources.map((resource) => {
              const IconComponent = getResourceIcon(resource.resource_type)
              
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <Badge variant={resource.is_public ? "secondary" : "outline"} className="text-xs mt-1">
                            {resource.is_public ? (
                              <>
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <Switch
                        checked={resource.is_public}
                        onCheckedChange={(checked) => toggleResourceVisibility(resource.id, checked)}
                        size="sm"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {resource.subject && (
                        <Badge variant="outline" className="text-xs">
                          {resource.subject}
                        </Badge>
                      )}
                      
                      {resource.grade_level && (
                        <Badge variant="outline" className="text-xs">
                          {resource.grade_level}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {resource.external_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                              <Link className="h-4 w-4 mr-2" />
                              Open
                            </a>
                          </Button>
                        )}
                        {resource.file_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.file_url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicResources.map((resource) => {
              const IconComponent = getResourceIcon(resource.resource_type)
              
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {resource.subject && (
                        <Badge variant="outline" className="text-xs">
                          {resource.subject}
                        </Badge>
                      )}
                      
                      {resource.grade_level && (
                        <Badge variant="outline" className="text-xs">
                          {resource.grade_level}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {resource.external_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                              <Link className="h-4 w-4 mr-2" />
                              Open
                            </a>
                          </Button>
                        )}
                        {resource.file_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.file_url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}