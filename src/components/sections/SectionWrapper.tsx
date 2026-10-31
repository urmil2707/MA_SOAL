import React, { useState } from 'react';
import {
  GripVertical,
} from 'lucide-react';
import { SectionLayoutConfig } from '../../types';

interface SectionWrapperProps {
  section: SectionLayoutConfig;
  badgeCount?: number;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  layoutMode?: 'kanban' | 'grid';
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  section,
  badgeCount,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  children,
  headerAction,
  layoutMode = 'kanban',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Width classes
  const getWidthClass = () => {
    if (layoutMode === 'grid') {
      switch (section.width) {
        case 'wide':
          return 'col-span-12 lg:col-span-6 xl:col-span-6';
        case 'full':
          return 'col-span-12';
        case 'normal':
        default:
          return 'col-span-12 md:col-span-6 xl:col-span-4';
      }
    } else {
      // In Kanban/horizontal scroll
      switch (section.width) {
        case 'wide':
          return 'w-[380px] sm:w-[440px] shrink-0';
        case 'full':
          return 'w-[480px] sm:w-[560px] shrink-0';
        case 'normal':
        default:
          return 'w-[320px] sm:w-[350px] shrink-0';
      }
    }
  };

  return (
    <div
      id={`section-${section.id}`}
      className={`bg-white/60 hover:bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 ring-1 ring-slate-900/5 flex flex-col transition-all duration-200 shadow-xl shadow-slate-900/5 overflow-hidden ${getWidthClass()} ${
        isCollapsed ? 'h-auto' : 'h-full min-h-[580px]'
      }`}
    >
      {/* Section Header with Move Controls & Drag Handle in Bento Style */}
      <div className="px-4.5 py-3.5 border-b border-white/60 bg-white/50 backdrop-blur-md rounded-t-3xl flex items-center justify-between gap-2.5 select-none">
        {/* Left: Drag Handle, Title & Count Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors"
            title="Drag / Moveable Section"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight truncate">{section.title}</h3>
              {typeof badgeCount === 'number' && (
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-200/60">
                  {badgeCount}
                </span>
              )}
            </div>
            {section.subtitle && (
              <p className="text-[11px] text-slate-400 font-medium truncate">{section.subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {headerAction && (
          <div className="flex items-center gap-1 shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {/* Section Body */}
      {!isCollapsed && (
        <div className="p-4 flex-1 flex flex-col overflow-y-auto space-y-4 bg-white/20 backdrop-blur-xs">
          {children}
        </div>
      )}
    </div>
  );
};
