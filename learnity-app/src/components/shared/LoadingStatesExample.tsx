/**
 * Loading States Example Component
 * Demonstrates all loading state patterns for reference
 * This is a reference implementation - not used in production
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { AsyncButton } from '@/components/ui/async-button';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, Send, Download } from 'lucide-react';

export function LoadingStatesExample() {
  const { toast } = useToast();
  const [manualLoading, setManualLoading] = useState(false);

  // Pattern 1: Manual loading state management
  const handleManualClick = async () => {
    setManualLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: 'Success!', description: 'Manual loading completed' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setManualLoading(false);
    }
  };

  // Pattern 2: Using useAsyncAction hook
  const { execute: handleWithHook, isLoading: hookLoading } = useAsyncAction(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    {
      successMessage: 'Hook action completed!',
      errorMessage: 'Hook action failed',
    }
  );

  // Pattern 3: AsyncButton with automatic loading
  const handleAsyncButtonClick = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({ title: 'Success!', description: 'AsyncButton completed' });
  };

  // Pattern 4: Multiple async actions
  const [action, setAction] = useState<'save' | 'delete' | 'send' | null>(null);

  const handleMultipleActions = async (actionType: 'save' | 'delete' | 'send') => {
    setAction(actionType);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Success!',
        description: `${actionType} completed`
      });
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Loading States Examples</h1>
        <p className="text-gray-600">Reference implementations for all loading state patterns</p>
      </div>

      {/* Pattern 1: Manual Loading State */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 1: Manual Loading State</CardTitle>
          <CardDescription>
            Traditional approach with useState and manual state management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              {`const [loading, setLoading] = useState(false);
const handleClick = async () => {
  setLoading(true);
  try {
    await doSomething();
  } finally {
    setLoading(false);
  }
};`}
            </code>
          </div>
          <Button
            onClick={handleManualClick}
            disabled={manualLoading}
          >
            {manualLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Click Me (Manual)'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pattern 2: LoadingButton Component */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 2: LoadingButton Component</CardTitle>
          <CardDescription>
            Simplified button with built-in loading state display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              {`<LoadingButton
  onClick={handleClick}
  isLoading={loading}
  loadingText="Processing..."
>
  Submit
</LoadingButton>`}
            </code>
          </div>
          <LoadingButton
            onClick={handleManualClick}
            isLoading={manualLoading}
            loadingText="Processing..."
          >
            Click Me (LoadingButton)
          </LoadingButton>
        </CardContent>
      </Card>

      {/* Pattern 3: useAsyncAction Hook */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 3: useAsyncAction Hook</CardTitle>
          <CardDescription>
            Hook-based approach with automatic error handling and toasts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              {`const { execute, isLoading } = useAsyncAction(
  async () => { await doSomething(); },
  { successMessage: 'Done!' }
);`}
            </code>
          </div>
          <LoadingButton
            onClick={handleWithHook}
            isLoading={hookLoading}
            loadingText="Working..."
          >
            Click Me (useAsyncAction)
          </LoadingButton>
        </CardContent>
      </Card>

      {/* Pattern 4: AsyncButton Component */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 4: AsyncButton Component</CardTitle>
          <CardDescription>
            Button with automatic async handling - no manual state needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              {`<AsyncButton
  onClick={async () => {
    await doSomething();
  }}
  loadingText="Saving..."
>
  Save
</AsyncButton>`}
            </code>
          </div>
          <AsyncButton
            onClick={handleAsyncButtonClick}
            loadingText="Saving..."
          >
            Click Me (AsyncButton)
          </AsyncButton>
        </CardContent>
      </Card>

      {/* Pattern 5: Multiple Async Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 5: Multiple Async Actions</CardTitle>
          <CardDescription>
            Managing multiple buttons with different loading states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              {`const [action, setAction] = useState<'save' | 'delete' | null>(null);
// Each button checks if it's the active action
disabled={!!action} // Disable all during any action
isLoading={action === 'save'} // Show loading for specific action`}
            </code>
          </div>
          <div className="flex gap-2 flex-wrap">
            <LoadingButton
              onClick={() => handleMultipleActions('save')}
              isLoading={action === 'save'}
              disabled={!!action}
              loadingText="Saving..."
              variant="default"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </LoadingButton>
            <LoadingButton
              onClick={() => handleMultipleActions('delete')}
              isLoading={action === 'delete'}
              disabled={!!action}
              loadingText="Deleting..."
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </LoadingButton>
            <LoadingButton
              onClick={() => handleMultipleActions('send')}
              isLoading={action === 'send'}
              disabled={!!action}
              loadingText="Sending..."
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Pattern 6: Different Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 6: Different Button Variants</CardTitle>
          <CardDescription>
            Loading states work with all button variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              variant="default"
            >
              Default
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              variant="destructive"
            >
              Destructive
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              variant="outline"
            >
              Outline
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              variant="secondary"
            >
              Secondary
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              variant="ghost"
            >
              Ghost
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              variant="link"
            >
              Link
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Pattern 7: Different Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern 7: Different Button Sizes</CardTitle>
          <CardDescription>
            Loading states adapt to button sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center flex-wrap">
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              size="sm"
            >
              Small
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              size="default"
            >
              Default
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              size="lg"
            >
              Large
            </LoadingButton>
            <LoadingButton
              onClick={handleManualClick}
              isLoading={manualLoading}
              size="icon"
            >
              <Download className="h-4 w-4" />
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-blue-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-blue-900">✨ Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900">
          <div>✅ Always show loading state for async operations</div>
          <div>✅ Disable buttons during loading to prevent double-clicks</div>
          <div>✅ Use descriptive loading text (e.g., "Saving..." not "Loading...")</div>
          <div>✅ Show success/error feedback after completion</div>
          <div>✅ For multiple actions, disable all buttons during any action</div>
          <div>✅ Use LoadingButton for simple cases, AsyncButton for automatic handling</div>
          <div>✅ Use useAsyncAction when you need error handling and toasts</div>
          <div>❌ Never leave users wondering if their action was registered</div>
        </CardContent>
      </Card>
    </div>
  );
}
