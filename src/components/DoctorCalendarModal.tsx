import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Stethoscope,
  Phone,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  UserCheck,
  AlertCircle,
  Filter,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Doctor, DoctorTimeSlot, Gender, Patient } from '../types';
import {
  generateDoctorTimeSlots,
  CustomCalendarBooking,
} from '../utils/calendarSlots';

interface DoctorCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  selectedDoctorId?: string;
  currentDate: string;
  patients: Patient[];
  customBookings: CustomCalendarBooking[];
  onBookSlot: (bookingData: {
    doctorId: string;
    date: string;
    time: string;
    slotId: string;
    patientName: string;
    patientAge: number;
    patientGender: Gender;
    patientMobile: string;
    visitType: 'New Patient' | 'Follow-up';
    appointmentType: 'Walk-in' | 'Online Appointment' | 'Scheduled';
    reason: string;
    checkInImmediately: boolean;
  }) => void;
  onCancelBooking: (bookingId: string, doctorId: string, date: string, time: string) => void;
  onCheckInPatient?: (patientId: string) => void;
  onViewPatientDetails?: (patient: Patient) => void;
}

export const DoctorCalendarModal: React.FC<DoctorCalendarModalProps> = ({
  isOpen,
  onClose,
  doctors,
  selectedDoctorId = doctors[0]?.id || 'doc-1',
  currentDate = '04 Sep 2026',
  patients,
  customBookings,
  onBookSlot,
  onCancelBooking,
  onCheckInPatient,
  onViewPatientDetails,
}) => {
  // Selected Doctor
  const [activeDoctorId, setActiveDoctorId] = useState<string>(selectedDoctorId);

  // Active Date in Calendar View (e.g. '04 Sep 2026')
  const [activeDate, setActiveDate] = useState<string>(
    currentDate.includes('04 Sep') ? '04 Sep 2026' : currentDate
  );

  // Filter: 'all' | 'available' | 'booked'
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'booked'>('all');

  // Filter: 'all' | 'morning' | 'afternoon'
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  // Search in slots
  const [slotSearchQuery, setSlotSearchQuery] = useState('');

  // Booking Modal State (when an available slot is clicked)
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<DoctorTimeSlot | null>(null);

  // Detail Popover / View for a booked slot
  const [selectedBookedSlot, setSelectedBookedSlot] = useState<DoctorTimeSlot | null>(null);

  // Form State for Booking
  const [bookingForm, setBookingForm] = useState<{
    patientName: string;
    patientAge: number;
    patientGender: Gender;
    patientMobile: string;
    visitType: 'New Patient' | 'Follow-up';
    appointmentType: 'Walk-in' | 'Online Appointment' | 'Scheduled';
    reason: string;
    checkInImmediately: boolean;
  }>({
    patientName: '',
    patientAge: 32,
    patientGender: 'Male',
    patientMobile: '',
    visitType: 'New Patient',
    appointmentType: 'Scheduled',
    reason: '',
    checkInImmediately: true,
  });

  // 7-Day Day-strip definitions around the current week
  const weekDays = useMemo(
    () => [
      { dayName: 'Wed', dateStr: '02 Sep 2026', label: '02 Sep' },
      { dayName: 'Thu', dateStr: '03 Sep 2026', label: '03 Sep' },
      { dayName: 'Fri', dateStr: '04 Sep 2026', label: '04 Sep', isToday: true },
      { dayName: 'Sat', dateStr: '05 Sep 2026', label: '05 Sep' },
      { dayName: 'Sun', dateStr: '06 Sep 2026', label: '06 Sep' },
      { dayName: 'Mon', dateStr: '07 Sep 2026', label: '07 Sep' },
      { dayName: 'Tue', dateStr: '08 Sep 2026', label: '08 Sep' },
    ],
    []
  );

  // Active doctor object
  const activeDoctor = useMemo(
    () => doctors.find((d) => d.id === activeDoctorId) || doctors[0],
    [doctors, activeDoctorId]
  );

  // Generate slots for the active doctor and date
  const allSlots = useMemo(() => {
    if (!activeDoctor) return [];
    return generateDoctorTimeSlots(activeDoctor.id, activeDate, patients, customBookings);
  }, [activeDoctor, activeDate, patients, customBookings]);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      // Status filter
      if (statusFilter === 'available' && slot.status !== 'available') return false;
      if (statusFilter === 'booked' && slot.status !== 'booked') return false;

      // Session filter
      if (sessionFilter === 'morning' && slot.period !== 'morning') return false;
      if (sessionFilter === 'afternoon' && slot.period !== 'afternoon') return false;

      // Search query
      if (slotSearchQuery.trim()) {
        const query = slotSearchQuery.toLowerCase();
        const matchesTime = slot.time.toLowerCase().includes(query);
        const matchesPatient = slot.appointment?.patientName.toLowerCase().includes(query);
        const matchesMobile = slot.appointment?.patientMobile?.toLowerCase().includes(query);
        const matchesReason = slot.appointment?.reason?.toLowerCase().includes(query);
        const matchesMrn = slot.appointment?.patientId?.toLowerCase().includes(query);

        if (!matchesTime && !matchesPatient && !matchesMobile && !matchesReason && !matchesMrn) {
          return false;
        }
      }

      return true;
    });
  }, [allSlots, statusFilter, sessionFilter, slotSearchQuery]);

  // Slot Statistics
  const totalSlotsCount = allSlots.length;
  const bookedSlotsCount = allSlots.filter((s) => s.status === 'booked').length;
  const availableSlotsCount = allSlots.filter((s) => s.status === 'available').length;
  const nextAvailableSlot = allSlots.find((s) => s.status === 'available');

  // Helper to get available count for any given date
  const getAvailableCountForDate = (dateStr: string) => {
    if (!activeDoctor) return 0;
    const slots = generateDoctorTimeSlots(activeDoctor.id, dateStr, patients, customBookings);
    return slots.filter((s) => s.status === 'available').length;
  };

  if (!isOpen) return null;

  // Open booking form for slot
  const handleOpenBooking = (slot: DoctorTimeSlot) => {
    setSelectedSlotForBooking(slot);
    setBookingForm({
      patientName: '',
      patientAge: 32,
      patientGender: 'Male',
      patientMobile: '',
      visitType: 'New Patient',
      appointmentType: 'Scheduled',
      reason: '',
      checkInImmediately: activeDate.includes('04 Sep') || activeDate.toLowerCase().includes('today'),
    });
  };

  // Submit booking form
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForBooking || !activeDoctor) return;

    onBookSlot({
      doctorId: activeDoctor.id,
      date: activeDate,
      time: selectedSlotForBooking.time,
      slotId: selectedSlotForBooking.id,
      patientName: bookingForm.patientName.trim() || 'Scheduled Patient',
      patientAge: Number(bookingForm.patientAge) || 30,
      patientGender: bookingForm.patientGender,
      patientMobile: bookingForm.patientMobile.trim() || '+91 98250 00000',
      visitType: bookingForm.visitType,
      appointmentType: bookingForm.appointmentType,
      reason: bookingForm.reason.trim() || 'General Consultation',
      checkInImmediately: bookingForm.checkInImmediately,
    });

    setSelectedSlotForBooking(null);
  };

  // Cancel an appointment
  const handleCancelClick = (slot: DoctorTimeSlot) => {
    if (!slot.appointment || !activeDoctor) return;
    onCancelBooking(slot.appointment.id, activeDoctor.id, activeDate, slot.time);
    setSelectedBookedSlot(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm">
      <div
        id="doctor-calendar-modal-container"
        className="fixed top-[16px] bottom-[16px] left-[16px] right-[16px] bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10"
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/70 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Doctor Calendar & Slot Booking</h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                  Day-Wise View
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage appointment slots, view available & booked times, and register patient visits directly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Today Jump */}
            <button
              type="button"
              onClick={() => setActiveDate('04 Sep 2026')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-2xs ${
                activeDate.includes('04 Sep')
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Today
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close Calendar (Esc)"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Doctor Selector Ribbon */}
        <div className="px-5 py-2.5 bg-white/60 backdrop-blur-md border-b border-white/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Select Doctor:
            </span>

            {doctors.map((doc) => {
              const isSelected = doc.id === activeDoctorId;
              const slotsForThisDoc = generateDoctorTimeSlots(doc.id, activeDate, patients, customBookings);
              const availCount = slotsForThisDoc.filter((s) => s.status === 'available').length;

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setActiveDoctorId(doc.id)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-400 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        doc.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  <div className="text-left leading-tight">
                    <div className="font-bold truncate max-w-[130px]">{doc.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                      {doc.specialty}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isSelected ? 'bg-blue-200/80 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {availCount} open
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Doctor Summary Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50/90 border border-slate-200/70 px-3.5 py-1.5 rounded-xl text-xs shrink-0">
            <div className="flex items-center gap-1.5 font-medium text-slate-600">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeDoctor?.roomNumber}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <span>Next Available:</span>
              <strong className="text-emerald-700 font-bold">
                {nextAvailableSlot ? nextAvailableSlot.time : 'Fully Booked'}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Day-Wise Navigation & 7-Day Strip */}
        <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          {/* Day Navigation & Strip */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const currentIndex = weekDays.findIndex((w) => w.dateStr === activeDate);
                if (currentIndex > 0) setActiveDate(weekDays[currentIndex - 1].dateStr);
              }}
              title="Previous Day"
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs text-xs font-bold"
            >
              Prev
            </button>

            {/* 7-Day Strip */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto">
              {weekDays.map((w) => {
                const isActive = w.dateStr === activeDate;
                const openCount = getAvailableCountForDate(w.dateStr);

                return (
                  <button
                    key={w.dateStr}
                    type="button"
                    onClick={() => setActiveDate(w.dateStr)}
                    className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-all text-center min-w-[62px] ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 font-medium'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-tight opacity-90">
                      {w.dayName} {w.isToday && '• Today'}
                    </span>
                    <span className="text-xs font-extrabold mt-0.5">{w.label}</span>
                    <span
                      className={`text-[9px] font-semibold mt-0.5 ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {openCount} open
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const currentIndex = weekDays.findIndex((w) => w.dateStr === activeDate);
                if (currentIndex < weekDays.length - 1) {
                  setActiveDate(weekDays[currentIndex + 1].dateStr);
                }
              }}
              title="Next Day"
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs text-xs font-bold"
            >
              Next
            </button>
          </div>

          {/* Filters & Search in Day's Slots */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Session Tabs */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSessionFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sessionFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                All Day
              </button>
              <button
                type="button"
                onClick={() => setSessionFilter('morning')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sessionFilter === 'morning'
                    ? 'bg-white text-slate-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Morning
              </button>
              <button
                type="button"
                onClick={() => setSessionFilter('afternoon')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sessionFilter === 'afternoon'
                    ? 'bg-white text-slate-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Afternoon
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                All ({totalSlotsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('available')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  statusFilter === 'available'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Open ({availableSlotsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('booked')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  statusFilter === 'booked'
                    ? 'bg-white text-blue-800 shadow-2xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Booked ({bookedSlotsCount})</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search slot or patient..."
                value={slotSearchQuery}
                onChange={(e) => setSlotSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Main Time Slots View (Day-Wise Slots Grid) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white/30 backdrop-blur-sm">
          {filteredSlots.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <CalendarDays className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No Time Slots Match the Active Filters</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try switching between Morning and Afternoon, or reset the search query to view available slots.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSessionFilter('all');
                  setSlotSearchQuery('');
                }}
                className="mt-3.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Morning Session */}
              {filteredSlots.some((s) => s.period === 'morning') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Morning Consultation Session (08:30 AM – 01:00 PM)
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {filteredSlots.filter((s) => s.period === 'morning' && s.status === 'available').length}{' '}
                      available of{' '}
                      {filteredSlots.filter((s) => s.period === 'morning').length} slots
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {filteredSlots
                      .filter((s) => s.period === 'morning')
                      .map((slot) => (
                        <SlotCard
                          key={slot.id}
                          slot={slot}
                          onBook={() => handleOpenBooking(slot)}
                          onViewBooked={() => setSelectedBookedSlot(slot)}
                          onCancel={() => handleCancelClick(slot)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Afternoon / Evening Session */}
              {filteredSlots.some((s) => s.period === 'afternoon') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Afternoon & Evening Consultation Session (02:00 PM – 06:30 PM)
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {filteredSlots.filter((s) => s.period === 'afternoon' && s.status === 'available').length}{' '}
                      available of{' '}
                      {filteredSlots.filter((s) => s.period === 'afternoon').length} slots
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {filteredSlots
                      .filter((s) => s.period === 'afternoon')
                      .map((slot) => (
                        <SlotCard
                          key={slot.id}
                          slot={slot}
                          onBook={() => handleOpenBooking(slot)}
                          onViewBooked={() => setSelectedBookedSlot(slot)}
                          onCancel={() => handleCancelClick(slot)}
                        />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Bottom Operational Legend & Summary */}
        <div className="px-5 py-3 bg-white border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
              <span>Available Slot (Click to Book)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300" />
              <span>Booked Appointment</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
              <span>In Consultation</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-semibold text-slate-700">
            <span>
              Schedule for: <strong className="text-slate-900">{activeDate}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Doctor: <strong className="text-blue-700">{activeDoctor?.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOOKING FORM MODAL OVERLAY (When receptionist clicks an available slot) */}
      {/* ========================================================================= */}
      {selectedSlotForBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
            {/* Modal Title */}
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  <span>Book Appointment with {activeDoctor?.name}</span>
                </h4>
                <p className="text-xs text-blue-100 mt-0.5">
                  Slot: <strong className="text-white">{selectedSlotForBooking.time}</strong> • Date:{' '}
                  <strong className="text-white">{activeDate}</strong> ({activeDoctor?.specialty})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlotForBooking(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meera Shah"
                      value={bookingForm.patientName}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, patientName: e.target.value }))
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={bookingForm.patientAge}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        patientAge: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={bookingForm.patientGender}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        patientGender: e.target.value as Gender,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98250 12345"
                      value={bookingForm.patientMobile}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, patientMobile: e.target.value }))
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Booking Mode</label>
                  <select
                    value={bookingForm.appointmentType}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        appointmentType: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  >
                    <option value="Scheduled">Scheduled Appointment</option>
                    <option value="Walk-in">Walk-in (Front Desk)</option>
                    <option value="Online Appointment">Online / Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visit Type</label>
                  <select
                    value={bookingForm.visitType}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        visitType: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  >
                    <option value="New Patient">New Patient</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chief Complaint / Symptoms *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chest pain, Hypertension routine review, Knee swelling"
                    value={bookingForm.reason}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Immediate Check-in Option */}
                <div className="col-span-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingForm.checkInImmediately}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          checkInImmediately: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">
                        Check-in immediately to Reception Queue
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Adds patient directly to today's active flow and schedules doctor appointment.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Book Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BOOKED SLOT DETAIL POPOVER (View booking details, check-in, or cancel) */}
      {/* ========================================================================= */}
      {selectedBookedSlot && selectedBookedSlot.appointment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
            <div className="px-5 py-3.5 bg-blue-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">
                  Appointment Details
                </span>
                <h4 className="font-bold text-base mt-0.5">
                  {selectedBookedSlot.appointment.patientName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookedSlot(null)}
                className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedBookedSlot.time} – {selectedBookedSlot.endTime}
                  </span>
                </div>
                <span className="font-bold text-[10px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                  {selectedBookedSlot.appointment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Demographics</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700 mt-0.5">
                    <strong>{selectedBookedSlot.appointment.patientAge}Y</strong>
                    <span className="text-slate-300">•</span>
                    <span>{selectedBookedSlot.appointment.patientGender}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {selectedBookedSlot.appointment.patientMobile}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Doctor & Room</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {activeDoctor?.name} ({activeDoctor?.roomNumber})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Appointment ID</span>
                  <span className="font-bold text-blue-700 mt-0.5 block">
                    {selectedBookedSlot.appointment.patientNumber || selectedBookedSlot.appointment.patientId || 'APT-2026-904'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Complaint</span>
                <p className="font-medium text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedBookedSlot.appointment.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCancelClick(selectedBookedSlot)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedBookedSlot.appointment.patientId && onViewPatientDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        const pat = patients.find(
                          (p) => p.id === selectedBookedSlot.appointment?.patientId
                        );
                        if (pat) {
                          onViewPatientDetails(pat);
                          setSelectedBookedSlot(null);
                          onClose();
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Chart</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedBookedSlot(null)}
                    className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Slot Card Sub-component: Clean rendering of Available or Booked slot
 */
interface SlotCardProps {
  slot: DoctorTimeSlot;
  onBook: () => void;
  onViewBooked: () => void;
  onCancel: () => void;
}

const SlotCard: React.FC<SlotCardProps> = ({ slot, onBook, onViewBooked, onCancel }) => {
  const isBooked = slot.status === 'booked' && !!slot.appointment;

  if (isBooked && slot.appointment) {
    const appt = slot.appointment;
    const isConsulting = appt.status === 'In Consultation';
    const isDone = appt.status === 'Completed';

    return (
      <div
        onClick={onViewBooked}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between backdrop-blur-md ring-1 ring-slate-900/5 ${
          isConsulting
            ? 'bg-amber-50/80 border-amber-300 ring-amber-400/30'
            : isDone
            ? 'bg-white/60 border-white/70 opacity-80'
            : 'bg-white/80 border-white/80 hover:bg-white/95'
        }`}
      >
        <div>
          {/* Slot Time & Status */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{slot.time}</span>
            </span>

            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                isConsulting
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : isDone
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {appt.status}
            </span>
          </div>

          {/* Patient Name */}
          <div className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
            {appt.patientName}
          </div>

          {/* Demographic Pill */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              <span>{appt.patientAge}Y</span>
              <span className="text-slate-300">•</span>
              <span>{appt.patientGender}</span>
            </span>

            <span className="text-[10px] font-semibold text-slate-500 truncate">
              {appt.visitType}
            </span>
          </div>

          {/* Complaint / Reason */}
          <p className="text-[11px] text-slate-600 truncate mt-1.5 font-normal">
            {appt.reason}
          </p>
        </div>

        {/* Card Footer: Appointment Type & Click Prompt */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-blue-700">{appt.appointmentType || 'Scheduled'}</span>
          <span className="group-hover:text-blue-600 font-semibold transition-colors">
            View Details
          </span>
        </div>
      </div>
    );
  }

  // Available Slot Card
  return (
    <div
      onClick={onBook}
      className="p-3.5 rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 backdrop-blur-md hover:border-emerald-500 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-2xs ring-1 ring-slate-900/5"
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{slot.time}</span>
          </span>

          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            Available
          </span>
        </div>

        <div className="text-[11px] text-slate-500 mt-1 font-medium">
          20 mins consultation slot
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onBook();
        }}
        className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 bg-white border border-emerald-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Book Slot</span>
      </button>
    </div>
  );
};
