import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Printer,
  IndianRupee,
} from 'lucide-react';
import { Patient } from '../types';

interface PaymentModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onCompletePayment: (patientId: string, paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Online' | 'Insurance') => void;
  onOpenInvoice?: (patient: Patient) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  patient,
  isOpen,
  onClose,
  onCompletePayment,
  onOpenInvoice,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Online' | 'Insurance'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<string | null>(null);

  if (!isOpen) return null;

  const billing = patient.billing;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const receiptNo = `REC-2026-0904-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedReceipt(receiptNo);
      setIsDone(true);
      onCompletePayment(patient.id, selectedMethod);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white/85 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-lg max-h-[720px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/70 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                Billing & Checkout
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{patient.patientNumber}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-0.5">
              {patient.name} ({patient.age} Y • {patient.gender})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isDone ? (
            <>
              {/* Itemized Financial Summary (Section 27 spec) */}
              <div className="bg-white/70 backdrop-blur-xs rounded-xl p-4 border border-white/80 space-y-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Itemized Charge Summary
                  </div>
                  {onOpenInvoice && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenInvoice(patient);
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                    >
                      Review Full Itemized Invoice →
                    </button>
                  )}
                </div>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Appointment / Consultation Fee</span>
                  <span className="font-semibold text-slate-900">₹{billing.consultationFee.toLocaleString()}</span>
                </div>

                {billing.investigationCharges > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Investigation & Pathology Charges</span>
                    <span className="font-semibold text-slate-900">
                      ₹{billing.investigationCharges.toLocaleString()}
                    </span>
                  </div>
                )}

                {billing.therapyCharges > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Therapy & Procedure Charges</span>
                    <span className="font-semibold text-slate-900">
                      ₹{billing.therapyCharges.toLocaleString()}
                    </span>
                  </div>
                )}

                {billing.otherCharges > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Administrative & Consumables</span>
                    <span className="font-semibold text-slate-900">
                      ₹{billing.otherCharges.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">Total Amount Due</span>
                  <span className="font-extrabold text-blue-700 text-xl">
                    ₹{billing.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Methods (Section 28 spec) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Cash', label: 'Cash', icon: Banknote },
                    { id: 'Card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'Online', label: 'Online Payment', icon: Receipt },
                    { id: 'Insurance', label: 'TPA / Insurance', icon: ShieldCheck },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod === 'UPI' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-bold text-blue-900">Scan Clinic Dynamic QR Code</div>
                    <div className="text-[11px] text-blue-700">UPI ID: satyamclinic@icici</div>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shadow-xs">
                    QR
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Payment Collected Successfully!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient has been marked as DONE and removed from the active workflow.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-left max-w-sm mx-auto space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Number:</span>
                  <span className="font-bold text-slate-800">{generatedReceipt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">₹{billing.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold text-slate-800">{selectedMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span className="font-medium text-slate-800">Priya Shah (Receptionist)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {!isDone ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-collect-payment-btn"
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Processing...' : `Collect ₹${billing.totalAmount.toLocaleString()}`}</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
