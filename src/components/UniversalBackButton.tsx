import React from 'react';
import { ArrowLeft, History, ChevronRight } from 'lucide-react';

interface UniversalBackButtonProps {
  onBack: () => void;
  previousLabel?: string | null;
  currentLabel?: string;
  className?: string;
  variant?: 'banner' | 'pill' | 'compact';
}

export const UniversalBackButton: React.FC<UniversalBackButtonProps> = ({
  onBack,
  previousLabel,
  currentLabel,
  className = '',
  variant = 'pill',
}) => {
  if (!previousLabel) return null;

  if (variant === 'banner') {
    return (
      <div
        className={`bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-xs sticky top-0 z-30 shadow-md ${className}`}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-bold text-amber-300 hover:text-white transition-colors cursor-pointer group"
          title={`Return to ${previousLabel}`}
        >
          <div className="w-6 h-6 rounded-md bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-900 flex items-center justify-center transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>Back to {previousLabel}</span>
        </button>

        {currentLabel && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="text-slate-500">Currently viewing:</span>
            <span className="font-semibold text-white">{currentLabel}</span>
          </div>
        )}
      </div>
    );
  }

  // Default 'pill' variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-teal-500/15 hover:from-amber-500/25 hover:to-teal-500/25 text-slate-800 border border-amber-300/80 hover:border-amber-400 text-xs font-bold transition-all shadow-3xs hover:shadow-xs active:scale-95 cursor-pointer group"
        title={`Return to ${previousLabel}`}
      >
        <div className="w-4 h-4 rounded-full bg-amber-500/20 group-hover:bg-amber-500 text-amber-900 group-hover:text-white flex items-center justify-center transition-colors">
          <ArrowLeft className="w-3 h-3" />
        </div>
        <span className="text-slate-700 group-hover:text-slate-900">
          Back to <span className="text-teal-900 font-extrabold">{previousLabel}</span>
        </span>
      </button>

      {currentLabel && (
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span>{currentLabel}</span>
        </span>
      )}
    </div>
  );
};
