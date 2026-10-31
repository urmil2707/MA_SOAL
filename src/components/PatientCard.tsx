import React from 'react';
import { Clock, User, Calendar, Stethoscope, AlertCircle, PhoneCall, BellRing } from 'lucide-react';
import { Patient, PatientStatus } from '../types';

interface PatientCardProps {
  patient: Patient;
  onOpenDetail: (patient: Patient) => void;
  onQuickAction?: (patient: Patient, e: React.MouseEvent) => void;
  quickActionLabel?: string;
  quickActionVariant?: 'primary' | 'secondary' | 'success' | 'warning';
  hideQuickAction?: boolean;
  onOpenReportAlert?: (patient: Patient) => void;
  onCheckIn?: (patient: Patient) => void;
  onSendToAssessment?: (patientId: string) => void;
}

export const getStatusBadgeStyle = (status: PatientStatus) => {
  switch (status) {
    case 'CHECK-IN':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'ASSESSMENT':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'IN QUEUE':
      return 'bg-blue-100/70 text-blue-900 border-blue-200';
    case 'IN CONSULTATION':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'INVESTIGATION':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'HOLD ON':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'BILLING':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'DONE':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onOpenDetail,
  onQuickAction,
  quickActionLabel,
  quickActionVariant = 'primary',
  hideQuickAction = false,
  onOpenReportAlert,
  onCheckIn,
  onSendToAssessment,
}) => {
  const isMale = patient.gender === 'Male';

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

  // Default quick action label based on stage
  let actionLabel = quickActionLabel;
  let actionColor = quickActionVariant;

  if (!actionLabel) {
    switch (patient.status) {
      case 'CHECK-IN': {
        const completedCount = [isFormDone, isVitalsDone, isRecordsDone].filter(Boolean).length;
        if (completedCount === 3) {
          actionLabel = 'Send to Assessment';
          actionColor = 'success';
        } else {
          actionLabel = 'Check-In';
          actionColor = 'primary';
        }
        break;
      }
      case 'ASSESSMENT':
        if (patient.assessment.subjectiveCompleted && patient.assessment.objectiveCompleted) {
          actionLabel = 'Send to Doctor';
          actionColor = 'primary';
        } else {
          actionLabel = 'View Assessment';
          actionColor = 'secondary';
        }
        break;
      case 'IN QUEUE':
        actionLabel = 'Call Patient';
        actionColor = 'warning';
        break;
      case 'IN CONSULTATION':
        actionLabel = 'In Consult';
        actionColor = 'secondary';
        break;
      case 'INVESTIGATION':
        actionLabel = 'Track Status';
        actionColor = 'primary';
        break;
      case 'HOLD ON':
        actionLabel = 'Review Report';
        actionColor = 'warning';
        break;
      case 'BILLING':
        actionLabel = 'Collect Payment';
        actionColor = 'success';
        break;
      case 'DONE':
        actionLabel = 'View Details';
        actionColor = 'secondary';
        break;
    }
  }

  const getButtonClass = () => {
    switch (actionColor) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs';
      case 'secondary':
      default:
        return 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs';
    }
  };

  return (
    <div
      id={`patient-card-${patient.id}`}
      onClick={() => onOpenDetail(patient)}
      className="group relative bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 hover:border-blue-300/80 p-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ring-1 ring-slate-900/5"
    >
      {/* Top Header: Identity & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Fully Rounded / Circle Patient Avatar Photo */}
          <div className="relative shrink-0">
            {patient.avatarUrl ? (
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs border border-slate-200/90"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 tracking-tight bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-2 ring-white shadow-2xs"
              >
                {patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                patient.arrivalStatus === 'ARRIVED' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={`Arrival: ${patient.arrivalStatus}`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                {patient.name}
              </h4>

              {/* Patient's Age and Gender subtle pill for quick identification */}
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-full shadow-2xs shrink-0 whitespace-nowrap"
                title={`Age: ${patient.age} years | Gender: ${patient.gender}`}
              >
                <span>{patient.age} Y</span>
                <span className="text-slate-300">•</span>
                <span>{patient.gender}</span>
              </span>

              {patient.hasNewReportAlert && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-300/80 shadow-2xs"
                  title="New laboratory report uploaded"
                >
                  <BellRing className="w-3 h-3 text-amber-700 animate-bounce" />
                  <span className="hidden sm:inline">Report</span>
                </span>
              )}
              {patient.isPriority && (
                <span className="bg-amber-50 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-amber-300">
                  STAT
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-medium">{patient.patientNumber}</span>
              <span>•</span>
              <span className="font-semibold text-slate-600">{patient.visitType}</span>
            </div>
          </div>
        </div>

        {/* Global Active Status Badge */}
        <span
          className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusBadgeStyle(
            patient.status
          )}`}
        >
          {patient.status}
        </span>
      </div>

      {/* Center Details: Appointment Time, Mode & Assigned Doctor */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-semibold text-slate-700">{patient.appointmentTime}</span>
          <span className="text-[10px] text-slate-400">({patient.appointmentType === 'Online Appointment' ? 'Online' : 'Walk-in'})</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-600">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-slate-700 font-semibold">{patient.doctorName.split(' ')[1] || patient.doctorName}</span>
        </div>
      </div>

      {/* Special contextual highlights depending on stage */}
      {patient.status === 'CHECK-IN' && (
        <div className="mt-3 p-2 bg-slate-50/90 rounded-xl border border-slate-200/80 grid grid-cols-3 gap-1 text-[11px]">
          {/* 1. Form */}
          <div
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-lg border font-semibold transition-colors ${
              isFormDone
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
            title={isFormDone ? 'Form Completed' : 'Form Pending'}
          >
            <span>Form</span>
            {isFormDone ? (
              <span className="font-extrabold text-emerald-700 text-xs">✓</span>
            ) : (
              <span className="text-slate-300 text-[10px]">○</span>
            )}
          </div>

          {/* 2. Vitals */}
          <div
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-lg border font-semibold transition-colors ${
              isVitalsDone
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
            title={isVitalsDone ? 'Vitals Completed' : 'Vitals Pending'}
          >
            <span>Vitals</span>
            {isVitalsDone ? (
              <span className="font-extrabold text-emerald-700 text-xs">✓</span>
            ) : (
              <span className="text-slate-300 text-[10px]">○</span>
            )}
          </div>

          {/* 3. Records */}
          <div
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-lg border font-semibold transition-colors ${
              isRecordsDone
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
            title={isRecordsDone ? 'Records Completed' : 'Records Pending'}
          >
            <span>Records</span>
            {isRecordsDone ? (
              <span className="font-extrabold text-emerald-700 text-xs">✓</span>
            ) : (
              <span className="text-slate-300 text-[10px]">○</span>
            )}
          </div>
        </div>
      )}

      {patient.status === 'ASSESSMENT' && (
        <div className="mt-3 bg-blue-50/70 rounded-xl p-3 border border-blue-100/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-medium flex items-center gap-1 ${
                patient.assessment.subjectiveCompleted ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              Subj {patient.assessment.subjectiveCompleted ? '✓' : '○'}
            </span>
            <span className="text-slate-300">•</span>
            <span
              className={`text-[11px] font-medium flex items-center gap-1 ${
                patient.assessment.objectiveCompleted ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              Obj {patient.assessment.objectiveCompleted ? '✓' : '○'}
            </span>
          </div>
          <span className="text-[10px] text-blue-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-blue-200/70">
            MA
          </span>
        </div>
      )}

      {patient.status === 'HOLD ON' && patient.holdReason && (
        <div className="mt-3 bg-amber-50/80 rounded-xl p-3 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate font-medium">{patient.holdReason}</span>
        </div>
      )}

      {patient.status === 'BILLING' && (
        <div className="mt-3 bg-blue-50/80 rounded-xl p-3 border border-blue-100 flex items-center justify-between text-xs">
          <span className="text-blue-900 font-semibold text-[11px]">Total Amount Due</span>
          <span className="font-extrabold text-blue-900 text-sm">₹{patient.billing.totalAmount.toLocaleString()}</span>
        </div>
      )}

      {/* Real-Time Subtle Visual Alert: Ringing Bell for Uploaded Laboratory Reports */}
      {patient.hasNewReportAlert && (
        <div
          id={`lab-report-alert-${patient.id}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenReportAlert) {
              onOpenReportAlert(patient);
            } else {
              onOpenDetail(patient);
            }
          }}
          className="mt-3 bg-amber-50/95 hover:bg-amber-100/90 text-amber-950 border border-amber-300/85 rounded-xl p-3 flex items-center justify-between text-xs shadow-2xs transition-all cursor-pointer group/alert animate-in fade-in duration-200"
          title="Laboratory reports uploaded! Click to review report details."
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-200/90 flex items-center justify-center text-amber-800 shrink-0">
              <BellRing className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[11px] text-amber-950">Lab Report Ready</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </div>
              <span className="text-[10px] text-amber-800 font-semibold truncate max-w-[140px] block">
                {patient.labReportAlerts?.[0]?.reportName || 'Diagnostic Test Result'}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200 group-hover/alert:bg-amber-600 group-hover/alert:text-white transition-colors shrink-0 shadow-2xs">
            Review Report
          </span>
        </div>
      )}

      {/* Bottom Footer: Waiting Time & Quick Action */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200/70 rounded-lg px-2 py-0.5 text-[11px] text-slate-600 font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Wait: <strong className="text-slate-700">{patient.waitingTimeMinutes}m</strong></span>
        </div>

        {patient.status === 'CHECK-IN' && !hideQuickAction ? (
          <div className="flex items-center gap-1.5">
            <button
              id={`quick-checkin-${patient.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCheckIn) {
                  onCheckIn(patient);
                } else if (onQuickAction) {
                  onQuickAction(patient, e);
                } else {
                  onOpenDetail(patient);
                }
              }}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-50/90 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-2xs"
            >
              Check-In
            </button>
            <button
              id={`quick-send-assessment-${patient.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSendToAssessment) {
                  onSendToAssessment(patient.id);
                } else if (onQuickAction) {
                  onQuickAction(patient, e);
                } else {
                  onOpenDetail(patient);
                }
              }}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
            >
              Send to Assessment
            </button>
          </div>
        ) : !hideQuickAction ? (
          <button
            id={`quick-action-${patient.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickAction) {
                onQuickAction(patient, e);
              } else {
                onOpenDetail(patient);
              }
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${getButtonClass()}`}
          >
            {actionLabel === 'Call Patient' && <PhoneCall className="w-3 h-3 mr-0.5" />}
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
