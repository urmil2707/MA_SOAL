import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Clock,
  Calendar,
  Stethoscope,
  FileText,
  Scale,
  ClipboardList,
  Activity,
  FileCheck,
  Receipt,
  Download,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Printer,
  FlaskConical,
  ScanLine,
  TrendingDown,
  TrendingUp,
  Info,
  Timer,
  Droplet,
  Fingerprint,
  Users,
  ShieldAlert,
  Globe,
  Footprints,
  Sparkles,
  Repeat,
  Briefcase,
  PhoneCall,
  Microscope,
  FolderArchive,
  Search,
  Check,
  Lock,
  Save,
  StickyNote,
  History,
  Route,
  Trash2,
  Plus,
  Edit2,
  ChevronDown,
  CheckCheck,
  Upload,
  FileUp,
} from 'lucide-react';
import {
  Patient,
  PreviousAppointmentRecord,
  DetailedSymptom,
  FamilyHistoryEntry,
  PastMedicalCondition,
  SurgicalHistoryEntry,
  AllergyEntry,
  PatientUploadedRecord,
  PatientFormRegistration,
  RecordCategory,
} from '../types';
import {
  getSmartSymptomSuggestions,
  COMMON_DISEASES,
  SymptomCatalogItem,
} from '../utils/symptomSuggestions';
import { getStatusBadgeStyle } from './PatientCard';
import { getPatientPreviousAppointments, getPatientJourneySteps } from '../utils/previousAppointments';
import { getPatientMedicalReports } from '../utils/medicalReports';
import { PatientJourneyTimeline, formatExtractedScanDate, formatUploadedOnDate } from './PatientJourneyTimeline';
import { SymptomsIntakeModal } from './SymptomsIntakeModal';
import { UploadRecordModal } from './UploadRecordModal';
import { CompleteIntakeModal } from './CompleteIntakeModal';
import { ReviewInformationModal } from './ReviewInformationModal';
import { PatientTrendsView } from './PatientTrendsView';
import { DoctorViewDashboard } from './DoctorViewDashboard';
import { MedicalHistoryIntakeModal } from './MedicalHistoryIntakeModal';
import { ClinicalCasePresentation } from './ClinicalCasePresentation';
import { UniversalBackButton } from './UniversalBackButton';
import { scrollToAndHighlight } from '../utils/evidenceHighlighter';

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePatient: (updated: Patient) => void;
  initialTab?: TabType;
  onSendToDoctor?: (patientId: string) => void;
  userRole?: 'ma' | 'receptionist';
}

