import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  FileText,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Smile,
  Pill,
  Sparkles,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Patient,
  MedicalRecordEntry,
  ActiveCondition,
  AllergySensitivity,
  CategorizedMedication,
  SurgicalHospitalization,
  FamilyGeneticRecord,
  ImmunizationRecord,
  LifestyleMentalHealth,
  MedicalHistoryRemark,
} from '../types';

interface MedicalHistoryIntakeModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSaveMedicalHistory: (
    updatedRecords: MedicalRecordEntry,
    routeToDoctor?: boolean,
    maNotes?: string
  ) => void;
  initialCategory?: 'conditions' | 'allergies' | 'medications' | 'surgeries' | 'family' | 'immunizations' | 'lifestyle' | 'remarks';
}

// -------------------------------------------------------------
// Auto-Classification Heuristics
// -------------------------------------------------------------
export function autoClassifyCondition(name: string): boolean {
  const n = name.toLowerCase();
  const chronicKeywords = [
    'diabetes', 'hypertension', 'bp', 'asthma', 'copd', 'thyroid', 'arthritis',
    'coronary', 'cad', 'heart', 'kidney', 'ckd', 'epilepsy', 'gerd', 'migraine',
    'cholesterol', 'dyslipidemia', 'depression', 'anxiety', 'cancer', 'hepatitis',
    'crohn', 'colitis', 'psoriasis', 'eczema', 'parkinson', 'alzheimer', 'gout'
  ];
  return chronicKeywords.some((k) => n.includes(k));
}

export function autoClassifyAllergy(allergen: string): 'Food Allergy' | 'Drug Allergy' | 'Environment Allergy' | 'Other' {
  const a = allergen.toLowerCase();
  const drugKeywords = ['penicillin', 'sulfa', 'aspirin', 'ibuprofen', 'amox', 'cipro', 'nsaid', 'codeine', 'morphine', 'contrast', 'paracetamol', 'augmentin'];
  const foodKeywords = ['peanut', 'nut', 'milk', 'dairy', 'egg', 'shellfish', 'fish', 'wheat', 'gluten', 'soy', 'sesame', 'lactose', 'banana', 'strawberry'];
  const envKeywords = ['dust', 'pollen', 'mold', 'dander', 'latex', 'bee', 'wasp', 'insect', 'grass', 'sun'];

  if (drugKeywords.some((k) => a.includes(k))) return 'Drug Allergy';
  if (foodKeywords.some((k) => a.includes(k))) return 'Food Allergy';
  if (envKeywords.some((k) => a.includes(k))) return 'Environment Allergy';
  return 'Other';
}

export function autoClassifyMedication(name: string): 'Painkiller' | 'Antacid' | 'Antibiotic' | 'Antihypertensive' | 'Antidiabetic' | 'Cardiovascular' | 'Respiratory' | 'Supplement / Vitamin' | 'Other' {
  const m = name.toLowerCase();
  if (['paracetamol', 'ibuprofen', 'tramadol', 'naproxen', 'diclofenac', 'combiflam', 'dolo', 'aceclofenac'].some((k) => m.includes(k))) return 'Painkiller';
  if (['pantoprazole', 'omeprazole', 'esomeprazole', 'rabeprazole', 'ranitidine', 'famotidine', 'antacid', 'digene', 'gelusil'].some((k) => m.includes(k))) return 'Antacid';
  if (['amox', 'azithro', 'cipro', 'doxy', 'augmentin', 'cefixime', 'metronidazole', 'levoflox'].some((k) => m.includes(k))) return 'Antibiotic';
  if (['amlodipine', 'telmisartan', 'losartan', 'metoprolol', 'atenolol', 'enalapril', 'olmesartan'].some((k) => m.includes(k))) return 'Antihypertensive';
  if (['metformin', 'glimepiride', 'insulin', 'dapagliflozin', 'vildagliptin', 'sitagliptin', 'teneligliptin'].some((k) => m.includes(k))) return 'Antidiabetic';
  if (['atorvastatin', 'rosuvastatin', 'clopidogrel', 'aspirin', 'ecosprin', 'sorbitrate'].some((k) => m.includes(k))) return 'Cardiovascular';
  if (['inhaler', 'salbutamol', 'budesonide', 'montelukast', 'formoterol', 'deriphyllin'].some((k) => m.includes(k))) return 'Respiratory';
  if (['vitamin', 'b12', 'calcium', 'd3', 'folic', 'iron', 'zinc', 'multivitamin', 'becosules'].some((k) => m.includes(k))) return 'Supplement / Vitamin';
  return 'Other';
}

export function autoClassifySurgery(procedure: string): 'Major Surgery' | 'Minor Surgery' | 'Past Hospital Admission' {
  const p = procedure.toLowerCase();
  if (['admission', 'admitted', 'icu', 'hospitalization', 'inpatient', 'stay', 'observation'].some((k) => p.includes(k))) return 'Past Hospital Admission';
  if (['bypass', 'cabg', 'replacement', 'transplant', 'craniotomy', 'resection', 'cholecystectomy', 'appendectomy', 'hysterectomy', 'hernia'].some((k) => p.includes(k))) return 'Major Surgery';
  return 'Minor Surgery';
}

