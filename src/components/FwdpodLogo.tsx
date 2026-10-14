import React from 'react';

interface FwdpodLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FwdpodLogo({ className = '', size = 'md' }: FwdpodLogoProps) {
  // Larger responsive dimensions to ensure high prominence on desktop sites
  const iconSize = size === 'sm' 
    ? 'w-8 h-8 md:w-10 md:h-10' 
    : size === 'lg' 
      ? 'w-16 h-16 md:w-20 md:h-20' 
      : 'w-11 h-11 md:w-14 md:h-14';

  const textSize = size === 'sm' 
    ? 'text-[17px] md:text-2xl' 
    : size === 'lg' 
      ? 'text-3xl md:text-5xl' 
      : 'text-2xl md:text-3.5xl';
  
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 3 Person Pods Icon inside a custom squircle frame (matching the user's uploaded image) */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${iconSize} shrink-0`}
      >
        {/* Rounded square container frame */}
        <rect 
          x="6" 
          y="6" 
          width="88" 
          height="88" 
          rx="24" 
          fill="none" 
          stroke="#000000" 
          strokeWidth="8.5" 
        />
        
        {/* Left Team Member (Compact Black Avatar) */}
        <circle cx="28" cy="38" r="6.5" fill="#000000" />
        <rect x="21" y="48" width="14" height="19" rx="4.5" fill="#000000" />
        
        {/* Center Team Member (Larger Primary Blue Avatar) */}
        <circle cx="50" cy="32" r="9.5" fill="#0066FF" />
        <rect x="40" y="45" width="20" height="26" rx="6.5" fill="#0066FF" />
        
        {/* Right Team Member (Compact Black Avatar) */}
        <circle cx="72" cy="38" r="6.5" fill="#000000" />
        <rect x="65" y="48" width="14" height="19" rx="4.5" fill="#000000" />
      </svg>
      
      <span className={`${textSize} font-bold tracking-tight text-[#0A0A0A] font-sans lowercase`}>
        fwdpod<span className="text-[#555555] font-normal">.com</span>
      </span>
    </div>
  );
}
