import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Search,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  BellRing,
  SlidersHorizontal,
  User,
  Settings,
  HelpCircle,
  Lock,
  LogOut,
  ShieldCheck,
  RotateCcw,
  LayoutGrid,
  FlaskConical,
  Sparkles,
  Activity,
  Users,
  Check,
} from 'lucide-react';
import { Doctor, Patient } from '../types';

interface HeaderProps {
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
  specialties: string[];
  selectedDoctorId: string;
  onDoctorChange: (doctorId: string) => void;
  doctors: Doctor[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenBookAppointment: () => void;
  onOpenDoctorCalendar: () => void;
  onOpenLayoutCustomizer: () => void;
  activeLayoutMode: 'kanban' | 'grid';
  onToggleLayoutMode: () => void;
  labAlertPatients?: Patient[];
  onSelectAlertPatient?: (patient: Patient) => void;
  onSimulateLabAlert?: () => void;
  activeWorkspace?: 'reception' | 'ma';
  onSwitchWorkspace?: (workspace: 'reception' | 'ma') => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedBranch,
  onBranchChange,
  selectedSpecialty,
  onSpecialtyChange,
  specialties,
  selectedDoctorId,
  onDoctorChange,
  doctors,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  onOpenBookAppointment,
  onOpenDoctorCalendar,
  onOpenLayoutCustomizer,
  activeLayoutMode,
  onToggleLayoutMode,
  labAlertPatients = [],
  onSelectAlertPatient,
  onSimulateLabAlert,
  activeWorkspace = 'reception',
  onSwitchWorkspace,
}) => {
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLabAlertsMenu, setShowLabAlertsMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const branchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const labAlertRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setShowBranchMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (labAlertRef.current && !labAlertRef.current.contains(event.target as Node)) {
        setShowLabAlertsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const branches = [
    'Satyam Clinic, Paldi (Main)',
    'Navrangpura Satellite Branch',
    'Bodakdev Specialty Center',
  ];

  // Filtered doctors for dropdown
  const filteredDoctors =
    selectedSpecialty === 'All Specialties'
      ? doctors
      : doctors.filter((d) => d.specialty === selectedSpecialty);

  const handlePrevDay = () => {
    onDateChange('03 Sep 2026');
  };

  const handleNextDay = () => {
    onDateChange('05 Sep 2026');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/80 shadow-xs ring-1 ring-slate-900/5">
      {/* Top Tier: Soltech Identity, Filters, Controls & Receptionist Profile */}
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap lg:flex-nowrap">
        {/* Left Side: Brand Logo, Clinic Name & Branch Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Soltech Icon */}
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-2xs font-black tracking-tight text-sm ring-2 ring-blue-100">
              <span className="font-extrabold text-base">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold tracking-wider text-blue-700 uppercase leading-none">
                SOLTECH OS
              </span>
              <span className="text-xs font-semibold text-slate-500 leading-tight">Clinic Flow</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Clinic & Branch Selector */}
          <div className="relative" ref={branchRef}>
            <button
              id="branch-switcher-button"
              type="button"
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[190px] truncate">{selectedBranch}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showBranchMenu && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 py-2 z-40 ring-1 ring-slate-900/5">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Clinic Branch
                </div>
                {branches.map((branch) => (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => {
                      onBranchChange(branch);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedBranch === branch ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{branch}</span>
                    {selectedBranch === branch && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search & Specialty/Doctor Filters */}
        <div className="flex items-center gap-2.5 flex-1 max-w-2xl min-w-[280px]">
          {/* Patient Search in Bento Style */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-patient-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patient by name, ID (STP-...), or mobile..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50/80 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department / Specialty Filter */}
          <select
            id="specialty-filter-select"
            value={selectedSpecialty}
            onChange={(e) => {
              onSpecialtyChange(e.target.value);
              onDoctorChange('all');
            }}
            className="text-xs bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hidden md:block shadow-2xs"
          >
            <option value="All Specialties">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Doctor Filter */}
          <select
            id="doctor-filter-select"
            value={selectedDoctorId}
            onChange={(e) => onDoctorChange(e.target.value)}
            className="text-xs bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hidden lg:block shadow-2xs"
          >
            <option value="all">All Doctors</option>
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Live Date & Time, Doctor Calendar, View Toggle, Book Appointment & Receptionist Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Date & Time Display with Glass Effect */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-md border border-white/80 text-xs font-semibold text-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-slate-800">{selectedDate}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-mono tabular-nums font-bold text-blue-900">{currentTime}</span>
            </div>
          </div>

          {/* Doctor Calendar View Button (Preserved in Header) */}
          <button
            id="doctor-calendar-header-btn"
            type="button"
            onClick={onOpenDoctorCalendar}
            title="Open Doctor Day-wise Schedule & Slot Availability"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/90 hover:border-blue-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer backdrop-blur-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Doctor Calendar</span>
          </button>

          {/* View Layout Toggle (Kanban Columns vs Grid) */}
          <button
            id="toggle-layout-view-button"
            type="button"
            onClick={onToggleLayoutMode}
            title={activeLayoutMode === 'kanban' ? 'Switch to Grid View' : 'Switch to Flow Columns View'}
            className="p-1.5 text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Real-time Lab Reports Notification Bell Icon */}
          <div className="relative" ref={labAlertRef}>
            <button
              id="header-notification-bell-btn"
              type="button"
              onClick={() => setShowLabAlertsMenu(!showLabAlertsMenu)}
              title={
                labAlertPatients.length > 0
                  ? `${labAlertPatients.length} New Laboratory Report Alert(s)`
                  : 'Diagnostic Notifications'
              }
              className={`relative p-1.5 rounded-xl border transition-all shadow-2xs flex items-center justify-center ${
                labAlertPatients.length > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 ring-2 ring-amber-400/30'
                  : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {labAlertPatients.length > 0 ? (
                <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-500" />
              )}

              {labAlertPatients.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                  {labAlertPatients.length}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showLabAlertsMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/5">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <BellRing className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Diagnostic Lab Alerts</h4>
                      <p className="text-[10px] text-slate-500">Real-time uploaded report notifications</p>
                    </div>
                  </div>

                  {onSimulateLabAlert && (
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateLabAlert();
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors shadow-2xs"
                      title="Simulate a new incoming laboratory report"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Simulate</span>
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                  {labAlertPatients.length === 0 ? (
                    <div className="py-6 px-4 text-center text-slate-400">
                      <FlaskConical className="w-8 h-8 mx-auto mb-1.5 text-slate-300 stroke-1" />
                      <p className="font-medium text-xs text-slate-600">All Lab Reports Acknowledged</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Incoming laboratory uploads will ring here and on the patient's card.
                      </p>
                    </div>
                  ) : (
                    labAlertPatients.map((pat) => {
                      const alertItem = pat.labReportAlerts?.[0];
                      return (
                        <div
                          key={pat.id}
                          onClick={() => {
                            setShowLabAlertsMenu(false);
                            if (onSelectAlertPatient) onSelectAlertPatient(pat);
                          }}
                          className="px-4 py-2.5 hover:bg-amber-50/60 cursor-pointer transition-colors flex items-start gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/80">
                            <BellRing className="w-4 h-4 text-amber-700 animate-bounce" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 truncate group-hover:text-blue-600">
                                {pat.name}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {pat.status}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                              {alertItem?.reportName || 'Diagnostic Report Uploaded'}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                              <span>Dr. {pat.doctorName.split(' ')[1] || pat.doctorName}</span>
                              <span className="text-blue-600 font-semibold group-hover:underline">
                                Click to View Report →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Visual alerts update dynamically across all sections.</span>
                  <button
                    type="button"
                    onClick={() => setShowLabAlertsMenu(false)}
                    className="font-bold text-slate-600 hover:text-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Book Appointment Primary Button */}
          <button
            id="book-appointment-button"
            type="button"
            onClick={onOpenBookAppointment}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Book Appointment</span>
          </button>

          {/* Receptionist Profile Menu */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              id="receptionist-profile-menu-button"
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shadow-2xs">
                PS
              </div>
              <div className="text-left hidden xl:block leading-tight">
                <div className="text-xs font-bold text-slate-800">Priya Shah</div>
                <div className="text-[10px] text-slate-500 font-semibold">Receptionist</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 py-2 z-40 text-xs ring-1 ring-slate-900/5">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-800">Priya Shah</div>
                  <div className="text-[11px] text-slate-500">priya.shah@satyamclinic.in</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Reception Control Active
                  </div>
                </div>

                {/* Role / Workspace Switcher (Change between Reception and MA from Profile) */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/80 rounded-xl mx-2 my-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Clinical Role</span>
                    <span className="text-blue-600 font-bold">Switch Workspace</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      id="profile-select-reception"
                      onClick={() => {
                        onSwitchWorkspace?.('reception');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeWorkspace === 'reception'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>Reception Desk</span>
                      </div>
                      {activeWorkspace === 'reception' && (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">Current</span>
                      )}
                    </button>

                    <button
                      type="button"
                      id="profile-select-ma"
                      onClick={() => {
                        onSwitchWorkspace?.('ma');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeWorkspace === 'ma'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-teal-50 hover:text-teal-900 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>MA Assessment</span>
                      </div>
                      {activeWorkspace === 'ma' ? (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">Current</span>
                      ) : (
                        <span className="text-[10px] text-teal-700 font-semibold">Switch →</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenLayoutCustomizer();
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Dashboard Layout
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" /> Preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-400" /> Notifications (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Help & Support
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Lock Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-amber-50 flex items-center gap-2 text-amber-900 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-700" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
