/**
 * Smart Symptom Suggestions & Disease Catalog for Clinic Medical Assistant (MA)
 */

export interface SymptomCatalogItem {
  name: string;
  category: string;
  defaultSeverity: 'Mild' | 'Moderate' | 'Severe';
  commonOnset: 'Acute' | 'Gradual' | 'Intermittent' | 'Constant';
  description: string;
  clinicalSignificance: 'Urgent' | 'High' | 'Routine';
  isMostAffected?: boolean; // Highlighted as top hallmark symptom patients are most affected by
  frequencyPercent?: number; // Prevalence percentage in patients with this condition
}

export const COMMON_DISEASES: string[] = [
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Coronary Artery Disease / Angina',
  'Bronchial Asthma / Acute Bronchitis',
  'Acid Peptic Disease / GERD',
  'Migraine / Tension Cephalea',
  'Osteoarthritis / Lumbar Spondylosis',
  'Hypothyroidism / Metabolic Syndrome',
  'Allergic Rhinitis / Atopic Dermatitis',
  'Urinary Tract Infection',
  'Generalized Viral Fever / Influenza',
];

export const DISEASE_SPECIFIC_SYMPTOMS: Record<string, SymptomCatalogItem[]> = {
  'Essential Hypertension': [
    {
      name: 'Occipital Morning Headache',
      category: 'Neurological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Throbbing pressure at base of skull upon waking, associated with elevated BP.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 88,
    },
    {
      name: 'Exertional Dizziness / Lightheadedness',
      category: 'Cardiovascular',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Postural instability or room-spinning on rapid positional change.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 82,
    },
    {
      name: 'Episodic Palpitations',
      category: 'Cardiovascular',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Pounding heartbeat sensation during mild physical or mental stress.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 74,
    },
    {
      name: 'Visual Blurring / Flashes',
      category: 'Neurological',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Transient scotoma or dimming of vision under high pressure peaks.',
      clinicalSignificance: 'Urgent',
      isMostAffected: false,
      frequencyPercent: 45,
    },
    {
      name: 'Epistaxis (Nosebleed)',
      category: 'ENT',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Spontaneous anterior nasal hemorrhage associated with hypertensive spike.',
      clinicalSignificance: 'Urgent',
      isMostAffected: false,
      frequencyPercent: 28,
    },
    {
      name: 'Tinnitus (Ringing in Ears)',
      category: 'ENT',
      defaultSeverity: 'Mild',
      commonOnset: 'Constant',
      description: 'Pulsatile whooshing or ringing synchronized with pulse.',
      clinicalSignificance: 'Routine',
      isMostAffected: false,
      frequencyPercent: 39,
    },
  ],

  'Type 2 Diabetes Mellitus': [
    {
      name: 'Polydipsia (Unquenchable Thirst)',
      category: 'Metabolic',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Excessive constant dry mouth requiring frequent water consumption.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 92,
    },
    {
      name: 'Polyuria (Frequent / Nocturnal Urination)',
      category: 'Metabolic',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Waking up 3–4 times per night with high volume urination.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 89,
    },
    {
      name: 'Peripheral Neuropathy (Foot Tingling & Numbness)',
      category: 'Neurological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Burning, pins-and-needles sensation on soles of feet at night.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 78,
    },
    {
      name: 'Chronic Fatigue & Lethargy',
      category: 'Constitutional',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Persistent energy depletion despite adequate sleep and meals.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 75,
    },
    {
      name: 'Delayed Wound Healing',
      category: 'Dermatological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Minor abrasions or cuts taking over 2–3 weeks to heal.',
      clinicalSignificance: 'High',
      isMostAffected: false,
      frequencyPercent: 55,
    },
    {
      name: 'Fluctuating Blurred Vision',
      category: 'Ophthalmic',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Temporary loss of focus due to glucose-induced crystalline lens swelling.',
      clinicalSignificance: 'High',
      isMostAffected: false,
      frequencyPercent: 60,
    },
  ],

  'Coronary Artery Disease / Angina': [
    {
      name: 'Retrosternal Chest Tightness / Squeezing',
      category: 'Cardiovascular',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Heaviness or crushing central band sensation across mid-sternum.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 95,
    },
    {
      name: 'Exertional Dyspnea (Shortness of Breath)',
      category: 'Cardiovascular',
      defaultSeverity: 'Severe',
      commonOnset: 'Gradual',
      description: 'Breathlessness on brisk walking or climbing one flight of stairs.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 86,
    },
    {
      name: 'Radiation to Left Arm / Mandible / Neck',
      category: 'Cardiovascular',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Aching numbness spreading down inner medial border of left arm.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 79,
    },
    {
      name: 'Diaphoresis (Cold Sweats)',
      category: 'Cardiovascular',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Sudden clammy perspiration coinciding with retrosternal ache.',
      clinicalSignificance: 'Urgent',
      isMostAffected: false,
      frequencyPercent: 68,
    },
    {
      name: 'Presyncope / Sudden Lightheadedness',
      category: 'Cardiovascular',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Feeling faint or unsteady during angina episodes.',
      clinicalSignificance: 'High',
      isMostAffected: false,
      frequencyPercent: 42,
    },
  ],

  'Bronchial Asthma / Acute Bronchitis': [
    {
      name: 'Expiratory Wheezing & Whistling',
      category: 'Respiratory',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'High-pitched whistling sound during exhalation and chest tightness.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 94,
    },
    {
      name: 'Spasmodic Nocturnal Cough',
      category: 'Respiratory',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Irritating dry cough paroxysms waking the patient at 3–4 AM.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 88,
    },
    {
      name: 'Chest Constriction & Air Hunger',
      category: 'Respiratory',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Sensation of inability to take a complete deep breath.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 84,
    },
    {
      name: 'Tenacious Mucoid Sputum',
      category: 'Respiratory',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Thick white or yellowish mucus cleared after prolonged coughing.',
      clinicalSignificance: 'Routine',
      isMostAffected: false,
      frequencyPercent: 62,
    },
    {
      name: 'Exercise-Induced Breathlessness',
      category: 'Respiratory',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Bronchospasm triggered 5–10 minutes after vigorous exertion.',
      clinicalSignificance: 'High',
      isMostAffected: false,
      frequencyPercent: 71,
    },
  ],

  'Acid Peptic Disease / GERD': [
    {
      name: 'Retrosternal Burning (Heartburn)',
      category: 'Gastrointestinal',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Substernal burning aggravated 30–60 minutes after spicy meals.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 91,
    },
    {
      name: 'Acid Regurgitation & Sour Eructation',
      category: 'Gastrointestinal',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Bitter acidic fluid refluxing up to throat when bending or lying flat.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 85,
    },
    {
      name: 'Epigastric Gnawing Pain',
      category: 'Gastrointestinal',
      defaultSeverity: 'Moderate',
      commonOnset: 'Intermittent',
      description: 'Upper abdominal discomfort relieved temporarily by milk or antacids.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 79,
    },
    {
      name: 'Postprandial Bloating & Early Satiety',
      category: 'Gastrointestinal',
      defaultSeverity: 'Mild',
      commonOnset: 'Constant',
      description: 'Fullness and distension after eating small to normal size meals.',
      clinicalSignificance: 'Routine',
      isMostAffected: false,
      frequencyPercent: 66,
    },
    {
      name: 'Globus Hystericus (Lump in Throat)',
      category: 'ENT',
      defaultSeverity: 'Mild',
      commonOnset: 'Intermittent',
      description: 'Persistent feeling of tightness or pill stuck in pharynx.',
      clinicalSignificance: 'Routine',
      isMostAffected: false,
      frequencyPercent: 44,
    },
  ],

  'Migraine / Tension Cephalea': [
    {
      name: 'Unilateral Pulsating Hemicrania',
      category: 'Neurological',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Throbbing temple pain, intensified by physical activity and head movement.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 93,
    },
    {
      name: 'Photophobia & Phonophobia',
      category: 'Neurological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Extreme aversion to bright fluorescent lights and normal room speech.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 87,
    },
    {
      name: 'Nausea & Episodic Vomiting',
      category: 'Neurological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Gastric stasis and queasiness accompanying cephalic pain peak.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 76,
    },
    {
      name: 'Visual Aura / Scintillating Scotoma',
      category: 'Neurological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Zigzag shimmering patterns in visual field 20 mins prior to attack.',
      clinicalSignificance: 'Routine',
      isMostAffected: false,
      frequencyPercent: 38,
    },
  ],

  'Osteoarthritis / Lumbar Spondylosis': [
    {
      name: 'Morning Joint Stiffness (>30 mins)',
      category: 'Musculoskeletal',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Severe gelling sensation in knees/hips requiring movement to limber up.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 89,
    },
    {
      name: 'Weight-Bearing Joint Ache on Stairs',
      category: 'Musculoskeletal',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Sharp pain climbing stairs, walking on uneven ground, or squatting.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 85,
    },
    {
      name: 'Crepitus & Grating Joint Sensation',
      category: 'Musculoskeletal',
      defaultSeverity: 'Mild',
      commonOnset: 'Constant',
      description: 'Palpable and audible crunching on active joint bending.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 78,
    },
    {
      name: 'Radicular Sciatica Pain Down Posterior Leg',
      category: 'Musculoskeletal',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Shooting lumbar nerve root pain reaching heel with coughing/straining.',
      clinicalSignificance: 'High',
      isMostAffected: false,
      frequencyPercent: 58,
    },
  ],

  'Hypothyroidism / Metabolic Syndrome': [
    {
      name: 'Cold Intolerance (Chills in Warm Room)',
      category: 'Endocrine',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Wearing extra layers when others are comfortable, frigid hands and feet.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 88,
    },
    {
      name: 'Unexplained Weight Gain & Fluid Puffiness',
      category: 'Endocrine',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Weight increase despite calorie-restricted diet with facial myxedema.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 84,
    },
    {
      name: 'Profound Daytime Somnolence & Brain Fog',
      category: 'Endocrine',
      defaultSeverity: 'Moderate',
      commonOnset: 'Gradual',
      description: 'Impaired cognitive clarity, slow processing, and daytime sleepiness.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 80,
    },
    {
      name: 'Chronic Constipation',
      category: 'Gastrointestinal',
      defaultSeverity: 'Mild',
      commonOnset: 'Constant',
      description: 'Reduced bowel frequency to once every 3–4 days with hard stools.',
      clinicalSignificance: 'Routine',
      isMostAffected: false,
      frequencyPercent: 62,
    },
  ],

  'Allergic Rhinitis / Atopic Dermatitis': [
    {
      name: 'Paroxysmal Sneezing & Clear Rhinorrhea',
      category: 'Immunological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Volleys of 8–10 sneezes upon waking or dust/pollen exposure.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 92,
    },
    {
      name: 'Intense Nasal & Palatal Pruritus (Itching)',
      category: 'Immunological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Compulsive scratching of nose, soft palate, and inner ear canals.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 86,
    },
    {
      name: 'Allergic Conjunctival Lacrimation & Redness',
      category: 'Ophthalmic',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Watery, itchy, and gritty sensation in both eyes.',
      clinicalSignificance: 'Routine',
      isMostAffected: true,
      frequencyPercent: 81,
    },
  ],

  'Urinary Tract Infection': [
    {
      name: 'Severe Burning Micturition (Dysuria)',
      category: 'Urological',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Intense scalding sensation during and immediately following urination.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 96,
    },
    {
      name: 'Urinary Urgency & Frequency',
      category: 'Urological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Sensation of needing to void every 20 minutes with minimal output.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 91,
    },
    {
      name: 'Suprapubic Pelvic Cramping',
      category: 'Urological',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Dull achy lower midline pelvic soreness exacerbated by bladder fullness.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 78,
    },
  ],

  'Generalized Viral Fever / Influenza': [
    {
      name: 'High-Grade Fever with Chills & Rigors',
      category: 'Infectious',
      defaultSeverity: 'Severe',
      commonOnset: 'Acute',
      description: 'Core body temperature 101.5°F–103°F with teeth-chattering shivering.',
      clinicalSignificance: 'Urgent',
      isMostAffected: true,
      frequencyPercent: 94,
    },
    {
      name: 'Severe Generalized Myalgia (Body Aches)',
      category: 'Constitutional',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Deep musculoskeletal aching throughout back, calves, and neck.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 90,
    },
    {
      name: 'Retro-orbital Eye Pain',
      category: 'Ophthalmic',
      defaultSeverity: 'Moderate',
      commonOnset: 'Acute',
      description: 'Ache behind eyeballs worsened by lateral gaze movements.',
      clinicalSignificance: 'High',
      isMostAffected: true,
      frequencyPercent: 72,
    },
  ],
};

