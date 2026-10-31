import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { PatientUploadedRecord, RecordCategory } from '../types';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (record: PatientUploadedRecord) => void;
  patientName: string;
  doctorName?: string;
  specialty?: string;
}

export const UploadRecordModal: React.FC<UploadRecordModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  patientName,
  doctorName = 'Dr. Amit Patel',
  specialty = 'General Medicine',
}) => {
  const [title, setTitle] = useState(
    'Comprehensive Lipid & Metabolic Laboratory Panel'
  );
  const [category, setCategory] = useState<RecordCategory>('BLOOD REPORTS');
  // Extracted document / scan date (defaults to 10 Oct 2026 to showcase the requirement)
  const [scanDate, setScanDate] = useState('2026-10-10');
  // Upload date / shared date (defaults to 15 Oct 2026 to showcase the requirement)
  const [uploadedAt, setUploadedAt] = useState('2026-10-15T14:30:00.000Z');
  const [sourceOrClinic, setSourceOrClinic] = useState(
    'Soltech Core Diagnostic Pathology'
  );
  const [doctorOrOrderedBy, setDoctorOrOrderedBy] = useState(doctorName);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'prescription' | 'dicom'>('pdf');
  const [isCritical, setIsCritical] = useState(false);
  const [criticalSummary, setCriticalSummary] = useState('');
  const [highlights, setHighlights] = useState<string[]>([
    'Total Cholesterol: 198 mg/dL (Desirable <200)',
    'HbA1c: 5.6% (Normal glycemic control)',
    'Triglycerides: 142 mg/dL (Normal)',
  ]);
  const [newHighlight, setNewHighlight] = useState('');
  const [notes, setNotes] = useState(
    'Specimen collected 10 Oct; external lab report shared & uploaded into clinic system on 15th Oct.'
  );

  if (!isOpen) return null;

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlight.trim()) return;
    setHighlights([...highlights, newHighlight.trim()]);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecord: PatientUploadedRecord = {
      id: `rec-${Date.now()}`,
      title: title.trim(),
      category,
      scanDate: scanDate || '2026-10-10',
      uploadedAt: uploadedAt || new Date().toISOString(),
      sourceOrClinic: sourceOrClinic.trim() || 'Soltech Diagnostic Lab',
      doctorOrOrderedBy: doctorOrOrderedBy.trim() || doctorName,
      fileType,
      fileSize: '1.8 MB',
      isCritical,
      criticalSummary: isCritical ? criticalSummary : undefined,
      importantHighlights: highlights,
      notes: notes.trim(),
      uploadedBy: 'Receptionist (Front Desk)',
    };

    onUpload(newRecord);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Upload Diagnostic Record
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Patient: <strong className="text-slate-800">{patientName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs scrollbar-thin">
          {/* Document Title */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Document / Record Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Comprehensive Lipid & Metabolic Laboratory Panel"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category & File Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Record Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecordCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="BLOOD REPORTS">BLOOD REPORTS</option>
                <option value="RADIOLOGY">RADIOLOGY</option>
                <option value="SONOGRAPHY">SONOGRAPHY</option>
                <option value="PRESCRIPTION">PRESCRIPTION</option>
                <option value="SUGGESTIONS">SUGGESTIONS</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Format
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="pdf">PDF Report</option>
                <option value="image">DICOM / Image</option>
                <option value="prescription">Prescription</option>
              </select>
            </div>
          </div>

          {/* Dual Date Section: Document Date (Extracted for Timeline) vs Uploaded Date */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>Timeline Date Extraction & Upload Timestamp</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  1. Extracted Document Date *
                </label>
                <input
                  type="date"
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg font-mono font-bold text-slate-900 text-xs"
                  required
                />
                <span className="text-[9px] text-blue-700 block mt-0.5 leading-tight">
                  Extracted date shown on Patient's Timeline (e.g. 10 Oct)
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  2. Uploaded / Shared Date *
                </label>
                <input
                  type="date"
                  value={uploadedAt.split('T')[0]}
                  onChange={(e) =>
                    setUploadedAt(`${e.target.value}T14:30:00.000Z`)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg font-mono font-bold text-slate-900 text-xs"
                  required
                />
                <span className="text-[9px] text-blue-700 block mt-0.5 leading-tight">
                  Shown when clicked as "Uploaded on 15th October"
                </span>
              </div>
            </div>
          </div>

          {/* Source & Ordering Doctor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Source / Clinic Lab
              </label>
              <input
                type="text"
                value={sourceOrClinic}
                onChange={(e) => setSourceOrClinic(e.target.value)}
                placeholder="Diagnostic Clinic Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Ordering Doctor
              </label>
              <input
                type="text"
                value={doctorOrOrderedBy}
                onChange={(e) => setDoctorOrOrderedBy(e.target.value)}
                placeholder="Doctor Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Key Findings Highlights */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Test Findings & Highlights
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {highlights.map((hl, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md"
                >
                  <span>{hl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(i)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="e.g. HbA1c: 5.6%, eGFR: >90 mL/min"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl border border-blue-200 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Critical Flag */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="font-bold text-slate-800 text-xs">
                Mark as Critical / Priority Alert (Requires immediate review)
              </span>
            </label>

            {isCritical && (
              <input
                type="text"
                value={criticalSummary}
                onChange={(e) => setCriticalSummary(e.target.value)}
                placeholder="Critical finding summary (e.g. Severe Troponin Elevation)..."
                className="w-full px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 font-bold text-xs"
              />
            )}
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Receptionist Intake Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private scan remarks or notes..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-[#2f5597] hover:bg-[#254680] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-blue-200" />
              <span>Confirm & Upload Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
