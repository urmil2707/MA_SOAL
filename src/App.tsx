/**
 * Soltech Reception Dashboard: Enterprise Clinic Flow & Operational Control Center
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_SECTIONS,
} from './mockData';
import { Doctor, Patient, SectionLayoutConfig, Gender } from './types';
import { Header } from './components/Header';
import { LayoutCustomizerModal } from './components/LayoutCustomizerModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { CheckInModal } from './components/CheckInModal';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { DoctorCalendarModal } from './components/DoctorCalendarModal';
import { CustomCalendarBooking } from './utils/calendarSlots';
import { PaymentModal } from './components/PaymentModal';
import { ItemizedInvoiceModal } from './components/ItemizedInvoiceModal';
import { LabReportModal } from './components/LabReportModal';
import { playLabReportChime } from './utils/audioAlert';

// Dedicated Sections
import { DailyPerformanceSection } from './components/sections/DailyPerformanceSection';
import { TodaysPatientsSection } from './components/sections/TodaysPatientsSection';
import { CheckInSection } from './components/sections/CheckInSection';
import { AssessmentSection } from './components/sections/AssessmentSection';
import { DoctorsSection } from './components/sections/DoctorsSection';
import { InvestigationSection } from './components/sections/InvestigationSection';
import { HoldOnSection } from './components/sections/HoldOnSection';
import { BillingSection } from './components/sections/BillingSection';
import { MAHomeScreen } from './components/MAHomeScreen';

import {
  SlidersHorizontal,
  Bell,
  BellRing,
  CheckCircle2,
  Volume2,
  Users,
  Activity,
  Stethoscope,
  FlaskConical,
  Clock,
  CreditCard,
  CheckCheck,
} from 'lucide-react';

export default function App() {
  // Workspace: 'reception' (Front Desk Reception Control) or 'ma' (Medical Assistant Home)
  const [activeWorkspace, setActiveWorkspace] = useState<'ma' | 'reception'>(() => {
    const saved = localStorage.getItem('soltech_active_workspace');
    return saved === 'ma' || saved === 'reception' ? saved : 'reception';
  });

  useEffect(() => {
    localStorage.setItem('soltech_active_workspace', activeWorkspace);
  }, [activeWorkspace]);

  // State: Patients, Doctors, Sections
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('soltech_patients_v4');
    if (!saved) return INITIAL_PATIENTS;
    try {
      const parsed: Patient[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.id));
      const newFromInit = INITIAL_PATIENTS.filter((ip) => !existingIds.has(ip.id));
      const merged = parsed.map((p) => {
        const initP = INITIAL_PATIENTS.find((ip) => ip.id === p.id);
        if (!initP) return p;
        return {
          ...p,
          tokenNumber: p.tokenNumber || initP.tokenNumber,
          roomNumber: p.roomNumber || initP.roomNumber,
          hasNewReportAlert: p.hasNewReportAlert !== undefined ? p.hasNewReportAlert : initP.hasNewReportAlert,
          labReportAlerts: p.labReportAlerts || initP.labReportAlerts,
          uploadedRecords: Array.from(
            new Map(
              [...(initP.uploadedRecords || []), ...(p.uploadedRecords || [])].map((item) => [item.id, item])
            ).values()
          ),
          checkInModules: { ...initP.checkInModules, ...p.checkInModules },
          form: { ...initP.form, ...p.form },
        };
      });
      return [...merged, ...newFromInit];
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);

  const [sections, setSections] = useState<SectionLayoutConfig[]>(() => {
    const saved = localStorage.getItem('soltech_sections_layout');
    if (!saved) return INITIAL_SECTIONS;
    try {
      const parsed: SectionLayoutConfig[] = JSON.parse(saved);
      const missing = INITIAL_SECTIONS.filter((is) => !parsed.some((ps) => ps.id === is.id));
      if (missing.length > 0) {
        return [...missing, ...parsed].map((s, idx) => ({ ...s, order: idx }));
      }
      return parsed;
    } catch {
      return INITIAL_SECTIONS;
    }
  });

  const [layoutMode, setLayoutMode] = useState<'kanban' | 'grid'>('kanban');

  // Filters & Search
  const [selectedBranch, setSelectedBranch] = useState('Satyam Clinic, Paldi (Main)');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today · 04 Sep 2026');

  // Modals
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [selectedPatientForCheckIn, setSelectedPatientForCheckIn] = useState<Patient | null>(null);
  const [selectedPatientForPayment, setSelectedPatientForPayment] = useState<Patient | null>(null);
  const [selectedPatientForInvoice, setSelectedPatientForInvoice] = useState<Patient | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isDoctorCalendarOpen, setIsDoctorCalendarOpen] = useState(false);
  const [activeCalendarDoctorId, setActiveCalendarDoctorId] = useState<string | undefined>(undefined);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // Custom Calendar Bookings State (receptionist booked slots across days)
  const [customCalendarBookings, setCustomCalendarBookings] = useState<CustomCalendarBooking[]>(() => {
    const saved = localStorage.getItem('soltech_calendar_bookings');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  // Real-time Laboratory Report Modal & Alert State
  const [selectedPatientForLabReport, setSelectedPatientForLabReport] = useState<Patient | null>(null);
  const [isLabReportModalOpen, setIsLabReportModalOpen] = useState(false);
  const [labReportModalMode, setLabReportModalMode] = useState<'view' | 'upload'>('view');
  const [selectedInvestigationForUpload, setSelectedInvestigationForUpload] = useState<any | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('soltech_patients_v4', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('soltech_sections_layout', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('soltech_calendar_bookings', JSON.stringify(customCalendarBookings));
  }, [customCalendarBookings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Specialties list
  const specialties = Array.from(new Set(doctors.map((d) => d.specialty)));

  // Filtered patients based on header search & filters
  const filteredPatients = patients.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = p.patientNumber.toLowerCase().includes(q);
      const matchMobile = p.mobile.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchMobile) return false;
    }

    // Specialty filter
    if (selectedSpecialty !== 'All Specialties' && p.specialty !== selectedSpecialty) {
      return false;
    }

    // Doctor filter
    if (selectedDoctorId !== 'all' && p.doctorAssignedId !== selectedDoctorId) {
      return false;
    }

    return true;
  });

  // Section Move / Reorder Handlers (Sections can be moved to any position!)
  const handleMoveSection = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const reordered = newSections.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    showToast(`Moved "${moved.title}" to position ${targetIndex + 1}`);
  };

  const handleResetLayout = () => {
    setSections(INITIAL_SECTIONS);
    localStorage.removeItem('soltech_sections_layout');
    showToast('Dashboard sections reset to default workflow order');
  };

  // ==========================================
  // PATIENT WORKFLOW TRANSITIONS (STRICT 1 ACTIVE STATE)
  // ==========================================

  // 1. Check-in 100% -> Assessment (Section 11)
  const handleSendToAssessment = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'ASSESSMENT',
          waitingTimeMinutes: 0,
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: 'Check-in Completed & Sent to Assessment',
              performedBy: 'Priya Shah',
              role: 'Receptionist',
              category: 'Check-in',
              details: 'All 4 modules validated (Form, Body Comp, Medical Records, Vitals). Ready for MA.',
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast('Patient sent to MA Assessment');
  };

  // 2. Assessment -> Doctor Queue (Section 14: MA or Operational Override)
  const handleSendToDoctor = (patientId: string) => {
    let targetPatientName = '';
    let targetDoctorName = '';
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        targetPatientName = p.name;
        targetDoctorName = p.doctorName;
        return {
          ...p,
          status: 'IN QUEUE',
          waitingTimeMinutes: 0,
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: 'Sent to Doctor Queue',
              performedBy: activeWorkspace === 'ma' ? 'Anjali Mehta, CMA' : 'Priya Shah',
              role: activeWorkspace === 'ma' ? 'MA' : 'Receptionist',
              category: 'Assessment',
              details: `Intake complete. Transferred to Dr. ${p.doctorName}'s queue.`,
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast(
      targetPatientName
        ? `Patient ${targetPatientName} moved to Dr. ${targetDoctorName}'s Queue`
        : 'Patient moved to Doctor Queue'
    );
  };


  // 3. Toggle MA Assessment (Subjective/Objective simulation)
  const handleToggleMaAssessment = (patientId: string, type: 'subjective' | 'objective') => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const currentSubj = p.assessment.subjectiveCompleted;
        const currentObj = p.assessment.objectiveCompleted;
        const newSubj = type === 'subjective' ? !currentSubj : currentSubj;
        const newObj = type === 'objective' ? !currentObj : currentObj;

        return {
          ...p,
          assessment: {
            ...p.assessment,
            subjectiveCompleted: newSubj,
            objectiveCompleted: newObj,
            completedAt: newSubj && newObj ? 'Just now' : undefined,
          },
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: `${type === 'subjective' ? 'Subjective' : 'Objective'} Assessment ${
                (type === 'subjective' ? newSubj : newObj) ? 'Completed' : 'Marked Pending'
              }`,
              performedBy: 'Anjali Mehta',
              role: 'MA',
              category: 'Assessment',
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
  };

  // 4. Call Patient (Section 18: Reception operational summons)
  const handleCallPatient = (patientId: string, doctorId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    showToast(`Calling ${patient.name} to ${doctor.name}'s room (${doctor.roomNumber})`);
  };

  // 5. Start Consultation (Section 17: In Queue -> In Consultation)
  const handleStartConsultation = (patientId: string, doctorId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'IN CONSULTATION',
          consultationStartTime: nowTime,
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: nowTime,
              action: 'Consultation Started',
              performedBy: p.doctorName,
              role: 'Doctor',
              category: 'Doctor',
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast(`Consultation started for ${patients.find((p) => p.id === patientId)?.name}`);
  };

  // 6. Doctor Consultation -> Investigation & Therapy (Section 19)
  const handleDoctorOrderInvestigation = (patientId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const newInvestigation = {
          id: `inv-${Date.now()}`,
          name: '12-Lead ECG & Cardiac Profile',
          department: 'Laboratory' as const,
          orderedBy: p.doctorName,
          orderedAt: nowTime,
          status: 'Order Created' as const,
          charge: 1200,
        };

        return {
          ...p,
          status: 'INVESTIGATION',
          investigations: [newInvestigation, ...p.investigations],
          billing: {
            ...p.billing,
            investigationCharges: p.billing.investigationCharges + 1200,
            totalAmount: p.billing.totalAmount + 1200,
            amountDue: p.billing.amountDue + 1200,
          },
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: nowTime,
              action: 'Diagnostic Investigation Ordered',
              performedBy: p.doctorName,
              role: 'Doctor',
              category: 'Investigation',
              details: 'Ordered: 12-Lead ECG & Cardiac Profile',
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast('Investigation ordered; patient moved to Diagnostics & Therapy');
  };

  // 7. Doctor Consultation -> Billing & Checkout (Section 25: No further tests needed)
  const handleDoctorFinishToBilling = (patientId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'BILLING',
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: nowTime,
              action: 'Doctor Consultation Finished',
              performedBy: p.doctorName,
              role: 'Doctor',
              category: 'Doctor',
              details: 'Clinical review concluded. Routed to front desk billing.',
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast('Consultation concluded; patient moved to Billing & Checkout');
  };

  // 8. Investigation -> Hold On (Section 23: Waiting for result/report)
  const handleSendToHoldOn = (patientId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'HOLD ON',
          holdReason: 'Awaiting laboratory & radiology report verification',
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: nowTime,
              action: 'Moved to Hold On',
              performedBy: 'Priya Shah',
              role: 'Receptionist',
              category: 'Hold On',
              details: 'Specimens acquired; waiting for diagnostic interpretation.',
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast('Moved to Hold On while awaiting diagnostic report');
  };

  // 9. Hold On -> Doctor Review (Section 24: Report Available)
  const handleSendBackToDoctor = (patientId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'IN QUEUE',
          holdReason: undefined,
          hasNewReportAlert: false, // Clear active alert once acted upon
          labReportAlerts: (p.labReportAlerts || []).map((a) => ({ ...a, isUnread: false })),
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: nowTime,
              action: 'Report Available → Returned to Doctor Queue',
              performedBy: 'Priya Shah',
              role: 'Receptionist',
              category: 'Doctor',
              details: `Report ready for review by ${p.doctorName}. Alert acknowledged.`,
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast('Report verified; patient returned to Doctor Queue for review');
  };

  // Real-time Laboratory Report & Alert Handlers
  const handleOpenReportAlert = (patient: Patient) => {
    setSelectedPatientForLabReport(patient);
    setLabReportModalMode('view');
    setSelectedInvestigationForUpload(patient.investigations[0] || null);
    setIsLabReportModalOpen(true);
  };

  const handleOpenUploadReportModal = (patient: Patient, investigation?: any) => {
    setSelectedPatientForLabReport(patient);
    setLabReportModalMode('upload');
    setSelectedInvestigationForUpload(investigation || patient.investigations[0] || null);
    setIsLabReportModalOpen(true);
  };

  const handleUploadReport = (
    patientId: string,
    reportData: {
      investigationId?: string;
      reportName: string;
      department: 'Laboratory' | 'Pathology' | 'Radiology' | 'Physiotherapy';
      summary: string;
      findings: {
        parameter: string;
        value: string;
        unit: string;
        normalRange: string;
        status: 'Normal' | 'High' | 'Low' | 'Critical';
      }[];
      verifiedBy: string;
    }
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    // Play subtle auditory notification chime
    playLabReportChime();

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        // Update investigations list
        const updatedInvestigations = p.investigations.map((inv) => {
          if (!reportData.investigationId || inv.id === reportData.investigationId) {
            return {
              ...inv,
              status: 'Result Available' as const,
              resultAvailableAt: nowTime,
              completedAt: inv.completedAt || nowTime,
              reportSummary: reportData.summary,
              uploadedReportName: reportData.reportName,
              uploadedAt: nowTime,
              findings: reportData.findings,
            };
          }
          return inv;
        });

        const newAlert = {
          reportId: `rep-${Date.now()}`,
          investigationId: reportData.investigationId,
          reportName: reportData.reportName,
          department: reportData.department,
          uploadedAt: nowIso,
          uploadedTimeDisplay: nowTime,
          summary: reportData.summary,
          findings: reportData.findings,
          verifiedBy: reportData.verifiedBy,
          isUnread: true,
        };

        const existingAlerts = p.labReportAlerts || [];

        return {
          ...p,
          hasNewReportAlert: true,
          labReportAlerts: [newAlert, ...existingAlerts],
          investigations: updatedInvestigations,
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: nowIso,
              timeDisplay: nowTime,
              action: `Lab Report Uploaded: ${reportData.reportName}`,
              performedBy: reportData.verifiedBy.split(',')[0],
              role: 'Laboratory',
              category: 'Investigation',
              details: `${reportData.department} report verified and uploaded. Alert broadcast to receptionist.`,
            },
            ...p.activityTimeline,
          ],
        };
      })
    );

    const targetPat = patients.find((p) => p.id === patientId);
    showToast(`🔔 Lab Report Uploaded: ${reportData.reportName} for ${targetPat?.name || 'patient'}`);
  };

  const handleAcknowledgeAlert = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          hasNewReportAlert: false,
          labReportAlerts: (p.labReportAlerts || []).map((a) => ({ ...a, isUnread: false })),
        };
      })
    );
    showToast('Report alert acknowledged and bell dismissed');
  };

  const handleSimulateLabAlert = () => {
    // Pick a patient in INVESTIGATION or HOLD ON, or the first patient available
    const candidate =
      patients.find((p) => p.status === 'INVESTIGATION') ||
      patients.find((p) => p.status === 'HOLD ON') ||
      patients[0];

    if (!candidate) return;

    handleUploadReport(candidate.id, {
      investigationId: candidate.investigations[0]?.id,
      reportName: candidate.investigations[0]?.name || 'Complete Blood Count (CBC)',
      department: candidate.investigations[0]?.department || 'Laboratory',
      summary: 'Normocytic, normochromic RBCs. Adequate platelets and normal WBC count. Verified by chief pathologist.',
      findings: [
        { parameter: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'Normal' },
        { parameter: 'Total Leukocyte Count (WBC)', value: '7,400', unit: '/µL', normalRange: '4,000 - 11,000', status: 'Normal' },
        { parameter: 'Platelet Count', value: '280,000', unit: '/µL', normalRange: '150,000 - 450,000', status: 'Normal' },
        { parameter: 'Hematocrit (PCV)', value: '41.2', unit: '%', normalRange: '40.0 - 50.0', status: 'Normal' },
        { parameter: 'ESR (1st Hour)', value: '12', unit: 'mm/hr', normalRange: '0 - 15', status: 'Normal' },
      ],
      verifiedBy: 'Dr. Suresh Ramanathan, MD (Pathology)',
    });
  };

  // 10. Billing -> Done (Section 29: Payment Complete)
  const handleCompletePayment = (
    patientId: string,
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Online' | 'Insurance'
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const receiptNo = `REC-2026-0904-${Math.floor(1000 + Math.random() * 9000)}`;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'DONE',
          billing: {
            ...p.billing,
            amountPaid: p.billing.totalAmount,
            amountDue: 0,
            status: 'Paid',
            paymentMethod,
            paidAt: nowTime,
            receiptNumber: receiptNo,
          },
          activityTimeline: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              timeDisplay: nowTime,
              action: `Payment Collected (₹${p.billing.totalAmount.toLocaleString()} via ${paymentMethod})`,
              performedBy: 'Priya Shah',
              role: 'Receptionist',
              category: 'Billing',
              details: `Receipt #${receiptNo} generated. Visit completed.`,
            },
            ...p.activityTimeline,
          ],
        };
      })
    );
    showToast(`Payment collected! Receipt #${receiptNo} generated.`);
  };

  // 11. Book New Walk-in / Appointment
  const handleBookAppointment = (data: Partial<Patient>) => {
    const newId = `pat-${Date.now()}`;
    const newPatNumber = `STP-000${Math.floor(200 + Math.random() * 800)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient: Patient = {
      id: newId,
      patientNumber: newPatNumber,
      name: data.name || 'New Patient',
      age: data.age || 30,
      gender: data.gender || 'Male',
      mobile: data.mobile || '+91 98250 00000',
      appointmentTime: data.appointmentTime || nowTime,
      appointmentType: data.appointmentType || 'Walk-in',
      visitType: data.visitType || 'New Patient',
      doctorAssignedId: data.doctorAssignedId || doctors[0].id,
      doctorName: data.doctorName || doctors[0].name,
      specialty: data.specialty || doctors[0].specialty,
      status: 'CHECK-IN',
      arrivalStatus: 'ARRIVED',
      arrivedAt: nowTime,
      waitingTimeMinutes: 0,
      checkInModules: {
        form: true,
        bodyComposition: false,
        medicalRecords: false,
        vitals: false,
      },
      form: {
        fullName: data.name || 'New Patient',
        age: data.age || 30,
        gender: data.gender || 'Male',
        mobile: data.mobile || '+91 98250 00000',
        address: 'Paldi, Ahmedabad',
        city: 'Ahmedabad - 380007',
        emergencyContactName: 'Primary Contact',
        emergencyContactRelation: 'Spouse',
        emergencyContactMobile: data.mobile || '+91 98250 00000',
        completed: true,
      },
      bodyComposition: {
        heightCm: 168,
        weightKg: 68,
        bmi: 24.1,
        recordedAt: '',
        recordedBy: '',
      },
      medicalRecords: {
        allergies: [],
        chronicConditions: [],
        pastSurgeries: [],
        currentMedications: [],
        familyHistory: [],
        completed: false,
      },
      vitals: {
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        temperature: 98.6,
        spo2: 99,
        respiratoryRate: 16,
        recordedAt: '',
        recordedBy: '',
      },
      assessment: {
        subjectiveCompleted: false,
        objectiveCompleted: false,
        chiefComplaint: data.assessment?.chiefComplaint || 'Consultation request',
        symptomsDuration: 'Today',
        symptomSeverity: 'Mild',
        maNotes: '',
      },
      investigations: [],
      billing: {
        consultationFee: 800,
        investigationCharges: 0,
        therapyCharges: 0,
        otherCharges: 0,
        discount: 0,
        tax: 0,
        totalAmount: 800,
        amountPaid: 0,
        amountDue: 800,
        status: 'Pending',
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeDisplay: nowTime,
          action: `${data.appointmentType || 'Walk-in'} Registered at Front Desk`,
          performedBy: 'Priya Shah',
          role: 'Receptionist',
          category: 'Registration',
        },
      ],
    };

    setPatients([newPatient, ...patients]);
    showToast(`Patient ${newPatient.name} registered and checked in.`);
  };

  // 12. Doctor Calendar: Book Appointment Slot
  const handleCalendarBookSlot = (bookingData: {
    doctorId: string;
    date: string;
    time: string;
    slotId: string;
    patientName: string;
    patientAge: number;
    patientGender: Gender;
    patientMobile: string;
    visitType: 'New Patient' | 'Follow-up';
    appointmentType: 'Walk-in' | 'Online Appointment' | 'Scheduled';
    reason: string;
    checkInImmediately: boolean;
  }) => {
    const newBookingId = `book-${Date.now()}`;
    const doc = doctors.find((d) => d.id === bookingData.doctorId) || doctors[0];
    const tokenNo = `STP-000${Math.floor(200 + Math.random() * 800)}`;

    const newBooking: CustomCalendarBooking = {
      id: newBookingId,
      slotId: bookingData.slotId,
      doctorId: bookingData.doctorId,
      date: bookingData.date,
      time: bookingData.time,
      patientName: bookingData.patientName,
      patientAge: bookingData.patientAge,
      patientGender: bookingData.patientGender,
      patientMobile: bookingData.patientMobile,
      visitType: bookingData.visitType,
      appointmentType: bookingData.appointmentType,
      reason: bookingData.reason,
      status: bookingData.checkInImmediately ? 'Checked In' : 'Scheduled',
      tokenNumber: tokenNo,
    };

    setCustomCalendarBookings((prev) => [newBooking, ...prev]);

    // If checkInImmediately is true, register directly into today's active flow
    if (bookingData.checkInImmediately) {
      handleBookAppointment({
        name: bookingData.patientName,
        age: bookingData.patientAge,
        gender: bookingData.patientGender,
        mobile: bookingData.patientMobile,
        appointmentTime: bookingData.time,
        appointmentType: bookingData.appointmentType,
        visitType: bookingData.visitType,
        doctorAssignedId: doc.id,
        doctorName: doc.name,
        specialty: doc.specialty,
        assessment: {
          subjectiveCompleted: false,
          objectiveCompleted: false,
          chiefComplaint: bookingData.reason || 'General consultation',
          symptomsDuration: 'Today',
          symptomSeverity: 'Mild',
          maNotes: '',
        },
      });
      showToast(`Slot reserved & ${bookingData.patientName} checked in with ${doc.name} for ${bookingData.time}`);
    } else {
      showToast(
        `Appointment confirmed for ${bookingData.patientName} with ${doc.name} on ${bookingData.date} at ${bookingData.time}`
      );
    }
  };

  // 13. Doctor Calendar: Cancel Appointment Slot
  const handleCancelCalendarBooking = (
    bookingId: string,
    doctorId: string,
    date: string,
    time: string
  ) => {
    setCustomCalendarBookings((prev) =>
      prev.filter(
        (b) => !(b.id === bookingId || (b.doctorId === doctorId && b.date === date && b.time === time))
      )
    );
    showToast(`Appointment slot freed up at ${time}.`);
  };

  // Render individual section component based on config ID
  const renderSectionComponent = (section: SectionLayoutConfig, index: number) => {
    const canMoveLeft = index > 0;
    const canMoveRight = index < sections.length - 1;

    switch (section.id) {
      case 'daily_performance':
        return (
          <DailyPerformanceSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            doctors={doctors}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
          />
        );

      case 'todays_patients':
        return (
          <TodaysPatientsSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onOpenReportAlert={handleOpenReportAlert}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
            onQuickAction={(p) => {
              if (p.status === 'CHECK-IN') setSelectedPatientForCheckIn(p);
              else if (p.status === 'BILLING') setSelectedPatientForPayment(p);
              else setSelectedPatientForDetail(p);
            }}
          />
        );

      case 'check_in':
        return (
          <CheckInSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onOpenCheckInModal={(p) => setSelectedPatientForCheckIn(p)}
            onSendToAssessment={handleSendToAssessment}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
          />
        );

      case 'assessment':
        return (
          <AssessmentSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onSendToDoctor={handleSendToDoctor}
            onToggleMaAssessment={handleToggleMaAssessment}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
          />
        );

      case 'doctors':
        return (
          <DoctorsSection
            key={section.id}
            section={section}
            doctors={doctors}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onCallPatient={handleCallPatient}
            onStartConsultation={handleStartConsultation}
            onDoctorOrderInvestigation={handleDoctorOrderInvestigation}
            onDoctorFinishToBilling={handleDoctorFinishToBilling}
            onOpenCalendar={(docId) => {
              setActiveCalendarDoctorId(docId);
              setIsDoctorCalendarOpen(true);
            }}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
            selectedDoctorFilter={selectedDoctorId}
          />
        );

      case 'investigation':
        return (
          <InvestigationSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onSendToHoldOn={handleSendToHoldOn}
            onOpenUploadReportModal={handleOpenUploadReportModal}
            onOpenReportAlert={handleOpenReportAlert}
            onSimulateLabAlert={handleSimulateLabAlert}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
          />
        );

      case 'hold_on':
        return (
          <HoldOnSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onSendBackToDoctor={handleSendBackToDoctor}
            onOpenReportAlert={handleOpenReportAlert}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
          />
        );

      case 'billing':
        return (
          <BillingSection
            key={section.id}
            section={section}
            patients={filteredPatients}
            onOpenDetail={(p) => setSelectedPatientForDetail(p)}
            onOpenPaymentModal={(p) => setSelectedPatientForPayment(p)}
            onMoveLeft={() => handleMoveSection(index, 'left')}
            onMoveRight={() => handleMoveSection(index, 'right')}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            layoutMode={layoutMode}
          />
        );

      default:
        return null;
    }
  };

  // Operational metrics for quick status strip
  const inClinicTotal = patients.filter((p) => p.arrivalStatus === 'ARRIVED' && p.status !== 'DONE').length;
  const inCheckInTotal = patients.filter((p) => p.status === 'CHECK-IN' && p.arrivalStatus === 'ARRIVED').length;
  const inAssessmentTotal = patients.filter((p) => p.status === 'ASSESSMENT').length;
  const inDoctorTotal = patients.filter((p) => ['IN QUEUE', 'IN CONSULTATION'].includes(p.status)).length;
  const inInvestigationTotal = patients.filter((p) => p.status === 'INVESTIGATION').length;
  const inHoldOnTotal = patients.filter((p) => p.status === 'HOLD ON').length;
  const inBillingTotal = patients.filter((p) => p.status === 'BILLING').length;
  const inDoneTotal = patients.filter((p) => p.status === 'DONE').length;

  const renderModals = () => (
    <>
      {/* Patient Detail 3-Column Modal */}
      {selectedPatientForDetail && (
        <PatientDetailModal
          patient={selectedPatientForDetail}
          isOpen={!!selectedPatientForDetail}
          onClose={() => setSelectedPatientForDetail(null)}
          onUpdatePatient={(updated) => {
            setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedPatientForDetail(updated);
          }}
        />
      )}

      {/* Check-in 4 Modules Modal */}
      {selectedPatientForCheckIn && (
        <CheckInModal
          patient={selectedPatientForCheckIn}
          isOpen={!!selectedPatientForCheckIn}
          onClose={() => setSelectedPatientForCheckIn(null)}
          onUpdatePatient={(updated) => {
            setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedPatientForCheckIn(updated);
          }}
          onSendToAssessment={handleSendToAssessment}
          doctors={doctors}
        />
      )}

      {/* Doctor Calendar & Slot Booking Modal (Day-wise view of available & booked slots) */}
      <DoctorCalendarModal
        isOpen={isDoctorCalendarOpen}
        onClose={() => setIsDoctorCalendarOpen(false)}
        doctors={doctors}
        selectedDoctorId={activeCalendarDoctorId || (selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0]?.id)}
        currentDate="04 Sep 2026"
        patients={patients}
        customBookings={customCalendarBookings}
        onBookSlot={handleCalendarBookSlot}
        onCancelBooking={handleCancelCalendarBooking}
        onCheckInPatient={(patId) => {
          const pat = patients.find((p) => p.id === patId);
          if (pat) setSelectedPatientForCheckIn(pat);
        }}
        onViewPatientDetails={(pat) => setSelectedPatientForDetail(pat)}
      />

      {/* Book Appointment / Walk-in Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        doctors={doctors}
        onBook={handleBookAppointment}
      />

      {/* Payment / Checkout Modal */}
      {selectedPatientForPayment && (
        <PaymentModal
          patient={selectedPatientForPayment}
          isOpen={!!selectedPatientForPayment}
          onClose={() => setSelectedPatientForPayment(null)}
          onCompletePayment={handleCompletePayment}
          onOpenInvoice={(p) => setSelectedPatientForInvoice(p)}
        />
      )}

      {/* Tax Invoice & Itemized Bill Modal (Complete Expenses & All Dues Breakdown) */}
      {selectedPatientForInvoice && (
        <ItemizedInvoiceModal
          patient={selectedPatientForInvoice}
          isOpen={!!selectedPatientForInvoice}
          onClose={() => setSelectedPatientForInvoice(null)}
          onCompletePayment={handleCompletePayment}
          onUpdatePatient={(updated) => {
            setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedPatientForInvoice(updated);
          }}
        />
      )}

      {/* Real-time Laboratory Report Modal (Upload, View, Acknowledge & Route) */}
      <LabReportModal
        isOpen={isLabReportModalOpen}
        onClose={() => {
          setIsLabReportModalOpen(false);
          setSelectedPatientForLabReport(null);
        }}
        patient={selectedPatientForLabReport}
        mode={labReportModalMode}
        selectedInvestigation={selectedInvestigationForUpload}
        onUploadReport={handleUploadReport}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onSendBackToDoctor={handleSendBackToDoctor}
      />

      {/* Layout Customizer Modal (Adjust & Move all sections) */}
      <LayoutCustomizerModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        sections={sections}
        onReorder={(newSecs) => setSections(newSecs)}
        onReset={handleResetLayout}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />

      {/* Toast Notification Banner in Bento Pill Style */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/85 backdrop-blur-xl text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 ring-1 ring-black/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col font-sans antialiased relative bg-slate-100 bg-cover bg-center bg-fixed bg-no-repeat selection:bg-blue-100"
      style={{ backgroundImage: `url('/bg-clinic.jpg')` }}
    >
      {/* Light atmospheric overlay ensuring maximum contrast and legibility */}
      <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] pointer-events-none z-0" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {activeWorkspace === 'ma' ? (
          /* ======================================================== */
          /* MA (MEDICAL ASSISTANT) HOME SCREEN WORKSPACE              */
          /* ======================================================== */
          <>
            <MAHomeScreen
              patients={patients}
              doctors={doctors}
              onUpdatePatients={setPatients}
              onSendToDoctor={handleSendToDoctor}
              onToggleMaAssessment={handleToggleMaAssessment}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              selectedSpecialty={selectedSpecialty}
              onSpecialtyChange={setSelectedSpecialty}
              specialties={specialties}
              selectedDoctorId={selectedDoctorId}
              onDoctorChange={setSelectedDoctorId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onSwitchToReception={() => setActiveWorkspace('reception')}
              onSwitchWorkspace={setActiveWorkspace}
              activeWorkspace={activeWorkspace}
              onStartConsultation={handleStartConsultation}
              onDoctorOrderInvestigation={handleDoctorOrderInvestigation}
              onDoctorFinishToBilling={handleDoctorFinishToBilling}
              onCallPatient={handleCallPatient}
              onOpenDoctorCalendar={(docId) => {
                setActiveCalendarDoctorId(docId);
                setIsDoctorCalendarOpen(true);
              }}
            />
            {renderModals()}
          </>
        ) : (
          /* ======================================================== */
          /* RECEPTION DESK OPERATIONAL CONTROL CENTER                 */
          /* ======================================================== */
          <>
            {/* Reception Master Header with Profile Role Switcher */}
            <Header
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              selectedSpecialty={selectedSpecialty}
              onSpecialtyChange={setSelectedSpecialty}
              specialties={specialties}
              selectedDoctorId={selectedDoctorId}
              onDoctorChange={setSelectedDoctorId}
              doctors={doctors}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onOpenBookAppointment={() => setIsBookModalOpen(true)}
              onOpenDoctorCalendar={() => {
                setActiveCalendarDoctorId(selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0]?.id);
                setIsDoctorCalendarOpen(true);
              }}
              onOpenLayoutCustomizer={() => setIsLayoutModalOpen(true)}
              activeLayoutMode={layoutMode}
              onToggleLayoutMode={() => setLayoutMode(layoutMode === 'kanban' ? 'grid' : 'kanban')}
              labAlertPatients={patients.filter((p) => p.hasNewReportAlert || p.labReportAlerts?.some((a) => a.isUnread))}
              onSelectAlertPatient={handleOpenReportAlert}
              onSimulateLabAlert={handleSimulateLabAlert}
              activeWorkspace={activeWorkspace}
              onSwitchWorkspace={setActiveWorkspace}
            />

            {/* Quick Operational Metrics Strip (Real-time Flow Across All Stages) */}
            <div className="w-full px-4 sm:px-6 py-2 bg-white/60 backdrop-blur-md border-b border-white/80 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none z-20 shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/5 border border-slate-900/10 text-slate-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>In Clinic:</span>
                  <strong className="font-mono tabular-nums text-blue-900">{inClinicTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 text-blue-800 border border-blue-200/80 shadow-2xs">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Check-in:</span>
                  <strong className="font-mono tabular-nums">{inCheckInTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 text-teal-800 border border-teal-200/80 shadow-2xs">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assessment:</span>
                  <strong className="font-mono tabular-nums">{inAssessmentTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-800 border border-indigo-200/80 shadow-2xs">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  <span>In Queue:</span>
                  <strong className="font-mono tabular-nums">{inDoctorTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50/80 text-violet-800 border border-violet-200/80 shadow-2xs">
                  <FlaskConical className="w-3.5 h-3.5 text-violet-600" />
                  <span>Investigation:</span>
                  <strong className="font-mono tabular-nums">{inInvestigationTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 text-amber-800 border border-amber-200/80 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hold On:</span>
                  <strong className="font-mono tabular-nums">{inHoldOnTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50/80 text-sky-800 border border-sky-200/80 shadow-2xs">
                  <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                  <span>Billing:</span>
                  <strong className="font-mono tabular-nums">{inBillingTotal}</strong>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Done:</span>
                  <strong className="font-mono tabular-nums">{inDoneTotal}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLayoutModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Customize Layout</span>
                </button>
              </div>
            </div>

            {/* Main Operational Sections Flow */}
            <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
              {layoutMode === 'kanban' ? (
                <div className="flex gap-4 items-start pb-6 min-w-max">
                  {sections.map((section, idx) => renderSectionComponent(section, idx))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-6">
                  {sections.map((section, idx) => renderSectionComponent(section, idx))}
                </div>
              )}
            </main>

            {renderModals()}
          </>
        )}
      </div>
    </div>
  );
}
