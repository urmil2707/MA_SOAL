import { Doctor, DoctorTimeSlot, Gender, Patient } from '../types';

export interface StandardSlotDefinition {
  time: string;
  endTime: string;
  period: 'morning' | 'afternoon';
}

export const BASE_SLOT_DEFINITIONS: StandardSlotDefinition[] = [
  // Morning Session
  { time: '08:30 AM', endTime: '08:50 AM', period: 'morning' },
  { time: '09:00 AM', endTime: '09:20 AM', period: 'morning' },
  { time: '09:30 AM', endTime: '09:50 AM', period: 'morning' },
  { time: '10:00 AM', endTime: '10:20 AM', period: 'morning' },
  { time: '10:30 AM', endTime: '10:50 AM', period: 'morning' },
  { time: '11:00 AM', endTime: '11:20 AM', period: 'morning' },
  { time: '11:15 AM', endTime: '11:35 AM', period: 'morning' },
  { time: '11:30 AM', endTime: '11:50 AM', period: 'morning' },
  { time: '12:00 PM', endTime: '12:20 PM', period: 'morning' },
  { time: '12:30 PM', endTime: '12:50 PM', period: 'morning' },

  // Afternoon / Evening Session
  { time: '02:00 PM', endTime: '02:20 PM', period: 'afternoon' },
  { time: '02:30 PM', endTime: '02:50 PM', period: 'afternoon' },
  { time: '03:00 PM', endTime: '03:20 PM', period: 'afternoon' },
  { time: '03:30 PM', endTime: '03:50 PM', period: 'afternoon' },
  { time: '04:00 PM', endTime: '04:20 PM', period: 'afternoon' },
  { time: '04:30 PM', endTime: '04:50 PM', period: 'afternoon' },
  { time: '05:00 PM', endTime: '05:20 PM', period: 'afternoon' },
  { time: '05:30 PM', endTime: '05:50 PM', period: 'afternoon' },
  { time: '06:00 PM', endTime: '06:20 PM', period: 'afternoon' },
];

export interface CustomCalendarBooking {
  id: string;
  slotId: string;
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientMobile: string;
  visitType: 'New Patient' | 'Follow-up';
  appointmentType: 'Walk-in' | 'Online Appointment' | 'Scheduled';
  reason: string;
  status: 'Scheduled' | 'Checked In' | 'In Consultation' | 'Completed' | 'Cancelled';
  tokenNumber?: string;
}

// Sample pre-seeded bookings for other days (so other days have realistic booked/available slots)
export const SEED_FUTURE_BOOKINGS: Record<string, Partial<CustomCalendarBooking>[]> = {
  '05 Sep 2026': [
    {
      doctorId: 'doc-1',
      time: '09:30 AM',
      patientName: 'Arjun K. Varma',
      patientAge: 46,
      patientGender: 'Male',
      patientMobile: '+91 98251 44521',
      visitType: 'Follow-up',
      appointmentType: 'Online Appointment',
      reason: 'Post-angioplasty 3-month review',
      status: 'Scheduled',
      tokenNumber: 'STP-B01',
    },
    {
      doctorId: 'doc-1',
      time: '11:00 AM',
      patientName: 'Geeta Ben Trivedi',
      patientAge: 58,
      patientGender: 'Female',
      patientMobile: '+91 98240 77123',
      visitType: 'New Patient',
      appointmentType: 'Scheduled',
      reason: 'Hypertension & palpitations',
      status: 'Scheduled',
      tokenNumber: 'STP-B02',
    },
    {
      doctorId: 'doc-2',
      time: '10:00 AM',
      patientName: 'Tanvi J. Parekh',
      patientAge: 29,
      patientGender: 'Female',
      patientMobile: '+91 99099 33214',
      visitType: 'New Patient',
      appointmentType: 'Online Appointment',
      reason: 'Recurrent seasonal allergies',
      status: 'Scheduled',
      tokenNumber: 'STP-B03',
    },
    {
      doctorId: 'doc-3',
      time: '09:00 AM',
      patientName: 'Manish R. Dave',
      patientAge: 51,
      patientGender: 'Male',
      patientMobile: '+91 98254 66102',
      visitType: 'Follow-up',
      appointmentType: 'Scheduled',
      reason: 'Knee osteoarthritis physiotherapy check',
      status: 'Scheduled',
      tokenNumber: 'STP-B04',
    },
  ],
  '06 Sep 2026': [
    {
      doctorId: 'doc-1',
      time: '10:30 AM',
      patientName: 'Hasmukhbhai Patel',
      patientAge: 64,
      patientGender: 'Male',
      patientMobile: '+91 98980 11223',
      visitType: 'Follow-up',
      appointmentType: 'Scheduled',
      reason: 'ECG & Lipid follow-up',
      status: 'Scheduled',
      tokenNumber: 'STP-B05',
    },
    {
      doctorId: 'doc-2',
      time: '11:30 AM',
      patientName: 'Bhavna K. Mehta',
      patientAge: 41,
      patientGender: 'Female',
      patientMobile: '+91 97230 44556',
      visitType: 'New Patient',
      appointmentType: 'Walk-in',
      reason: 'Thyroid profile consultation',
      status: 'Scheduled',
      tokenNumber: 'STP-B06',
    },
  ],
  '07 Sep 2026': [
    {
      doctorId: 'doc-1',
      time: '09:00 AM',
      patientName: 'Kunal Singhania',
      patientAge: 35,
      patientGender: 'Male',
      patientMobile: '+91 98250 88990',
      visitType: 'New Patient',
      appointmentType: 'Online Appointment',
      reason: 'Executive health cardiac screening',
      status: 'Scheduled',
      tokenNumber: 'STP-B07',
    },
    {
      doctorId: 'doc-3',
      time: '10:30 AM',
      patientName: 'Ritu N. Solanki',
      patientAge: 33,
      patientGender: 'Female',
      patientMobile: '+91 98791 22334',
      visitType: 'New Patient',
      appointmentType: 'Scheduled',
      reason: 'Lumbar spine pain after lifting',
      status: 'Scheduled',
      tokenNumber: 'STP-B08',
    },
  ],
};

