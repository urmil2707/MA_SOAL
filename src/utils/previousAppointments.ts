import { Patient, PreviousAppointmentRecord, BodyCompositionData, VitalsData, MedicalRecordEntry, AssessmentData, InvestigationItem, BillingDetails } from '../types';

/**
 * Returns historical appointment records for a patient.
 * If the patient already has previousAppointments array, it uses that;
 * otherwise, it synthesizes rich, realistic historical visits matching their profile.
 */
export function getPatientPreviousAppointments(patient: Patient): PreviousAppointmentRecord[] {
  if (patient.previousAppointments && patient.previousAppointments.length > 0) {
    return patient.previousAppointments;
  }

  const baseWeight = patient.bodyComposition?.weightKg || 70;
  const baseHeight = patient.bodyComposition?.heightCm || 170;
  const baseBpSystolic = patient.vitals?.bpSystolic || 120;
  const baseBpDiastolic = patient.vitals?.bpDiastolic || 80;

  // Visit 1: ~3 weeks ago (18 Aug 2026)
  const visit1: PreviousAppointmentRecord = {
    id: `prev-${patient.id}-1`,
    date: '18 Aug 2026',
    time: '11:15 AM',
    doctorName: patient.doctorName,
    doctorSpecialty: patient.specialty,
    visitType: 'Follow-up',
    status: 'Completed',
    chiefComplaint: `Follow-up evaluation for ${patient.assessment?.chiefComplaint || 'routine review'}`,
    diagnosis: patient.medicalRecords?.chronicConditions[0] || 'Mild Essential Hypertension',
    clinicalSummary: 'Patient reported moderate improvement after medication titration. No acute orthostatic symptoms.',
    doctorNotes: 'BP showing stabilization. Advised low sodium diet and 30-minute brisk walk daily. Review in 3 weeks.',
    bodyComposition: {
      heightCm: baseHeight,
      weightKg: +(baseWeight + 1.2).toFixed(1),
      bmi: +((baseWeight + 1.2) / ((baseHeight / 100) * (baseHeight / 100))).toFixed(1),
      bodyFatPercentage: 23.1,
      muscleMassKg: 57.5,
      previousWeightKg: +(baseWeight + 2.0).toFixed(1),
      recordedAt: '18 Aug 2026, 11:05 AM',
      recordedBy: 'Priya Shah (Receptionist)',
    },
    vitals: {
      bpSystolic: baseBpSystolic + 8,
      bpDiastolic: baseBpDiastolic + 4,
      pulse: 82,
      temperature: 98.6,
      spo2: 98,
      respiratoryRate: 18,
      recordedAt: '18 Aug 2026, 11:10 AM',
      recordedBy: 'Ananya Sharma (MA)',
    },
    medicalRecords: {
      allergies: patient.medicalRecords?.allergies || ['Penicillin'],
      chronicConditions: patient.medicalRecords?.chronicConditions || ['Mild Hypertension'],
      pastSurgeries: patient.medicalRecords?.pastSurgeries || [],
      currentMedications: patient.medicalRecords?.currentMedications || ['Telmisartan 20mg OD'],
      familyHistory: patient.medicalRecords?.familyHistory || ['Father: Coronary Artery Disease'],
      notes: 'Adhering to prescribed evening doses.',
      completed: true,
    },
    assessment: {
      subjectiveCompleted: true,
      objectiveCompleted: true,
      chiefComplaint: 'Mild palpitations and evening fatigue',
      symptomsDuration: '10 days',
      symptomSeverity: 'Mild',
      maNotes: 'Patient calm, ambulatory. No chest pain radiating to left shoulder. Denies dizziness.',
      objectiveFindings: 'S1 S2 heard normal. Chest clear bilaterally. No pedal edema.',
      assessedBy: 'Ananya Sharma (MA)',
      completedAt: '18 Aug 2026, 11:18 AM',
    },
    investigations: [
      {
        id: `inv-${patient.id}-p1`,
        name: 'Electrocardiogram (12-Lead ECG)',
        department: 'Cardiology' as any,
        orderedBy: patient.doctorName,
        orderedAt: '18 Aug 2026, 11:30 AM',
        status: 'Result Available',
        assignedStaff: 'Rohan Verma (Cardio Tech)',
        sampleCollectedAt: '18 Aug 2026, 11:35 AM',
        processingAt: '18 Aug 2026, 11:40 AM',
        completedAt: '18 Aug 2026, 11:45 AM',
        resultAvailableAt: '18 Aug 2026, 11:48 AM',
        reportSummary: 'Normal sinus rhythm, HR 80 bpm. No ST-T segment deviation. PR interval normal.',
        charge: 450,
        uploadedReportName: 'ECG_12Lead_Analysis_18Aug.pdf',
        uploadedAt: '18 Aug 2026, 11:50 AM',
        findings: [
          {
            parameter: 'Heart Rate',
            value: '80',
            unit: 'bpm',
            normalRange: '60 - 100',
            status: 'Normal',
          },
          {
            parameter: 'PR Interval',
            value: '160',
            unit: 'ms',
            normalRange: '120 - 200',
            status: 'Normal',
          },
          {
            parameter: 'QRS Duration',
            value: '88',
            unit: 'ms',
            normalRange: '80 - 120',
            status: 'Normal',
          },
        ],
      },
    ],
    billing: {
      consultationFee: 800,
      investigationCharges: 450,
      therapyCharges: 0,
      otherCharges: 0,
      discount: 50,
      tax: 0,
      totalAmount: 1200,
      amountPaid: 1200,
      amountDue: 0,
      paymentMethod: 'UPI',
      paidAt: '18 Aug 2026, 12:15 PM',
      receiptNumber: 'RCP-2026-0818-44',
      status: 'Paid',
    },
  };

  // Visit 2: ~6 weeks ago (24 Jul 2026)
  const visit2: PreviousAppointmentRecord = {
    id: `prev-${patient.id}-2`,
    date: '24 Jul 2026',
    time: '02:30 PM',
    doctorName: patient.doctorName,
    doctorSpecialty: patient.specialty,
    visitType: 'New Patient',
    status: 'Completed',
    chiefComplaint: 'First presentation with elevated BP and intermittent headaches',
    diagnosis: 'Unspecified Essential Primary Hypertension',
    clinicalSummary: 'Initial clinical baseline workup. Blood pressure elevated at triage. Started on first-line ACE/ARB.',
    doctorNotes: 'Initial workup complete. Ordered lipid profile and renal function panel. Advised home BP log.',
    bodyComposition: {
      heightCm: baseHeight,
      weightKg: +(baseWeight + 2.0).toFixed(1),
      bmi: +((baseWeight + 2.0) / ((baseHeight / 100) * (baseHeight / 100))).toFixed(1),
      bodyFatPercentage: 23.8,
      muscleMassKg: 57.0,
      previousWeightKg: +(baseWeight + 2.5).toFixed(1),
      recordedAt: '24 Jul 2026, 02:20 PM',
      recordedBy: 'Priya Shah (Receptionist)',
    },
    vitals: {
      bpSystolic: baseBpSystolic + 14,
      bpDiastolic: baseBpDiastolic + 8,
      pulse: 88,
      temperature: 98.7,
      spo2: 99,
      respiratoryRate: 17,
      recordedAt: '24 Jul 2026, 02:25 PM',
      recordedBy: 'Ananya Sharma (MA)',
    },
    medicalRecords: {
      allergies: patient.medicalRecords?.allergies || ['Penicillin'],
      chronicConditions: ['Newly diagnosed hypertension'],
      pastSurgeries: patient.medicalRecords?.pastSurgeries || [],
      currentMedications: [],
      familyHistory: patient.medicalRecords?.familyHistory || ['Father: CAD'],
      notes: 'No prior regular hypertensive treatment taken.',
      completed: true,
    },
    assessment: {
      subjectiveCompleted: true,
      objectiveCompleted: true,
      chiefComplaint: 'Bilateral occipital throbbing headache especially morning',
      symptomsDuration: '2 weeks',
      symptomSeverity: 'Moderate',
      maNotes: 'Patient anxious regarding high readings at pharmacy check. No blurry vision.',
      objectiveFindings: 'Fundoscopy normal. No focal neurological deficit. Peripheral pulses equal and palpable.',
      assessedBy: 'Ananya Sharma (MA)',
      completedAt: '24 Jul 2026, 02:35 PM',
    },
    investigations: [
      {
        id: `inv-${patient.id}-p2a`,
        name: 'Comprehensive Metabolic & Lipid Panel',
        department: 'Laboratory',
        orderedBy: patient.doctorName,
        orderedAt: '24 Jul 2026, 02:45 PM',
        status: 'Result Available',
        assignedStaff: 'Kavita Patel (Lab Tech)',
        sampleCollectedAt: '24 Jul 2026, 02:50 PM',
        completedAt: '24 Jul 2026, 03:20 PM',
        resultAvailableAt: '24 Jul 2026, 03:25 PM',
        reportSummary: 'Total cholesterol marginally elevated. Serum Creatinine and eGFR within safe limits.',
        charge: 900,
        uploadedReportName: 'Lipid_Metabolic_Report_24Jul.pdf',
        uploadedAt: '24 Jul 2026, 03:30 PM',
        findings: [
          {
            parameter: 'Total Cholesterol',
            value: '218',
            unit: 'mg/dL',
            normalRange: '< 200',
            status: 'High',
          },
          {
            parameter: 'HDL (Good Cholesterol)',
            value: '44',
            unit: 'mg/dL',
            normalRange: '> 40',
            status: 'Normal',
          },
          {
            parameter: 'LDL (Bad Cholesterol)',
            value: '142',
            unit: 'mg/dL',
            normalRange: '< 100',
            status: 'High',
          },
          {
            parameter: 'Serum Creatinine',
            value: '0.95',
            unit: 'mg/dL',
            normalRange: '0.7 - 1.3',
            status: 'Normal',
          },
        ],
      },
    ],
    billing: {
      consultationFee: 800,
      investigationCharges: 900,
      therapyCharges: 0,
      otherCharges: 50,
      discount: 0,
      tax: 0,
      totalAmount: 1750,
      amountPaid: 1750,
      amountDue: 0,
      paymentMethod: 'Card',
      paidAt: '24 Jul 2026, 03:45 PM',
      receiptNumber: 'RCP-2026-0724-19',
      status: 'Paid',
    },
  };

  // Visit 3: ~3 months ago (12 May 2026)
  const visit3: PreviousAppointmentRecord = {
    id: `prev-${patient.id}-3`,
    date: '12 May 2026',
    time: '10:00 AM',
    doctorName: 'Dr. Suresh Mehta',
    doctorSpecialty: 'Internal Medicine',
    visitType: 'New Patient',
    status: 'Completed',
    chiefComplaint: 'Annual preventive health check-up & seasonal allergic rhinitis',
    diagnosis: 'Seasonal Allergic Rhinitis / General Wellness Examination',
    clinicalSummary: 'General physical examination normal. Advised seasonal antihistamines as needed.',
    doctorNotes: 'Prescribed Cetirizine 10mg PRN. Maintain healthy hydration and balanced sleep cycle.',
    bodyComposition: {
      heightCm: baseHeight,
      weightKg: +(baseWeight + 3.0).toFixed(1),
      bmi: +((baseWeight + 3.0) / ((baseHeight / 100) * (baseHeight / 100))).toFixed(1),
      bodyFatPercentage: 24.2,
      muscleMassKg: 56.8,
      previousWeightKg: +(baseWeight + 3.0).toFixed(1),
      recordedAt: '12 May 2026, 09:50 AM',
      recordedBy: 'Priya Shah (Receptionist)',
    },
    vitals: {
      bpSystolic: 124,
      bpDiastolic: 80,
      pulse: 76,
      temperature: 98.4,
      spo2: 99,
      respiratoryRate: 16,
      recordedAt: '12 May 2026, 09:55 AM',
      recordedBy: 'Ananya Sharma (MA)',
    },
    medicalRecords: {
      allergies: patient.medicalRecords?.allergies || ['Penicillin'],
      chronicConditions: [],
      pastSurgeries: patient.medicalRecords?.pastSurgeries || [],
      currentMedications: ['Cetirizine 10mg PRN'],
      familyHistory: patient.medicalRecords?.familyHistory || [],
      notes: 'Seasonal dust allergy in summer.',
      completed: true,
    },
    assessment: {
      subjectiveCompleted: true,
      objectiveCompleted: true,
      chiefComplaint: 'Nasal congestion, sneezing episodes on dusting',
      symptomsDuration: '5 days',
      symptomSeverity: 'Mild',
      maNotes: 'Clear nasal discharge, no throat redness, lungs resonant and clear.',
      objectiveFindings: 'Nasal mucosa boggy, pale. Oropharynx clear.',
      assessedBy: 'Ananya Sharma (MA)',
      completedAt: '12 May 2026, 10:05 AM',
    },
    investigations: [],
    billing: {
      consultationFee: 700,
      investigationCharges: 0,
      therapyCharges: 0,
      otherCharges: 0,
      discount: 0,
      tax: 0,
      totalAmount: 700,
      amountPaid: 700,
      amountDue: 0,
      paymentMethod: 'Cash',
      paidAt: '12 May 2026, 10:40 AM',
      receiptNumber: 'RCP-2026-0512-08',
      status: 'Paid',
    },
  };

  return [visit1, visit2, visit3];
}

