'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ScheduleSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleSessionModal({
  open,
  onClose,
  onSuccess,
}: ScheduleSessionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sessionType: 'CLASS',
    scheduledAt: '',
    duration: 60,
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

      const response = await fetch('/api/teacher/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          studentIds: selectedStudents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Session scheduled successfully',
        });
        onSuccess();
        onClose();
        setFormData({
          title: '',
          description: '',
          sessionType: 'CLASS',
          scheduledAt: '',
          duration: 60,
        });
        setSelectedStudents([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule session',
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
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center'>
              <Calendar className='h-5 w-5 text-purple-600' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Schedule Session</h2>
              <p className='text-sm text-slate-500'>
                Create a video session with students
              </p>
            </div>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-5 w-5' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Session Title *</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder='e.g., Algebra Review Session'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='What will you cover in this session?'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='sessionType'>Session Type *</Label>
              <select
                id='sessionType'
                value={formData.sessionType}
                onChange={(e) =>
                  setFormData({ ...formData, sessionType: e.target.value })
                }
                className='w-full px-3 py-2 border rounded-md'
                required
              >
                <option value='CLASS'>Class</option>
                <option value='ONE_ON_ONE'>One-on-One</option>
                <option value='GROUP_MEETING'>Group Meeting</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='duration'>Duration (minutes) *</Label>
              <Input
                id='duration'
                type='number'
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                min={15}
                max={480}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='scheduledAt'>Date & Time *</Label>
            <Input
              id='scheduledAt'
              type='datetime-local'
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData({ ...formData, scheduledAt: e.target.value })
              }
              required
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
                      className='h-4 w-4 text-purple-600 rounded'
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

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Scheduling...
                </>
              ) : (
                'Schedule Session'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
