import React from 'react';
import { CreditCard, IndianRupee, CheckCircle2, Receipt } from 'lucide-react';
import { Patient, SectionLayoutConfig } from '../../types';
import { SectionWrapper } from './SectionWrapper';

interface BillingSectionProps {
  section: SectionLayoutConfig;
  patients: Patient[];
  onOpenDetail: (patient: Patient) => void;
  onOpenPaymentModal: (patient: Patient) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  layoutMode?: 'kanban' | 'grid';
}

export const BillingSection: React.FC<BillingSectionProps> = ({
  section,
  patients,
  onOpenDetail,
  onOpenPaymentModal,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  layoutMode,
}) => {
  const billingPatients = patients.filter((p) => p.status === 'BILLING');

  const totalDueInQueue = billingPatients.reduce((sum, p) => sum + p.billing.totalAmount, 0);

  return (
    <SectionWrapper
      section={section}
      badgeCount={billingPatients.length}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      layoutMode={layoutMode}
      headerAction={
        <span className="text-[10px] font-bold text-blue-800 bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-200/70">
          Financial Clearance
        </span>
      }
    >
      {/* Financial Header in Bento Style */}
      <div className="bg-blue-50/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 text-[11px] text-blue-900 flex items-center justify-between shadow-2xs">
        <div>
          <span className="font-bold block text-blue-950">Cashier & Settlement</span>
          <span className="text-slate-500 text-[10px]">Payment collection & receipting</span>
        </div>
        <div className="text-right bg-white/80 px-2.5 py-1 rounded-xl border border-white/80 shadow-2xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Due</span>
          <span className="font-extrabold text-blue-900 text-xs">₹{totalDueInQueue.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {billingPatients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-white/80">
            No patients waiting for billing or payment clearance.
          </div>
        ) : (
          billingPatients.map((patient) => {
            const billing = patient.billing;

            return (
              <div
                key={patient.id}
                onClick={() => onOpenDetail(patient)}
                className="bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-4 shadow-xs hover:shadow-md space-y-3 hover:border-blue-300/80 transition-all cursor-pointer ring-1 ring-slate-900/5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {patient.avatarUrl ? (
                      <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs leading-tight">{patient.name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium">({patient.age} Y • {patient.gender})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {patient.patientNumber} • Doctor: {patient.doctorName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    BILLING
                  </span>
                </div>

                {/* Financial Breakdown (Section 27) in Bento Style */}
                <div className="bg-white/70 backdrop-blur-xs rounded-xl p-3 border border-white/80 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="font-medium">Consultation:</span>
                    <span className="font-semibold text-slate-800">₹{billing.consultationFee.toLocaleString()}</span>
                  </div>
                  {billing.investigationCharges > 0 && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span className="font-medium">Investigation:</span>
                      <span className="font-semibold text-slate-800">₹{billing.investigationCharges.toLocaleString()}</span>
                    </div>
                  )}
                  {billing.therapyCharges > 0 && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span className="font-medium">Therapy:</span>
                      <span className="font-semibold text-slate-800">₹{billing.therapyCharges.toLocaleString()}</span>
                    </div>
                  )}
                  {billing.otherCharges > 0 && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span className="font-medium">Other:</span>
                      <span className="font-semibold text-slate-800">₹{billing.otherCharges.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-xs">
                    <span>Total Amount Due:</span>
                    <span className="text-blue-900 font-extrabold text-sm">₹{billing.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Collect Payment Action (Section 28) */}
                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(patient);
                    }}
                    className="py-1.5 px-3 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-slate-200/80"
                  >
                    View Invoice
                  </button>

                  <button
                    id={`collect-payment-btn-${patient.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPaymentModal(patient);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Collect ₹{billing.totalAmount.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionWrapper>
  );
};
