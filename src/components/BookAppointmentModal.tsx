import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  Stethoscope,
  User,
  Phone,
  Search,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Doctor, Gender, Patient } from '../types';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onBook: (patientData: Partial<Patient>) => void;
}

const COMMON_COMPLAINT_SUGGESTIONS = [
  'Routine Health Checkup',
  'Chest Tightness / Pain',
  'Fever & Body Chills',
  'Shortness of Breath / Dyspnea',
  'Hypertension Follow-up',
  'Diabetes Routine Evaluation',
  'Headache & Dizziness',
  'Abdominal Pain & Acidity',
  'Joint Pain & Stiffness',
  'Cough & Throat Irritation',
  'Fatigue & General Malaise',
  'Skin Rash / Allergic Reaction',
];

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onBook,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<Gender>('Male');
  const [mobile, setMobile] = useState('');
  const [bookingMode, setBookingMode] = useState<'Walk-in' | 'Online Appointment' | 'Phone Booking'>('Walk-in');
  const [visitType, setVisitType] = useState<'New Patient' | 'Follow-up'>('New Patient');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [time, setTime] = useState('11:00 AM');
  
  // Chief complaint state with search and auto-suggest list
  const [chiefComplaint, setChiefComplaint] = useState('Routine Health Checkup');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const filteredSuggestions = COMMON_COMPLAINT_SUGGESTIONS.filter((c) =>
    c.toLowerCase().includes(complaintSearch.toLowerCase())
  );

  const handleSelectComplaint = (complaint: string) => {
    setChiefComplaint(complaint);
    setComplaintSearch('');
    setShowSuggestions(false);
  };

  const handleAddCustomComplaint = () => {
    if (complaintSearch.trim()) {
      setChiefComplaint(complaintSearch.trim());
      setComplaintSearch('');
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

    onBook({
      name: name.trim() || 'New Patient',
      age: Number(age) || 30,
      gender,
      mobile: mobile.startsWith('+91') ? mobile : `+91 ${mobile.trim()}`,
      appointmentType: bookingMode === 'Online Appointment' ? 'Online Appointment' : 'Walk-in',
      visitType,
      appointmentTime: time,
      doctorAssignedId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      assessment: {
        subjectiveCompleted: false,
        objectiveCompleted: false,
        chiefComplaint: chiefComplaint || 'General consultation',
        symptomsDuration: 'Today',
        symptomSeverity: 'Mild',
        maNotes: '',
      },
      form: {
        fullName: name.trim(),
        age: Number(age) || 30,
        gender,
        mobile: mobile.startsWith('+91') ? mobile : `+91 ${mobile.trim()}`,
        patientType: 'Self',
        visitType,
        reasonOfVisit: chiefComplaint || 'General consultation',
        doctorAssignedId: selectedDoctor.id,
        timeSlot: time,
        completedAtReception: true,
      },
    });

    onClose();
  };

  return (
    <div
      id="book-appointment-popup-modal"
      className="fixed inset-0 z-50 flex justify-center items-start p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150"
    >
      {/* Modal Dialog Box with 40px Heights & 12px Radius Discipline */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-3xl sm:max-w-4xl max-h-[calc(100vh-40px)] overflow-hidden flex flex-col ring-1 ring-slate-900/10 shrink-0 my-auto">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200 shadow-2xs">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                Book Appointment
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Register a new or follow-up patient consultation with the doctor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body with Dedicated Inner Scrollbar */}
        <form onSubmit={handleSubmit} className="custom-modal-scrollbar flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Section 1: Patient Full Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[40px] pl-9.5 pr-3 text-xs font-semibold border border-slate-300 rounded-[12px] bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full h-[40px] px-3.5 text-xs font-semibold border border-slate-300 rounded-[12px] bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Gender (Button selection) & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`h-[40px] rounded-[12px] text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                      gender === g
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98250 12345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full h-[40px] pl-9.5 pr-3 text-xs font-semibold border border-slate-300 rounded-[12px] bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Booking Mode (Button selection) & Visit Type (Button selection) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Booking Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Mode <span className="text-slate-400 font-normal">(Button Selection)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Walk-in', 'Online Appointment', 'Phone Booking'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBookingMode(mode)}
                    className={`h-[40px] rounded-[12px] text-[11px] font-bold px-1 transition-all border flex items-center justify-center text-center cursor-pointer ${
                      bookingMode === mode
                        ? 'bg-blue-50 text-blue-700 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">
                      {mode === 'Online Appointment' ? 'Online' : mode === 'Phone Booking' ? 'Phone' : 'Walk-in'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visit Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Visit Type <span className="text-slate-400 font-normal">(Button Selection)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['New Patient', 'Follow-up'] as const).map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setVisitType(vt)}
                    className={`h-[40px] rounded-[12px] text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                      visitType === vt
                        ? 'bg-blue-50 text-blue-700 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Doctor Small Cards (Photo, Name, Speciality) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Assigned Doctor & Clinical Room
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Select doctor card</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {doctors.map((doc) => {
                const isSelected = docIdSelected(doc.id, doctorId);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setDoctorId(doc.id)}
                    className={`p-2.5 rounded-[12px] border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs border border-slate-200"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          doc.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-xs font-bold text-slate-900 truncate">{doc.name}</div>
                      <div className="text-[11px] text-blue-700 font-semibold truncate">{doc.specialty}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">{doc.roomNumber}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Chief Complaint (Auto-suggest list + Search & Add) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Chief Complaint / Reason for Visit <span className="text-rose-500">*</span>
              </label>
              {chiefComplaint && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Selected: {chiefComplaint}
                </span>
              )}
            </div>

            {/* Search / Custom Complaint Input (40px Height, 12px Radius) */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search complaint list or type custom reason..."
                  value={complaintSearch}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setComplaintSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full h-[40px] pl-9.5 pr-3 text-xs font-semibold border border-slate-300 rounded-[12px] bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={handleAddCustomComplaint}
                disabled={!complaintSearch.trim()}
                className="h-[40px] px-4 rounded-[12px] bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Suggestions Chips / Quick Select List */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-[12px] p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>Common Complaints (Click to Select)</span>
                </span>
                <span>{filteredSuggestions.length} suggestions</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {filteredSuggestions.map((item) => {
                  const isSelected = chiefComplaint === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectComplaint(item)}
                      className={`text-[11px] px-2.5 py-1 rounded-[10px] border transition-all cursor-pointer font-semibold ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200/90 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 6: Modal Actions / CTA (40px Height & 12px Radius) */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] px-5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-[12px] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-book-appointment-btn"
              type="submit"
              className="h-[40px] px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-[12px] shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Book Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper: doctor selection compare
function docIdSelected(idA: string, idB: string): boolean {
  return idA === idB;
}
