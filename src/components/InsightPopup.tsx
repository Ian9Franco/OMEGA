"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { X, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { InsightMessage } from '@/lib/types';

const iconMap = {
  info: <Info size={16} className="text-accent-blue" />,
  warning: <AlertTriangle size={16} className="text-accent-yellow" />,
  success: <CheckCircle size={16} className="text-accent-mint" />,
};

const borderMap = {
  info: 'border-l-accent-blue',
  warning: 'border-l-accent-yellow',
  success: 'border-l-accent-mint',
};

function PopupItem({ insight, onClose }: { insight: InsightMessage; onClose: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(insight.id), 300);
    }, insight.duration || 5000);
    return () => clearTimeout(timer);
  }, [insight, onClose]);

  return (
    <div className={`
      dashboard-card p-3 border-l-4 ${borderMap[insight.type]}
      flex items-start gap-3 w-80 shadow-2xl
      transition-all duration-300
      ${isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}
      animate-slide-in
    `}>
      <div className="shrink-0 mt-0.5">{iconMap[insight.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white mb-0.5">{insight.title}</p>
        <p className="text-[10px] text-text-secondary leading-relaxed">{insight.message}</p>
      </div>
      <button
        onClick={() => { setIsExiting(true); setTimeout(() => onClose(insight.id), 300); }}
        className="text-text-tertiary hover:text-white shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function InsightPopupContainer({ insights, onDismiss }: {
  insights: InsightMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {insights.slice(-3).map(insight => (
        <PopupItem key={insight.id} insight={insight} onClose={onDismiss} />
      ))}
    </div>
  );
}
