import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle2,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  SlidersHorizontal,
  Flame,
  Stethoscope,
  Info,
  Calendar,
  Check,
} from 'lucide-react';
import { Patient, DetailedSymptom } from '../types';
import { getSmartSymptomSuggestions, COMMON_DISEASES } from '../utils/symptomSuggestions';

interface SymptomsIntakeModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSaveSymptoms: (updatedSymptoms: DetailedSymptom[], suspectDisease?: string, notes?: string, routeToDoctor?: boolean) => void;
}

// 6 Core Clinical Body Systems matching standard clinical intake
export interface SymptomCategoryGroup {
  id: string;
  title: string;
  subtitle: string;
  systemName: string;
  commonSymptoms: {
    name: string;
    defaultSeverity: 'Mild' | 'Moderate' | 'Severe';
    commonOnset: 'Acute' | 'Gradual' | 'Intermittent' | 'Constant';
    characterOptions: string[];
    radiationOptions: string[];
    triggerOptions: string[];
    associatedOptions: string[];
  }[];
}

export const CLINICAL_SYSTEM_GROUPS: SymptomCategoryGroup[] = [
  {
    id: 'cardiovascular',
    title: 'CARDIOVASCULAR & CIRCULATORY',
    subtitle: 'Chest pain, palpitations, orthopnea, pedal edema',
    systemName: 'Cardiology',
    commonSymptoms: [
      {
        name: 'Retrosternal Chest Tightness / Pressure',
        defaultSeverity: 'Severe',
        commonOnset: 'Acute',
        characterOptions: ['Crushing / Heavy Band', 'Sharp / Stabbing', 'Dull Squeezing', 'Burning'],
        radiationOptions: ['To Left Arm & Forearm', 'To Mandible / Jaw', 'To Interscapular Back', 'No Radiation'],
        triggerOptions: ['On Physical Exertion', 'Mental / Emotional Stress', 'Cold Exposure', 'At Rest'],
        associatedOptions: ['Diaphoresis (Cold Sweats)', 'Nausea / Queasiness', 'Shortness of Breath', 'Presyncope / Dizziness'],
      },
      {
        name: 'Palpitations (Racing / Skipped Beats)',
        defaultSeverity: 'Moderate',
        commonOnset: 'Intermittent',
        characterOptions: ['Rapid Fluttering', 'Hard Pounding Thumps', 'Irregular Rhythm', 'Skipped Beats'],
        radiationOptions: ['Substernal / Throat', 'No Radiation'],
        triggerOptions: ['Caffeine / Tea', 'Anxiety / Stress', 'Post-meal', 'Post-exercise'],
        associatedOptions: ['Lightheadedness', 'Breathlessness', 'Chest Flutter'],
      },
      {
        name: 'Exertional Dyspnea (Shortness of Breath)',
        defaultSeverity: 'Moderate',
        commonOnset: 'Gradual',
        characterOptions: ['Air Hunger on Climbing', 'Inability to Take Deep Breath', 'Rapid Shallow Breathing'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['Climbing Stairs', 'Walking >100 meters', 'Carrying Groceries'],
        associatedOptions: ['Wheezing', 'Dry Cough', 'Leg Heaviness'],
      },
      {
        name: 'Bilateral Pedal Edema (Ankle Swelling)',
        defaultSeverity: 'Mild',
        commonOnset: 'Gradual',
        characterOptions: ['Pitting Fluid Accumulation', 'Tight Shoe Fit in Evening', 'Tense Skin'],
        radiationOptions: ['Up to Mid-calf', 'Ankles Only'],
        triggerOptions: ['Prolonged Standing', 'High Salt Meals', 'Evening Rise'],
        associatedOptions: ['Weight Gain', 'Nocturia (Waking to Urinate)'],
      },
      {
        name: 'Presyncope / Sudden Lightheadedness',
        defaultSeverity: 'Moderate',
        commonOnset: 'Intermittent',
        characterOptions: ['Blacking Out Sensation', 'Room Spinning / Vertigo', 'Unsteadiness on Standing'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['Sudden Standing (Orthostatic)', 'Straining / Coughing', 'Warm Rooms'],
        associatedOptions: ['Sweating', 'Blurred Vision', 'Nausea'],
      },
    ],
  },
  {
    id: 'respiratory',
    title: 'RESPIRATORY & PULMONARY',
    subtitle: 'Cough, wheezing, breathlessness, sputum',
    systemName: 'Pulmonology',
    commonSymptoms: [
      {
        name: 'Spasmodic Cough (Dry or Productive)',
        defaultSeverity: 'Moderate',
        commonOnset: 'Acute',
        characterOptions: ['Dry Irritative Bouts', 'Productive (Mucoid / White)', 'Productive (Yellow / Greenish)', 'Blood-tinged Sputum'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['Nighttime / 3 AM Waking', 'Cold Beverages', 'Dust / Smoke Pollen', 'Exercise'],
        associatedOptions: ['Throat Tickle', 'Chest Soreness', 'Post-nasal Drip', 'Low Fever'],
      },
      {
        name: 'Expiratory Wheezing & Whistling',
        defaultSeverity: 'Severe',
        commonOnset: 'Acute',
        characterOptions: ['Audible High-pitched Whistle', 'Tight Chest Squeeze', 'Prolonged Expiration'],
        radiationOptions: ['Bilateral Chest'],
        triggerOptions: ['Cold Night Air', 'Aerosol Inhalants', 'Upper Respiratory Infection'],
        associatedOptions: ['Intercostal Retraction', 'Air Hunger', 'Cyanosis'],
      },
      {
        name: 'Nocturnal Dyspnea / Orthopnea',
        defaultSeverity: 'Severe',
        commonOnset: 'Intermittent',
        characterOptions: ['Sudden Waking Gasping for Air', 'Need to Sleep on 3 Pillows', 'Relieved by Sitting Upright'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['Lying Supine Flat', '2 Hours After Sleep'],
        associatedOptions: ['Dry Cough', 'Diaphoresis', 'Anxiety'],
      },
      {
        name: 'Pleuritic Chest Wall Pain',
        defaultSeverity: 'Moderate',
        commonOnset: 'Acute',
        characterOptions: ['Sharp Knife-like on Deep Inspiration', 'Aggravated by Coughing', 'Localized to One Side'],
        radiationOptions: ['Ipsilateral Shoulder', 'No Radiation'],
        triggerOptions: ['Deep Inspiration', 'Sneezing', 'Laughing', 'Torso Twisting'],
        associatedOptions: ['Shallow Rapid Breaths', 'Fever'],
      },
    ],
  },
  {
    id: 'gastrointestinal',
    title: 'GASTROINTESTINAL & ABDOMINAL',
    subtitle: 'Acidity, heartburn, dyspepsia, nausea, bowel alterations',
    systemName: 'Gastroenterology',
    commonSymptoms: [
      {
        name: 'Retrosternal Epigastric Burning (Heartburn)',
        defaultSeverity: 'Moderate',
        commonOnset: 'Intermittent',
        characterOptions: ['Hot Acidic Burning Sensation', 'Sour Eructation / Regurgitation', 'Water Brash in Mouth'],
        radiationOptions: ['Upward to Pharynx & Throat', 'No Radiation'],
        triggerOptions: ['Spicy / Oily Foods', 'Lying Down After Dinner', 'Coffee / Tea', 'Empty Stomach'],
        associatedOptions: ['Burping / Belching', 'Globus (Lump in Throat)', 'Nausea'],
      },
      {
        name: 'Epigastric Pain / Cramping',
        defaultSeverity: 'Moderate',
        commonOnset: 'Intermittent',
        characterOptions: ['Gnawing Hunger Ache', 'Crampy Colicky Waves', 'Localized Tenderness'],
        radiationOptions: ['Through to Mid-Back', 'Right Upper Quadrant', 'No Radiation'],
        triggerOptions: ['1–2 Hours Post-meal', 'Skipping Meals', 'NSAIDs / Painkillers'],
        associatedOptions: ['Relieved by Food / Milk', 'Early Satiety', 'Bloating'],
      },
      {
        name: 'Persistent Nausea & Episodic Vomiting',
        defaultSeverity: 'Moderate',
        commonOnset: 'Acute',
        characterOptions: ['Dry Heaving / Retching', 'Bilious Vomitus', 'Undigested Food Vomiting'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['Food Aromas', 'Motion / Travel', 'Morning Upon Waking'],
        associatedOptions: ['Loss of Appetite', 'Dehydration / Dry Tongue', 'Abdominal Cramps'],
      },
      {
        name: 'Altered Bowel Habits (Diarrhea / Constipation)',
        defaultSeverity: 'Mild',
        commonOnset: 'Gradual',
        characterOptions: ['Watery Frequent Stools (>4/day)', 'Hard Pellet Stools (<2/week)', 'Excessive Flatulence'],
        radiationOptions: ['Lower Quadrants'],
        triggerOptions: ['Dairy / Lactose', 'Stress / Irritable Bowel', 'Outside Food'],
        associatedOptions: ['Tenesmus (Urgent Straining)', 'Abdominal Rumbling'],
      },
    ],
  },
  {
    id: 'neurological',
    title: 'NEUROLOGICAL & HEAD/NECK',
    subtitle: 'Headache, migraine, vertigo, visual disturbances, paresthesia',
    systemName: 'Neurology',
    commonSymptoms: [
      {
        name: 'Throbbing Unilateral Headache (Migraine)',
        defaultSeverity: 'Severe',
        commonOnset: 'Acute',
        characterOptions: ['Pulsating Hemicrania', 'Tight Vice-like Band', 'Explosive Occipital Pressure'],
        radiationOptions: ['Behind Eye / Orbit', 'Down Neck Muscles', 'No Radiation'],
        triggerOptions: ['Bright Lights / Screens', 'Loud Sounds', 'Skipped Sleep / Fasting', 'Stress'],
        associatedOptions: ['Photophobia (Light Sensitive)', 'Phonophobia (Sound Sensitive)', 'Visual Aura / Flashes', 'Nausea'],
      },
      {
        name: 'Peripheral Extremity Tingling (Paresthesia)',
        defaultSeverity: 'Mild',
        commonOnset: 'Gradual',
        characterOptions: ['Pins & Needles in Soles', 'Burning Sensation in Toes', 'Stocking-Glove Numbness'],
        radiationOptions: ['Bilateral Feet', 'Hands Only'],
        triggerOptions: ['Nighttime Rest', 'Prolonged Sitting', 'Cold Environment'],
        associatedOptions: ['Loss of Vibration Sense', 'Unsteadiness in Dark'],
      },
      {
        name: 'True Vertigo / Room Spinning',
        defaultSeverity: 'Moderate',
        commonOnset: 'Acute',
        characterOptions: ['Rotational Room Spinning', 'Tilting Sensation', 'Feeling Pulled to One Side'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['Turning Head in Bed', 'Looking Upwards', 'Rapid Rolling Over'],
        associatedOptions: ['Nystagmus (Jerk of Eyes)', 'Nausea & Sweating', 'Tinnitus (Ear Ringing)'],
      },
      {
        name: 'Transient Visual Blurring',
        defaultSeverity: 'Moderate',
        commonOnset: 'Intermittent',
        characterOptions: ['Fluctuating Focus', 'Dark Floaters / Flashes', 'Tunnel Vision'],
        radiationOptions: ['Both Eyes', 'Left Eye', 'Right Eye'],
        triggerOptions: ['High Blood Sugar Peaks', 'High BP Spikes', 'Prolonged Reading'],
        associatedOptions: ['Eye Strain', 'Frontal Headache'],
      },
    ],
  },
  {
    id: 'musculoskeletal',
    title: 'MUSCULOSKELETAL & SPINE',
    subtitle: 'Joint aches, back pain, sciatica, morning stiffness',
    systemName: 'Orthopedics',
    commonSymptoms: [
      {
        name: 'Morning Joint Stiffness (>30 minutes)',
        defaultSeverity: 'Moderate',
        commonOnset: 'Gradual',
        characterOptions: ['Gelling in Knees / Hips', 'Swollen PIP/MCP Fingers', 'Limbering up with Movement'],
        radiationOptions: ['Weight-bearing Joints'],
        triggerOptions: ['Cold Rainy Weather', 'Waking Up After Sleep', 'Prolonged Immobility'],
        associatedOptions: ['Crepitus / Grating Joint', 'Reduced Joint Flexibility'],
      },
      {
        name: 'Lumbar Spine Pain with Radiculopathy (Sciatica)',
        defaultSeverity: 'Severe',
        commonOnset: 'Acute',
        characterOptions: ['Shooting Electric Shock Down Leg', 'Deep Dull Sacral Ache', 'Catching Sensation on Bending'],
        radiationOptions: ['Down Posterior Thigh to Heel', 'Gluteal Only', 'No Radiation'],
        triggerOptions: ['Forward Bending', 'Heavy Lifting', 'Prolonged Driving', 'Coughing / Sneezing'],
        associatedOptions: ['Foot Weakness / Dragging', 'Numbness on Lateral Calf'],
      },
      {
        name: 'Cervical Neck Stiffness & Spasm',
        defaultSeverity: 'Mild',
        commonOnset: 'Gradual',
        characterOptions: ['Tight Trapezius Knots', 'Restricted Head Rotation', 'Suboccipital Headache'],
        radiationOptions: ['Down Shoulder Blade', 'Into Arm'],
        triggerOptions: ['Laptop / Desk Work', 'High Pillow Ergonomics', 'Air Conditioner Draft'],
        associatedOptions: ['Shoulder Aching', 'Tension Headache'],
      },
    ],
  },
  {
    id: 'constitutional',
    title: 'CONSTITUTIONAL & GENERAL',
    subtitle: 'Fever, fatigue, polydipsia, weight fluctuations, chills',
    systemName: 'General Medicine',
    commonSymptoms: [
      {
        name: 'High-Grade Fever with Chills & Rigors',
        defaultSeverity: 'Severe',
        commonOnset: 'Acute',
        characterOptions: ['Core Body Temp >101.5°F', 'Teeth-Chattering Shivering', 'Profuse Sweating with Defervescence'],
        radiationOptions: ['Generalized Body'],
        triggerOptions: ['Late Afternoon Rise', 'Continuous Sustained'],
        associatedOptions: ['Severe Generalized Myalgia (Body Aches)', 'Retro-orbital Headache', 'Dry Mouth'],
      },
      {
        name: 'Excessive Thirst & Frequent Urination (Polydipsia/Polyuria)',
        defaultSeverity: 'Moderate',
        commonOnset: 'Gradual',
        characterOptions: ['Drinking >4 Liters Daily', 'Waking 3–4 Times at Night to Urinate', 'Constant Parched Sensation'],
        radiationOptions: ['No Radiation'],
        triggerOptions: ['High Carbohydrate Meals', 'Continuous'],
        associatedOptions: ['Sweet Taste / Acetone Breath', 'Unexplained Weight Loss'],
      },
      {
        name: 'Generalized Fatigue & Malaise',
        defaultSeverity: 'Moderate',
        commonOnset: 'Gradual',
        characterOptions: ['Profound Lack of Energy', 'Mental Brain Fog', 'Exhaustion Not Relieved by 8h Sleep'],
        radiationOptions: ['Whole Body'],
        triggerOptions: ['Physical Exertion', 'Constant All Day'],
        associatedOptions: ['Muscle Weakness', 'Loss of Motivation', 'Sleepiness'],
      },
      {
        name: 'Burning Micturition (Dysuria)',
        defaultSeverity: 'Severe',
        commonOnset: 'Acute',
        characterOptions: ['Scalding Burning During Urination', 'Frequent Urgency with Drops', 'Suprapubic Pelvic Cramping'],
        radiationOptions: ['Urethral / Pelvic'],
        triggerOptions: ['Every 20–30 Minutes', 'Concentrated Dark Urine'],
        associatedOptions: ['Low Fever', 'Hematuria (Pinkish Urine)', 'Flank Pain'],
      },
    ],
  },
];

export const SymptomsIntakeModal: React.FC<SymptomsIntakeModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSaveSymptoms,
}) => {
  if (!isOpen) return null;

  // Active Evaluated Symptoms State
  const [selectedSymptoms, setSelectedSymptoms] = useState<DetailedSymptom[]>(() => {
    if (patient.assessment?.detailedSymptoms && patient.assessment.detailedSymptoms.length > 0) {
      return patient.assessment.detailedSymptoms;
    }
    // Auto populate top 2 hallmark symptoms if chief complaint matches
    const suggestions = getSmartSymptomSuggestions(
      patient.specialty,
      patient.assessment?.chiefComplaint,
      patient.medicalRecords?.chronicConditions
    );
    return suggestions.slice(0, 2).map((s, idx) => ({
      id: `sym-${Date.now()}-${idx}`,
      name: s.name,
      severity: s.defaultSeverity,
      duration: patient.assessment?.symptomsDuration || '3 days',
      onset: s.commonOnset,
      isPrimary: idx === 0,
      notes: s.description,
      character: s.category === 'Cardiovascular' ? 'Crushing / Heavy Band' : 'Throbbing / Pulsatile',
      associatedSymptoms: ['Mild fatigue'],
    }));
  });

  const [suspectDisease, setSuspectDisease] = useState<string>(
    patient.assessment?.suspectDisease || COMMON_DISEASES[0]
  );
  const [generalNotes, setGeneralNotes] = useState<string>(patient.assessment?.maNotes || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSymptomId, setExpandedSymptomId] = useState<string | null>(null);
  const [isAsymptomaticDeclared, setIsAsymptomaticDeclared] = useState<boolean>(false);
  const [customSymptomInput, setCustomSymptomInput] = useState<string>('');

  // Immediate Pop-Up State for Symptom Intake Follow-up Questions & Free-Text Remarks
  const [popupSymptom, setPopupSymptom] = useState<{
    id: string;
    name: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    duration: string;
    onset: 'Acute' | 'Gradual' | 'Intermittent' | 'Constant';
    isPrimary?: boolean;
    notes?: string;
    character?: string;
    radiation?: string;
    triggers?: string[];
    relievingFactors?: string[];
    associatedSymptoms?: string[];
    isNew: boolean;
    categoryName?: string;
    characterOptions: string[];
    radiationOptions: string[];
    triggerOptions: string[];
    associatedOptions: string[];
  } | null>(null);

  // Auto expand first symptom on mount
  useState(() => {
    if (selectedSymptoms.length > 0) {
      setExpandedSymptomId(selectedSymptoms[0].id);
    }
  });

  // Check if a symptom name is selected
  const isSymptomSelected = (name: string) => {
    return selectedSymptoms.some((s) => s.name.toLowerCase() === name.toLowerCase());
  };

  // Open the immediate centered modal dialog with follow-up questions & direct remarks
  const handleOpenSymptomModal = (
    name: string,
    defaultSeverity: 'Mild' | 'Moderate' | 'Severe' = 'Moderate',
    commonOnset: 'Acute' | 'Gradual' | 'Intermittent' | 'Constant' = 'Acute',
    categoryName?: string
  ) => {
    const existing = selectedSymptoms.find((s) => s.name.toLowerCase() === name.toLowerCase());

    // Find options from CLINICAL_SYSTEM_GROUPS
    let characterOptions = ['Crushing / Heavy Band', 'Sharp / Stabbing', 'Throbbing / Pulsatile', 'Burning', 'Dull Ache'];
    let radiationOptions = ['To Left Arm & Forearm', 'To Mandible / Jaw', 'To Interscapular Back', 'No Radiation'];
    let triggerOptions = ['On Physical Exertion', 'Mental / Emotional Stress', 'Cold Exposure', 'Post-meal', 'At Rest'];
    let associatedOptions = ['Diaphoresis (Cold Sweats)', 'Nausea / Queasiness', 'Shortness of Breath', 'Presyncope / Dizziness'];

    for (const g of CLINICAL_SYSTEM_GROUPS) {
      const match = g.commonSymptoms.find((cs) => cs.name.toLowerCase() === name.toLowerCase());
      if (match) {
        characterOptions = match.characterOptions;
        radiationOptions = match.radiationOptions;
        triggerOptions = match.triggerOptions;
        associatedOptions = match.associatedOptions;
        if (!categoryName) categoryName = g.title;
        break;
      }
    }

    if (existing) {
      setPopupSymptom({
        ...existing,
        isNew: false,
        categoryName: categoryName || 'Clinical Symptom',
        characterOptions,
        radiationOptions,
        triggerOptions,
        associatedOptions,
      });
    } else {
      setPopupSymptom({
        id: `sym-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        severity: defaultSeverity,
        duration: '3 days',
        onset: commonOnset,
        isPrimary: selectedSymptoms.length === 0,
        character: characterOptions[0] || '',
        radiation: radiationOptions[0] || 'No Radiation',
        triggers: triggerOptions.slice(0, 1),
        relievingFactors: ['Rest'],
        associatedSymptoms: [],
        notes: '',
        isNew: true,
        categoryName: categoryName || 'Clinical Symptom',
        characterOptions,
        radiationOptions,
        triggerOptions,
        associatedOptions,
      });
    }
  };

  // Save changes from the immediate follow-up popup modal
  const handleSavePopupSymptom = () => {
    if (!popupSymptom) return;
    const { isNew, categoryName, characterOptions, radiationOptions, triggerOptions, associatedOptions, ...cleanSymptom } = popupSymptom;
    setSelectedSymptoms((prev) => {
      const exists = prev.some((s) => s.id === cleanSymptom.id || s.name.toLowerCase() === cleanSymptom.name.toLowerCase());
      if (exists) {
        return prev.map((s) => (s.id === cleanSymptom.id || s.name.toLowerCase() === cleanSymptom.name.toLowerCase() ? cleanSymptom : s));
      }
      return [...prev, cleanSymptom];
    });
    setIsAsymptomaticDeclared(false);
    setExpandedSymptomId(cleanSymptom.id);
    setPopupSymptom(null);
  };

  // Remove symptom from popup modal
  const handleRemovePopupSymptom = () => {
    if (!popupSymptom) return;
    handleRemoveSymptom(popupSymptom.id);
    setPopupSymptom(null);
  };

  // Toggle or Add a Symptom directly (fallback)
  const handleToggleSymptom = (
    name: string,
    defaultSeverity: 'Mild' | 'Moderate' | 'Severe' = 'Moderate',
    commonOnset: 'Acute' | 'Gradual' | 'Intermittent' | 'Constant' = 'Acute',
    extraData?: Partial<DetailedSymptom>
  ) => {
    handleOpenSymptomModal(name, defaultSeverity, commonOnset);
  };

  // Remove a symptom
  const handleRemoveSymptom = (id: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== id));
    if (expandedSymptomId === id) setExpandedSymptomId(null);
  };

  // Update specific field on symptom
  const handleUpdateSymptom = (id: string, updates: Partial<DetailedSymptom>) => {
    setSelectedSymptoms((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Add custom symptom from search bar
  const handleAddCustomSymptom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSymptomInput.trim()) return;
    handleOpenSymptomModal(customSymptomInput.trim(), 'Moderate', 'Acute', 'Custom Symptom');
    setCustomSymptomInput('');
  };

  // Handle Save
  const handleSave = (routeToDoctor = false) => {
    const finalSymptoms = isAsymptomaticDeclared ? [] : selectedSymptoms;
    onSaveSymptoms(finalSymptoms, suspectDisease, generalNotes, routeToDoctor);
    onClose();
  };

  // Filter groups or symptoms based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return CLINICAL_SYSTEM_GROUPS;
    const q = searchQuery.toLowerCase();
    return CLINICAL_SYSTEM_GROUPS.map((group) => ({
      ...group,
      commonSymptoms: group.commonSymptoms.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q) ||
          group.subtitle.toLowerCase().includes(q)
      ),
    })).filter((group) => group.commonSymptoms.length > 0);
  }, [searchQuery]);

  // Hallmark suggestions for this patient's disease
  const hallmarkSuggestions = useMemo(() => {
    return getSmartSymptomSuggestions(
      suspectDisease || patient.specialty,
      patient.assessment?.chiefComplaint,
      patient.medicalRecords?.chronicConditions
    );
  }, [suspectDisease, patient]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-2.5 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 w-full max-w-5xl h-[calc(100vh-20px)] sm:h-[calc(100vh-32px)] max-h-[880px] my-auto flex flex-col overflow-hidden ring-1 ring-slate-900/10 shrink-0">
        {/* ========================================================= */}
        {/* MODAL HEADER: PATIENT SUMMARY & ASYMPTOMATIC CHECKBOX     */}
        {/* ========================================================= */}
        <header className="px-5 py-3.5 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Patient Profile Photo Avatar */}
            <div className="relative shrink-0">
              {patient.avatarUrl ? (
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {patient.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[11px] text-blue-700 bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>{patient.appointmentTime || patient.form?.timeSlot || '10:30 AM'}</span>
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm truncate">
                  {patient.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  ({patient.age} Y • {patient.gender})
                </span>
                <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                  {patient.form?.bloodGroup || 'O+'}
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-md">
                  Dr. {patient.doctorName} ({patient.specialty})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Primary Complaint: <strong className="text-slate-800">{patient.assessment?.chiefComplaint || 'Clinical evaluation'}</strong> · MRN: {patient.patientNumber}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Asymptomatic Checkbox (Matches 'No known medical history' in user's reference) */}
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isAsymptomaticDeclared}
                onChange={(e) => {
                  setIsAsymptomaticDeclared(e.target.checked);
                  if (e.target.checked) {
                    setSelectedSymptoms([]);
                  }
                }}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <span>No acute symptoms declared</span>
            </label>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SEARCH & SMART DISEASE SUGGESTIONS BAR (SCREENSHOT STYLE) */}
        {/* ========================================================= */}
        <div className="px-5 py-3 bg-white border-b border-slate-200/80 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Search Input Bar */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clinical symptoms, systems, or type to add custom..."
                className="w-full pl-9 pr-24 py-2 text-xs font-medium text-slate-900 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                Details on select
              </span>
            </div>

            {/* Suspect Disease Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Disease Context:
              </span>
              <select
                value={suspectDisease}
                onChange={(e) => setSuspectDisease(e.target.value)}
                className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer shadow-2xs"
              >
                {COMMON_DISEASES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart AI Hallmark Suggestions Strip */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Smart Suggestions:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {hallmarkSuggestions.slice(0, 6).map((sym) => {
                const isSelected = isSymptomSelected(sym.name);
                return (
                  <button
                    key={sym.name}
                    type="button"
                    onClick={() => handleOpenSymptomModal(sym.name, sym.defaultSeverity, sym.commonOnset, 'Hallmark Suggestion')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : sym.isMostAffected
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-2xs ring-1 ring-amber-400/20'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{sym.name}</span>
                    {sym.isMostAffected && (
                      <span className="text-[9px] font-black px-1 py-0.1 rounded bg-amber-400 text-amber-950">
                        {sym.frequencyPercent ? `${sym.frequencyPercent}%` : 'Hallmark'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: 2-COLUMN SPLIT                                 */}
        {/* LEFT: 6 Clinical System Groups with Chips (Screenshot style) */}
        {/* RIGHT: Detailed Questions & Options for Selected Symptoms */}
        {/* ========================================================= */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50/50">
          {/* ======================================================= */}
          {/* LEFT COLUMN: 6 CLINICAL SYSTEM GROUPS (55% WIDTH)        */}
          {/* ======================================================= */}
          <div className="w-[52%] border-r border-slate-200 p-4 overflow-y-auto space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Select Patient Symptoms ({selectedSymptoms.length} Selected)
              </span>
              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSymptoms([])}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Render Each Clinical Category Card (Exact UX from Screenshot) */}
            {filteredGroups.map((group) => {
              // Count how many symptoms in this group are currently selected
              const groupSelectedCount = group.commonSymptoms.filter((s) => isSymptomSelected(s.name)).length;

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5 transition-all hover:border-slate-300"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                          {group.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            groupSelectedCount > 0
                              ? 'bg-teal-100 text-teal-800 border border-teal-200 font-extrabold'
                              : 'text-slate-400 bg-slate-100'
                          }`}
                        >
                          {groupSelectedCount > 0 ? `${groupSelectedCount} selected` : 'None selected'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{group.subtitle}</p>
                    </div>
                  </div>

                  {/* Symptom Selection Chips Strip (Identical to Screenshot) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {group.commonSymptoms.map((sym) => {
                      const selected = isSymptomSelected(sym.name);
                      return (
                        <button
                          key={sym.name}
                          type="button"
                          onClick={() =>
                            handleOpenSymptomModal(
                              sym.name,
                              sym.defaultSeverity,
                              sym.commonOnset,
                              group.title
                            )
                          }
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                            selected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-bold'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-3xs'
                          }`}
                        >
                          <span>{sym.name}</span>
                          {selected && <span className="text-white/80 hover:text-white font-bold ml-0.5">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Custom Symptom Add Row */}
            <div className="p-3 bg-white rounded-2xl border border-dashed border-slate-300 flex items-center gap-2">
              <input
                type="text"
                value={customSymptomInput}
                onChange={(e) => setCustomSymptomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
                placeholder="Type any other clinical symptom not listed above..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddCustomSymptom()}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: FURTHER CLINICAL QUESTIONS & OPTIONS (48%) */}
          {/* ======================================================= */}
          <div className="w-[48%] p-4 overflow-y-auto space-y-3.5 bg-slate-100/40">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Clinical Details & Further Questions ({selectedSymptoms.length})
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Tailored options & textboxes per symptom
              </span>
            </div>

            {selectedSymptoms.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2 shadow-2xs">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-xs">No Symptoms Selected Yet</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Select symptoms from the left panel or choose from the smart suggestions. Further questions and options will appear here automatically.
                </p>
              </div>
            ) : (
              selectedSymptoms.map((symptom, index) => {
                const isExpanded = expandedSymptomId === symptom.id;

                // Find symptom definition from CLINICAL_SYSTEM_GROUPS to get custom question options
                let characterOptions = ['Crushing / Heavy', 'Throbbing / Pulsatile', 'Sharp / Stabbing', 'Burning', 'Dull Ache'];
                let radiationOptions = ['To Left Arm & Neck', 'To Interscapular Back', 'No Radiation'];
                let triggerOptions = ['On Exertion', 'Cold Exposure', 'Post-meal', 'At Rest'];
                let associatedOptions = ['Nausea', 'Sweating / Diaphoresis', 'Dizziness', 'Palpitations'];

                for (const group of CLINICAL_SYSTEM_GROUPS) {
                  const match = group.commonSymptoms.find(
                    (cs) => cs.name.toLowerCase() === symptom.name.toLowerCase()
                  );
                  if (match) {
                    characterOptions = match.characterOptions;
                    radiationOptions = match.radiationOptions;
                    triggerOptions = match.triggerOptions;
                    associatedOptions = match.associatedOptions;
                    break;
                  }
                }

                return (
                  <div
                    key={symptom.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Header Strip for this Selected Symptom */}
                    <div
                      onClick={() => setExpandedSymptomId(isExpanded ? null : symptom.id)}
                      className={`px-4 py-3 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-teal-50/70 border-b border-teal-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-xs truncate">
                            {symptom.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded ${
                                symptom.severity === 'Severe'
                                  ? 'bg-rose-100 text-rose-800'
                                  : symptom.severity === 'Moderate'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {symptom.severity}
                            </span>
                            <span>·</span>
                            <span>{symptom.duration}</span>
                            <span>·</span>
                            <span className="capitalize">{symptom.onset}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSymptom(symptom.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove symptom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Detailed Questions & Options Body (Expanded) */}
                    {isExpanded && (
                      <div className="p-4 space-y-3.5 text-xs bg-white">
                        {/* 1. SEVERITY LEVEL QUESTION */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            1. Severity Level (Visual Analog Scale)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => {
                              const isSelected = symptom.severity === sev;
                              return (
                                <button
                                  key={sev}
                                  type="button"
                                  onClick={() => handleUpdateSymptom(symptom.id, { severity: sev })}
                                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                                    isSelected
                                      ? sev === 'Severe'
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                        : sev === 'Moderate'
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                        : 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {sev}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. ONSET & DURATION QUESTION */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              2. Onset Pattern
                            </label>
                            <select
                              value={symptom.onset}
                              onChange={(e) => handleUpdateSymptom(symptom.id, { onset: e.target.value as any })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-hidden"
                            >
                              <option value="Acute">Acute (Sudden &lt;24h)</option>
                              <option value="Gradual">Gradual (Slow progression)</option>
                              <option value="Intermittent">Intermittent / Episodic</option>
                              <option value="Constant">Constant / Non-stop</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Duration (Since when?)
                            </label>
                            <input
                              type="text"
                              value={symptom.duration}
                              onChange={(e) => handleUpdateSymptom(symptom.id, { duration: e.target.value })}
                              placeholder="e.g. 3 days, 2 weeks"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* 3. QUALITY / SENSATION QUESTION (Tailored options) */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            3. Character of Sensation (Select all that apply)
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {characterOptions.map((charOption) => {
                              const isSelected = symptom.character === charOption;
                              return (
                                <button
                                  key={charOption}
                                  type="button"
                                  onClick={() => handleUpdateSymptom(symptom.id, { character: charOption })}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {charOption}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 4. RADIATION / LOCATION (Tailored options) */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            4. Radiation / Anatomic Spread
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {radiationOptions.map((rad) => {
                              const isSelected = symptom.radiation === rad;
                              return (
                                <button
                                  key={rad}
                                  type="button"
                                  onClick={() => handleUpdateSymptom(symptom.id, { radiation: rad })}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {rad}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 5. AGGRAVATING TRIGGERS (Selectable chips) */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            5. Aggravating Triggers
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {triggerOptions.map((trig) => {
                              const currentTriggers = symptom.triggers || [];
                              const isChecked = currentTriggers.includes(trig);
                              return (
                                <button
                                  key={trig}
                                  type="button"
                                  onClick={() => {
                                    const next = isChecked
                                      ? currentTriggers.filter((t) => t !== trig)
                                      : [...currentTriggers, trig];
                                    handleUpdateSymptom(symptom.id, { triggers: next });
                                  }}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {isChecked ? '✓ ' : '+ '}
                                  {trig}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 6. ASSOCIATED SYMPTOMS (Selectable chips) */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            6. Associated Clinical Symptoms
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {associatedOptions.map((assoc) => {
                              const currentAssoc = symptom.associatedSymptoms || [];
                              const isChecked = currentAssoc.includes(assoc);
                              return (
                                <button
                                  key={assoc}
                                  type="button"
                                  onClick={() => {
                                    const next = isChecked
                                      ? currentAssoc.filter((a) => a !== assoc)
                                      : [...currentAssoc, assoc];
                                    handleUpdateSymptom(symptom.id, { associatedSymptoms: next });
                                  }}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-teal-100 text-teal-900 border-teal-300'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {isChecked ? '✓ ' : '+ '}
                                  {assoc}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 7. CLINICAL NOTES TEXTBOX */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            7. Specific Patient Remarks / Observations (Textbox)
                          </label>
                          <textarea
                            rows={2}
                            value={symptom.notes || ''}
                            onChange={(e) => handleUpdateSymptom(symptom.id, { notes: e.target.value })}
                            placeholder="Detailed description, relieving factors, exact words spoken by patient..."
                            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:outline-hidden focus:border-teal-500 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* General Overall MA Clinical Intake Remarks */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Overall MA Triage Remarks
              </span>
              <textarea
                rows={2}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Overall impression (e.g. Patient is ambulatory, alert, coherent; distress level mild-moderate)..."
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:outline-hidden focus:border-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER ACTIONS                                      */}
        {/* ========================================================= */}
        <footer className="px-5 py-3.5 bg-white/85 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800">
              Total Logged:
            </span>
            <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-teal-600 text-white shadow-2xs">
              {isAsymptomaticDeclared ? 0 : selectedSymptoms.length} Symptoms
            </span>
            {isAsymptomaticDeclared && (
              <span className="text-xs font-bold text-slate-500 italic">
                (Marked Asymptomatic)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Symptoms</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Save & Route to Doctor</span>
            </button>
          </div>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* IMMEDIATE SYMPTOM FOLLOW-UP QUESTIONS & REMARKS POPUP     */}
      {/* (User requirement: Prominent direct remarks + questions)  */}
      {/* ========================================================= */}
      {popupSymptom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/10">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    {popupSymptom.categoryName || 'Clinical Intake'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Follow-Up Questions</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1">
                  {popupSymptom.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPopupSymptom(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* OPTION 1: PROMINENT FREE-TEXT REMARKS */}
              <div className="bg-teal-50/70 border border-teal-200/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Option 1: Add Free-Text Remarks Directly
                  </label>
                  <span className="text-[10px] text-teal-700 font-bold">
                    Type freely instead of clicking buttons
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={popupSymptom.notes || ''}
                  onChange={(e) => setPopupSymptom({ ...popupSymptom, notes: e.target.value })}
                  placeholder="Type clinical notes or remarks here (e.g. Started 2 days ago after walking uphill; dull squeezing sensation; relieved after 5 mins rest; denies dizziness or breathlessness)..."
                  className="w-full bg-white border border-teal-300 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Adding remarks alone is sufficient to save this symptom.
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePopupSymptom}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done / Save Remarks</span>
                  </button>
                </div>
              </div>

              {/* OR DIVIDER */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Option 2: Select Follow-Up Questions Below
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* 1. SEVERITY */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1. Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => {
                    const isSelected = popupSymptom.severity === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setPopupSymptom({ ...popupSymptom, severity: sev })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? sev === 'Severe'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : sev === 'Moderate'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sev}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ONSET & DURATION */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    2. Onset Pattern
                  </label>
                  <select
                    value={popupSymptom.onset}
                    onChange={(e) => setPopupSymptom({ ...popupSymptom, onset: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-hidden text-xs"
                  >
                    <option value="Acute">Acute (&lt;24 hours)</option>
                    <option value="Gradual">Gradual (Slow progression)</option>
                    <option value="Intermittent">Intermittent / Episodic</option>
                    <option value="Constant">Constant / Non-stop</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Duration (Since when?)
                  </label>
                  <input
                    type="text"
                    value={popupSymptom.duration}
                    onChange={(e) => setPopupSymptom({ ...popupSymptom, duration: e.target.value })}
                    placeholder="e.g. 3 days, 2 weeks"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              {/* 3. CHARACTER OF SENSATION */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  3. Character of Sensation
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {popupSymptom.characterOptions.map((char) => {
                    const isSelected = popupSymptom.character === char;
                    return (
                      <button
                        key={char}
                        type="button"
                        onClick={() => setPopupSymptom({ ...popupSymptom, character: char })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. RADIATION */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  4. Radiation / Anatomic Spread
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {popupSymptom.radiationOptions.map((rad) => {
                    const isSelected = popupSymptom.radiation === rad;
                    return (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => setPopupSymptom({ ...popupSymptom, radiation: rad })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {rad}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. TRIGGERS / AGGRAVATING */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  5. Triggers & Aggravating Factors
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {popupSymptom.triggerOptions.map((trig) => {
                    const isSelected = (popupSymptom.triggers || []).includes(trig);
                    return (
                      <button
                        key={trig}
                        type="button"
                        onClick={() => {
                          const current = popupSymptom.triggers || [];
                          const next = isSelected ? current.filter((t) => t !== trig) : [...current, trig];
                          setPopupSymptom({ ...popupSymptom, triggers: next });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{isSelected ? '✓ ' : '+ '}</span>
                        <span>{trig}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. ASSOCIATED SYMPTOMS */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  6. Associated Accompanying Symptoms
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {popupSymptom.associatedOptions.map((assoc) => {
                    const isSelected = (popupSymptom.associatedSymptoms || []).includes(assoc);
                    return (
                      <button
                        key={assoc}
                        type="button"
                        onClick={() => {
                          const current = popupSymptom.associatedSymptoms || [];
                          const next = isSelected ? current.filter((a) => a !== assoc) : [...current, assoc];
                          setPopupSymptom({ ...popupSymptom, associatedSymptoms: next });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{isSelected ? '✓ ' : '+ '}</span>
                        <span>{assoc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                {!popupSymptom.isNew && (
                  <button
                    type="button"
                    onClick={handleRemovePopupSymptom}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Remove Symptom
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPopupSymptom(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePopupSymptom}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{popupSymptom.isNew ? 'Confirm & Add Symptom' : 'Save Symptom Details'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

