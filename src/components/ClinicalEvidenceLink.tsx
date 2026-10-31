import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  FileText,
  Activity,
  Heart,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';

export interface EvidenceSourceMetadata {
  id?: string;
  title: string;
  category: 'Lab Report' | 'Vital Sign' | 'Intake Symptom' | 'Medical History' | 'Imaging / ECG' | 'Medication' | 'Consultation Note';
  date: string;
  verifiedBy?: string;
  previewSnippet: string;
  targetTab: 'overview' | 'records' | 'vitals' | 'symptoms' | 'history' | 'trends' | 'doctor-view';
  targetElementId?: string;
  severityOrStatus?: string;
}

interface ClinicalEvidenceLinkProps {
  children: React.ReactNode;
  source: EvidenceSourceMetadata;
  onNavigate?: (targetTab: string, targetElementId?: string, sourceTitle?: string) => void;
  className?: string;
}

export const ClinicalEvidenceLink: React.FC<ClinicalEvidenceLinkProps> = ({
  children,
  source,
  onNavigate,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate(source.targetTab, source.targetElementId, source.title);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lab Report':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'Vital Sign':
        return <Activity className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Intake Symptom':
        return <Sparkles className="w-3.5 h-3.5 text-teal-600" />;
      case 'Medical History':
      case 'Medication':
        return <Heart className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clickable Clinical Phrase */}
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-0.5 font-semibold text-teal-950 hover:text-teal-700 bg-teal-50/70 hover:bg-teal-100/90 border-b-2 border-teal-500/60 hover:border-teal-700 px-1 py-0.2 rounded-xs transition-all cursor-pointer text-left ${className}`}
        title={`Click to view original source in ${source.targetTab}`}
      >
        <span>{children}</span>
        <ExternalLink className="w-2.5 h-2.5 text-teal-600 group-hover:text-teal-800 opacity-60 group-hover:opacity-100 shrink-0 ml-0.5 transition-opacity" />
      </button>

      {/* Hover Source Preview Card */}
      {isHovered && (
        <span
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200/95 p-3.5 text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-auto block text-left"
        >
          {/* Micro arrow pointing down to the token */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 rotate-45 bg-white border-r border-b border-slate-200 block" />

          {/* Header */}
          <span className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                {getCategoryIcon(source.category)}
              </span>
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500 truncate">
                {source.category}
              </span>
            </span>

            {source.severityOrStatus && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                {source.severityOrStatus}
              </span>
            )}
          </span>

          {/* Source Title & Date */}
          <span className="py-2 space-y-1 block">
            <span className="font-extrabold text-slate-900 text-xs leading-snug block">
              {source.title}
            </span>

            <span className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {source.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-teal-700 font-medium">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                {source.verifiedBy || 'Verified Clinical Record'}
              </span>
            </span>
          </span>

          {/* Snippet / Observation */}
          <span className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-[11px] text-slate-700 font-medium leading-relaxed mb-2.5 block">
            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">
              Original Record Excerpt:
            </span>
            &ldquo;{source.previewSnippet}&rdquo;
          </span>

          {/* Direct CTA Action Button */}
          <button
            type="button"
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <span>View Original Source in {source.targetTab.toUpperCase()}</span>
            <ExternalLink className="w-3 h-3 text-teal-200" />
          </button>
        </span>
      )}
    </span>
  );
};