export interface PatientJourneyStep {
  id: string;
  name: string;
  shortName: string;
  category: 'Front Desk' | 'Check-in' | 'Assessment' | 'Doctor' | 'Diagnostics' | 'Hold On' | 'Billing' | 'Complete';
  status: 'Completed' | 'Active' | 'Pending';
  minutes: number;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  staff?: string;
  details?: string;
  isLongest?: boolean;
}

export interface ConnectedCheckInModule {
  id: string;
  name: string;
  shortName: string;
  stepNumber: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  timeRange: string;
  staff: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  description: string;
  clinicalOutput: string;
  keyMetrics?: string;
  connectionSummary: string;
}

export interface InvestigationTimelineStage {
  stage: 'ordered' | 'sample_collected' | 'processing' | 'result_delivered';
  title: string;
  shortTitle: string;
  timestamp: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  operator: string;
  details: string;
  badge?: string;
}

export interface DetailedInvestigationJourney {
  id: string;
  name: string;
  department: string;
  charge: number;
  overallStatus: string;
  stages: InvestigationTimelineStage[];
  specimenType?: string;
  sampleBarcode?: string;
  verifiedBy?: string;
  clinicalImpression?: string;
  reportName?: string;
}

export function parseTimeString(timeStr?: string): number {
  if (!timeStr) return 10 * 60 + 15; // default 10:15 AM
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 10 * 60 + 15;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatMinutesToClock(totalMins: number): string {
  let mins = Math.floor(totalMins) % (24 * 60);
  if (mins < 0) mins += 24 * 60;
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${formattedMinutes} ${period}`;
}

/**
 * Generates the connected 4-module check-in pipeline with detailed timing and relational dependencies.
 */
export function getConnectedCheckInModules(
  patient: Patient,
  checkInStartTime = '10:19 AM'
): ConnectedCheckInModule[] {
  const startMins = parseTimeString(checkInStartTime);
  const mods = patient?.checkInModules || {
    form: true,
    bodyComposition: false,
    medicalRecords: false,
    vitals: false,
  };

  // Module 1: Form
  const m1Start = startMins;
  const m1End = m1Start + 3;
  const m1Status: 'Completed' | 'In Progress' | 'Pending' = mods.form
    ? 'Completed'
    : patient?.status === 'CHECK-IN'
    ? 'In Progress'
    : 'Pending';

  // Module 2: Body Composition
  const m2Start = m1End;
  const m2End = m2Start + 3;
  const m2Status: 'Completed' | 'In Progress' | 'Pending' = mods.bodyComposition
    ? 'Completed'
    : mods.form && patient?.status === 'CHECK-IN'
    ? 'In Progress'
    : 'Pending';

  // Module 3: Medical Records
  const m3Start = m2End;
  const m3End = m3Start + 3;
  const m3Status: 'Completed' | 'In Progress' | 'Pending' = mods.medicalRecords
    ? 'Completed'
    : mods.bodyComposition && patient?.status === 'CHECK-IN'
    ? 'In Progress'
    : 'Pending';

  // Module 4: Vitals
  const m4Start = m3End;
  const m4End = m4Start + 3;
  const m4Status: 'Completed' | 'In Progress' | 'Pending' = mods.vitals
    ? 'Completed'
    : mods.medicalRecords && patient?.status === 'CHECK-IN'
    ? 'In Progress'
    : 'Pending';

  const bodyCompMetrics = patient?.bodyComposition?.heightCm
    ? `${patient.bodyComposition.heightCm} cm · ${patient.bodyComposition.weightKg} kg · BMI ${patient.bodyComposition.bmi}`
    : 'Height & Weight recorded';

  const allergiesList = Array.isArray(patient?.medicalRecords?.allergies)
    ? patient.medicalRecords.allergies
    : [];
  const allergyCount = allergiesList.filter((a) => a && a !== 'None').length;
  const allergySummary = allergyCount > 0
    ? `${allergyCount} Allergy Alert (${allergiesList.join(', ')})`
    : 'No Known Drug Allergies (NKDA)';

  const vitalsMetrics = patient?.vitals?.bpSystolic
    ? `BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg · Pulse: ${patient.vitals.pulse} bpm · SpO2: ${patient.vitals.spo2}%`
    : 'BP, Pulse, SpO2 captured';

  return [
    {
      id: 'mod-form',
      name: 'Patient Form Registration',
      shortName: '1. Form Registration',
      stepNumber: 1,
      durationMinutes: 3,
      startTime: formatMinutesToClock(m1Start),
      endTime: formatMinutesToClock(m1End),
      timeRange: `${formatMinutesToClock(m1Start)} - ${formatMinutesToClock(m1End)}`,
      staff: 'Priya Shah (Receptionist)',
      status: m1Status,
      description: 'Patient identity verification, contact, address & emergency contact profile.',
      clinicalOutput: 'Creates verified clinical encounter & digital health ID.',
      keyMetrics: `Mobile: ${patient?.mobile || 'N/A'} · Age: ${patient?.age || 'N/A'}y · ${patient?.gender || ''}`,
      connectionSummary: 'Feeds validated legal demographic record to Anthropometry & Medical History.',
    },
    {
      id: 'mod-bodycomp',
      name: 'Body Composition Analysis',
      shortName: '2. Body Composition',
      stepNumber: 2,
      durationMinutes: 3,
      startTime: formatMinutesToClock(m2Start),
      endTime: formatMinutesToClock(m2End),
      timeRange: `${formatMinutesToClock(m2Start)} - ${formatMinutesToClock(m2End)}`,
      staff: 'Priya Shah (Receptionist)',
      status: m2Status,
      description: 'Electronic bio-impedance height, weight, BMI, and body fat measurement.',
      clinicalOutput: 'Calculates Body Mass Index (BMI) & baseline nutritional classification.',
      keyMetrics: bodyCompMetrics,
      connectionSummary: 'Calculates physical baseline feeding drug dosage calculation & lifestyle assessment.',
    },
    {
      id: 'mod-records',
      name: 'Medical Records & Allergy Safeguards',
      shortName: '3. Medical Records',
      stepNumber: 3,
      durationMinutes: 3,
      startTime: formatMinutesToClock(m3Start),
      endTime: formatMinutesToClock(m3End),
      timeRange: `${formatMinutesToClock(m3Start)} - ${formatMinutesToClock(m3End)}`,
      staff: 'Priya Shah (Receptionist)',
      status: m3Status,
      description: 'Historical health profile, drug contraindications, chronic illnesses, and past surgeries.',
      clinicalOutput: 'Establishes active contraindication warnings in the physician console.',
      keyMetrics: allergySummary,
      connectionSummary: 'Synchronizes clinical risk flags directly into the physician prescribing safeguard system.',
    },
    {
      id: 'mod-vitals',
      name: 'Baseline Vital Signs Telemetry',
      shortName: '4. Baseline Vitals',
      stepNumber: 4,
      durationMinutes: 3,
      startTime: formatMinutesToClock(m4Start),
      endTime: formatMinutesToClock(m4End),
      timeRange: `${formatMinutesToClock(m4Start)} - ${formatMinutesToClock(m4End)}`,
      staff: 'Nurse Aarti (Triage Station)',
      status: m4Status,
      description: 'Blood pressure, resting heart rate, pulse oximetry, and body temperature.',
      clinicalOutput: 'Real-time hemodynamic triage parameters.',
      keyMetrics: vitalsMetrics,
      connectionSummary: 'Streams instantaneous vital telemetry to Medical Assistant Triage & Doctor Queue.',
    },
  ];
}

/**
 * Builds the granular, step-by-step diagnostic lifecycle for each investigation/report:
 * Ordered ➔ Sample Collected ➔ Processing in Lab ➔ Certified Delivery
 */
export function getInvestigationDetailedJourney(
  patient: Patient,
  investigations: InvestigationItem[] = [],
  investStartTime = '11:16 AM'
): DetailedInvestigationJourney[] {
  const baseMinutes = parseTimeString(investStartTime);
  const doctorName = patient?.doctorName || 'Attending Physician';
  const safeList = Array.isArray(investigations) && investigations.length > 0 ? investigations : [];

  return safeList.slice(0, 4).map((inv, idx) => {
    const orderOffset = idx * 2;
    const sampleOffset = orderOffset + 6;
    const processOffset = sampleOffset + 5;
    const deliveryOffset = processOffset + 6;

    const tOrdered = formatMinutesToClock(baseMinutes + orderOffset);
    const tSample = inv.sampleCollectedAt || formatMinutesToClock(baseMinutes + sampleOffset);
    const tProcess = inv.processingAt || formatMinutesToClock(baseMinutes + processOffset);
    const tDelivery = inv.resultAvailableAt || inv.completedAt || formatMinutesToClock(baseMinutes + deliveryOffset);

    const isPatientInInvest = patient?.status === 'INVESTIGATION';
    const isPatientInHold = patient?.status === 'HOLD ON';
    const isPatientDone = patient?.status === 'BILLING' || patient?.status === 'DONE';

    let stage1Status: 'Completed' | 'In Progress' | 'Pending' = 'Completed';
    let stage2Status: 'Completed' | 'In Progress' | 'Pending' = 'Completed';
    let stage3Status: 'Completed' | 'In Progress' | 'Pending' = 'Completed';
    let stage4Status: 'Completed' | 'In Progress' | 'Pending' = 'Completed';

    if (isPatientInInvest) {
      stage1Status = 'Completed';
      stage2Status = inv.sampleCollectedAt ? 'Completed' : 'In Progress';
      stage3Status = inv.processingAt ? 'In Progress' : 'Pending';
      stage4Status = 'Pending';
    } else if (isPatientInHold) {
      stage1Status = 'Completed';
      stage2Status = 'Completed';
      stage3Status = 'Completed';
      stage4Status = inv.status === 'Result Available' || inv.status === 'Completed' ? 'Completed' : 'In Progress';
    } else if (!isPatientDone && patient?.status !== 'IN CONSULTATION') {
      stage1Status = 'Completed';
      stage2Status = 'Completed';
      stage3Status = 'Completed';
      stage4Status = 'Completed';
    }

    const stages: InvestigationTimelineStage[] = [
      {
        stage: 'ordered',
        title: 'Diagnostic Requisition Ordered',
        shortTitle: '1. Test Ordered',
        timestamp: tOrdered,
        status: stage1Status,
        operator: inv.orderedBy || doctorName,
        details: `Digital requisition generated for ${inv.department || 'Diagnostics'} department.`,
        badge: `Order #${(inv.id || 'INV').slice(-5).toUpperCase()}`,
      },
      {
        stage: 'sample_collected',
        title: 'Specimen / Procedure Acquisition',
        shortTitle: '2. Sample Collected',
        timestamp: tSample,
        status: stage2Status,
        operator: inv.assignedStaff || 'Ramesh Solanki (Lab Technologist)',
        details: inv.specimenType
          ? `Collected ${inv.specimenType} with Barcode: ${inv.sampleBarcode || 'BAR-88219'}`
          : 'Patient positioned and procedure specimen collected cleanly.',
        badge: inv.sampleBarcode || 'Barcode Tagged',
      },
      {
        stage: 'processing',
        title: 'Laboratory / Imaging Processing',
        shortTitle: '3. Machine Processing',
        timestamp: tProcess,
        status: stage3Status,
        operator: inv.technique ? 'Automated Diagnostic Analyzer' : 'Diagnostic Lab Station',
        details: inv.technique
          ? `${inv.technique}. Multi-channel automated detection.`
          : 'Centrifugation, reagent reaction and automated analyzer assay underway.',
        badge: 'In Processing',
      },
      {
        stage: 'result_delivered',
        title: 'Result Certified & Digital Delivery',
        shortTitle: '4. Result Delivered',
        timestamp: tDelivery,
        status: stage4Status,
        operator: inv.verifiedBy || 'Dr. Suresh Ramanathan, MD (Pathology)',
        details: inv.clinicalImpression
          ? `Certified: "${inv.clinicalImpression}". Delivered to Doctor Screen & Central Reception.`
          : 'Medical findings certified by consultant and synced to electronic chart.',
        badge: 'Delivered to Doctor & Reception',
      },
    ];

    return {
      id: inv.id || `inv-${idx}`,
      name: inv.name || 'Diagnostic Investigation',
      department: inv.department || 'Laboratory',
      charge: inv.charge || 0,
      overallStatus: inv.status || 'Completed',
      stages,
      specimenType: inv.specimenType,
      sampleBarcode: inv.sampleBarcode,
      verifiedBy: inv.verifiedBy,
      clinicalImpression: inv.clinicalImpression,
      reportName: inv.uploadedReportName,
    };
  });
}

