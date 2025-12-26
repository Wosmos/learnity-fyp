'use client';

import { useClientAuth } from '@/hooks/useClientAuth';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X, Bug } from 'lucide-react';

export function AuthDebugInfo() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const [debugInfo, setDebugInfo] = useState<unknown>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateDebugInfo = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setDebugInfo({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            customClaims: idTokenResult.claims,
            isAuthenticated,
            claims,
            loading,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          setDebugInfo({
            error: error instanceof Error ? error.message : 'Unknown error',
            isAuthenticated,
            claims,
            loading,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setDebugInfo({
          user: null,
          isAuthenticated,
          claims,
          loading,
          timestamp: new Date().toISOString()
        });
      }
    };

    updateDebugInfo();
  }, [user, isAuthenticated, claims, loading]);

  // Handle visibility logic
  if (!isVisible) return null;
  if (process.env.NODE_ENV === 'production' && isAuthenticated && claims) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 font-mono">
      {/* Main Panel */}
      <div 
        className={`
          bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl 
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'w-80 opacity-100' : 'w-0 h-0 opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Bug size={14} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/70">Auth Debug</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="p-4">
          <pre className="text-[11px] leading-relaxed text-emerald-400/90 overflow-auto max-h-64 custom-scrollbar">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] py-2 rounded-md transition-all active:scale-95"
            >
              Refresh Session
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] rounded-md transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button (Visible when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0A0A0A] border border-white/10 p-3 rounded-full shadow-xl text-emerald-400 hover:scale-110 transition-transform active:scale-95"
        >
          <Bug size={20} />
        </button>
      )}
    </div>
  );
}