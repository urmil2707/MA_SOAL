import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Activity,
  FileText,
  Heart,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Stethoscope,
  Pill,
  ShieldCheck,
  Flame,
  Scale,
  Thermometer,
  Zap,
  Info,
  Check,
  Calendar,
  X,
} from 'lucide-react';
import {
  Patient,
  Doctor,
  DetailedSymptom,
  MedicalRecordEntry,
  ActiveCondition,
  AllergySensitivity,
  CategorizedMedication,
  SurgicalHospitalization,
  FamilyGeneticRecord,
  LifestyleMentalHealth,
  Vitals,
} from '../types';
import { getSmartSymptomSuggestions, COMMON_DISEASES } from '../utils/symptomSuggestions';
import { CLINICAL_SYSTEM_GROUPS, SymptomCategoryGroup } from './SymptomsIntakeModal';
import {
  autoClassifyCondition,
  autoClassifyAllergy,
  autoClassifyMedication,
  autoClassifySurgery,
} from './MedicalHistoryIntakeModal';

interface ClinicalIntakeScreenProps {
  patient: Patient;
  initialTab?: 'symptoms' | 'history' | 'vitals';
  doctors: Doctor[];
  onBack: () => void;
  onSaveIntake: (
    updatedPatient: Patient,
    routeToDoctor: boolean
  ) => void;
}

