'use client';

/**
 * Teacher Content Management Page
 * Upload, manage, and organize teaching materials and resources
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Plus,
  ArrowLeft,
  Video,
  Image,
  File,
  BookOpen,
  Star,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image' | 'presentation';
  subject: string;
  uploadDate: string;
  fileSize: string;
  downloads: number;
  rating: number;
  status: 'published' | 'draft' | 'review';
}

export default function TeacherContentPage() {
  const [content] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Advanced Calculus - Derivatives',
      description: 'Comprehensive guide to derivatives with examples and practice problems',
      type: 'document',
      subject: 'Mathematics',
      uploadDate: '2024-01-10',
      fileSize: '2.4 MB',
      downloads: 45,
      rating: 4.8,
      status: 'published'
    },
    {
      id: '2',
      title: 'Physics Lab - Pendulum Motion',
      description: 'Video demonstration of pendulum motion experiments',
      type: 'video',
      subject: 'Physics',
      uploadDate: '2024-01-08',
      fileSize: '125 MB',
      downloads: 32,
      rating: 4.9,
      status: 'published'
    },
    {
      id: '3',
      title: 'Chemistry Formulas Cheat Sheet',
      description: 'Quick reference for common chemistry formulas and equations',
      type: 'image',
      subject: 'Chemistry',
      uploadDate: '2024-01-05',
      fileSize: '1.8 MB',
      downloads: 67,
      rating: 4.7,
      status: 'published'
    },
    {
      id: '4',
      title: 'Organic Chemistry Presentation',
      description: 'Interactive presentation on organic chemistry fundamentals',
      type: 'presentation',
      subject: 'Chemistry',
      uploadDate: '2024-01-12',
      fileSize: '15.2 MB',
      downloads: 23,
      rating: 4.6,
      status: 'draft'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video': return <Video className="h-5 w-5 text-red-500" />;
      case 'image': return <Image className="h-5 w-5 text-green-500" />;
      case 'presentation': return <BookOpen className="h-5 w-5 text-purple-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/teacher">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-sm text-gray-500">Upload and manage your teaching materials</p>
              </div>
            </div>
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{content.length}</p>
                  <p className="text-xs text-gray-500">Total Content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Download className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {content.reduce((sum, item) => sum + item.downloads, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {(content.reduce((sum, item) => sum + item.rating, 0) / content.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Upload className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{content.filter(c => c.status === 'published').length}</p>
                  <p className="text-xs text-gray-500">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search content by title or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('document')}
                >
                  Documents
                </Button>
                <Button
                  variant={filterType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('video')}
                >
                  Videos
                </Button>
                <Button
                  variant={filterType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('image')}
                >
                  Images
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {item.subject}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="font-medium">{item.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Downloads</p>
                    <p className="font-medium">{item.downloads}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rating</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{item.rating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Uploaded</p>
                    <p className="font-medium">{new Date(item.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredContent.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first teaching material to get started'
                }
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Upload New Content</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                    ✕
                  </Button>
                </div>
                <CardDescription>
                  Add new teaching materials and resources for your students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="Enter content title..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Describe your content..." rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="e.g., Mathematics" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content Type</label>
                    <Input placeholder="e.g., Lesson Plan" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">File Upload</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: PDF, DOC, PPT, MP4, JPG, PNG (Max 100MB)
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}