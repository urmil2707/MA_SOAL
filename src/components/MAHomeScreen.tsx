import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  Search,
  Plus,
  Bell,
  BellRing,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Stethoscope,
  Users,
  CreditCard,
  Activity,
  Maximize2,
  Minimize2,
  Tablet,
  Heart,
  ChevronDown,
  Filter,
  FileText,
  Scale,
  Thermometer,
  Zap,
  ArrowRight,
  ClipboardCheck,
  Phone,
  Sparkles,
  Check,
  SlidersHorizontal,
  X,
  Send,
  Droplet,
  LogOut,
} from 'lucide-react';
import { Patient, Doctor, Gender, DetailedSymptom, MedicalRecordEntry, Vitals } from '../types';
import { PatientDetailModal } from './PatientDetailModal';
import { SymptomsIntakeModal } from './SymptomsIntakeModal';
import { MedicalHistoryIntakeModal } from './MedicalHistoryIntakeModal';
import { ClinicalIntakeScreen } from './ClinicalIntakeScreen';
import { DoctorsQueueColumnsView } from './DoctorsQueueColumnsView';
import { parseTimeString } from '../utils/previousAppointments';

type DetailTabType = 'overview' | 'vitals' | 'records' | 'symptoms' | 'history' | 'reports';

interface MAHomeScreenProps {
  patients: Patient[];
  doctors: Doctor[];
  onUpdatePatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  onSendToDoctor: (patientId: string) => void;
  onToggleMaAssessment?: (patientId: string, type: 'subjective' | 'objective') => void;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
  specialties: string[];
  selectedDoctorId: string;
  onDoctorChange: (doctorId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSwitchToReception?: () => void;
  onSwitchWorkspace?: (workspace: 'reception' | 'ma') => void;
  activeWorkspace?: 'reception' | 'ma';
  onStartConsultation?: (patientId: string, doctorId: string) => void;
  onDoctorOrderInvestigation?: (patientId: string) => void;
  onDoctorFinishToBilling?: (patientId: string) => void;
  onCallPatient?: (patientId: string, doctorId: string) => void;
  onOpenDoctorCalendar?: (doctorId: string) => void;
}

export const MAHomeScreen: React.FC<MAHomeScreenProps> = ({
  patients,
  doctors,
  onUpdatePatients,
  onSendToDoctor,
  onToggleMaAssessment,
  selectedBranch,
  onBranchChange,
  selectedSpecialty,
  onSpecialtyChange,
  specialties,
  selectedDoctorId,
  onDoctorChange,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  onSwitchToReception,
  onSwitchWorkspace,
  activeWorkspace = 'ma',
  onStartConsultation,
  onDoctorOrderInvestigation,
  onDoctorFinishToBilling,
  onCallPatient,
  onOpenDoctorCalendar,
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<'assessment' | 'transferred' | 'awaiting' | 'other_ma'>('assessment');
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Selected Patient for Detail View (opens exact same patient popup as in reception project)
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<DetailTabType>('overview');

  // Dedicated Full-Page Clinical Intake Screen State (Switches between Symptoms, Medical History, and Vitals without popups)
  const [activeIntakePatient, setActiveIntakePatient] = useState<{
    patient: Patient;
    tab: 'symptoms' | 'history' | 'vitals';
  } | null>(null);

  // Dedicated Symptoms Intake Modal State
  const [symptomsModalPatient, setSymptomsModalPatient] = useState<Patient | null>(null);

  // Dedicated Medical History Intake Modal State (matching screenshot with 6 groups)
  const [medicalHistoryModalPatient, setMedicalHistoryModalPatient] = useState<Patient | null>(null);

  // Quick Vitals Intake Modal State (for emergency MA vitals adjustment if needed)
  const [vitalsModalPatient, setVitalsModalPatient] = useState<Patient | null>(null);
  const [vitalsForm, setVitalsForm] = useState({
    bpSystolic: 120,
    bpDiastolic: 80,
    pulse: 72,
    temperature: 98.6,
    spo2: 99,
    respiratoryRate: 16,
    heightCm: 168,
    weightKg: 68,
    bmi: 24.1,
    chiefComplaint: '',
    symptomsDuration: 'Today',
    symptomSeverity: 'Mild' as 'Mild' | 'Moderate' | 'Severe',
    maNotes: '',
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const branchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setShowBranchMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available clinic branches
  const branches = [
    'Satyam Clinic, Paldi (Main)',
    'Satyam Health, Navrangpura',
    'Satyam Medicare, Vastrapur',
    'Satyam Clinic, Maninagar',
  ];

  // Helper: Open patient popup directly on chosen tab (symptoms, history, vitals, etc.)
  const handleOpenPatient = (patient: Patient, tab: DetailTabType = 'overview') => {
    setSelectedPatientForDetail(patient);
    setDetailModalInitialTab(tab);
  };

  // Auto calculate BMI in quick intake
  const handleHeightWeightChange = (field: 'heightCm' | 'weightKg', val: number) => {
    const updated = { ...vitalsForm, [field]: val };
    if (updated.heightCm > 0 && updated.weightKg > 0) {
      const heightM = updated.heightCm / 100;
      updated.bmi = Number((updated.weightKg / (heightM * heightM)).toFixed(1));
    }
    setVitalsForm(updated);
  };

  // Save Quick Vitals
  const handleSaveQuickVitals = (andRouteToDoctor = false) => {
    if (!vitalsModalPatient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    const updatedPatient: Patient = {
      ...vitalsModalPatient,
      status: andRouteToDoctor ? 'IN QUEUE' : 'ASSESSMENT',
      checkInModules: {
        ...vitalsModalPatient.checkInModules,
        vitals: true,
        bodyComposition: true,
      },
      vitals: {
        bpSystolic: Number(vitalsForm.bpSystolic),
        bpDiastolic: Number(vitalsForm.bpDiastolic),
        pulse: Number(vitalsForm.pulse),
        temperature: Number(vitalsForm.temperature),
        spo2: Number(vitalsForm.spo2),
        respiratoryRate: Number(vitalsForm.respiratoryRate),
        recordedAt: nowTime,
        recordedBy: 'Anjali Mehta, CMA (MA)',
      },
      bodyComposition: {
        ...vitalsModalPatient.bodyComposition,
        heightCm: Number(vitalsForm.heightCm),
        weightKg: Number(vitalsForm.weightKg),
        bmi: Number(vitalsForm.bmi),
        recordedAt: nowTime,
        recordedBy: 'Anjali Mehta, CMA (MA)',
      },
      assessment: {
        ...vitalsModalPatient.assessment,
        subjectiveCompleted: true,
        objectiveCompleted: true,
        chiefComplaint: vitalsForm.chiefComplaint || vitalsModalPatient.assessment.chiefComplaint,
        symptomsDuration: vitalsForm.symptomsDuration,
        symptomSeverity: vitalsForm.symptomSeverity,
        maNotes: vitalsForm.maNotes,
        assessedBy: 'Anjali Mehta, CMA',
        completedAt: nowTime,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: nowIso,
          timeDisplay: nowTime,
          action: andRouteToDoctor
            ? 'Vitals Recorded & Routed to Doctor Queue'
            : 'Vitals & Anthropometry Recorded by MA',
          performedBy: 'Anjali Mehta, CMA',
          role: 'MA',
          category: 'Assessment',
          details: `BP: ${vitalsForm.bpSystolic}/${vitalsForm.bpDiastolic} mmHg, HR: ${vitalsForm.pulse} bpm, SpO2: ${vitalsForm.spo2}%, BMI: ${vitalsForm.bmi}`,
        },
        ...vitalsModalPatient.activityTimeline,
      ],
    };

    onUpdatePatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    setVitalsModalPatient(null);

    if (andRouteToDoctor) {
      showToast(`Vitals recorded & ${updatedPatient.name} routed to Dr. ${updatedPatient.doctorName}'s queue`);
    } else {
      showToast(`Vitals updated for ${updatedPatient.name}`);
    }
  };

  // Save Symptoms from dedicated SymptomsIntakeModal
  const handleSaveSymptomsFromModal = (
    updatedSymptoms: DetailedSymptom[],
    suspectDiseaseVal?: string,
    maNotesVal?: string,
    routeToDoctor = false
  ) => {
    if (!symptomsModalPatient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: Patient = {
      ...symptomsModalPatient,
      status: routeToDoctor ? 'IN QUEUE' : 'ASSESSMENT',
      assessment: {
        ...symptomsModalPatient.assessment,
        detailedSymptoms: updatedSymptoms,
        suspectDisease: suspectDiseaseVal || symptomsModalPatient.assessment.suspectDisease,
        maNotes: maNotesVal !== undefined ? maNotesVal : symptomsModalPatient.assessment.maNotes,
        subjectiveCompleted: updatedSymptoms.length > 0,
        objectiveCompleted: true,
        assessedBy: 'Anjali Mehta, CMA (MA)',
        completedAt: nowTime,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: routeToDoctor
            ? 'Symptoms Evaluated & Patient Routed to Doctor Queue'
            : `Clinical Symptoms Recorded (${updatedSymptoms.length} symptoms logged)`,
          performedBy: 'Anjali Mehta, CMA',
          role: 'MA',
          category: 'Assessment',
          details: `Symptoms: ${updatedSymptoms.map((s) => `${s.name} (${s.severity})`).join(', ') || 'Asymptomatic review'}. Remarks: ${maNotesVal || 'None'}`,
        },
        ...symptomsModalPatient.activityTimeline,
      ],
    };

    onUpdatePatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSymptomsModalPatient(null);
    if (routeToDoctor) {
      showToast(`Symptoms saved & ${updated.name} routed to Dr. ${updated.doctorName}'s Queue!`);
    } else {
      showToast(`Symptoms intake saved for ${updated.name} (${updatedSymptoms.length} symptoms logged)`);
    }
  };

  // Save Medical History from dedicated MedicalHistoryIntakeModal (matching 6 clinical groups)
  const handleSaveMedicalHistoryFromModal = (
    updatedRecords: MedicalRecordEntry,
    routeToDoctor = false,
    maNotesVal?: string
  ) => {
    if (!medicalHistoryModalPatient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();
    const updated: Patient = {
      ...medicalHistoryModalPatient,
      status: routeToDoctor
        ? 'IN QUEUE'
        : medicalHistoryModalPatient.status === 'CHECK-IN'
        ? 'ASSESSMENT'
        : medicalHistoryModalPatient.status,
      waitingTimeMinutes: routeToDoctor ? 0 : medicalHistoryModalPatient.waitingTimeMinutes,
      medicalRecords: updatedRecords,
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: nowIso,
          timeDisplay: nowTime,
          action: routeToDoctor
            ? 'Medical History Recorded & Patient Routed to Doctor Queue'
            : 'Comprehensive Medical History Intake Recorded by MA',
          performedBy: 'Anjali Mehta, CMA',
          role: 'MA',
          category: 'Assessment',
          details: `6 groups verified (Family, Past medical, Surgeries, Habits, Medications & Allergies). Remarks: ${maNotesVal || 'None'}`,
        },
        ...medicalHistoryModalPatient.activityTimeline,
      ],
    };

    onUpdatePatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setMedicalHistoryModalPatient(null);
    if (routeToDoctor) {
      showToast(`Medical history saved & ${updated.name} routed to Dr. ${updated.doctorName}'s Queue!`);
    } else {
      showToast(`Medical history intake recorded for ${updated.name}`);
    }
  };

  // Save clinical intake from Full-Screen ClinicalIntakeScreen
  const handleSaveClinicalIntake = (
    updatedPatient: Patient,
    routeToDoctor: boolean
  ) => {
    onUpdatePatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    if (routeToDoctor) {
      onSendToDoctor(updatedPatient.id);
      showToast(
        `Intake complete & ${updatedPatient.name} routed to Dr. ${updatedPatient.doctorName}'s Queue!`
      );
    } else {
      showToast(`Clinical intake saved for ${updatedPatient.name}`);
    }
    setActiveIntakePatient(null);
  };

  // Check if a patient has filled all necessary intake data (Symptoms & Medical History)
  const isPatientIntakeComplete = (p: Patient): boolean => {
    // 1. Symptoms evaluation
    const hasSymptoms = Boolean(
      (p.assessment?.detailedSymptoms && p.assessment.detailedSymptoms.length > 0) ||
      (p.assessment?.subjectiveCompleted && p.assessment?.chiefComplaint)
    );

    // 2. Medical History evaluation (Family history, past medical, surgeries, allergies, medications, or declared no known history)
    const hasFamilyHistory = Boolean(
      (p.medicalRecords?.detailedFamilyHistory && p.medicalRecords.detailedFamilyHistory.length > 0) ||
      (p.medicalRecords?.familyHistory && p.medicalRecords.familyHistory.length > 0)
    );
    const hasPastHistory = Boolean(
      (p.medicalRecords?.pastMedicalConditions && p.medicalRecords.pastMedicalConditions.length > 0) ||
      (p.medicalRecords?.chronicConditions && p.medicalRecords.chronicConditions.length > 0)
    );
    const hasOtherMedHistory = Boolean(
      (p.medicalRecords?.detailedSurgeries && p.medicalRecords.detailedSurgeries.length > 0) ||
      (p.medicalRecords?.detailedAllergies && p.medicalRecords.detailedAllergies.length > 0) ||
      (p.medicalRecords?.detailedMedications && p.medicalRecords.detailedMedications.length > 0) ||
      p.medicalRecords?.noKnownMedicalHistoryDeclared
    );
    const hasMedHistory =
      hasFamilyHistory ||
      hasPastHistory ||
      hasOtherMedHistory ||
      Boolean(p.medicalRecords?.completed) ||
      Boolean(p.assessment?.objectiveCompleted);

    return hasSymptoms && hasMedHistory;
  };

  // Active MA Patients: Patients currently undergoing MA intake / assessment.
  // CRITICAL RULE: Once a patient is sent to the Doctor Queue ('IN QUEUE', 'IN CONSULTATION', etc.),
  // they are moved to the Doctor Queue and REMOVED from the active MA workstation.
  const isMaActive = (p: Patient): boolean =>
    p.status === 'CHECK-IN' || p.status === 'ASSESSMENT';

  // Classification subsets
  const activeMaPatients = patients.filter(isMaActive);

  const awaitingIntakePatients = activeMaPatients.filter(
    (p) => p.status === 'CHECK-IN' && p.arrivalStatus === 'ARRIVED'
  );
  const inAssessmentPatients = activeMaPatients.filter((p) => p.status === 'ASSESSMENT');
  const readyForDoctorPatients = activeMaPatients.filter(
    (p) => p.status === 'ASSESSMENT' && isPatientIntakeComplete(p)
  );
  const urgentPatients = activeMaPatients.filter(
    (p) =>
      (p.vitals && (p.vitals.bpSystolic >= 140 || p.vitals.temperature >= 100.4 || p.vitals.spo2 < 95)) ||
      p.assessment?.symptomSeverity === 'Severe'
  );
  const transferredToDoctorPatients = patients.filter(
    (p) => ['IN QUEUE', 'IN CONSULTATION'].includes(p.status)
  );

  // Filtered list based on Search & Active Tab
  const filteredPatients = patients.filter((p) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = (p.patientNumber || p.patientIdNumber || '').toLowerCase().includes(q);
      const matchMobile = p.mobile.includes(q);
      const matchTime = (p.appointmentTime || '').toLowerCase().includes(q);
      const matchComplaint = (p.assessment?.chiefComplaint || p.form?.reasonOfVisit || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchMobile && !matchTime && !matchComplaint) return false;
    }

    // Specialty filter
    if (selectedSpecialty !== 'All Specialties' && p.specialty !== selectedSpecialty) {
      return false;
    }

    // Doctor filter
    if (selectedDoctorId !== 'all' && p.doctorAssignedId !== selectedDoctorId) {
      return false;
    }

    // Tab filter: Transferred / Doctor Queue view
    if (activeTabFilter === 'transferred') {
      return ['IN QUEUE', 'IN CONSULTATION'].includes(p.status);
    }

    // Tab 1: In Assessment (Default)
    if (activeTabFilter === 'assessment') {
      return p.status === 'ASSESSMENT';
    }

    // Tab 3: Awaiting Intake (Patients where intake can be completed by MA if not already done)
    if (activeTabFilter === 'awaiting') {
      return p.status === 'CHECK-IN';
    }

    // Tab 4: Other MAs Assessing (Patients currently undergoing assessment by other MAs across clinic)
    if (activeTabFilter === 'other_ma') {
      return p.status === 'ASSESSMENT';
    }

    return isMaActive(p);
  });

  // Sorting:
  // 1. Cards that have already filled all data (symptoms + med history) MUST be at the FIRST POSITION!
  // 2. Automatically sorted on the basis of arrival at clinic or appointment booking time (earliest first)
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aComplete = isPatientIntakeComplete(a);
    const bComplete = isPatientIntakeComplete(b);

    // Complete intake cards are placed at the very first position!
    if (aComplete && !bComplete) return -1;
    if (!aComplete && bComplete) return 1;

    // Chronological sort: clinic arrival or appointment booking time
    const aTime = parseTimeString(a.arrivedAt || a.appointmentTime || a.form?.timeSlot || '10:00 AM');
    const bTime = parseTimeString(b.arrivedAt || b.appointmentTime || b.form?.timeSlot || '10:00 AM');
    return aTime - bTime;
  });

  // Doctor Queue Action Handlers
  const handleStartConsultation = (patientId: string, doctorId: string) => {
    if (onStartConsultation) {
      onStartConsultation(patientId, doctorId);
    } else {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      onUpdatePatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? { ...p, status: 'IN CONSULTATION', consultationStartTime: nowTime }
            : p
        )
      );
      showToast('Consultation started');
    }
  };

  const handleCallPatient = (patientId: string, doctorId: string) => {
    if (onCallPatient) {
      onCallPatient(patientId, doctorId);
    } else {
      const patient = patients.find((p) => p.id === patientId);
      const doctor = doctors.find((d) => d.id === doctorId);
      showToast(`Calling ${patient?.name || 'patient'} to Dr. ${doctor?.name || ''}'s room`);
    }
  };

  const handleDoctorOrderInvestigation = (patientId: string) => {
    if (onDoctorOrderInvestigation) {
      onDoctorOrderInvestigation(patientId);
    } else {
      onUpdatePatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'INVESTIGATION' } : p))
      );
      showToast('Diagnostic test ordered; patient moved to Diagnostics');
    }
  };

  const handleDoctorFinishToBilling = (patientId: string) => {
    if (onDoctorFinishToBilling) {
      onDoctorFinishToBilling(patientId);
    } else {
      onUpdatePatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'BILLING' } : p))
      );
      showToast('Consultation concluded; patient routed to Billing');
    }
  };

  // Render Full-Screen Clinical Intake Screen if an intake session is active (no popups)
  if (activeIntakePatient) {
    return (
      <ClinicalIntakeScreen
        patient={activeIntakePatient.patient}
        initialTab={activeIntakePatient.tab}
        doctors={doctors}
        onBack={() => setActiveIntakePatient(null)}
        onSaveIntake={handleSaveClinicalIntake}
      />
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col z-10 relative select-none">
      {/* Ambient Glass Gradients on the Screen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl" />
      </div>

      {/* MA TOP COMMAND HEADER BAR (High Contrast Glass) */}
      <header className="relative z-30 px-4 sm:px-6 py-2.5 bg-white/80 backdrop-blur-md border-b border-white/80 flex items-center justify-between gap-3 shadow-xs ring-1 ring-slate-900/5">
        {/* Left: Brand Mark & Station Identifier */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                  Soltech Clinic OS
                </span>
                <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded border border-teal-200">
                  MA WORKSPACE
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Medical Assistant Home</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300/60" />

          {/* Branch Switcher Glass Pill */}
          <div className="relative" ref={branchRef}>
            <button
              type="button"
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/90 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[150px] truncate">{selectedBranch}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showBranchMenu && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/80 py-2 z-50">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Clinic Branch
                </div>
                {branches.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      onBranchChange(b);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-blue-50/80 transition-colors ${
                      selectedBranch === b ? 'text-blue-700 font-bold bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBranch === b && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search & Doctor Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          {/* Search Bar in Glass Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patient, mobile, MRN, complaint..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/60 backdrop-blur-md border border-white/90 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder-slate-400 shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Doctor Filter */}
          <select
            value={selectedDoctorId}
            onChange={(e) => onDoctorChange(e.target.value)}
            className="text-xs bg-white/70 backdrop-blur-md border border-white/90 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-hidden cursor-pointer shadow-2xs max-w-[140px]"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.roomNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Date Capsule, Live Time, & MA Staff Profile with Role Switching */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Date and Time Capsule */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-bold text-slate-800">{selectedDate}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-mono tabular-nums font-bold text-teal-950">{currentTime}</span>
            </div>
          </div>

          {/* MA Staff Profile with Interactive Dropdown for Role Switching */}
          <div className="relative pl-1" ref={profileRef}>
            <button
              id="ma-profile-menu-button"
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-100 shadow-2xs">
                AM
              </div>
              <div className="text-left hidden xl:block leading-tight">
                <div className="text-xs font-bold text-slate-800">Anjali Mehta</div>
                <div className="text-[10px] text-teal-700 font-semibold">Lead MA</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 py-2 z-50 text-xs ring-1 ring-slate-900/5">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-800">Anjali Mehta, CMA</div>
                  <div className="text-[11px] text-slate-500">anjali.mehta@satyamclinic.in</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    <ShieldCheck className="w-3 h-3" /> MA Workspace Active
                  </div>
                </div>

                {/* Role / Workspace Switcher (Change between Reception and MA from Profile) */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/80 rounded-xl mx-2 my-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Clinical Role</span>
                    <span className="text-teal-700 font-bold">Switch Workspace</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      id="ma-profile-switch-to-reception"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onSwitchWorkspace) {
                          onSwitchWorkspace('reception');
                        } else if (onSwitchToReception) {
                          onSwitchToReception();
                        }
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200/80 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Reception Desk</span>
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold">Switch →</span>
                    </button>

                    <button
                      type="button"
                      id="ma-profile-stay-ma"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-teal-600 text-white shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>MA Assessment</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">Current</span>
                    </button>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Clinical Preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-400" /> Triage Alerts
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-amber-50 flex items-center gap-2 text-amber-900 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-700" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

            {/* 3. OPERATIONAL TRIAGE & STATUS FILTER STRIP */}
            <div className="px-5 py-2 bg-white/55 backdrop-blur-xl border-b border-white/80 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none z-10 shrink-0">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 text-xs">
                {/* TAB 1 (DEFAULT / FIRST): IN ASSESSMENT */}
                <button
                  type="button"
                  id="ma-tab-in-assessment"
                  onClick={() => setActiveTabFilter('assessment')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-2xs text-xs ${
                    activeTabFilter === 'assessment'
                      ? 'bg-teal-600 text-white border-teal-500 font-bold ring-2 ring-teal-500/30'
                      : 'bg-teal-50/70 hover:bg-teal-100/70 text-teal-900 border-teal-200/80'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>1. In Assessment</span>
                  <strong className="font-mono tabular-nums ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
                    {inAssessmentPatients.length}
                  </strong>
                </button>

                {/* TAB 2 (SECOND): DOCTOR'S QUEUE */}
                <button
                  type="button"
                  id="ma-tab-doctor-queue"
                  onClick={() => setActiveTabFilter('transferred')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-2xs text-xs ${
                    activeTabFilter === 'transferred'
                      ? 'bg-emerald-700 text-white border-emerald-600 font-bold ring-2 ring-emerald-500/30'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border-emerald-200/80'
                  }`}
                  title="Patients transferred to Doctor Queue for Consultation"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>2. Doctor's Queue</span>
                  <strong className="font-mono tabular-nums ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
                    {transferredToDoctorPatients.length}
                  </strong>
                </button>

                {/* TAB 3 (THIRD): AWAITING INTAKE (Intake can be completed by MA if not done by receptionist) */}
                <button
                  type="button"
                  id="ma-tab-awaiting-intake"
                  onClick={() => setActiveTabFilter('awaiting')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-2xs text-xs ${
                    activeTabFilter === 'awaiting'
                      ? 'bg-blue-600 text-white border-blue-500 font-bold ring-2 ring-blue-500/30'
                      : 'bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 border-blue-200/80'
                  }`}
                  title="Patients awaiting intake completion"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. Awaiting Intake</span>
                  <strong className="font-mono tabular-nums ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
                    {awaitingIntakePatients.length}
                  </strong>
                </button>

                {/* TAB 4: OTHER MAS WHO ARE ASSESSING */}
                <button
                  type="button"
                  id="ma-tab-other-mas"
                  onClick={() => setActiveTabFilter('other_ma')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-2xs text-xs ${
                    activeTabFilter === 'other_ma'
                      ? 'bg-purple-700 text-white border-purple-600 font-bold ring-2 ring-purple-500/30'
                      : 'bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 border-purple-200/80'
                  }`}
                  title="View patients currently being assessed by other Medical Assistants"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Other MAs Assessing</span>
                  <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded-md">
                    Team View
                  </span>
                </button>
              </div>

              {/* Doctors Columns Indicator when Doctor's Queue tab is active */}
              {activeTabFilter === 'transferred' && (
                <div className="flex items-center gap-1.5 text-xs shrink-0 text-slate-700 font-bold bg-white/80 px-2.5 py-1 rounded-xl border border-white/90 shadow-2xs">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Doctors Columns Layout</span>
                </div>
              )}
            </div>

            {/* 4. MAIN PATIENT LIST CANVAS (TABLET SCROLLABLE GRID WITH FROSTED GLASS CARDS) */}
            <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 flex flex-col">
              {activeTabFilter === 'transferred' ? (
                <DoctorsQueueColumnsView
                  doctors={doctors}
                  patients={patients}
                  onOpenDetail={(patient) => handleOpenPatient(patient, 'overview')}
                  onCallPatient={handleCallPatient}
                  onStartConsultation={handleStartConsultation}
                  onDoctorOrderInvestigation={handleDoctorOrderInvestigation}
                  onDoctorFinishToBilling={handleDoctorFinishToBilling}
                  onOpenCalendar={onOpenDoctorCalendar}
                  selectedDoctorId={selectedDoctorId}
                  onDoctorChange={onDoctorChange}
                  searchQuery={searchQuery}
                />
              ) : sortedPatients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-dashed border-white/80 max-w-md mx-auto my-12">
                  <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                    {activeTabFilter === 'transferred' ? (
                      <Send className="w-6 h-6 text-emerald-600" />
                    ) : activeMaPatients.length === 0 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {activeTabFilter === 'transferred'
                      ? 'No Transferred Patients'
                      : activeMaPatients.length === 0
                      ? 'All Intake Patients Routed to Doctor!'
                      : 'No Active Intake Patients Found'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {activeTabFilter === 'transferred'
                      ? 'Patients routed to the Doctor Queue will appear here.'
                      : activeMaPatients.length === 0
                      ? 'All patients have been assessed and moved to Doctor Queue for Consultation.'
                      : 'No active intake patients match your current filter or search criteria.'}
                  </p>
                  <div className="flex items-center gap-2 mt-3.5">
                    {transferredToDoctorPatients.length > 0 && activeTabFilter !== 'transferred' && (
                      <button
                        type="button"
                        onClick={() => setActiveTabFilter('transferred')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>View Doctor Queue ({transferredToDoctorPatients.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTabFilter('all');
                        onSearchChange('');
                        onDoctorChange('all');
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activeTabFilter === 'other_ma' && (
                    <div className="mb-3.5 p-3 rounded-2xl bg-purple-50/90 border border-purple-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-purple-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-purple-950">Team Medical Assistants (Active Assessment Bays)</div>
                          <p className="text-[11px] text-purple-700 font-medium">Viewing patients currently undergoing clinical intake by other MAs across parallel clinic stations</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 font-bold text-purple-800 shadow-2xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>MA Sneha Patel • Bay 2 (Active)</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 font-bold text-purple-800 shadow-2xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>MA Rohan Verma • Station 3 (Active)</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {sortedPatients.map((patient, pIdx) => {
                      const isAwaiting = patient.status === 'CHECK-IN';
                      const isInAssessment = patient.status === 'ASSESSMENT';
                      const intakeComplete = isPatientIntakeComplete(patient);
                      const isReady = isInAssessment && intakeComplete;
                      const isConsulting = patient.status === 'IN CONSULTATION';
                      const isInDoctorQueue = patient.status === 'IN QUEUE';
                      const assignedOtherMaName = pIdx % 2 === 0 ? 'Sneha Patel, CMA (Bay 2)' : 'Rohan Verma, MA (Station 3)';
                    const hasVitals = patient.checkInModules?.vitals && patient.vitals;

                    // Abnormal vital checks
                    const isHighBP = (patient.vitals?.bpSystolic || 0) >= 140 || (patient.vitals?.bpDiastolic || 0) >= 90;
                    const hasFever = (patient.vitals?.temperature || 0) >= 100.4;

                    // Intake progress indicators
                    const loggedSymptomsCount = patient.assessment?.detailedSymptoms?.length || 0;
                    const familyHistCount = patient.medicalRecords?.detailedFamilyHistory?.length || 
                      patient.medicalRecords?.familyHistory?.length || 0;
                    const pastCondCount = patient.medicalRecords?.pastMedicalConditions?.length || 
                      patient.medicalRecords?.chronicConditions?.length || 0;
                    const totalHistoryRecords = familyHistCount + pastCondCount;
                    const hasSymptoms = loggedSymptomsCount > 0 || Boolean(patient.assessment?.subjectiveCompleted && patient.assessment?.chiefComplaint);
                    const hasMedHistory = totalHistoryRecords > 0 || Boolean(patient.medicalRecords?.completed) || Boolean(patient.assessment?.objectiveCompleted);

                    return (
                      <div
                        key={patient.id}
                        onClick={() => handleOpenPatient(patient, 'overview')}
                        className="group relative bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-2xl border border-white/90 hover:border-teal-300 p-3.5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between ring-1 ring-slate-900/5 hover:-translate-y-0.5"
                      >
                        <div>
                          {/* Card Header: Patient Profile Avatar, MRN, Blood Group & Status Capsule */}
                          <div className="flex items-start gap-3">
                            {/* Patient Profile Photo Avatar (Fully Rounded / Circle) */}
                            <div className="relative shrink-0">
                              {patient.avatarUrl ? (
                                <img
                                  src={patient.avatarUrl}
                                  alt={patient.name}
                                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-2xs border border-slate-200/90"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-2xs ring-2 ring-white">
                                  {patient.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              {/* Arrival status green indicator */}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                                  patient.arrivalStatus === 'ARRIVED' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                                title={`Arrival Status: ${patient.arrivalStatus}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Patient ID Tag - cleanly styled without blue bar */}
                                  <span className="font-mono font-bold text-[11px] text-slate-700 bg-slate-100/90 border border-slate-200/90 px-2 py-0.5 rounded-md">
                                    {patient.patientNumber || patient.patientIdNumber}
                                  </span>

                                  {/* Appointment Time Slot */}
                                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50/90 border border-blue-200/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                                    <span>{patient.appointmentTime || patient.form?.timeSlot || '10:30 AM'}</span>
                                  </span>

                                  {/* Blood Group */}
                                  <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                                    {patient.form?.bloodGroup || 'O+'}
                                  </span>
                                </div>

                                {/* Status Capsule */}
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                                    isAwaiting
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : isInAssessment
                                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                                      : isReady
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : isInDoctorQueue
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {patient.status}
                                </span>
                              </div>

                              {/* Patient Name, Demographics & Wait Time */}
                              <div className="mt-1 flex items-baseline justify-between gap-1">
                                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-700 transition-colors truncate">
                                  {patient.name}
                                </h3>
                                <span className="text-[11px] text-slate-500 font-medium shrink-0">
                                  {patient.age} Y • {patient.gender}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1 text-slate-600 font-medium truncate">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  {patient.mobile}
                                </span>
                                <span>·</span>
                                <span
                                  className={`font-semibold px-1.5 py-0.2 rounded border text-[10px] shrink-0 ${
                                    (patient.waitingTimeMinutes || 0) > 20
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  ⏳ {patient.waitingTimeMinutes || 0}m wait
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Doctor & Room Assignment */}
                          <div className="mt-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="font-bold text-slate-800 truncate">{patient.doctorName}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {patient.specialty}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-white px-1 py-0.2 rounded border border-slate-200">
                                {patient.roomNumber ? patient.roomNumber.replace('#', '') : 'Room 102'}
                              </span>
                            </div>
                          </div>

                          {/* RECEPTIONIST VITALS SUMMARY STRIP (BP, Pulse, SpO2, Temp, BMI merged) */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatient(patient, 'vitals');
                            }}
                            className={`mt-2 p-2 rounded-xl border transition-all ${
                              hasVitals
                                ? isHighBP || hasFever
                                  ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                                  : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                            title="Click to view full Vitals & Anthropometry"
                          >
                            <div className="flex items-center justify-between text-[10px] pb-1 border-b border-black/5">
                              <span className="font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-teal-600" />
                                Vitals (Recorded at Reception)
                              </span>
                              {hasVitals ? (
                                <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-emerald-600" /> Verified
                                </span>
                              ) : (
                                <span className="text-amber-700 font-bold">Intake Pending</span>
                              )}
                            </div>

                            {hasVitals && patient.vitals ? (
                              <div className="grid grid-cols-4 gap-1 pt-1 text-center font-mono text-xs">
                                <div className="bg-white/80 rounded p-1 border border-black/5">
                                  <span className="text-[8px] text-slate-400 uppercase font-sans block leading-none">BP</span>
                                  <span className={`font-black ${isHighBP ? 'text-rose-700' : 'text-slate-900'}`}>
                                    {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                                  </span>
                                </div>
                                <div className="bg-white/80 rounded p-1 border border-black/5">
                                  <span className="text-[8px] text-slate-400 uppercase font-sans block leading-none">HR</span>
                                  <span className="font-black text-slate-900">{patient.vitals.pulse}</span>
                                </div>
                                <div className="bg-white/80 rounded p-1 border border-black/5">
                                  <span className="text-[8px] text-slate-400 uppercase font-sans block leading-none">SpO2</span>
                                  <span className="font-black text-slate-900">{patient.vitals.spo2}%</span>
                                </div>
                                <div className="bg-white/80 rounded p-1 border border-black/5">
                                  <span className="text-[8px] text-slate-400 uppercase font-sans block leading-none">BMI</span>
                                  <span className="font-black text-blue-700">
                                    {patient.bodyComposition?.bmi || 23.4}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 italic pt-1">
                                Receptionist has not logged initial vitals yet.
                              </p>
                            )}
                          </div>

                          {/* Chief Complaint / Disease Presentation */}
                          <div className="mt-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                Chief Complaint
                              </span>
                              {patient.assessment?.suspectDisease && (
                                <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1 py-0.2 rounded border border-teal-200">
                                  {patient.assessment.suspectDisease.split('/')[0]}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-800 font-semibold line-clamp-1 mt-0.5">
                              {patient.assessment?.chiefComplaint || 'General clinical review & consultation'}
                            </p>
                          </div>
                        </div>

                        {/* ========================================================= */}
                        {/* DEDICATED MA ACTION BUTTONS: SYMPTOMS, MEDICAL HISTORY, SEND TO DOCTOR */}
                        {/* ========================================================= */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                          {/* Row 1: Symptoms and Medical History Intake Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* 1. SYMPTOMS INTAKE BUTTON - OPENS FULL-PAGE CLINICAL INTAKE SCREEN */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveIntakePatient({ patient, tab: 'symptoms' });
                              }}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                loggedSymptomsCount > 0
                                  ? 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300 ring-1 ring-teal-400/20'
                                  : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border-slate-200'
                              }`}
                              title="Open Full-Page Clinical Intake Screen (Symptoms Tab)"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                              <span>Symptoms</span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                                  loggedSymptomsCount > 0
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {loggedSymptomsCount > 0 ? loggedSymptomsCount : '+ Add'}
                              </span>
                            </button>

                            {/* 2. MEDICAL HISTORY BUTTON - OPENS FULL-PAGE CLINICAL INTAKE SCREEN */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveIntakePatient({ patient, tab: 'history' });
                              }}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                totalHistoryRecords > 0
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 ring-1 ring-blue-400/20'
                                  : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border-slate-200'
                              }`}
                              title="Open Full-Page Clinical Intake Screen (Medical History Tab)"
                            >
                              <Heart className="w-3.5 h-3.5 text-blue-600" />
                              <span>Med History</span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                                  totalHistoryRecords > 0
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {totalHistoryRecords > 0 ? totalHistoryRecords : '+ Add'}
                              </span>
                            </button>
                          </div>

                          {/* Row 2: Send to Doctor Button - OR In-Doctor-Queue Status if already transferred */}
                          {patient.status === 'IN QUEUE' || patient.status === 'IN CONSULTATION' ? (
                            <div className="p-2 px-3 rounded-xl bg-emerald-50/90 border border-emerald-200/90 flex items-center justify-between text-[11px] text-emerald-800">
                              <span className="flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{patient.status === 'IN CONSULTATION' ? 'In Consultation with Doctor' : 'Transferred to Doctor Queue'}</span>
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700">
                                {patient.doctorName}
                              </span>
                            </div>
                          ) : intakeComplete ? (
                            <div className="flex items-center gap-2 pt-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSendToDoctor(patient.id);
                                  showToast(`Patient ${patient.name} moved to Dr. ${patient.doctorName}'s Queue & removed from MA`);
                                }}
                                className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20 active:scale-[0.98]"
                                title="All intake data complete (Symptoms & Medical History). Route patient to Doctor for Consultation"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send to Doctor</span>
                                <Check className="w-3.5 h-3.5 text-emerald-200" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveIntakePatient({
                                  patient,
                                  tab: !hasSymptoms ? 'symptoms' : 'history',
                                });
                              }}
                              className="w-full p-2 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-dashed border-amber-300 flex items-center justify-between text-[11px] text-slate-600 cursor-pointer transition-colors"
                              title="Click to start Clinical Intake (Full-Screen Screen)"
                            >
                              <span className="flex items-center gap-1.5 font-medium text-slate-700 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Intake Pending</span>
                              </span>
                              <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                {!hasSymptoms && !hasMedHistory
                                  ? 'Start Full Clinical Intake →'
                                  : !hasSymptoms
                                  ? 'Complete Symptoms →'
                                  : 'Complete Med History →'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
              )}
            </main>

      {/* ========================================================= */}
      {/* FULL PATIENT DETAIL MODAL (Exact Placement and 6 Tabs)    */}
      {/* ========================================================= */}
      {selectedPatientForDetail && (
        <PatientDetailModal
          patient={selectedPatientForDetail}
          isOpen={!!selectedPatientForDetail}
          onClose={() => setSelectedPatientForDetail(null)}
          onUpdatePatient={(updatedPatient) => {
            onUpdatePatients((prev) =>
              prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
            );
            setSelectedPatientForDetail(updatedPatient);
          }}
          initialTab={detailModalInitialTab}
          onSendToDoctor={(pId) => {
            onSendToDoctor(pId);
            setSelectedPatientForDetail(null);
            showToast(`Patient successfully routed to Doctor's Queue`);
          }}
          userRole="ma"
        />
      )}

      {/* ========================================================= */}
      {/* DEDICATED CLINICAL SYMPTOMS INTAKE MODAL (QUESTIONNAIRE)  */}
      {/* ========================================================= */}
      {symptomsModalPatient && (
        <SymptomsIntakeModal
          patient={symptomsModalPatient}
          isOpen={!!symptomsModalPatient}
          onClose={() => setSymptomsModalPatient(null)}
          onSaveSymptoms={handleSaveSymptomsFromModal}
        />
      )}

      {/* ========================================================= */}
      {/* DEDICATED MEDICAL HISTORY INTAKE MODAL (6 CLINICAL GROUPS) */}
      {/* ========================================================= */}
      {medicalHistoryModalPatient && (
        <MedicalHistoryIntakeModal
          patient={medicalHistoryModalPatient}
          isOpen={!!medicalHistoryModalPatient}
          onClose={() => setMedicalHistoryModalPatient(null)}
          onSaveMedicalHistory={handleSaveMedicalHistoryFromModal}
        />
      )}

      {/* Quick Vitals Intake Modal (Optional Emergency Override) */}
      {vitalsModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 ring-1 ring-slate-900/10 w-full max-w-xl overflow-hidden flex flex-col">
            <header className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/85 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                  Quick Vitals Override
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {vitalsModalPatient.name} ({vitalsModalPatient.patientNumber || vitalsModalPatient.patientIdNumber || 'Patient'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVitalsModalPatient(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-5 overflow-y-auto space-y-4 max-h-[75vh]">
              {/* Hemodynamics Grid */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Hemodynamic Vitals
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={vitalsForm.bpSystolic}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bpSystolic: Number(e.target.value) })}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={vitalsForm.bpDiastolic}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bpDiastolic: Number(e.target.value) })}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={vitalsForm.pulse}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: Number(e.target.value) })}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsForm.temperature}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: Number(e.target.value) })}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">SpO2 (%)</label>
                    <input
                      type="number"
                      value={vitalsForm.spo2}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: Number(e.target.value) })}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Resp Rate (breaths/m)</label>
                    <input
                      type="number"
                      value={vitalsForm.respiratoryRate}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, respiratoryRate: Number(e.target.value) })}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Anthropometry & Body Comp */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Body Composition
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Height (cm)</label>
                    <input
                      type="number"
                      value={vitalsForm.heightCm}
                      onChange={(e) => handleHeightWeightChange('heightCm', Number(e.target.value))}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={vitalsForm.weightKg}
                      onChange={(e) => handleHeightWeightChange('weightKg', Number(e.target.value))}
                      className="w-full font-black text-slate-900 text-base mt-1 bg-white p-1 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-blue-700 block">Calculated BMI</span>
                    <div className="text-xl font-black text-blue-950 font-mono mt-0.5">
                      {vitalsForm.bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="px-5 py-3 border-t border-slate-200/80 bg-white/85 backdrop-blur-md flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setVitalsModalPatient(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuickVitals(false)}
                className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-xl transition-colors cursor-pointer"
              >
                Save Vitals
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/90 backdrop-blur-xl text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 ring-1 ring-black/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
