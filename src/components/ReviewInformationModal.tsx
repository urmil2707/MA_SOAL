import React from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  User,
  Activity,
  Upload,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  Phone,
  Clock,
} from 'lucide-react';
import { Patient } from '../types';
import { formatExtractedScanDate, formatUploadedOnDate } from './PatientJourneyTimeline';

interface ReviewInformationModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  updatesLog?: string[];
}

export const ReviewInformationModal: React.FC<ReviewInformationModalProps> = ({
  patient,
  isOpen,
  onClose,
  onApprove,
  updatesLog = [],
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/90 via-sky-50/50 to-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Review Patient Information
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Verify newly filled or updated registration data, vitals, and diagnostic records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs scrollbar-thin">
          {/* Recent Updates Banner */}
          {updatesLog.length > 0 && (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
                Recently Recorded Updates ({updatesLog.length})
              </span>
              <ul className="space-y-1">
                {updatesLog.map((log, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-800 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                    <span>{log}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Demographics & Registration Review */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient Demographics & Contact</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600">
                PID-{patient.patientNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{patient.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Age & Gender</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {patient.age} Y • {patient.gender}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Mobile</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block font-mono">{patient.mobile}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Blood Group</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{patient.form?.bloodGroup || 'A+'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Address</span>
              <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                {patient.form?.address || 'Paldi, Ahmedabad'} • {patient.form?.city || 'Ahmedabad, Gujarat'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Emergency Contact</span>
              <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                {patient.form?.emergencyContactName || 'Family Contact'} ({patient.form?.emergencyContactRelation || 'Spouse'}):{' '}
                <strong className="font-mono text-slate-900">{patient.form?.emergencyContactMobile || patient.mobile}</strong>
              </span>
            </div>
          </div>

          {/* Section 2: Vitals & Hemodynamics Review */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recorded Vitals & Hemodynamics</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Hemodynamics Verified
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 block">Blood Pressure</span>
                <span className="font-black text-slate-900 text-sm mt-0.5 block">
                  {patient.vitals?.bpSystolic}/{patient.vitals?.bpDiastolic} mmHg
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 block">Pulse / Heart Rate</span>
                <span className="font-black text-slate-900 text-sm mt-0.5 block">
                  {patient.vitals?.pulse} bpm
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 block">SpO2 Saturation</span>
                <span className="font-black text-slate-900 text-sm mt-0.5 block">
                  {patient.vitals?.spo2}%
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 block">Weight & BMI</span>
                <span className="font-black text-slate-900 text-sm mt-0.5 block">
                  {patient.bodyComposition?.weightKg} kg (BMI {patient.bodyComposition?.bmi})
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Uploaded Records Review */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Uploaded Diagnostic Records ({patient.uploadedRecords?.length || 0})</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Sorted by Extracted Date
              </span>
            </div>

            <div className="space-y-1.5">
              {patient.uploadedRecords && patient.uploadedRecords.length > 0 ? (
                patient.uploadedRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {rec.category}
                        </span>
                        <span className="font-bold text-slate-900">{rec.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Extracted Date: <strong className="text-slate-700">{formatExtractedScanDate(rec.scanDate)}</strong> • {formatUploadedOnDate(rec.uploadedAt)}
                      </div>
                    </div>
                    {rec.isCritical && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-full">
                        Critical
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-slate-400 italic">No records uploaded yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <span className="text-[11px] text-slate-500 font-medium">
            Verified by: <strong>Receptionist (Priya Shah)</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Approve & Mark Information as Verified</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
