'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupChatModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGroupChatModal({
  open,
  onClose,
  onSuccess,
}: CreateGroupChatModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open]);

  const loadStudents = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/teacher/enrolled-students', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const token = await user?.getIdToken();

      const response = await fetch('/api/teacher/group-chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          studentIds: selectedStudents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Group chat created successfully',
        });
        onSuccess();
        onClose();
        // Reset form
        setFormData({ name: '', description: '' });
        setSelectedStudents([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create group chat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
              <Users className='h-5 w-5 text-indigo-600' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Create Group Chat</h2>
              <p className='text-sm text-slate-500'>
                Start a conversation with your students
              </p>
            </div>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-5 w-5' />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Group Name *</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder='e.g., Math Study Group'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='What is this group for?'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label>Select Students *</Label>
            <div className='border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2'>
              {students.length === 0 ? (
                <p className='text-sm text-slate-500 text-center py-4'>
                  No enrolled students found
                </p>
              ) : (
                students.map((student) => (
                  <label
                    key={student.id}
                    className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className='h-4 w-4 text-indigo-600 rounded'
                    />
                    <div className='flex-1'>
                      <div className='font-medium'>
                        {student.firstName} {student.lastName}
                      </div>
                      <div className='text-sm text-slate-500'>
                        {student.email}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className='text-sm text-slate-500'>
              {selectedStudents.length} student(s) selected
            </p>
          </div>

          {/* Footer */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Group Chat'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
