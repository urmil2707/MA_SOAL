import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Activity,
  FolderArchive,
  Upload,
  Camera,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Check,
  Send,
  User,
  Phone,
  Clock,
  Sparkles,
  Heart,
  ChevronRight,
  Stethoscope,
  Building,
} from 'lucide-react';
import {
  Patient,
  Doctor,
  RecordCategory,
  PatientUploadedRecord,
  EmergencyContact,
} from '../types';
import { INITIAL_DOCTORS } from '../mockData';

interface CheckInModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePatient: (updated: Patient) => void;
  onSendToAssessment: (patientId: string) => void;
  doctors?: Doctor[];
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  patient,
  isOpen,
  onClose,
  onUpdatePatient,
  onSendToAssessment,
  doctors = INITIAL_DOCTORS,
}) => {
  // 3 Tabs: 1. Form (Default), 2. Vitals, 3. Records
  const [activeTab, setActiveTab] = useState<'form' | 'vitals' | 'records'>('form');

  // Tab 1: Form state
  const [patientType, setPatientType] = useState<'Self' | 'Guardian'>(
    patient.form.patientType || (patient.form.guardianName ? 'Guardian' : 'Self')
  );
  const [fullName, setFullName] = useState(patient.form.fullName || patient.name);
  const [mobile, setMobile] = useState(patient.form.mobile || patient.mobile);
  const [email, setEmail] = useState(patient.form.email || '');
  const [address, setAddress] = useState(patient.form.address || '');
  const [city, setCity] = useState(patient.form.city || 'Ahmedabad, Gujarat');
  const [visitType, setVisitType] = useState<'New Patient' | 'Follow-up'>(
    patient.form.visitType || patient.visitType || 'New Patient'
  );
  const [reasonOfVisit, setReasonOfVisit] = useState(
    patient.form.reasonOfVisit || patient.assessment?.chiefComplaint || 'Routine Medical Check-up'
  );
  const [doctorAssignedId, setDoctorAssignedId] = useState(
    patient.form.doctorAssignedId || patient.doctorAssignedId || 'doc-1'
  );
  const [timeSlot, setTimeSlot] = useState(
    patient.form.timeSlot || patient.appointmentTime || '10:30 AM'
  );

  // Guardian details (if patientType === 'Guardian')
  const [guardianName, setGuardianName] = useState(patient.form.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState(
    patient.form.guardianRelation || 'Father'
  );
  const [guardianMobile, setGuardianMobile] = useState(patient.form.guardianMobile || '');

  // Emergency contacts (up to 3)
  const initialContacts: EmergencyContact[] =
    patient.form.emergencyContacts && patient.form.emergencyContacts.length > 0
      ? patient.form.emergencyContacts
      : [
          {
            id: 'ec-1',
            name: patient.form.emergencyContactName || 'Family Contact',
            relation: patient.form.emergencyContactRelation || 'Spouse',
            mobile: patient.form.emergencyContactMobile || '+91 98250 99412',
          },
        ];
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(initialContacts);

  // Referral
  const [referredBy, setReferredBy] = useState(patient.form.referredBy || 'Self / Walk-in');

  // Tab 2: Vitals state (Part 1: Vitals, Part 2: Body Composition)
  const [bpSystolic, setBpSystolic] = useState<number>(patient.vitals.bpSystolic || 120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(patient.vitals.bpDiastolic || 80);
  const [pulse, setPulse] = useState<number>(patient.vitals.pulse || 72);
  const [spo2, setSpo2] = useState<number>(patient.vitals.spo2 || 99);
  const [temperature, setTemperature] = useState<number>(patient.vitals.temperature || 98.6);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(
    patient.vitals.respiratoryRate || 16
  );

  // Body composition
  const [heightCm, setHeightCm] = useState<number>(patient.bodyComposition.heightCm || 172);
  const [weightKg, setWeightKg] = useState<number>(patient.bodyComposition.weightKg || 70);
  const [bodyFat, setBodyFat] = useState<number>(patient.bodyComposition.bodyFatPercentage || 21.5);
  const [muscleMass, setMuscleMass] = useState<number>(
    patient.bodyComposition.muscleMassKg || 52.0
  );

  // Computed BMI
  const computedBmi =
    heightCm > 0 && weightKg > 0
      ? Number((weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1))
      : 22.5;

  // Tab 3: Records state
  const [uploadedRecords, setUploadedRecords] = useState<PatientUploadedRecord[]>(
    patient.uploadedRecords || []
  );
  const [recordFilter, setRecordFilter] = useState<string>('ALL');
  const [previewingRecord, setPreviewingRecord] = useState<PatientUploadedRecord | null>(null);

  // New Record Dialog state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Reset states when patient changes
  useEffect(() => {
    setActiveTab('form');
    setFullName(patient.form.fullName || patient.name);
    setMobile(patient.form.mobile || patient.mobile);
    setEmail(patient.form.email || '');
    setAddress(patient.form.address || '');
    setCity(patient.form.city || 'Ahmedabad, Gujarat');
    setVisitType(patient.form.visitType || patient.visitType || 'New Patient');
    setReasonOfVisit(
      patient.form.reasonOfVisit || patient.assessment?.chiefComplaint || 'Routine Medical Check-up'
    );
    setDoctorAssignedId(patient.form.doctorAssignedId || patient.doctorAssignedId || 'doc-1');
    setTimeSlot(patient.form.timeSlot || patient.appointmentTime || '10:30 AM');
    setPatientType(patient.form.patientType || (patient.form.guardianName ? 'Guardian' : 'Self'));
    setGuardianName(patient.form.guardianName || '');
    setGuardianRelation(patient.form.guardianRelation || 'Father');
    setGuardianMobile(patient.form.guardianMobile || '');
    setReferredBy(patient.form.referredBy || 'Self / Walk-in');

    const loadedContacts =
      patient.form.emergencyContacts && patient.form.emergencyContacts.length > 0
        ? patient.form.emergencyContacts
        : [
            {
              id: 'ec-1',
              name: patient.form.emergencyContactName || 'Family Contact',
              relation: patient.form.emergencyContactRelation || 'Spouse',
              mobile: patient.form.emergencyContactMobile || '+91 98250 99412',
            },
          ];
    setEmergencyContacts(loadedContacts);

    setBpSystolic(patient.vitals.bpSystolic || 120);
    setBpDiastolic(patient.vitals.bpDiastolic || 80);
    setPulse(patient.vitals.pulse || 72);
    setSpo2(patient.vitals.spo2 || 99);
    setTemperature(patient.vitals.temperature || 98.6);
    setRespiratoryRate(patient.vitals.respiratoryRate || 16);

    setHeightCm(patient.bodyComposition.heightCm || 172);
    setWeightKg(patient.bodyComposition.weightKg || 70);
    setBodyFat(patient.bodyComposition.bodyFatPercentage || 21.5);
    setMuscleMass(patient.bodyComposition.muscleMassKg || 52.0);

    setUploadedRecords(patient.uploadedRecords || []);
  }, [patient]);

  if (!isOpen) return null;

  // Completion evaluation for the 3 steps
  const isFormDone = Boolean(patient.checkInModules?.form || patient.form?.completed);
  const isVitalsDone = Boolean(
    patient.checkInModules?.vitals ||
      (patient.vitals?.bpSystolic && patient.bodyComposition?.weightKg)
  );
  const isRecordsDone = Boolean(
    patient.checkInModules?.records ||
      patient.checkInModules?.medicalRecords ||
      (uploadedRecords && uploadedRecords.length > 0)
  );

  const completedStepsCount = [isFormDone, isVitalsDone, isRecordsDone].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 3) * 100);

  // Handle Emergency Contact additions (up to 3)
  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length >= 3) return;
    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: '',
      relation: 'Spouse',
      mobile: '+91 ',
    };
    setEmergencyContacts([...emergencyContacts, newContact]);
  };

  const handleUpdateEmergencyContact = (
    id: string,
    field: 'name' | 'relation' | 'mobile',
    val: string
  ) => {
    setEmergencyContacts(
      emergencyContacts.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleRemoveEmergencyContact = (id: string) => {
    if (emergencyContacts.length === 1) return;
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
  };

  // Save Tab 1: Form
  const handleSaveForm = (e?: React.FormEvent, proceedToNext = true) => {
    if (e) e.preventDefault();

    const selectedDoc = doctors.find((d) => d.id === doctorAssignedId);

    const updatedPatient: Patient = {
      ...patient,
      name: fullName,
      mobile: mobile,
      doctorAssignedId: doctorAssignedId,
      doctorName: selectedDoc ? selectedDoc.name : patient.doctorName,
      specialty: selectedDoc ? selectedDoc.specialty : patient.specialty,
      appointmentTime: timeSlot,
      visitType: visitType,
      form: {
        ...patient.form,
        fullName,
        mobile,
        email,
        address,
        city,
        patientType,
        guardianName: patientType === 'Guardian' ? guardianName : undefined,
        guardianRelation: patientType === 'Guardian' ? guardianRelation : undefined,
        guardianMobile: patientType === 'Guardian' ? guardianMobile : undefined,
        emergencyContacts,
        emergencyContactName: emergencyContacts[0]?.name || '',
        emergencyContactRelation: emergencyContacts[0]?.relation || '',
        emergencyContactMobile: emergencyContacts[0]?.mobile || '',
        referredBy,
        doctorAssignedId,
        doctorName: selectedDoc?.name,
        timeSlot,
        visitType,
        reasonOfVisit,
        completed: true,
      },
      checkInModules: {
        ...patient.checkInModules,
        form: true,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Check-in Form Completed',
          performedBy: 'Priya Shah',
          role: 'Receptionist',
          category: 'Check-in',
          details: `Patient: ${fullName} (${patientType}), Ref: ${referredBy}`,
        },
        ...patient.activityTimeline,
      ],
    };

    onUpdatePatient(updatedPatient);
    if (proceedToNext) {
      setActiveTab('vitals');
    }
  };

  // Save Tab 2: Vitals & Body Composition
  const handleSaveVitals = (e?: React.FormEvent, proceedToNext = true) => {
    if (e) e.preventDefault();

    const updatedPatient: Patient = {
      ...patient,
      vitals: {
        ...patient.vitals,
        bpSystolic,
        bpDiastolic,
        pulse,
        spo2,
        temperature,
        respiratoryRate,
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recordedBy: 'Priya Shah (Receptionist)',
      },
      bodyComposition: {
        ...patient.bodyComposition,
        heightCm,
        weightKg,
        bmi: computedBmi,
        bodyFatPercentage: bodyFat,
        muscleMassKg: muscleMass,
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recordedBy: 'Priya Shah (Receptionist)',
      },
      checkInModules: {
        ...patient.checkInModules,
        vitals: true,
        bodyComposition: true,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Vitals & Body Composition Captured',
          performedBy: 'Priya Shah',
          role: 'Receptionist',
          category: 'Check-in',
          details: `BP: ${bpSystolic}/${bpDiastolic}, Pulse: ${pulse}, Ht: ${heightCm}cm, Wt: ${weightKg}kg, BMI: ${computedBmi}`,
        },
        ...patient.activityTimeline,
      ],
    };

    onUpdatePatient(updatedPatient);
    if (proceedToNext) {
      setActiveTab('records');
    }
  };

  // Helper: auto-detect category
  const detectCategoryFromName = (title: string): RecordCategory => {
    const lower = title.toLowerCase();
    if (
      lower.includes('x-ray') ||
      lower.includes('radiograph') ||
      lower.includes('ct') ||
      lower.includes('mri') ||
      lower.includes('scan') ||
      lower.includes('radiology')
    ) {
      return 'RADIOLOGY';
    }
    if (
      lower.includes('usg') ||
      lower.includes('ultrasound') ||
      lower.includes('sonography') ||
      lower.includes('echo') ||
      lower.includes('doppler')
    ) {
      return 'SONOGRAPHY';
    }
    if (
      lower.includes('prescription') ||
      lower.includes('rx') ||
      lower.includes('discharge') ||
      lower.includes('medication')
    ) {
      return 'PRESCRIPTION';
    }
    if (
      lower.includes('suggestion') ||
      lower.includes('diet') ||
      lower.includes('rehab') ||
      lower.includes('physio') ||
      lower.includes('exercise') ||
      lower.includes('advice')
    ) {
      return 'SUGGESTIONS';
    }
    return 'BLOOD REPORTS';
  };

  // Add sample record
  const handleAddSampleRecord = (type: RecordCategory, critical = false) => {
    const todayStr = '04 Sep 2026';
    let newRec: PatientUploadedRecord;

    if (type === 'BLOOD REPORTS') {
      newRec = {
        id: `rec-${Date.now()}`,
        title: critical
          ? 'High-Sensitivity Troponin-I & Cardiac Biomarkers'
          : 'Complete Blood Count (CBC) & Hemogram',
        category: 'BLOOD REPORTS',
        scanDate: todayStr,
        scanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceOrClinic: 'Soltech Core Pathology Lab',
        doctorOrOrderedBy: 'Dr. Amit Patel',
        fileType: 'pdf',
        fileSize: '1.4 MB',
        isCritical: critical,
        criticalSummary: critical
          ? 'CRITICAL HIGH: Troponin-I 2.84 ng/mL (Ref: <0.04). Indicates active myocardial injury.'
          : undefined,
        importantHighlights: critical
          ? [
              'Troponin-I: 2.84 ng/mL (CRITICAL HIGH > 0.04)',
              'CK-MB: 48 U/L (Elevated, Ref: <25)',
              'Serum Potassium: 4.5 mEq/L (Normal)',
            ]
          : [
              'Hemoglobin: 14.2 g/dL (Normal)',
              'Platelet Count: 245,000 /mcL (Normal)',
              'Total Leukocytes: 7,800 /mcL (Normal)',
            ],
        notes: critical
          ? 'Report flagged critical by lab - urgent doctor attention required.'
          : 'Normal routine blood indices.',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedBy: 'Priya Shah (Receptionist)',
      };
    } else if (type === 'RADIOLOGY') {
      newRec = {
        id: `rec-${Date.now()}`,
        title: 'Chest Radiograph (PA & Lateral View)',
        category: 'RADIOLOGY',
        scanDate: '03 Sep 2026',
        scanTime: '04:15 PM',
        sourceOrClinic: 'Sterling Imaging Center',
        doctorOrOrderedBy: 'Dr. Amit Patel',
        fileType: 'image',
        fileSize: '3.1 MB',
        isCritical: critical,
        criticalSummary: critical
          ? 'CRITICAL: Acute pulmonary edema and bilateral pleural effusion.'
          : undefined,
        importantHighlights: critical
          ? [
              'Cardiothoracic Ratio: 0.62 (Severe Cardiomegaly)',
              'Bilateral Kerley B lines present',
              'Moderate right pleural effusion',
            ]
          : [
              'Cardiothoracic Ratio: 0.51 (Borderline)',
              'Clear lung parenchymal fields',
              'Costophrenic angles sharp',
            ],
        notes: 'Carried in hardcopy; scanned via flatbed scanner at reception.',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedBy: 'Priya Shah (Receptionist)',
      };
    } else if (type === 'SONOGRAPHY') {
      newRec = {
        id: `rec-${Date.now()}`,
        title: 'USG Abdomen & Renal Arterial Doppler',
        category: 'SONOGRAPHY',
        scanDate: '20 Aug 2026',
        scanTime: '11:30 AM',
        sourceOrClinic: 'Apex Ultrasound Clinic',
        doctorOrOrderedBy: 'Dr. S. K. Bhatt',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        isCritical: false,
        importantHighlights: [
          'Renal Arteries: Normal resistive index bilaterally',
          'Kidneys: Normal bilateral parenchymal thickness',
          'Liver: Mild grade-1 fatty infiltration',
        ],
        notes: 'Prior ultrasound carried by patient.',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedBy: 'Priya Shah (Receptionist)',
      };
    } else if (type === 'PRESCRIPTION') {
      newRec = {
        id: `rec-${Date.now()}`,
        title: 'Prior Discharge Prescription & Med Schedule',
        category: 'PRESCRIPTION',
        scanDate: '15 Aug 2026',
        scanTime: '02:00 PM',
        sourceOrClinic: 'Apollo Hospital & Heart Center',
        doctorOrOrderedBy: 'Dr. Amit Patel',
        fileType: 'prescription',
        fileSize: '890 KB',
        isCritical: false,
        importantHighlights: [
          'Telmisartan 40mg OD (Morning)',
          'Atorvastatin 20mg HS (Bedtime)',
          'Aspirin 75mg post-lunch',
          'Strict low-sodium diet (<2g/day)',
        ],
        notes: 'Physical prescription scanned for electronic record.',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedBy: 'Priya Shah (Receptionist)',
      };
    } else {
      newRec = {
        id: `rec-${Date.now()}`,
        title: 'Cardiac Rehabilitation & Exercise Suggestions',
        category: 'SUGGESTIONS',
        scanDate: '16 Aug 2026',
        scanTime: '10:00 AM',
        sourceOrClinic: 'PhysioFit Cardiac Rehab',
        doctorOrOrderedBy: 'Dr. Pooja Bhatt (PT)',
        fileType: 'pdf',
        fileSize: '640 KB',
        isCritical: false,
        importantHighlights: [
          'Target Heart Rate: 110-120 bpm during warm-up',
          'Brisk Walking: 20 minutes daily, 5 days a week',
          'Stop immediately if chest heaviness or dyspnea recurs',
        ],
        notes: 'Lifestyle and physiotherapy guidelines.',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedBy: 'Priya Shah (Receptionist)',
      };
    }

    const updatedList = [newRec, ...uploadedRecords];
    setUploadedRecords(updatedList);
    saveRecordsToPatient(updatedList);
  };

  // Simulate scanning action
  const handleStartScanSimulation = () => {
    setIsScanning(true);
    setScanProgress(15);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanProgress(0);
            handleAddSampleRecord('RADIOLOGY', false);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Toggle critical status
  const handleToggleCritical = (recordId: string) => {
    const updatedList = uploadedRecords.map((r) => {
      if (r.id === recordId) {
        const nextCrit = !r.isCritical;
        return {
          ...r,
          isCritical: nextCrit,
          criticalSummary: nextCrit
            ? 'CRITICAL REPORT: Abnormal findings flagged for urgent doctor review.'
            : undefined,
        };
      }
      return r;
    });
    setUploadedRecords(updatedList);
    saveRecordsToPatient(updatedList);
  };

  // Delete a record
  const handleDeleteRecord = (recordId: string) => {
    const updatedList = uploadedRecords.filter((r) => r.id !== recordId);
    setUploadedRecords(updatedList);
    saveRecordsToPatient(updatedList);
  };

  // Save Records to patient model
  const saveRecordsToPatient = (recordsList: PatientUploadedRecord[]) => {
    const hasRecords = recordsList.length > 0;
    const updatedPatient: Patient = {
      ...patient,
      uploadedRecords: recordsList,
      checkInModules: {
        ...patient.checkInModules,
        records: hasRecords,
        medicalRecords: hasRecords,
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Patient Medical Records Updated',
          performedBy: 'Priya Shah',
          role: 'Receptionist',
          category: 'Check-in',
          details: `${recordsList.length} diagnostic record(s) categorized and scanned.`,
        },
        ...patient.activityTimeline,
      ],
    };
    onUpdatePatient(updatedPatient);
  };

  // Filtered & sorted records (newest scan date first)
  const filteredRecords = uploadedRecords
    .filter((r) => recordFilter === 'ALL' || r.category === recordFilter)
    .sort((a, b) => b.scanDate.localeCompare(a.scanDate));

  // Category badge colors
  const getCategoryBadgeClass = (cat: RecordCategory, isCritical: boolean) => {
    if (isCritical) {
      return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
    }
    switch (cat) {
      case 'RADIOLOGY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SONOGRAPHY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'BLOOD REPORTS':
        return 'bg-rose-100/80 text-rose-700 border-rose-200';
      case 'PRESCRIPTION':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SUGGESTIONS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Blood Pressure Classification
  const getBpClassification = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80)
      return { label: 'Normal BP', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (sys <= 129 && dia < 80)
      return {
        label: 'Elevated BP',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      };
    if (sys <= 139 || dia <= 89)
      return {
        label: 'Stage 1 Hypertension',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    return {
      label: 'Stage 2 Hypertension',
      color: 'text-rose-800 bg-rose-50 border-rose-300 font-bold',
    };
  };

  // BMI Classification
  const getBmiClassification = (bmi: number) => {
    if (bmi < 18.5)
      return { label: 'Underweight', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (bmi <= 24.9)
      return { label: 'Normal BMI', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi <= 29.9)
      return { label: 'Overweight', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'Obese', color: 'text-rose-800 bg-rose-50 border-rose-300 font-bold' };
  };

  const bpStatus = getBpClassification(bpSystolic, bpDiastolic);
  const bmiStatus = getBmiClassification(computedBmi);

  return (
    <div
      id="check-in-popup-modal"
      className="fixed inset-0 z-50 flex justify-center items-start bg-slate-900/60 backdrop-blur-md px-3 sm:px-6 py-[20px] overflow-y-auto animate-in fade-in duration-150"
    >
      {/* Popup modal with exact 20px top and bottom margin, inner vertical scrollbar */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-4xl h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] overflow-hidden flex flex-col ring-1 ring-slate-900/10 shrink-0 my-auto">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Fully rounded circle avatar */}
            <div className="relative shrink-0">
              {patient.avatarUrl ? (
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20 shadow-xs border border-slate-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-2 ring-white shadow-xs">
                  {patient.name
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Reception Check-In
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-mono font-semibold text-slate-600">
                  {patient.patientNumber}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{patient.appointmentTime || patient.form?.timeSlot || '10:30 AM'}</span>
                </span>
              </div>
              <h2 className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">
                {patient.name}{' '}
                <span className="text-sm font-semibold text-slate-500">
                  ({patient.age} Y • {patient.gender})
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 3 Step Progress Gauge */}
            <div className="hidden sm:flex flex-col items-end">
              <div className="text-xs font-bold text-slate-700">
                {completedStepsCount} of 3 Steps Completed ({progressPercent}%)
              </div>
              <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden border border-slate-200/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Direct Send to Assessment Button - 40px Height */}
            <button
              type="button"
              onClick={() => {
                onSendToAssessment(patient.id);
                onClose();
              }}
              className="hidden md:flex items-center gap-1.5 px-4 h-[40px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Advance patient to MA Assessment Queue"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Assessment</span>
            </button>

            {/* Close Button - 40px Height & Width */}
            <button
              type="button"
              onClick={onClose}
              className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The 3 Tabs Navigation Bar (Form, Vitals, Records) */}
        <div className="px-6 py-2.5 bg-slate-50/90 border-b border-slate-200 grid grid-cols-3 gap-2 shrink-0">
          {/* TAB 1: FORM */}
          <button
            type="button"
            id="checkin-tab-form"
            onClick={() => setActiveTab('form')}
            className={`h-[48px] px-3.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeTab === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">1. Form</div>
                <div className="text-[10px] text-slate-500 truncate">Self/Guardian & Contacts</div>
              </div>
            </div>
            {isFormDone ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                title="Form Completed"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Done</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Pending</span>
            )}
          </button>

          {/* TAB 2: VITALS */}
          <button
            type="button"
            id="checkin-tab-vitals"
            onClick={() => setActiveTab('vitals')}
            className={`h-[48px] px-3.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'vitals'
                ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeTab === 'vitals'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">2. Vitals</div>
                <div className="text-[10px] text-slate-500 truncate">Vitals & Body Composition</div>
              </div>
            </div>
            {isVitalsDone ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                title="Vitals Completed"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Done</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Pending</span>
            )}
          </button>

          {/* TAB 3: RECORDS */}
          <button
            type="button"
            id="checkin-tab-records"
            onClick={() => setActiveTab('records')}
            className={`h-[48px] px-3.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'records'
                ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeTab === 'records'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <FolderArchive className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">3. Records</div>
                <div className="text-[10px] text-slate-500 truncate">Scans, Radiology & Labs</div>
              </div>
            </div>
            {isRecordsDone ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                title="Records Attached"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Done</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Pending</span>
            )}
          </button>
        </div>

        {/* Modal Content Body with Dedicated Inner Vertical Scroll Bar */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-modal-scrollbar">
          {/* ============================================================ */}
          {/* TAB 1: FORM (DEFAULT OPEN TAB)                               */}
          {/* ============================================================ */}
          {activeTab === 'form' && (
            <form onSubmit={(e) => handleSaveForm(e, true)} className="space-y-6">
              {/* Guidance Info Banner */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-bold">Patient Registration & Intake Details:</span> Basic
                  details (Name, Mobile, Doctor, Slot) are pre-populated from initial walk-in /
                  booking. Complete guardian info, address, up to 3 emergency numbers, and referral
                  below.
                </div>
              </div>

              {/* SECTION A: PRE-POPULATED BASIC DETAILS */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>A. Basic Registration (Auto-Populated)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Patient Name - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Aarav Patel"
                    />
                  </div>

                  {/* Mobile Number - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 98250 14892"
                    />
                  </div>

                  {/* Patient Type: Self / Guardian Toggle - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Patient Type: Self / Guardian <span className="text-rose-500">*</span>
                    </label>
                    <div className="h-[40px] flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPatientType('Self')}
                        className={`h-[32px] flex-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                          patientType === 'Self'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Self
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientType('Guardian')}
                        className={`h-[32px] flex-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                          patientType === 'Guardian'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Guardian
                      </button>
                    </div>
                  </div>

                  {/* Doctor Selection (Not compulsory / optional) - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Assigned Doctor <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={doctorAssignedId}
                      onChange={(e) => setDoctorAssignedId(e.target.value)}
                      className="w-full h-[40px] text-xs font-semibold px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">-- No Doctor Selected (General Queue) --</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slot - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Time Slot
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full h-[40px] text-xs font-semibold pl-9 pr-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        placeholder="10:30 AM"
                      />
                    </div>
                  </div>

                  {/* Visit Type - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Visit Type
                    </label>
                    <div className="h-[40px] flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVisitType('New Patient')}
                        className={`h-[32px] flex-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                          visitType === 'New Patient'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        New Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisitType('Follow-up')}
                        className={`h-[32px] flex-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                          visitType === 'Follow-up'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Follow-up
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reason of Visit - 40px Height */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reason of Visit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reasonOfVisit}
                    onChange={(e) => setReasonOfVisit(e.target.value)}
                    className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Chest tightness, Fever, Routine Blood Pressure Review"
                  />
                  {/* Quick Reason Chips */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                    {[
                      'Routine Health Check',
                      'Chest Tightness',
                      'Hypertension Review',
                      'Migraine',
                      'Joint Pain',
                      'Follow-up Report Review',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setReasonOfVisit(chip)}
                        className="text-[11px] h-[28px] px-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200 transition-colors flex items-center cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION B: GUARDIAN DETAILS (Active when Guardian is selected) */}
              {patientType === 'Guardian' && (
                <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-4 shadow-2xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      <span>B. Guardian Details</span>
                    </h4>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Required for Guardian
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">
                        Name of Guardian <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={patientType === 'Guardian'}
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full h-[40px] text-xs font-semibold px-3.5 bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. Ramesh Patel"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">
                        Relation to Patient <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={guardianRelation}
                        onChange={(e) => setGuardianRelation(e.target.value)}
                        className="w-full h-[40px] text-xs font-semibold px-3 bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">
                        Guardian Contact Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required={patientType === 'Guardian'}
                        value={guardianMobile}
                        onChange={(e) => setGuardianMobile(e.target.value)}
                        className="w-full h-[40px] text-xs font-semibold px-3.5 bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        placeholder="+91 98250 99412"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: CONTACT & ADDRESS */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>C. Contact & Address Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="patient@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City, State & Pincode
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="Ahmedabad, Gujarat - 380015"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="Flat / House No., Society / Building, Landmark, Area"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: EMERGENCY CONTACT NUMBERS (UP TO 3) */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>D. Emergency Numbers (Can add up to 3)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Critical contact numbers for urgent communication during clinical care.
                    </p>
                  </div>

                  {/* Add Number Button - 40px Height */}
                  <button
                    type="button"
                    onClick={handleAddEmergencyContact}
                    disabled={emergencyContacts.length >= 3}
                    className="h-[40px] px-4 flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:pointer-events-none rounded-xl border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Number ({emergencyContacts.length}/3)</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={contact.id}
                      className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-1 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          value={contact.name}
                          onChange={(e) =>
                            handleUpdateEmergencyContact(contact.id, 'name', e.target.value)
                          }
                          className="w-full h-[40px] text-xs font-semibold px-3 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          placeholder="Contact Name"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={contact.relation}
                          onChange={(e) =>
                            handleUpdateEmergencyContact(contact.id, 'relation', e.target.value)
                          }
                          className="w-full h-[40px] text-xs font-semibold px-3 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Friend">Friend</option>
                          <option value="Relative">Relative</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="tel"
                          required
                          value={contact.mobile}
                          onChange={(e) =>
                            handleUpdateEmergencyContact(contact.id, 'mobile', e.target.value)
                          }
                          className="w-full h-[40px] text-xs font-semibold px-3 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          placeholder="+91 Mobile Number"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveEmergencyContact(contact.id)}
                          disabled={emergencyContacts.length <= 1}
                          className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION E: REFERRAL DETAILS */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span>E. Referral Information</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Referred by (Doctor / Clinic / Hospital / Other Name)
                  </label>
                  <input
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className="w-full h-[40px] text-xs font-semibold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Dr. Rajesh Mehta / Lifeline Heart Clinic / Self-referred"
                  />
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-slate-400">Quick options:</span>
                    {['Self / Walk-in', 'Dr. S. K. Bhatt', 'Sterling Hospital', 'Family Reference'].map(
                      (ref) => (
                        <button
                          key={ref}
                          type="button"
                          onClick={() => setReferredBy(ref)}
                          className="text-[11px] h-[28px] px-2.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg border border-slate-200 flex items-center cursor-pointer"
                        >
                          {ref}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Form Action Buttons - 40px Height */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSaveForm(undefined, false)}
                  className="h-[40px] px-5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Save Form Draft
                </button>

                <button
                  type="submit"
                  className="h-[40px] px-5 flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Save & Proceed to Vitals</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 2: VITALS (PHYSIOLOGICAL VITALS + BODY COMPOSITION)      */}
          {/* ============================================================ */}
          {activeTab === 'vitals' && (
            <form onSubmit={(e) => handleSaveVitals(e, true)} className="space-y-6">
              {/* Guidance Info Banner */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                <Activity className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-bold">Part 1 (Vitals) & Part 2 (Body Composition):</span>{' '}
                  Receptionist captures standard baseline parameters. BMI is automatically calculated
                  in real-time from Height and Weight.
                </div>
              </div>

              {/* PART 1: PHYSIOLOGICAL VITALS */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    <span>Part 1: Physiological Vitals</span>
                  </h4>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${bpStatus.color}`}
                  >
                    BP Status: {bpStatus.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Blood Pressure Systolic - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      BP Systolic (mmHg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={60}
                      max={250}
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Normal: &lt; 120 mmHg</span>
                    </div>
                  </div>

                  {/* Blood Pressure Diastolic - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      BP Diastolic (mmHg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={40}
                      max={150}
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Normal: &lt; 80 mmHg</span>
                    </div>
                  </div>

                  {/* Pulse - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pulse / Heart Rate (bpm) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={40}
                      max={200}
                      value={pulse}
                      onChange={(e) => setPulse(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Normal: 60 - 100 bpm</span>
                    </div>
                  </div>

                  {/* SpO2 - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Oxygen Saturation (SpO2 %) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={70}
                      max={100}
                      value={spo2}
                      onChange={(e) => setSpo2(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Normal: 95 - 100%</span>
                    </div>
                  </div>

                  {/* Temperature - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Body Temperature (°F) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={94}
                      max={106}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Normal: 97.8 - 99.0 °F</span>
                    </div>
                  </div>

                  {/* Respiratory Rate - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Respiratory Rate (breaths/min)
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={40}
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Normal: 12 - 20 bpm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PART 2: BODY COMPOSITION & BMI */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Part 2: Body Composition</span>
                  </h4>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${bmiStatus.color}`}
                  >
                    BMI: {computedBmi} ({bmiStatus.label})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Height - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Height (cm) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={250}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  {/* Weight - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Weight (kg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={20}
                      max={250}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  {/* Body Fat Percentage - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Body Fat % <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={5}
                      max={60}
                      value={bodyFat}
                      onChange={(e) => setBodyFat(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  {/* Muscle Mass - 40px Height */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Muscle Mass (kg) <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={10}
                      max={120}
                      value={muscleMass}
                      onChange={(e) => setMuscleMass(Number(e.target.value))}
                      className="w-full h-[40px] text-sm font-bold px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Live BMI Visual Bar */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Calculated Body Mass Index:</span>
                    <span className="font-extrabold text-blue-900 font-mono text-sm">
                      {computedBmi} kg/m²
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400" style={{ width: '25%' }} title="Underweight (<18.5)" />
                    <div className="h-full bg-emerald-500" style={{ width: '35%' }} title="Normal (18.5-24.9)" />
                    <div className="h-full bg-amber-400" style={{ width: '25%' }} title="Overweight (25-29.9)" />
                    <div className="h-full bg-rose-500" style={{ width: '15%' }} title="Obese (>=30)" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>16</span>
                    <span>18.5</span>
                    <span>25.0</span>
                    <span>30.0+</span>
                  </div>
                </div>
              </div>

              {/* Vitals Action Buttons - 40px Height */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="h-[40px] px-5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Back to Form
                </button>

                <button
                  type="submit"
                  className="h-[40px] px-5 flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Save & Proceed to Records</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 3: RECORDS (UPLOAD, SCAN, AUTO-CATEGORIZE & RED ALERTS)  */}
          {/* ============================================================ */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              {/* Guidance Info Banner */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <FolderArchive className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Medical Records & Diagnostic Scans:</span> Upload or
                    scan patient records (Radiology, Sonography, Blood Reports, Prescriptions,
                    Suggestions). Documents are automatically categorized and sorted by Scan Date.
                    Critical reports are prominently highlighted in{' '}
                    <strong className="text-rose-700 underline font-extrabold">RED</strong> for
                    rapid doctor review.
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 bg-white px-3 h-[32px] rounded-lg border border-blue-200 text-xs font-bold text-blue-900">
                  <span>Total:</span>
                  <span className="font-mono">{uploadedRecords.length}</span>
                </div>
              </div>

              {/* UPLOAD & SCANNER ACTION STRIP */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload or Scan Patient Records</span>
                  </h4>

                  {/* Live Scanner Animation Banner if scanning */}
                  {isScanning && (
                    <div className="h-[32px] flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 rounded-lg border border-blue-300 animate-pulse">
                      <Camera className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning Document... ({scanProgress}%)</span>
                    </div>
                  )}
                </div>

                {/* Primary Upload / Scan Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Flatbed / Camera Scan */}
                  <button
                    type="button"
                    onClick={handleStartScanSimulation}
                    disabled={isScanning}
                    className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 hover:from-blue-100/70 hover:to-indigo-100/70 border border-blue-200 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950 flex items-center gap-1">
                        <span>Scan Physical Document / Hardcopy</span>
                        <span className="text-[10px] text-blue-600 bg-white px-1.5 py-0.2 rounded border border-blue-200 font-semibold">
                          Live Scan
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Scans hardcopy via flatbed scanner or camera with auto-enhancement
                      </div>
                    </div>
                  </button>

                  {/* File Upload Drop Area */}
                  <label className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.dcm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const detectedCat = detectCategoryFromName(file.name);
                          const newRec: PatientUploadedRecord = {
                            id: `rec-${Date.now()}`,
                            title: file.name.replace(/\.[^/.]+$/, ''),
                            category: detectedCat,
                            scanDate: '04 Sep 2026',
                            scanTime: new Date().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                            sourceOrClinic: 'Patient Upload / External Facility',
                            fileType: file.type.includes('image') ? 'image' : 'pdf',
                            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            isCritical: false,
                            importantHighlights: [
                              'Newly uploaded record from patient archive',
                              `Categorized under ${detectedCat}`,
                            ],
                            uploadedAt: new Date().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                            uploadedBy: 'Priya Shah (Receptionist)',
                          };
                          const updated = [newRec, ...uploadedRecords];
                          setUploadedRecords(updated);
                          saveRecordsToPatient(updated);
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Upload Diagnostic File (PDF, Image, DICOM)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Auto-detects Category & extracts key medical metrics
                      </div>
                    </div>
                  </label>
                </div>

                {/* Quick Demo Pre-Set Records Selector */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Quick Sample Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddSampleRecord('BLOOD REPORTS', true)}
                    className="h-[32px] px-2.5 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>+ Critical Troponin Blood Report (Red Alert)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleRecord('RADIOLOGY', false)}
                    className="h-[32px] px-2.5 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-300 transition-colors flex items-center cursor-pointer"
                  >
                    + Chest X-Ray (Radiology)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleRecord('SONOGRAPHY', false)}
                    className="h-[32px] px-2.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-300 transition-colors flex items-center cursor-pointer"
                  >
                    + USG Abdomen (Sonography)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleRecord('PRESCRIPTION', false)}
                    className="h-[32px] px-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors flex items-center cursor-pointer"
                  >
                    + Discharge Rx (Prescription)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSampleRecord('SUGGESTIONS', false)}
                    className="h-[32px] px-2.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-300 transition-colors flex items-center cursor-pointer"
                  >
                    + Diet & Rehab (Suggestions)
                  </button>
                </div>
              </div>

              {/* CATEGORY FILTER TABS - 40px Height */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {(
                    [
                      'ALL',
                      'RADIOLOGY',
                      'SONOGRAPHY',
                      'BLOOD REPORTS',
                      'PRESCRIPTION',
                      'SUGGESTIONS',
                    ] as const
                  ).map((cat) => {
                    const count =
                      cat === 'ALL'
                        ? uploadedRecords.length
                        : uploadedRecords.filter((r) => r.category === cat).length;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setRecordFilter(cat)}
                        className={`h-[40px] px-3.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                          recordFilter === cat
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            recordFilter === cat
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sorted by Scan Date (Newest first)</span>
                </div>
              </div>

              {/* RECORD CARDS LIST (CHRONOLOGICALLY ARRANGED ACCORDING TO SCAN DATE) */}
              <div className="space-y-3.5">
                {filteredRecords.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <FolderArchive className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="font-bold text-slate-600">No records found for this category</div>
                    <p className="text-[11px] text-slate-400">
                      Use the buttons above to scan or upload reports.
                    </p>
                  </div>
                ) : (
                  filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`relative rounded-2xl border transition-all p-4 shadow-xs hover:shadow-md ${
                        record.isCritical
                          ? 'bg-rose-50/90 border-2 border-rose-400 shadow-rose-100 ring-2 ring-rose-200/50'
                          : 'bg-white hover:bg-slate-50/70 border-slate-200/90 hover:border-blue-300'
                      }`}
                    >
                      {/* Top Header Row of Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Category Badge */}
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                                record.category,
                                record.isCritical
                              )}`}
                            >
                              {record.category}
                            </span>

                            {/* Scan Date Badge with Calendar Icon */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/90 border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Scan Date: {record.scanDate}</span>
                              {record.scanTime && (
                                <span className="text-slate-400">· {record.scanTime}</span>
                              )}
                            </span>

                            {/* High-Visibility Red Critical Alert Tag if Critical */}
                            {record.isCritical && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-rose-600 px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>CRITICAL REPORT - DOCTOR ATTENTION REQUIRED</span>
                              </span>
                            )}
                          </div>

                          <h3
                            className={`font-extrabold text-sm sm:text-base leading-snug mt-1.5 ${
                              record.isCritical ? 'text-rose-950 font-black' : 'text-slate-900'
                            }`}
                          >
                            {record.title}
                          </h3>

                          {record.sourceOrClinic && (
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                              <span>Facility: {record.sourceOrClinic}</span>
                              {record.doctorOrOrderedBy && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>Doctor: {record.doctorOrOrderedBy}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Top Actions - 40px Height */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Toggle Critical status to test color change to red - 40px Height */}
                          <button
                            type="button"
                            onClick={() => handleToggleCritical(record.id)}
                            className={`h-[40px] text-xs font-bold px-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                              record.isCritical
                                ? 'bg-rose-200 hover:bg-rose-300 text-rose-900 border-rose-300'
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200'
                            }`}
                            title="Toggle critical status (changes card color to red)"
                          >
                            {record.isCritical ? 'Flagged Critical ✓' : 'Flag Critical'}
                          </button>

                          {/* View Button - 40px Height */}
                          <button
                            type="button"
                            onClick={() => setPreviewingRecord(record)}
                            className="h-[40px] px-3.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>

                          {/* Delete Button - 40px Height & Width */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* CRITICAL REPORT SUMMARY BANNER (RED HIGHLIGHT) */}
                      {record.isCritical && record.criticalSummary && (
                        <div className="mt-3 p-3 bg-rose-100/90 border border-rose-300 rounded-xl text-xs font-bold text-rose-950 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="leading-snug">{record.criticalSummary}</div>
                        </div>
                      )}

                      {/* IMPORTANT HIGHLIGHTS SECTION (KEEP IN GOOD WAYS FOR DOCTOR EASILY TO VIEW) */}
                      {record.importantHighlights && record.importantHighlights.length > 0 && (
                        <div
                          className={`mt-3 p-3 rounded-xl border text-xs ${
                            record.isCritical
                              ? 'bg-white/80 border-rose-200/90'
                              : 'bg-slate-50/90 border-slate-200/80'
                          }`}
                        >
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1 mb-1.5">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span>Important Diagnostic Highlights & Key Findings:</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {record.importantHighlights.map((hl, i) => {
                              const isHlCritical =
                                hl.toLowerCase().includes('critical') ||
                                hl.toLowerCase().includes('high >') ||
                                hl.toLowerCase().includes('depressed');
                              return (
                                <span
                                  key={i}
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                                    isHlCritical
                                      ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                                      : 'bg-white text-slate-800 border-slate-200/90'
                                  }`}
                                >
                                  {isHlCritical && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                  )}
                                  <span>{hl}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes / Footer */}
                      {record.notes && (
                        <div className="mt-2 text-[11px] text-slate-500 italic">
                          <span>Note: {record.notes}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Records Action Buttons - 40px Height */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('vitals')}
                  className="h-[40px] px-5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Back to Vitals
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      saveRecordsToPatient(uploadedRecords);
                      onClose();
                    }}
                    className="h-[40px] px-5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Save & Keep in Check-In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      saveRecordsToPatient(uploadedRecords);
                      onSendToAssessment(patient.id);
                      onClose();
                    }}
                    className="h-[40px] px-5 flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save & Send to Assessment</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* PREVIEW MODAL FOR MEDICAL RECORD / REPORT                    */}
        {/* ============================================================ */}
        {previewingRecord && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                      previewingRecord.category,
                      previewingRecord.isCritical
                    )}`}
                  >
                    {previewingRecord.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">
                    {previewingRecord.title}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Scan Date: {previewingRecord.scanDate} · Size: {previewingRecord.fileSize}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewingRecord(null)}
                  className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 custom-modal-scrollbar">
                {previewingRecord.isCritical && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{previewingRecord.criticalSummary}</span>
                  </div>
                )}

                {/* Simulated Diagnostic Report Document Viewer */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
                  <div className="flex justify-between border-b border-slate-700 pb-2 text-[11px] text-slate-400">
                    <span>SOLTECH CLINICAL DIAGNOSTIC VIEWER v4.2</span>
                    <span>PATIENT: {patient.name} ({patient.patientNumber})</span>
                  </div>
                  <div className="text-emerald-400 text-xs font-bold py-1">
                    EXAMINATION: {previewingRecord.title}
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    FACILITY: {previewingRecord.sourceOrClinic || 'Soltech Central Diagnostics'}
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    DATE OF SCAN: {previewingRecord.scanDate}
                  </div>
                  <div className="pt-2 text-slate-200 text-xs">
                    FINDINGS & OBSERVATIONS:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                    {previewingRecord.importantHighlights.map((hl, i) => (
                      <li key={i} className={hl.includes('CRITICAL') ? 'text-rose-400 font-bold' : ''}>
                        {hl}
                      </li>
                    ))}
                  </ul>
                  {previewingRecord.notes && (
                    <div className="pt-2 text-slate-400 text-[11px]">
                      CLINICAL IMPRESSION / NOTES: {previewingRecord.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewingRecord(null)}
                  className="h-[40px] px-5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Close Document Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
