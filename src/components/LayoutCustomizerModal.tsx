import React from 'react';
import {
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  LayoutGrid,
  Columns,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { SectionLayoutConfig } from '../types';

interface LayoutCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionLayoutConfig[];
  onReorder: (newSections: SectionLayoutConfig[]) => void;
  onReset: () => void;
  layoutMode: 'kanban' | 'grid';
  onLayoutModeChange: (mode: 'kanban' | 'grid') => void;
}

export const LayoutCustomizerModal: React.FC<LayoutCustomizerModalProps> = ({
  isOpen,
  onClose,
  sections,
  onReorder,
  onReset,
  layoutMode,
  onLayoutModeChange,
}) => {
  if (!isOpen) return null;

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    // Re-index order
    const updated = newSections.map((s, idx) => ({ ...s, order: idx }));
    onReorder(updated);
  };

  const handleToggleVisible = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s));
    onReorder(updated);
  };

  const handleWidthChange = (id: string, width: 'normal' | 'wide' | 'full') => {
    const updated = sections.map((s) => (s.id === id ? { ...s, width } : s));
    onReorder(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-white/70 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">Adjust & Move Dashboard Sections</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize positions, column widths, and visibility of all dashboard stages.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Selection */}
        <div className="px-6 py-4 border-b border-white/60 bg-white/50 backdrop-blur-xs">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">Display Layout Archetype</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onLayoutModeChange('kanban')}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                layoutMode === 'kanban'
                  ? 'border-blue-600/80 bg-blue-50/80 text-blue-700 shadow-2xs'
                  : 'border-slate-200/80 hover:bg-slate-50/80 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Columns className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Workflow Board</div>
                <div className="text-[11px] font-normal text-slate-500">Horizontal clinical flow</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onLayoutModeChange('grid')}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                layoutMode === 'grid'
                  ? 'border-blue-600/80 bg-blue-50/80 text-blue-700 shadow-2xs'
                  : 'border-slate-200/80 hover:bg-slate-50/80 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Modular Grid View</div>
                <div className="text-[11px] font-normal text-slate-500">Multi-column bento grid</div>
              </div>
            </button>
          </div>
        </div>

        {/* Reorderable Section List */}
        <div className="px-6 py-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Section Hierarchy & Positions (1 to {sections.length})
          </div>

          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`py-2.5 flex items-center justify-between gap-3 ${
                !section.visible ? 'opacity-50 bg-slate-50/60' : ''
              }`}
            >
              {/* Left: Position Number & Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-200/60">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="truncate">{section.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({section.subtitle})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{section.description}</div>
                </div>
              </div>

              {/* Center/Right: Width Selector & Move Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Width selector */}
                <select
                  value={section.width}
                  onChange={(e) =>
                    handleWidthChange(section.id, e.target.value as 'normal' | 'wide' | 'full')
                  }
                  className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1 text-slate-700 font-semibold shadow-2xs"
                  title="Section Width"
                >
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                  <option value="full">Full Width</option>
                </select>

                {/* Move Up Button */}
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Move Left/Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down Button */}
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Move Right/Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleVisible(section.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    section.visible ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={section.visible ? 'Hide Section' : 'Show Section'}
                >
                  {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/70 bg-white/70 backdrop-blur-md flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold py-1.5 px-3 rounded-xl hover:bg-slate-200/70 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default Layout</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Done Adjusting</span>
          </button>
        </div>
      </div>
    </div>
  );
};
