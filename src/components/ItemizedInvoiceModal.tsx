import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Stethoscope,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  Receipt,
  Share2,
  Plus,
  Percent,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Patient, BillingDetails } from '../types';

interface ItemizedInvoiceModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onCompletePayment?: (patientId: string, paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Online' | 'Insurance') => void;
  onUpdatePatient?: (updated: Patient) => void;
}

interface ExpenseLineItem {
  id: string;
  category: 'Consultation' | 'Diagnostics' | 'Therapy & Rehab' | 'Procedures' | 'Consumables' | 'Hospital Admin';
  description: string;
  sacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  net: number;
  orderedBy?: string;
  status?: string;
}

export const ItemizedInvoiceModal: React.FC<ItemizedInvoiceModalProps> = ({
  patient,
  isOpen,
  onClose,
  onCompletePayment,
  onUpdatePatient,
}) => {
  const [activeView, setActiveView] = useState<'invoice' | 'dues_breakdown'>('invoice');
  const [isCollectingPayment, setIsCollectingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Online' | 'Insurance'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedReceiptNo, setGeneratedReceiptNo] = useState<string | null>(null);
  const [cashTendered, setCashTendered] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !patient) return null;

  const billing = patient.billing || {
    consultationFee: 700,
    investigationCharges: 0,
    therapyCharges: 0,
    otherCharges: 0,
    discount: 0,
    tax: 0,
    totalAmount: 700,
    amountPaid: 0,
    amountDue: 700,
    status: 'Pending',
  };

  // Generate complete list of itemized expenses
  const expenseItems = useMemo<ExpenseLineItem[]>(() => {
    const items: ExpenseLineItem[] = [];

    // 1. Doctor Consultation Fee
    if (billing.consultationFee > 0 || billing.totalAmount > 0) {
      items.push({
        id: 'item-consult',
        category: 'Consultation',
        description: `Specialist Clinical Consultation - ${patient.doctorName} (${patient.specialty})`,
        sacCode: '999312',
        quantity: 1,
        rate: billing.consultationFee || 700,
        discount: 0,
        net: billing.consultationFee || 700,
        orderedBy: patient.doctorName,
        status: 'Delivered',
      });
    }

    // 2. Diagnostic & Laboratory Investigations
    if (patient.investigations && patient.investigations.length > 0) {
      patient.investigations.forEach((inv, index) => {
        const itemCharge = inv.charge || 450;
        items.push({
          id: `item-inv-${inv.id || index}`,
          category: 'Diagnostics',
          description: `${inv.name} (${inv.department || 'Lab/Diagnostics'})`,
          sacCode: '999313',
          quantity: 1,
          rate: itemCharge,
          discount: 0,
          net: itemCharge,
          orderedBy: inv.orderedBy || patient.doctorName,
          status: inv.status || 'Completed',
        });
      });
    } else if (billing.investigationCharges > 0) {
      // If billing has investigation charges but no explicit array items
      items.push({
        id: 'item-inv-general',
        category: 'Diagnostics',
        description: `Diagnostic Investigations & Laboratory Workup Panel`,
        sacCode: '999313',
        quantity: 1,
        rate: billing.investigationCharges,
        discount: 0,
        net: billing.investigationCharges,
        orderedBy: patient.doctorName,
        status: 'Completed',
      });
    }

    // 3. Therapy, Physical Rehab, Procedures
    if (billing.therapyCharges > 0) {
      items.push({
        id: 'item-therapy',
        category: 'Therapy & Rehab',
        description: `Supervised Clinical Therapy, Physical Rehab & Procedures`,
        sacCode: '999314',
        quantity: 1,
        rate: billing.therapyCharges,
        discount: 0,
        net: billing.therapyCharges,
        orderedBy: patient.doctorName,
        status: 'Completed',
      });
    }

    // 4. Hospital Admin, Nursing & Consumables
    const otherCost = billing.otherCharges > 0 ? billing.otherCharges : 150;
    items.push({
      id: 'item-other',
      category: 'Hospital Admin',
      description: `Sterile Consumables, Digital EMR Maintenance & Bio-Medical Handling`,
      sacCode: '999319',
      quantity: 1,
      rate: otherCost,
      discount: 0,
      net: otherCost,
      status: 'Rendered',
    });

    return items;
  }, [patient, billing]);

  // Aggregate computations
  const grossSubtotal = expenseItems.reduce((acc, item) => acc + item.net, 0);
  const totalDiscount = (billing.discount || 0) + appliedDiscount;
  const taxableValue = Math.max(0, grossSubtotal - totalDiscount);
  // Healthcare services in India under SAC 9993 are exempted from GST
  const cgst = 0;
  const sgst = 0;
  const previousUnsettledDues = 0; // UHID previous ledger balance
  const calculatedTotalPayable = taxableValue + cgst + sgst + previousUnsettledDues;
  const amountPaid = billing.amountPaid || 0;
  const balanceDue = Math.max(0, calculatedTotalPayable - amountPaid);

  const invoiceNumber =
    billing.receiptNumber ||
    `INV-2026-0904-${patient.patientNumber?.replace('STP-', '') || '9841'}`;

  const handleApplyDiscount = (amount: number) => {
    setAppliedDiscount(amount);
    showNotice(`₹${amount} institutional concession discount applied.`);
  };

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const receiptNo = `REC-2026-0904-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedReceiptNo(receiptNo);
      setPaymentSuccess(true);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedBilling: BillingDetails = {
        ...billing,
        discount: totalDiscount,
        totalAmount: calculatedTotalPayable,
        amountPaid: calculatedTotalPayable,
        amountDue: 0,
        status: 'Paid',
        paymentMethod,
        paidAt: nowTime,
        receiptNumber: receiptNo,
      };

      const updatedPatient: Patient = {
        ...patient,
        status: 'DONE',
        billing: updatedBilling,
        activityTimeline: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            timeDisplay: nowTime,
            action: `Full Itemized Payment Settled (₹${calculatedTotalPayable.toLocaleString()} via ${paymentMethod})`,
            performedBy: 'Priya Shah',
            role: 'Receptionist',
            category: 'Billing',
            details: `Invoice #${invoiceNumber} settled. Tax Receipt #${receiptNo} issued.`,
          },
          ...patient.activityTimeline,
        ],
      };

      if (onUpdatePatient) {
        onUpdatePatient(updatedPatient);
      }
      if (onCompletePayment) {
        onCompletePayment(patient.id, paymentMethod);
      }
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceSummaryText = `
=====================================================
SATYAM MULTISPECIALITY CLINIC & DAYCARE
101-105 Aarohi Complex, Anandnagar Road, Paldi, Ahmedabad
GSTIN: 24AABCS1429B1Z8 | Phone: +91 79 4002 8800
=====================================================
TAX INVOICE & ITEMIZED STATEMENT OF DUES
Invoice No: ${invoiceNumber}
Date: 04 Sep 2026 | Counter: Desk 1
-----------------------------------------------------
PATIENT DETAILS:
Patient: ${patient.name}
Age & Gender: ${patient.age} Y • ${patient.gender}
UHID / Reg No: ${patient.patientNumber || patient.patientIdNumber}
Treating Doctor: ${patient.doctorName} (${patient.specialty})
-----------------------------------------------------
ITEMIZED LIST OF EXPENSES:
${expenseItems
  .map(
    (item, idx) =>
      `${idx + 1}. [${item.sacCode}] ${item.description} (Qty: ${item.quantity}) - ₹${item.net.toLocaleString()}`
  )
  .join('\n')}
-----------------------------------------------------
ALL KIND OF DUES & FINANCIAL SUMMARY:
Gross Consultation & Clinical Charges: ₹${grossSubtotal.toLocaleString()}
Institutional Concession / Discount: -₹${totalDiscount.toLocaleString()}
Applicable Taxes (CGST 0% + SGST 0%): ₹0.00 (Exempt)
Previous Unsettled Ledger Dues: ₹${previousUnsettledDues.toLocaleString()}
TOTAL AMOUNT PAYABLE: ₹${calculatedTotalPayable.toLocaleString()}
Amount Cleared / Advance: ₹${amountPaid.toLocaleString()}
CURRENT NET BALANCE DUE: ₹${paymentSuccess ? '0.00 (Settled)' : balanceDue.toLocaleString()}
Status: ${paymentSuccess || balanceDue === 0 ? 'PAID IN FULL' : 'PAYMENT DUE'}
Cashier: Priya Shah (Reception Desk)
=====================================================
    `.trim();

    const blob = new Blob([invoiceSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceNumber}_${patient.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('Invoice exported successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden ring-1 ring-slate-900/10">
        {/* Top Header Strip */}
        <div className="px-5 py-3.5 border-b border-slate-200/90 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80 shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  Tax Invoice & Itemized Expenses
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {invoiceNumber}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Itemized Bill & Dues Statement
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveView('invoice');
                  setIsCollectingPayment(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeView === 'invoice' && !isCollectingPayment
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tax Invoice View
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('dues_breakdown');
                  setIsCollectingPayment(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeView === 'dues_breakdown' && !isCollectingPayment
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Dues Breakdown
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/60 to-white/80">
          {/* Notification Toast inside Modal */}
          {toastMessage && (
            <div className="bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-md animate-in fade-in duration-100">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Payment Collection Overlay/Screen if active */}
          {isCollectingPayment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-150">
              {!paymentSuccess ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Collect Payment
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        Settle Dues for {patient.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Total Balance to Settle: <span className="font-extrabold text-emerald-700 text-sm">₹{balanceDue.toLocaleString()}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCollectingPayment(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 bg-slate-100 rounded-lg"
                    >
                      Back to Invoice
                    </button>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Select Payment Mode
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'UPI', label: 'UPI / QR', icon: QrCode, desc: 'Instant Dynamic QR' },
                        { id: 'Cash', label: 'Cash', icon: Banknote, desc: 'Physical Tender' },
                        { id: 'Card', label: 'POS Card', icon: CreditCard, desc: 'Debit / Credit' },
                        { id: 'Online', label: 'Online Link', icon: Receipt, desc: 'Razorpay / SMS' },
                        { id: 'Insurance', label: 'TPA Claim', icon: ShieldCheck, desc: 'Cashless Desk' },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSelected = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold">{m.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode specific details */}
                  {paymentMethod === 'UPI' && (
                    <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-blue-900">Clinic Dynamic UPI Terminal</div>
                        <div className="text-[11px] text-blue-700 font-mono mt-0.5">UPI ID: satyamclinic.ops@icici</div>
                        <div className="text-[10px] text-slate-500 mt-1">Amount preset to ₹{balanceDue.toLocaleString()}</div>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-xl border border-blue-200 shadow-2xs flex items-center justify-center font-bold text-xs text-blue-700">
                        <QrCode className="w-10 h-10 text-blue-600" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'Cash' && (
                    <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/80 space-y-2">
                      <div className="text-xs font-bold text-amber-900">Cash Settlement Calculator</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Amount Tendered by Patient (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 1000"
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex-1 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                          <span className="text-[10px] text-slate-500 block">Change to Return:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {Number(cashTendered) >= balanceDue
                              ? `₹${(Number(cashTendered) - balanceDue).toLocaleString()}`
                              : '₹0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settle Action */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCollectingPayment(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleConfirmPayment}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <IndianRupee className="w-4 h-4" />
                      <span>{isProcessing ? 'Processing Transaction...' : `Confirm Settle ₹${balanceDue.toLocaleString()}`}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Payment Success View */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Payment Settled Successfully!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Receipt issued and patient status moved to Completed & Discharged (Done Today).
                    </p>
                  </div>

                  <div className="bg-slate-50 max-w-sm mx-auto p-4 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Receipt Number:</span>
                      <span className="font-mono font-bold text-slate-800">{generatedReceiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="font-bold text-emerald-700">₹{calculatedTotalPayable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-bold text-slate-800">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Outstanding Balance:</span>
                      <span className="font-bold text-emerald-600">₹0.00 (All Clear)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Print Official Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                    >
                      Return to Reception Desk
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeView === 'invoice' ? (
            /* ======================================================== */
            /* 1. REALISTIC TAX INVOICE FORMAT                          */
            /* ======================================================== */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Clinic Letterhead */}
              <div className="border-b-2 border-slate-900/10 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black text-base flex items-center justify-center">
                        S
                      </div>
                      <h1 className="text-lg font-black tracking-tight text-slate-900">
                        SATYAM MULTISPECIALITY CLINIC & DAYCARE
                      </h1>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      NABH Accredited Healthcare Center • Clinical Reg: GUJ-AHM-2024-9841
                    </p>
                    <p className="text-[11px] text-slate-400">
                      101-105 Aarohi Complex, Anandnagar Road, Paldi, Ahmedabad - 380007
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      GSTIN: 24AABCS1429B1Z8 • Phone: +91 79 4002 8800 • billing@satyamclinic.com
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 border ${
                        balanceDue === 0 || billing.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {balanceDue === 0 || billing.status === 'Paid'
                        ? 'PAID IN FULL'
                        : 'PAYMENT DUE / OUTSTANDING'}
                    </span>
                    <div className="text-xs text-slate-500">
                      Invoice No: <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Date: <span className="font-medium text-slate-800">04 Sep 2026, 11:30 AM</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      POS Counter: <span className="font-medium text-slate-800">Reception Desk #1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Billed To (Patient Information)
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                  <div className="text-slate-600 mt-0.5">
                    Age & Gender:{' '}
                    <span className="font-semibold text-slate-800">
                      {patient.age} Y • {patient.gender}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    UHID / Patient ID:{' '}
                    <span className="font-mono font-semibold text-blue-700">
                      {patient.patientNumber || patient.patientIdNumber}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Contact: <span className="text-slate-800">{patient.mobile || '+91 98250 14892'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Clinical Encounter
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {patient.doctorName}{' '}
                    <span className="font-normal text-slate-500">({patient.specialty})</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Room / Cabin:{' '}
                    <span className="font-semibold text-slate-800">{patient.roomNumber || 'Cabin 101'}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Encounter Type:{' '}
                    <span className="font-medium text-slate-800">{patient.visitType} ({patient.appointmentType})</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Attending Cashier:{' '}
                    <span className="font-medium text-slate-800">Priya Shah (Front Desk)</span>
                  </div>
                </div>
              </div>

              {/* Complete Itemized Expenses Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Complete Itemized List of Expenses & Charges
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {expenseItems.length} Billable Services
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">#</th>
                        <th className="py-2.5 px-3">Service / Expense Description</th>
                        <th className="py-2.5 px-3 w-20 text-center">SAC Code</th>
                        <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                        <th className="py-2.5 px-3 w-24 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-3 w-24 text-right">Net Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {expenseItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{item.description}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                {item.category}
                              </span>
                              {item.orderedBy && (
                                <span className="text-[10px] text-slate-400">
                                  Ordered by: {item.orderedBy}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                            {item.sacCode}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-700 font-medium">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            ₹{item.rate.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{item.net.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete List of All Kinds of Dues & Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Left side: Notes & Quick Concessions */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-2">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      <span>Apply Institutional Concession / Discount</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: '₹100 Waiver', val: 100 },
                        { label: '₹200 Senior Citizen', val: 200 },
                        { label: '10% Staff Concession', val: Math.round(grossSubtotal * 0.1) },
                        { label: 'Reset (₹0)', val: 0 },
                      ].map((disc) => (
                        <button
                          key={disc.label}
                          type="button"
                          onClick={() => handleApplyDiscount(disc.val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            appliedDiscount === disc.val && disc.val > 0
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {disc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-semibold text-slate-700">Tax Exemption & Terms:</div>
                    <p className="leading-relaxed">
                      Clinical healthcare services provided by registered clinical establishments are exempted from GST under
                      Notification No. 12/2017 - Central Tax (Rate). Computer generated invoice; no physical signature required.
                    </p>
                  </div>
                </div>

                {/* Right side: Detailed Breakdown of All Kinds of Dues */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 space-y-2.5 text-xs">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 pb-1 border-b border-slate-200 flex items-center justify-between">
                    <span>Summary of All Dues & Expenses</span>
                    <span>Amount (INR)</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Current Consultation Charges:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{billing.consultationFee.toLocaleString()}
                    </span>
                  </div>

                  {billing.investigationCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Laboratory & Pathology Charges:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        ₹{billing.investigationCharges.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {billing.therapyCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Therapy & Clinical Procedures:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        ₹{billing.therapyCharges.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Administrative & Consumable Charges:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{(billing.otherCharges > 0 ? billing.otherCharges : 150).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                    <span>Gross Billed Subtotal:</span>
                    <span className="font-mono">₹{grossSubtotal.toLocaleString()}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Less: Concession / Discount:</span>
                      <span className="font-mono">-₹{totalDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Taxes (CGST 0% + SGST 0% - Exempt):</span>
                    <span className="font-mono">₹0.00</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Previous Unsettled Dues (Past Balance):</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{previousUnsettledDues.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-extrabold text-sm">
                    <span>Total Net Amount Payable:</span>
                    <span className="font-mono text-base text-blue-900">
                      ₹{calculatedTotalPayable.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Amount Received / Advance Cleared:</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      ₹{amountPaid.toLocaleString()}
                    </span>
                  </div>

                  {/* Net Balance Due Highlight Banner */}
                  <div className="mt-2 pt-2.5 border-t-2 border-slate-300 flex justify-between items-center bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800 block">
                        Net Outstanding Balance Due
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Immediate settlement required at counter
                      </span>
                    </div>
                    <span className="font-mono text-xl font-black text-blue-900">
                      ₹{balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. DUES BREAKDOWN & LEDGER VIEW                          */
            /* ======================================================== */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Consultation Dues
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    ₹{billing.consultationFee.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Dr. {patient.doctorName}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Diagnostics & Procedures
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    ₹{((billing.investigationCharges || 0) + (billing.therapyCharges || 0)).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {patient.investigations?.length || 0} investigation(s) performed
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Net Outstanding
                  </div>
                  <div className="text-xl font-black text-rose-700 mt-1 font-mono">
                    ₹{balanceDue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Status: <span className="font-bold text-amber-700">{billing.status}</span>
                  </div>
                </div>
              </div>

              {/* Categorical Breakdown Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Comprehensive Categorical Dues Ledger
                </h4>

                <div className="space-y-2.5">
                  {[
                    {
                      category: 'Consultation & Clinical Evaluation',
                      code: 'SAC 999312',
                      amount: billing.consultationFee,
                      status: 'Unsettled',
                      notes: 'Standard specialist OPD fee',
                    },
                    {
                      category: 'Diagnostic Investigations & Lab Tests',
                      code: 'SAC 999313',
                      amount: billing.investigationCharges,
                      status: billing.investigationCharges > 0 ? 'Unsettled' : 'N/A',
                      notes: `${patient.investigations?.length || 0} tests ordered`,
                    },
                    {
                      category: 'Therapy, Physiotherapy & Nursing Procedures',
                      code: 'SAC 999314',
                      amount: billing.therapyCharges,
                      status: billing.therapyCharges > 0 ? 'Unsettled' : 'N/A',
                      notes: 'Daycare rehabilitation / clinical procedures',
                    },
                    {
                      category: 'Sterile Consumables & Bio-Medical Handling',
                      code: 'SAC 999319',
                      amount: billing.otherCharges > 0 ? billing.otherCharges : 150,
                      status: 'Unsettled',
                      notes: 'Hospital infection control & EMR storage',
                    },
                    {
                      category: 'Previous Outstanding Account Balance',
                      code: 'UHID-LEDGER',
                      amount: previousUnsettledDues,
                      status: 'Clear',
                      notes: 'Zero previous unpaid visits on file',
                    },
                  ].map((cat) => (
                    <div
                      key={cat.category}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{cat.category}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-400">{cat.code}</span>
                          <span>•</span>
                          <span>{cat.notes}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          ₹{cat.amount.toLocaleString()}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            cat.amount > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download File</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>

            {balanceDue > 0 && !isCollectingPayment && (
              <button
                type="button"
                onClick={() => setIsCollectingPayment(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Collect Payment (₹{balanceDue.toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
