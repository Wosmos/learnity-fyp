import { LayoutDashboard, Zap } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const Header = ({
  profileData,
  getInitials,
}: {
  profileData: any;
  getInitials: any;
}) => {
  return (
    <nav className='hidden md:block sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200'>
            <LayoutDashboard className='h-5 w-5 text-white' />
          </div>
          <div>
            <h1 className='text-lg font-black text-slate-900 tracking-tight'>
              Student <span className='text-indigo-600'>Portal</span>
            </h1>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
              Command Center
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm'>
            <Zap className='h-3.5 w-3.5 text-amber-500 fill-amber-500' />
            <span className='text-xs font-bold text-slate-600'>
              7 Day Streak
            </span>
          </div>
          {/* <Avatar className="h-9 w-9 border-2 border-white ring-1 ring-slate-200">
                <AvatarImage src={profileData?.profilePicture} />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">{getInitials()}</AvatarFallback>
             </Avatar> */}
        </div>
      </div>
    </nav>
  );
};

export default Header;
