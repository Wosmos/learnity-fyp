'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Trash2,
  Camera,
  Loader2,
  User,
  Plus,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUploadSuccess?: (url: string) => void;
  onDeleteSuccess?: () => void;
}

export function AvatarUpload({
  currentAvatar,
  onUploadSuccess,
  onDeleteSuccess,
}: AvatarUploadProps) {
  const { toast } = useToast();
  const { loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid Format',
        description: 'Use JPEG, PNG, or WebP.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum size is 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (authLoading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await authenticatedFetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setPreview(data.avatarUrl);
      toast({
        title: 'Identity Synced',
        description: 'Visual vector updated.',
      });
      onUploadSuccess?.(data.avatarUrl);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (authLoading || !confirm('Permanently remove this identity visual?'))
      return;
    setDeleting(true);
    try {
      const response = await authenticatedFetch('/api/profile/avatar', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      setPreview(null);
      toast({ title: 'Cleared', description: 'Profile visual reset.' });
      onDeleteSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className='flex flex-col items-center gap-6 p-2'>
        {/* Main Interface Group */}
        <div className='flex items-center gap-6'>
          {/* SQUARED IMAGE AREA */}
          <div className='relative'>
            <div
              className={cn(
                'w-28 h-28 rounded-[28px] overflow-hidden bg-white border-2 border-slate-100 shadow-inner transition-all duration-500 relative ring-4 ring-slate-50/50',
                uploading && 'animate-pulse opacity-70'
              )}
            >
              {preview ? (
                <Image
                  src={preview}
                  alt='Avatar'
                  width={112}
                  height={112}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-slate-50'>
                  <User className='w-8 h-8 text-slate-200' />
                </div>
              )}

              {/* Upload Trigger Overlay */}
              <div
                className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]'
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className='w-5 h-5 animate-spin text-white' />
                ) : (
                  <Camera className='w-5 h-5 text-white' />
                )}
                <span className='text-[8px] font-black uppercase text-white tracking-[0.2em] mt-1'>
                  Sync
                </span>
              </div>
            </div>

            {/* Verification Badge */}
            <div className='absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100'>
              <ShieldCheck className='w-4 h-4 text-indigo-500 fill-indigo-50' />
            </div>
          </div>

          {/* SIDE ACTION BAR */}
          <div className='flex flex-col gap-3 py-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:text-black hover:border-black hover:shadow-sm transition-all'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side='right'
                className='bg-black text-white text-[10px] font-bold uppercase tracking-widest border-none'
              >
                Update Visual
              </TooltipContent>
            </Tooltip>

            {preview && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className='p-3 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-red-500 hover:border-red-100 transition-all'
                  >
                    {deleting ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <Trash2 className='w-4 h-4' />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest border-none'
                >
                  Purge Data
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <div className='p-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-slate-400 cursor-help'>
                  <Info className='w-4 h-4' />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side='right'
                className='max-w-[200px] p-3 space-y-2 bg-white border border-slate-100 shadow-xl text-slate-600'
              >
                <p className='text-[10px] font-bold uppercase tracking-tight text-black'>
                  Upload Protocols:
                </p>
                <ul className='text-[9px] space-y-1 list-disc pl-3 leading-relaxed'>
                  <li>
                    Formats: <span className='font-bold'>JPEG, PNG, WEBP</span>
                  </li>
                  <li>
                    Max Payload: <span className='font-bold'>5.0 MB</span>
                  </li>
                  <li>
                    Ratio: <span className='font-bold'>1:1 Square</span>{' '}
                    recommended
                  </li>
                  <li>Visuals must be academic-appropriate.</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* METADATA FOOTER */}
        <div className='flex flex-col items-center gap-1'>
          <span className='text-[9px] font-black uppercase tracking-[0.3em] text-slate-400'>
            Identity Visualizer
          </span>
          <div className='h-[1px] w-8 bg-slate-200' />
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          onChange={handleFileSelect}
          className='hidden'
        />
      </div>
    </TooltipProvider>
  );
}
