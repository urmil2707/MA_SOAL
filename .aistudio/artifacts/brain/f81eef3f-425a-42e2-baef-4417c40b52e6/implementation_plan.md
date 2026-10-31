# Full-Page Clinical Intake Workspace (Symptoms & Medical History)

Seamlessly transition MA staff from floating modal popups to a dedicated full-page clinical intake workspace with instant in-screen tab switching between Symptoms, Medical History, and Vitals, complete with back navigation and direct queue routing.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 interactive clarification and will govern the new intake architecture:

- **Confirmed Decision 1 (Display Format)**: The intake workspace opens as a full-page clinical screen replacing the card grid, featuring persistent back navigation to the patient queue rather than a floating modal dialog overlaying the UI.
- **Confirmed Decision 2 (In-Screen Switching)**: A top segmented tab bar allows staff to switch seamlessly between **Symptoms Intake** and **Medical History** (plus vitals overview) inside the active patient's screen without closing the view.
- **Confirmed Decision 3 (Completion & Routing)**: The primary actions allow staff to either save progress and return to the MA Home queue or save and route the patient directly to the assigned Doctor's consultation queue with complete timeline audit logs.

---

## 1. Overview & Core Concept

Currently, clicking "Symptoms" or "Med History" on a patient card in the Medical Assistant (MA) workspace triggers standalone floating popup dialogs (`SymptomsIntakeModal.tsx` and `MedicalHistoryIntakeModal.tsx`). This forces medical assistants into narrow modal windows, obscures patient context, and requires closing one modal to open another.

The new **Full-Page Clinical Intake Workspace** (`ClinicalIntakeScreen.tsx`) replaces both popups with a dedicated, high-contrast clinical assessment view:
- **Zero Modal Overlay**: Replaces the grid with an expansive, ergonomic workspace designed for clinical documentation.
- **In-Screen Tab Switcher**: Staff switch instantly between **1. Symptoms Evaluation** and **2. Comprehensive Medical History** with zero context loss.
- **Integrated Patient Summary Header**: Shows patient MRN, age/gender, vitals glance, chief complaint, and assigned physician.
- **Direct Dual-Action Footer**:
  - `Save & Route to Doctor Queue` (Primary action with green/teal prominence)
  - `Save Draft & Return to Queue` (Secondary action)
  - `Cancel / Back` (With discard confirmation if changes are unsaved)

---

## 2. User Experience & Visual Design

### A. Key User Flows

1. **Entering Intake**:
   - From the MA Home Screen or Reception Desk, staff click **"Symptoms"** or **"Med History"** on any patient card in `ASSESSMENT` (or `CHECK-IN`).
   - The workspace smoothly switches to the full-page **Clinical Intake Workspace**, pre-selecting the clicked tab (Symptoms or Medical History).
2. **Switching Between Intakes In-Screen**:
   - Inside the screen, a top segmented pill/bar provides instant switching:
     - `[ Activity: Symptoms Intake ]` (Badged with count of logged symptoms)
     - `[ FileText: Medical History (6 Groups) ]` (Badged with verified conditions/allergies)
     - `[ Heart: Vitals & Hemodynamics ]` (Quick review of BP, HR, Temp, SpO2, and BMI)
   - State for both Symptoms and Medical History remains active in memory—staff can document symptoms, jump to medical history to record chronic hypertension or penicillin allergy, and jump back without losing unsaved fields.
3. **Completing & Routing**:
   - Staff click **"Save & Route to Dr. [Name]'s Queue"**.
   - The patient's status updates from `ASSESSMENT` to `IN QUEUE`, an audit log is appended to `activityTimeline`, and the screen smoothly transitions back to the MA Home Screen with a success notification.

### B. Visual Identity & Spatial Layout

- **Header Bar**:
  - Left: Universal Back button (`← Back to Queue`) + Patient Identity (`Aarav Patel · STP-000412 · 42M`).
  - Center: Segmented Navigation Bar (`Symptoms Intake` | `Medical History` | `Vitals Glance`).
  - Right: Assigned Doctor Badge (`Dr. Rajesh Iyer · Room 104`) + Current Time.
- **Content Area**:
  - High-contrast, clean 2-column or structured section layout avoiding "cards-within-cards".
  - **Symptoms Tab**: Smart suggestion chips based on complaint, 6 clinical body systems (Cardiovascular, Respiratory, Gastrointestinal, Neurological, Musculoskeletal, General), symptom character, onset, severity, radiation, and suspect diagnosis.
  - **Medical History Tab**: 6 core clinical groups (Active Conditions, Allergies & Sensitivities, Current Medications, Surgical & Hospitalization History, Family Genetic History, Lifestyle & Habits).
