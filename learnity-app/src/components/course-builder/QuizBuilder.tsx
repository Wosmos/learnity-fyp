'use client';

/**
 * Quiz Builder Component
 * Add questions with options, mark correct answer, add explanations
 * Requirements: 6.1, 6.2
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCourseBuilder } from './CourseBuilderContext';
import { QuestionFormData, QuizFormData } from './types';

interface QuizBuilderProps {
  sectionIndex: number;
  lessonIndex: number;
  onClose: () => void;
}

export function QuizBuilder({
  sectionIndex,
  lessonIndex,
  onClose,
}: QuizBuilderProps) {
  const { sections, updateLesson } = useCourseBuilder();
  const lesson = sections[sectionIndex]?.lessons[lessonIndex];

  const [quiz, setQuiz] = useState<QuizFormData>(
    lesson?.quiz || {
      title: lesson?.title || 'Quiz',
      description: '',
      passingScore: 70,
      questions: [],
    }
  );

  const [editingQuestion, setEditingQuestion] = useState<{
    index: number | null;
    data: QuestionFormData;
  } | null>(null);

  // Initialize new question
  const createNewQuestion = (): QuestionFormData => ({
    question: '',
    options: ['', ''],
    correctOptionIndex: 0,
    explanation: '',
    order: quiz.questions.length,
  });

  // Add question
  const handleAddQuestion = () => {
    setEditingQuestion({
      index: null,
      data: createNewQuestion(),
    });
  };

  // Save question
  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    const { index, data } = editingQuestion;

    // Validate question
    if (!data.question.trim()) return;
    if (data.options.filter(o => o.trim()).length < 2) return;

    // Filter out empty options
    const cleanedOptions = data.options.filter(o => o.trim());
    const cleanedData = {
      ...data,
      options: cleanedOptions,
      correctOptionIndex: Math.min(
        data.correctOptionIndex,
        cleanedOptions.length - 1
      ),
    };

    if (index === null) {
      // Add new question
      setQuiz(prev => ({
        ...prev,
        questions: [
          ...prev.questions,
          { ...cleanedData, order: prev.questions.length },
        ],
      }));
    } else {
      // Update existing question
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) =>
          i === index ? cleanedData : q
        ),
      }));
    }

    setEditingQuestion(null);
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions
          .filter((_, i) => i !== index)
          .map((q, i) => ({ ...q, order: i })),
      }));
    }
  };

  // Add option to editing question
  const handleAddOption = () => {
    if (!editingQuestion || editingQuestion.data.options.length >= 4) return;

    setEditingQuestion({
      ...editingQuestion,
      data: {
        ...editingQuestion.data,
        options: [...editingQuestion.data.options, ''],
      },
    });
  };

  // Remove option from editing question
  const handleRemoveOption = (optionIndex: number) => {
    if (!editingQuestion || editingQuestion.data.options.length <= 2) return;

    const newOptions = editingQuestion.data.options.filter(
      (_, i) => i !== optionIndex
    );
    const newCorrectIndex =
      editingQuestion.data.correctOptionIndex >= optionIndex
        ? Math.max(0, editingQuestion.data.correctOptionIndex - 1)
        : editingQuestion.data.correctOptionIndex;

    setEditingQuestion({
      ...editingQuestion,
      data: {
        ...editingQuestion.data,
        options: newOptions,
        correctOptionIndex: Math.min(newCorrectIndex, newOptions.length - 1),
      },
    });
  };

  // Update option text
  const handleOptionChange = (optionIndex: number, value: string) => {
    if (!editingQuestion) return;

    const newOptions = [...editingQuestion.data.options];
    newOptions[optionIndex] = value;

    setEditingQuestion({
      ...editingQuestion,
      data: {
        ...editingQuestion.data,
        options: newOptions,
      },
    });
  };

  // Save quiz to lesson
  const handleSaveQuiz = () => {
    updateLesson(sectionIndex, lessonIndex, { quiz });
    onClose();
  };

  // Reorder questions
  const handleReorderQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...quiz.questions];
    const [removed] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, removed);

    setQuiz(prev => ({
      ...prev,
      questions: newQuestions.map((q, i) => ({ ...q, order: i })),
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Quiz Builder</DialogTitle>
          <DialogDescription>
            Create questions for this quiz. Students need {quiz.passingScore}%
            to pass.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Quiz Settings */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Quiz Title</Label>
              <Input
                value={quiz.title}
                onChange={e =>
                  setQuiz(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Quiz title'
              />
            </div>
            <div className='space-y-2'>
              <Label>Passing Score (%)</Label>
              <Input
                type='number'
                min='1'
                max='100'
                value={quiz.passingScore}
                onChange={e =>
                  setQuiz(prev => ({
                    ...prev,
                    passingScore: Math.min(
                      100,
                      Math.max(1, parseInt(e.target.value) || 70)
                    ),
                  }))
                }
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Description (Optional)</Label>
            <Textarea
              value={quiz.description || ''}
              onChange={e =>
                setQuiz(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder='Brief description of this quiz...'
              rows={2}
            />
          </div>

          {/* Questions List */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Questions ({quiz.questions.length})</Label>
              <Button
                variant='outline'
                size='sm'
                onClick={handleAddQuestion}
                className='gap-2'
              >
                <Plus className='h-4 w-4' />
                Add Question
              </Button>
            </div>

            {quiz.questions.length === 0 ? (
              <div className='text-center py-8 border-2 border-dashed rounded-lg'>
                <HelpCircle className='h-10 w-10 text-slate-300 mx-auto mb-3' />
                <p className='text-sm text-slate-500'>No questions yet</p>
                <p className='text-xs text-slate-400 mt-1'>
                  Add at least one question to create a quiz
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {quiz.questions.map((question, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-3 p-3 bg-slate-50 rounded-lg border'
                  >
                    <GripVertical className='h-5 w-5 text-slate-400 cursor-grab mt-0.5' />
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div>
                          <Badge variant='outline' className='mb-1'>
                            Q{index + 1}
                          </Badge>
                          <p className='text-sm font-medium text-slate-700'>
                            {question.question}
                          </p>
                        </div>
                        <div className='flex items-center gap-1 flex-shrink-0'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0'
                            onClick={() =>
                              setEditingQuestion({
                                index,
                                data: { ...question },
                              })
                            }
                          >
                            <HelpCircle className='h-3.5 w-3.5 text-slate-500' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 hover:text-red-600'
                            onClick={() => handleDeleteQuestion(index)}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>
                      <div className='mt-2 space-y-1'>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 text-xs ${
                              optIndex === question.correctOptionIndex
                                ? 'text-emerald-600 font-medium'
                                : 'text-slate-500'
                            }`}
                          >
                            {optIndex === question.correctOptionIndex ? (
                              <CheckCircle className='h-3 w-3' />
                            ) : (
                              <div className='h-3 w-3 rounded-full border border-slate-300' />
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveQuiz}>Save Quiz</Button>
        </DialogFooter>

        {/* Question Editor Dialog */}
        {editingQuestion && (
          <Dialog open onOpenChange={() => setEditingQuestion(null)}>
            <DialogContent className='max-w-lg'>
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion.index === null
                    ? 'Add Question'
                    : 'Edit Question'}
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                {/* Question Text */}
                <div className='space-y-2'>
                  <Label>Question *</Label>
                  <Textarea
                    value={editingQuestion.data.question}
                    onChange={e =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: {
                          ...editingQuestion.data,
                          question: e.target.value,
                        },
                      })
                    }
                    placeholder='Enter your question...'
                    rows={2}
                  />
                </div>

                {/* Options */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Label>Options (2-4)</Label>
                    {editingQuestion.data.options.length < 4 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleAddOption}
                        className='h-7 text-xs'
                      >
                        <Plus className='h-3 w-3 mr-1' />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <RadioGroup
                    value={editingQuestion.data.correctOptionIndex.toString()}
                    onValueChange={v =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: {
                          ...editingQuestion.data,
                          correctOptionIndex: parseInt(v),
                        },
                      })
                    }
                  >
                    {editingQuestion.data.options.map((option, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                        />
                        <Input
                          value={option}
                          onChange={e =>
                            handleOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className='flex-1'
                        />
                        {editingQuestion.data.options.length > 2 && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 hover:text-red-600'
                            onClick={() => handleRemoveOption(index)}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  <p className='text-xs text-slate-500'>
                    Select the radio button next to the correct answer
                  </p>
                </div>

                {/* Explanation */}
                <div className='space-y-2'>
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    value={editingQuestion.data.explanation || ''}
                    onChange={e =>
                      setEditingQuestion({
                        ...editingQuestion,
                        data: {
                          ...editingQuestion.data,
                          explanation: e.target.value,
                        },
                      })
                    }
                    placeholder='Explain why this is the correct answer...'
                    rows={2}
                  />
                  <p className='text-xs text-slate-500'>
                    Shown to students after they answer
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setEditingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveQuestion}
                  disabled={
                    !editingQuestion.data.question.trim() ||
                    editingQuestion.data.options.filter(o => o.trim()).length <
                      2
                  }
                >
                  {editingQuestion.index === null
                    ? 'Add Question'
                    : 'Save Question'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