export const MedicalHistoryIntakeModal: React.FC<MedicalHistoryIntakeModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSaveMedicalHistory,
  initialCategory = 'conditions',
}) => {
  const [activeCategory, setActiveCategory] = useState<'conditions' | 'allergies' | 'medications' | 'surgeries' | 'family' | 'immunizations' | 'lifestyle' | 'remarks'>(initialCategory);

  // 1. Conditions
  const [conditions, setConditions] = useState<ActiveCondition[]>(() => {
    return patient.medicalRecords?.activeConditionsList || [
      {
        id: 'cond-1',
        name: 'Type 2 Diabetes Mellitus',
        isChronic: true,
        diagnosedYear: '2018',
        status: 'Under Control',
        severity: 'Moderate',
        managementPlan: 'Metformin 500mg BD + Dietary control',
      },
      {
        id: 'cond-2',
        name: 'Primary Essential Hypertension',
        isChronic: true,
        diagnosedYear: '2020',
        status: 'Under Control',
        severity: 'Mild',
        managementPlan: 'Telmisartan 40mg OD in morning',
      },
    ];
  });

  // 2. Allergies & Sensitivities
  const [allergies, setAllergies] = useState<AllergySensitivity[]>(() => {
    return patient.medicalRecords?.allergiesSensitivitiesList || [
      {
        id: 'allg-1',
        allergen: 'Penicillin',
        category: 'Drug Allergy',
        natureOfReaction: 'Urticaria, facial puffiness, wheezing',
        severity: 'Severe',
        frequency: 'On Every Exposure',
        firstNoticedDate: '2019',
      },
      {
        id: 'allg-2',
        allergen: 'Dust Mites & Pollen',
        category: 'Environment Allergy',
        natureOfReaction: 'Sneezing, allergic rhinitis, watery eyes',
        severity: 'Mild',
        frequency: 'Seasonal / Occasional',
        firstNoticedDate: '2015',
      },
    ];
  });

  // 3. Medications
  const [medications, setMedications] = useState<CategorizedMedication[]>(() => {
    return patient.medicalRecords?.categorizedMedicationsList || [
      {
        id: 'med-1',
        name: 'Metformin Hydrochloride',
        medicineType: 'Antidiabetic',
        dosage: '500 mg',
        frequency: 'Twice daily (BD)',
        route: 'Oral',
        prescriber: 'Dr. Ramesh Sharma',
        takingSince: '2018',
      },
      {
        id: 'med-2',
        name: 'Telmisartan',
        medicineType: 'Antihypertensive',
        dosage: '40 mg',
        frequency: 'Once daily (OD)',
        route: 'Oral',
        prescriber: 'Dr. Ramesh Sharma',
        takingSince: '2020',
      },
      {
        id: 'med-3',
        name: 'Pantoprazole',
        medicineType: 'Antacid',
        dosage: '40 mg',
        frequency: 'As needed (SOS)',
        route: 'Oral',
        prescriber: 'Self / OTC',
        takingSince: '2023',
      },
      {
        id: 'med-4',
        name: 'Paracetamol',
        medicineType: 'Painkiller',
        dosage: '650 mg',
        frequency: 'As needed (SOS)',
        route: 'Oral',
        prescriber: 'Clinic OTC',
        takingSince: '2024',
      },
    ];
  });

  // 4. Surgical & Hospitalization
  const [surgeries, setSurgeries] = useState<SurgicalHospitalization[]>(() => {
    return patient.medicalRecords?.surgicalHospitalizationList || [
      {
        id: 'surg-1',
        procedureOrReason: 'Coronary Angioplasty (PTCA)',
        category: 'Major Surgery',
        year: '2018',
        hospitalOrFacility: 'Apollo City Hospital',
        dischargeSummaryNotes: 'Stent placed in LAD; successful recovery with no ischemic recurrence.',
      },
      {
        id: 'surg-2',
        procedureOrReason: 'Dengue Fever with Thrombocytopenia',
        category: 'Past Hospital Admission',
        year: '2022',
        hospitalOrFacility: 'Sterling Hospital',
        dischargeSummaryNotes: '4 days inpatient admission, platelet count stabilized, discharged fully recovered.',
      },
    ];
  });

  // 5. Family & Genetic History
  const [familyRecords, setFamilyRecords] = useState<FamilyGeneticRecord[]>(() => {
    return patient.medicalRecords?.familyGeneticList || [
      {
        id: 'fam-1',
        condition: 'Coronary Artery Disease',
        relation: 'Father',
        ageOfOnset: '52 years',
        notes: 'Underwent CABG bypass at age 58; passed away at 74.',
      },
      {
        id: 'fam-2',
        condition: 'Type 2 Diabetes',
        relation: 'Mother',
        ageOfOnset: '48 years',
        notes: 'Living, managed with oral hypoglycemics.',
      },
    ];
  });

  // 6. Immunization Records
  const [immunizations, setImmunizations] = useState<ImmunizationRecord[]>(() => {
    return patient.medicalRecords?.immunizationList || [
      {
        id: 'imm-1',
        vaccineName: 'COVID-19 (Covishield / AstraZeneca)',
        doseNumber: 'Dose 1 & 2 + Precaution Booster',
        dateAdministered: '2022',
        status: 'Completed',
        administeringClinic: 'Civil Hospital Immunization Center',
      },
      {
        id: 'imm-2',
        vaccineName: 'Hepatitis B Recombinant',
        doseNumber: 'Complete 3-dose series',
        dateAdministered: '2016',
        status: 'Completed',
        administeringClinic: 'District Health Center',
      },
      {
        id: 'imm-3',
        vaccineName: 'Influenza Annual Quadrivalent',
        doseNumber: 'Annual Shot',
        dateAdministered: 'Oct 2025',
        status: 'Due',
        administeringClinic: 'Clinic OPD',
      },
    ];
  });

  // 7. Lifestyle and Mental Health
  const [lifestyle, setLifestyle] = useState<LifestyleMentalHealth>(() => {
    return patient.medicalRecords?.lifestyleMentalHealth || {
      smoking: 'Non-smoker (Quit in 2014, 10 pack-year history prior)',
      alcohol: 'Occasional / Social (1-2 drinks per month)',
      dietProfile: 'Predominantly vegetarian, low sodium, moderate glycemic index',
      physicalActivity: 'Brisk walking 30 mins, 4-5 times a week',
      sleepHoursPerNight: '6.5 to 7 hours, restful with no sleep apnea reported',
      stressLevel: 'Moderate',
      moodScreeningNotes: 'PHQ-2 screening negative. Mild work-related tension reported.',
    };
  });

  // Remarks
  const [remarks, setRemarks] = useState<MedicalHistoryRemark[]>(() => {
    return patient.medicalRecords?.medicalHistoryRemarks || [
      {
        id: 'rem-1',
        timestamp: '04 Sep 2026, 09:30 AM',
        author: 'Anjali Mehta, CMA',
        role: 'MA',
        text: 'Patient verified all documented medications and confirmed taking Telmisartan consistently every morning.',
      },
    ];
  });

  // Local Form Entry States for adding new items with guided sub-questions
  const [newCondInput, setNewCondInput] = useState({ name: '', isChronic: true, year: '2026', status: 'Under Control' as const, severity: 'Mild' as const, plan: '' });
  const [newAllergyInput, setNewAllergyInput] = useState({ allergen: '', category: 'Drug Allergy' as const, reaction: '', severity: 'Moderate' as const, freq: 'On Every Exposure' });
  const [newMedInput, setNewMedInput] = useState({ name: '', type: 'Painkiller' as const, dose: '500 mg', freq: 'Once daily (OD)', route: 'Oral', prescriber: 'Attending Doctor' });
  const [newSurgInput, setNewSurgInput] = useState({ procedure: '', category: 'Major Surgery' as const, year: '2024', facility: 'City Hospital', notes: '' });
  const [newFamInput, setNewFamInput] = useState({ condition: '', relation: 'Father', age: '50 years', notes: '' });
  const [newImmInput, setNewImmInput] = useState({ name: '', dose: '1st Dose', date: '2026', status: 'Completed' as const, clinic: 'Soltech Clinic' });
  const [newRemarkText, setNewRemarkText] = useState('');

  // Handle Condition Add with Auto-Classification
  const handleAddCondition = () => {
    if (!newCondInput.name.trim()) return;
    const isAutoChronic = autoClassifyCondition(newCondInput.name);
    const newEntry: ActiveCondition = {
      id: `cond-${Date.now()}`,
      name: newCondInput.name.trim(),
      isChronic: isAutoChronic !== undefined ? isAutoChronic : newCondInput.isChronic,
      diagnosedYear: newCondInput.year,
      status: newCondInput.status,
      severity: newCondInput.severity,
      managementPlan: newCondInput.plan || 'Standard clinical management',
    };
    setConditions([newEntry, ...conditions]);
    setNewCondInput({ name: '', isChronic: true, year: '2026', status: 'Under Control', severity: 'Mild', plan: '' });
  };

  // Handle Allergy Add with Auto-Classification
  const handleAddAllergy = () => {
    if (!newAllergyInput.allergen.trim()) return;
    const autoCat = autoClassifyAllergy(newAllergyInput.allergen);
    const newEntry: AllergySensitivity = {
      id: `allg-${Date.now()}`,
      allergen: newAllergyInput.allergen.trim(),
      category: autoCat,
      natureOfReaction: newAllergyInput.reaction || 'Hypersensitivity reaction',
      severity: newAllergyInput.severity,
      frequency: newAllergyInput.freq,
      firstNoticedDate: '2024',
    };
    setAllergies([newEntry, ...allergies]);
    setNewAllergyInput({ allergen: '', category: 'Drug Allergy', reaction: '', severity: 'Moderate', freq: 'On Every Exposure' });
  };

  // Handle Medication Add with Auto-Classification
  const handleAddMedication = () => {
    if (!newMedInput.name.trim()) return;
    const autoType = autoClassifyMedication(newMedInput.name);
    const newEntry: CategorizedMedication = {
      id: `med-${Date.now()}`,
      name: newMedInput.name.trim(),
      medicineType: autoType,
      dosage: newMedInput.dose || '500 mg',
      frequency: newMedInput.freq,
      route: newMedInput.route,
      prescriber: newMedInput.prescriber,
      takingSince: '2026',
    };
    setMedications([newEntry, ...medications]);
    setNewMedInput({ name: '', type: 'Painkiller', dose: '500 mg', freq: 'Once daily (OD)', route: 'Oral', prescriber: 'Attending Doctor' });
  };

  // Handle Surgery Add with Auto-Classification
  const handleAddSurgery = () => {
    if (!newSurgInput.procedure.trim()) return;
    const autoCat = autoClassifySurgery(newSurgInput.procedure);
    const newEntry: SurgicalHospitalization = {
      id: `surg-${Date.now()}`,
      procedureOrReason: newSurgInput.procedure.trim(),
      category: autoCat,
      year: newSurgInput.year,
      hospitalOrFacility: newSurgInput.facility,
      dischargeSummaryNotes: newSurgInput.notes || 'Uneventful recovery',
    };
    setSurgeries([newEntry, ...surgeries]);
    setNewSurgInput({ procedure: '', category: 'Major Surgery', year: '2024', facility: 'City Hospital', notes: '' });
  };

  // Handle Family Record Add
  const handleAddFamilyRecord = () => {
    if (!newFamInput.condition.trim()) return;
    const newEntry: FamilyGeneticRecord = {
      id: `fam-${Date.now()}`,
      condition: newFamInput.condition.trim(),
      relation: newFamInput.relation,
      ageOfOnset: newFamInput.age,
      notes: newFamInput.notes,
    };
    setFamilyRecords([newEntry, ...familyRecords]);
    setNewFamInput({ condition: '', relation: 'Father', age: '50 years', notes: '' });
  };

  // Handle Immunization Add
  const handleAddImmunization = () => {
    if (!newImmInput.name.trim()) return;
    const newEntry: ImmunizationRecord = {
      id: `imm-${Date.now()}`,
      vaccineName: newImmInput.name.trim(),
      doseNumber: newImmInput.dose,
      dateAdministered: newImmInput.date,
      status: newImmInput.status,
      administeringClinic: newImmInput.clinic,
    };
    setImmunizations([newEntry, ...immunizations]);
    setNewImmInput({ name: '', dose: '1st Dose', date: '2026', status: 'Completed', clinic: 'Soltech Clinic' });
  };

  // Handle Add Remark
  const handleAddRemark = () => {
    if (!newRemarkText.trim()) return;
    const nowTime = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: MedicalHistoryRemark = {
      id: `rem-${Date.now()}`,
      timestamp: nowTime,
      author: 'Anjali Mehta, CMA',
      role: 'MA',
      text: newRemarkText.trim(),
    };
    setRemarks([newEntry, ...remarks]);
    setNewRemarkText('');
  };

  const handleSaveAll = (routeToDoctor: boolean = false) => {
    const updatedRecords: MedicalRecordEntry = {
      ...patient.medicalRecords,
      completed: true,
      allergies: allergies.map((a) => a.allergen),
      chronicConditions: conditions.filter((c) => c.isChronic).map((c) => c.name),
      pastSurgeries: surgeries.map((s) => `${s.procedureOrReason} (${s.year || 'Past'})`),
      currentMedications: medications.map((m) => `${m.name} ${m.dosage}`),
      familyHistory: familyRecords.map((f) => `${f.relation}: ${f.condition}`),
      // 7 Clean Domain Collections
      activeConditionsList: conditions,
      allergiesSensitivitiesList: allergies,
      categorizedMedicationsList: medications,
      surgicalHospitalizationList: surgeries,
      familyGeneticList: familyRecords,
      immunizationList: immunizations,
      lifestyleMentalHealth: lifestyle,
      medicalHistoryRemarks: remarks,
    };

    onSaveMedicalHistory(
      updatedRecords,
      routeToDoctor,
      `Comprehensive 7-category Medical History updated with ${conditions.length} conditions, ${allergies.length} allergies, and ${medications.length} medications.`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2f5597] text-white flex items-center justify-center shadow-xs">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Medical History Intake & Classification</h3>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-bold text-slate-800">{patient.name}</span> (PID-{patient.patientNumber || patient.patientIdNumber})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7 Section Category Navigation Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 border-b border-slate-200/80 overflow-x-auto scrollbar-thin shrink-0">
          {[
            { id: 'conditions', label: '1. Active Conditions', count: conditions.length },
            { id: 'allergies', label: '2. Allergies & Sensitivities', count: allergies.length },
            { id: 'medications', label: '3. Medications', count: medications.length },
            { id: 'surgeries', label: '4. Surgical & Hospitalization', count: surgeries.length },
            { id: 'family', label: '5. Family & Genetics', count: familyRecords.length },
            { id: 'immunizations', label: '6. Immunizations', count: immunizations.length },
            { id: 'lifestyle', label: '7. Lifestyle & Mental Health', count: 7 },
            { id: 'remarks', label: 'Remarks', count: remarks.length },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#2f5597] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeCategory === cat.id ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 scrollbar-thin">
          {/* ======================================================== */}
          {/* CATEGORY 1: ACTIVE CONDITIONS                            */}
          {/* ======================================================== */}
          {activeCategory === 'conditions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">1. Known & Active Medical Conditions</h4>
                  <p className="text-xs text-slate-500">
                    System automatically categorizes entries as <strong className="text-blue-900">Chronic</strong> or <strong className="text-slate-700">Non-Chronic</strong>.
                  </p>
                </div>
              </div>

              {/* Guided Add Box */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <span className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-700" />
                  <span>Add New Condition with Clinical Status</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Condition Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Type 2 Diabetes, Migraine, Hypertension"
                      value={newCondInput.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const isChr = autoClassifyCondition(name);
                        setNewCondInput({ ...newCondInput, name, isChronic: isChr });
                      }}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Diagnosed Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2020"
                      value={newCondInput.year}
                      onChange={(e) => setNewCondInput({ ...newCondInput, year: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Clinical Status</label>
                    <select
                      value={newCondInput.status}
                      onChange={(e) => setNewCondInput({ ...newCondInput, status: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Under Control">Under Control</option>
                      <option value="Uncontrolled">Uncontrolled</option>
                      <option value="In Remission">In Remission</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Newly Diagnosed">Newly Diagnosed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Severity</label>
                    <select
                      value={newCondInput.severity}
                      onChange={(e) => setNewCondInput({ ...newCondInput, severity: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Classification Preview</label>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-blue-900 flex items-center justify-between">
                      <span>{newCondInput.isChronic ? 'Chronic Disease' : 'Non-Chronic / Acute'}</span>
                      <span className="text-[10px] font-normal text-slate-500">Auto-detected</span>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Management Plan / Medication</label>
                    <input
                      type="text"
                      placeholder="e.g. Oral Metformin 500mg BD, lifestyle modification"
                      value={newCondInput.plan}
                      onChange={(e) => setNewCondInput({ ...newCondInput, plan: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCondition}
                  disabled={!newCondInput.name.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2f5597] hover:bg-[#254680] disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Add Condition to Record
                </button>
              </div>

              {/* Grouped Lists: Chronic vs Non-Chronic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chronic Conditions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-black text-rose-900 uppercase">Chronic Conditions</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {conditions.filter((c) => c.isChronic).length} Listed
                    </span>
                  </div>
                  {conditions.filter((c) => c.isChronic).map((c) => (
                    <div key={c.id} className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => setConditions(conditions.filter((x) => x.id !== c.id))}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                        <span className="font-mono">Diagnosed: {c.diagnosedYear || 'Unknown'}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">{c.status}</span>
                        <span>•</span>
                        <span>Severity: {c.severity || 'Moderate'}</span>
                      </div>
                      {c.managementPlan && <p className="text-[11px] text-slate-600 italic">Plan: {c.managementPlan}</p>}
                    </div>
                  ))}
                </div>

                {/* Non-Chronic Conditions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-700 uppercase">Non-Chronic / Episodic</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {conditions.filter((c) => !c.isChronic).length} Listed
                    </span>
                  </div>
                  {conditions.filter((c) => !c.isChronic).length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3">No non-chronic conditions recorded.</p>
                  ) : (
                    conditions.filter((c) => !c.isChronic).map((c) => (
                      <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{c.name}</span>
                          <button
                            type="button"
                            onClick={() => setConditions(conditions.filter((x) => x.id !== c.id))}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                          <span>Status: {c.status}</span>
                          <span>•</span>
                          <span>Year: {c.diagnosedYear}</span>
                        </div>
                        {c.managementPlan && <p className="text-[11px] text-slate-600 italic">Plan: {c.managementPlan}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 2: ALLERGIES & SENSITIVITIES                    */}
          {/* ======================================================== */}
          {activeCategory === 'allergies' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">2. Allergies & Environmental Sensitivities</h4>
                <p className="text-xs text-slate-500">
                  Auto-categorized into <strong className="text-amber-900">Food Allergy</strong>, <strong className="text-rose-900">Drug Allergy</strong>, or <strong className="text-blue-900">Environment Allergy</strong>.
                </p>
              </div>

              {/* Guided Add Box */}
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Add Allergy with Severity & Nature of Reaction</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Allergen Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, Peanuts, Pollen"
                      value={newAllergyInput.allergen}
                      onChange={(e) => {
                        const allergen = e.target.value;
                        const cat = autoClassifyAllergy(allergen);
                        setNewAllergyInput({ ...newAllergyInput, allergen, category: cat });
                      }}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category (Auto-Detected)</label>
                    <select
                      value={newAllergyInput.category}
                      onChange={(e) => setNewAllergyInput({ ...newAllergyInput, category: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900 font-bold"
                    >
                      <option value="Drug Allergy">Drug Allergy</option>
                      <option value="Food Allergy">Food Allergy</option>
                      <option value="Environment Allergy">Environment Allergy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Severity</label>
                    <select
                      value={newAllergyInput.severity}
                      onChange={(e) => setNewAllergyInput({ ...newAllergyInput, severity: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                      <option value="Life-threatening">Life-threatening</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nature of Reaction</label>
                    <input
                      type="text"
                      placeholder="e.g. Anaphylaxis, Rash / Urticaria, Facial swelling, Wheezing"
                      value={newAllergyInput.reaction}
                      onChange={(e) => setNewAllergyInput({ ...newAllergyInput, reaction: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Frequency</label>
                    <select
                      value={newAllergyInput.freq}
                      onChange={(e) => setNewAllergyInput({ ...newAllergyInput, freq: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="On Every Exposure">On Every Exposure</option>
                      <option value="Seasonal / Occasional">Seasonal / Occasional</option>
                      <option value="Past episode only">Past episode only</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  disabled={!newAllergyInput.allergen.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Add Allergy Record
                </button>
              </div>

              {/* Categorized Allergies Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Drug Allergy', 'Food Allergy', 'Environment Allergy'].map((catName) => {
                  const filtered = allergies.filter((a) => a.category === catName || (catName === 'Environment Allergy' && a.category === 'Other'));
                  return (
                    <div key={catName} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-extrabold text-slate-900">{catName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                          {filtered.length}
                        </span>
                      </div>
                      {filtered.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No {catName.toLowerCase()}s reported.</p>
                      ) : (
                        filtered.map((allg) => (
                          <div key={allg.id} className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-amber-950">⚠️ {allg.allergen}</span>
                              <button
                                type="button"
                                onClick={() => setAllergies(allergies.filter((x) => x.id !== allg.id))}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-700 font-medium">{allg.natureOfReaction}</p>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                              <span className="bg-white px-1.5 py-0.2 rounded border border-amber-300 text-amber-800">{allg.severity}</span>
                              <span>•</span>
                              <span>{allg.frequency}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 3: MEDICATIONS                                  */}
          {/* ======================================================== */}
          {activeCategory === 'medications' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">3. Current & Regular Medications</h4>
                <p className="text-xs text-slate-500">
                  Auto-sorted by therapeutic class: <strong className="text-slate-800">Painkiller, Antacid, Antibiotic, Antihypertensive, Antidiabetic</strong>, etc.
                </p>
              </div>

              {/* Guided Add Box */}
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Log Prescription / Over-The-Counter Medication</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol, Pantoprazole, Metformin"
                      value={newMedInput.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const type = autoClassifyMedication(name);
                        setNewMedInput({ ...newMedInput, name, type });
                      }}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Class (Auto-Detected)</label>
                    <select
                      value={newMedInput.type}
                      onChange={(e) => setNewMedInput({ ...newMedInput, type: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900 font-bold"
                    >
                      <option value="Painkiller">Painkiller</option>
                      <option value="Antacid">Antacid</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Antihypertensive">Antihypertensive</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="Supplement / Vitamin">Supplement / Vitamin</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500 mg, 40 mg"
                      value={newMedInput.dose}
                      onChange={(e) => setNewMedInput({ ...newMedInput, dose: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Frequency</label>
                    <select
                      value={newMedInput.freq}
                      onChange={(e) => setNewMedInput({ ...newMedInput, freq: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Once daily (OD)">Once daily (OD)</option>
                      <option value="Twice daily (BD)">Twice daily (BD)</option>
                      <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                      <option value="As needed (SOS)">As needed (SOS)</option>
                      <option value="At Bedtime (HS)">At Bedtime (HS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Route</label>
                    <select
                      value={newMedInput.route}
                      onChange={(e) => setNewMedInput({ ...newMedInput, route: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Sublingual">Sublingual</option>
                      <option value="Injectable">Injectable</option>
                      <option value="Topical">Topical</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Prescribing Doctor / Facility</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ramesh Sharma, Cardiology Clinic"
                      value={newMedInput.prescriber}
                      onChange={(e) => setNewMedInput({ ...newMedInput, prescriber: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  disabled={!newMedInput.name.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Add Medication
                </button>
              </div>

              {/* Categorized Medications Display */}
              <div className="space-y-2">
                {medications.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{m.name}</span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {m.medicineType}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {m.dosage}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                        <span>Schedule: <strong>{m.frequency}</strong></span>
                        <span>•</span>
                        <span>Route: {m.route || 'Oral'}</span>
                        {m.prescriber && (
                          <>
                            <span>•</span>
                            <span>Prescribed by: {m.prescriber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMedications(medications.filter((x) => x.id !== m.id))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 4: SURGICAL & HOSPITALIZATION                   */}
          {/* ======================================================== */}
          {activeCategory === 'surgeries' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">4. Surgical & Hospitalization History</h4>
                <p className="text-xs text-slate-500">
                  Auto-categorized as <strong className="text-blue-900">Major Surgery</strong>, <strong className="text-slate-800">Minor Surgery</strong>, or <strong className="text-amber-900">Past Hospital Admission</strong>.
                </p>
              </div>

              {/* Guided Add Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Log Surgical Procedure or Hospital Stay</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Procedure / Reason for Admission</label>
                    <input
                      type="text"
                      placeholder="e.g. Coronary Angioplasty, Appendectomy, Dengue Hospitalization"
                      value={newSurgInput.procedure}
                      onChange={(e) => {
                        const proc = e.target.value;
                        const cat = autoClassifySurgery(proc);
                        setNewSurgInput({ ...newSurgInput, procedure: proc, category: cat });
                      }}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category (Auto-Detected)</label>
                    <select
                      value={newSurgInput.category}
                      onChange={(e) => setNewSurgInput({ ...newSurgInput, category: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900 font-bold"
                    >
                      <option value="Major Surgery">Major Surgery</option>
                      <option value="Minor Surgery">Minor Surgery</option>
                      <option value="Past Hospital Admission">Past Hospital Admission</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Year / Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 2018"
                      value={newSurgInput.year}
                      onChange={(e) => setNewSurgInput({ ...newSurgInput, year: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hospital / Medical Center</label>
                    <input
                      type="text"
                      placeholder="e.g. Apollo Hospital, Sterling City Hospital"
                      value={newSurgInput.facility}
                      onChange={(e) => setNewSurgInput({ ...newSurgInput, facility: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Discharge Summary & Clinical Outcome</label>
                    <input
                      type="text"
                      placeholder="e.g. Stent placed in LAD; successful recovery with no complications"
                      value={newSurgInput.notes}
                      onChange={(e) => setNewSurgInput({ ...newSurgInput, notes: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSurgery}
                  disabled={!newSurgInput.procedure.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2f5597] hover:bg-[#254680] disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Add Surgical Entry
                </button>
              </div>

              {/* Surgeries List */}
              <div className="space-y-2">
                {surgeries.map((s) => (
                  <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{s.procedureOrReason}</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            s.category === 'Major Surgery'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : s.category === 'Past Hospital Admission'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {s.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSurgeries(surgeries.filter((x) => x.id !== s.id))}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                      <span className="font-mono">Year: {s.year || 'Past'}</span>
                      {s.hospitalOrFacility && (
                        <>
                          <span>•</span>
                          <span>Hospital: {s.hospitalOrFacility}</span>
                        </>
                      )}
                    </div>
                    {s.dischargeSummaryNotes && (
                      <p className="text-[11px] text-slate-600 italic">Discharge Notes: {s.dischargeSummaryNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 5: FAMILY & GENETIC HISTORY                     */}
          {/* ======================================================== */}
          {activeCategory === 'family' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">5. Family & Genetic History</h4>
                <p className="text-xs text-slate-500">Document hereditary risks, cardiac events, and metabolic disorders across direct kin.</p>
              </div>

              {/* Guided Add Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Add Family Member Condition</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Relationship</label>
                    <select
                      value={newFamInput.relation}
                      onChange={(e) => setNewFamInput({ ...newFamInput, relation: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Maternal Grandparent">Maternal Grandparent</option>
                      <option value="Paternal Grandparent">Paternal Grandparent</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Condition</label>
                    <input
                      type="text"
                      placeholder="e.g. Coronary Artery Disease, Type 2 Diabetes"
                      value={newFamInput.condition}
                      onChange={(e) => setNewFamInput({ ...newFamInput, condition: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Age of Onset</label>
                    <input
                      type="text"
                      placeholder="e.g. 52 years"
                      value={newFamInput.age}
                      onChange={(e) => setNewFamInput({ ...newFamInput, age: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Clinical Context & Outcomes</label>
                    <input
                      type="text"
                      placeholder="e.g. Underwent bypass at age 58; managed on statins"
                      value={newFamInput.notes}
                      onChange={(e) => setNewFamInput({ ...newFamInput, notes: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddFamilyRecord}
                  disabled={!newFamInput.condition.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2f5597] hover:bg-[#254680] disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Add Family Record
                </button>
              </div>

              {/* Family Records List */}
              <div className="space-y-2">
                {familyRecords.map((f) => (
                  <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {f.relation}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{f.condition}</span>
                        {f.ageOfOnset && <span className="text-[10px] font-mono text-slate-500">Onset: {f.ageOfOnset}</span>}
                      </div>
                      {f.notes && <p className="text-[11px] text-slate-600 mt-1">{f.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFamilyRecords(familyRecords.filter((x) => x.id !== f.id))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 6: IMMUNIZATION RECORDS                         */}
          {/* ======================================================== */}
          {activeCategory === 'immunizations' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">6. Immunization Records</h4>
                <p className="text-xs text-slate-500">Log routine, occupational, and seasonal vaccinations.</p>
              </div>

              {/* Guided Add Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Log Vaccination</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vaccine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. COVID-19, Hepatitis B, Influenza"
                      value={newImmInput.name}
                      onChange={(e) => setNewImmInput({ ...newImmInput, name: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dose / Series</label>
                    <input
                      type="text"
                      placeholder="e.g. Dose 1 & 2, Annual Shot"
                      value={newImmInput.dose}
                      onChange={(e) => setNewImmInput({ ...newImmInput, dose: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
                    <select
                      value={newImmInput.status}
                      onChange={(e) => setNewImmInput({ ...newImmInput, status: e.target.value as any })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Due">Due</option>
                      <option value="Booster Needed">Booster Needed</option>
                      <option value="Exempt">Exempt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date Administered</label>
                    <input
                      type="text"
                      placeholder="e.g. Oct 2025"
                      value={newImmInput.date}
                      onChange={(e) => setNewImmInput({ ...newImmInput, date: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Administering Center</label>
                    <input
                      type="text"
                      placeholder="e.g. Civil Hospital Immunization Center"
                      value={newImmInput.clinic}
                      onChange={(e) => setNewImmInput({ ...newImmInput, clinic: e.target.value })}
                      className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddImmunization}
                  disabled={!newImmInput.name.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Save Vaccination
                </button>
              </div>

              {/* Immunizations List */}
              <div className="space-y-2">
                {immunizations.map((imm) => (
                  <div key={imm.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{imm.vaccineName}</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            imm.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {imm.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                        <span>Dose: {imm.doseNumber || 'Standard'}</span>
                        <span>•</span>
                        <span>Date: {imm.dateAdministered || 'Recorded'}</span>
                        {imm.administeringClinic && (
                          <>
                            <span>•</span>
                            <span>Clinic: {imm.administeringClinic}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImmunizations(immunizations.filter((x) => x.id !== imm.id))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 7: LIFESTYLE & MENTAL HEALTH                    */}
          {/* ======================================================== */}
          {activeCategory === 'lifestyle' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">7. Lifestyle Habits & Mental Health Evaluation</h4>
                <p className="text-xs text-slate-500">Document behavioral risk factors, physical activity baseline, sleep, and emotional wellbeing.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Tobacco & Smoking History</label>
                  <textarea
                    rows={2}
                    value={lifestyle.smoking}
                    onChange={(e) => setLifestyle({ ...lifestyle, smoking: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Alcohol Consumption</label>
                  <textarea
                    rows={2}
                    value={lifestyle.alcohol}
                    onChange={(e) => setLifestyle({ ...lifestyle, alcohol: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Dietary Profile & Nutrition</label>
                  <textarea
                    rows={2}
                    value={lifestyle.dietProfile}
                    onChange={(e) => setLifestyle({ ...lifestyle, dietProfile: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Physical Activity & Exercise</label>
                  <textarea
                    rows={2}
                    value={lifestyle.physicalActivity}
                    onChange={(e) => setLifestyle({ ...lifestyle, physicalActivity: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Sleep Pattern & Rest (Hours/Night)</label>
                  <input
                    type="text"
                    value={lifestyle.sleepHoursPerNight || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, sleepHoursPerNight: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                    placeholder="e.g. 7 hours / night, restful"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Perceived Stress Level</label>
                  <select
                    value={lifestyle.stressLevel || 'Moderate'}
                    onChange={(e) => setLifestyle({ ...lifestyle, stressLevel: e.target.value as any })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-bold"
                  >
                    <option value="Low">Low - Relaxed, Coping Well</option>
                    <option value="Moderate">Moderate - Manageable Work/Family Stress</option>
                    <option value="High">High - Elevated Fatigue / Anxiety</option>
                    <option value="Severe">Severe - High Clinical Distress</option>
                  </select>
                </div>
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Mental Health & Mood Screening Notes</label>
                  <textarea
                    rows={2}
                    value={lifestyle.moodScreeningNotes || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, moodScreeningNotes: e.target.value })}
                    className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                    placeholder="e.g. PHQ-2 negative; denies depressive symptoms"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY: REMARKS (AT BOTTOM)                            */}
          {/* ======================================================== */}
          {activeCategory === 'remarks' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Clinical & Front-Desk Remarks</h4>
                <p className="text-xs text-slate-500">Record administrative, nursing, or physician remarks attached to patient medical records.</p>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <label className="text-[10px] font-bold text-blue-900 uppercase block">Add New Remark</label>
                <textarea
                  rows={3}
                  placeholder="Enter clinical remark, special observation, or intake verification note..."
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddRemark}
                  disabled={!newRemarkText.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2f5597] hover:bg-[#254680] disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  Post Remark
                </button>
              </div>

              {/* Remarks List */}
              <div className="space-y-2">
                {remarks.map((r) => (
                  <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-[#2f5597]">{r.author}</span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">{r.role}</span>
                      </div>
                      <span>{r.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-800">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('remarks')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-[#2f5597] bg-white border border-[#2f5597]/40 hover:bg-blue-50 shadow-2xs cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2f5597]" />
              <span>Add Remarks</span>
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {conditions.length + allergies.length + medications.length + surgeries.length} Total items cataloged
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll(false)}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#2f5597] hover:bg-[#254680] shadow-xs cursor-pointer transition-colors"
            >
              Save Medical History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
