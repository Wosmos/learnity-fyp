'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    id: string;
    name: string;
    hourlyRate: string;
    profilePicture: string | null;
  };
}

export function BookSessionModal({
  isOpen,
  onClose,
  teacher,
}: BookSessionModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();
  const { isAuthenticated, loading: authLoading } = useClientAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '60',
  });

  const hourlyRate = parseFloat(teacher.hourlyRate) || 0;
  const isFree = hourlyRate === 0;
  const sessionCost = (hourlyRate * parseInt(formData.duration)) / 60;

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen && !authLoading && !isAuthenticated) {
      onClose();
      router.push(`/auth/login?redirect=/teachers/${teacher.id}`);
    }
  }, [isOpen, authLoading, isAuthenticated, onClose, router, teacher.id]);

  // Load wallet balance when modal opens
  useEffect(() => {
    if (isOpen && !isFree && walletBalance === null && isAuthenticated) {
      loadWalletBalance();
    }
  }, [isOpen, isFree, walletBalance, isAuthenticated]);

  const loadWalletBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await authenticatedFetch('/api/wallet');
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(Number(data.data?.wallet?.balance || 0));
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Check wallet balance for paid sessions
    if (!isFree && walletBalance !== null && walletBalance < sessionCost) {
      toast({
        title: 'Insufficient Balance',
        description: `You need PKR ${sessionCost.toFixed(2)} but only have PKR ${walletBalance.toFixed(2)}. Please recharge your wallet.`,
        variant: 'destructive',
      });
      router.push('/dashboard/student/wallet');
      return;
    }

    try {
      setIsLoading(true);

      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const response = await authenticatedFetch('/api/tutoring-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher.id,
          title: formData.title,
          description: formData.description,
          scheduledAt: scheduledDateTime.toISOString(),
          duration: parseInt(formData.duration),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Session Request Sent!',
          description: `Your tutoring session request has been sent to ${teacher.name}. You'll be notified when they respond.`,
        });
        onClose();
        router.push('/dashboard/student/sessions');
      } else {
        toast({
          title: 'Request Failed',
          description: data.message || 'Failed to create session request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Book a Tutoring Session
          </DialogTitle>
          <DialogDescription>
            Schedule a one-on-one video session with {teacher.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5 mt-4'>
          {/* Teacher Info */}
          <div className='flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200'>
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold'>
              {teacher.profilePicture ? (
                <img
                  src={teacher.profilePicture}
                  alt={teacher.name}
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                teacher.name.charAt(0)
              )}
            </div>
            <div className='flex-1'>
              <p className='font-semibold text-slate-900'>{teacher.name}</p>
              <p className='text-sm text-slate-600'>
                {isFree ? (
                  <span className='text-green-600 font-medium'>Free Session</span>
                ) : (
                  <span>PKR {hourlyRate}/hour</span>
                )}
              </p>
            </div>
          </div>

          {/* Session Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>
              Session Title <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='title'
              placeholder='e.g., Math Tutoring - Algebra Help'
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              placeholder='What would you like to learn or discuss?'
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='date'>
                Date <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                <Input
                  id='date'
                  type='date'
                  className='pl-10'
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.scheduledDate}
                  onChange={e =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='time'>
                Time <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <Clock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                <Input
                  id='time'
                  type='time'
                  className='pl-10'
                  value={formData.scheduledTime}
                  onChange={e =>
                    setFormData({ ...formData, scheduledTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className='space-y-2'>
            <Label htmlFor='duration'>Session Duration</Label>
            <Select
              value={formData.duration}
              onValueChange={value =>
                setFormData({ ...formData, duration: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='30'>30 minutes</SelectItem>
                <SelectItem value='60'>1 hour</SelectItem>
                <SelectItem value='90'>1.5 hours</SelectItem>
                <SelectItem value='120'>2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost Summary */}
          {!isFree && (
            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-slate-700'>
                  Session Cost:
                </span>
                <span className='text-lg font-bold text-slate-900'>
                  PKR {sessionCost.toFixed(2)}
                </span>
              </div>

              {loadingBalance ? (
                <div className='text-sm text-slate-600'>
                  Loading wallet balance...
                </div>
              ) : walletBalance !== null ? (
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-slate-600 flex items-center gap-1'>
                    <Wallet className='h-4 w-4' />
                    Your Balance:
                  </span>
                  <span
                    className={`font-semibold ${
                      walletBalance >= sessionCost
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    PKR {walletBalance.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {walletBalance !== null && walletBalance < sessionCost && (
                <div className='flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                  <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
                  <p>
                    Insufficient balance. Please recharge your wallet before
                    booking.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='flex-1'
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-indigo-600 hover:bg-indigo-700'
              disabled={
                isLoading ||
                (!isFree && walletBalance !== null && walletBalance < sessionCost)
              }
            >
              {isLoading ? 'Sending Request...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
