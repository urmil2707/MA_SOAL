/**
 * Soltech Clinic Reception Dashboard Types
 */

export type PatientStatus =
  | 'CHECK-IN'
  | 'ASSESSMENT'
  | 'IN QUEUE'
  | 'IN CONSULTATION'
  | 'INVESTIGATION'
  | 'HOLD ON'
  | 'BILLING'
  | 'DONE';

export type ArrivalStatus =
  | 'ARRIVED'
  | 'NOT_ARRIVED'
  | 'WALK_IN'
  | 'ONLINE_APPOINTMENT'
  | 'NEW_PATIENT'
  | 'FOLLOW_UP'
  | 'CANCELLED'
  | 'NO_SHOW';

export type Gender = 'Male' | 'Female' | 'Other';

export interface VitalsData {
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  temperature: number; // in Fahrenheit
  spo2: number; // percentage
  respiratoryRate: number;
  recordedAt: string;
  recordedBy: string;
}

export type Vitals = VitalsData;

export interface BodyCompositionData {
  heightCm: number;
  weightKg: number;
  bmi: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  previousWeightKg?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  mobile: string;
}

export type RecordCategory =
  | 'RADIOLOGY'
  | 'SONOGRAPHY'
  | 'BLOOD REPORTS'
  | 'PRESCRIPTION'
  | 'SUGGESTIONS';

export interface PatientUploadedRecord {
  id: string;
  title: string;
  category: RecordCategory;
  scanDate: string;
  scanTime?: string;
  sourceOrClinic?: string;
  doctorOrOrderedBy?: string;
  fileType: 'pdf' | 'dicom' | 'image' | 'prescription';
  fileSize?: string;
  fileUrl?: string;
  isCritical: boolean;
  criticalSummary?: string;
  importantHighlights: string[];
  notes?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface PatientFormRegistration {
  fullName: string;
  age: number;
  gender: Gender;
  mobile: string;
  patientType?: 'Self' | 'Guardian';
  guardianName?: string;
  guardianRelation?: string;
  guardianMobile?: string;
  email?: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactMobile: string;
  emergencyContacts?: EmergencyContact[];
  referredBy?: string;
  doctorAssignedId?: string;
  doctorName?: string;
  timeSlot?: string;
  visitType?: 'New Patient' | 'Follow-up';
  reasonOfVisit?: string;
  bloodGroup?: string;
  occupation?: string;
  maritalStatus?: string;
  idProofNumber?: string;
  completed: boolean;
}

export interface DetailedSymptom {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  duration: string; // e.g., '3 days', '2 weeks'
  onset: 'Acute' | 'Gradual' | 'Intermittent' | 'Constant';
  isPrimary?: boolean;
  notes?: string;
  suspectCondition?: string;
  character?: string; // e.g., 'Crushing / Heavy', 'Throbbing', 'Sharp / Stabbing', 'Burning'
  radiation?: string; // e.g., 'To Left Arm & Neck', 'Bilateral', 'None'
  triggers?: string[]; // e.g., ['On Exertion', 'Cold Weather', 'Spicy Food']
  relievingFactors?: string[]; // e.g., ['Rest', 'Antacids', 'Deep Breathing']
  associatedSymptoms?: string[]; // e.g., ['Nausea', 'Diaphoresis', 'Dizziness']
  timeOfDay?: string; // e.g., 'Early Morning', 'Post-meal', 'Nocturnal / 3 AM'
  visualAnalogScore?: number; // 1-10
}

export interface FamilyHistoryEntry {
  id: string;
  relation: string; // e.g. "Father", "Mother", "Sibling", "Grandparent"
  condition: string; // e.g. "Coronary Artery Disease", "Type 2 Diabetes", "Hypertension"
  ageOfOnset?: string;
  status?: 'Living' | 'Deceased';
  notes?: string;
}

export interface PastMedicalCondition {
  id: string;
  condition: string;
  diagnosedYear?: string;
  status: 'Controlled' | 'Uncontrolled' | 'In Remission' | 'Resolved';
  treatment?: string;
}

export interface SurgicalHistoryEntry {
  id: string;
  procedure: string;
  year?: string;
  hospital?: string;
  complications?: string;
}

export interface AllergyEntry {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
}

export interface PatientMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency?: string;
  instructions?: string;
}