/**
 * Calculates the exact patient workflow journey for today's visit,
 * tracking elapsed time per step and identifying the peak time bottleneck step.
 */
export function getPatientJourneySteps(patient: Patient): {
  steps: PatientJourneyStep[];
  longestStep: PatientJourneyStep | null;
  totalTurnaroundMinutes: number;
} {
  const status = patient.status;
  const waitMinutes = patient.waitingTimeMinutes || 15;

  // Derived step durations based on the active clinical stage
  let regMins = 4;
  let checkinMins = 0;
  let assessMins = 0;
  let docQueueMins = 0;
  let docConsultMins = 0;
  let investMins = 0;
  let holdMins = 0;
  let billingMins = 0;

  let checkinStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';
  let assessStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';
  let docQueueStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';
  let docConsultStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';
  let investStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';
  let holdStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';
  let billingStatus: 'Completed' | 'Active' | 'Pending' = 'Pending';

  switch (status) {
    case 'CHECK-IN':
      checkinStatus = 'Active';
      checkinMins = Math.max(8, waitMinutes);
      break;

    case 'ASSESSMENT':
      checkinStatus = 'Completed';
      checkinMins = 12;
      assessStatus = 'Active';
      assessMins = Math.max(6, waitMinutes);
      break;

    case 'IN QUEUE':
      checkinStatus = 'Completed';
      checkinMins = 11;
      assessStatus = 'Completed';
      assessMins = 9;
      docQueueStatus = 'Active';
      docQueueMins = Math.max(14, waitMinutes);
      break;

    case 'IN CONSULTATION':
      checkinStatus = 'Completed';
      checkinMins = 10;
      assessStatus = 'Completed';
      assessMins = 8;
      docQueueStatus = 'Completed';
      docQueueMins = 22; // Queue wait was high!
      docConsultStatus = 'Active';
      docConsultMins = Math.max(5, waitMinutes);
      break;

    case 'INVESTIGATION':
      checkinStatus = 'Completed';
      checkinMins = 10;
      assessStatus = 'Completed';
      assessMins = 8;
      docQueueStatus = 'Completed';
      docQueueMins = 18;
      docConsultStatus = 'Completed';
      docConsultMins = 15;
      investStatus = 'Active';
      investMins = Math.max(12, waitMinutes);
      break;

    case 'HOLD ON':
      checkinStatus = 'Completed';
      checkinMins = 9;
      assessStatus = 'Completed';
      assessMins = 7;
      docQueueStatus = 'Completed';
      docQueueMins = 16;
      docConsultStatus = 'Completed';
      docConsultMins = 14;
      investStatus = 'Completed';
      investMins = 18;
      holdStatus = 'Active';
      holdMins = Math.max(20, waitMinutes); // Longest waiting for lab reports!
      break;

    case 'BILLING':
      checkinStatus = 'Completed';
      checkinMins = 10;
      assessStatus = 'Completed';
      assessMins = 8;
      docQueueStatus = 'Completed';
      docQueueMins = 19;
      docConsultStatus = 'Completed';
      docConsultMins = 16;
      investStatus = 'Completed';
      investMins = 15;
      billingStatus = 'Active';
      billingMins = Math.max(5, waitMinutes);
      break;

    case 'DONE':
      checkinStatus = 'Completed';
      checkinMins = 10;
      assessStatus = 'Completed';
      assessMins = 8;
      docQueueStatus = 'Completed';
      docQueueMins = 24; // Peak queue time
      docConsultStatus = 'Completed';
      docConsultMins = 18;
      investStatus = 'Completed';
      investMins = 16;
      billingStatus = 'Completed';
      billingMins = 6;
      break;
  }

  const steps: PatientJourneyStep[] = [
    {
      id: 'step-reg',
      name: 'Front Desk Registration',
      shortName: 'Registration',
      category: 'Front Desk',
      status: 'Completed',
      minutes: regMins,
      staff: 'Priya Shah (Receptionist)',
      details: 'Patient arrived, verified mobile & demographic profile.',
    },
    {
      id: 'step-checkin',
      name: 'Check-in Modules (Form, Vitals, Body Comp, Records)',
      shortName: 'Check-in',
      category: 'Check-in',
      status: checkinStatus,
      minutes: checkinMins,
      staff: 'Priya Shah (Receptionist)',
      details: `${Object.values(patient?.checkInModules || {}).filter(Boolean).length} of 4 modules completed.`,
    },
    {
      id: 'step-assess',
      name: 'Medical Assistant Clinical Assessment',
      shortName: 'Assessment',
      category: 'Assessment',
      status: assessStatus,
      minutes: assessMins,
      staff: 'Ananya Sharma (MA)',
      details: 'Subjective questionnaire & triage severity evaluation.',
    },
    {
      id: 'step-queue',
      name: 'Doctor Waiting Queue',
      shortName: 'Doctor Queue',
      category: 'Doctor',
      status: docQueueStatus,
      minutes: docQueueMins,
      staff: `Queue for ${patient?.doctorName || 'Assigned Doctor'}`,
      details: 'Waiting outside consultation room for physician call.',
    },
    {
      id: 'step-consult',
      name: `Doctor Consultation (${patient?.doctorName || 'Assigned Doctor'})`,
      shortName: 'Consultation',
      category: 'Doctor',
      status: docConsultStatus,
      minutes: docConsultMins,
      staff: patient?.doctorName || 'Assigned Doctor',
      details: `Active examination & review in ${patient?.specialty || 'OPD'}.`,
    },
    {
      id: 'step-invest',
      name: 'Investigation & Diagnostics (Lab/X-Ray/Therapy)',
      shortName: 'Diagnostics',
      category: 'Diagnostics',
      status: investStatus,
      minutes: investMins,
      staff: 'Lab & Diagnostic Technicians',
      details: `${Array.isArray(patient?.investigations) ? patient.investigations.length : 0} diagnostic orders processed.`,
    },
    ...(status === 'HOLD ON' || holdMins > 0
      ? [
          {
            id: 'step-hold',
            name: 'Hold On (Awaiting Laboratory / Radiology Reports)',
            shortName: 'Hold On (Reports)',
            category: 'Hold On' as const,
            status: holdStatus,
            minutes: holdMins,
            staff: 'Front Desk & Lab Liaison',
            details: 'Patient seated in holding area awaiting diagnostic results.',
          },
        ]
      : []),
    {
      id: 'step-billing',
      name: 'Billing, Invoice Clearance & Checkout',
      shortName: 'Billing & Checkout',
      category: 'Billing',
      status: billingStatus,
      minutes: billingMins,
      staff: 'Financial Desk',
      details: `Total: ₹${(patient?.billing?.totalAmount || 0).toLocaleString()} • Status: ${patient?.billing?.status || 'Pending'}`,
    },
  ];

  // Calculate progressive step timestamps starting from arrival
  const arrivalMinutes = parseTimeString(patient.arrivedAt || patient.appointmentTime || '10:15 AM');
  let currentMinutes = arrivalMinutes;

  const stepsWithTiming: PatientJourneyStep[] = steps.map((step) => {
    const stepDuration = Math.max(step.minutes, 1);
    const startMins = currentMinutes;
    const endMins = currentMinutes + stepDuration;
    
    // Only advance elapsed time for completed steps or active step
    if (step.status === 'Completed' || step.status === 'Active') {
      currentMinutes = endMins;
    } else {
      currentMinutes = endMins; // estimate future step start
    }

    const startStr = formatMinutesToClock(startMins);
    const endStr = formatMinutesToClock(endMins);

    let timeRange = `${startStr} - ${endStr}`;
    let endDisplay = endStr;
    if (step.status === 'Active') {
      timeRange = `${startStr} - Live (${step.minutes}m in stage)`;
      endDisplay = 'Active Now';
    } else if (step.status === 'Pending') {
      timeRange = `Est. ${startStr} - ${endStr}`;
      endDisplay = `Est. ${endStr}`;
    }

    return {
      ...step,
      startTime: startStr,
      endTime: endDisplay,
      timeRange,
    };
  });

  // Calculate total turnaround time
  const totalTurnaroundMinutes = stepsWithTiming.reduce((sum, s) => sum + s.minutes, 0);

  // Find longest step among active or completed steps
  const activeOrCompleted = stepsWithTiming.filter((s) => s.status !== 'Pending' && s.minutes > 0);
  let longestStep: PatientJourneyStep | null = null;
  if (activeOrCompleted.length > 0) {
    longestStep = activeOrCompleted.reduce((max, step) => (step.minutes > max.minutes ? step : max), activeOrCompleted[0]);
    // Mark it
    longestStep.isLongest = true;
  }

  return { steps: stepsWithTiming, longestStep, totalTurnaroundMinutes };
}