type TabType = 'overview' | 'records' | 'vitals' | 'symptoms' | 'history' | 'trends' | 'doctor-view' | 'reports';
type RightPanelTab = 'ai-summary' | 'journey' | 'history';

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onUpdatePatient,
  initialTab = 'overview',
  onSendToDoctor,
  userRole = 'receptionist',
}) => {
  // Center Tab State: Overview, Body Composition, Vitals, Records, Patient History, Reports
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const tabContentRef = React.useRef<HTMLDivElement>(null);

  // Sync initialTab when modal opens or initialTab prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Reset tab scroll when tab changes
  useEffect(() => {
    tabContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  // Right Panel Tab State: 'ai-summary' (AI Case Presentation & Insights) or 'journey' (Live Timeline)
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('ai-summary');

  // Selected Appointment State: 'today' (default) or past appointment id
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('today');

  // Filter inside Reports tab (Laboratory, Radiology, Pathology, Physiotherapy)
  const [reportFilter, setReportFilter] = useState<'all' | 'Laboratory' | 'Pathology' | 'Radiology' | 'Physiotherapy'>('all');
  const [reportSearchTerm, setReportSearchTerm] = useState<string>('');
  const [expandedReportIds, setExpandedReportIds] = useState<Record<string, boolean>>({});
  const [reportToast, setReportToast] = useState<string | null>(null);

  // Copied alert notification
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Private Receptionist Clinical Notes & Reminders
  const [receptionNotes, setReceptionNotes] = useState<string>('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<string | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);

  // Receptionist Action Modals & Information Review State
  const [isUploadRecordModalOpen, setIsUploadRecordModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isReviewInfoModalOpen, setIsReviewInfoModalOpen] = useState(false);
  const [hasNewInformation, setHasNewInformation] = useState(false);
  const [newInformationUpdates, setNewInformationUpdates] = useState<string[]>([]);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Medical History Intake Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyModalInitialCat, setHistoryModalInitialCat] = useState<'conditions' | 'allergies' | 'medications' | 'surgeries' | 'family' | 'immunizations' | 'lifestyle' | 'remarks'>('conditions');

  // Collapsible state for simplified overview modular cards
  const [collapsedOverviewCards, setCollapsedOverviewCards] = useState<Record<string, boolean>>({});
  const toggleOverviewCard = (cardId: string) => {
    setCollapsedOverviewCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Sub-filter inside merged Records tab
  const [recordsSubFilter, setRecordsSubFilter] = useState<'all' | 'diagnostic' | 'investigations' | 'history'>('all');

  // Universal Back Navigation Stack for Patient Profile
  const [modalNavHistory, setModalNavHistory] = useState<{
    tab: TabType;
    label: string;
    elementId?: string;
  }[]>([]);

  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'overview':
        return 'Patient Overview';
      case 'records':
        return 'Diagnostic Records';
      case 'vitals':
        return 'Vitals';
      case 'symptoms':
        return 'Symptoms';
      case 'history':
        return 'Medical History';
      case 'trends':
        return 'View Trends';
      case 'doctor-view':
        return 'Doctor View';
      default:
        return 'Overview';
    }
  };

  const handleEvidenceDeepLink = (
    targetTab: string,
    targetElementId?: string,
    sourceTitle?: string
  ) => {
    const currentLabel =
      activeTab === 'overview' ? 'AI Case Presentation' : getTabLabel(activeTab);

    setModalNavHistory((prev) => [
      ...prev,
      { tab: activeTab, label: currentLabel, elementId: 'ai-clinical-case-presentation' },
    ]);

    const normalizedTab: TabType = (targetTab === 'medical-history' ? 'history' : targetTab) as TabType;

    if (normalizedTab === 'records') {
      if (
        targetElementId?.includes('report-creatinine') ||
        targetElementId?.includes('report-hba1c') ||
        targetElementId?.includes('report-lipid')
      ) {
        setRecordsSubFilter('investigations');
        setExpandedReportIds((prev) => ({
          ...prev,
          INV001: true,
          INV002: true,
          INV003: true,
          'flag-1': true,
          'flag-2': true,
        }));
      } else {
        setRecordsSubFilter('all');
      }
    }

    setActiveTab(normalizedTab);

    if (targetElementId) {
      setTimeout(() => {
        scrollToAndHighlight(targetElementId);
      }, 160);
    }
  };

  const handleBackNavigation = () => {
    if (modalNavHistory.length === 0) return;
    const stackCopy = [...modalNavHistory];
    const previous = stackCopy.pop();
    setModalNavHistory(stackCopy);

    if (previous) {
      setActiveTab(previous.tab);
      if (previous.elementId) {
        setTimeout(() => {
          scrollToAndHighlight(previous.elementId!);
        }, 160);
      }
    }
  };

  const previousLocationLabel =
    modalNavHistory.length > 0 ? modalNavHistory[modalNavHistory.length - 1].label : null;

  // Quick vitals editor state
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsSaveFeedback, setVitalsSaveFeedback] = useState<string | null>(null);
  const [vitalsEditForm, setVitalsEditForm] = useState({
    bpSystolic: 120,
    bpDiastolic: 80,
    pulse: 72,
    spo2: 99,
    temperature: 99,
    heightCm: 162,
    weightKg: 79,
  });

  useEffect(() => {
    if (patient) {
      setVitalsEditForm({
        bpSystolic: patient.vitals?.bpSystolic || 120,
        bpDiastolic: patient.vitals?.bpDiastolic || 80,
        pulse: patient.vitals?.pulse || 72,
        spo2: patient.vitals?.spo2 || 99,
        temperature: patient.vitals?.temperature || 99,
        heightCm: patient.bodyComposition?.heightCm || 162,
        weightKg: patient.bodyComposition?.weightKg || 79,
      });
    }
  }, [patient?.id, isOpen]);

  const handleSaveUpdatedVitals = () => {
    if (!patient) return;
    const heightM = (Number(vitalsEditForm.heightCm) || 162) / 100;
    const calcBmi = Number(((Number(vitalsEditForm.weightKg) || 79) / (heightM * heightM)).toFixed(1));
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedPatient: Patient = {
      ...patient,
      vitals: {
        ...patient.vitals,
        bpSystolic: Number(vitalsEditForm.bpSystolic),
        bpDiastolic: Number(vitalsEditForm.bpDiastolic),
        pulse: Number(vitalsEditForm.pulse),
        spo2: Number(vitalsEditForm.spo2),
        temperature: Number(vitalsEditForm.temperature),
        recordedAt: nowTime,
      },
      bodyComposition: {
        ...patient.bodyComposition,
        heightCm: Number(vitalsEditForm.heightCm),
        weightKg: Number(vitalsEditForm.weightKg),
        bmi: calcBmi,
        recordedAt: nowTime,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: 'New Vitals Reading Recorded',
          performedBy: 'Priya Shah (Receptionist)',
          role: 'Receptionist',
          category: 'Assessment',
          details: `BP: ${vitalsEditForm.bpSystolic}/${vitalsEditForm.bpDiastolic} mmHg, Pulse: ${vitalsEditForm.pulse} bpm, SpO2: ${vitalsEditForm.spo2}%, Weight: ${vitalsEditForm.weightKg} kg`,
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
    setIsEditingVitals(false);
    setHasNewInformation(true);
    setNewInformationUpdates((prev) => [
      `New vitals reading: ${vitalsEditForm.bpSystolic}/${vitalsEditForm.bpDiastolic} mmHg, HR ${vitalsEditForm.pulse} bpm, SpO2 ${vitalsEditForm.spo2}%`,
      ...prev,
    ]);
    setVitalsSaveFeedback('Vitals updated successfully');
    setTimeout(() => setVitalsSaveFeedback(null), 3000);
  };

  const handleUploadNewRecord = (newRecord: PatientUploadedRecord) => {
    if (!patient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existing = patient.uploadedRecords || [];
    const updatedPatient: Patient = {
      ...patient,
      uploadedRecords: [newRecord, ...existing],
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: `Diagnostic Record Uploaded: ${newRecord.title}`,
          performedBy: 'Priya Shah (Receptionist)',
          role: 'Receptionist',
          category: 'Investigation',
          details: `Category: ${newRecord.category}. Extracted test date: ${newRecord.scanDate}. Uploaded at: ${nowTime}.`,
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
    setHasNewInformation(true);
    setNewInformationUpdates((prev) => [
      `Diagnostic Record Uploaded: ${newRecord.title} (Extracted date: ${formatExtractedScanDate(newRecord.scanDate)})`,
      ...prev,
    ]);
    setNoteSavedFeedback('Record uploaded successfully and indexed in timeline!');
    setTimeout(() => setNoteSavedFeedback(null), 3000);
  };

  const handleSaveIntakeForm = (updatedForm: PatientFormRegistration) => {
    if (!patient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedPatient: Patient = {
      ...patient,
      name: updatedForm.fullName || patient.name,
      mobile: updatedForm.mobile || patient.mobile,
      age: updatedForm.age || patient.age,
      gender: updatedForm.gender || patient.gender,
      form: updatedForm,
      checkInModules: {
        ...patient.checkInModules,
        form: true,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: 'Intake Form Completed by Receptionist',
          performedBy: 'Priya Shah (Receptionist)',
          role: 'Receptionist',
          category: 'Check-in',
          details: `Registration completed for ${updatedForm.fullName}. Chief complaint: ${updatedForm.reasonOfVisit || 'Routine consultation'}.`,
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
    setHasNewInformation(true);
    setNewInformationUpdates((prev) => [
      `Intake form completed: ${updatedForm.fullName}, Phone: ${updatedForm.mobile}, Reason: ${updatedForm.reasonOfVisit || 'Routine checkup'}`,
      ...prev,
    ]);
    setNoteSavedFeedback('Intake form completed successfully!');
    setTimeout(() => setNoteSavedFeedback(null), 3000);
  };

  const handleApproveReviewedInfo = () => {
    if (!patient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedPatient: Patient = {
      ...patient,
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: 'Receptionist Verified & Approved Patient Information',
          performedBy: 'Priya Shah (Receptionist)',
          role: 'Receptionist',
          category: 'Registration',
          details: 'All newly filled demographic, vitals, and diagnostic record updates approved.',
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
    setHasNewInformation(false);
    setNewInformationUpdates([]);
    setIsReviewInfoModalOpen(false);
    setNoteSavedFeedback('Patient information approved and marked verified!');
    setTimeout(() => setNoteSavedFeedback(null), 3000);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ==========================================
  // SYMPTOMS EVALUATION & SMART SUGGESTIONS (MA ROLE)
  // ==========================================
  const [symptomsList, setSymptomsList] = useState<DetailedSymptom[]>([]);
  const [suspectDisease, setSuspectDisease] = useState<string>(COMMON_DISEASES[0]);
  const [chiefComplaintText, setChiefComplaintText] = useState('');
  const [symptomDurationText, setSymptomDurationText] = useState('3 days');
  const [symptomSeverityVal, setSymptomSeverityVal] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [symptomNotesText, setSymptomNotesText] = useState('');
  const [symptomSaveFeedback, setSymptomSaveFeedback] = useState<string | null>(null);
  const [isSymptomsPopupOpen, setIsSymptomsPopupOpen] = useState(false);

  // Custom symptom inline entry
  const [isAddingCustomSymptom, setIsAddingCustomSymptom] = useState(false);
  const [customSymptomName, setCustomSymptomName] = useState('');
  const [customSymptomSeverity, setCustomSymptomSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [customSymptomDuration, setCustomSymptomDuration] = useState('3 days');
  const [customSymptomOnset, setCustomSymptomOnset] = useState<'Acute' | 'Gradual' | 'Intermittent' | 'Constant'>('Acute');

  // ==========================================
  // MEDICAL HISTORY SEGMENTS (MA ROLE)
  // ==========================================
  const [pastConditionsList, setPastConditionsList] = useState<PastMedicalCondition[]>([]);
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [newCondName, setNewCondName] = useState('');
  const [newCondYear, setNewCondYear] = useState('2021');
  const [newCondStatus, setNewCondStatus] = useState<'Controlled' | 'Uncontrolled' | 'In Remission' | 'Resolved'>('Controlled');
  const [newCondTreatment, setNewCondTreatment] = useState('');

  const [familyHistoryList, setFamilyHistoryList] = useState<FamilyHistoryEntry[]>([]);
  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [newFamRelation, setNewFamRelation] = useState('Father');
  const [newFamCondition, setNewFamCondition] = useState('Coronary Artery Disease');
  const [newFamAge, setNewFamAge] = useState('54');
  const [newFamStatus, setNewFamStatus] = useState<'Living' | 'Deceased'>('Living');

  const [surgeriesList, setSurgeriesList] = useState<SurgicalHistoryEntry[]>([]);
  const [isAddingSurgery, setIsAddingSurgery] = useState(false);
  const [newSurgProcedure, setNewSurgProcedure] = useState('');
  const [newSurgYear, setNewSurgYear] = useState('2019');
  const [newSurgHospital, setNewSurgHospital] = useState('');

  const [allergiesList, setAllergiesList] = useState<AllergyEntry[]>([]);
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');
  const [newAllergyReaction, setNewAllergyReaction] = useState('Urticaria / Rash');
  const [newAllergySeverity, setNewAllergySeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Life-threatening'>('Moderate');

  const [lifestyleHabits, setLifestyleHabits] = useState({
    smoking: 'Non-smoker',
    alcohol: 'Occasional social',
    diet: 'Low-sodium / Diabetic',
    physicalActivity: 'Sedentary / Desk Job',
  });
  const [historySaveFeedback, setHistorySaveFeedback] = useState<string | null>(null);

  // Sync symptoms and medical history when patient changes or modal opens
  useEffect(() => {
    if (patient) {
      // 1. Symptoms sync
      if (patient.assessment?.detailedSymptoms && patient.assessment.detailedSymptoms.length > 0) {
        setSymptomsList(patient.assessment.detailedSymptoms);
      } else {
        const smartSuggestions = getSmartSymptomSuggestions(patient.specialty || 'General Medicine', patient.assessment?.chiefComplaint);
        setSymptomsList(
          smartSuggestions.slice(0, 3).map((s, idx) => ({
            id: `sym-${patient.id}-${idx}`,
            name: s.name,
            severity: s.defaultSeverity,
            duration: patient.assessment?.symptomsDuration || '3 days',
            onset: s.commonOnset,
            isPrimary: idx === 0,
            notes: s.description,
          }))
        );
      }

      setSuspectDisease(patient.assessment?.suspectDisease || COMMON_DISEASES[0]);
      setChiefComplaintText(patient.assessment?.chiefComplaint || '');
      setSymptomDurationText(patient.assessment?.symptomsDuration || '3 days');
      setSymptomSeverityVal(patient.assessment?.symptomSeverity || 'Moderate');
      setSymptomNotesText(patient.assessment?.maNotes || '');

      // 2. Past medical conditions sync
      if (patient.medicalRecords?.pastMedicalConditions && patient.medicalRecords.pastMedicalConditions.length > 0) {
        setPastConditionsList(patient.medicalRecords.pastMedicalConditions);
      } else {
        const chronic = patient.medicalRecords?.chronicConditions || ['Essential Hypertension', 'Type 2 Diabetes Mellitus'];
        setPastConditionsList(
          chronic.map((c, i) => ({
            id: `cond-${i}`,
            condition: c,
            diagnosedYear: i === 0 ? '2020' : '2023',
            status: 'Controlled' as const,
            treatment: i === 0 ? 'Telmisartan 40mg OD' : 'Metformin 500mg BD',
          }))
        );
      }

      // 3. Family history sync
      if (patient.medicalRecords?.detailedFamilyHistory && patient.medicalRecords.detailedFamilyHistory.length > 0) {
        setFamilyHistoryList(patient.medicalRecords.detailedFamilyHistory);
      } else {
        const rawFamily = patient.medicalRecords?.familyHistory || ['Father: Coronary Artery Disease', 'Mother: Type 2 Diabetes'];
        setFamilyHistoryList(
          rawFamily.map((f, i) => {
            const parts = f.split(':');
            return {
              id: `fam-${i}`,
              relation: parts[0]?.trim() || (i === 0 ? 'Father' : 'Mother'),
              condition: parts[1]?.trim() || f,
              ageOfOnset: i === 0 ? '54' : '48',
              status: 'Living' as const,
              notes: 'Under regular clinical management',
            };
          })
        );
      }

      // 4. Surgeries sync
      if (patient.medicalRecords?.detailedSurgeries && patient.medicalRecords.detailedSurgeries.length > 0) {
        setSurgeriesList(patient.medicalRecords.detailedSurgeries);
      } else {
        const rawSurg = patient.medicalRecords?.pastSurgeries || ['Appendectomy (2018)'];
        setSurgeriesList(
          rawSurg.map((s, i) => ({
            id: `surg-${i}`,
            procedure: s,
            year: '2018',
            hospital: 'Satyam Surgical Center',
            complications: 'None reported',
          }))
        );
      }

      // 5. Allergies sync
      if (patient.medicalRecords?.detailedAllergies && patient.medicalRecords.detailedAllergies.length > 0) {
        setAllergiesList(patient.medicalRecords.detailedAllergies);
      } else {
        const rawAllergies = patient.medicalRecords?.allergies || ['Penicillin'];
        setAllergiesList(
          rawAllergies.map((a, i) => ({
            id: `allg-${i}`,
            allergen: a,
            reaction: 'Urticaria & Pruritic Rash',
            severity: 'Moderate' as const,
          }))
        );
      }

      // 6. Lifestyle sync
      if (patient.medicalRecords?.lifestyleHabits) {
        setLifestyleHabits(patient.medicalRecords.lifestyleHabits);
      }

      // 7. Vitals intake sync
      setVitalsEditForm({
        bpSystolic: patient.vitals?.bpSystolic ?? 120,
        bpDiastolic: patient.vitals?.bpDiastolic ?? 80,
        pulse: patient.vitals?.pulse ?? 72,
        spo2: patient.vitals?.spo2 ?? 99,
        temperature: patient.vitals?.temperature ?? 98.6,
        heightCm: patient.bodyComposition?.heightCm ?? 162,
        weightKg: patient.bodyComposition?.weightKg ?? 79,
      });
    }
  }, [patient?.id, isOpen]);

  // Synchronize private notes when active patient changes
  useEffect(() => {
    if (patient) {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(`reception_notes_${patient.id}`);
      } catch {
        // ignore
      }
      setReceptionNotes(patient.receptionistNotes ?? stored ?? '');
      setNoteSavedFeedback(null);
    } else {
      setReceptionNotes('');
      setNoteSavedFeedback(null);
    }
  }, [patient?.id, patient?.receptionistNotes]);

  // Safe memoization: previous appointments
  const previousAppointments = useMemo(() => {
    return patient ? getPatientPreviousAppointments(patient) : [];
  }, [patient]);

  // Safe memoization: comprehensive reports
  const defaultMedicalReports = useMemo(() => {
    return patient ? getPatientMedicalReports(patient) : [];
  }, [patient]);

  // Safe memoization: active investigations
  const activeInvestigations = useMemo(() => {
    if (!patient) return [];
    const isHistorical = selectedAppointmentId !== 'today';
    if (isHistorical) {
      const activeHistoricalAppt = previousAppointments.find((a) => a.id === selectedAppointmentId);
      if (activeHistoricalAppt?.investigations && activeHistoricalAppt.investigations.length >= 3) {
        return activeHistoricalAppt.investigations;
      }
      return defaultMedicalReports;
    }
    if (patient.investigations && patient.investigations.length >= 9) {
      return patient.investigations;
    }
    return defaultMedicalReports;
  }, [selectedAppointmentId, previousAppointments, patient, defaultMedicalReports]);

  // ALL HOOKS ARE CALLED UNCONDITIONALLY ABOVE THIS LINE.
  if (!isOpen || !patient) return null;

  const isMale = patient.gender === 'Male';
  const { steps: journeySteps, longestStep, totalTurnaroundMinutes } = getPatientJourneySteps(patient);

  // Determine active displayed dataset (Today's live data vs Replicated Historical Data)
  const isViewingHistorical = selectedAppointmentId !== 'today';
  const activeHistoricalAppt = previousAppointments.find((a) => a.id === selectedAppointmentId);

  const activeBodyComp = isViewingHistorical
    ? activeHistoricalAppt?.bodyComposition || patient.bodyComposition
    : patient.bodyComposition;

  const activeVitals = isViewingHistorical
    ? activeHistoricalAppt?.vitals || patient.vitals
    : patient.vitals;

  const activeRecords = isViewingHistorical
    ? activeHistoricalAppt?.medicalRecords || patient.medicalRecords
    : patient.medicalRecords;

  const activeAssessment = isViewingHistorical
    ? activeHistoricalAppt?.assessment || patient.assessment
    : patient.assessment;

  const activeBilling = isViewingHistorical
    ? activeHistoricalAppt?.billing || patient.billing
    : patient.billing;

  const activeDoctorName = isViewingHistorical
    ? activeHistoricalAppt?.doctorName || patient.doctorName
    : patient.doctorName;

  const activeSpecialty = isViewingHistorical
    ? activeHistoricalAppt?.doctorSpecialty || patient.specialty
    : patient.specialty;

  const activeDateLabel = isViewingHistorical
    ? `${activeHistoricalAppt?.date} at ${activeHistoricalAppt?.time}`
    : `Today, 04 Sep 2026 (${patient.appointmentTime})`;

  // Copy helper
  const handleCopyMobile = () => {
    navigator.clipboard?.writeText(patient.mobile);
    setCopiedNotification('Copied!');
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  const handleDownloadReport = (reportName: string, size?: string) => {
    setReportToast(`Downloaded ${reportName}${size ? ` (${size})` : ''}`);
    setTimeout(() => setReportToast(null), 3500);
  };

  const handlePrintReport = (reportName: string) => {
    setReportToast(`Sent "${reportName}" to clinic printer`);
    setTimeout(() => setReportToast(null), 3500);
  };

  const toggleReportExpand = (id: string) => {
    setExpandedReportIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  // Save & persist receptionist private notes to state and localStorage
  const handleSaveNotes = (customText?: string) => {
    if (!patient) return;
    const textToSave = typeof customText === 'string' ? customText : receptionNotes;
    setIsSavingNotes(true);
    try {
      localStorage.setItem(`reception_notes_${patient.id}`, textToSave);
    } catch {
      // ignore storage errors
    }
    const updatedPatient: Patient = {
      ...patient,
      receptionistNotes: textToSave,
    };
    onUpdatePatient(updatedPatient);
    setTimeout(() => {
      setIsSavingNotes(false);
      setNoteSavedFeedback('Saved');
      setTimeout(() => setNoteSavedFeedback(null), 2500);
    }, 150);
  };

  // ==========================================
  // SYMPTOMS EVALUATION HANDLERS (MA ROLE)
  // ==========================================
  const handleAddSuggestedSymptom = (suggestion: SymptomCatalogItem) => {
    const exists = symptomsList.some((s) => s.name.toLowerCase() === suggestion.name.toLowerCase());
    if (exists) return;
    const newSymptom: DetailedSymptom = {
      id: `sym-${Date.now()}`,
      name: suggestion.name,
      severity: suggestion.defaultSeverity,
      duration: symptomDurationText || '3 days',
      onset: suggestion.commonOnset,
      notes: suggestion.description,
    };
    setSymptomsList((prev) => [newSymptom, ...prev]);
  };

  const handleRemoveSymptom = (id: string) => {
    setSymptomsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSymptom = (id: string, updates: Partial<DetailedSymptom>) => {
    setSymptomsList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleAddCustomSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymptomName.trim()) return;
    const newSymptom: DetailedSymptom = {
      id: `sym-${Date.now()}`,
      name: customSymptomName.trim(),
      severity: customSymptomSeverity,
      duration: customSymptomDuration || '3 days',
      onset: customSymptomOnset,
    };
    setSymptomsList((prev) => [newSymptom, ...prev]);
    setCustomSymptomName('');
    setIsAddingCustomSymptom(false);
  };

  const handleSaveSymptoms = () => {
    if (!patient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedPatient: Patient = {
      ...patient,
      assessment: {
        ...patient.assessment,
        chiefComplaint: chiefComplaintText || patient.assessment.chiefComplaint,
        symptomsDuration: symptomDurationText,
        symptomSeverity: symptomSeverityVal,
        suspectDisease,
        detailedSymptoms: symptomsList,
        maNotes: symptomNotesText,
        subjectiveCompleted: true,
        objectiveCompleted: true,
        assessedBy: 'Anjali Mehta, CMA (MA)',
        completedAt: nowTime,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: `Symptoms Intake Updated (${symptomsList.length} symptoms logged)`,
          performedBy: 'Anjali Mehta, CMA',
          role: 'MA',
          category: 'Assessment',
          details: `Chief Complaint: ${chiefComplaintText}. Symptoms: ${symptomsList.map((s) => s.name).join(', ')}`,
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
    setSymptomSaveFeedback('Symptoms saved!');
    setTimeout(() => setSymptomSaveFeedback(null), 2500);
  };

  // ==========================================
  // MEDICAL HISTORY SEGMENT HANDLERS (MA ROLE)
  // ==========================================
  const handleAddPastConditionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondName.trim()) return;
    const newCond: PastMedicalCondition = {
      id: `cond-${Date.now()}`,
      condition: newCondName.trim(),
      diagnosedYear: newCondYear,
      status: newCondStatus,
      treatment: newCondTreatment,
    };
    setPastConditionsList((prev) => [...prev, newCond]);
    setNewCondName('');
    setNewCondTreatment('');
    setIsAddingCondition(false);
  };

  const handleRemovePastCondition = (id: string) => {
    setPastConditionsList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamCondition.trim()) return;
    const newFam: FamilyHistoryEntry = {
      id: `fam-${Date.now()}`,
      relation: newFamRelation,
      condition: newFamCondition.trim(),
      ageOfOnset: newFamAge,
      status: newFamStatus,
    };
    setFamilyHistoryList((prev) => [...prev, newFam]);
    setNewFamCondition('');
    setIsAddingFamily(false);
  };

  const handleRemoveFamily = (id: string) => {
    setFamilyHistoryList((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddSurgerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurgProcedure.trim()) return;
    const newSurg: SurgicalHistoryEntry = {
      id: `surg-${Date.now()}`,
      procedure: newSurgProcedure.trim(),
      year: newSurgYear,
      hospital: newSurgHospital,
    };
    setSurgeriesList((prev) => [...prev, newSurg]);
    setNewSurgProcedure('');
    setNewSurgHospital('');
    setIsAddingSurgery(false);
  };

  const handleRemoveSurgery = (id: string) => {
    setSurgeriesList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;
    const newAllg: AllergyEntry = {
      id: `allg-${Date.now()}`,
      allergen: newAllergen.trim(),
      reaction: newAllergyReaction,
      severity: newAllergySeverity,
    };
    setAllergiesList((prev) => [...prev, newAllg]);
    setNewAllergen('');
    setIsAddingAllergy(false);
  };

  const handleRemoveAllergy = (id: string) => {
    setAllergiesList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveMedicalHistory = () => {
    if (!patient) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedPatient: Patient = {
      ...patient,
      medicalRecords: {
        ...patient.medicalRecords,
        pastMedicalConditions: pastConditionsList,
        detailedFamilyHistory: familyHistoryList,
        detailedSurgeries: surgeriesList,
        detailedAllergies: allergiesList,
        lifestyleHabits,
        chronicConditions: pastConditionsList.map((c) => c.condition),
        familyHistory: familyHistoryList.map((f) => `${f.relation}: ${f.condition}`),
        pastSurgeries: surgeriesList.map((s) => s.procedure),
        allergies: allergiesList.map((a) => a.allergen),
        completed: true,
      },
      checkInModules: {
        ...patient.checkInModules,
        medicalRecords: true,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: 'Medical History Updated & Segmented',
          performedBy: 'Anjali Mehta, CMA',
          role: 'MA',
          category: 'Assessment',
          details: `Family history (${familyHistoryList.length}), past conditions (${pastConditionsList.length}), allergies (${allergiesList.length}) validated.`,
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
    setHistorySaveFeedback('Medical history saved!');
    setTimeout(() => setHistorySaveFeedback(null), 2500);
  };

  // BMI calculation & classification helper
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (bmi < 24.9) return { label: 'Normal', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (bmi < 29.9) return { label: 'Overweight', color: 'text-amber-800 bg-amber-100 border-amber-300' };
    return { label: 'Obese', color: 'text-amber-900 bg-amber-200/80 border-amber-400' };
  };

  const bmiCat = getBmiCategory(activeBodyComp?.bmi || 24);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex justify-center items-start p-2.5 sm:p-4 md:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 3-Column Modal Layout - Surrounding main box removed */}
      <div
        id="patient-profile-modal-container"
        className="w-full max-w-[1380px] h-[calc(100vh-20px)] sm:h-[calc(100vh-32px)] md:h-[calc(100vh-40px)] max-h-[890px] flex flex-col gap-3 shrink-0 my-auto pointer-events-auto"
      >
        {/* ========================================================= */}
        {/* TOP COMMAND HEADER CARD (Floating White Card)             */}
        {/* ========================================================= */}
        <header className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 shadow-md flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left: Patient Identity Capsule */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Fully Rounded / Circle Patient Avatar Photo */}
              <div className="relative shrink-0">
                {patient.avatarUrl ? (
                  <img
                    src={patient.avatarUrl}
                    alt={patient.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs border border-slate-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center ring-2 ring-slate-100 shadow-2xs">
                    {patient.name
                      .split(' ')
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
              </div>

              {/* Name, PID, Status, Doctor & Subtitle */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-slate-900 text-lg sm:text-xl truncate leading-tight">
                    {patient.name}
                  </h2>

                  {/* PID Pill */}
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-700 bg-slate-50 border border-slate-200/90 px-2 py-0.5 rounded-md shadow-2xs">
                    <Fingerprint className="w-3 h-3 text-slate-400" />
                    PID-{patient.patientNumber || patient.patientIdNumber}
                  </span>

                  {/* Status Pill */}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50">
                    {patient.status === 'IN CONSULTATION'
                      ? 'In Consultation'
                      : patient.status === 'IN QUEUE'
                      ? 'In Queue'
                      : patient.status === 'CHECK-IN'
                      ? 'Check-In'
                      : patient.status === 'ASSESSMENT'
                      ? 'Assessment'
                      : patient.status === 'DONE'
                      ? 'Completed'
                      : patient.status}
                  </span>

                  {/* Divider */}
                  <span className="text-slate-300 font-light hidden sm:inline">|</span>

                  {/* Doctor */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Doctor: {activeDoctorName} ({activeSpecialty})
                    </span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium truncate mt-1">
                  {patient.age} Y • {patient.gender} | {patient.mobile}
                </p>
              </div>
            </div>

            {/* Right: Date Timestamp and Close Button */}
            <div className="flex items-center gap-3 shrink-0">
              {onSendToDoctor && (patient.status === 'CHECK-IN' || patient.status === 'ASSESSMENT') && (
                <button
                  type="button"
                  onClick={() => {
                    onSendToDoctor(patient.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Route patient to Doctor Waiting Queue"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Send to Doctor</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsTimelineModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/90 rounded-xl shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                title="View full patient journey timeline and past visits"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>View Timeline</span>
              </button>

              <span className="text-xs font-bold text-blue-700 font-mono tracking-wider uppercase">
                TODAY, 04 SEP 2026 ({patient.appointmentTime || '11:45 AM'})
              </span>

              <button
                type="button"
                onClick={onClose}
                title="Close (Esc)"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sticky Navigation & Universal Back Bar with Previous Location Label */}
          {previousLocationLabel && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <UniversalBackButton
                onBack={handleBackNavigation}
                previousLabel={previousLocationLabel}
                currentLabel={getTabLabel(activeTab)}
                variant="pill"
              />
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                Click Back anytime to restore previous clinical tab & scroll position
              </span>
            </div>
          )}
        </header>

        {/* ========================================================= */}
        {/* 3-COLUMN LAYOUT: LEFT (Cards), CENTER (Workspace), RIGHT (Visits) */}
        {/* ========================================================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
          {/* ======================================================= */}
          {/* 1. LEFT COLUMN: 3 INDIVIDUAL WHITE CARDS                */}
          {/* ======================================================= */}
          <aside className="lg:col-span-3 xl:col-span-2.5 flex flex-col gap-3 overflow-y-auto pr-0.5 scrollbar-thin">
            {/* Card 1: Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-md space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs tracking-tight">Basic Information</h4>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Blood group</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{patient.form?.bloodGroup || 'A+'}</span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Mobile phone</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{patient.mobile}</span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Registered address</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {patient.form?.address || 'Paldi, Ahmedabad–380007'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Emergency contact</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {patient.form?.emergencyContactRelation || 'Spouse'}: {patient.form?.emergencyContactMobile || '+1234567890'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Occupation</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {patient.form?.occupation || 'Government Officer'}
                </span>
              </div>
            </div>

            {/* Card 2: Visit Classification */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-md space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs tracking-tight">Visit Classification</h4>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Booking channel</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{patient.appointmentType || 'Walk-in'}</span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">Visit category</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{patient.visitType || 'New Patient'}</span>
              </div>
            </div>

            {/* Card 3: Receptionist Note */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs tracking-tight">Receptionist Note</h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Confidential front-desk reminders and clinical alerts for this patient.
              </p>

              <textarea
                value={receptionNotes}
                onChange={(e) => setReceptionNotes(e.target.value)}
                onBlur={() => handleSaveNotes()}
                placeholder="Type private notes or reminders..."
                rows={3}
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 resize-none bg-slate-50/50"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Wheelchair needed', 'Call family post-visit'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const newText = receptionNotes.trim()
                        ? `${receptionNotes.trim()}\n• ${tag}`
                        : `• ${tag}`;
                      setReceptionNotes(newText);
                      handleSaveNotes(newText);
                    }}
                    className="text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200/80 hover:bg-sky-100 px-3 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ======================================================= */}
          {/* 2. MIDDLE COLUMN: MAIN WORKSPACE CARD (Tabs & Content)  */}
          {/* ======================================================= */}
          <main className="lg:col-span-5 xl:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-md flex flex-col min-h-0 overflow-hidden">
            {/* Top Pill Tab Bar & Contextual Back Tracker */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 shrink-0 pb-2 border-b border-slate-100">
              <div className="bg-slate-100/90 p-1 rounded-full inline-flex items-center gap-1 self-start flex-wrap">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'records', label: 'Records', icon: FileText },
                  { id: 'vitals', label: 'Vitals', icon: Activity },
                  { id: 'symptoms', label: 'Symptoms', icon: Sparkles },
                  { id: 'history', label: 'Medical History', icon: Heart },
                  { id: 'trends', label: 'View Trends', icon: TrendingUp },
                  { id: 'doctor-view', label: 'Doctor View', icon: Stethoscope },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSel = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (activeTab !== t.id) {
                          const curLabel =
                            activeTab === 'overview' ? 'AI Case Presentation' : getTabLabel(activeTab);
                          setModalNavHistory((prev) => [
                            ...prev,
                            { tab: activeTab, label: curLabel },
                          ]);
                          setActiveTab(t.id as TabType);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#2f5597] text-white shadow-xs font-bold ring-2 ring-blue-400/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {previousLocationLabel && (
                <UniversalBackButton
                  onBack={handleBackNavigation}
                  previousLabel={previousLocationLabel}
                  variant="pill"
                  className="hidden xl:flex"
                />
              )}
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div ref={tabContentRef} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {/* =================================================== */}
              {/* TAB 1: OVERVIEW                                     */}
              {/* =================================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-3.5">
                  {/* TOP QUICK ACTION BUTTONS FOR RECEPTIONIST & MA */}
                  <div className="space-y-2 pb-3 border-b border-slate-100">
                    {/* Above upload records, take vitals: Add Symptom button for Medical Assistant */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('symptoms');
                        setIsSymptomsPopupOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-teal-100" />
                      <span>Add Symptom</span>
                    </button>

                    {/* 2 buttons placed side by side: Upload Records, Take Vitals */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsUploadRecordModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-extrabold text-xs bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload Records</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('vitals');
                          setIsEditingVitals(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-extrabold text-xs bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-200/90 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>Take Vitals</span>
                      </button>
                    </div>

                    {/* Full width button of "complete intake form" below that */}
                    <button
                      type="button"
                      onClick={() => setIsIntakeModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs text-white bg-[#2f5597] hover:bg-[#254680] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <ClipboardList className="w-4 h-4 text-blue-200" />
                      <span>Complete Intake Form</span>
                    </button>

                    {/* Below that: review information (only when new information is filled or updated) */}
                    {hasNewInformation && (
                      <button
                        type="button"
                        onClick={() => setIsReviewInfoModalOpen(true)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs transition-all cursor-pointer animate-in fade-in active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                          <span className="font-extrabold">Review Information</span>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                            {newInformationUpdates.length > 0
                              ? `${newInformationUpdates.length} updates logged`
                              : 'New updates filled'}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold text-amber-900 underline decoration-amber-400">
                          Verify now →
                        </span>
                      </button>
                    )}
                  </div>
                  {/* ========================================================= */}
                  {/* AUTOMATED CASE SUMMARY (Generated from patient records)   */}
                  {/* ========================================================= */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          Automated Clinical Case Summary
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • Data as of {activeDateLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('trends')}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <TrendingUp className="w-3 h-3 text-cyan-300" />
                          <span>Compare Trends</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('records')}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-amber-300" />
                          <span>All Records</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                        {patient.name}, {patient.age}Y {patient.gender} — {chiefComplaintText || activeAssessment?.chiefComplaint || 'Clinical evaluation and cardiovascular risk management'}
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        Patient presents with <strong className="text-white font-bold">{chiefComplaintText || activeAssessment?.chiefComplaint}</strong> lasting{' '}
                        <strong className="text-cyan-300 font-bold">{symptomDurationText || activeAssessment?.symptomsDuration || '2 weeks'}</strong>.
                        Known history of {pastConditionsList.length > 0 ? pastConditionsList.map(c => `${c.condition} (${c.status})`).join(', ') : 'no previous chronic conditions'}.
                        Baseline BP is <strong className="text-white font-bold">{activeVitals?.bpSystolic}/{activeVitals?.bpDiastolic} mmHg</strong>, Pulse{' '}
                        <strong className="text-white font-bold">{activeVitals?.pulse} bpm</strong>, BMI{' '}
                        <strong className="text-amber-300 font-bold">{activeBodyComp?.bmi} ({bmiCat.label})</strong>.
                        {allergiesList.length > 0 ? ` Allergy alert: ${allergiesList.map(a => `${a.allergen} [${a.reaction}]`).join(', ')}.` : ' No documented allergies.'}
                      </p>
                    </div>

                    {/* Quick Highlights Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/80 text-xs">
                      <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Primary Triage</span>
                        <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                          {symptomSeverityVal} Severity
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Reported Symptoms</span>
                        <span className="font-extrabold text-cyan-300 text-xs mt-0.5 block">
                          {symptomsList.length > 0 ? `${symptomsList.length} Logged` : 'Under evaluation'}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Known Conditions</span>
                        <span className="font-extrabold text-emerald-300 text-xs mt-0.5 block">
                          {pastConditionsList.length} Active / Managed
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Uploaded Records</span>
                        <span className="font-extrabold text-amber-300 text-xs mt-0.5 block">
                          {(patient.uploadedRecords?.length ?? 0) + (patient.investigations?.length ?? 0)} Documents
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 1. PATIENT REGISTRATION & DEMOGRAPHICS (PATIENT FILLED)   */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs tracking-tight">
                            Patient Identification & Demographics
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Intake registration information filled by patient
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        MRN: {patient.patientNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Full Name</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                          {patient.form?.fullName || patient.name}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Age & Biological Sex</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                          {patient.age} Y • {patient.gender}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Date of Birth</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                          {patient.dob || patient.form?.dob || '14 May 1971'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Blood Group</span>
                        <span className="font-black text-rose-700 text-xs mt-0.5 block">
                          {patient.form?.bloodGroup || 'O+ (Rh Positive)'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Marital Status</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                          {patient.form?.maritalStatus || 'Married'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Occupation</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                          {patient.form?.occupation || 'Government Officer'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">Primary Language</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                          {patient.form?.preferredLanguage || 'English, Hindi'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 block">ID Document</span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                          {patient.form?.idType || 'Aadhaar'}: {patient.form?.idNumber || 'XXXX-XXXX-9821'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 2. CONTACT & EMERGENCY NETWORK                            */}
                  {/* ========================================================= */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Direct Contact */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Patient Contact Channels</h4>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Mobile Phone:</span>
                          <span className="font-bold text-slate-900 font-mono">{patient.mobile}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Email Address:</span>
                          <span className="font-bold text-slate-900 truncate max-w-[180px]">{patient.email}</span>
                        </div>
                        <div className="flex items-start justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-400 font-medium shrink-0">Address:</span>
                          <span className="font-semibold text-slate-800 text-right text-[11px] max-w-[200px]">
                            {patient.form?.address || patient.address || 'Flat 402, Green Valley Apartments, Andheri West, Mumbai'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Emergency Contact Person</h4>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Contact Name:</span>
                          <span className="font-bold text-slate-900">
                            {patient.form?.emergencyContactName || 'Sunita Doe'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Relationship:</span>
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 text-[11px]">
                            {patient.form?.emergencyContactRelation || 'Spouse'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-400 font-medium">Emergency Phone:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {patient.form?.emergencyContactPhone || '+91 98200 45678'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 3. LIFESTYLE, HABITS & MENTAL HEALTH PROFILE              */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Footprints className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Lifestyle, Functional Habits & Mental Health</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Patient self-reported intake</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Dietary Pattern</span>
                        <span className="font-bold text-slate-800 text-xs mt-1 block">
                          {patient.form?.lifestyle?.diet || 'Non-Vegetarian'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Low-sodium advice noted</span>
                      </div>

                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Smoking History</span>
                        <span className="font-bold text-slate-800 text-xs mt-1 block">
                          {patient.form?.lifestyle?.smoking || 'Former smoker (Quit 2021)'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Approx. 6 pack-years</span>
                      </div>

                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Alcohol Use</span>
                        <span className="font-bold text-slate-800 text-xs mt-1 block">
                          {patient.form?.lifestyle?.alcohol || 'Occasional / Social'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">1-2 drinks/month</span>
                      </div>

                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Physical Activity</span>
                        <span className="font-bold text-slate-800 text-xs mt-1 block">
                          {patient.form?.lifestyle?.physicalActivity || 'Light walking (20 min/day)'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Sedentary desk job</span>
                      </div>

                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sleep Pattern</span>
                        <span className="font-bold text-slate-800 text-xs mt-1 block">
                          {patient.form?.lifestyle?.sleepHours || '6 - 7 hours/night'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Occasional nocturnal waking</span>
                      </div>

                      <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Stress & Mental Health</span>
                        <span className="font-bold text-purple-700 text-xs mt-1 block">
                          {patient.form?.lifestyle?.stressLevel || 'Moderate workplace stress'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Denies panic / anxiety disorder</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 4. BASELINE VITALS & ANTHROPOMETRIC MEASUREMENTS           */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Baseline Clinical Vitals & Body Composition</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('vitals')}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        View Full Vitals Tab →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Blood Pressure
                        </span>
                        <div className="text-base font-black text-slate-900 mt-0.5">
                          {activeVitals?.bpSystolic}/{activeVitals?.bpDiastolic}{' '}
                          <span className="text-[10px] font-medium text-slate-400">mmHg</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block border border-emerald-200">
                          Optimal Control
                        </span>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Heart Rate
                        </span>
                        <div className="text-base font-black text-slate-900 mt-0.5">
                          {activeVitals?.pulse} <span className="text-[10px] font-medium text-slate-400">bpm</span>
                        </div>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-1 inline-block border border-blue-200">
                          Regular Rhythm
                        </span>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          SpO2 Saturation
                        </span>
                        <div className="text-base font-black text-slate-900 mt-0.5">
                          {activeVitals?.spo2}%
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block border border-emerald-200">
                          Ambient Air
                        </span>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Body Temperature
                        </span>
                        <div className="text-base font-black text-slate-900 mt-0.5">
                          {activeVitals?.temperature ?? 98.6}°F
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded mt-1 inline-block border border-slate-200">
                          Afebrile
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Height:</span>
                        <span className="font-extrabold text-slate-900">{activeBodyComp?.heightCm} cm</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Weight:</span>
                        <span className="font-extrabold text-slate-900">{activeBodyComp?.weightKg} kg</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">BMI:</span>
                        <span className={`font-extrabold px-1.5 py-0.2 rounded ${bmiCat.color}`}>
                          {activeBodyComp?.bmi} ({bmiCat.label})
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Waist:</span>
                        <span className="font-extrabold text-slate-900">{activeBodyComp?.waistCm || 92} cm</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 5. CONSOLIDATED 7-DOMAIN MEDICAL HISTORY SNAPSHOT          */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-600" />
                        <h4 className="font-bold text-slate-900 text-xs">
                          7-Domain Medical History Snapshot
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Open Medical History Tab →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Domain 1: Known / Active Conditions (Auto-sorted Chronic vs Non-chronic) */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          1. Known / Active Conditions
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {pastConditionsList.length > 0 ? (
                            pastConditionsList.map((cond) => {
                              const isChronic = /diabet|hypert|asthma|copd|cad|thyroid|dyslipid|arthritis/i.test(cond.condition);
                              return (
                                <span
                                  key={cond.id}
                                  className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                                    isChronic
                                      ? 'bg-blue-50 text-blue-900 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  }`}
                                >
                                  {cond.condition} ({cond.diagnosedYear || 'Chronic'}) • {cond.status}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-400 italic">No conditions on file</span>
                          )}
                        </div>
                      </div>

                      {/* Domain 2: Allergies & Sensitivities (Food, Drug, Environment) */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          2. Allergies & Sensitivities
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {allergiesList.length > 0 ? (
                            allergiesList.map((alg) => (
                              <span
                                key={alg.id}
                                className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md"
                              >
                                ⚠️ {alg.allergen} ({alg.reaction} · {alg.severity})
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No known drug/food allergies</span>
                          )}
                        </div>
                      </div>

                      {/* Domain 3: Medications (Painkiller, Antacid, Antihypertensive, etc.) */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          3. Current Medications
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(patient.medicalRecords?.currentMedications && patient.medicalRecords.currentMedications.length > 0) ? (
                            patient.medicalRecords.currentMedications.map((med, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md"
                              >
                                💊 {med}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No daily prescriptions logged</span>
                          )}
                        </div>
                      </div>

                      {/* Domain 4: Surgical & Hospitalization History */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          4. Surgical & Hospitalization History
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {surgeriesList.length > 0 ? (
                            surgeriesList.map((surg) => (
                              <span
                                key={surg.id}
                                className="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md"
                              >
                                🏥 {surg.procedure} ({surg.year || 'Past'})
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No past surgeries recorded</span>
                          )}
                        </div>
                      </div>

                      {/* Domain 5: Family & Genetic History */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          5. Family & Genetic History
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {familyHistoryList.length > 0 ? (
                            familyHistoryList.map((fam) => (
                              <span
                                key={fam.id}
                                className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md"
                              >
                                🧬 {fam.relation}: {fam.condition}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Non-contributory</span>
                          )}
                        </div>
                      </div>

                      {/* Domain 6: Immunization Records */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          6. Immunization Records
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(patient.medicalRecords?.vaccinations && patient.medicalRecords.vaccinations.length > 0) ? (
                            patient.medicalRecords.vaccinations.map((vac, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md"
                              >
                                💉 {vac}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Up to date</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Domain 7: Remarks */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs flex items-start gap-2">
                      <StickyNote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-amber-950 block">7. Medical Remarks & Clinical Notes:</span>
                        <p className="text-amber-900 font-medium mt-0.5">
                          {patient.medicalRecords?.remarks || 'Patient monitored for CAD prevention and metabolic control. Adherent with lifestyle changes.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 6. ACTIVE REPORTED SYMPTOMS & CHIEF COMPLAINTS            */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-slate-900 text-xs">
                          Active Symptoms & Chief Complaints Intake
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('symptoms');
                          setIsSymptomsPopupOpen(true);
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        + Add / Modify Symptoms →
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            Primary Complaint:
                          </span>
                          <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {chiefComplaintText || activeAssessment?.chiefComplaint || 'Exertional chest pain'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <span>Duration: {symptomDurationText || activeAssessment?.symptomsDuration || '2 weeks'}</span>
                          <span>•</span>
                          <span className="text-amber-700">Severity: {symptomSeverityVal}</span>
                        </div>
                      </div>

                      {/* Logged detailed symptoms list */}
                      {symptomsList.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {symptomsList.map((sym) => (
                            <div
                              key={sym.id}
                              className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 text-xs">{sym.name}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {sym.severity}
                                  </span>
                                  {sym.duration && (
                                    <span className="text-[10px] text-slate-400">({sym.duration})</span>
                                  )}
                                </div>
                                {sym.character && (
                                  <p className="text-[11px] text-slate-600 mt-0.5">
                                    Character: <strong>{sym.character}</strong>
                                    {sym.radiation && ` • Radiation: ${sym.radiation}`}
                                  </p>
                                )}
                                {sym.notes && (
                                  <p className="text-[11px] text-teal-800 font-medium italic mt-0.5">
                                    Remarks: "{sym.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No additional specific symptoms logged</p>
                      )}
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 7. DIAGNOSTIC HEALTH RECORDS & INVESTIGATIONS SUMMARY     */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-xs">
                          Diagnostic Records & Lab Tests Summary
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('records')}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Open Records Tab →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block">Pathology Labs</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">6 Reports</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block">Radiology / ECG</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">3 Reports</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block">Prescriptions</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">4 Documents</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block">Discharge Summaries</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">1 File</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 8. CLINICAL TRIAGE REMARKS & RECEPTIONIST NOTES           */}
                  {/* ========================================================= */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Clinical Triage Remarks</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {activeAssessment?.assessedBy || 'MA Anjali Mehta, CMA'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {symptomNotesText ||
                        activeAssessment?.maNotes ||
                        activeAssessment?.objectiveFindings ||
                        'Patient oriented, alert and cooperative. Baseline vitals within acceptable therapeutic limits.'}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 2: VITALS & BODY COMPOSITION (MERGED, TAKEN BY RECEPTIONIST) */}
              {/* =================================================== */}
              {/* =================================================== */}
              {/* TAB 2: VITALS & BODY COMPOSITION (MATCHING SCREENSHOT) */}
              {/* =================================================== */}
              {activeTab === 'vitals' && (
                <div className="space-y-4">
                  {/* TOP ACTION IN VITALS TAB: "Take New Reading" */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVitalsEditForm({
                          bpSystolic: activeVitals?.bpSystolic ?? 120,
                          bpDiastolic: activeVitals?.bpDiastolic ?? 80,
                          pulse: activeVitals?.pulse ?? 72,
                          spo2: activeVitals?.spo2 ?? 99,
                          temperature: activeVitals?.temperature ?? 98.6,
                          heightCm: activeBodyComp?.heightCm ?? 162,
                          weightKg: activeBodyComp?.weightKg ?? 79,
                        });
                        setIsEditingVitals(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#2f5597] hover:bg-[#254680] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Activity className="w-4 h-4 text-blue-200" />
                      <span>Take New Reading</span>
                    </button>

                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                      Stable Hemodynamics Monitored
                    </span>
                  </div>

                  {vitalsSaveFeedback && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between">
                      <span>✓ {vitalsSaveFeedback}</span>
                      <button
                        type="button"
                        onClick={() => setVitalsSaveFeedback(null)}
                        className="text-emerald-600 hover:text-emerald-900 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* SECTION 1: Physiological Vitals & Hemodynamics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm">
                        Physiological Vitals & Hemodynamics
                      </h3>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                        Stable Hemodynamics
                      </span>
                    </div>

                    {/* Row 1: 4 Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Blood pressure */}
                      <div id="evidence-vital-bp" className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[96px] transition-all">
                        <span className="text-xs font-medium text-slate-500">Blood pressure</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeVitals?.bpSystolic ?? 120}/{activeVitals?.bpDiastolic ?? 80}{' '}
                          <span className="text-xs font-normal text-slate-400">mmHg</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block">
                            Normal
                          </span>
                        </div>
                      </div>

                      {/* Heart rate */}
                      <div id="evidence-vital-pulse" className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[96px] transition-all">
                        <span className="text-xs font-medium text-slate-500">Heart rate</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeVitals?.pulse ?? 72}{' '}
                          <span className="text-xs font-normal text-slate-400">bpm</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full inline-block">
                            Sinus rhythm
                          </span>
                        </div>
                      </div>

                      {/* SpO2 saturation */}
                      <div id="evidence-vital-spo2" className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[96px] transition-all">
                        <span className="text-xs font-medium text-slate-500">SpO2 saturation</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeVitals?.spo2 ?? 99}%{' '}
                          <span className="text-xs font-normal text-slate-400">Room air</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block">
                            Optimal
                          </span>
                        </div>
                      </div>

                      {/* Oxygen SPO2 */}
                      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[96px]">
                        <span className="text-xs font-medium text-slate-500">Oxygen SPO2</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeVitals?.spo2 ? Math.min(activeVitals.spo2, 98) : 98}%
                        </div>
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block">
                            Normal
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Body Temperature (separate card below row 1) */}
                    <div className="w-full sm:w-1/4">
                      <div id="evidence-vital-temp" className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[96px] transition-all">
                        <span className="text-xs font-medium text-slate-500">Body Temperature</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeVitals?.temperature ?? 99}{' '}
                          <span className="text-xs font-normal text-slate-400">°F</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block">
                            Normal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Anthropometry & Body Composition */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm">
                        Anthropometry & Body Composition
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${bmiCat.color}`}>
                        {bmiCat.label}
                      </span>
                    </div>

                    {/* 4 Anthropometry Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Height */}
                      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[84px]">
                        <span className="text-xs font-medium text-slate-500">Height</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeBodyComp?.heightCm ?? 162}{' '}
                          <span className="text-xs font-normal text-slate-400">cm</span>
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[84px]">
                        <span className="text-xs font-medium text-slate-500">Weight</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xl font-black text-slate-900">
                            {activeBodyComp?.weightKg ?? 79}
                          </span>
                          <span className="text-xs font-normal text-slate-400">kg</span>
                          <span className="text-xs font-bold text-emerald-600 flex items-center">
                            ↓ 2kg
                          </span>
                        </div>
                      </div>

                      {/* BMI */}
                      <div id="evidence-vital-bmi" className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[84px] transition-all">
                        <span className="text-xs font-medium text-slate-500">BMI</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeBodyComp?.bmi ?? 25.9}{' '}
                          <span className="text-xs font-normal text-slate-400">kg/m²</span>
                        </div>
                      </div>

                      {/* Body Fat */}
                      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[84px]">
                        <span className="text-xs font-medium text-slate-500">Body Fat</span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {activeBodyComp?.bodyFatPercentage ?? 29.5}%
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Muscle: {activeBodyComp?.muscleMassKg ?? 42} kg
                        </span>
                      </div>
                    </div>

                    {/* Continuous BMI Scale Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5 px-0.5">
                        <span>Underweight &lt;18.5</span>
                        <span className="text-emerald-700 font-semibold">Normal 18.5–24.9</span>
                        <span className="text-amber-700 font-semibold">Overweight 25–29.9</span>
                        <span className="text-rose-700">Obese 30+</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                        <div className="bg-amber-400 w-1/4" />
                        <div className="bg-emerald-500 w-1/4" />
                        <div className="bg-amber-500 w-1/4" />
                        <div className="bg-rose-500 w-1/4" />
                      </div>
                    </div>

                    {/* Bottom Right: Update Vitals Button / Form */}
                    <div className="pt-3 flex items-center justify-end">
                      {!isEditingVitals ? (
                        <button
                          type="button"
                          onClick={() => {
                            setVitalsEditForm({
                              bpSystolic: activeVitals?.bpSystolic ?? 120,
                              bpDiastolic: activeVitals?.bpDiastolic ?? 80,
                              pulse: activeVitals?.pulse ?? 72,
                              spo2: activeVitals?.spo2 ?? 99,
                              temperature: activeVitals?.temperature ?? 98.6,
                              heightCm: activeBodyComp?.heightCm ?? 162,
                              weightKg: activeBodyComp?.weightKg ?? 79,
                            });
                            setIsEditingVitals(true);
                          }}
                          className="bg-[#2f5597] hover:bg-[#254680] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Update vitals</span>
                        </button>
                      ) : (
                        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <h4 className="font-bold text-xs text-slate-800">Update Patient Vitals & Anthropometry</h4>
                            <span className="text-[11px] text-slate-500">Live Intake</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">Systolic BP</label>
                              <input
                                type="number"
                                value={vitalsEditForm.bpSystolic}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, bpSystolic: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">Diastolic BP</label>
                              <input
                                type="number"
                                value={vitalsEditForm.bpDiastolic}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, bpDiastolic: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">Heart Rate (bpm)</label>
                              <input
                                type="number"
                                value={vitalsEditForm.pulse}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, pulse: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">SpO2 (%)</label>
                              <input
                                type="number"
                                value={vitalsEditForm.spo2}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, spo2: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">Temp (°F)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={vitalsEditForm.temperature}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, temperature: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">Height (cm)</label>
                              <input
                                type="number"
                                value={vitalsEditForm.heightCm}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, heightCm: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 block">Weight (kg)</label>
                              <input
                                type="number"
                                value={vitalsEditForm.weightKg}
                                onChange={(e) => setVitalsEditForm({ ...vitalsEditForm, weightKg: Number(e.target.value) })}
                                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingVitals(false)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveUpdatedVitals}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-[#2f5597] hover:bg-[#254680] rounded-xl shadow-xs cursor-pointer"
                            >
                              Save Vitals
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 3: RECORDS (MERGED INVESTIGATIONS & RECORDS)   */}
              {/* =================================================== */}
              {activeTab === 'records' && (
                <div className="space-y-4">
                  {/* Top Bar: Header "Records" and "Upload Record" button */}
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#2f5597]" />
                        <h3 className="font-black text-slate-900 text-base">Records</h3>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {(patient.uploadedRecords?.length || 0) + activeInvestigations.length} Total Files & Reports
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Centralized repository for diagnostic scans, uploaded files, and laboratory investigations.
                      </p>
                    </div>

                    {/* TOP ACTION BUTTON: Upload Record */}
                    <button
                      type="button"
                      onClick={() => setIsUploadRecordModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#2f5597] hover:bg-[#254680] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Upload className="w-4 h-4 text-blue-200" />
                      <span>Upload Record</span>
                    </button>
                  </div>

                  {/* Sub-navigation Filters for Merged Records */}
                  <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 flex-wrap">
                    {[
                      { id: 'all', label: 'All Records', count: (patient.uploadedRecords?.length || 0) + activeInvestigations.length },
                      { id: 'diagnostic', label: 'Diagnostic Scans & Uploads', count: patient.uploadedRecords?.length || 0 },
                      { id: 'investigations', label: 'Laboratory & Investigations', count: activeInvestigations.length },
                      { id: 'history', label: 'Clinical Profile', count: (activeRecords?.allergies?.length || 0) + (activeRecords?.chronicConditions?.length || 0) },
                    ].map((sf) => (
                      <button
                        key={sf.id}
                        type="button"
                        onClick={() => setRecordsSubFilter(sf.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          recordsSubFilter === sf.id
                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{sf.label}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            recordsSubFilter === sf.id
                              ? 'bg-[#2f5597] text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {sf.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Toast Feedback */}
                  {reportToast && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{reportToast}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReportToast(null)}
                        className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* SECTION A: DIAGNOSTIC SCANS & UPLOADED RECORDS */}
                  {(recordsSubFilter === 'all' || recordsSubFilter === 'diagnostic') && (
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <FolderArchive className="w-4 h-4 text-blue-600" />
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            Uploaded Diagnostic Scans & External Records ({patient.uploadedRecords?.length || 0})
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Chronologically indexed by extracted document date
                        </span>
                      </div>

                      {patient.uploadedRecords && patient.uploadedRecords.length > 0 ? (
                        <div className="space-y-3">
                          {patient.uploadedRecords.map((rec) => {
                            const isHighlighted = highlightedRecordId === rec.id;
                            const isTmtRec = rec.title.toLowerCase().includes('tmt');
                            const isEcgRec = rec.title.toLowerCase().includes('ecg');
                            const recCardId = isTmtRec
                              ? 'evidence-report-tmt'
                              : isEcgRec
                              ? 'evidence-report-ecg'
                              : `record-card-${rec.id}`;

                            return (
                              <div
                                key={rec.id}
                                id={recCardId}
                                className={`p-4 rounded-xl border transition-all ${
                                  isHighlighted
                                    ? 'ring-2 ring-blue-500 bg-blue-50/70 border-blue-400 shadow-md'
                                    : rec.isCritical
                                    ? 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-2xs'
                                    : 'bg-slate-50/70 border-slate-200/90 text-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                          rec.isCritical
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : 'bg-blue-50 text-blue-800 border-blue-200'
                                        }`}
                                      >
                                        {rec.category}
                                      </span>
                                      <h5 className="font-black text-sm text-slate-900">{rec.title}</h5>
                                      {rec.isCritical && (
                                        <span className="text-[9px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
                                          CRITICAL REPORT
                                        </span>
                                      )}
                                    </div>

                                    {/* Extracted Document Date vs Uploaded On Callout */}
                                    <div className="flex items-center gap-3 text-xs flex-wrap pt-0.5">
                                      <div className="flex items-center gap-1 font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        <Calendar className="w-3 h-3 text-blue-600" />
                                        <span>Extracted Date: {formatExtractedScanDate(rec.scanDate)}</span>
                                      </div>

                                      <div className="flex items-center gap-1 font-semibold text-slate-600 bg-amber-50/80 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                                        <Clock className="w-3 h-3 text-amber-700" />
                                        <span>{formatUploadedOnDate(rec.uploadedAt)}</span>
                                      </div>

                                      {rec.sourceClinic && (
                                        <span className="text-[11px] text-slate-500 font-medium">
                                          Facility: {rec.sourceClinic}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadReport(rec.title, rec.fileSize)}
                                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5 text-slate-600" />
                                      <span>Download ({rec.fileSize || '1.8 MB'})</span>
                                    </button>
                                  </div>
                                </div>

                                {rec.criticalSummary && (
                                  <div className="mt-2.5 text-xs font-bold text-rose-900 bg-rose-100/90 p-2.5 rounded-xl border border-rose-300 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{rec.criticalSummary}</span>
                                  </div>
                                )}

                                {rec.importantHighlights && rec.importantHighlights.length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Key Observations:
                                    </span>
                                    {rec.importantHighlights.map((hl, idx) => (
                                      <span
                                        key={idx}
                                        className={`text-xs px-2.5 py-0.5 rounded-md border font-medium ${
                                          hl.includes('CRITICAL') || hl.includes('HIGH') || hl.includes('Acute')
                                            ? 'bg-rose-100 text-rose-950 border-rose-300 font-bold'
                                            : 'bg-white text-slate-700 border-slate-200'
                                        }`}
                                      >
                                        {hl}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <FolderArchive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No uploaded diagnostic scans yet.</p>
                          <button
                            type="button"
                            onClick={() => setIsUploadRecordModalOpen(true)}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload the first document</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTION B: LABORATORY & INVESTIGATION REPORTS (MERGED HERE) */}
                  {(recordsSubFilter === 'all' || recordsSubFilter === 'investigations') && (
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                      {/* Subheader with Search & Department Filters */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-blue-600" />
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            Clinical Laboratory & Pathology Findings ({activeInvestigations.length})
                          </h4>
                        </div>

                        {/* Search Bar */}
                        <div className="relative min-w-[200px]">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={reportSearchTerm}
                            onChange={(e) => setReportSearchTerm(e.target.value)}
                            placeholder="Filter investigations..."
                            className="w-full pl-8 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          />
                          {reportSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setReportSearchTerm('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Department Filter Pills */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {(
                          [
                            { id: 'all', label: 'All Depts' },
                            { id: 'Laboratory', label: 'Laboratory' },
                            { id: 'Pathology', label: 'Pathology' },
                            { id: 'Radiology', label: 'Radiology' },
                            { id: 'Physiotherapy', label: 'Physiotherapy' },
                          ] as const
                        ).map((tab) => {
                          const count =
                            tab.id === 'all'
                              ? activeInvestigations.length
                              : activeInvestigations.filter((i) => i.department === tab.id).length;
                          const isSelected = reportFilter === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setReportFilter(tab.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#2f5597] text-white border-[#2f5597]'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span
                                className={`text-[9px] px-1 py-0.1 rounded-full font-bold ${
                                  isSelected ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Investigations Cards List */}
                      <div className="space-y-3">
                        {activeInvestigations
                          .filter((inv) => {
                            const matchesDept = reportFilter === 'all' || inv.department === reportFilter;
                            if (!matchesDept) return false;
                            if (!reportSearchTerm.trim()) return true;
                            const q = reportSearchTerm.toLowerCase();
                            return (
                              inv.name.toLowerCase().includes(q) ||
                              inv.id.toLowerCase().includes(q) ||
                              inv.department.toLowerCase().includes(q)
                            );
                          })
                          .map((inv) => {
                            const isExpanded = expandedReportIds[inv.id] !== false;
                            const hasFlagged = inv.findings?.some((f) => f.status === 'High' || f.status === 'Low');

                            const isLipid = inv.name.toLowerCase().includes('lipid');
                            const isCreatinine = inv.name.toLowerCase().includes('renal') || inv.name.toLowerCase().includes('creatinine');
                            const isHbA1c = inv.name.toLowerCase().includes('hba1c') || inv.name.toLowerCase().includes('glucose');
                            const isTMT = inv.name.toLowerCase().includes('tmt') || inv.name.toLowerCase().includes('stress') || inv.name.toLowerCase().includes('ecg');
                            const cardId = isLipid
                              ? 'evidence-report-lipid'
                              : isCreatinine
                              ? 'evidence-report-creatinine'
                              : isHbA1c
                              ? 'evidence-report-hba1c'
                              : isTMT
                              ? 'evidence-report-tmt'
                              : `inv-card-${inv.id}`;

                            return (
                              <div
                                key={inv.id}
                                id={cardId}
                                className={`rounded-xl border transition-all overflow-hidden ${
                                  hasFlagged ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-white'
                                }`}
                              >
                                {/* Header Card */}
                                <div className="p-3 flex items-center justify-between flex-wrap gap-2 bg-slate-50/60">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                      {inv.id}
                                    </span>
                                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{inv.name}</h5>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                      {inv.department}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                        inv.status === 'Result Available' || inv.status === 'Completed'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                          : 'bg-amber-50 text-amber-800 border-amber-300'
                                      }`}
                                    >
                                      {inv.status}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => toggleReportExpand(inv.id)}
                                      className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                                    >
                                      {isExpanded ? 'Hide Details' : 'View Findings'}
                                    </button>
                                  </div>
                                </div>

                                {/* Body with Findings Table */}
                                {isExpanded && (
                                  <div className="p-3 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                                      <div>
                                        <span className="font-semibold text-slate-700">Sample Date:</span>{' '}
                                        {inv.sampleCollectedAt || '04 Sep 2026, 08:30 AM'}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-slate-700">Verified By:</span>{' '}
                                        {inv.reportedBy || 'Dr. K. Mehta (Pathologist)'}
                                      </div>
                                    </div>

                                    {/* Parameters Table */}
                                    {inv.findings && inv.findings.length > 0 && (
                                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                                        <table className="w-full text-xs text-left">
                                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                            <tr>
                                              <th className="py-2 px-3">Parameter</th>
                                              <th className="py-2 px-3">Observed Value</th>
                                              <th className="py-2 px-3">Reference Range</th>
                                              <th className="py-2 px-3">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {inv.findings.map((f, i) => {
                                              const isAbnormal = f.status === 'High' || f.status === 'Low';
                                              const fParamLower = f.parameter.toLowerCase();
                                              const rowId = fParamLower.includes('creatinine')
                                                ? 'evidence-finding-creatinine'
                                                : fParamLower.includes('hba1c')
                                                ? 'evidence-finding-hba1c'
                                                : fParamLower.includes('cholesterol') || fParamLower.includes('ldl')
                                                ? 'evidence-finding-lipid'
                                                : `finding-${inv.id}-${i}`;

                                              return (
                                                <tr
                                                  key={i}
                                                  id={rowId}
                                                  className={`transition-all ${isAbnormal ? 'bg-amber-50/50 font-semibold' : 'hover:bg-slate-50/50'}`}
                                                >
                                                  <td className="py-2 px-3 text-slate-900 font-medium">{f.parameter}</td>
                                                  <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                                    {f.value} <span className="text-[10px] text-slate-500 font-normal">{f.unit}</span>
                                                  </td>
                                                  <td className="py-2 px-3 text-slate-500">{f.referenceRange}</td>
                                                  <td className="py-2 px-3">
                                                    <span
                                                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                                        f.status === 'High'
                                                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                          : f.status === 'Low'
                                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                      }`}
                                                    >
                                                      {f.status}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}

                                    {/* Interpretation */}
                                    {inv.interpretation && (
                                      <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-950">
                                        <span className="font-bold block mb-0.5">Clinical Interpretation:</span>
                                        <p className="text-slate-700">{inv.interpretation}</p>
                                      </div>
                                    )}

                                    {/* Action row */}
                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadReport(inv.name, '2.1 MB')}
                                        className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-50 cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" /> Download PDF
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handlePrintReport(inv.name)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-50 cursor-pointer"
                                      >
                                        <Printer className="w-3.5 h-3.5" /> Print
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* SECTION C: CLINICAL PROFILE (ALLERGIES, CONDITIONS, MEDICATIONS) */}
                  {(recordsSubFilter === 'all' || recordsSubFilter === 'history') && (
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Clinical Profile & Documented History
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Allergies */}
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                          <span className="font-extrabold text-amber-900 text-xs block">Documented Allergies</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {activeRecords?.allergies && activeRecords.allergies.length > 0 ? (
                              activeRecords.allergies.map((allergy, i) => (
                                <span key={i} className="text-xs font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                                  ⚠️ {allergy}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No known allergies</span>
                            )}
                          </div>
                        </div>

                        {/* Chronic Conditions */}
                        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                          <span className="font-extrabold text-blue-900 text-xs block">Chronic Conditions</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {activeRecords?.chronicConditions && activeRecords.chronicConditions.length > 0 ? (
                              activeRecords.chronicConditions.map((cond, i) => (
                                <span key={i} className="text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-300">
                                  {cond}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No chronic conditions listed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Regular Medications */}
                      <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-800 text-xs block pb-1 border-b border-slate-200/60">
                          Regular Medications
                        </span>
                        <ul className="mt-1.5 space-y-1 text-xs">
                          {activeRecords?.currentMedications && activeRecords.currentMedications.length > 0 ? (
                            activeRecords.currentMedications.map((med, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span>{med}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400 italic">No regular medications</li>
                          )}
                        </ul>
                      </div>

                      {/* Past Surgeries & Family History */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Past Surgeries</span>
                          <span className="text-slate-700 mt-0.5 block font-medium">
                            {activeRecords?.pastSurgeries?.join(', ') || 'None reported'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Family History</span>
                          <span className="text-slate-700 mt-0.5 block font-medium">
                            {activeRecords?.familyHistory?.join(', ') || 'None reported'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 4: SYMPTOMS (MA INTAKE WITH SMART SUGGESTIONS & EDIT/ADD) */}
              {/* =================================================== */}
              {activeTab === 'symptoms' && (
                <div className="space-y-4">
                  {/* Feedback Banner */}
                  {symptomSaveFeedback && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        <span>{symptomSaveFeedback}</span>
                      </div>
                    </div>
                  )}

                  {/* Header & Dedicated Add Symptom Card */}
                  <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 border border-teal-200/90 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
                      <Sparkles className="w-6 h-6" />
                    </div>

                    <div className="max-w-md space-y-1">
                      <h4 className="text-base font-black text-slate-900">
                        Symptoms Intake & Clinical Assessment
                      </h4>
                      <p className="text-xs text-slate-500">
                        Record presenting complaints, severity, onset timeline, and clinical observations for the consulting physician.
                      </p>
                    </div>

                    {/* Primary Add Symptom Button */}
                    <button
                      type="button"
                      onClick={() => setIsSymptomsPopupOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 via-teal-700 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 text-teal-100" />
                      <span>Add Symptom</span>
                    </button>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 text-teal-500" />
                      <span>Full symptoms database & decision support rules will be configured here</span>
                    </div>
                  </div>

                  {/* Active Symptoms Logged */}
                  {symptomsList.length > 0 && (
                    <div id="evidence-symptoms-container" className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 transition-all">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Active Symptoms Logged ({symptomsList.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSymptomsPopupOpen(true)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add More</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {symptomsList.map((symptom) => {
                          const isChestPain = symptom.name.toLowerCase().includes('chest');
                          const isBreathing = symptom.name.toLowerCase().includes('breath');
                          const targetId = isChestPain
                            ? 'evidence-symptom-chest-pain'
                            : isBreathing
                            ? 'evidence-symptom-breathing'
                            : `evidence-symptom-${symptom.id}`;

                          return (
                            <div
                              key={symptom.id}
                              id={targetId}
                              className="p-3 rounded-xl border border-teal-100 bg-teal-50/40 flex items-start justify-between gap-2 transition-all"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-slate-900 truncate">
                                    {symptom.name}
                                  </span>
                                  {symptom.isPrimary && (
                                    <span className="text-[9px] font-bold text-teal-700 bg-teal-100/80 px-1.5 py-0.2 rounded border border-teal-200">
                                      Primary
                                    </span>
                                  )}
                                </div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold border ${
                                    symptom.severity === 'Severe'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : symptom.severity === 'Moderate'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {symptom.severity}
                                </span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                  {symptom.duration || '3 days'}
                                </span>
                                {symptom.onset && (
                                  <>
                                    <span className="text-slate-400">·</span>
                                    <span className="text-slate-500">{symptom.onset}</span>
                                  </>
                                )}
                              </div>
                              {symptom.notes && (
                                <p className="text-[11px] text-slate-600 italic line-clamp-2">
                                  {symptom.notes}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveSymptom(symptom.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Remove symptom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 5: MEDICAL HISTORY (SEGMENTED: PREVIOUS, FAMILY, SURGERIES, ALLERGIES, LIFESTYLE) */}
              {/* =================================================== */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {/* Feedback Banner */}
                  {historySaveFeedback && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        <span>{historySaveFeedback}</span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-blue-200/80 shadow-xs flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-600" />
                        <span>Standardized Medical History Profile</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Structured clinical history across 7 automated diagnostic domains with intake validation.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setHistoryModalInitialCat('conditions');
                        setIsHistoryModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#2f5597] hover:bg-[#254680] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Open Smart Intake</span>
                    </button>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORY 1: KNOWN/ACTIVE CONDITIONS (CHRONIC VS NON-CHRONIC) */}
                  {/* ======================================================= */}
                  <div id="evidence-history-conditions" className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-600" />
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          1. Known / Active Conditions
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Auto-classified as Chronic or Non-Chronic)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalInitialCat('conditions');
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Condition</span>
                      </button>
                    </div>

                    {/* Conditions Split: Chronic vs Non-Chronic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Chronic Conditions Box */}
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
                          <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Chronic Conditions
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.2 rounded-full">
                            {(patient.medicalRecords?.activeConditions || []).filter(c => c.classification === 'chronic').length || 2} Active
                          </span>
                        </div>

                        {((patient.medicalRecords?.activeConditions || []).filter(c => c.classification === 'chronic').length > 0
                          ? (patient.medicalRecords?.activeConditions || []).filter(c => c.classification === 'chronic')
                          : [
                              { id: 'c1', name: 'Type 2 Diabetes Mellitus', classification: 'chronic' as const, diagnosedYear: '2020', status: 'Controlled', treatment: 'Metformin 500mg BD', notes: 'A1c ~ 7.4%' },
                              { id: 'c2', name: 'Essential Hypertension', classification: 'chronic' as const, diagnosedYear: '2018', status: 'Controlled', treatment: 'Telmisartan 40mg OD', notes: 'Regular BP checks' },
                            ]
                        ).map((cond) => {
                          const isDiabetes = cond.name.toLowerCase().includes('diabetes');
                          const isHypertension = cond.name.toLowerCase().includes('hypertension');
                          const condElemId = isDiabetes
                            ? 'evidence-history-diabetes'
                            : isHypertension
                            ? 'evidence-history-hypertension'
                            : `evidence-cond-${cond.id}`;

                          return (
                            <div
                              key={cond.id}
                              id={condElemId}
                              className="p-2 bg-white rounded-lg border border-amber-200/60 shadow-2xs space-y-1 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900">{cond.name}</span>
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {cond.status || 'Controlled'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                                {cond.diagnosedYear && <span>Since: {cond.diagnosedYear}</span>}
                                {cond.treatment && <span className="text-blue-700 font-medium">Rx: {cond.treatment}</span>}
                              </div>
                              {cond.notes && <p className="text-[10px] text-slate-500 italic">{cond.notes}</p>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Non-Chronic Conditions Box */}
                      <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                          <span className="text-[11px] font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Non-Chronic / Episodic
                          </span>
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.2 rounded-full">
                            {(patient.medicalRecords?.activeConditions || []).filter(c => c.classification === 'non-chronic').length || 1} Logged
                          </span>
                        </div>

                        {((patient.medicalRecords?.activeConditions || []).filter(c => c.classification === 'non-chronic').length > 0
                          ? (patient.medicalRecords?.activeConditions || []).filter(c => c.classification === 'non-chronic')
                          : [
                              { id: 'nc1', name: 'Acute Bronchitis (Episodic)', classification: 'non-chronic' as const, diagnosedYear: '2024', status: 'Resolved', treatment: 'Azithromycin course completed', notes: 'Cleared with normal lung sounds' },
                            ]
                        ).map((cond) => (
                          <div key={cond.id} className="p-2 bg-white rounded-lg border border-blue-200/60 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900">{cond.name}</span>
                              <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {cond.status || 'Resolved'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                              {cond.diagnosedYear && <span>Year: {cond.diagnosedYear}</span>}
                              {cond.treatment && <span className="text-blue-700 font-medium">Rx: {cond.treatment}</span>}
                            </div>
                            {cond.notes && <p className="text-[10px] text-slate-500 italic">{cond.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORY 2: ALLERGIES & SENSITIVITIES (FOOD, DRUG, ENV) */}
                  {/* ======================================================= */}
                  <div id="evidence-history-allergies" className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          2. Allergies & Sensitivities
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Food, Drug, Environment)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalInitialCat('allergies');
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Allergy</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(patient.medicalRecords?.allergiesAndSensitivities && patient.medicalRecords.allergiesAndSensitivities.length > 0
                        ? patient.medicalRecords.allergiesAndSensitivities
                        : [
                            { id: 'al1', allergen: 'Penicillin / Beta-lactams', category: 'drug' as const, reaction: 'Urticaria & facial swelling', severity: 'Severe' as const, frequency: 'Immediate (<30 min)' },
                            { id: 'al2', allergen: 'Peanuts / Tree Nuts', category: 'food' as const, reaction: 'GI cramping & lip swelling', severity: 'Moderate' as const, frequency: 'Upon ingestion' },
                            { id: 'al3', allergen: 'Pollen / Dust Mites', category: 'environment' as const, reaction: 'Allergic rhinitis & conjunctivitis', severity: 'Mild' as const, frequency: 'Seasonal (Spring/Fall)' },
                          ]
                      ).map((allg) => {
                        const isPenicillin = allg.allergen.toLowerCase().includes('penicillin');
                        const allgElemId = isPenicillin ? 'evidence-history-penicillin' : `evidence-allg-${allg.id}`;

                        return (
                          <div
                            key={allg.id}
                            id={allgElemId}
                            className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col justify-between space-y-2 transition-all"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  {allg.category} Allergy
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                                    allg.severity === 'Severe' || allg.severity === 'Life-threatening'
                                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                                      : allg.severity === 'Moderate'
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {allg.severity}
                                </span>
                              </div>
                              <h6 className="font-black text-xs text-slate-900 mt-1.5">{allg.allergen}</h6>
                              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Reaction: {allg.reaction}</p>
                            </div>
                            {allg.frequency && (
                              <span className="text-[10px] text-slate-400 font-medium">Frequency: {allg.frequency}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORY 3: MEDICATIONS (PAINKILLER, ANTACID, RX TYPES) */}
                  {/* ======================================================= */}
                  <div id="evidence-history-medications" className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-teal-600" />
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          3. Current Medications
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Painkiller, Antacid, Antihypertensive, Antibiotic, etc.)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalInitialCat('medications');
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Medication</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {(patient.medicalRecords?.categorizedMedications && patient.medicalRecords.categorizedMedications.length > 0
                        ? patient.medicalRecords.categorizedMedications
                        : [
                            { id: 'm1', name: 'Pantoprazole 40mg', category: 'antacid' as const, dosage: '40mg', frequency: 'Once daily before breakfast', route: 'Oral', indication: 'Acid peptic reflux' },
                            { id: 'm2', name: 'Paracetamol 650mg', category: 'painkiller' as const, dosage: '650mg', frequency: 'SOS as needed for pain', route: 'Oral', indication: 'Mild analgesic' },
                            { id: 'm3', name: 'Telmisartan 40mg', category: 'antihypertensive' as const, dosage: '40mg', frequency: 'Once daily (morning)', route: 'Oral', indication: 'Blood pressure' },
                            { id: 'm4', name: 'Metformin 500mg', category: 'antidiabetic' as const, dosage: '500mg', frequency: 'Twice daily with meals', route: 'Oral', indication: 'Blood glucose' },
                          ]
                      ).map((med) => (
                        <div key={med.id} className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-1.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                                {med.category}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-500">{med.dosage}</span>
                            </div>
                            <h6 className="font-extrabold text-xs text-slate-900 mt-1">{med.name}</h6>
                            <p className="text-[11px] text-slate-600 font-medium">{med.frequency}</p>
                          </div>
                          {med.indication && (
                            <span className="text-[10px] text-slate-400 italic">For: {med.indication}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORY 4: SURGICAL AND HOSPITALIZATION HISTORY        */}
                  {/* ======================================================= */}
                  <div id="evidence-history-surgeries" className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-indigo-600" />
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          4. Surgical & Hospitalization History
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Major Surgery, Minor Surgery, Past Hospital Admissions)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalInitialCat('surgeries');
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-xs font-bold text-indigo-800 hover:text-indigo-950 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Surgery / Admission</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(patient.medicalRecords?.surgicalAndHospitalization && patient.medicalRecords.surgicalAndHospitalization.length > 0
                        ? patient.medicalRecords.surgicalAndHospitalization
                        : [
                            { id: 's1', procedureOrReason: 'Coronary Artery Bypass Graft (CABG)', type: 'major-surgery' as const, year: '2018', facility: 'Apollo Heart Institute', complications: 'Uneventful recovery, patent graft' },
                            { id: 's2', procedureOrReason: 'Laparoscopic Appendectomy', type: 'minor-surgery' as const, year: '2014', facility: 'City General Hospital', complications: 'None' },
                            { id: 's3', procedureOrReason: 'Acute Gastroenteritis & Dehydration', type: 'past-hospital-admission' as const, year: '2022', facility: 'Sterling Multi-Specialty (3 days)', complications: 'Resolved on IV fluids' },
                          ]
                      ).map((surg) => {
                        const isBypass = surg.procedureOrReason.toLowerCase().includes('bypass') || surg.procedureOrReason.toLowerCase().includes('cabg');
                        const surgElemId = isBypass ? 'evidence-history-bypass' : `evidence-surg-${surg.id}`;

                        return (
                          <div key={surg.id} id={surgElemId} className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-200/80 space-y-1.5 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                                {surg.type.replace('-', ' ')}
                              </span>
                              <span className="text-xs font-bold text-slate-700">{surg.year}</span>
                            </div>
                            <h6 className="font-extrabold text-xs text-slate-900">{surg.procedureOrReason}</h6>
                            <p className="text-[11px] text-slate-600">Facility: {surg.facility || 'General Hospital'}</p>
                            {surg.complications && (
                              <p className="text-[10px] text-slate-500 italic">Notes: {surg.complications}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORIES 5 & 6: FAMILY & GENETIC + IMMUNIZATION       */}
                  {/* ======================================================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Category 5: Family & Genetic History */}
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                            5. Family & Genetic History
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryModalInitialCat('family');
                            setIsHistoryModalOpen(true);
                          }}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 inline" /> Add
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(patient.medicalRecords?.familyAndGenetic && patient.medicalRecords.familyAndGenetic.length > 0
                          ? patient.medicalRecords.familyAndGenetic
                          : [
                              { id: 'f1', condition: 'Coronary Artery Disease', relationship: 'Father', ageOfOnset: '52 years', status: 'Living', notes: 'Under regular cardiology care' },
                              { id: 'f2', condition: 'Type 2 Diabetes Mellitus', relationship: 'Mother', ageOfOnset: '48 years', status: 'Living', notes: 'Diet controlled + Metformin' },
                            ]
                        ).map((fam) => (
                          <div key={fam.id} className="p-2.5 bg-purple-50/30 rounded-xl border border-purple-200/70 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-slate-900">{fam.condition}</span>
                              <span className="text-slate-400 mx-1.5">·</span>
                              <span className="font-semibold text-purple-800">{fam.relationship}</span>
                              {fam.ageOfOnset && <span className="text-[11px] text-slate-500 block">Onset: {fam.ageOfOnset}</span>}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {fam.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category 6: Immunization Records */}
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                            6. Immunization Records
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryModalInitialCat('immunizations');
                            setIsHistoryModalOpen(true);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 inline" /> Add
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(patient.medicalRecords?.immunizationRecords && patient.medicalRecords.immunizationRecords.length > 0
                          ? patient.medicalRecords.immunizationRecords
                          : [
                              { id: 'i1', vaccine: 'COVID-19 mRNA (Pfizer-BioNTech)', dose: 'Booster Dose', dateAdministered: '15 Jan 2023', status: 'Completed', boosterDue: 'Annual' },
                              { id: 'i2', vaccine: 'Influenza (Quadrivalent)', dose: 'Annual 2025', dateAdministered: '10 Oct 2025', status: 'Completed', boosterDue: 'Oct 2026' },
                              { id: 'i3', vaccine: 'Hepatitis B Recombinant', dose: 'Series of 3', dateAdministered: '2015', status: 'Completed' },
                            ]
                        ).map((imm) => (
                          <div key={imm.id} className="p-2.5 bg-emerald-50/30 rounded-xl border border-emerald-200/70 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-slate-900">{imm.vaccine}</span>
                              <span className="text-[11px] text-slate-500 block">Dose: {imm.dose} · {imm.dateAdministered}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {imm.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* CATEGORY 7: LIFESTYLE AND MENTAL HEALTH                 */}
                  {/* ======================================================= */}
                  <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-teal-600" />
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          7. Lifestyle & Mental Health
                        </h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalInitialCat('lifestyle');
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Habits</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Smoking / Tobacco</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">
                          {patient.medicalRecords?.lifestyleAndMentalHealth?.smoking || 'Non-smoker'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Alcohol</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">
                          {patient.medicalRecords?.lifestyleAndMentalHealth?.alcohol || 'Occasional social'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Diet Profile</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">
                          {patient.medicalRecords?.lifestyleAndMentalHealth?.diet || 'Low-sodium / Diabetic'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Physical Activity</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">
                          {patient.medicalRecords?.lifestyleAndMentalHealth?.physicalActivity || 'Moderate brisk walking 30m'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Sleep Pattern</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">
                          {patient.medicalRecords?.lifestyleAndMentalHealth?.sleep || '6-7 hours / night'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Stress & Well-being</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">
                          {patient.medicalRecords?.lifestyleAndMentalHealth?.stress || 'Controlled / Mild'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* BOTTOM ACTION: CLINICAL REMARKS & ADD REMARKS BUTTON    */}
                  {/* ======================================================= */}
                  <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 rounded-2xl p-4 border border-blue-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          Clinical Remarks & Medical Intake Notes
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {(patient.medicalRecords?.remarks || []).length || 1} remark(s) documented
                      </span>
                    </div>

                    {/* Existing remarks listing */}
                    <div className="space-y-2">
                      {(patient.medicalRecords?.remarks && patient.medicalRecords.remarks.length > 0
                        ? patient.medicalRecords.remarks
                        : [
                            {
                              id: 'r1',
                              remark: 'Patient is motivated for lifestyle modifications and weight reduction. Compliant with prescribed medications.',
                              author: 'Anjali Mehta, CMA (MA)',
                              date: 'Today, 09:30 AM',
                              category: 'General Clinical',
                            },
                          ]
                      ).map((rem) => (
                        <div key={rem.id} className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-1">
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">
                            "{rem.remark}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Author: {rem.author || 'Clinical Staff'}</span>
                            <span>{rem.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Prominent Full-Width Button at the Bottom to Add Remarks */}
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryModalInitialCat('remarks');
                        setIsHistoryModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-blue-600 via-[#2f5597] to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Remarks</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 6: VIEW TRENDS (MA LONGITUDINAL COMPARISON)     */}
              {/* =================================================== */}
              {activeTab === 'trends' && (
                <div id="evidence-trends-container" className="space-y-4 transition-all">
                  <PatientTrendsView patient={patient} investigations={activeInvestigations} />
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 7: DOCTOR VIEW (DOCTOR DASHBOARD REPLICA)       */}
              {/* =================================================== */}
              {activeTab === 'doctor-view' && (
                <div id="evidence-doctorview-container" className="space-y-4 transition-all">
                  <DoctorViewDashboard
                    patient={patient}
                    onUpdateFlaggedOrder={(reorderedList) => {
                      onUpdatePatient({
                        ...patient,
                        doctorViewFlaggedItems: reorderedList,
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </main>

          {/* ======================================================= */}
          {/* 3. RIGHT COLUMN: AI CASE SUMMARY & CARE TIMELINE       */}
          {/* ======================================================= */}
          <aside className="lg:col-span-4 xl:col-span-4.5 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-md flex flex-col min-h-0 overflow-hidden">
            {/* Header Switcher: AI Case Summary vs Patient Timeline */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3 shrink-0 flex-wrap gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('ai-summary')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    rightPanelTab === 'ai-summary'
                      ? 'bg-gradient-to-r from-teal-700 to-indigo-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>AI Case Brief & Insights</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightPanelTab('journey')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    rightPanelTab === 'journey'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Patient Timeline</span>
                </button>
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {rightPanelTab === 'ai-summary' ? 'H&P Synthesis' : 'Care Journey'}
              </span>
            </div>

            {/* Right Column Body */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-0.5 scrollbar-thin">
              {rightPanelTab === 'ai-summary' ? (
                <div id="ai-clinical-case-presentation" className="space-y-3">
                  <ClinicalCasePresentation
                    patient={patient}
                    onNavigateTab={(tab) => handleEvidenceDeepLink(tab)}
                    onNavigateEvidence={handleEvidenceDeepLink}
                  />
                </div>
              ) : (
                <PatientJourneyTimeline
                  patient={patient}
                  journeySteps={journeySteps}
                  longestStep={longestStep}
                  totalTurnaroundMinutes={totalTurnaroundMinutes}
                  reports={defaultMedicalReports}
                  previousAppointments={previousAppointments}
                  selectedAppointmentId={selectedAppointmentId}
                  onSelectAppointmentId={(id) => setSelectedAppointmentId(id)}
                  onViewRecordsTab={(recId) => {
                    setActiveTab('records');
                    if (recId) {
                      setHighlightedRecordId(recId);
                      setRecordsSubFilter('diagnostic');
                      setTimeout(() => {
                        const el = document.getElementById(`record-card-${recId}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }
                  }}
                />
              )}
            </div>
          </aside>
        </div>
        {/* Dedicated Symptoms Intake Questionnaire Modal */}
        {isSymptomsPopupOpen && patient && (
          <SymptomsIntakeModal
            patient={patient}
            isOpen={isSymptomsPopupOpen}
            onClose={() => setIsSymptomsPopupOpen(false)}
            onSaveSymptoms={(updatedSymptoms, newSuspectDisease, newNotes, routeToDoctor) => {
              setSymptomsList(updatedSymptoms);
              if (newSuspectDisease) setSuspectDisease(newSuspectDisease);
              if (newNotes) setSymptomNotesText(newNotes);
              setIsSymptomsPopupOpen(false);

              const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const updatedPatient: Patient = {
                ...patient,
                status: routeToDoctor ? 'IN QUEUE' : patient.status,
                assessment: {
                  ...patient.assessment,
                  detailedSymptoms: updatedSymptoms,
                  suspectDisease: newSuspectDisease || suspectDisease,
                  maNotes: newNotes !== undefined ? newNotes : symptomNotesText,
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
                      ? 'Symptoms Intake Completed & Patient Routed to Doctor'
                      : `Symptoms Intake Updated (${updatedSymptoms.length} symptoms logged)`,
                    performedBy: 'Anjali Mehta, CMA',
                    role: 'MA',
                    category: 'Assessment',
                    details: `Symptoms: ${updatedSymptoms.map((s) => `${s.name} (${s.severity})`).join(', ') || 'Asymptomatic review'}`,
                  },
                  ...patient.activityTimeline,
                ],
              };
              onUpdatePatient(updatedPatient);
              setSymptomSaveFeedback(`Symptoms updated (${updatedSymptoms.length} logged)!`);
              setTimeout(() => setSymptomSaveFeedback(null), 3000);
            }}
          />
        )}

        {/* Upload Record Modal for Receptionist */}
        {patient && (
          <UploadRecordModal
            isOpen={isUploadRecordModalOpen}
            onClose={() => setIsUploadRecordModalOpen(false)}
            patientName={patient.name}
            onUploadSuccess={handleUploadNewRecord}
          />
        )}

        {/* Complete Intake Form Modal for Receptionist */}
        {patient && (
          <CompleteIntakeModal
            isOpen={isIntakeModalOpen}
            onClose={() => setIsIntakeModalOpen(false)}
            patient={patient}
            onSave={handleSaveIntakeForm}
          />
        )}

        {/* Review Information Modal for Receptionist */}
        {patient && (
          <ReviewInformationModal
            isOpen={isReviewInfoModalOpen}
            onClose={() => setIsReviewInfoModalOpen(false)}
            patient={patient}
            updatedFields={newInformationUpdates}
            onApprove={handleApproveReviewedInfo}
          />
        )}

        {/* Medical History Intake Modal (7 Standardized Domains + Remarks) */}
        {patient && (
          <MedicalHistoryIntakeModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            patient={patient}
            initialCategory={historyModalInitialCat}
            onSaveMedicalHistory={(updatedRecords) => {
              const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const updatedPatient: Patient = {
                ...patient,
                medicalRecords: updatedRecords,
                activityTimeline: [
                  {
                    id: `act-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    timeDisplay: nowTime,
                    action: 'Medical History Updated',
                    performedBy: 'Anjali Mehta, CMA (MA)',
                    role: 'MA',
                    category: 'Assessment',
                    details: 'Patient medical history records, allergies, medications, or remarks updated.',
                  },
                  ...patient.activityTimeline,
                ],
              };
              onUpdatePatient(updatedPatient);
              setIsHistoryModalOpen(false);
              setHistorySaveFeedback('Medical history updated successfully!');
              setTimeout(() => setHistorySaveFeedback(null), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
};
