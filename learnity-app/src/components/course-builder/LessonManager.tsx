'use client';

/**
 * Lesson Manager Component
 * Add video lessons with YouTube URL input, auto-fetch metadata, add quiz lessons
 * Requirements: 1.7, 1.8, 1.9
 */

import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Video,
  FileQuestion,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateAndFetchYouTubeUrl } from '@/lib/utils/youtube';
import { useCourseBuilder } from './CourseBuilderContext';
import { QuizBuilder } from './QuizBuilder';
import { LessonFormData, YouTubeMetadata } from './types';

interface LessonManagerProps {
  sectionIndex: number;
}

export function LessonManager({ sectionIndex }: LessonManagerProps) {
  const {
    sections,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    courseData,
    setCourseData,
  } = useCourseBuilder();

  const section = sections[sectionIndex];
  const lessons = section?.lessons || [];

  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{
    index: number;
    data: LessonFormData;
  } | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form state
  const [lessonType, setLessonType] = useState<'VIDEO' | 'QUIZ'>('VIDEO');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [youtubeMetadata, setYoutubeMetadata] =
    useState<YouTubeMetadata | null>(null);

  // Reset form
  const resetForm = () => {
    setLessonType('VIDEO');
    setLessonTitle('');
    setLessonDescription('');
    setYoutubeUrl('');
    setYoutubeMetadata(null);
    setUrlError(null);
  };

  // Handle YouTube URL change
  const handleUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    setUrlError(null);
    setYoutubeMetadata(null);

    if (!url.trim()) return;

    setIsValidatingUrl(true);
    try {
      const result = await validateAndFetchYouTubeUrl(url);

      if (result.isValid && result.metadata) {
        setYoutubeMetadata(result.metadata);

        // Auto-fill title if empty
        if (!lessonTitle) {
          setLessonTitle(result.metadata.title);
        }
      } else {
        setUrlError(result.error || 'Invalid YouTube URL');
      }
    } catch (error) {
      setUrlError('Failed to validate URL');
      console.error(error);
    } finally {
      setIsValidatingUrl(false);
    }
  };

  // Handle add lesson
  const handleAddLesson = () => {
    if (!lessonTitle.trim()) return;
    if (lessonType === 'VIDEO' && !youtubeMetadata) return;

    const newLesson = {
      title: lessonTitle.trim(),
      description: lessonDescription.trim() || undefined,
      type: lessonType,
      youtubeUrl: lessonType === 'VIDEO' ? youtubeUrl : undefined,
      youtubeId: lessonType === 'VIDEO' ? youtubeMetadata?.videoId : undefined,
      duration: lessonType === 'VIDEO' ? youtubeMetadata?.duration || 0 : 0,
    };

    addLesson(sectionIndex, newLesson);

    // Auto-set course thumbnail if missing
    if (
      lessonType === 'VIDEO' &&
      youtubeMetadata?.videoId &&
      !courseData.thumbnailUrl
    ) {
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeMetadata.videoId}/maxresdefault.jpg`;
      setCourseData({ thumbnailUrl });
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  // Handle edit lesson
  const handleEditLesson = () => {
    if (!editingLesson || !editingLesson.data.title.trim()) return;

    updateLesson(sectionIndex, editingLesson.index, {
      title: editingLesson.data.title.trim(),
      description: editingLesson.data.description?.trim() || undefined,
    });

    setEditingLesson(null);
  };

  // Handle delete lesson
  const handleDeleteLesson = (index: number) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      deleteLesson(sectionIndex, index);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderLessons(sectionIndex, draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='space-y-3'>
      {/* Lessons list */}
      {lessons.length > 0 && (
        <div className='space-y-2'>
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id || index}
              className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg border transition-all ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className='h-4 w-4 text-slate-400 cursor-grab flex-shrink-0' />

              <div className='flex items-center gap-2 flex-shrink-0'>
                {lesson.type === 'VIDEO' ? (
                  <div className='p-1.5 bg-slate-100 rounded'>
                    <Video className='h-4 w-4 text-blue-600' />
                  </div>
                ) : (
                  <div className='p-1.5 bg-purple-100 rounded'>
                    <FileQuestion className='h-4 w-4 text-purple-600' />
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-0.5 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-slate-700 truncate'>
                    {lesson.title}
                  </span>
                  <Badge variant='outline' className='text-xs'>
                    {lesson.type === 'VIDEO' ? 'Video' : 'Quiz'}
                  </Badge>
                </div>
                {lesson.type === 'VIDEO' && lesson.youtubeUrl && (
                  <a
                    href={lesson.youtubeUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-blue-600 hover:underline truncate block'
                  >
                    {lesson.youtubeUrl}
                  </a>
                )}
                {lesson.type === 'VIDEO' && lesson.duration > 0 && (
                  <div className='flex items-center gap-1 text-xs text-slate-500'>
                    <Clock className='h-3 w-3' />
                    {formatDuration(lesson.duration)}
                  </div>
                )}
              </div>

              <div className='flex items-center gap-1 flex-shrink-0'>
                {lesson.type === 'QUIZ' && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    onClick={() => setShowQuizBuilder(index)}
                  >
                    Edit Quiz
                  </Button>
                )}
                {lesson.type === 'VIDEO' && lesson.youtubeUrl && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0'
                    onClick={() => window.open(lesson.youtubeUrl, '_blank')}
                  >
                    <ExternalLink className='h-3.5 w-3.5 text-slate-500' />
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 w-7 p-0'
                  onClick={() =>
                    setEditingLesson({ index, data: { ...lesson } })
                  }
                >
                  <Edit2 className='h-3.5 w-3.5 text-slate-500' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 w-7 p-0 hover:text-red-600'
                  onClick={() => handleDeleteLesson(index)}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {lessons.length === 0 && (
        <div className='text-center py-6 text-sm text-slate-500'>
          No lessons in this section yet
        </div>
      )}

      {/* Add lesson button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsAddDialogOpen(true)}
        className='w-full gap-2 border-dashed'
      >
        <Plus className='h-4 w-4' />
        Add Lesson
      </Button>

      {/* Add Lesson Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={open => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Add a video lesson or quiz to this section.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {/* Lesson Type */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Lesson Type</label>
              <Select
                value={lessonType}
                onValueChange={v => setLessonType(v as 'VIDEO' | 'QUIZ')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='VIDEO'>
                    <div className='flex items-center gap-2'>
                      <Video className='h-4 w-4' />
                      Video Lesson
                    </div>
                  </SelectItem>
                  <SelectItem value='QUIZ'>
                    <div className='flex items-center gap-2'>
                      <FileQuestion className='h-4 w-4' />
                      Quiz
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* YouTube URL (for video lessons) */}
            {lessonType === 'VIDEO' && (
              <div className='space-y-2'>
                <label className='text-sm font-medium'>YouTube URL *</label>
                <div className='relative'>
                  <Input
                    placeholder='https://www.youtube.com/watch?v=...'
                    value={youtubeUrl}
                    onChange={e => handleUrlChange(e.target.value)}
                  />
                  {isValidatingUrl && (
                    <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400' />
                  )}
                </div>
                {urlError && <p className='text-sm text-red-500'>{urlError}</p>}
                {youtubeMetadata && (
                  <div className='p-3 bg-slate-50 rounded-lg border'>
                    <p className='text-sm font-medium text-slate-700'>
                      {youtubeMetadata.title}
                    </p>
                    <p className='text-xs text-slate-500 mt-1'>
                      Duration: {formatDuration(youtubeMetadata.duration)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Lesson Title */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Lesson Title *</label>
              <Input
                placeholder='e.g., Introduction to Variables'
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Description (Optional)
              </label>
              <Textarea
                placeholder='Brief description of this lesson...'
                value={lessonDescription}
                onChange={e => setLessonDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLesson}
              disabled={
                !lessonTitle.trim() ||
                (lessonType === 'VIDEO' && !youtubeMetadata)
              }
            >
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={!!editingLesson}
        onOpenChange={() => setEditingLesson(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update the lesson details.</DialogDescription>
          </DialogHeader>
          {editingLesson && (
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Lesson Title *</label>
                <Input
                  value={editingLesson.data.title}
                  onChange={e =>
                    setEditingLesson({
                      ...editingLesson,
                      data: { ...editingLesson.data, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Description (Optional)
                </label>
                <Textarea
                  value={editingLesson.data.description || ''}
                  onChange={e =>
                    setEditingLesson({
                      ...editingLesson,
                      data: {
                        ...editingLesson.data,
                        description: e.target.value,
                      },
                    })
                  }
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingLesson(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditLesson}
              disabled={!editingLesson?.data.title.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Builder Dialog */}
      {showQuizBuilder !== null && (
        <QuizBuilder
          sectionIndex={sectionIndex}
          lessonIndex={showQuizBuilder}
          onClose={() => setShowQuizBuilder(null)}
        />
      )}
    </div>
  );
}