export interface DetailedPersonalHabit {
  id: string;
  name: string;
  frequency?: string;
  details?: string;
}

export interface ActiveCondition {
  id: string;
  name: string;
  isChronic: boolean; // Auto-sorted: Chronic vs Non-Chronic
  diagnosedYear?: string;
  status: 'Under Control' | 'Uncontrolled' | 'In Remission' | 'Resolved' | 'Newly Diagnosed';
  severity?: 'Mild' | 'Moderate' | 'Severe';
  managementPlan?: string;
  doctorNotes?: string;
}

export interface AllergySensitivity {
  id: string;
  allergen: string;
  category: 'Food Allergy' | 'Drug Allergy' | 'Environment Allergy' | 'Other'; // Auto-sorted
  natureOfReaction: string; // e.g. Anaphylaxis, Skin rash / Urticaria, Facial swelling, Wheezing, Nausea
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  frequency?: string; // e.g. 'On Every Exposure', 'Occasional', 'Past episode only'
  firstNoticedDate?: string;
}

export interface CategorizedMedication {
  id: string;
  name: string;
  medicineType: 'Painkiller' | 'Antacid' | 'Antibiotic' | 'Antihypertensive' | 'Antidiabetic' | 'Cardiovascular' | 'Respiratory' | 'Supplement / Vitamin' | 'Other'; // Auto-sorted
  dosage: string; // e.g. '500 mg', '40 mg'
  frequency: string; // e.g. 'Once daily (OD)', 'Twice daily (BD)', 'Thrice daily (TDS)', 'As needed (SOS)'
  route?: string; // 'Oral', 'Inhaler', 'Sublingual', 'Topical', 'Injectable'
  prescriber?: string;
  takingSince?: string;
}

export interface SurgicalHospitalization {
  id: string;
  procedureOrReason: string;
  category: 'Major Surgery' | 'Minor Surgery' | 'Past Hospital Admission'; // Auto-sorted
  year?: string;
  hospitalOrFacility?: string;
  dischargeSummaryNotes?: string;
  complications?: string;
}

export interface FamilyGeneticRecord {
  id: string;
  condition: string;
  relation: string; // e.g. 'Father', 'Mother', 'Sibling', 'Maternal Grandparent', 'Paternal Grandparent'
  ageOfOnset?: string;
  notes?: string;
}

export interface ImmunizationRecord {
  id: string;
  vaccineName: string;
  doseNumber?: string;
  dateAdministered?: string;
  status: 'Completed' | 'Due' | 'Booster Needed' | 'Exempt';
  administeringClinic?: string;
}

export interface LifestyleMentalHealth {
  smoking: string;
  alcohol: string;
  dietProfile: string;
  physicalActivity: string;
  sleepHoursPerNight?: string;
  stressLevel?: 'Low' | 'Moderate' | 'High' | 'Severe';
  moodScreeningNotes?: string;
}

export interface MedicalHistoryRemark {
  id: string;
  timestamp: string;
  author: string;
  role: 'MA' | 'Receptionist' | 'Doctor';
  text: string;
}

export interface DoctorViewFlaggedItem {
  id: string;
  title: string;
  category: string;
  date: string;
  status: string;
  severity: 'High' | 'Abnormal' | 'Review' | 'Critical' | 'Normal';
  details?: string;
  doctorNote?: string;
  orderRank: number;
}

export interface MedicalRecordEntry {
  allergies: string[];
  chronicConditions: string[];
  pastSurgeries: string[];
  currentMedications: string[];
  familyHistory: string[];
  notes?: string;
  completed: boolean;
  // 7 Standardized Medical History Domains
  activeConditionsList?: ActiveCondition[];
  allergiesSensitivitiesList?: AllergySensitivity[];
  categorizedMedicationsList?: CategorizedMedication[];
  surgicalHospitalizationList?: SurgicalHospitalization[];
  familyGeneticList?: FamilyGeneticRecord[];
  immunizationList?: ImmunizationRecord[];
  lifestyleMentalHealth?: LifestyleMentalHealth;
  medicalHistoryRemarks?: MedicalHistoryRemark[];
  // Legacy backward-compatibility
  detailedFamilyHistory?: FamilyHistoryEntry[];
  pastMedicalConditions?: PastMedicalCondition[];
  detailedSurgeries?: SurgicalHistoryEntry[];
  detailedAllergies?: AllergyEntry[];
  detailedMedications?: PatientMedication[];
  personalHistoryEntries?: DetailedPersonalHabit[];
  noKnownMedicalHistoryDeclared?: boolean;
  lifestyleHabits?: {
    smoking: string;
    alcohol: string;
    diet: string;
    physicalActivity: string;
  };
}