- **Sticky Actions Footer**:
  - Prominent dual buttons with clear hierarchy:
    - Primary CTA: `Save & Route to Doctor Queue →`
    - Secondary: `Save Draft`
    - Tertiary: `Cancel`

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Workspace Architecture** | Dedicated Full-Page View (`activeIntakePatient` state in `MAHomeScreen`) | Eliminates modal clipping and allows medical assistants to use 100% of the screen width for dense clinical checklists. |
| **Tab Switching Pattern** | Segmented top bar with shared patient state buffer | Medical assistants frequently cross-reference symptoms with medical history (e.g. chest pain with past cardiac history); tab switching within the same screen prevents cognitive fatigue. |
| **Component Reusability** | Refactor core form content from `SymptomsIntakeModal` and `MedicalHistoryIntakeModal` into modular embedded sub-components | Keeps existing field logic, auto-classification heuristics, and symptom suggestion algorithms intact without code duplication. |
| **Modal Fallback Preservation** | Retain modular export so Reception or quick view can still invoke modal if ever needed, while MA defaults to full-screen | Ensures zero breaking changes for existing workflows while fulfilling the full-screen requirement. |

---

## 4. Technical Architecture & Component Hierarchy

### System Hierarchy Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Main Controller)                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   Reception Desk View                       MAHomeScreen.tsx
   (Header + Status + Sections)              (Medical Assistant)
                                                         │
                        ┌────────────────────────────────┴────────────────┐
                        │ activeIntakePatient === null                    │ activeIntakePatient !== null
                        ▼                                                 ▼
             MA Patient Queue View                        ClinicalIntakeScreen.tsx (Full-Page)
             - Triage Filter Tabs                         ├─ Sticky Header (Back + Patient Info)
             - Patient Cards Grid                         ├─ Segmented Tabs (Symptoms / History / Vitals)
             - Doctors Queue Columns                      ├─ SymptomsIntakeView (Full Width)
                                                          ├─ MedicalHistoryIntakeView (Full Width)
                                                          └─ Bottom Action Bar (Save & Route to Queue)
```

### Component & State Mapping

1. **`src/components/ClinicalIntakeScreen.tsx` (New Component)**:
   - Props:
     - `patient: Patient`
     - `initialTab: 'symptoms' | 'history' | 'vitals'`
     - `doctors: Doctor[]`
     - `onBack: () => void`
     - `onSaveAndRouteToDoctor: (patientId: string, symptomsData: any, historyData: any) => void`
     - `onSaveDraft: (patientId: string, symptomsData: any, historyData: any) => void`
   - State:
     - `activeTab: 'symptoms' | 'history' | 'vitals'`
     - Local buffered symptoms state (`DetailedSymptom[]`, `suspectDisease`, `maNotes`)
     - Local buffered medical history state (`MedicalRecordEntry`)
2. **`src/components/MAHomeScreen.tsx` (Updated)**:
   - Add state: `activeIntakePatient: { patient: Patient; tab: 'symptoms' | 'history' } | null`.
   - Update patient card click handlers: clicking "Symptoms" or "Med History" sets `activeIntakePatient` instead of opening the popup modal.
   - When `activeIntakePatient` is truthy, render `<ClinicalIntakeScreen ... />` in place of the card queue.
   - Provide `onBack={() => setActiveIntakePatient(null)}` to return immediately to the queue.
3. **Queue Transition Logic**:
   - Saving and routing updates the patient record, marks assessment modules complete, moves patient status to `IN QUEUE`, logs the transition to `activityTimeline`, and returns to the queue with visual toast confirmation.

---

## 5. Verification Plan

1. **Interactive Verification**:
   - Open MA Workspace via profile menu.
   - Click "Symptoms" on any patient awaiting assessment (e.g. STP-000412).
   - Verify the screen transforms into the **Full-Page Clinical Intake Screen** (not a modal popup).
   - Click the top segmented tab to switch to **Medical History**; verify instant in-screen switching.
   - Fill in a symptom (e.g. Chest pain) and a medical condition (e.g. Hypertension), switch tabs, and verify data persists.
   - Click **Save & Route to Doctor Queue**; verify patient transfers to `IN QUEUE` and the screen returns to MA Home.
   - Test clicking the **Back button** to ensure safe return to queue.
2. **Build & Type Check**:
   - Run `compile_applet` to ensure TypeScript compilation succeeds without errors.
   - Run `lint_applet` to confirm zero lint regressions.
