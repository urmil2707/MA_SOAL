import React, { useState } from 'react';
import {
  Stethoscope,
  Clock,
  PhoneCall,
  UserCheck,
  FlaskConical,
  CreditCard,
  AlertCircle,
  Play,
  Calendar,
  Activity,
  CheckCircle2,
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Check,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Doctor, Patient } from '../types';

interface DoctorsQueueColumnsViewProps {
  doctors: Doctor[];
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onCallPatient: (patientId: string, doctorId: string) => void;
  onStartConsultation: (patientId: string, doctorId: string) => void;
  onDoctorOrderInvestigation: (patientId: string) => void;
  onDoctorFinishToBilling: (patientId: string) => void;
  onOpenCalendar?: (doctorId: string) => void;
  selectedDoctorId?: string;
  onDoctorChange?: (doctorId: string) => void;
  searchQuery?: string;
}

export const DoctorsQueueColumnsView: React.FC<DoctorsQueueColumnsViewProps> = ({
  doctors,
  patients,
  onOpenDetail,
  onCallPatient,
  onStartConsultation,
  onDoctorOrderInvestigation,
  onDoctorFinishToBilling,
  onOpenCalendar,
  selectedDoctorId = 'all',
  onDoctorChange,
  searchQuery = '',
}) => {
  // Filter doctors based on selection
  const visibleDoctors =
    selectedDoctorId === 'all'
      ? doctors
      : doctors.filter((d) => d.id === selectedDoctorId);

  // Total active consultation and queue count
  const consultingCount = patients.filter((p) => p.status === 'IN CONSULTATION').length;
  const inQueueCount = patients.filter((p) => p.status === 'IN QUEUE').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* DOCTORS MULTI-COLUMN CONTAINER (ONE COLUMN PER DOCTOR) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-1">
        <div
          className={`grid h-full gap-3.5 ${
            visibleDoctors.length === 1
              ? 'grid-cols-1 max-w-2xl mx-auto'
              : visibleDoctors.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
          style={{ minWidth: visibleDoctors.length > 2 ? '960px' : undefined }}
        >
          {visibleDoctors.map((doctor) => {
            // Find patient in consultation for this doctor
            const consultingPatient = patients.find(
              (p) => p.doctorAssignedId === doctor.id && p.status === 'IN CONSULTATION'
            );

            // Find patients in queue for this doctor
            let waitingQueue = patients.filter(
              (p) => p.doctorAssignedId === doctor.id && p.status === 'IN QUEUE'
            );

            // If search query is applied, filter the queued patients
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              waitingQueue = waitingQueue.filter(
                (p) =>
                  p.name.toLowerCase().includes(q) ||
                  (p.patientNumber || p.patientIdNumber || '').toLowerCase().includes(q) ||
                  p.mobile.includes(q) ||
                  p.appointmentTime.toLowerCase().includes(q) ||
                  (p.assessment?.chiefComplaint || '').toLowerCase().includes(q)
              );
            }

            // Abnormal vitals for consulting patient
            const consultingHighBP =
              consultingPatient?.vitals &&
              (consultingPatient.vitals.bpSystolic >= 140 || consultingPatient.vitals.bpDiastolic >= 90);

            return (
              <div
                key={doctor.id}
                className="h-full flex flex-col bg-white/75 hover:bg-white/85 backdrop-blur-xl rounded-2xl border border-white/90 shadow-xs ring-1 ring-slate-900/5 overflow-hidden transition-all duration-150"
              >
                {/* ========================================================= */}
                {/* DOCTOR COLUMN HEADER (Avatar, Room, Specialty, Call Next) */}
                {/* ========================================================= */}
                <div className="p-3 bg-white/80 backdrop-blur-md border-b border-white/70 flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-xs border border-slate-200/90"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white ${
                          consultingPatient ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                        title={consultingPatient ? 'Consultation In Progress' : 'Doctor Available'}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-xs truncate">
                          {doctor.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded-md">
                          {doctor.roomNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {doctor.specialty} •{' '}
                        <strong className="text-amber-800 font-bold">
                          {waitingQueue.length} Waiting
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onOpenCalendar && (
                      <button
                        type="button"
                        onClick={() => onOpenCalendar(doctor.id)}
                        className="p-1.5 rounded-lg text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs"
                        title={`View ${doctor.name}'s Schedule`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {waitingQueue.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onCallPatient(waitingQueue[0].id, doctor.id)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 hover:bg-amber-200 rounded-lg border border-amber-300 transition-all cursor-pointer shadow-2xs"
                        title="Summon next waiting patient"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call Next</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* COLUMN BODY: TOP IN CONSULTATION + LOWER WAITING QUEUE    */}
                {/* ========================================================= */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3.5 flex flex-col">
                  {/* ------------------------------------------------------- */}
                  {/* 1. TOP POSITION: IN CONSULTATION                        */}
                  {/* ------------------------------------------------------- */}
                  <div className="shrink-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center justify-between mb-1.5 px-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>IN CONSULTATION</span>
                      </span>
                      {consultingPatient && (
                        <span className="text-[9px] font-semibold text-emerald-700 font-mono">
                          Started: {consultingPatient.consultationStartTime || '11:05 AM'}
                        </span>
                      )}
                    </div>

                    {consultingPatient ? (
                      <div
                        onClick={() => onOpenDetail(consultingPatient)}
                        className="bg-emerald-50/90 hover:bg-emerald-50 backdrop-blur-md rounded-2xl p-3 border border-emerald-300 shadow-2xs space-y-2 cursor-pointer transition-all ring-1 ring-emerald-500/20 hover:border-emerald-400 group"
                      >
                        {/* Header: Avatar, Name, Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {consultingPatient.avatarUrl ? (
                              <img
                                src={consultingPatient.avatarUrl}
                                alt={consultingPatient.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs border border-emerald-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0 ring-2 ring-white">
                                {consultingPatient.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-xs group-hover:text-emerald-800 transition-colors truncate">
                                  {consultingPatient.name}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                                  ({consultingPatient.age} Y • {consultingPatient.gender})
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-emerald-800 bg-white/90 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-emerald-600" />
                                  {consultingPatient.appointmentTime || consultingPatient.form?.timeSlot || '11:00 AM'}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-slate-500">
                                  {consultingPatient.patientNumber || consultingPatient.patientIdNumber}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs shrink-0">
                            Active
                          </span>
                        </div>

                        {/* Chief complaint */}
                        <div className="text-[11px] bg-white/80 rounded-xl p-2 border border-emerald-200/70">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Chief Complaint
                          </span>
                          <span className="text-slate-800 font-semibold line-clamp-1">
                            {consultingPatient.assessment?.chiefComplaint ||
                              'General consultation & review'}
                          </span>
                        </div>

                        {/* Vitals Mini-Strip if available */}
                        {consultingPatient.vitals && (
                          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                            <div className="bg-white/90 rounded p-1 border border-emerald-100">
                              <span className="text-[8px] text-slate-400 block font-sans">BP</span>
                              <span className={`font-bold ${consultingHighBP ? 'text-rose-600' : 'text-slate-800'}`}>
                                {consultingPatient.vitals.bpSystolic}/{consultingPatient.vitals.bpDiastolic}
                              </span>
                            </div>
                            <div className="bg-white/90 rounded p-1 border border-emerald-100">
                              <span className="text-[8px] text-slate-400 block font-sans">HR</span>
                              <span className="font-bold text-slate-800">
                                {consultingPatient.vitals.pulse}
                              </span>
                            </div>
                            <div className="bg-white/90 rounded p-1 border border-emerald-100">
                              <span className="text-[8px] text-slate-400 block font-sans">SpO2</span>
                              <span className="font-bold text-slate-800">
                                {consultingPatient.vitals.spo2}%
                              </span>
                            </div>
                            <div className="bg-white/90 rounded p-1 border border-emerald-100">
                              <span className="text-[8px] text-slate-400 block font-sans">BMI</span>
                              <span className="font-bold text-blue-700">
                                {consultingPatient.bodyComposition?.bmi || 24.2}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Doctor Next Actions: Investigation vs Billing */}
                        <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDoctorOrderInvestigation(consultingPatient.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-bold text-blue-800 bg-white hover:bg-blue-50 rounded-xl border border-blue-200 transition-all shadow-2xs cursor-pointer"
                            title="Order Diagnostic Laboratory / Radiology Tests"
                          >
                            <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                            <span>Order Tests</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDoctorFinishToBilling(consultingPatient.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Conclude Consultation and Route to Billing & Checkout"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Finish to Billing</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/50 backdrop-blur-xs rounded-2xl border border-dashed border-slate-300 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                          No active consultation. Doctor is available.
                        </p>
                        {waitingQueue.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onStartConsultation(waitingQueue[0].id, doctor.id)}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Start Consult with #{1} ({waitingQueue[0].name.split(' ')[0]})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ------------------------------------------------------- */}
                  {/* 2. LOWER SECTION: IN QUEUE                              */}
                  {/* ------------------------------------------------------- */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between mb-1.5 px-0.5">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>IN QUEUE ({waitingQueue.length})</span>
                      </span>
                      <span className="text-[9px] font-medium text-slate-400">
                        Ordered by Booking & Transfer
                      </span>
                    </div>

                    {waitingQueue.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-white/40 backdrop-blur-xs rounded-2xl border border-dashed border-slate-200/80 my-auto">
                        Queue is empty. No patients waiting.
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto pr-0.5 flex-1 max-h-[360px]">
                        {waitingQueue.map((pat, idx) => (
                          <div
                            key={pat.id}
                            onClick={() => onOpenDetail(pat)}
                            className="p-2.5 bg-white/90 hover:bg-white backdrop-blur-xs rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2 group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Patient photo avatar (number removed beside photo) */}
                              {pat.avatarUrl ? (
                                <img
                                  src={pat.avatarUrl}
                                  alt={pat.name}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-2xs border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 ring-2 ring-white shadow-2xs">
                                  {pat.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                    {pat.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                                    ({pat.age} Y • {pat.gender})
                                  </span>
                                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md border border-blue-200/60 flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3 text-blue-500" />
                                    {pat.appointmentTime || pat.form?.timeSlot || '10:30 AM'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[210px] mt-0.5 flex items-center gap-1.5">
                                  <span className="font-medium text-slate-700 truncate">
                                    {pat.assessment?.chiefComplaint || pat.form?.reasonOfVisit || 'Routine Checkup'}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-500 font-medium shrink-0">
                                    {pat.appointmentType || 'Scheduled'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Patient Waiting Time (Replaces the individual Call button; Call Next is preserved in column header) */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div
                                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border shadow-2xs ${
                                  (pat.waitingTimeMinutes || 0) >= 20
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : (pat.waitingTimeMinutes || 0) >= 10
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                                title={`Patient waiting time: ${pat.waitingTimeMinutes || 0} minutes`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{pat.waitingTimeMinutes || 0}m wait</span>
                              </div>

                              {idx === 0 && !consultingPatient && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartConsultation(pat.id, doctor.id);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer"
                                  title="Promote patient to In Consultation"
                                >
                                  <Play className="w-2.5 h-2.5 fill-white" />
                                  <span>Start</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