export interface AssessmentData {
  subjectiveCompleted: boolean;
  objectiveCompleted: boolean;
  chiefComplaint: string;
  symptomsDuration: string;
  symptomSeverity: 'Mild' | 'Moderate' | 'Severe';
  maNotes: string;
  objectiveFindings?: string;
  assessedBy?: string;
  completedAt?: string;
  // Enhanced detailed symptoms list for MA intake
  detailedSymptoms?: DetailedSymptom[];
  suspectDisease?: string;
}

export interface LabReportAlert {
  reportId: string;
  investigationId?: string;
  reportName: string;
  department: 'Laboratory' | 'Pathology' | 'Radiology' | 'Physiotherapy';
  uploadedAt: string;
  uploadedTimeDisplay: string;
  summary?: string;
  findings?: {
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    status: 'Normal' | 'High' | 'Low' | 'Critical';
  }[];
  verifiedBy?: string;
  downloadUrl?: string;
  isUnread: boolean;
}

export interface InvestigationItem {
  id: string;
  name: string;
  department: 'Laboratory' | 'Pathology' | 'Radiology' | 'Physiotherapy';
  orderedBy: string;
  orderedAt: string;
  status:
    | 'Order Created'
    | 'Patient Sent'
    | 'Sample / Procedure Started'
    | 'Processing'
    | 'Completed'
    | 'Result Available';
  assignedStaff?: string;
  sampleCollectedAt?: string;
  processingAt?: string;
  completedAt?: string;
  resultAvailableAt?: string;
  reportSummary?: string;
  reportUrl?: string;
  charge: number;
  uploadedReportName?: string;
  uploadedAt?: string;
  findings?: {
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    status: 'Normal' | 'High' | 'Low' | 'Critical';
  }[];
  specimenType?: string;
  sampleBarcode?: string;
  verifiedBy?: string;
  technique?: string;
  clinicalImpression?: string;
  reportSize?: string;
  criticalAlert?: boolean;
}

export interface BillingDetails {
  consultationFee: number;
  investigationCharges: number;
  therapyCharges: number;
  otherCharges: number;
  discount: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentMethod?: 'Cash' | 'UPI' | 'Card' | 'Online' | 'Insurance';
  paymentReference?: string;
  paidAt?: string;
  receiptNumber?: string;
  status: 'Pending' | 'Paid' | 'Partially Paid';
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  timeDisplay: string;
  action: string;
  performedBy: string;
  role: 'Receptionist' | 'MA' | 'Doctor' | 'Lab Technician' | 'Radiology Technician' | 'Physiotherapist' | 'Billing Staff';
  category: 'Registration' | 'Check-in' | 'Assessment' | 'Doctor' | 'Investigation' | 'Hold On' | 'Billing' | 'System';
  details?: string;
  subActivities?: {
    name: string;
    completedAt: string;
    by: string;
    status: 'Completed' | 'Pending';
  }[];
}

export interface PreviousAppointmentRecord {
  id: string;
  date: string; // e.g., '18 Aug 2026'
  time: string; // e.g., '10:30 AM'
  doctorName: string;
  doctorSpecialty: string;
  visitType: 'New Patient' | 'Follow-up';
  status: 'Completed' | 'Follow-up' | 'Cancelled';
  chiefComplaint: string;
  diagnosis: string;
  clinicalSummary: string;
  doctorNotes?: string;
  waitingTimeMinutes?: number;
  // Replicated historical data snapshots
  bodyComposition?: BodyCompositionData;
  vitals?: VitalsData;
  medicalRecords?: MedicalRecordEntry;
  assessment?: AssessmentData;
  investigations?: InvestigationItem[];
  billing?: BillingDetails;
}

export interface Patient {
  id: string;
  patientNumber: string; // e.g., STP-000123
  name: string;
  age: number;
  gender: Gender;
  mobile: string;
  avatarUrl?: string;
  appointmentTime: string;
  appointmentType: 'Online Appointment' | 'Walk-in' | 'Scheduled';
  visitType: 'New Patient' | 'Follow-up';
  doctorAssignedId: string;
  doctorName: string;
  specialty: string;
  roomNumber?: string;
  tokenNumber?: number;
  patientIdNumber?: string;
  
