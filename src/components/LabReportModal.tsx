import React, { useState } from 'react';
import {
  X,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Download,
  Printer,
  ShieldCheck,
  User,
  FlaskConical,
  Stethoscope,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Patient, InvestigationItem, LabReportAlert } from '../types';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  mode: 'view' | 'upload';
  initialInvestigation?: InvestigationItem | null;
  onUploadReport: (
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
  ) => void;
  onAcknowledgeAlert?: (patientId: string) => void;
  onSendBackToDoctor?: (patientId: string) => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'Complete Blood Count (CBC)',
    department: 'Laboratory' as const,
    summary: 'Normocytic, normochromic RBCs. Adequate platelets and normal WBC count.',
    verifiedBy: 'Dr. Suresh Ramanathan, MD (Pathology)',
    findings: [
      { parameter: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'Normal' as const },
      { parameter: 'Total Leukocyte Count (WBC)', value: '7,400', unit: '/µL', normalRange: '4,000 - 11,000', status: 'Normal' as const },
      { parameter: 'Platelet Count', value: '280,000', unit: '/µL', normalRange: '150,000 - 450,000', status: 'Normal' as const },
      { parameter: 'Hematocrit (PCV)', value: '41.2', unit: '%', normalRange: '40.0 - 50.0', status: 'Normal' as const },
      { parameter: 'ESR (1st Hour)', value: '12', unit: 'mm/hr', normalRange: '0 - 15', status: 'Normal' as const },
    ],
  },
  {
    name: 'Lipid Profile Comprehensive',
    department: 'Pathology' as const,
    summary: 'Mildly elevated total cholesterol and borderline LDL. Dietary lifestyle modification recommended.',
    verifiedBy: 'Dr. Ananya Iyer, MD (Biochemistry)',
    findings: [
      { parameter: 'Total Cholesterol', value: '218', unit: 'mg/dL', normalRange: '< 200', status: 'High' as const },
      { parameter: 'HDL Cholesterol (Good)', value: '44', unit: 'mg/dL', normalRange: '> 40', status: 'Normal' as const },
      { parameter: 'LDL Cholesterol (Calculated)', value: '138', unit: 'mg/dL', normalRange: '< 100', status: 'High' as const },
      { parameter: 'Triglycerides', value: '162', unit: 'mg/dL', normalRange: '< 150', status: 'High' as const },
      { parameter: 'VLDL Cholesterol', value: '32', unit: 'mg/dL', normalRange: '< 30', status: 'Normal' as const },
    ],
  },
  {
    name: '12-Lead Electrocardiogram (ECG)',
    department: 'Radiology' as const,
    summary: 'Normal Sinus Rhythm at 74 bpm. Normal PR and QRS intervals. No ischemic ST-T abnormalities.',
    verifiedBy: 'Dr. Rajesh Verma, MD (Cardiology)',
    findings: [
      { parameter: 'Ventricular Rate', value: '74', unit: 'bpm', normalRange: '60 - 100', status: 'Normal' as const },
      { parameter: 'PR Interval', value: '156', unit: 'ms', normalRange: '120 - 200', status: 'Normal' as const },
      { parameter: 'QRS Duration', value: '88', unit: 'ms', normalRange: '80 - 120', status: 'Normal' as const },
      { parameter: 'QT / QTc Interval', value: '390 / 424', unit: 'ms', normalRange: '< 450', status: 'Normal' as const },
      { parameter: 'P-R-T Axis', value: '54 / 62 / 48', unit: 'deg', normalRange: '-30 to +90', status: 'Normal' as const },
    ],
  },
  {
    name: 'Fasting Plasma Glucose & HbA1c',
    department: 'Laboratory' as const,
    summary: 'Fasting glucose and glycosylated hemoglobin in impaired pre-diabetic glycemic range.',
    verifiedBy: 'Dr. Suresh Ramanathan, MD (Pathology)',
    findings: [
      { parameter: 'Fasting Blood Sugar (FBS)', value: '116', unit: 'mg/dL', normalRange: '70 - 99', status: 'High' as const },
      { parameter: 'HbA1c (Glycosylated Hb)', value: '6.2', unit: '%', normalRange: '< 5.7', status: 'High' as const },
      { parameter: 'Estimated Avg Glucose (eAG)', value: '131', unit: 'mg/dL', normalRange: '< 117', status: 'High' as const },
    ],
  },
];

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  mode,
  initialInvestigation,
  onUploadReport,
  onAcknowledgeAlert,
  onSendBackToDoctor,
}) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customReportName, setCustomReportName] = useState('');
  const [customSummary, setCustomSummary] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  // Find the primary or latest alert for this patient
  const latestAlert = patient.labReportAlerts?.[0];
  const activeTemplate = PRESET_TEMPLATES[selectedTemplateIndex];

  const handleApplyPreset = (index: number) => {
    setSelectedTemplateIndex(index);
    setCustomReportName(PRESET_TEMPLATES[index].name);
    setCustomSummary(PRESET_TEMPLATES[index].summary);
    setUploadedFileName(`${PRESET_TEMPLATES[index].name.toLowerCase().replace(/\s+/g, '_')}_verified.pdf`);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      if (!customReportName) {
        setCustomReportName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      if (!customReportName) {
        setCustomReportName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reportName = customReportName.trim() || activeTemplate.name;
    const summary = customSummary.trim() || activeTemplate.summary;

    onUploadReport(patient.id, {
      investigationId: initialInvestigation?.id,
      reportName,
      department: activeTemplate.department,
      summary,
      findings: activeTemplate.findings,
      verifiedBy: activeTemplate.verifiedBy,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white/85 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-3xl overflow-hidden flex flex-col max-h-[720px] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/70 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shadow-2xs border border-blue-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base tracking-tight">
                  {mode === 'view' ? 'Laboratory Report Details' : 'Upload Laboratory Report'}
                </h3>
                {patient.hasNewReportAlert && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300/80 text-[11px] font-bold animate-pulse shadow-2xs">
                    <BellRing className="w-3 h-3 text-amber-600 animate-bounce" />
                    <span>Real-Time Alert Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.name} ({patient.patientNumber}) • Attending: {patient.doctorName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ============================================================== */}
          {/* MODE: VIEW UPLOADED REPORT & NOTIFICATION ALERT                 */}
          {/* ============================================================== */}
          {mode === 'view' && (
            <div className="space-y-4">
              {/* Subtle Alert Notification Strip */}
              {patient.hasNewReportAlert && (
                <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 shrink-0">
                      <BellRing className="w-5 h-5 text-amber-700 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        New Diagnostic Report Arrived
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Uploaded by pathology laboratory. The patient's card displays an active ringing alert.
                      </p>
                    </div>
                  </div>

                  {onAcknowledgeAlert && (
                    <button
                      type="button"
                      onClick={() => {
                        onAcknowledgeAlert(patient.id);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all shrink-0"
                    >
                      Acknowledge & Dismiss Bell
                    </button>
                  )}
                </div>
              )}

              {/* Report Header Card in Bento Style */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {latestAlert?.department || initialInvestigation?.department || 'Laboratory'}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1">
                      {latestAlert?.reportName || initialInvestigation?.uploadedReportName || initialInvestigation?.name || 'Complete Blood Count (CBC)'}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Report Status</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified & Uploaded
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Ordered By</span>
                    <span className="font-semibold text-slate-800">{patient.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Specimen</span>
                    <span className="font-semibold text-slate-800">Venous Whole Blood (EDTA)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Reported At</span>
                    <span className="font-semibold text-slate-800">{latestAlert?.uploadedTimeDisplay || 'Just now'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Pathologist</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {latestAlert?.verifiedBy || 'Dr. Suresh Ramanathan, MD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Test Findings Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Diagnostic Parameters & Reference Intervals</span>
                  <span className="text-[11px] text-slate-500 font-medium">Standard Clinical Units</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-12 px-4 py-2 bg-slate-50/60 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    <div className="col-span-5">Investigation Parameter</div>
                    <div className="col-span-2 text-right">Result</div>
                    <div className="col-span-2 pl-2">Units</div>
                    <div className="col-span-3 text-right">Biological Reference</div>
                  </div>

                  {(latestAlert?.findings || activeTemplate.findings).map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="col-span-5 font-semibold text-slate-800">
                        {item.parameter}
                      </div>
                      <div className="col-span-2 text-right font-extrabold text-slate-900">
                        <span
                          className={
                            item.status === 'High'
                              ? 'text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold'
                              : item.status === 'Low'
                              ? 'text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold'
                              : 'text-slate-800'
                          }
                        >
                          {item.value}
                        </span>
                      </div>
                      <div className="col-span-2 pl-2 text-slate-500 text-[11px] font-medium">
                        {item.unit}
                      </div>
                      <div className="col-span-3 text-right text-slate-600 font-medium text-[11px]">
                        {item.normalRange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathologist Clinical Impression */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1.5 text-xs">
                <span className="font-bold text-slate-800 text-[11px] block">Pathologist Clinical Interpretation:</span>
                <p className="text-slate-600 leading-relaxed">
                  {latestAlert?.summary || activeTemplate.summary}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-200/60 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Digitally verified by Central NABL-accredited diagnostic laboratory</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading verified lab report for ${patient.name}...`)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Report</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {patient.status === 'HOLD ON' && onSendBackToDoctor && (
                    <button
                      type="button"
                      onClick={() => {
                        onSendBackToDoctor(patient.id);
                        onClose();
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
                    >
                      <span>Forward to Doctor Review</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE: UPLOAD NEW LABORATORY REPORT                             */}
          {/* ============================================================== */}
          {mode === 'upload' && (
            <form onSubmit={handleSubmitUpload} className="space-y-4">
              {/* Quick Template Presets for Instant Testing */}
              <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-100/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Quick Diagnostic Presets (1-Click Fill)
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold">Pre-verified test data</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => handleApplyPreset(idx)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        selectedTemplateIndex === idx
                          ? 'bg-white border-blue-400 text-blue-900 shadow-xs font-semibold'
                          : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="font-bold truncate">{tmpl.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tmpl.department} • {tmpl.findings.length} Parameters</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag and Drop File Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800">
                  {uploadedFileName ? (
                    <span className="text-emerald-700 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Attached: {uploadedFileName}
                    </span>
                  ) : (
                    'Drag & drop verified laboratory report file here'
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Supports PDF, PNG, JPG, DICOM (Max 25 MB)</p>

                <div className="mt-3">
                  <label className="inline-block px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs">
                    Browse File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                  </label>
                </div>
              </div>

              {/* Report Name & Clinical Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnostic Report Title</label>
                  <input
                    type="text"
                    value={customReportName || activeTemplate.name}
                    onChange={(e) => setCustomReportName(e.target.value)}
                    required
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Verification Pathologist</label>
                  <input
                    type="text"
                    value={activeTemplate.verifiedBy}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">Clinical Impression / Summary</label>
                <textarea
                  rows={2}
                  value={customSummary || activeTemplate.summary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  placeholder="Clinical observation, notes, or findings..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium resize-none"
                />
              </div>

              {/* Real-time Alert Explanation Notice */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <BellRing className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Instant Alert Broadcast:</strong> Upon upload, a real-time ringing bell icon alert will trigger on <strong className="font-bold text-amber-950">{patient.name}'s card</strong> across the dashboard with a notification chime for the receptionist.
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Send Visual Alert</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
