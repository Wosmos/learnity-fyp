'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Target,
  Heart,
  TrendingUp,
  MessageSquare,
  Lock,
  Globe,
  Users,
  Info,
} from 'lucide-react';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  showEmail: boolean;
  showLearningGoals: boolean;
  showInterests: boolean;
  showProgress: boolean;
  allowMessages: boolean;
}

export function PrivacySettingsForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showLearningGoals: true,
    showInterests: true,
    showProgress: true,
    allowMessages: true,
  });

  const fetchPrivacySettings = useCallback(async () => {
    if (authLoading) return;
    try {
      const data = await api.get('/api/profile/privacy');
      if (data.settings) setSettings(data.settings);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, [api, authLoading]);

  useEffect(() => {
    if (!authLoading) fetchPrivacySettings();
  }, [fetchPrivacySettings, authLoading]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile/privacy', settings);
      toast({
        title: 'System Updated',
        description: 'Privacy protocols successfully applied.',
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Override Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-full mx-auto p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500'>
      {/* Header with Diagnostic Feel */}
      <div className='flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-8 gap-4'>
        <div className='space-y-2'>
          <div className='inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 mb-2'>
            <Lock className='w-3 h-3 text-indigo-600' />
            <span className='text-[10px] font-bold text-indigo-700 uppercase tracking-widest'>
              Secure Configuration
            </span>
          </div>
          <h2 className='text-3xl font-black text-slate-900 tracking-tight uppercase italic'>
            Privacy <span className='text-slate-300'>Hub</span>
          </h2>
          <p className='text-sm text-slate-500 max-w-md leading-relaxed'>
            Configure your digital presence. Higher visibility increases
            collaboration, while private modes prioritize focus.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
        {/* LEFT: MASTER VISIBILITY */}
        <div className='lg:col-span-4 space-y-6'>
          <SectionLabel icon={Eye} label='Global Scope' />
          <div className='bg-slate-50/80 rounded-[24px] p-6 border border-slate-100 shadow-inner'>
            <label className='text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 block px-1'>
              Active Status
            </label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(v: any) =>
                setSettings({ ...settings, profileVisibility: v })
              }
            >
              <SelectTrigger className='w-full bg-white border-slate-200 h-14 rounded-xl shadow-sm text-slate-700 font-bold focus:ring-indigo-500/20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='rounded-xl border-slate-100 shadow-2xl'>
                <SelectItem value='PUBLIC' className='py-3 focus:bg-indigo-50'>
                  <span className='flex items-center gap-2 font-bold'>
                    <Globe className='w-4 h-4 text-emerald-500' /> Open
                    Broadcast
                  </span>
                </SelectItem>
                <SelectItem value='FRIENDS' className='py-3 focus:bg-indigo-50'>
                  <span className='flex items-center gap-2 font-bold'>
                    <Users className='w-4 h-4 text-blue-500' /> Circle Only
                  </span>
                </SelectItem>
                <SelectItem value='PRIVATE' className='py-3 focus:bg-indigo-50'>
                  <span className='flex items-center gap-2 font-bold'>
                    <Lock className='w-4 h-4 text-slate-400' /> Stealth Mode
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className='mt-6 p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-all duration-300'>
              <VisibilityHelper status={settings.profileVisibility} />
            </div>
          </div>
        </div>

        {/* RIGHT: GRANULAR DATA TOGGLES */}
        <div className='lg:col-span-8 space-y-6'>
          <SectionLabel icon={Target} label='Data Telemetry' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <SettingsToggle
              icon={<Mail />}
              title='Contact Email'
              desc='Node-to-node visibility'
              isOn={settings.showEmail}
              onToggle={() =>
                setSettings({ ...settings, showEmail: !settings.showEmail })
              }
            />
            <SettingsToggle
              icon={<MessageSquare />}
              title='Direct Comms'
              desc='Allow handshake requests'
              isOn={settings.allowMessages}
              onToggle={() =>
                setSettings({
                  ...settings,
                  allowMessages: !settings.allowMessages,
                })
              }
            />
            <SettingsToggle
              icon={<TrendingUp />}
              title='Progress Log'
              desc='Broadcast academic growth'
              isOn={settings.showProgress}
              onToggle={() =>
                setSettings({
                  ...settings,
                  showProgress: !settings.showProgress,
                })
              }
            />
            <SettingsToggle
              icon={<Target />}
              title='Objectives'
              desc='Display active goals'
              isOn={settings.showLearningGoals}
              onToggle={() =>
                setSettings({
                  ...settings,
                  showLearningGoals: !settings.showLearningGoals,
                })
              }
            />
            <SettingsToggle
              icon={<Heart />}
              title='Interests'
              desc='Show personal data nodes'
              isOn={settings.showInterests}
              onToggle={() =>
                setSettings({
                  ...settings,
                  showInterests: !settings.showInterests,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className='sticky bottom-4 z-20 pt-8 mt-12'>
        <div className='bg-white/70 backdrop-blur-xl border border-slate-200/50 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3 px-4'>
            <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
              Preferences Encrypted
            </span>
          </div>
          <LoadingButton
            onClick={handleSubmit}
            isLoading={loading}
            loadingText='Syncing...'
            className='w-full sm:w-auto min-w-[200px] h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200'
          >
            Commit Changes
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

// Helpers
function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className='flex items-center gap-2 px-1'>
      <Icon className='w-4 h-4 text-slate-400' />
      <h3 className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]'>
        {label}
      </h3>
    </div>
  );
}

function VisibilityHelper({ status }: { status: string }) {
  const configs: Record<string, { color: string; text: string; icon: any }> = {
    PUBLIC: {
      color: 'text-emerald-600',
      text: 'Identity is discoverable by all platform nodes.',
      icon: Globe,
    },
    FRIENDS: {
      color: 'text-blue-600',
      text: 'Visibility limited to confirmed network connections.',
      icon: Users,
    },
    PRIVATE: {
      color: 'text-slate-600',
      text: 'Identity encrypted. Hidden from discovery protocols.',
      icon: Lock,
    },
  };
  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className='flex gap-3'>
      <Icon className={cn('w-5 h-5 shrink-0', config.color)} />
      <p className={cn('text-xs leading-relaxed font-bold', config.color)}>
        {config.text}
      </p>
    </div>
  );
}

function SettingsToggle({
  icon,
  title,
  desc,
  isOn,
  onToggle,
}: {
  icon: any;
  title: string;
  desc: string;
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'group relative flex items-center justify-between w-full p-4 rounded-[20px] border transition-all duration-300 text-left',
        isOn
          ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-100'
          : 'bg-slate-50/40 border-slate-100 opacity-60 hover:opacity-100'
      )}
    >
      <div className='flex items-center gap-4'>
        <div
          className={cn(
            'p-2.5 rounded-xl transition-all duration-300',
            isOn
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
          )}
        >
          {React.cloneElement(icon, { className: 'w-4 h-4' })}
        </div>
        <div>
          <div
            className={cn(
              'font-black text-[11px] uppercase tracking-wider',
              isOn ? 'text-slate-900' : 'text-slate-500'
            )}
          >
            {title}
          </div>
          <div className='text-[10px] text-slate-400 font-bold uppercase tracking-tight'>
            {desc}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'w-11 h-6 rounded-full p-1 transition-all duration-500 shadow-inner',
          isOn ? 'bg-indigo-600' : 'bg-slate-300'
        )}
      >
        <div
          className={cn(
            'bg-white w-4 h-4 rounded-full shadow-lg transform transition-all duration-500 ease-spring',
            isOn ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  );
}