/**
 * Generates day-wise time slots for a doctor on a specific date, merging today's active
 * clinic patients, pre-seeded appointments, and dynamic receptionist bookings.
 */
export function generateDoctorTimeSlots(
  doctorId: string,
  dateString: string, // e.g. '04 Sep 2026'
  patients: Patient[],
  customBookings: CustomCalendarBooking[]
): DoctorTimeSlot[] {
  const isToday = dateString.includes('04 Sep') || dateString.toLowerCase().includes('today');

  // Filter patients for this doctor on today
  const doctorPatientsToday = isToday
    ? patients.filter((p) => p.doctorAssignedId === doctorId)
    : [];

  // Filter custom bookings for this doctor & date
  const doctorCustomBookings = customBookings.filter(
    (b) => b.doctorId === doctorId && b.date === dateString && b.status !== 'Cancelled'
  );

  // Future pre-seeded bookings
  const seededForDate = (SEED_FUTURE_BOOKINGS[dateString] || []).filter(
    (s) => s.doctorId === doctorId && s.status !== 'Cancelled'
  );

  return BASE_SLOT_DEFINITIONS.map((def, index) => {
    const slotId = `slot-${doctorId}-${dateString.replace(/\s+/g, '-')}-${index}`;

    // 1. Check custom booking first
    const customMatch = doctorCustomBookings.find(
      (b) => b.time === def.time || b.slotId === slotId
    );

    if (customMatch) {
      return {
        id: slotId,
        time: def.time,
        endTime: def.endTime,
        period: def.period,
        status: 'booked',
        doctorId,
        date: dateString,
        appointment: {
          id: customMatch.id,
          patientName: customMatch.patientName,
          patientAge: customMatch.patientAge,
          patientGender: customMatch.patientGender,
          patientMobile: customMatch.patientMobile,
          visitType: customMatch.visitType,
          appointmentType: customMatch.appointmentType,
          reason: customMatch.reason,
          status: customMatch.status,
          tokenNumber: customMatch.tokenNumber || `T-${100 + index}`,
        },
      };
    }

    // 2. Check today's active in-clinic patients
    if (isToday) {
      const patientMatch = doctorPatientsToday.find(
        (p) => p.appointmentTime === def.time
      );

      if (patientMatch) {
        let apptStatus: 'Scheduled' | 'Checked In' | 'In Consultation' | 'Completed' = 'Scheduled';
        if (patientMatch.status === 'IN CONSULTATION') apptStatus = 'In Consultation';
        else if (patientMatch.status === 'DONE') apptStatus = 'Completed';
        else if (patientMatch.arrivalStatus === 'ARRIVED') apptStatus = 'Checked In';

        return {
          id: slotId,
          time: def.time,
          endTime: def.endTime,
          period: def.period,
          status: 'booked',
          doctorId,
          date: dateString,
          appointment: {
            id: patientMatch.id,
            patientId: patientMatch.id,
            patientName: patientMatch.name,
            patientAge: patientMatch.age,
            patientGender: patientMatch.gender,
            patientMobile: patientMatch.mobile,
            visitType: patientMatch.visitType,
            appointmentType: patientMatch.appointmentType,
            reason: patientMatch.assessment?.chiefComplaint || 'Consultation',
            status: apptStatus,
            tokenNumber: patientMatch.patientNumber,
          },
        };
      }
    }

    // 3. Check seeded future bookings
    const seededMatch = seededForDate.find((s) => s.time === def.time);
    if (seededMatch) {
      return {
        id: slotId,
        time: def.time,
        endTime: def.endTime,
        period: def.period,
        status: 'booked',
        doctorId,
        date: dateString,
        appointment: {
          id: seededMatch.id || `seeded-${slotId}`,
          patientName: seededMatch.patientName || 'Reserved Patient',
          patientAge: seededMatch.patientAge || 40,
          patientGender: seededMatch.patientGender || 'Male',
          patientMobile: seededMatch.patientMobile || '+91 98250 00000',
          visitType: seededMatch.visitType || 'Follow-up',
          appointmentType: seededMatch.appointmentType || 'Scheduled',
          reason: seededMatch.reason || 'Routine Checkup',
          status: seededMatch.status || 'Scheduled',
          tokenNumber: seededMatch.tokenNumber || `T-${100 + index}`,
        },
      };
    }

    // Otherwise slot is available
    return {
      id: slotId,
      time: def.time,
      endTime: def.endTime,
      period: def.period,
      status: 'available',
      doctorId,
      date: dateString,
    };
  });
}