/**
 * Smart algorithm that suggests symptoms for a patient based on:
 * 1. Primary suspected disease
 * 2. Specialty
 * 3. Chief complaint keywords
 * 4. Known chronic conditions
 */
export function getSmartSymptomSuggestions(
  specialtyOrDisease: string,
  chiefComplaint?: string,
  chronicConditions?: string[]
): SymptomCatalogItem[] {
  const normInput = specialtyOrDisease.toLowerCase();
  const complaint = (chiefComplaint || '').toLowerCase();
  const chronic = (chronicConditions || []).map((c) => c.toLowerCase()).join(' ');

  // 1. Check exact match in DISEASE_SPECIFIC_SYMPTOMS
  for (const [diseaseKey, symptoms] of Object.entries(DISEASE_SPECIFIC_SYMPTOMS)) {
    if (diseaseKey.toLowerCase() === normInput) {
      return symptoms;
    }
  }

  // 2. Check keyword matching against disease key or chronic conditions
  if (
    normInput.includes('hypertens') ||
    complaint.includes('bp') ||
    complaint.includes('pressure') ||
    chronic.includes('hypertens')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Essential Hypertension'];
  }

  if (
    normInput.includes('diabet') ||
    complaint.includes('sugar') ||
    complaint.includes('glucose') ||
    complaint.includes('thirst') ||
    chronic.includes('diabet')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Type 2 Diabetes Mellitus'];
  }

  if (
    normInput.includes('cardio') ||
    normInput.includes('angina') ||
    complaint.includes('chest') ||
    complaint.includes('heart') ||
    chronic.includes('coronary')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Coronary Artery Disease / Angina'];
  }

  if (
    normInput.includes('asthma') ||
    normInput.includes('pulmon') ||
    complaint.includes('cough') ||
    complaint.includes('breath') ||
    complaint.includes('wheez')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Bronchial Asthma / Acute Bronchitis'];
  }

  if (
    normInput.includes('gerd') ||
    normInput.includes('gastro') ||
    normInput.includes('peptic') ||
    complaint.includes('acid') ||
    complaint.includes('stomach') ||
    complaint.includes('burn')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Acid Peptic Disease / GERD'];
  }

  if (
    normInput.includes('migraine') ||
    normInput.includes('neuro') ||
    complaint.includes('headache') ||
    complaint.includes('head')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Migraine / Tension Cephalea'];
  }

  if (
    normInput.includes('ortho') ||
    normInput.includes('osteo') ||
    complaint.includes('knee') ||
    complaint.includes('joint') ||
    complaint.includes('back')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Osteoarthritis / Lumbar Spondylosis'];
  }

  if (
    normInput.includes('thyroid') ||
    normInput.includes('hypo') ||
    complaint.includes('thyroid') ||
    complaint.includes('weight')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Hypothyroidism / Metabolic Syndrome'];
  }

  if (
    normInput.includes('uti') ||
    normInput.includes('urine') ||
    complaint.includes('burning') ||
    complaint.includes('urination')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Urinary Tract Infection'];
  }

  if (
    normInput.includes('fever') ||
    complaint.includes('fever') ||
    complaint.includes('chills')
  ) {
    return DISEASE_SPECIFIC_SYMPTOMS['Generalized Viral Fever / Influenza'];
  }

  // Default fallback: Essential Hypertension + Type 2 Diabetes
  return DISEASE_SPECIFIC_SYMPTOMS['Essential Hypertension'];
}
