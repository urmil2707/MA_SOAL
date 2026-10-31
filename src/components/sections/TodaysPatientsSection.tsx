import React, { useState } from 'react';
import { Users, UserCheck, Clock, Filter, CheckCircle2 } from 'lucide-react';
import { Patient, SectionLayoutConfig } from '../../types';
import { SectionWrapper } from './SectionWrapper';
import { PatientCard } from '../PatientCard';

interface TodaysPatientsSectionProps {
  section: SectionLayoutConfig;
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onOpenReportAlert?: (patient: Patient) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
  onQuickAction?: (patient: Patient) => void;
}

export const TodaysPatientsSection: React.FC<TodaysPatientsSectionProps> = ({
  section,
  patients,
  onOpenDetail,
  onOpenReportAlert,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
  onQuickAction,
}) => {
  const [activeTab, setActiveTab] = useState<'in_clinic' | 'all'>('in_clinic');
  const [filterType, setFilterType] = useState<'all' | 'arrived' | 'not_arrived' | 'completed'>('all');

  // In Clinic = Patients with status other than DONE and arrivalStatus === ARRIVED
  const inClinicPatients = patients.filter(
    (p) => p.arrivalStatus === 'ARRIVED' && p.status !== 'DONE'
  );

  // All Patients filter
  const filteredAllPatients = patients.filter((p) => {
    if (filterType === 'arrived') return p.arrivalStatus === 'ARRIVED' && p.status !== 'DONE';
    if (filterType === 'not_arrived') return p.arrivalStatus === 'NOT_ARRIVED';
    if (filterType === 'completed') return p.status === 'DONE';
    return true;
  });

  const displayList = activeTab === 'in_clinic' ? inClinicPatients : filteredAllPatients;

  return (
    <SectionWrapper
      section={section}
      badgeCount={inClinicPatients.length}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('in_clinic')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
              activeTab === 'in_clinic'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Clinic ({inClinicPatients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
              activeTab === 'all'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({patients.length})
          </button>
        </div>
      }
    >
      {/* Sub-filters if in All Patients view */}
      {activeTab === 'all' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {[
            { id: 'all', label: 'All' },
            { id: 'arrived', label: 'Arrived' },
            { id: 'not_arrived', label: 'Not Arrived' },
            { id: 'completed', label: 'Completed (Done)' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
                filterType === f.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Summary Bento Chips for In Clinic Status Breakdown */}
      {activeTab === 'in_clinic' && (
        <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/80 ring-1 ring-slate-900/5 text-[11px] grid grid-cols-4 gap-1.5 text-center shadow-2xs">
          <div className="bg-slate-50/80 rounded-xl py-1.5 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold">Check-in</span>
            <span className="font-extrabold text-blue-600 text-xs">
              {inClinicPatients.filter((p) => p.status === 'CHECK-IN').length}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl py-1.5 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold">Assessment</span>
            <span className="font-extrabold text-blue-600 text-xs">
              {inClinicPatients.filter((p) => p.status === 'ASSESSMENT').length}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl py-1.5 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold">Doctor</span>
            <span className="font-extrabold text-emerald-600 text-xs">
              {inClinicPatients.filter((p) => ['IN QUEUE', 'IN CONSULTATION'].includes(p.status)).length}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl py-1.5 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold">Billing</span>
            <span className="font-extrabold text-blue-600 text-xs">
              {inClinicPatients.filter((p) => p.status === 'BILLING').length}
            </span>
          </div>
        </div>
      )}

      {/* Patients Card List */}
      <div className="space-y-3 flex-1">
        {displayList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No patients match current filter.
          </div>
        ) : (
          displayList.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onOpenDetail={onOpenDetail}
              onOpenReportAlert={onOpenReportAlert}
              onQuickAction={(p) => {
                if (onQuickAction) onQuickAction(p);
                else onOpenDetail(p);
              }}
            />
          ))
        )}
      </div>
    </SectionWrapper>
  );
};
