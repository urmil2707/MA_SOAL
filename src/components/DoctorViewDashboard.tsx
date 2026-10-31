import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Activity,
  Calendar,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MessageSquare,
  Highlighter,
  Crop,
  Sparkles,
  Layers,
  Heart,
  Eye,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Patient, DoctorViewFlaggedItem } from '../types';

interface DoctorViewDashboardProps {
  patient: Patient;
  onUpdateFlaggedOrder?: (reorderedList: DoctorViewFlaggedItem[]) => void;
}

export const DoctorViewDashboard: React.FC<DoctorViewDashboardProps> = ({
  patient,
  onUpdateFlaggedOrder,
}) => {
  // Reorderable Flagged Reports & MA Observations
  const [flaggedItems, setFlaggedItems] = useState<DoctorViewFlaggedItem[]>([
    {
      id: 'flag-1',
      title: 'Lipid Profile',
      category: 'Laboratory',
      date: '03 Jun 2026',
      status: 'High LDL (162 mg/dL)',
      severity: 'Critical',
      orderRank: 1,
      details: 'Elevated atherogenic dyslipidemia; TC/HDL ratio 6.5.',
    },
    {
      id: 'flag-2',
      title: 'HbA1c Glycated Hemoglobin',
      category: 'Laboratory',
      date: '03 Jun 2026',
      status: '7.8% (High)',
      severity: 'High',
      orderRank: 2,
      details: 'Sub-optimal glycemic control on current Metformin dose.',
    },
    {
      id: 'flag-3',
      title: 'Treadmill Stress Test (TMT)',
      category: 'Cardiology',
      date: '12 Jan 2025',
      status: 'Abnormal',
      severity: 'High',
      orderRank: 3,
      details: 'ST depression in inferior leads at Stage 3 protocol.',
    },
    {
      id: 'flag-4',
      title: '12-Lead Resting ECG',
      category: 'Cardiology',
      date: '12 Jan 2025',
      status: 'ST-3 changes',
      severity: 'Abnormal',
      orderRank: 4,
      details: 'Repolarization abnormalities without acute STEMI.',
    },
    {
      id: 'flag-5',
      title: 'Chest X-Ray (PA View)',
      category: 'Radiology',
      date: '28 Dec 2024',
      status: 'For review',
      severity: 'Review',
      orderRank: 5,
      details: 'Mild cardiomegaly (CTR 0.52); clear bilateral lung fields.',
    },
    {
      id: 'flag-6',
      title: 'Previous Consultation Note',
      category: 'Clinical',
      date: '10 Nov 2024',
      status: 'Dr. S. Menon',
      severity: 'Normal',
      orderRank: 6,
      details: 'Follow-up for chest tightness on exertion.',
    },
    {
      id: 'flag-7',
      title: 'Hospital Discharge Summary',
      category: 'Inpatient',
      date: '09 Oct 2024',
      status: 'City Hospital',
      severity: 'Normal',
      orderRank: 7,
      details: 'Post-PTCA observation summary.',
    },
  ]);

  // Selected Active Report in Document Viewer
  const [selectedReportId, setSelectedReportId] = useState<string>('flag-1');
  const [activeReportTab, setActiveReportTab] = useState<'text' | 'scan'>('text');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Chief Complaint carousel index
  const [complaintIndex, setComplaintIndex] = useState<number>(0);
  const complaints = [
    {
      title: 'Exertional chest pain',
      painScale: '7/10',
      duration: 'For 2 weeks · relieved by rest',
      trigger: 'On climbing stairs or brisk walking',
    },
    {
      title: 'Rapid breathing during rest',
      painScale: '4/10',
      duration: 'For 4 days · worse post-dinner',
      trigger: 'Lying supine at bedtime',
    },
    {
      title: 'Occasional mild palpitations',
      painScale: '3/10',
      duration: 'Intermittent episodes (10-15 mins)',
      trigger: 'After morning coffee',
    },
  ];

  // Present Condition Index
  const [conditionIndex, setConditionIndex] = useState<number>(0);
  const conditions = [
    { name: 'Diabetes Mellitus (2018)', duration: 'Since 10 YEARS', status: 'UNDER CONTROL', color: 'emerald' },
    { name: 'Primary Hypertension (2020)', duration: 'Since 6 YEARS', status: 'UNDER CONTROL', color: 'blue' },
    { name: 'Coronary Artery Disease (2018)', duration: 'Post-PTCA 2018', status: 'MONITORED', color: 'amber' },
    { name: 'Dyslipidemia (2024)', duration: 'Active', status: 'ELEVATED LDL', color: 'rose' },
  ];

  // Move item up
  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const updated = [...flaggedItems];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setFlaggedItems(updated);
    onUpdateFlaggedOrder?.(updated);
  };

  // Move item down
  const moveItemDown = (index: number) => {
    if (index === flaggedItems.length - 1) return;
    const updated = [...flaggedItems];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setFlaggedItems(updated);
    onUpdateFlaggedOrder?.(updated);
  };

  const currentComplaint = complaints[complaintIndex] || complaints[0];
  const currentCondition = conditions[conditionIndex] || conditions[0];

  return (
    <div className="space-y-4 text-slate-800">
      {/* Top Bar for Medical Assistant Notice & Reorder Instructions */}
      <div className="p-3.5 bg-gradient-to-r from-blue-900 to-[#1e3a6a] text-white rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm">Doctor's Clinical Consultation View</h3>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                MA Priority Arranger
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Arrange flagged reports and observations in priority order for Dr. {patient.doctorName || 'Ramesh Sharma'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-200 hidden sm:inline">Use ↑ ↓ buttons to sequence items for doctor</span>
          <button
            type="button"
            onClick={() => {
              // reset order
              setFlaggedItems([...flaggedItems].sort((a, b) => a.orderRank - b.orderRank));
            }}
            className="flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Default Order</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TOP SECTION: VITALS & DEMOGRAPHICS STRIP (Matching Image)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {/* Card 1: BMI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">BMI</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Normal
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">22.6</div>
          <div className="mt-1 text-[10px] text-slate-500 font-semibold truncate">
            • Diabetes (2018) • HTN • Bypass
          </div>
        </div>

        {/* Card 2: Blood Pressure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">Blood Pressure</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            128/84 <span className="text-[10px] font-normal text-slate-400">mmHg</span>
          </div>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 self-start">
            Elevated
          </span>
        </div>

        {/* Card 3: Heart Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">Heart Rate</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            78 <span className="text-[10px] font-normal text-slate-400">bpm</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 self-start">
            Normal
          </span>
        </div>

        {/* Card 4: SpO2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">SpO2</span>
            <span className="text-[10px] font-bold text-emerald-700">Room Air</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">98%</div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 self-start">
            Normal
          </span>
        </div>

        {/* Card 5: Temperature */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase">Temperature</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            98.4<span className="text-xs font-normal text-slate-400">°F</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 self-start">
            Normal
          </span>
        </div>

        {/* Card 6: Allergies Box */}
        <div className="bg-white rounded-2xl border border-rose-200 p-3 shadow-2xs flex flex-col justify-between bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-rose-900 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Allergies
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
              2 Active
            </span>
          </div>
          <div className="space-y-1 mt-1">
            <div className="text-xs font-extrabold text-rose-950 flex items-center justify-between">
              <span>Penicillin</span>
              <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded">Severe</span>
            </div>
            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>Dust allergy</span>
              <span className="text-[9px] text-slate-500">Under control</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3-COLUMN MAIN DOCTOR DASHBOARD (Matching Image Layout)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ------------------------------------------------------ */}
        {/* LEFT COLUMN (3/12): Chief Complaints & MA Observations */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Top Card: Chief Complaints */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <h4 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">Chief Complaints</h4>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Total {complaints.length}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
              <span>{patient.age} YO • {patient.gender} • 77 kgs</span>
              <span>Patient since 2022</span>
            </div>

            {/* Active Complaint Box */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900">{currentComplaint.title}</span>
                <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  PAIN SCALE: {currentComplaint.painScale}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic">"{currentComplaint.duration}"</p>
              <div className="text-[10px] text-slate-500 font-medium">Trigger: {currentComplaint.trigger}</div>
            </div>

            {/* Carousel navigation */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-500">
                Complaint {complaintIndex + 1} of {complaints.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setComplaintIndex((prev) => (prev > 0 ? prev - 1 : complaints.length - 1))}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setComplaintIndex((prev) => (prev < complaints.length - 1 ? prev + 1 : 0))}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Card: MA Observations & Reorderable Flagged Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                  MA Observations & Flagged
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {flaggedItems.length} Items
              </span>
            </div>

            {/* Observation Note */}
            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-medium">
              "Patient mentioned chest pain increases during incline walking. Please review old ECG and TMT reports."
            </div>

            {/* Reorderable List for MA */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Doctor Review Priority (Reorder with ↑ ↓)
              </span>

              {flaggedItems.map((item, idx) => {
                const isSelected = selectedReportId === item.id;
                return (
                  <div
                    key={item.id}
                    id={item.id.includes('1') ? 'evidence-doctorview-lipid' : item.id.includes('2') ? 'evidence-doctorview-hba1c' : item.id.includes('3') ? 'evidence-doctorview-tmt' : `doctor-view-item-${item.id}`}
                    onClick={() => setSelectedReportId(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#2f5597] shadow-xs ring-1 ring-[#2f5597]/20'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="font-extrabold text-xs text-slate-900 truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="font-bold text-rose-700">{item.status}</span>
                      </div>
                    </div>

                    {/* MA Priority Sorting Controls */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => moveItemUp(idx)}
                        disabled={idx === 0}
                        title="Move Up in Doctor Priority"
                        className="w-5 h-5 rounded hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItemDown(idx)}
                        disabled={idx === flaggedItems.length - 1}
                        title="Move Down in Doctor Priority"
                        className="w-5 h-5 rounded hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* CENTER MAIN (6/12): Clinical Report Document Viewer    */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          {/* Report Viewer Toolbar (Matching Image) */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#2f5597]" />
                <span>PATHOLOGY LAB</span>
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Lipid Profile
              </span>
            </div>

            {/* View controls */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveReportTab('text')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    activeReportTab === 'text' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  Text View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('scan')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    activeReportTab === 'scan' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  Scan View
                </button>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-500">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Sheet (Accredited Multi-specialty Pathology Lab) */}
          <div
            className="p-5 rounded-xl border border-slate-300 bg-slate-50/40 shadow-xs space-y-4"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Lab Header */}
            <div className="text-center pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-sm tracking-wide">City Diagnostics Laboratory</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Accredited Multi-specialty Pathology Lab · ISO 15189 Certified
              </p>
            </div>

            {/* Patient & Report Metadata */}
            <div className="grid grid-cols-2 text-xs text-slate-700 pb-2 border-b border-slate-200/80 gap-2 font-medium">
              <div>
                <span className="text-slate-400 text-[10px] block">Test:</span>
                <span className="font-extrabold text-slate-900">Lipid Profile (Comprehensive)</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Date of Collection:</span>
                <span className="font-mono font-bold">03 Jun 2026, 08:30 AM</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Lab ID:</span>
                <span className="font-mono">CD2806/2026/897</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Patient:</span>
                <span className="font-bold">{patient.name} ({patient.age}Y • {patient.gender})</span>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Test</th>
                    <th className="p-2">Result</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Ref. Range</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="bg-rose-50/30">
                    <td className="p-2 font-bold text-slate-900">Total Cholesterol</td>
                    <td className="p-2 font-mono font-black text-rose-700">248</td>
                    <td className="p-2 text-slate-500 text-[10px]">mg/dL</td>
                    <td className="p-2 text-slate-500">&lt; 200</td>
                    <td className="p-2"><span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">High</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Triglycerides</td>
                    <td className="p-2 font-mono font-bold text-amber-700">162</td>
                    <td className="p-2 text-slate-500 text-[10px]">mg/dL</td>
                    <td className="p-2 text-slate-500">&lt; 150</td>
                    <td className="p-2"><span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Borderline High</span></td>
                  </tr>
                  <tr className="bg-rose-50/50">
                    <td className="p-2 font-bold text-slate-900">LDL Cholesterol</td>
                    <td className="p-2 font-mono font-black text-rose-700">162</td>
                    <td className="p-2 text-slate-500 text-[10px]">mg/dL</td>
                    <td className="p-2 text-slate-500">&lt; 100</td>
                    <td className="p-2"><span className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.2 rounded animate-pulse">High</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900">HDL Cholesterol (Calc.)</td>
                    <td className="p-2 font-mono font-bold text-amber-700">42</td>
                    <td className="p-2 text-slate-500 text-[10px]">mg/dL</td>
                    <td className="p-2 text-slate-500">40 - 60</td>
                    <td className="p-2"><span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Low</span></td>
                  </tr>
                  <tr className="bg-rose-50/30">
                    <td className="p-2 font-bold text-slate-900">Non-HDL Cholesterol</td>
                    <td className="p-2 font-mono font-black text-rose-700">206</td>
                    <td className="p-2 text-slate-500 text-[10px]">mg/dL</td>
                    <td className="p-2 text-slate-500">&lt; 130</td>
                    <td className="p-2"><span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">High</span></td>
                  </tr>
                  <tr className="bg-rose-50/40">
                    <td className="p-2 font-bold text-slate-900">TC / HDL Ratio</td>
                    <td className="p-2 font-mono font-black text-rose-700">6.5</td>
                    <td className="p-2 text-slate-500 text-[10px]">Ratio</td>
                    <td className="p-2 text-slate-500">&lt; 4.5</td>
                    <td className="p-2"><span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">High</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sign-off */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
              <span className="font-semibold italic">Report verified electronically</span>
              <div className="text-right">
                <span className="font-black text-slate-900 block">Dr. Meera Nair</span>
                <span className="text-[10px] text-slate-400">MD (Pathology) · Reg #54219</span>
              </div>
            </div>
          </div>

          {/* Action Filmstrip & Annotations Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" /> Add Comment
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Highlighter className="w-3 h-3 text-amber-600" /> Highlight
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Crop className="w-3 h-3" /> Crop
              </button>
            </div>

            <span className="text-xs font-bold text-[#2f5597] hover:underline cursor-pointer">
              View Full Timeline →
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* RIGHT COLUMN (3/12): Present Condition & AI Analysis   */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Top Card: Present Condition */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Present Condition</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {conditionIndex + 1} of {conditions.length}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-black text-xs text-slate-900">{currentCondition.name}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{currentCondition.duration}</span>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  {currentCondition.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-slate-400">Switch condition:</span>
              <div className="flex items-center gap-1">
                {conditions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setConditionIndex(i)}
                    className={`w-5 h-5 rounded-md text-[10px] font-bold cursor-pointer ${
                      conditionIndex === i ? 'bg-[#2f5597] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Card: AI Analysis / Clinical Synthesis (Matching Image) */}
          <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-2xs space-y-3 bg-blue-50/20">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="font-black text-xs text-blue-950 uppercase tracking-wider">AI Clinical Analysis</h4>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">
                Lipid Profile
              </span>
            </div>

            {/* Key Findings */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Key Findings:</span>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span><strong>LDL Cholesterol is high (162 mg/dL)</strong>, target is &lt;100.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>Non-HDL Cholesterol is elevated at 206 mg/dL.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>HDL Cholesterol is low (42 mg/dL).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span>TC/HDL ratio (6.5) indicates elevated cardiovascular risk profile.</span>
                </li>
              </ul>
            </div>

            {/* Trend (last 4 reports) Mini Table */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Biomarker Trend Matrix:
              </span>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-1.5">Date</th>
                      <th className="p-1.5">LDL</th>
                      <th className="p-1.5">HbA1c</th>
                      <th className="p-1.5">Creat.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="bg-rose-50/40 font-bold">
                      <td className="p-1.5">03 Jun 26</td>
                      <td className="p-1.5 text-rose-700">162</td>
                      <td className="p-1.5 text-rose-700">7.8</td>
                      <td className="p-1.5">1.3</td>
                    </tr>
                    <tr>
                      <td className="p-1.5">10 Nov 25</td>
                      <td className="p-1.5">145</td>
                      <td className="p-1.5">7.2</td>
                      <td className="p-1.5">1.1</td>
                    </tr>
                    <tr>
                      <td className="p-1.5">10 Nov 24</td>
                      <td className="p-1.5">138</td>
                      <td className="p-1.5">6.8</td>
                      <td className="p-1.5">1.0</td>
                    </tr>
                    <tr>
                      <td className="p-1.5">12 Jun 24</td>
                      <td className="p-1.5">132</td>
                      <td className="p-1.5">6.5</td>
                      <td className="p-1.5">0.9</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Interpretation */}
            <div className="p-2.5 bg-blue-100/70 rounded-xl border border-blue-200 text-[11px] text-blue-950 leading-relaxed font-medium">
              <span className="font-extrabold block mb-0.5">Clinical Synthesis:</span>
              "Patient presents with mixed dyslipidemia and sub-optimal glycemic control. Recommend uptitration of Atorvastatin to 40mg and endocrinology dietary consult."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
