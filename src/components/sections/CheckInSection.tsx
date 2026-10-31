import React from 'react';
import { FileText, Scale, ClipboardList, Activity, Send, CheckCircle2, Circle } from 'lucide-react';
import { Patient, SectionLayoutConfig } from '../../types';
import { SectionWrapper } from './SectionWrapper';
import { PatientCard } from '../PatientCard';

interface CheckInSectionProps {
  section: SectionLayoutConfig;
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onOpenCheckInModal: (patient: Patient) => void;
  onSendToAssessment: (patientId: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
}

export const CheckInSection: React.FC<CheckInSectionProps> = ({
  section,
  patients,
  onOpenDetail,
  onOpenCheckInModal,
  onSendToAssessment,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
}) => {
  // Only patients in CHECK-IN status
  const checkInPatients = patients.filter((p) => p.status === 'CHECK-IN' && p.arrivalStatus === 'ARRIVED');

  return (
    <SectionWrapper
      section={section}
      badgeCount={checkInPatients.length}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-200/70">
          Reception Only
        </span>
      }
    >
      {/* Informative Guidance Banner */}
      <div className="bg-blue-50/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 text-[11px] text-blue-800 flex items-start justify-between shadow-2xs">
        <div>
          <span className="font-bold block text-blue-950">3 Check-In Steps</span>
          <span className="text-slate-600 text-[10px]">
            1. Form • 2. Vitals & Body Comp • 3. Records
          </span>
        </div>
        <span className="font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded-lg border border-white/80 text-[10px] shadow-2xs">
          Reception Intake
        </span>
      </div>

      {/* Patients in Check-in */}
      <div className="space-y-4 flex-1">
        {checkInPatients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-white/80">
            No patients currently in Check-in queue.
          </div>
        ) : (
          checkInPatients.map((patient) => {
            const isFormDone = Boolean(patient.checkInModules?.form || patient.form?.completed);
            const isVitalsDone = Boolean(
              patient.checkInModules?.vitals ||
                (patient.vitals?.bpSystolic && patient.bodyComposition?.weightKg)
            );
            const isRecordsDone = Boolean(
              patient.checkInModules?.records ||
                patient.checkInModules?.medicalRecords ||
                (patient.uploadedRecords && patient.uploadedRecords.length > 0)
            );

            const completedCount = [isFormDone, isVitalsDone, isRecordsDone].filter(Boolean).length;
            const isFullyCompleted = completedCount === 3;

            return (
              <div
                key={patient.id}
                className="bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-3 shadow-xs hover:shadow-md space-y-3 hover:border-blue-300/80 transition-all cursor-pointer ring-1 ring-slate-900/5"
                onClick={() => onOpenDetail(patient)}
              >
                {/* Patient Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {patient.avatarUrl ? (
                      <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{patient.name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">({patient.age} Y • {patient.gender})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {patient.patientNumber} • {patient.appointmentTime} ({patient.appointmentType === 'Online Appointment' ? 'Online' : 'Walk-in'})
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    CHECK-IN
                  </span>
                </div>

                {/* 3 Intake Steps Bento Grid with Done Correct Symbol (✓) */}
                <div className="grid grid-cols-3 gap-1.5 text-xs bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-white/80 shadow-2xs">
                  {/* Step 1: Form */}
                  <div
                    className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border font-semibold text-[11px] transition-colors ${
                      isFormDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>1. Form</span>
                    {isFormDone ? (
                      <span className="font-extrabold text-emerald-700">✓</span>
                    ) : (
                      <span className="text-slate-300 text-[10px]">○</span>
                    )}
                  </div>

                  {/* Step 2: Vitals */}
                  <div
                    className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border font-semibold text-[11px] transition-colors ${
                      isVitalsDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>2. Vitals</span>
                    {isVitalsDone ? (
                      <span className="font-extrabold text-emerald-700">✓</span>
                    ) : (
                      <span className="text-slate-300 text-[10px]">○</span>
                    )}
                  </div>

                  {/* Step 3: Records */}
                  <div
                    className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border font-semibold text-[11px] transition-colors ${
                      isRecordsDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>3. Records</span>
                    {isRecordsDone ? (
                      <span className="font-extrabold text-emerald-700">✓</span>
                    ) : (
                      <span className="text-slate-300 text-[10px]">○</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">Steps Completed:</span>
                    <span className="font-extrabold text-blue-700">{completedCount}/3 ({Math.round((completedCount / 3) * 100)}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFullyCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${(completedCount / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 2 Action Buttons: 1. Check-In and 2. Send to Assessment */}
                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCheckInModal(patient);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-xl transition-all border border-blue-200/80 text-center"
                  >
                    Check-In
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToAssessment(patient.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs text-center"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Assessment</span>
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
