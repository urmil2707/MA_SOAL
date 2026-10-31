import React from 'react';
import { Stethoscope, CheckCircle2, Circle, ShieldAlert, Sparkles } from 'lucide-react';
import { Patient, SectionLayoutConfig } from '../../types';
import { SectionWrapper } from './SectionWrapper';

interface AssessmentSectionProps {
  section: SectionLayoutConfig;
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onSendToDoctor: (patientId: string) => void;
  onToggleMaAssessment: (patientId: string, type: 'subjective' | 'objective') => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
}

export const AssessmentSection: React.FC<AssessmentSectionProps> = ({
  section,
  patients,
  onOpenDetail,
  onSendToDoctor,
  onToggleMaAssessment,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
}) => {
  const assessmentPatients = patients.filter((p) => p.status === 'ASSESSMENT');

  return (
    <SectionWrapper
      section={section}
      badgeCount={assessmentPatients.length}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          MA Responsibility
        </span>
      }
    >
      {/* Information Header in Bento Style */}
      <div className="bg-blue-50/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 text-[11px] text-blue-900 flex items-center justify-between shadow-2xs">
        <div>
          <span className="font-bold block text-blue-950">Medical Assistant Station</span>
          <span className="text-slate-600 text-[10px]">Subjective & Objective Evaluation</span>
        </div>
        <span className="text-[10px] text-slate-500 font-bold bg-white/80 px-2 py-0.5 rounded-lg border border-white/80 shadow-2xs">
          Reception Visibility
        </span>
      </div>

      {/* Patient Cards in Assessment */}
      <div className="space-y-4 flex-1">
        {assessmentPatients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-white/80">
            No patients currently in MA Assessment.
          </div>
        ) : (
          assessmentPatients.map((patient) => {
            const isSubj = patient.assessment.subjectiveCompleted;
            const isObj = patient.assessment.objectiveCompleted;
            const isReadyForDoctor = isSubj && isObj;

            return (
              <div
                key={patient.id}
                onClick={() => onOpenDetail(patient)}
                className="bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-3 shadow-xs hover:shadow-md space-y-3 hover:border-blue-300/80 transition-all cursor-pointer ring-1 ring-slate-900/5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {patient.avatarUrl ? (
                      <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{patient.name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">({patient.age} Y • {patient.gender})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {patient.patientNumber} • {patient.doctorName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    ASSESSMENT
                  </span>
                </div>

                {/* Complaint Summary */}
                <div className="bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-white/80 text-xs shadow-2xs">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Chief Complaint</span>
                  <span className="text-slate-800 font-semibold truncate block mt-0.5">
                    {patient.assessment.chiefComplaint || 'General clinical review'}
                  </span>
                </div>

                {/* Subjective & Objective Status Tags (Section 13) in Bento Style */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMaAssessment(patient.id, 'subjective');
                    }}
                    title="Click to toggle Subjective assessment (MA Simulation)"
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all shadow-2xs ${
                      isSubj
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-white/70 backdrop-blur-xs border-white/80 text-slate-500 hover:bg-white/90'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">Subjective</span>
                    {isSubj ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">Pending</span>
                    )}
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMaAssessment(patient.id, 'objective');
                    }}
                    title="Click to toggle Objective assessment (MA Simulation)"
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all shadow-2xs ${
                      isObj
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-white/70 backdrop-blur-xs border-white/80 text-slate-500 hover:bg-white/90'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">Objective</span>
                    {isObj ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-amber-600 font-bold text-[10px]">Pending</span>
                    )}
                  </div>
                </div>

                {/* Send to Doctor Action (Section 14: Operational Override) */}
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
                    id={`send-to-doctor-btn-${patient.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToDoctor(patient.id);
                    }}
                    className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-xl transition-all shadow-2xs ${
                      isReadyForDoctor
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                    title={
                      isReadyForDoctor
                        ? 'Send Patient to Doctor Queue'
                        : 'Operational Override: Send to Doctor even if MA assessment in progress'
                    }
                  >
                    <span>Send to Doctor</span>
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
