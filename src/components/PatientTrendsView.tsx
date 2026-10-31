import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  FlaskConical,
  ScanLine,
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Patient, InvestigationItem } from '../types';

interface PatientTrendsViewProps {
  patient: Patient;
  investigations?: InvestigationItem[];
}

export const PatientTrendsView: React.FC<PatientTrendsViewProps> = ({
  patient,
  investigations = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<'lipids' | 'glycemic' | 'renal' | 'vitals' | 'radiology'>('lipids');

  // Trend Data Sets
  const lipidTrendData = [
    { date: '12 Jun 2024', ldl: 132, hdl: 48, triglycerides: 142, tcHdlRatio: 4.2 },
    { date: '10 Nov 2024', ldl: 138, hdl: 46, triglycerides: 148, tcHdlRatio: 4.6 },
    { date: '10 Nov 2025', ldl: 145, hdl: 44, triglycerides: 154, tcHdlRatio: 5.1 },
    { date: '03 Jun 2026', ldl: 162, hdl: 42, triglycerides: 162, tcHdlRatio: 6.5 },
    { date: '04 Sep 2026', ldl: 158, hdl: 43, triglycerides: 159, tcHdlRatio: 6.1 },
  ];

  const glycemicTrendData = [
    { date: '12 Jun 2024', hba1c: 6.5, fastingSugar: 110, postMealSugar: 148 },
    { date: '10 Nov 2024', hba1c: 6.8, fastingSugar: 118, postMealSugar: 156 },
    { date: '10 Nov 2025', hba1c: 7.2, fastingSugar: 126, postMealSugar: 172 },
    { date: '03 Jun 2026', hba1c: 7.8, fastingSugar: 138, postMealSugar: 188 },
    { date: '04 Sep 2026', hba1c: 7.5, fastingSugar: 132, postMealSugar: 180 },
  ];

  const renalTrendData = [
    { date: '12 Jun 2024', creatinine: 0.9, egfr: 94, bun: 14 },
    { date: '10 Nov 2024', creatinine: 1.0, egfr: 90, bun: 16 },
    { date: '10 Nov 2025', creatinine: 1.1, egfr: 85, bun: 18 },
    { date: '03 Jun 2026', creatinine: 1.3, egfr: 72, bun: 22 },
    { date: '04 Sep 2026', creatinine: 1.25, egfr: 74, bun: 21 },
  ];

  const vitalsTrendData = [
    { date: '12 Jun 2024', bpSys: 124, bpDia: 80, pulse: 74, weight: 75.0, bmi: 21.6 },
    { date: '10 Nov 2024', bpSys: 126, bpDia: 82, pulse: 76, weight: 76.5, bmi: 22.0 },
    { date: '10 Nov 2025', bpSys: 130, bpDia: 84, pulse: 78, weight: 77.8, bmi: 22.4 },
    { date: '03 Jun 2026', bpSys: 138, bpDia: 88, pulse: 82, weight: 79.2, bmi: 22.8 },
    { date: '04 Sep 2026', bpSys: 128, bpDia: 84, pulse: 78, weight: 78.5, bmi: 22.6 },
  ];

  return (
    <div className="space-y-4 text-slate-800">
      {/* Top Banner Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2f5597]" />
            <h3 className="font-black text-slate-900 text-base">Longitudinal Patient Trends & Biometric Analysis</h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Medical Assistant Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare multi-visit lab findings, physiological markers, and radiology evolutions over time.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 p-1 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-[#2f5597]" />
          <span>Timeline: Jun 2024 — Sep 2026 (5 Recorded Consultations)</span>
        </div>
      </div>

      {/* Segmented Category Filter */}
      <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 flex-wrap">
        {[
          { id: 'lipids', label: 'Lipid Profile (Cholesterol)', icon: Activity },
          { id: 'glycemic', label: 'Glycemic Control (HbA1c & Glucose)', icon: FlaskConical },
          { id: 'renal', label: 'Renal Function (Creatinine & eGFR)', icon: FlaskConical },
          { id: 'vitals', label: 'Vitals & BMI (BP, Pulse, Weight)', icon: Scale },
          { id: 'radiology', label: 'Radiology & Imaging Evolution', icon: ScanLine },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSel
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#2f5597]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. LIPID PROFILE TREND VIEW                              */}
      {/* ======================================================== */}
      {activeCategory === 'lipids' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart Card */}
            <div className="lg:col-span-2 bg-white/90 rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900">LDL vs HDL Cholesterol Progression (mg/dL)</span>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> LDL (Target &lt;100)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> HDL (Target &gt;40)
                  </span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lipidTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ldlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="hdlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[30, 180]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="ldl" name="LDL Cholesterol" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#ldlGrad)" />
                    <Area type="monotone" dataKey="hdl" name="HDL Cholesterol" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#hdlGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold">Clinical Observation: LDL peaked at 162 mg/dL in Jun 2026; slight decrease to 158 mg/dL post-statin adjustment.</span>
                </div>
                <span className="font-extrabold text-[10px] text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">
                  Cardiovascular Risk: High
                </span>
              </div>
            </div>

            {/* Quick Metrics Column */}
            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total / HDL Ratio</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-rose-700">6.1</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    High Risk (&gt;4.5)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Elevated atherogenic index; recommended cardiology follow-up.</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Triglycerides</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-700">159 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Borderline High
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Normalized from peak of 162 mg/dL; dietary control continuing.</p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">Lipid Profile Historical Comparison Matrix</span>
              <span className="text-[10px] text-slate-500 font-mono">Reference Lab: City Diagnostics</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">12 Jun 2024</th>
                    <th className="p-2.5">10 Nov 2025</th>
                    <th className="p-2.5">03 Jun 2026</th>
                    <th className="p-2.5">Current (04 Sep 2026)</th>
                    <th className="p-2.5">Delta (vs Baseline)</th>
                    <th className="p-2.5">Normal Range</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">Total Cholesterol</td>
                    <td className="p-2.5 font-mono">208 mg/dL</td>
                    <td className="p-2.5 font-mono">224 mg/dL</td>
                    <td className="p-2.5 font-mono text-rose-600 font-bold">248 mg/dL</td>
                    <td className="p-2.5 font-mono text-rose-600 font-bold">242 mg/dL</td>
                    <td className="p-2.5 text-rose-600 font-bold">+16.3% ↑</td>
                    <td className="p-2.5 text-slate-500">&lt; 200 mg/dL</td>
                    <td className="p-2.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">High</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-rose-50/20">
                    <td className="p-2.5 font-bold text-slate-900">LDL Cholesterol</td>
                    <td className="p-2.5 font-mono">132 mg/dL</td>
                    <td className="p-2.5 font-mono">145 mg/dL</td>
                    <td className="p-2.5 font-mono text-rose-600 font-bold">162 mg/dL</td>
                    <td className="p-2.5 font-mono text-rose-600 font-bold">158 mg/dL</td>
                    <td className="p-2.5 text-rose-600 font-bold">+19.7% ↑</td>
                    <td className="p-2.5 text-slate-500">&lt; 100 mg/dL</td>
                    <td className="p-2.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">High (Flagged)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">HDL Cholesterol</td>
                    <td className="p-2.5 font-mono">48 mg/dL</td>
                    <td className="p-2.5 font-mono">44 mg/dL</td>
                    <td className="p-2.5 font-mono text-amber-600 font-bold">42 mg/dL</td>
                    <td className="p-2.5 font-mono text-slate-800 font-bold">43 mg/dL</td>
                    <td className="p-2.5 text-amber-600 font-bold">-10.4% ↓</td>
                    <td className="p-2.5 text-slate-500">40 - 60 mg/dL</td>
                    <td className="p-2.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">Normal Low</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">Triglycerides</td>
                    <td className="p-2.5 font-mono">142 mg/dL</td>
                    <td className="p-2.5 font-mono">154 mg/dL</td>
                    <td className="p-2.5 font-mono text-amber-600 font-bold">162 mg/dL</td>
                    <td className="p-2.5 font-mono text-amber-600 font-bold">159 mg/dL</td>
                    <td className="p-2.5 text-amber-600 font-bold">+12.0% ↑</td>
                    <td className="p-2.5 text-slate-500">&lt; 150 mg/dL</td>
                    <td className="p-2.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Borderline High</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GLYCEMIC TREND VIEW                                   */}
      {/* ======================================================== */}
      {activeCategory === 'glycemic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white/90 rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900">HbA1c Glycated Hemoglobin Trend (%)</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Target &lt; 7.0%
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={glycemicTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[6.0, 8.5]} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="hba1c" name="HbA1c (%)" stroke="#9333ea" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-bold">Current HbA1c is 7.5% (down from 7.8% in June 2026), indicating stabilizing glycemic response.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fasting Blood Sugar</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">132 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Target: 80-120
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Decreased from 138 mg/dL.</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Post-Prandial Glucose</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">180 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Target: &lt;180
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Borderline glycemic control.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. RENAL PROFILE TREND VIEW                              */}
      {/* ======================================================== */}
      {activeCategory === 'renal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white/90 rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900">Serum Creatinine Trend (mg/dL)</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Normal Range: 0.7 - 1.2 mg/dL
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={renalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0.6, 1.6]} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="creatinine" name="Serum Creatinine (mg/dL)" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200 text-xs text-sky-950 flex items-center justify-between">
                <span className="font-bold">eGFR calculated at 74 mL/min/1.73m² (CKD Stage 2 Mildly Decreased). Hydration and nephrotoxic drug avoidance advised.</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated GFR</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-sky-800">74 <span className="text-xs font-normal text-slate-400">mL/min</span></span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Stage 2 Mild
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Blood Urea Nitrogen (BUN)</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">21 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Normal (7 - 20)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. VITALS & BMI TREND VIEW                               */}
      {/* ======================================================== */}
      {activeCategory === 'vitals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white/90 rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900">Blood Pressure Systolic vs Diastolic (mmHg)</span>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Systolic (Target &lt;130)
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Diastolic (Target &lt;80)
                  </span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[70, 150]} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="bpSys" name="Systolic BP" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="bpDia" name="Diastolic BP" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span className="font-bold">Current reading 128/84 mmHg reflects improved control following Telmisartan morning administration.</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Body Mass Index (BMI)</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-700">22.6 <span className="text-xs font-normal text-slate-400">kg/m²</span></span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Normal Weight
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Height: 162 cm • Current Weight: 78.5 kg</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Resting Heart Rate</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">78 <span className="text-xs font-normal text-slate-400">bpm</span></span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Sinus Rhythm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. RADIOLOGY & IMAGING EVOLUTION                         */}
      {/* ======================================================== */}
      {activeCategory === 'radiology' && (
        <div className="space-y-3">
          <div className="bg-white/90 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm">Diagnostic Imaging & Cardiology Scan History</h4>

            <div className="space-y-2.5">
              {[
                {
                  modality: 'Treadmill Stress Test (TMT)',
                  date: '12 Jan 2025',
                  facility: 'City Cardiology Center',
                  status: 'Abnormal (ST Depression in II, III, aVF)',
                  comparison: 'Compared with baseline 2023: Submaximal effort at Stage 3 due to fatigue; ST depression of 1.2mm.',
                  doctorNote: 'Recommended review by Dr. S. Menon before strenuous exercise.',
                },
                {
                  modality: '12-Lead Electrocardiogram (ECG)',
                  date: '12 Jan 2025',
                  facility: 'Soltech Clinic Diagnostic Suite',
                  status: 'ST-3 changes, normal sinus rhythm (HR 78)',
                  comparison: 'No acute STEMI; persistent non-specific repolarization abnormalities.',
                  doctorNote: 'Consistent with previous known CAD.',
                },
                {
                  modality: 'Chest X-Ray (PA View)',
                  date: '28 Dec 2024',
                  facility: 'City Imaging & Radiodiagnostics',
                  status: 'Mild Cardiomegaly, clear lung fields',
                  comparison: 'Cardiothoracic ratio 0.52 (unchanged from 2023). Costophrenic angles sharp, no active pleural effusion.',
                  doctorNote: 'Stable cardiac silhouette.',
                },
                {
                  modality: 'Abdominal & Renal Ultrasound (USG)',
                  date: '15 May 2024',
                  facility: 'Apex Sonography Clinic',
                  status: 'Grade 1 Fatty Liver (Steatosis), Normal Bilateral Kidneys',
                  comparison: 'Cortical echogenicity preserved. No nephrolithiasis or hydronephrosis.',
                  doctorNote: 'Advised low fat dietary regimen and liver enzymes tracking.',
                },
              ].map((img, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-xs text-slate-900">{img.modality}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {img.date}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {img.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{img.comparison}</p>
                  <p className="text-[11px] text-blue-900 font-semibold italic bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                    Radiologist / Physician Note: {img.doctorNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
