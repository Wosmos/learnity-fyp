'use client';

/**
 * Section Manager Component
 * Add/edit/delete sections with drag-and-drop reordering
 * Requirements: 1.6, 1.9
 */

import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  ChevronDown,
  Layers,
  Video,
  FileQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCourseBuilder } from './CourseBuilderContext';
import { LessonManager } from './LessonManager';
import { SectionFormData } from './types';

export function SectionManager() {
  const {
    sections,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
  } = useCourseBuilder();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    index: number;
    data: SectionFormData;
  } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Handle add section
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;

    addSection({
      title: newSectionTitle.trim(),
      description: newSectionDescription.trim() || undefined,
      lessons: [],
    });

    setNewSectionTitle('');
    setNewSectionDescription('');
    setIsAddDialogOpen(false);
  };

  // Handle edit section
  const handleEditSection = () => {
    if (!editingSection || !editingSection.data.title.trim()) return;

    updateSection(editingSection.index, {
      title: editingSection.data.title.trim(),
      description: editingSection.data.description?.trim() || undefined,
    });

    setEditingSection(null);
  };

  // Handle delete section
  const handleDeleteSection = (index: number) => {
    if (
      confirm(
        'Are you sure you want to delete this section? All lessons will be removed.'
      )
    ) {
      deleteSection(index);
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
      reorderSections(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Count lessons in a section
  const getLessonCount = (section: SectionFormData) => {
    const videoCount = section.lessons.filter(l => l.type === 'VIDEO').length;
    const quizCount = section.lessons.filter(l => l.type === 'QUIZ').length;
    return { videoCount, quizCount, total: section.lessons.length };
  };

  return (
    <div className='space-y-4'>
      {/* Empty state */}
      {sections.length === 0 && (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Layers className='h-12 w-12 text-slate-300 mb-4' />
            <h3 className='text-lg font-medium text-slate-700 mb-2'>
              No sections yet
            </h3>
            <p className='text-sm text-slate-500 mb-4 text-center max-w-sm'>
              Organize your course content into sections. Each section can
              contain multiple video lessons and quizzes.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className='gap-2'>
              <Plus className='h-4 w-4' />
              Add First Section
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sections list */}
      {sections.length > 0 && (
        <Accordion type='multiple' className='space-y-3'>
          {sections.map((section, index) => {
            const { videoCount, quizCount, total } = getLessonCount(section);

            return (
              <AccordionItem
                key={section.id || index}
                value={`section-${index}`}
                className={`border rounded-lg bg-white shadow-sm transition-all ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <AccordionTrigger className='px-4 py-3 hover:no-underline hover:bg-slate-50 rounded-t-lg'>
                  <div className='flex items-center gap-3 flex-1'>
                    <GripVertical className='h-5 w-5 text-slate-400 cursor-grab' />
                    <div className='flex-1 text-left'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>
                          Section {index + 1}:
                        </span>
                        <span className='text-slate-700'>{section.title}</span>
                      </div>
                      <div className='flex items-center gap-3 text-sm text-slate-500 mt-1'>
                        {videoCount > 0 && (
                          <span className='flex items-center gap-1'>
                            <Video className='h-3 w-3' />
                            {videoCount} video{videoCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {quizCount > 0 && (
                          <span className='flex items-center gap-1'>
                            <FileQuestion className='h-3 w-3' />
                            {quizCount} quiz{quizCount !== 1 ? 'zes' : ''}
                          </span>
                        )}
                        {total === 0 && (
                          <span className='text-amber-600'>No lessons yet</span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-1 mr-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={e => {
                          e.stopPropagation();
                          setEditingSection({ index, data: { ...section } });
                        }}
                      >
                        <Edit2 className='h-4 w-4 text-slate-500' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 hover:text-red-600'
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteSection(index);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  {section.description && (
                    <p className='text-sm text-slate-600 mb-4 pl-8'>
                      {section.description}
                    </p>
                  )}
                  <div className='pl-8'>
                    <LessonManager sectionIndex={index} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Add section button */}
      {sections.length > 0 && (
        <Button
          variant='outline'
          onClick={() => setIsAddDialogOpen(true)}
          className='w-full gap-2 border-dashed'
        >
          <Plus className='h-4 w-4' />
          Add Section
        </Button>
      )}

      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section to organize your course content.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Section Title *</label>
              <Input
                placeholder='e.g., Introduction to the Course'
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Description (Optional)
              </label>
              <Textarea
                placeholder='Brief description of what this section covers...'
                value={newSectionDescription}
                onChange={e => setNewSectionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionTitle.trim()}
            >
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog
        open={!!editingSection}
        onOpenChange={() => setEditingSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>Update the section details.</DialogDescription>
          </DialogHeader>
          {editingSection && (
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Section Title *</label>
                <Input
                  value={editingSection.data.title}
                  onChange={e =>
                    setEditingSection({
                      ...editingSection,
                      data: { ...editingSection.data, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Description (Optional)
                </label>
                <Textarea
                  value={editingSection.data.description || ''}
                  onChange={e =>
                    setEditingSection({
                      ...editingSection,
                      data: {
                        ...editingSection.data,
                        description: e.target.value,
                      },
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSection}
              disabled={!editingSection?.data.title.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
