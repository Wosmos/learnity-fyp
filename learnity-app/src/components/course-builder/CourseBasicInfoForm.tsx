'use client';

/**
 * Course Basic Info Form Component
 * Form for course title, description, category, difficulty, thumbnail, and tags
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  Plus,
  DollarSign,
} from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';
import { Category } from './types';

// Form validation schema
const basicInfoSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  isFree: z.boolean(),
  price: z.number().min(0).max(9999.99).optional(),
  requireSequentialProgress: z.boolean(),
  whatsappGroupLink: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactWhatsapp: z.string().optional(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

export function CourseBasicInfoForm() {
  const { courseData, setCourseData } = useCourseBuilder();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>(courseData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    courseData.thumbnailUrl || null
  );
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: courseData.title || '',
      description: courseData.description || '',
      categoryId: courseData.categoryId || '',
      difficulty: courseData.difficulty || 'BEGINNER',
      isFree: courseData.isFree ?? true,
      price: courseData.price,
      requireSequentialProgress: courseData.requireSequentialProgress ?? false,
      whatsappGroupLink: courseData.whatsappGroupLink || '',
      contactEmail: courseData.contactEmail || '',
      contactWhatsapp: courseData.contactWhatsapp || '',
    },
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Set default categories if API fails
        setCategories([
          { id: 'default-1', name: 'Programming', slug: 'programming' },
          { id: 'default-2', name: 'Design', slug: 'design' },
          { id: 'default-3', name: 'Business', slug: 'business' },
          { id: 'default-4', name: 'Marketing', slug: 'marketing' },
          { id: 'default-5', name: 'Science', slug: 'science' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Update context when form values change
  const onFormChange = useCallback((data: Partial<BasicInfoFormData>) => {
    setCourseData(data);
  }, [setCourseData]);

  // Watch form changes and update context
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange(value as Partial<BasicInfoFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && tags.length < 5 && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setCourseData({ tags: newTags });
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setCourseData({ tags: newTags });
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server (implement actual upload logic)
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setCourseData({ thumbnailUrl: url });
      }
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setCourseData({ thumbnailUrl: undefined });
  };

  const isFree = form.watch('isFree');

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Introduction to Web Development" 
                  {...field} 
                  className="max-w-xl"
                />
              </FormControl>
              <FormDescription>
                A clear, descriptive title (3-100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what students will learn in this course..."
                  className="min-h-[120px] max-w-xl"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/2000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-3">
          <Label>Course Thumbnail</Label>
          <div className="flex items-start gap-4">
            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Course thumbnail"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={handleRemoveThumbnail}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                  disabled={isUploadingThumbnail}
                />
                {isUploadingThumbnail ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Upload image</span>
                    <span className="text-xs text-slate-400">Max 2MB</span>
                  </>
                )}
              </label>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Recommended: 1280x720px (16:9 ratio), JPG or PNG
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-3 max-w-xl">
          <Label>Tags (up to 5)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              disabled={tags.length >= 5}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              disabled={tags.length >= 5 || !tagInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-500">
            {5 - tags.length} tags remaining
          </p>
        </div>

        {/* Pricing */}
        <div className="space-y-4 max-w-xl">
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Free Course</FormLabel>
                  <FormDescription>
                    Make this course available for free
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {!isFree && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <div className="relative max-w-[200px]">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        min="0"
                        max="9999.99"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Sequential Progress */}
        <FormField
          control={form.control}
          name="requireSequentialProgress"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4 max-w-xl">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sequential Progress</FormLabel>
                <FormDescription>
                  Require students to complete sections in order
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Communication Settings */}
        <div className="space-y-4 max-w-xl">
          <h3 className="text-lg font-medium">Communication (Optional)</h3>
          
          <FormField
            control={form.control}
            name="whatsappGroupLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Group Link</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://chat.whatsapp.com/..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Link to a WhatsApp group for course discussions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="teacher@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactWhatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact WhatsApp Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+1234567890" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Include country code (e.g., +1 for US)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