export const ClinicalIntakeScreen: React.FC<ClinicalIntakeScreenProps> = ({
  patient,
  initialTab = 'symptoms',
  doctors,
  onBack,
  onSaveIntake,
}) => {
  // Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'symptoms' | 'history' | 'vitals'>(initialTab);

  // -------------------------------------------------------------
  // 1. SYMPTOMS STATE
  // -------------------------------------------------------------
  const [chiefComplaint, setChiefComplaint] = useState(
    patient.assessment?.chiefComplaint || 'General clinical assessment'
  );
  const [symptomsDuration, setSymptomsDuration] = useState(
    patient.assessment?.symptomsDuration || '3 Days'
  );
  const [symptomSeverity, setSymptomSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>(
    patient.assessment?.symptomSeverity || 'Moderate'
  );
  const [symptoms, setSymptoms] = useState<DetailedSymptom[]>(() => {
    return (
      patient.assessment?.detailedSymptoms || [
        {
          id: 'sym-initial-1',
          name: patient.assessment?.chiefComplaint || 'Chest Heaviness & Shortness of Breath',
          severity: patient.assessment?.symptomSeverity || 'Moderate',
          onset: 'Gradual',
          character: 'Dull Squeezing',
          radiation: 'To Left Arm & Forearm',
          triggers: 'On Physical Exertion',
          associatedSymptoms: 'Diaphoresis (Cold Sweats), Fatigue',
        },
      ]
    );
  });
  const [suspectDisease, setSuspectDisease] = useState(
    patient.assessment?.suspectDisease || 'Angina Pectoris / Ischemic Heart Disease (IHD)'
  );
  const [maNotes, setMaNotes] = useState(patient.assessment?.maNotes || '');
  const [symptomSearchQuery, setSymptomSearchQuery] = useState('');
  const [expandedSystemId, setExpandedSystemId] = useState<string>('cardiovascular');
  const [expandedSymptomId, setExpandedSymptomId] = useState<string | null>(symptoms[0]?.id || null);

  // Smart suggestions derived from patient specialty, chief complaint, and chronic conditions
  const smartSuggestions = useMemo(() => {
    return getSmartSymptomSuggestions(
      patient.specialty || 'General Medicine',
      chiefComplaint,
      patient.medicalRecords?.chronicConditions
    );
  }, [patient.specialty, chiefComplaint, patient.medicalRecords?.chronicConditions]);

  // -------------------------------------------------------------
  // 2. MEDICAL HISTORY STATE
  // -------------------------------------------------------------
  const [historyCategory, setHistoryCategory] = useState<
    'conditions' | 'allergies' | 'medications' | 'surgeries' | 'family' | 'lifestyle' | 'remarks'
  >('conditions');

  const [conditions, setConditions] = useState<ActiveCondition[]>(() => {
    return (
      patient.medicalRecords?.activeConditionsList || [
        {
          id: 'cond-1',
          name: 'Type 2 Diabetes Mellitus',
          isChronic: true,
          diagnosedYear: '2019',
          status: 'Under Control',
          severity: 'Moderate',
          managementPlan: 'Metformin 500mg BD + Dietary control',
        },
        {
          id: 'cond-2',
          name: 'Primary Essential Hypertension',
          isChronic: true,
          diagnosedYear: '2021',
          status: 'Under Control',
          severity: 'Mild',
          managementPlan: 'Amlodipine 5mg OD morning',
        },
      ]
    );
  });

  const [allergies, setAllergies] = useState<AllergySensitivity[]>(() => {
    return (
      patient.medicalRecords?.allergiesSensitivitiesList || [
        {
          id: 'all-1',
          allergen: 'Penicillin / Amoxicillin',
          category: 'Drug Allergy',
          reaction: 'Urticarial Skin Rash & Angioedema',
          severity: 'Severe',
          isAnaphylaxisRisk: true,
          diagnosedYear: '2015',
        },
      ]
    );
  });

  const [medications, setMedications] = useState<CategorizedMedication[]>(() => {
    return (
      patient.medicalRecords?.categorizedMedicationsList || [
        {
          id: 'med-1',
          name: 'Metformin Hydrochloride',
          category: 'Antidiabetic',
          dosage: '500 mg',
          frequency: 'Twice daily with meals (BD)',
          purpose: 'Glycemic control (HbA1c ~7.2%)',
          compliance: 'Regular',
        },
        {
          id: 'med-2',
          name: 'Amlodipine Besylate',
          category: 'Antihypertensive',
          dosage: '5 mg',
          frequency: 'Once daily in the morning (OD)',
          purpose: 'Blood pressure control',
          compliance: 'Regular',
        },
      ]
    );
  });

  const [surgeries, setSurgeries] = useState<SurgicalHospitalization[]>(() => {
    return (
      patient.medicalRecords?.surgeriesHospitalizationsList || [
        {
          id: 'surg-1',
          procedureOrReason: 'Laparoscopic Appendectomy',
          classification: 'Major Surgery',
          year: '2014',
          hospitalName: 'Sterling Hospital, Ahmedabad',
          outcomeStatus: 'Fully Recovered without complications',
        },
      ]
    );
  });

  const [familyHistory, setFamilyHistory] = useState<FamilyGeneticRecord[]>(() => {
    return (
      patient.medicalRecords?.familyGeneticRecordsList || [
        {
          id: 'fam-1',
          relation: 'Father',
          condition: 'Coronary Artery Disease & Acute Myocardial Infarction',
          approximateOnsetAge: '52 years',
          status: 'Deceased at age 68',
        },
        {
          id: 'fam-2',
          relation: 'Mother',
          condition: 'Type 2 Diabetes Mellitus & Osteoarthritis',
          approximateOnsetAge: '48 years',
          status: 'Living',
        },
      ]
    );
  });

  const [lifestyle, setLifestyle] = useState<LifestyleMentalHealth>(() => {
    return (
      patient.medicalRecords?.lifestyleMentalHealth || {
        smoking: 'Non-smoker (Quit in 2014, 10 pack-year history prior)',
        alcohol: 'Occasional / Social (1-2 drinks per month)',
        dietProfile: 'Predominantly vegetarian, low sodium, moderate glycemic index',
        physicalActivity: 'Brisk walking 30 mins, 4-5 times a week',
        sleepHoursPerNight: '6.5 to 7 hours, restful with no sleep apnea reported',
        stressLevel: 'Moderate',
        moodScreeningNotes: 'PHQ-2 screening negative. Mild work-related tension reported.',
      }
    );
  });

  const [clinicalRemarks, setClinicalRemarks] = useState(
    patient.medicalRecords?.clinicalRemarksText || 'Patient exhibits high compliance with hypertension medication. Advised to maintain low-sodium diet.'
  );

  // Quick Add input state for Medical History categories
  const [newCondName, setNewCondName] = useState('');
  const [newCondStatus, setNewCondStatus] = useState<'Under Control' | 'Uncontrolled' | 'In Remission'>('Under Control');
  const [newAllergenName, setNewAllergenName] = useState('');
  const [newAllergyReaction, setNewAllergyReaction] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('Twice daily (BD)');

  // -------------------------------------------------------------
  // 3. VITALS STATE
  // -------------------------------------------------------------
  const [vitals, setVitals] = useState<Vitals>(() => {
    return (
      patient.vitals || {
        bpSystolic: 128,
        bpDiastolic: 84,
        pulse: 76,
        temperature: 98.6,
        spo2: 98,
        respiratoryRate: 16,
        recordedAt: 'Today',
        recordedBy: 'Anjali Mehta, CMA',
      }
    );
  });

  const [heightCm, setHeightCm] = useState(patient.bodyComposition?.heightCm || 168);
  const [weightKg, setWeightKg] = useState(patient.bodyComposition?.weightKg || 72);

  // Auto calculate BMI
  const currentBmi = useMemo(() => {
    if (heightCm > 0 && weightKg > 0) {
      const hM = heightCm / 100;
      return Number((weightKg / (hM * hM)).toFixed(1));
    }
    return 25.5;
  }, [heightCm, weightKg]);

  // -------------------------------------------------------------
  // HANDLERS: SYMPTOMS
  // -------------------------------------------------------------
  const handleToggleSymptom = (name: string, defaultSeverity: 'Mild' | 'Moderate' | 'Severe' = 'Moderate') => {
    const existing = symptoms.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setSymptoms((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      const newSym: DetailedSymptom = {
        id: `sym-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        severity: defaultSeverity,
        duration: '3 days',
        onset: 'Gradual',
        character: '',
        radiation: '',
        triggers: [],
        associatedSymptoms: [],
      };
      setSymptoms((prev) => [newSym, ...prev]);
      setExpandedSymptomId(newSym.id);
    }
  };

  const handleUpdateSymptom = (id: string, updates: Partial<DetailedSymptom>) => {
    setSymptoms((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleRemoveSymptom = (id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  // -------------------------------------------------------------
  // HANDLERS: MEDICAL HISTORY
  // -------------------------------------------------------------
  const handleAddCondition = () => {
    if (!newCondName.trim()) return;
    const isChr = autoClassifyCondition(newCondName);
    const newEntry: ActiveCondition = {
      id: `cond-${Date.now()}`,
      name: newCondName.trim(),
      isChronic: isChr,
      diagnosedYear: new Date().getFullYear().toString(),
      status: newCondStatus,
      severity: 'Moderate',
      managementPlan: 'Clinical review ongoing',
    };
    setConditions((prev) => [newEntry, ...prev]);
    setNewCondName('');
  };

  const handleAddAllergy = () => {
    if (!newAllergenName.trim()) return;
    const cat = autoClassifyAllergy(newAllergenName);
    const newEntry: AllergySensitivity = {
      id: `all-${Date.now()}`,
      allergen: newAllergenName.trim(),
      category: cat,
      natureOfReaction: newAllergyReaction.trim() || 'Mild cutaneous reaction',
      severity: 'Moderate',
      frequency: 'Occasional',
      firstNoticedDate: new Date().getFullYear().toString(),
    };
    setAllergies((prev) => [newEntry, ...prev]);
    setNewAllergenName('');
    setNewAllergyReaction('');
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const cat = autoClassifyMedication(newMedName);
    const newEntry: CategorizedMedication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      medicineType: cat,
      dosage: newMedDose.trim() || 'Standard Dose',
      frequency: newMedFreq,
      route: 'Oral',
    };
    setMedications((prev) => [newEntry, ...prev]);
    setNewMedName('');
    setNewMedDose('');
  };

  // -------------------------------------------------------------
  // SAVE & ROUTE
  // -------------------------------------------------------------
  const handleFinalSave = (routeToDoctor: boolean) => {
    const updatedMedicalRecords: MedicalRecordEntry = {
      ...patient.medicalRecords,
      activeConditionsList: conditions,
      chronicConditions: conditions.filter((c) => c.isChronic).map((c) => c.name),
      pastMedicalConditions: conditions.filter((c) => !c.isChronic).map((c) => c.name),
      allergiesSensitivitiesList: allergies,
      allergies: allergies.map((a) => `${a.allergen} (${a.natureOfReaction})`),
      categorizedMedicationsList: medications,
      currentMedications: medications.map((m) => `${m.name} ${m.dosage}`),
      surgicalHospitalizationList: surgeries,
      pastSurgeries: surgeries.map((s) => `${s.procedureOrReason} (${s.year})`),
      familyGeneticList: familyHistory,
      familyHistory: familyHistory.map((f) => `${f.relation}: ${f.condition}`),
      lifestyleMentalHealth: lifestyle,
      completed: true,
    };

    const updatedVitals: Vitals = {
      ...vitals,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedBy: 'Anjali Mehta, CMA',
    };

    const updatedPatient: Patient = {
      ...patient,
      status: routeToDoctor ? 'IN QUEUE' : patient.status === 'CHECK-IN' ? 'ASSESSMENT' : patient.status,
      waitingTimeMinutes: routeToDoctor ? 0 : patient.waitingTimeMinutes,
      assessment: {
        ...patient.assessment,
        chiefComplaint: chiefComplaint || symptoms[0]?.name || patient.assessment?.chiefComplaint || 'General clinical assessment',
        symptomsDuration,
        symptomSeverity,
        detailedSymptoms: symptoms,
        suspectDisease: suspectDisease || patient.assessment?.suspectDisease,
        maNotes: maNotes !== undefined ? maNotes : patient.assessment?.maNotes,
        subjectiveCompleted: symptoms.length > 0,
        objectiveCompleted: true,
        assessedBy: 'Anjali Mehta, CMA (MA)',
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      medicalRecords: updatedMedicalRecords,
      vitals: updatedVitals,
      bodyComposition: {
        ...patient.bodyComposition,
        heightCm,
        weightKg,
        bmi: currentBmi,
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recordedBy: 'Anjali Mehta, CMA',
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: routeToDoctor
            ? 'Clinical Intake Completed & Patient Routed to Doctor Queue'
            : 'Clinical Intake Saved by MA (Symptoms, Med History & Vitals)',
          performedBy: 'Anjali Mehta, CMA',
          role: 'MA',
          category: 'Assessment',
          details: `Symptoms: ${symptoms.length} logged. Conditions: ${conditions.length}. Allergies: ${allergies.length}. Meds: ${medications.length}. BMI: ${currentBmi}. Notes: ${maNotes || 'None'}`,
        },
        ...patient.activityTimeline,
      ],
    };

    onSaveIntake(updatedPatient, routeToDoctor);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50/90 select-none">
      {/* ========================================================= */}
      {/* STICKY TOP COMMAND BAR: Back, Patient Info, Tabs, Route   */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap lg:flex-nowrap">
          {/* Left: Back Button & Patient Summary */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="intake-back-to-queue-btn"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
              title="Return to MA Patient Queue"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Queue</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs ring-2 ring-teal-100">
                {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900">{patient.name}</h2>
                  <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                    {patient.patientNumber || 'STP-PATIENT'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                  <span>{patient.age} Y / {patient.gender}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <Stethoscope className="w-3 h-3 text-indigo-600" />
                    <strong>{patient.doctorName}</strong> ({patient.roomNumber || 'Room 101'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: TOP SEGMENTED INTAKE TABS (Switch in-screen with 0 popups!) */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              type="button"
              id="intake-tab-symptoms"
              onClick={() => setActiveTab('symptoms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'symptoms'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>1. Symptoms Intake</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  activeTab === 'symptoms' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {symptoms.length}
              </span>
            </button>

            <button
              type="button"
              id="intake-tab-medhistory"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Medical History</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {conditions.length + allergies.length}
              </span>
            </button>

            <button
              type="button"
              id="intake-tab-vitals"
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>3. Vitals & Body Comp</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  activeTab === 'vitals' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {vitals.bpSystolic}/{vitals.bpDiastolic}
              </span>
            </button>
          </div>

          {/* Right: Dual Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleFinalSave(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              id="intake-save-route-doctor-btn"
              onClick={() => handleFinalSave(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Route to Dr. {patient.doctorName.split(' ')[1] || patient.doctorName}'s Queue →</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN SCREEN BODY (SWAPPABLE WITHOUT ANY POPUPS)           */}
      {/* ========================================================= */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-24">
        {/* ======================================================= */}
        {/* TAB 1: SYMPTOMS INTAKE WORKSPACE                        */}
        {/* ======================================================= */}
        {activeTab === 'symptoms' && (
          <div className="space-y-6">
            {/* Chief Complaint Banner & Quick Duration/Severity Row */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Primary Chief Complaint
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="e.g. Chest heaviness, exertional breathlessness, high fever..."
                      className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={symptomsDuration}
                      onChange={(e) => setSymptomsDuration(e.target.value)}
                      placeholder="e.g. 3 Days"
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Severity
                    </label>
                    <select
                      value={symptomSeverity}
                      onChange={(e) => setSymptomSeverity(e.target.value as any)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Smart Symptom Suggestion Chips */}
              {smartSuggestions.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-extrabold text-teal-700 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Suggested for this clinical presentation:</span>
                  </span>
                  {smartSuggestions.map((suggestion) => {
                    const isSelected = symptoms.some(
                      (s) => s.name.toLowerCase() === suggestion.name.toLowerCase()
                    );
                    return (
                      <button
                        key={suggestion.name}
                        type="button"
                        onClick={() => handleToggleSymptom(suggestion.name, suggestion.defaultSeverity || 'Moderate')}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-teal-50/70 hover:bg-teal-100/70 text-teal-900 border-teal-200/80'
                        }`}
                        title={suggestion.description || suggestion.name}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {suggestion.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Symptoms List & Deep Clinical Descriptors */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Logged Symptoms & Characterization ({symptoms.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Click a symptom below to customize onset, radiation, triggers & associated symptoms
                </span>
              </div>

              {symptoms.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  No symptoms logged yet. Pick from the suggested chips above or select from the clinical body systems below.
                </div>
              ) : (
                <div className="space-y-3">
                  {symptoms.map((symptom, idx) => {
                    const isExpanded = expandedSymptomId === symptom.id;
                    return (
                      <div
                        key={symptom.id}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/60 overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => setExpandedSymptomId(isExpanded ? null : symptom.id)}
                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{symptom.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                symptom.severity === 'Severe'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : symptom.severity === 'Moderate'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {symptom.severity}
                            </span>
                            {symptom.onset && (
                              <span className="text-[10px] text-slate-500 font-medium">Onset: {symptom.onset}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSymptom(symptom.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Symptom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Clinical Descriptors Form */}
                        {isExpanded && (
                          <div className="p-3.5 pt-1 border-t border-slate-200/70 bg-white grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Severity & Onset</label>
                              <div className="flex gap-2">
                                <select
                                  value={symptom.severity}
                                  onChange={(e) => handleUpdateSymptom(symptom.id, { severity: e.target.value as any })}
                                  className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                                >
                                  <option value="Mild">Mild</option>
                                  <option value="Moderate">Moderate</option>
                                  <option value="Severe">Severe</option>
                                </select>
                                <select
                                  value={symptom.onset || 'Gradual'}
                                  onChange={(e) => handleUpdateSymptom(symptom.id, { onset: e.target.value as any })}
                                  className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                                >
                                  <option value="Acute">Acute</option>
                                  <option value="Gradual">Gradual</option>
                                  <option value="Intermittent">Intermittent</option>
                                  <option value="Constant">Constant</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Character / Sensation</label>
                              <input
                                type="text"
                                value={symptom.character || ''}
                                onChange={(e) => handleUpdateSymptom(symptom.id, { character: e.target.value })}
                                placeholder="e.g. Sharp stabbing, dull aching, crushing"
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Radiation Site</label>
                              <input
                                type="text"
                                value={symptom.radiation || ''}
                                onChange={(e) => handleUpdateSymptom(symptom.id, { radiation: e.target.value })}
                                placeholder="e.g. Left arm, jaw, back, none"
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Triggers / Aggravating Factors</label>
                              <input
                                type="text"
                                value={Array.isArray(symptom.triggers) ? symptom.triggers.join(', ') : (symptom.triggers || '')}
                                onChange={(e) => handleUpdateSymptom(symptom.id, { triggers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                                placeholder="e.g. Physical exertion, cold air, after spicy meals"
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Associated Symptoms</label>
                              <input
                                type="text"
                                value={Array.isArray(symptom.associatedSymptoms) ? symptom.associatedSymptoms.join(', ') : (symptom.associatedSymptoms || '')}
                                onChange={(e) => handleUpdateSymptom(symptom.id, { associatedSymptoms: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                                placeholder="e.g. Sweating, nausea, palpitations"
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6 Clinical Body Systems Browser with 1-Click Pickers */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Clinical Body Systems Browser</h3>
                </div>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={symptomSearchQuery}
                    onChange={(e) => setSymptomSearchQuery(e.target.value)}
                    placeholder="Search symptoms in systems..."
                    className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {CLINICAL_SYSTEM_GROUPS.map((system) => {
                  const isExpanded = expandedSystemId === system.id;
                  const filteredSymptoms = system.commonSymptoms.filter((cs) =>
                    !symptomSearchQuery.trim()
                      ? true
                      : cs.name.toLowerCase().includes(symptomSearchQuery.toLowerCase())
                  );

                  if (symptomSearchQuery.trim() && filteredSymptoms.length === 0) {
                    return null;
                  }

                  return (
                    <div key={system.id} className="border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50/40">
                      <div
                        onClick={() => setExpandedSystemId(isExpanded ? '' : system.id)}
                        className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors bg-slate-50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">{system.title}</span>
                            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 font-semibold">
                              {system.systemName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{system.subtitle}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="p-3.5 bg-white grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-slate-200/70">
                          {filteredSymptoms.map((symItem) => {
                            const isAdded = symptoms.some(
                              (s) => s.name.toLowerCase() === symItem.name.toLowerCase()
                            );
                            return (
                              <button
                                key={symItem.name}
                                type="button"
                                onClick={() => handleToggleSymptom(symItem.name, symItem.defaultSeverity)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-2xs'
                                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                                }`}
                              >
                                <span className="text-xs truncate mr-2">{symItem.name}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                    isAdded
                                      ? 'bg-teal-600 text-white'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {isAdded ? 'Added ✓' : '+ Add'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suspected Disease & MA Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Provisional Diagnosis / Suspected Condition
                </label>
                <select
                  value={suspectDisease}
                  onChange={(e) => setSuspectDisease(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white cursor-pointer"
                >
                  <option value="">Select or leave for Doctor evaluation</option>
                  {COMMON_DISEASES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  MA Clinical Remarks for Doctor
                </label>
                <input
                  type="text"
                  value={maNotes}
                  onChange={(e) => setMaNotes(e.target.value)}
                  placeholder="e.g. Patient appeared distressed on arrival, vitals re-checked twice..."
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: MEDICAL HISTORY WORKSPACE (6+ GROUPS)            */}
        {/* ======================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Sub-Category Nav Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'conditions', label: '1. Active Conditions', count: conditions.length },
                { id: 'allergies', label: '2. Allergies & Sensitivities', count: allergies.length },
                { id: 'medications', label: '3. Current Medications', count: medications.length },
                { id: 'surgeries', label: '4. Surgeries & Admissions', count: surgeries.length },
                { id: 'family', label: '5. Family History', count: familyHistory.length },
                { id: 'lifestyle', label: '6. Lifestyle & Habits', count: null },
                { id: 'remarks', label: '7. Clinical Remarks', count: null },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setHistoryCategory(cat.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    historyCategory === cat.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        historyCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Category 1: Conditions */}
            {historyCategory === 'conditions' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Active & Chronic Conditions</h3>
                    <p className="text-xs text-slate-500">Record diagnosed past and current medical conditions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCondName}
                      onChange={(e) => setNewCondName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                      placeholder="Add condition (e.g. Asthma, Thyroid)..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {conditions.map((cond) => (
                    <div
                      key={cond.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            cond.isChronic
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {cond.isChronic ? 'Chronic' : 'Acute / Past'}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{cond.name}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Diagnosed: {cond.diagnosedYear} · Status: <strong>{cond.status}</strong> · {cond.managementPlan}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setConditions((prev) => prev.filter((c) => c.id !== cond.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 2: Allergies */}
            {historyCategory === 'allergies' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Allergies & Adverse Drug Reactions</h3>
                    <p className="text-xs text-slate-500">Critical for medication and prescription safety</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newAllergenName}
                      onChange={(e) => setNewAllergenName(e.target.value)}
                      placeholder="Allergen (e.g. Penicillin, Peanuts)..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-52"
                    />
                    <input
                      type="text"
                      value={newAllergyReaction}
                      onChange={(e) => setNewAllergyReaction(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                      placeholder="Reaction (e.g. Rash, Anaphylaxis)..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-52"
                    />
                    <button
                      type="button"
                      onClick={handleAddAllergy}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Allergy</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {allergies.map((all) => (
                    <div
                      key={all.id}
                      className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{all.allergen}</span>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                              {all.category}
                            </span>
                            {all.isAnaphylaxisRisk && (
                              <span className="text-[10px] font-black text-rose-800 bg-rose-200/80 px-1.5 py-0.2 rounded">
                                ANAPHYLAXIS RISK
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-600 block mt-0.5">Reaction: {all.reaction}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAllergies((prev) => prev.filter((a) => a.id !== all.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 3: Medications */}
            {historyCategory === 'medications' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Current Daily Medications</h3>
                    <p className="text-xs text-slate-500">Record active prescriptions, supplements, and OTC drugs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="Medication name..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-48"
                    />
                    <input
                      type="text"
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      placeholder="Dose (e.g. 500mg)..."
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-32"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{med.name}</span>
                            <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              {med.dosage}
                            </span>
                            <span className="text-[10px] text-slate-600">{med.frequency}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">Category: {med.category} · Compliance: {med.compliance}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMedications((prev) => prev.filter((m) => m.id !== med.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 4: Surgeries */}
            {historyCategory === 'surgeries' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">Past Surgeries & Hospital Admissions</h3>
                  <p className="text-xs text-slate-500">Major operative procedures and inpatient hospital stays</p>
                </div>
                <div className="space-y-2.5">
                  {surgeries.map((surg) => (
                    <div key={surg.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{surg.procedureOrReason} ({surg.year})</span>
                        <span className="text-[11px] text-slate-500 block">
                          Hospital: {surg.hospitalName} · Outcome: {surg.outcomeStatus}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSurgeries((prev) => prev.filter((s) => s.id !== surg.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 5: Family History */}
            {historyCategory === 'family' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">Family & Hereditary Risk History</h3>
                  <p className="text-xs text-slate-500">Coronary disease, diabetes, hypertension, and cancer predispositions</p>
                </div>
                <div className="space-y-2.5">
                  {familyHistory.map((fam) => (
                    <div key={fam.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{fam.relation}: {fam.condition}</span>
                        <span className="text-[11px] text-slate-500 block">Onset: {fam.approximateOnsetAge} · Status: {fam.status}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFamilyHistory((prev) => prev.filter((f) => f.id !== fam.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category 6: Lifestyle */}
            {historyCategory === 'lifestyle' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">Lifestyle, Habits & Mental Health</h3>
                  <p className="text-xs text-slate-500">Diet, physical activity, substance use, and stress screening</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Dietary Habits</label>
                    <input
                      type="text"
                      value={lifestyle.dietaryPattern}
                      onChange={(e) => setLifestyle({ ...lifestyle, dietaryPattern: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Tobacco / Smoking</label>
                    <input
                      type="text"
                      value={lifestyle.tobaccoUse}
                      onChange={(e) => setLifestyle({ ...lifestyle, tobaccoUse: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Alcohol Consumption</label>
                    <input
                      type="text"
                      value={lifestyle.alcoholIntake}
                      onChange={(e) => setLifestyle({ ...lifestyle, alcoholIntake: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Physical Activity</label>
                    <input
                      type="text"
                      value={lifestyle.physicalActivityLevel}
                      onChange={(e) => setLifestyle({ ...lifestyle, physicalActivityLevel: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category 7: Remarks */}
            {historyCategory === 'remarks' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">Clinical Remarks & Special Instructions</h3>
                  <p className="text-xs text-slate-500">Persistent observations for physician consultation review</p>
                </div>
                <textarea
                  rows={4}
                  value={clinicalRemarks}
                  onChange={(e) => setClinicalRemarks(e.target.value)}
                  placeholder="Enter medical assistant notes, dietary alerts, or family caveats..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: VITALS & BODY COMPOSITION WORKSPACE              */}
        {/* ======================================================= */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
              <div className="pb-2 border-b border-slate-100 mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Hemodynamic Vitals Intake</h3>
                <p className="text-xs text-slate-500">Recorded by Medical Assistant during triage</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Systolic BP</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number"
                      value={vitals.bpSystolic}
                      onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                      className="w-16 font-mono font-black text-slate-900 text-lg bg-white px-2 py-0.5 rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500">mmHg</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Diastolic BP</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number"
                      value={vitals.bpDiastolic}
                      onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                      className="w-16 font-mono font-black text-slate-900 text-lg bg-white px-2 py-0.5 rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500">mmHg</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Pulse / Heart Rate</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: Number(e.target.value) })}
                      className="w-16 font-mono font-black text-slate-900 text-lg bg-white px-2 py-0.5 rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500">bpm</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Oxygen (SpO2)</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                      className="w-16 font-mono font-black text-slate-900 text-lg bg-white px-2 py-0.5 rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Temperature</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                      className="w-16 font-mono font-black text-slate-900 text-lg bg-white px-2 py-0.5 rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500">°F</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Respiratory Rate</label>
                  <div className="flex items-baseline gap-1 mt-1">
                    <input
                      type="number"
                      value={vitals.respiratoryRate}
                      onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
                      className="w-16 font-mono font-black text-slate-900 text-lg bg-white px-2 py-0.5 rounded border border-slate-300"
                    />
                    <span className="text-[10px] text-slate-500">/min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anthropometry & Body Composition */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
              <div className="pb-2 border-b border-slate-100 mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Anthropometry & BMI Calculation</h3>
                <p className="text-xs text-slate-500">Height, Weight, and Real-time BMI assessment</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full font-mono font-black text-slate-900 text-xl bg-white p-2 rounded-lg border border-slate-300 mt-1"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full font-mono font-black text-slate-900 text-xl bg-white p-2 rounded-lg border border-slate-300 mt-1"
                  />
                </div>

                <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Calculated BMI</span>
                  <div className="text-2xl font-black text-teal-950 font-mono mt-0.5">
                    {currentBmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 mt-1">
                    {currentBmi < 18.5
                      ? 'Underweight'
                      : currentBmi < 25
                      ? 'Normal Weight (WHO Class)'
                      : currentBmi < 30
                      ? 'Overweight'
                      : 'Obesity Class I'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* STICKY BOTTOM ACTION FOOTER                               */}
      {/* ========================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Active Intake:</span>
          </span>
          <span>{symptoms.length} Symptoms</span>
          <span>·</span>
          <span>{conditions.length} Conditions</span>
          <span>·</span>
          <span>{allergies.length} Allergies</span>
          <span>·</span>
          <span>Vitals {vitals.bpSystolic}/{vitals.bpDiastolic}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel / Back
          </button>

          <button
            type="button"
            onClick={() => handleFinalSave(false)}
            className="px-4 py-2 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 rounded-xl transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            id="intake-footer-route-btn"
            onClick={() => handleFinalSave(true)}
            className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Save & Route to Doctor Queue →</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
