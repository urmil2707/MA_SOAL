import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Save,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Patient, PatientFormRegistration, Doctor } from '../types';

interface CompleteIntakeModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSaveIntake: (updatedForm: PatientFormRegistration) => void;
  doctors?: Doctor[];
}

export const CompleteIntakeModal: React.FC<CompleteIntakeModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSaveIntake,
  doctors = [],
}) => {
  const [patientType, setPatientType] = useState<'Self' | 'Guardian'>(
    patient.form?.patientType || 'Self'
  );
  const [fullName, setFullName] = useState(patient.form?.fullName || patient.name);
  const [age, setAge] = useState(patient.form?.age || patient.age);
  const [gender, setGender] = useState(patient.form?.gender || patient.gender);
  const [mobile, setMobile] = useState(patient.form?.mobile || patient.mobile);
  const [email, setEmail] = useState(patient.form?.email || 'patient@example.com');
  const [address, setAddress] = useState(patient.form?.address || 'Paldi, Ahmedabad');
  const [city, setCity] = useState(patient.form?.city || 'Ahmedabad, Gujarat');

  // Guardian details
  const [guardianName, setGuardianName] = useState(patient.form?.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState(patient.form?.guardianRelation || 'Father');
  const [guardianMobile, setGuardianMobile] = useState(patient.form?.guardianMobile || '');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState(patient.form?.emergencyContactName || 'Family Member');
  const [emergencyRelation, setEmergencyRelation] = useState(patient.form?.emergencyContactRelation || 'Spouse');
  const [emergencyMobile, setEmergencyMobile] = useState(patient.form?.emergencyContactMobile || '+91 98250 12345');

  // Clinical & Visit
  const [bloodGroup, setBloodGroup] = useState(patient.form?.bloodGroup || 'A+');
  const [occupation, setOccupation] = useState(patient.form?.occupation || 'Private Sector');
  const [reasonOfVisit, setReasonOfVisit] = useState(
    patient.form?.reasonOfVisit || patient.assessment?.chiefComplaint || 'Routine Medical Check-up'
  );
  const [doctorAssignedId, setDoctorAssignedId] = useState(patient.doctorAssignedId || 'doc-1');
  const [timeSlot, setTimeSlot] = useState(patient.appointmentTime || '10:30 AM');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedForm: PatientFormRegistration = {
      ...patient.form,
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      patientType,
      guardianName: patientType === 'Guardian' ? guardianName.trim() : undefined,
      guardianRelation: patientType === 'Guardian' ? guardianRelation : undefined,
      guardianMobile: patientType === 'Guardian' ? guardianMobile.trim() : undefined,
      emergencyContactName: emergencyName.trim(),
      emergencyContactRelation: emergencyRelation,
      emergencyContactMobile: emergencyMobile.trim(),
      bloodGroup,
      occupation: occupation.trim(),
      reasonOfVisit: reasonOfVisit.trim(),
      doctorAssignedId,
      timeSlot,
      completed: true,
    };

    onSaveIntake(updatedForm);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2f5597] text-white flex items-center justify-center shadow-xs">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Complete Patient Intake Form
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                PID: <span className="font-mono font-bold text-slate-800">{patient.patientNumber}</span> • Front Desk Registration
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
          {/* Patient Type Selector */}
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">Registering For:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPatientType('Self')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  patientType === 'Self'
                    ? 'bg-[#2f5597] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Self
              </button>
              <button
                type="button"
                onClick={() => setPatientType('Guardian')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  patientType === 'Guardian'
                    ? 'bg-[#2f5597] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Guardian / Family Member
              </button>
            </div>
          </div>

          {/* Guardian fields if Guardian */}
          {patientType === 'Guardian' && (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-amber-900 block mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Guardian's name"
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900 font-semibold text-xs"
                  required={patientType === 'Guardian'}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-900 block mb-1">
                  Relation
                </label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-slate-900 text-xs"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Guardian">Legal Guardian</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-900 block mb-1">
                  Guardian Mobile
                </label>
                <input
                  type="text"
                  value={guardianMobile}
                  onChange={(e) => setGuardianMobile(e.target.value)}
                  placeholder="+91 Mobile number"
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900 font-semibold text-xs"
                  required={patientType === 'Guardian'}
                />
              </div>
            </div>
          )}

          {/* Core Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Age & Gender *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-16 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs text-center"
                  required
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="flex-1 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Mobile Phone *
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Residential address"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                City, State
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-extrabold text-slate-900 block">
              Emergency Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Relation
                </label>
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 text-xs"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend / Colleague</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={emergencyMobile}
                  onChange={(e) => setEmergencyMobile(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-semibold text-slate-900 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Clinical Details: Blood Group, Occupation & Reason of Visit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Occupation / Profession"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Reason of visit */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Primary Chief Complaint / Reason of Visit *
            </label>
            <input
              type="text"
              value={reasonOfVisit}
              onChange={(e) => setReasonOfVisit(e.target.value)}
              placeholder="e.g. Chest tightness on exertion, routine checkup..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
              required
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
              <span>Save & Complete Intake</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
