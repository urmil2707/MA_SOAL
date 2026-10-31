import React from 'react';
import {
  FlaskConical,
  Clock,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  BellRing,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Patient, SectionLayoutConfig, InvestigationItem } from '../../types';
import { SectionWrapper } from './SectionWrapper';

interface InvestigationSectionProps {
  section: SectionLayoutConfig;
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onSendToHoldOn: (patientId: string) => void;
  onOpenUploadReportModal?: (patient: Patient, investigation?: InvestigationItem) => void;
  onOpenReportAlert?: (patient: Patient) => void;
  onSimulateLabAlert?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
}

export const InvestigationSection: React.FC<InvestigationSectionProps> = ({
  section,
  patients,
  onOpenDetail,
  onSendToHoldOn,
  onOpenUploadReportModal,
  onOpenReportAlert,
  onSimulateLabAlert,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
}) => {
  const investigationPatients = patients.filter((p) => p.status === 'INVESTIGATION');

  return (
    <SectionWrapper
      section={section}
      badgeCount={investigationPatients.length}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <div className="flex items-center gap-1.5">
          {onSimulateLabAlert && (
            <button
              type="button"
              onClick={onSimulateLabAlert}
              title="Simulate incoming lab report and broadcast real-time ringing bell alert"
              className="flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-white hover:bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/90 shadow-2xs transition-all hover:scale-102"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Simulate Report</span>
            </button>
          )}
          <span className="text-[10px] font-bold text-blue-800 bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-200/70">
            Diagnostics & Therapy
          </span>
        </div>
      }
    >
      <div className="bg-blue-50/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 text-[11px] text-blue-900 flex items-center justify-between shadow-2xs">
        <div>
          <span className="font-bold block text-blue-950">Lab, Radiology & Therapy</span>
          <span className="text-slate-500 text-[10px]">Track sample & procedure execution</span>
        </div>
        <span className="text-[10px] text-blue-800 font-bold bg-white/80 px-2 py-0.5 rounded-lg border border-white/80 shadow-2xs">
          Reception Visibility
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {investigationPatients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-white/80">
            No patients currently undergoing diagnostics or therapy.
          </div>
        ) : (
          investigationPatients.map((patient) => {
            const activeInv = patient.investigations[0];
            const hasAlert = patient.hasNewReportAlert;

            return (
              <div
                key={patient.id}
                onClick={() => onOpenDetail(patient)}
                className="bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-4 shadow-xs hover:shadow-md space-y-3 hover:border-blue-300/80 transition-all cursor-pointer relative group ring-1 ring-slate-900/5"
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
                        {hasAlert && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300 shadow-2xs animate-pulse">
                            <BellRing className="w-3 h-3 text-amber-700 animate-bounce" />
                            <span>Report Ready</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {patient.patientNumber} • Ordered by {patient.doctorName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    INVESTIGATION
                  </span>
                </div>

                {/* Subtle Real-Time Alert Banner (Ringing Bell) if Report was uploaded */}
                {hasAlert && (
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
                          {patient.labReportAlerts?.[0]?.reportName || activeInv?.name || 'Diagnostic Report'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                      View Report
                    </span>
                  </div>
                )}

                {/* Active Diagnostic Order Box in Bento Style */}
                {activeInv ? (
                  <div className="bg-white/70 backdrop-blur-xs rounded-xl p-3 border border-white/80 space-y-2.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] truncate">{activeInv.name}</span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {activeInv.department}
                      </span>
                    </div>

                    {/* Step Tracker */}
                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Current Stage:</span>
                        <span className="font-bold text-blue-800">{activeInv.status}</span>
                      </div>
                      {activeInv.assignedStaff && (
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span>Assigned Staff:</span>
                          <span className="font-semibold text-slate-700">{activeInv.assignedStaff}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Diagnostic orders pending creation.</div>
                )}

                {/* Operational Action: Upload Lab Report, View Details, or Send to Hold On */}
                <div className="pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onOpenUploadReportModal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUploadReportModal(patient, activeInv);
                        }}
                        className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200/80 shadow-2xs"
                        title="Upload verified diagnostic report file or apply clinical template"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Report</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(patient);
                      }}
                      className="py-1.5 px-2.5 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-slate-200/80"
                    >
                      Details
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToHoldOn(patient.id);
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-2xs"
                    title="Procedure/Sample completed; Move patient to Hold On while awaiting final report"
                  >
                    <span>Send to Hold On</span>
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