  // Single active state
  status: PatientStatus;
  arrivalStatus: ArrivalStatus;
  arrivedAt?: string;
  waitingTimeMinutes: number;
  
  // Check-in status (Form, Vitals, Records)
  checkInModules: {
    form: boolean;
    vitals: boolean;
    records?: boolean;
    bodyComposition?: boolean;
    medicalRecords?: boolean;
  };
  
  // Modular Data
  form: PatientFormRegistration;
  bodyComposition: BodyCompositionData;
  medicalRecords: MedicalRecordEntry;
  vitals: VitalsData;
  uploadedRecords?: PatientUploadedRecord[];
  assessment: AssessmentData;
  investigations: InvestigationItem[];
  billing: BillingDetails;
  activityTimeline: ActivityLogEntry[];
  
  consultationStartTime?: string;
  holdReason?: string;
  isPriority?: boolean;

  // Real-time Lab Report Visual Notification State
  hasNewReportAlert?: boolean;
  labReportAlerts?: LabReportAlert[];

  // Previous Appointments History
  previousAppointments?: PreviousAppointmentRecord[];

  // Private Receptionist Clinical Notes & Reminders
  receptionistNotes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  roomNumber: string;
  avatar: string;
  status: 'Available' | 'In Consultation' | 'On Break';
  currentlyConsultingPatientId?: string;
}

export interface SectionLayoutConfig {
  id: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  width: 'normal' | 'wide' | 'full';
  order: number;
  badgeCountKey?: string;
  description?: string;
}

export interface DoctorTimeSlot {
  id: string;
  time: string;
  endTime: string;
  period: 'morning' | 'afternoon';
  status: 'available' | 'booked';
  doctorId: string;
  date: string;
  appointment?: {
    id: string;
    patientId?: string;
    patientName: string;
    patientAge: number;
    patientGender: Gender;
    patientMobile: string;
    visitType: 'New Patient' | 'Follow-up';
    appointmentType: 'Walk-in' | 'Online Appointment' | 'Scheduled';
    reason: string;
    status: 'Scheduled' | 'Checked In' | 'In Consultation' | 'Completed' | 'Cancelled';
    tokenNumber?: string;
  };
}

// ============================================================================
// SOALTECH AI CLINICAL CASE PRESENTATION & MEDICAL INSIGHTS TYPES
// ============================================================================

export type MedicalInsightCategory =
  | 'Significant clinical findings'
  | 'Longitudinal trends'
  | 'Clinical associations'
  | 'Medication and allergy considerations'
  | 'Information gaps'
  | 'Possible differential considerations'
  | 'Follow-up and continuity';

export type InsightPriority = 'high' | 'medium' | 'low';

export interface ClinicalSourceReference {
  id: string;
  title: string;
  sourceType: 'record' | 'investigation' | 'vitals' | 'symptom' | 'history' | 'consultation';
  date: string;
  targetTab: 'overview' | 'records' | 'vitals' | 'symptoms' | 'medical-history' | 'trends' | 'doctor-view';
  targetId?: string;
  verified: boolean;
}

export interface MedicalInsight {
  id: string;
  short_title: string;
  clinical_observation: string;
  supporting_evidence: string;
  source_references: string[];
  clinical_relevance: string;
  category: MedicalInsightCategory;
  priority: InsightPriority;
  verification_status: 'unverified' | 'verified';
  safetyAlert?: boolean;
}

export interface ClinicalCasePresentation {
  patient_introduction: string;
  chief_complaints: string[];
  clinical_case_summary: string;
  history_of_present_illness: string;
  relevant_medical_history: string;
  medications_and_allergies: string;
  relevant_objective_findings: string;
  investigation_summary: string;
  longitudinal_changes: string;
  clinical_synthesis: string;
  medical_insights: MedicalInsight[];
  information_gaps: string[];
  follow_up_context: string;
  source_references: ClinicalSourceReference[];
  verification_status: 'unverified' | 'clinician_reviewed' | 'clinician_approved';
  generated_at: string;
  data_as_of: string;
  specialty_emphasis: string;
  safety_alerts: string[];
}

