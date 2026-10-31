import React from 'react';
import { Clock, AlertCircle, FileCheck, UserCheck, BellRing } from 'lucide-react';
import { Patient, SectionLayoutConfig } from '../../types';
import { SectionWrapper } from './SectionWrapper';

interface HoldOnSectionProps {
  section: SectionLayoutConfig;
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onSendBackToDoctor: (patientId: string) => void;
  onOpenReportAlert?: (patient: Patient) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
}

export const HoldOnSection: React.FC<HoldOnSectionProps> = ({
  section,
  patients,
  onOpenDetail,
  onSendBackToDoctor,
  onOpenReportAlert,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
}) => {
  const holdOnPatients = patients.filter((p) => p.status === 'HOLD ON');

  return (
    <SectionWrapper
      section={section}
      badgeCount={holdOnPatients.length}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <span className="text-[10px] font-bold text-amber-800 bg-amber-50/90 px-2.5 py-0.5 rounded-full border border-amber-200/70">
          Awaiting Reports
        </span>
      }
    >
      <div className="bg-amber-50/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 text-[11px] text-amber-900 flex items-center justify-between shadow-2xs">
        <div>
          <span className="font-bold block text-amber-950">Hold On Area</span>
          <span className="text-slate-500 text-[10px]">Patients waiting for test reports</span>
        </div>
        <span className="text-[10px] text-amber-800 font-bold bg-white/80 px-2 py-0.5 rounded-lg border border-white/80 shadow-2xs">
          Report to Doctor Review
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {holdOnPatients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-white/80">
            No patients currently on Hold.
          </div>
        ) : (
          holdOnPatients.map((patient) => {
            const completedInv = patient.investigations.find((i) => i.status === 'Completed' || i.status === 'Result Available') || patient.investigations[0];

            return (
              <div
                key={patient.id}
                onClick={() => onOpenDetail(patient)}
                className="bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-4 shadow-xs hover:shadow-md space-y-3 hover:border-amber-300/80 transition-all cursor-pointer ring-1 ring-slate-900/5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {patient.avatarUrl ? (
                      <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-xs leading-tight">{patient.name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">({patient.age} Y • {patient.gender})</span>
                        {patient.hasNewReportAlert && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300 shadow-2xs animate-pulse">
                            <BellRing className="w-3 h-3 text-amber-700 animate-bounce" />
                            <span>Report Ready</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {patient.patientNumber} • Doctor: {patient.doctorName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    HOLD ON
                  </span>
                </div>

                {/* Subtle Real-Time Alert Banner (Ringing Bell) if Report was uploaded */}
                {patient.hasNewReportAlert && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenReportAlert) {
                        onOpenReportAlert(patient);
                      } else {
                        onOpenDetail(patient);
                      }
                    }}
                    className="bg-amber-50/95 hover:bg-amber-100 text-amber-950 border border-amber-300/90 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs transition-all cursor-pointer"
                    title="Click to view verified laboratory report"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                        <BellRing className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                      </div>
                      <div className="leading-tight">
                        <span className="font-extrabold text-[11px] text-amber-950 block">
                          Lab Report Uploaded
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">
                          {patient.labReportAlerts?.[0]?.reportName || 'Diagnostic Report Ready'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                      View Report
                    </span>
                  </div>
                )}

                {/* Hold Reason Box in Bento Style */}
                <div className="bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-white/80 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-[11px]">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{patient.holdReason || 'Waiting for diagnostic results'}</span>
                  </div>
                  {completedInv && (
                    <div className="text-[10px] text-slate-600 font-medium pl-6">
                      Report: <span className="font-semibold text-slate-800">{completedInv.name}</span> ({completedInv.department})
                    </div>
                  )}
                </div>

                {/* Action: Send to Doctor Review (Section 24) */}
                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(patient);
                    }}
                    className="py-1.5 px-3 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-slate-200/80"
                  >
                    View Details
                  </button>

                  <button
                    id={`report-ready-btn-${patient.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendBackToDoctor(patient.id);
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs"
                    title="Report has arrived: Return patient to Doctor queue for review"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Report Ready for Doctor</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionWrapper>
  );
};
