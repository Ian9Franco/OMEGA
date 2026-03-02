"use client";
import { Info } from 'lucide-react';
import React from 'react';

export const Tooltip = ({ children, content, position = 'top' }: { children: React.ReactNode, content: string | React.ReactNode, position?: 'top' | 'bottom' | 'left' | 'right' }) => {
  const getPosClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom';
      case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top';
      case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right';
      case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left';
    }
  };

  return (
    <div className="relative inline-flex items-center tooltip-trigger cursor-help group/tooltip">
      {children}
      <div className={`tooltip-content absolute ${getPosClasses()} w-64 p-3 bg-card-bg-light border border-white/10 rounded-xl text-xs text-text-secondary shadow-xl z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity scale-95 group-hover/tooltip:scale-100`}>
        {content}
      </div>
    </div>
  );
};

export const InfoTip = ({ content }: { content: string | React.ReactNode }) => (
  <Tooltip content={content}>
    <Info size={12} className="text-text-tertiary hover:text-white" />
  </Tooltip>
);
