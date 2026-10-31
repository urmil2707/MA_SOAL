import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  UserCheck,
  ClipboardCheck,
  Stethoscope,
  Users,
  FlaskConical,
  CreditCard,
  FileText,
  Upload,
  ArrowRight,
  Layers,
  Microscope,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  History,
  FileUp,
} from 'lucide-react';
import {
  Patient,
  PatientUploadedRecord,
  PreviousAppointmentRecord,
  InvestigationItem,
} from '../types';
import {
  PatientJourneyStep,
  getConnectedCheckInModules,
  getInvestigationDetailedJourney,
} from '../utils/previousAppointments';

interface PatientJourneyTimelineProps {
  patient: Patient;
  journeySteps: PatientJourneyStep[];
  longestStep: PatientJourneyStep | null;
  totalTurnaroundMinutes: number;
  reports?: InvestigationItem[];
  previousAppointments?: PreviousAppointmentRecord[];
  selectedAppointmentId?: string;
  onSelectAppointmentId?: (id: string) => void;
  onViewRecordsTab?: (highlightRecordId?: string) => void;
}

type TimelineItem =
  | {
      type: 'consultation';
      id: string;
      date: string;
      time: string;
      sortTimestamp: number;
      consultation: PreviousAppointmentRecord;
    }
  | {
      type: 'record';
      id: string;
      date: string; // extracted document date
      sortTimestamp: number;
      record: PatientUploadedRecord;
    };

function parseDateToTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  const isoParsed = Date.parse(dateStr);
  if (!isNaN(isoParsed)) return isoParsed;

  const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.getTime();

  return 0;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatExtractedScanDate(dateStr: string): string {
  if (!dateStr) return 'Document Record';
  try {
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function formatUploadedOnDate(uploadedAt: string): string {
  if (!uploadedAt) return 'Uploaded recently';
  try {
    const cleaned = uploadedAt.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthFull = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return `Uploaded on ${day}${getOrdinalSuffix(day)} ${monthFull[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (uploadedAt.includes('AM') || uploadedAt.includes('PM')) {
      return `Uploaded on 4th September 2026 at ${uploadedAt}`;
    }
  } catch {
    // fallback
  }
  return `Uploaded on ${uploadedAt}`;
}

export const PatientJourneyTimeline: React.FC<PatientJourneyTimelineProps> = ({
  patient,
  journeySteps,
  longestStep,
  totalTurnaroundMinutes,
  reports = [],
  previousAppointments = [],
  selectedAppointmentId = 'today',
  onSelectAppointmentId,
  onViewRecordsTab,
}) => {
  // Expanded card state for individual timeline items
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null);

  // Scroll compression state for Today's Consultation box
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isManualExpanded, setIsManualExpanded] = useState<boolean>(false);

  // Toggle for today's live stages workflow accordion
  const [isLiveStagesExpanded, setIsLiveStagesExpanded] = useState<boolean>(false);
  const [isCheckInSubFlowOpen, setIsCheckInSubFlowOpen] = useState<boolean>(false);

  // Scroll listener handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 20) {
      if (!isScrolled) setIsScrolled(true);
    } else {
      if (isScrolled) {
        setIsScrolled(false);
        setIsManualExpanded(false);
      }
    }
  };

  // Compute connected check-in modules
  const checkInStep = (journeySteps || []).find((s) => s.id === 'step-checkin');
  const checkInStartTime = checkInStep?.startTime || '10:19 AM';
  const connectedCheckInModules = getConnectedCheckInModules(patient, checkInStartTime);

  // Merge and sort chronological timeline: previous consultations + date extracted from uploaded records
  const timelineItems: TimelineItem[] = useMemo(() => {
    const list: TimelineItem[] = [];

    // 1. Add Previous Consultations
    if (Array.isArray(previousAppointments)) {
      previousAppointments.forEach((appt) => {
        list.push({
          type: 'consultation',
          id: appt.id,
          date: appt.date,
          time: appt.time,
          sortTimestamp: parseDateToTimestamp(appt.date),
          consultation: appt,
        });
      });
    }

    // 2. Add Uploaded Records (using extracted scanDate as the timeline event date)
    if (Array.isArray(patient.uploadedRecords)) {
      patient.uploadedRecords.forEach((rec) => {
        list.push({
          type: 'record',
          id: rec.id,
          date: rec.scanDate,
          sortTimestamp: parseDateToTimestamp(rec.scanDate),
          record: rec,
        });
      });
    }

    // Sort descending by sortTimestamp
    list.sort((a, b) => b.sortTimestamp - a.sortTimestamp);
    return list;
  }, [previousAppointments, patient.uploadedRecords]);

  // Helper for step icons
  const getStepIcon = (category: string) => {
    switch (category) {
      case 'Front Desk':
        return <UserCheck className="w-3.5 h-3.5" />;
      case 'Check-in':
        return <ClipboardCheck className="w-3.5 h-3.5" />;
      case 'Assessment':
        return <Stethoscope className="w-3.5 h-3.5" />;
      case 'Doctor':
        return <Users className="w-3.5 h-3.5" />;
      case 'Diagnostics':
        return <FlaskConical className="w-3.5 h-3.5" />;
      case 'Billing':
        return <CreditCard className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const completedStepsCount = (journeySteps || []).filter((s) => s.status === 'Completed').length;
  const progressPercent = Math.round(
    (completedStepsCount / Math.max((journeySteps || []).length, 1)) * 100
  );

  return (
    <div className="flex flex-col h-full text-slate-800">
      {/* ========================================================= */}
      {/* 1. SINGLE SECTION HEADER: PATIENT'S TIMELINE              */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#2f5597] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">
              Patient’s Timeline
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Chronological consultations & extracted records
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold font-mono text-[#2f5597] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
          {timelineItems.length + 1} Total Events
        </span>
      </div>

      {/* ========================================================= */}
      {/* 2. SCROLLABLE TIMELINE BODY                               */}
      {/* ========================================================= */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-3 pt-3 pr-0.5 scrollbar-thin relative"
      >
        {/* ======================================================= */}
        {/* TOP OF LIST: TODAY'S CONSULTATION                       */}
        {/* STAYS ON TOP EVEN WHEN USER SCROLLS (STICKY)            */}
        {/* COMPRESSES ON SCROLL TO ONLY SHOW "TODAY'S CONSULTATION" */}
        {/* ======================================================= */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-2 pt-0.5 border-b border-slate-200 shadow-2xs">
          {isScrolled && !isManualExpanded ? (
            /* COMPRESSED VIEW: Only shows "Today's Consultation" header, hiding all other contents */
            <div
              className={`py-2 px-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 shadow-xs ${
                selectedAppointmentId === 'today'
                  ? 'bg-blue-50/90 border-[#2f5597] ring-1 ring-[#2f5597]/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-[#2f5597] truncate">
                  Today's Consultation
                </span>
                <span className="text-[9px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                  Active
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                    patient.status === 'IN CONSULTATION'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : patient.status === 'IN QUEUE'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  {patient.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedAppointmentId !== 'today' && onSelectAppointmentId && (
                  <button
                    type="button"
                    onClick={() => onSelectAppointmentId('today')}
                    className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#2f5597] rounded-md transition-colors cursor-pointer"
                  >
                    Return
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsManualExpanded(true)}
                  className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Expand Today's Consultation details"
                >
                  <span>Expand</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* FULL EXPANDED VIEW */
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                selectedAppointmentId === 'today'
                  ? 'bg-blue-50/70 border-[#2f5597] ring-2 ring-[#2f5597]/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top row: Title & Live Pulse */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#2f5597]">
                    Today's Consultation
                  </span>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded border border-blue-200">
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      patient.status === 'IN CONSULTATION'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : patient.status === 'IN QUEUE'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {patient.status}
                  </span>
                  {isScrolled && (
                    <button
                      type="button"
                      onClick={() => setIsManualExpanded(false)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                      title="Compress Today's Consultation box"
                    >
                      <ChevronUp className="w-3 h-3" />
                      <span>Compress</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Date, Time & Token */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mt-2">
                <span className="font-mono text-[11px] text-slate-700">
                  Today · 04 Sep 2026 ({patient.appointmentTime || '10:30 AM'})
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Token #{patient.tokenNumber || '101'}
                </span>
              </div>

              {/* Doctor & Room */}
              <div className="text-xs text-slate-600 font-semibold mt-1 flex items-center justify-between gap-2">
                <span className="truncate">
                  Dr. {patient.doctorName} ({patient.specialty})
                </span>
                <span className="text-[10px] font-medium text-slate-500 shrink-0">
                  Room: {patient.roomNumber || '3'}
                </span>
              </div>

              {/* Chief Complaint */}
              <div className="mt-1.5 text-xs text-slate-600 italic bg-white/90 p-2 rounded-xl border border-slate-200/80 line-clamp-2">
                "{patient.assessment?.chiefComplaint || patient.form?.reasonOfVisit || 'Routine Consultation'}"
              </div>

              {/* Action Bar: Return to Today (if looking at history) & Expand Stages */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                {selectedAppointmentId !== 'today' && onSelectAppointmentId && (
                  <button
                    type="button"
                    onClick={() => onSelectAppointmentId('today')}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#2f5597] hover:bg-[#254680] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>✓ Viewing Today's Visit</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsLiveStagesExpanded(!isLiveStagesExpanded)}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span>
                    {isLiveStagesExpanded ? 'Hide Live Stages' : 'View Live Stages'}
                  </span>
                  {isLiveStagesExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Expandable Live Stage Milestones (Check-in, Assessment, Doctor, Diagnostics, Billing) */}
              {isLiveStagesExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2 animate-in fade-in duration-150">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span>
                        Stages: {completedStepsCount} of {journeySteps.length} Completed
                      </span>
                      <span className="text-blue-700 font-mono">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2f5597] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps Mini Rail */}
                  <div className="space-y-1.5 pt-1">
                    {journeySteps.map((step, idx) => {
                      const isCompleted = step.status === 'Completed';
                      const isActive = step.status === 'Active';

                      return (
                        <div
                          key={step.id}
                          className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                            isActive
                              ? 'bg-blue-50 border-blue-300 font-bold'
                              : isCompleted
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-white border-slate-100 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : isActive
                                  ? 'bg-blue-600 text-white animate-pulse'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isCompleted ? '✓' : idx + 1}
                            </span>
                            <span className="truncate">{step.name}</span>
                          </div>
                          <span className="font-mono text-[10px] font-semibold shrink-0">
                            {step.minutes}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================= */}
        {/* BELOW TODAY: CHRONOLOGICAL COMPLETE TIMELINE            */}
        {/* (Sorted by previous consultations and date extracted    */}
        {/*  from uploaded records)                                 */}
        {/* ======================================================= */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Historical Timeline</span>
            <span>Sorted by Extracted Date</span>
          </div>

          {timelineItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              No previous consultations or uploaded records on file.
            </div>
          ) : (
            timelineItems.map((item) => {
              // ----------------------------------------------------
              // ENTRY TYPE 1: UPLOADED RECORD
              // Shows extracted document date in timeline;
              // clicking shows "Uploaded on [Date]" (e.g. 15th October)
              // ----------------------------------------------------
              if (item.type === 'record') {
                const rec = item.record;
                const isExpanded = expandedRecordId === rec.id;
                const displayExtractedDate = formatExtractedScanDate(rec.scanDate);
                const displayUploadedText = formatUploadedOnDate(rec.uploadedAt);

                return (
                  <div
                    key={`rec-${rec.id}`}
                    className={`rounded-2xl border transition-all text-xs overflow-hidden ${
                      rec.isCritical
                        ? 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-200'
                        : isExpanded
                        ? 'border-blue-400 bg-blue-50/30 ring-1 ring-blue-300 shadow-xs'
                        : 'border-slate-200/90 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Header Row: Date extracted from uploaded record is shown here in timeline */}
                    <div
                      onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                      className="p-3 cursor-pointer flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            rec.isCritical
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </div>

                        <div className="min-w-0">
                          {/* Extracted Date Badge as the primary timeline date */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {displayExtractedDate}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              {rec.category}
                            </span>
                            {rec.isCritical && (
                              <span className="text-[9px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded animate-pulse">
                                CRITICAL
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-slate-800 text-xs mt-1 leading-snug">
                            {rec.title}
                          </h5>

                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                            {rec.sourceOrClinic || 'Clinic Lab'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200">
                          {isExpanded ? 'Collapse' : 'Details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* EXPANDED VIEW: RECEPTIONIST CLICKS ON RECORD */}
                    {/* Shows "Uploaded on 15th October" and full document breakdown */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2.5 animate-in fade-in duration-150">
                        {/* Requirement Callout Banner: "Uploaded on 15th October" */}
                        <div className="bg-sky-50 border border-sky-300/90 text-sky-950 p-2.5 rounded-xl shadow-2xs flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-sky-700 shrink-0" />
                            <div>
                              <span className="font-extrabold text-xs block text-sky-900">
                                {displayUploadedText}
                              </span>
                              <span className="text-[10px] text-sky-700">
                                Document Record Date: <strong>{displayExtractedDate}</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-sky-800 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                            Verified
                          </span>
                        </div>

                        {/* Critical Alert summary if present */}
                        {rec.criticalSummary && (
                          <div className="p-2 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{rec.criticalSummary}</span>
                          </div>
                        )}

                        {/* Important Highlights */}
                        {rec.importantHighlights && rec.importantHighlights.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Extracted Test Findings:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {rec.importantHighlights.map((hl, hIdx) => (
                                <span
                                  key={hIdx}
                                  className="text-[10px] font-medium bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md"
                                >
                                  {hl}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Clinical notes / doctor info */}
                        {rec.notes && (
                          <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/80">
                            {rec.notes}
                          </p>
                        )}

                        {/* Action: View in Records tab */}
                        {onViewRecordsTab && (
                          <button
                            type="button"
                            onClick={() => onViewRecordsTab(rec.id)}
                            className="w-full py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Go to Record in Records Tab</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // ----------------------------------------------------
              // ENTRY TYPE 2: PREVIOUS CONSULTATION
              // Shows consultation date, doctor, specialty, diagnosis,
              // status, and allows viewing historical visit snapshot
              // ----------------------------------------------------
              const appt = item.consultation;
              const isSelected = selectedAppointmentId === appt.id;
              const isExpanded = expandedConsultationId === appt.id;

              return (
                <div
                  key={`appt-${appt.id}`}
                  className={`rounded-2xl border transition-all text-xs overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/50 border-[#2f5597] ring-1 ring-[#2f5597]/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() => setExpandedConsultationId(isExpanded ? null : appt.id)}
                    className="p-3 cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        {/* Consultation Date */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {appt.date}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ({appt.time})
                          </span>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            {appt.status || 'Completed'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 font-semibold mt-1">
                          Dr. {appt.doctorName} ({appt.doctorSpecialty})
                        </div>

                        <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          "{appt.chiefComplaint}"
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded view with diagnosis, notes, and switch button */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2 animate-in fade-in duration-150">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Diagnosis:
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">
                          {appt.diagnosis}
                        </span>
                      </div>

                      {appt.clinicalSummary && (
                        <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-200">
                          {appt.clinicalSummary}
                        </p>
                      )}

                      {/* Select / View Consultation Snapshot */}
                      {onSelectAppointmentId && (
                        <button
                          type="button"
                          onClick={() => onSelectAppointmentId(appt.id)}
                          className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#2f5597] text-white shadow-xs'
                              : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300'
                          }`}
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>
                            {isSelected ? '✓ Currently Viewing This Visit' : 'View Visit Details in Workspace'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
