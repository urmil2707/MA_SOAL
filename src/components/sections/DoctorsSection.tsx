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
} from 'lucide-react';
import { Doctor, Patient, SectionLayoutConfig } from '../../types';
import { SectionWrapper } from './SectionWrapper';
import { PatientCard } from '../PatientCard';

interface DoctorsSectionProps {
  section: SectionLayoutConfig;
  doctors: Doctor[];
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onCallPatient: (patientId: string, doctorId: string) => void;
  onStartConsultation: (patientId: string, doctorId: string) => void;
  onDoctorOrderInvestigation: (patientId: string) => void;
  onDoctorFinishToBilling: (patientId: string) => void;
  onOpenCalendar?: (doctorId: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
  selectedDoctorFilter?: string;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({
  section,
  doctors,
  patients,
  onOpenDetail,
  onCallPatient,
  onStartConsultation,
  onDoctorOrderInvestigation,
  onDoctorFinishToBilling,
  onOpenCalendar,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
  selectedDoctorFilter = 'all',
}) => {
  // Collapsed state per doctor
  const [collapsedDoctors, setCollapsedDoctors] = useState<Record<string, boolean>>({});

  const toggleCollapse = (docId: string) => {
    setCollapsedDoctors((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  // Filter doctors if selected in header
  const visibleDoctors =
    selectedDoctorFilter === 'all'
      ? doctors
      : doctors.filter((d) => d.id === selectedDoctorFilter);

  // Total active doctor queue count (In Queue + In Consultation)
  const totalDoctorPatients = patients.filter((p) =>
    ['IN QUEUE', 'IN CONSULTATION'].includes(p.status)
  ).length;

  return (
    <SectionWrapper
      section={section}
      badgeCount={totalDoctorPatients}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50/90 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
          Queues & Consultations
        </div>
      }
    >
      <div className="space-y-3.5 flex-1">
        {visibleDoctors.map((doctor) => {
          const isCollapsed = collapsedDoctors[doctor.id];

          // Patients for this doctor
          const consultingPatient = patients.find(
            (p) => p.doctorAssignedId === doctor.id && p.status === 'IN CONSULTATION'
          );

          const waitingQueue = patients.filter(
            (p) => p.doctorAssignedId === doctor.id && p.status === 'IN QUEUE'
          );

          return (
            <div
              key={doctor.id}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs overflow-hidden ring-1 ring-slate-900/5"
            >
              {/* Collapsible Doctor Group Header (Section 15) in Bento Style */}
              <div
                onClick={() => toggleCollapse(doctor.id)}
                className="px-4 py-3 bg-white/60 backdrop-blur-md border-b border-white/60 flex items-center justify-between cursor-pointer hover:bg-white/80 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-9 h-9 rounded-xl object-cover border border-white/80 shadow-2xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">{doctor.name}</h4>
                      <span className="text-[10px] font-bold text-slate-600 bg-white/80 border border-white/80 px-2 py-0.5 rounded-md">
                        {doctor.roomNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {doctor.specialty} •{' '}
                      <span className="text-amber-700 font-bold">{waitingQueue.length} Waiting</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Doctor Calendar & Slot Booking Button */}
                  {onOpenCalendar && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCalendar(doctor.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/80 px-2.5 py-1 rounded-xl transition-all shadow-2xs cursor-pointer"
                      title={`View ${doctor.name}'s Calendar Schedule & Time Slots`}
                    >
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span className="hidden sm:inline">Schedule</span>
                    </button>
                  )}

                  {/* Receptionist Quick Action: Call Next Patient (Section 18) */}
                  {waitingQueue.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCallPatient(waitingQueue[0].id, doctor.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-all shadow-2xs"
                      title="Reception Operational Action: Call Next Waiting Patient"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Next ({waitingQueue[0].name.split(' ')[0]})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Group Body: In Consultation & Waiting Queue */}
              {!isCollapsed && (
                <div className="p-3.5 space-y-3 bg-white/30 backdrop-blur-sm">
                  {/* 1. CURRENTLY CONSULTING (Section 17) */}
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Currently Consulting
                    </div>

                    {consultingPatient ? (
                      <div
                        onClick={() => onOpenDetail(consultingPatient)}
                        className="bg-emerald-50/80 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs space-y-2.5 cursor-pointer hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            {consultingPatient.avatarUrl ? (
                              <img
                                src={consultingPatient.avatarUrl}
                                alt={consultingPatient.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs border border-emerald-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ring-2 ring-white">
                                {consultingPatient.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{consultingPatient.name}</span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                  ({consultingPatient.age} Y • {consultingPatient.gender})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {consultingPatient.patientNumber} • Started:{' '}
                                {consultingPatient.consultationStartTime || '11:05 AM'}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                            IN CONSULTATION
                          </span>
                        </div>

                        {/* Doctor Next Actions: Investigation vs Billing (Sections 19, 25) */}
                        <div className="pt-2.5 border-t border-emerald-200/60 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDoctorOrderInvestigation(consultingPatient.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-[11px] font-bold text-blue-800 bg-white/90 hover:bg-white rounded-xl border border-blue-200 transition-all shadow-2xs"
                            title="Doctor orders diagnostic tests: Moves patient to Investigation & Therapy"
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
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs"
                            title="Complete Consultation without further tests: Moves patient to Billing & Checkout"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Finish to Billing</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-white/60 backdrop-blur-xs rounded-2xl border border-dashed border-white/80 text-center text-xs text-slate-400">
                        Doctor is currently available. No active consultation.
                      </div>
                    )}
                  </div>

                  {/* 2. WAITING QUEUE (Section 16) */}
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1.5">
                      <span>Waiting in Queue ({waitingQueue.length})</span>
                      <span className="text-[9px] font-medium text-slate-400">Sorted by Booking Order</span>
                    </div>

                    {waitingQueue.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-xs rounded-xl border border-dashed border-white/80">
                        Queue is empty.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {waitingQueue.map((pat, idx) => (
                          <div
                            key={pat.id}
                            onClick={() => onOpenDetail(pat)}
                            className="group flex items-center justify-between gap-2 p-2.5 bg-white/90 hover:bg-white border border-slate-200/70 hover:border-blue-400/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Avatar */}
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

                            {/* Patient Waiting Time (Replaces individual Call button; Call Next is in header) */}
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
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};
