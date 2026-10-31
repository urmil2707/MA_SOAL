import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldAlert,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Stethoscope,
  Info,
  CheckCircle2,
  Filter,
  FileText,
  Activity,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Patient, ClinicalCasePresentation as PresentationType, MedicalInsight } from '../types';
import { synthesizeClinicalCase } from '../utils/clinicalCaseSynthesizer';
import { ClinicalEvidenceLink } from './ClinicalEvidenceLink';

interface ClinicalCasePresentationProps {
  patient: Patient;
  onNavigateTab?: (tabKey: string) => void;
  onNavigateEvidence?: (targetTab: string, targetElementId?: string, sourceTitle?: string) => void;
  className?: string;
}

const SPECIALTY_OPTIONS = [
  'General Medicine',
  'Cardiology',
  'Nephrology',
  'Endocrinology',
  'Orthopaedics',
];

export const ClinicalCasePresentation: React.FC<ClinicalCasePresentationProps> = ({
  patient,
  onNavigateTab,
  onNavigateEvidence,
  className = '',
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    patient.specialty || 'General Medicine'
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'unverified' | 'clinician_reviewed' | 'clinician_approved'
  >('unverified');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Generate presentation
  const presentation: PresentationType = useMemo(() => {
    return synthesizeClinicalCase(patient, selectedSpecialty);
  }, [patient, selectedSpecialty, isRefreshing]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Safe navigation dispatcher supporting deep-linking
  const handleEvidenceJump = (tab: string, elementId?: string, label?: string) => {
    if (onNavigateEvidence) {
      onNavigateEvidence(tab, elementId, label);
    } else if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  // Handle copy brief
  const handleCopyBrief = () => {
    const textToCopy = `CLINICAL CASE PRESENTATION (SoalTech H&P Brief)
Patient: ${patient.name} (${patient.age}Y, ${patient.gender}) | MRN: ${patient.patientNumber}
Generated: ${presentation.generated_at} (Data as of: ${presentation.data_as_of})
Specialty Focus: ${selectedSpecialty}

CASE SUMMARY:
${presentation.clinical_case_summary}

HISTORY OF PRESENT ILLNESS:
${presentation.history_of_present_illness}

OBJECTIVE FINDINGS:
${presentation.relevant_objective_findings}

INVESTIGATIONS:
${presentation.investigation_summary}

CLINICAL SYNTHESIS:
${presentation.clinical_synthesis}

TOP MEDICAL INSIGHTS:
${presentation.medical_insights
  .slice(0, 3)
  .map(
    (ins, i) =>
      `${i + 1}. [${ins.category}] ${ins.short_title}: ${ins.clinical_observation}`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const top3Insights = presentation.medical_insights.slice(0, 3);

  const filteredInsights = useMemo(() => {
    if (activeFilterCategory === 'all') return presentation.medical_insights;
    return presentation.medical_insights.filter((ins) => ins.category === activeFilterCategory);
  }, [presentation.medical_insights, activeFilterCategory]);

  const insightCategories = [
    'all',
    'Significant clinical findings',
    'Longitudinal trends',
    'Clinical associations',
    'Medication and allergy considerations',
    'Information gaps',
    'Possible differential considerations',
    'Follow-up and continuity',
  ];

  return (
    <div
      id="ai-clinical-case-presentation"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* ========================================================= */}
      {/* HEADER BAR: AI CASE BRIEFING & AUDIT CONTROLS             */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 px-4 py-2.5 text-white flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 ring-1 ring-teal-400/30">
            <Sparkles className="w-4 h-4 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-tight text-white flex items-center gap-1.5">
                Clinical Case Presentation & Medical Insights
              </span>
              <span className="text-[10px] text-teal-300/80 font-medium hidden sm:inline">
                H&P Synthesis
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-300/80">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Updated: {presentation.generated_at}
              </span>
              <span>·</span>
              <span className="text-teal-300 font-medium">Click any underlined term to view source</span>
            </div>
          </div>
        </div>

        {/* Audit Controls & Specialty Focus */}
        <div className="flex items-center gap-2">
          {/* Specialty Focus Selector */}
          <div className="flex items-center gap-1 bg-white/10 hover:bg-white/15 rounded-lg px-2 py-1 text-[11px] border border-white/10 transition-colors">
            <Filter className="w-3 h-3 text-teal-300" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-hidden cursor-pointer text-[11px]"
            >
              {SPECIALTY_OPTIONS.map((spec) => (
                <option key={spec} value={spec} className="bg-slate-900 text-white">
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Copy Brief Button */}
          <button
            type="button"
            onClick={handleCopyBrief}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer"
            title="Copy clinical case presentation to clipboard"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-300" />
            )}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Clinician Verification Toggle */}
          <button
            type="button"
            onClick={() => {
              setVerificationStatus((prev) =>
                prev === 'clinician_approved' ? 'unverified' : 'clinician_approved'
              );
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
              verificationStatus === 'clinician_approved'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
            }`}
            title="Mark case brief as clinician verified"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>
              {verificationStatus === 'clinician_approved'
                ? 'Doctor Verified'
                : 'Mark Verified'}
            </span>
          </button>

          {/* Refresh Synthesis */}
          <button
            type="button"
            onClick={handleRefresh}
            className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Re-synthesize from latest records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LEVEL 1: IMMEDIATE CLINICAL SNAPSHOT (10–20 SECOND SCAN)  */}
      {/* ========================================================= */}
      <div className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-200/80 space-y-3">
        {/* Safety Alerts (Critical Findings Banner) */}
        {presentation.safety_alerts.length > 0 && (
          <div className="bg-rose-50 border border-rose-200/90 rounded-xl p-2.5 flex items-start gap-2.5 text-rose-900 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-rose-700 block">
                Critical Clinical Safety Alerts ({presentation.safety_alerts.length})
              </span>
              <ul className="space-y-0.5 font-medium text-rose-800 text-[11px]">
                {presentation.safety_alerts.map((alert, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 1-Paragraph Oral Case Snapshot with Clickable Evidence Links */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Level 1 Oral Case Snapshot
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
              Hover token for preview · Click to deep-link
            </span>
          </div>

          {/* Interactive Case Narrative */}
          <div className="text-xs text-slate-800 font-medium leading-relaxed space-y-2">
            <div>
              A {patient.age}-year-old {patient.gender.toLowerCase()}{' '}
              with documented{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Chronic Condition: Type 2 Diabetes',
                  category: 'Medical History',
                  date: 'Since 2018',
                  verifiedBy: 'Documented History',
                  previewSnippet: 'Type 2 Diabetes Mellitus diagnosed in 2018 (under treatment).',
                  targetTab: 'history',
                  targetElementId: 'evidence-history-diabetes',
                  severityOrStatus: 'Active',
                }}
                onNavigate={handleEvidenceJump}
              >
                Diabetes Mellitus
              </ClinicalEvidenceLink>{' '}
              and{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Surgical History: Bypass Surgery',
                  category: 'Medical History',
                  date: '2018',
                  verifiedBy: 'Satyam Surgical Center',
                  previewSnippet: 'CABG Bypass Surgery in 2018; post-op recovery uneventful.',
                  targetTab: 'history',
                  targetElementId: 'evidence-history-bypass',
                  severityOrStatus: 'Major Surgery',
                }}
                onNavigate={handleEvidenceJump}
              >
                Bypass Surgery (2018)
              </ClinicalEvidenceLink>
              , presenting for consultation with{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Presenting Complaint: Chest Pain',
                  category: 'Intake Symptom',
                  date: '04 Jun 2026',
                  verifiedBy: 'MA Triage Assessment',
                  previewSnippet: 'Exertional chest pain for 2 weeks, pain scale 7/10, relieved by rest.',
                  targetTab: 'symptoms',
                  targetElementId: 'evidence-symptom-chest-pain',
                  severityOrStatus: 'Severe 7/10',
                }}
                onNavigate={handleEvidenceJump}
              >
                exertional chest pain (2 weeks)
              </ClinicalEvidenceLink>
              . Current intake vitals reveal blood pressure of{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Check-In Vitals: Blood Pressure',
                  category: 'Vital Sign',
                  date: patient.vitals?.recordedAt || 'Today, 09:30 AM',
                  verifiedBy: 'Priya Shah (Receptionist)',
                  previewSnippet: `BP: ${patient.vitals?.bpSystolic ?? 128}/${patient.vitals?.bpDiastolic ?? 84} mmHg (Elevated Stage 1).`,
                  targetTab: 'vitals',
                  targetElementId: 'evidence-vital-bp',
                  severityOrStatus: 'Elevated',
                }}
                onNavigate={handleEvidenceJump}
              >
                {patient.vitals?.bpSystolic ?? 128}/{patient.vitals?.bpDiastolic ?? 84} mmHg
              </ClinicalEvidenceLink>
              , resting heart rate of{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Check-In Vitals: Pulse Rate',
                  category: 'Vital Sign',
                  date: patient.vitals?.recordedAt || 'Today',
                  verifiedBy: 'Clinical Triage',
                  previewSnippet: `Heart Rate: ${patient.vitals?.pulse ?? 78} bpm (Sinus rhythm).`,
                  targetTab: 'vitals',
                  targetElementId: 'evidence-vital-pulse',
                }}
                onNavigate={handleEvidenceJump}
              >
                {patient.vitals?.pulse ?? 78} bpm
              </ClinicalEvidenceLink>
              , and BMI of{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Body Composition: BMI',
                  category: 'Vital Sign',
                  date: 'Today',
                  verifiedBy: 'Body Composition Analysis',
                  previewSnippet: `BMI: ${patient.bodyComposition?.bmi ?? 22.6} kg/m² (Normal range).`,
                  targetTab: 'vitals',
                  targetElementId: 'evidence-vital-bmi',
                }}
                onNavigate={handleEvidenceJump}
              >
                {patient.bodyComposition?.bmi ?? 22.6} kg/m²
              </ClinicalEvidenceLink>
              .
            </div>

            <div>
              Diagnostic records highlight an elevated{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'City Diagnostics: Serum Creatinine',
                  category: 'Lab Report',
                  date: '03 Jun 2026',
                  verifiedBy: 'Dr. Meera Nair (Pathologist)',
                  previewSnippet: 'Serum Creatinine: 1.3 mg/dL (High, Reference 0.7 - 1.2 mg/dL).',
                  targetTab: 'records',
                  targetElementId: 'evidence-report-creatinine',
                  severityOrStatus: 'High 1.3 mg/dL',
                }}
                onNavigate={handleEvidenceJump}
              >
                Serum Creatinine of 1.3 mg/dL
              </ClinicalEvidenceLink>
              , an uncontrolled{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Pathology Lab: Glycated HbA1c',
                  category: 'Lab Report',
                  date: '03 Jun 2026',
                  verifiedBy: 'City Diagnostics',
                  previewSnippet: 'HbA1c: 7.8% (Elevated glycemic control; target < 7.0%).',
                  targetTab: 'records',
                  targetElementId: 'evidence-report-hba1c',
                  severityOrStatus: 'High 7.8%',
                }}
                onNavigate={handleEvidenceJump}
              >
                HbA1c of 7.8%
              </ClinicalEvidenceLink>
              , and atherogenic dyslipidemia with{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'City Diagnostics: Lipid Profile',
                  category: 'Lab Report',
                  date: '03 Jun 2026',
                  verifiedBy: 'Dr. Meera Nair',
                  previewSnippet: 'Total Cholesterol 248 mg/dL, Triglycerides 162 mg/dL, LDL 162 mg/dL, TC/HDL 6.5.',
                  targetTab: 'records',
                  targetElementId: 'evidence-report-lipid',
                  severityOrStatus: 'High LDL 162',
                }}
                onNavigate={handleEvidenceJump}
              >
                LDL Cholesterol 162 mg/dL
              </ClinicalEvidenceLink>
              . Prior stress testing demonstrated{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Cardiology: Treadmill Stress Test (TMT)',
                  category: 'Imaging / ECG',
                  date: '12 Jan 2025',
                  verifiedBy: 'Dr. S. Menon (Cardiologist)',
                  previewSnippet: 'TMT: Abnormal. ST depression in inferior leads at Stage 3 protocol.',
                  targetTab: 'records',
                  targetElementId: 'evidence-report-tmt',
                  severityOrStatus: 'Abnormal',
                }}
                onNavigate={handleEvidenceJump}
              >
                Abnormal TMT with ST-3 changes
              </ClinicalEvidenceLink>
              . Known documented sensitivity to{' '}
              <ClinicalEvidenceLink
                source={{
                  title: 'Drug Sensitivity: Penicillin',
                  category: 'Medical History',
                  date: 'Documented',
                  verifiedBy: 'Patient Records',
                  previewSnippet: 'Penicillin: Urticaria & Pruritic Rash (Severe risk).',
                  targetTab: 'history',
                  targetElementId: 'evidence-history-penicillin',
                  severityOrStatus: 'Severe Allergy',
                }}
                onNavigate={handleEvidenceJump}
              >
                Penicillin (Severe)
              </ClinicalEvidenceLink>
              .
            </div>
          </div>
        </div>

        {/* Top 3 High-Priority Medical Insights Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              High-Priority Medical Insights ({top3Insights.length})
            </span>
            <span className="text-[10px] text-slate-500">
              Evaluated against {selectedSpecialty} guidelines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {top3Insights.map((ins) => (
              <div
                key={ins.id}
                className={`rounded-xl p-2.5 border transition-all text-xs bg-white shadow-3xs ${
                  ins.priority === 'high'
                    ? 'border-amber-200/90 hover:border-amber-300'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 truncate">
                    {ins.category}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1 rounded ${
                      ins.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ins.priority}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-[11px] line-clamp-1 mb-0.5">
                  {ins.short_title}
                </h5>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {ins.clinical_observation}
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">Src: {ins.source_references?.[0] || 'Records'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (ins.category === 'Longitudinal trends') {
                        handleEvidenceJump('trends', 'evidence-trends-container', ins.short_title);
                      } else if (ins.category.includes('Medication')) {
                        handleEvidenceJump('history', 'evidence-history-medications', ins.short_title);
                      } else if (ins.category.includes('Significant')) {
                        handleEvidenceJump('records', 'evidence-report-creatinine', ins.short_title);
                      } else {
                        handleEvidenceJump('overview', 'evidence-overview-symptoms', ins.short_title);
                      }
                    }}
                    className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-0.5 cursor-pointer ml-1 shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expand Level 2 Trigger Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Click below to expand complete H&P narrative, diagnostic trends, and clinical gaps.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <span>
              {isExpanded
                ? 'Hide Expanded H&P & Insights'
                : 'Expand Level 2 H&P Presentation'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LEVEL 2: EXPANDED CASE PRESENTATION & MEDICAL INSIGHTS    */}
      {/* (Target Reading: 30–90 seconds)                           */}
      {/* ========================================================= */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 bg-white border-b border-slate-200">
          {/* Dual Column Layout: Factual Case Presentation (Left) vs AI Medical Insights (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ===================================================== */}
            {/* LEFT COLUMN: FACTUAL CASE PRESENTATION (H&P)          */}
            {/* ===================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-700" />
                  Factual Case Presentation (H&P Method)
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Interactive Clinical Tokens
                </span>
              </div>

              {/* A. History of Present Illness (HPI) */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    A. History of Present Illness (HPI)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEvidenceJump('symptoms', 'evidence-symptom-chest-pain', 'HPI Intake')}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    View in Symptoms Tab →
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed">
                  Patient presents with{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Intake Symptom: Exertional Chest Pain',
                      category: 'Intake Symptom',
                      date: '04 Jun 2026',
                      previewSnippet: 'Exertional chest pain for 2 weeks, severity 7/10, worse on exertion.',
                      targetTab: 'symptoms',
                      targetElementId: 'evidence-symptom-chest-pain',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    exertional chest pain
                  </ClinicalEvidenceLink>{' '}
                  noted over 2 weeks with acute exacerbations and accompanying{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Triage Symptom: Rapid Breathing',
                      category: 'Intake Symptom',
                      date: '04 Jun 2026',
                      previewSnippet: 'Rapid breathing during rest reported during triage assessment.',
                      targetTab: 'symptoms',
                      targetElementId: 'evidence-symptom-breathing',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    rapid breathing during rest
                  </ClinicalEvidenceLink>
                  . Overall symptom severity is graded at High (7/10).
                </div>
              </div>

              {/* B. Relevant Medical Background */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    B. Relevant Medical Background
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEvidenceJump('history', 'evidence-history-diabetes', 'Medical History')}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    View in History Tab →
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed">
                  Active history of{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Chronic Condition: Diabetes Mellitus',
                      category: 'Medical History',
                      date: 'Since 2018',
                      previewSnippet: 'Type 2 Diabetes Mellitus under treatment.',
                      targetTab: 'history',
                      targetElementId: 'evidence-history-diabetes',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Type 2 Diabetes Mellitus (2018)
                  </ClinicalEvidenceLink>
                  ,{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Chronic Condition: Essential Hypertension',
                      category: 'Medical History',
                      date: 'Since 2016',
                      previewSnippet: 'Hypertension under regular therapy.',
                      targetTab: 'history',
                      targetElementId: 'evidence-history-hypertension',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Hypertension
                  </ClinicalEvidenceLink>
                  , and status post{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Surgical History: Bypass Surgery',
                      category: 'Medical History',
                      date: '2018',
                      previewSnippet: 'CABG Bypass Surgery in 2018; Satyam Surgical Center.',
                      targetTab: 'history',
                      targetElementId: 'evidence-history-bypass',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Bypass Surgery (2018)
                  </ClinicalEvidenceLink>
                  . Family history positive for coronary artery disease in father.
                </div>
              </div>

              {/* C. Medications & Allergies */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    C. Active Medications & Known Allergies
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEvidenceJump('history', 'evidence-history-medications', 'Medications')}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    Inspect Profile →
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed">
                  Active pharmacotherapy includes{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Medication: Metformin 500mg BD',
                      category: 'Medication',
                      date: 'Active Regimen',
                      previewSnippet: 'Metformin 500mg twice daily with meals for glycemic control.',
                      targetTab: 'history',
                      targetElementId: 'evidence-history-medications',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Metformin 500mg BD
                  </ClinicalEvidenceLink>
                  . Documented critical sensitivity to{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Drug Sensitivity: Penicillin',
                      category: 'Medical History',
                      date: 'Documented',
                      previewSnippet: 'Severe Urticaria & Pruritic Rash (Contraindicated).',
                      targetTab: 'history',
                      targetElementId: 'evidence-history-penicillin',
                      severityOrStatus: 'Severe Allergy',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Penicillin (Severe)
                  </ClinicalEvidenceLink>
                  .
                </div>
              </div>

              {/* D. Objective Findings & Vitals */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    D. Objective Findings & Vital Parameters
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEvidenceJump('vitals', 'evidence-vital-bp', 'Vitals Tab')}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    View All Vitals →
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed">
                  Recorded BP is{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Vital Sign: Blood Pressure',
                      category: 'Vital Sign',
                      date: patient.vitals?.recordedAt || 'Today',
                      previewSnippet: `BP: ${patient.vitals?.bpSystolic ?? 128}/${patient.vitals?.bpDiastolic ?? 84} mmHg.`,
                      targetTab: 'vitals',
                      targetElementId: 'evidence-vital-bp',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    {patient.vitals?.bpSystolic ?? 128}/{patient.vitals?.bpDiastolic ?? 84} mmHg
                  </ClinicalEvidenceLink>
                  , pulse{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Vital Sign: Pulse Rate',
                      category: 'Vital Sign',
                      date: 'Today',
                      previewSnippet: `Heart Rate: ${patient.vitals?.pulse ?? 78} bpm.`,
                      targetTab: 'vitals',
                      targetElementId: 'evidence-vital-pulse',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    {patient.vitals?.pulse ?? 78} bpm
                  </ClinicalEvidenceLink>
                  , SpO2{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Vital Sign: Oxygen Saturation',
                      category: 'Vital Sign',
                      date: 'Today',
                      previewSnippet: `SpO2: ${patient.vitals?.spo2 ?? 99}% on room air.`,
                      targetTab: 'vitals',
                      targetElementId: 'evidence-vital-spo2',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    {patient.vitals?.spo2 ?? 99}%
                  </ClinicalEvidenceLink>
                  , body temperature{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Vital Sign: Body Temperature',
                      category: 'Vital Sign',
                      date: 'Today',
                      previewSnippet: `Temperature: ${patient.vitals?.temperature ?? 98.4}°F.`,
                      targetTab: 'vitals',
                      targetElementId: 'evidence-vital-temp',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    {patient.vitals?.temperature ?? 98.4}°F
                  </ClinicalEvidenceLink>
                  , and BMI{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Anthropometry: BMI',
                      category: 'Vital Sign',
                      date: 'Today',
                      previewSnippet: `BMI: ${patient.bodyComposition?.bmi ?? 22.6} kg/m².`,
                      targetTab: 'vitals',
                      targetElementId: 'evidence-vital-bmi',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    {patient.bodyComposition?.bmi ?? 22.6} kg/m²
                  </ClinicalEvidenceLink>
                  .
                </div>
              </div>

              {/* E. Investigations & Longitudinal Findings */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    E. Diagnostic Investigations & Longitudinal Changes
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEvidenceJump('records', 'evidence-report-creatinine', 'Diagnostic Records')}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    Open Records →
                  </button>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed">
                  Latest laboratory workup demonstrates elevated{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Renal Function Test: Creatinine',
                      category: 'Lab Report',
                      date: '03 Jun 2026',
                      previewSnippet: 'Creatinine: 1.3 mg/dL (High, Reference 0.7 - 1.2 mg/dL).',
                      targetTab: 'records',
                      targetElementId: 'evidence-report-creatinine',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Creatinine 1.3 mg/dL
                  </ClinicalEvidenceLink>{' '}
                  and glycated{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Diabetes Panel: HbA1c',
                      category: 'Lab Report',
                      date: '03 Jun 2026',
                      previewSnippet: 'HbA1c: 7.8% (Sub-optimal glycemic control).',
                      targetTab: 'records',
                      targetElementId: 'evidence-report-hba1c',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    HbA1c 7.8%
                  </ClinicalEvidenceLink>
                  . Lipid panel confirms high atherogenic risk with{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Pathology Lab: Lipid Profile',
                      category: 'Lab Report',
                      date: '03 Jun 2026',
                      previewSnippet: 'Total Cholesterol 248 mg/dL, LDL 162 mg/dL.',
                      targetTab: 'records',
                      targetElementId: 'evidence-report-lipid',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    Total Cholesterol 248 mg/dL & LDL 162 mg/dL
                  </ClinicalEvidenceLink>
                  . Prior 12-lead ECG notes{' '}
                  <ClinicalEvidenceLink
                    source={{
                      title: 'Cardiology: Resting ECG',
                      category: 'Imaging / ECG',
                      date: '12 Jan 2025',
                      previewSnippet: 'ST-3 changes noted in inferior leads.',
                      targetTab: 'records',
                      targetElementId: 'evidence-report-tmt',
                    }}
                    onNavigate={handleEvidenceJump}
                  >
                    ST-3 changes
                  </ClinicalEvidenceLink>
                  .
                </div>
              </div>

              {/* F. Clinical Synthesis */}
              <div className="bg-teal-50/60 rounded-xl p-3 border border-teal-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block">
                  F. Clinical Synthesis
                </span>
                <p className="text-xs text-teal-950 font-medium leading-relaxed">
                  {presentation.clinical_synthesis}
                </p>
              </div>
            </div>

            {/* ===================================================== */}
            {/* RIGHT COLUMN: AI MEDICAL INSIGHTS (SEPARATED)         */}
            {/* ===================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Medical Insights & Decision Support
                </span>
                <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  AI Decision Support
                </span>
              </div>

              {/* Notice Banner */}
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-[11px] text-indigo-950 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  <strong>Decision Support:</strong> Click "Inspect Source" on any insight to navigate directly to its supporting diagnostic finding.
                </span>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                {insightCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveFilterCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                      activeFilterCategory === cat
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Insights' : cat}
                  </button>
                ))}
              </div>

              {/* Insights List */}
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredInsights.map((ins) => (
                  <div
                    key={ins.id}
                    className={`p-3 rounded-xl border transition-all bg-white shadow-2xs space-y-1.5 ${
                      ins.safetyAlert
                        ? 'border-rose-300 bg-rose-50/30'
                        : ins.priority === 'high'
                        ? 'border-amber-300/80'
                        : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                          {ins.category}
                        </span>
                        {ins.safetyAlert && (
                          <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Safety Alert
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded capitalize ${
                          ins.priority === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : ins.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ins.priority} Priority
                      </span>
                    </div>

                    <h5 className="font-extrabold text-slate-900 text-xs">
                      {ins.short_title}
                    </h5>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {ins.clinical_observation}
                    </p>

                    <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                      <p>
                        <strong className="text-slate-700">Evidence:</strong> {ins.supporting_evidence}
                      </p>
                      <p>
                        <strong className="text-slate-700">Relevance:</strong> {ins.clinical_relevance}
                      </p>
                    </div>

                    {ins.source_references && ins.source_references.length > 0 && (
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span className="truncate">Source: {ins.source_references.join(', ')}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (ins.category === 'Longitudinal trends') {
                              handleEvidenceJump('trends', 'evidence-trends-container', ins.short_title);
                            } else if (ins.category.includes('Medication')) {
                              handleEvidenceJump('history', 'evidence-history-medications', ins.short_title);
                            } else if (ins.category.includes('Significant')) {
                              handleEvidenceJump('records', 'evidence-report-creatinine', ins.short_title);
                            } else {
                              handleEvidenceJump('overview', 'evidence-overview-symptoms', ins.short_title);
                            }
                          }}
                          className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-0.5 cursor-pointer shrink-0 ml-2"
                        >
                          <span>Inspect Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LEVEL 3: CLINICAL EVIDENCE TRACEABILITY STRIP             */}
          {/* ========================================================= */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                Level 3 Clinical Evidence Traceability (Direct Deep-Link Jump Strip)
              </span>
              <span className="text-[10px] text-slate-400">
                Click any evidence source to jump directly into the source tab with pulsating highlight
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {presentation.source_references.map((src) => {
                const targetTab = src.targetTab === 'medical-history' ? 'history' : src.targetTab;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => handleEvidenceJump(targetTab, src.targetId, src.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-3xs"
                    title={`Jump to ${src.title} in ${src.targetTab}`}
                  >
                    <Activity className="w-3 h-3 text-teal-600" />
                    <span>{src.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({src.date})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
