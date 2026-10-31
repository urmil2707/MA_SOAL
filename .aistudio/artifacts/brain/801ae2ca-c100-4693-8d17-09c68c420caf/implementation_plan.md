# Clickable Clinical Evidence & Universal Back Navigation in SoalTech

Comprehensive architectural plan to implement clickable clinical evidence deep-linking throughout the AI Clinical Case Presentation & Medical Insights component, paired with a universal, context-preserving Back navigation bar across all views in SoalTech.

---

## User Review & Clarifications Incorporated

> [!IMPORTANT]
> The following architectural decisions directly reflect the user's choices from Phase 1:
> - **Universal Back Navigation**: Rendered as a persistent **sticky header bar button with previous location label** (e.g. `← Back to Patient Overview`, `← Back to Lab Reports`, `← Back to Consultation Queue`) across all pages, modal views, and tabs, preserving user context (active tab, scroll position, expanded cards, report filters).
> - **Clickable Clinical Evidence Interaction**: Every clinical term, vital metric, lab finding, symptom, or medication mentioned in the AI Clinical Presentation is an interactive evidence token. **Hovering displays a source preview card** (source document/report title, extraction date, verification badge, and "View Original Source" action). **Clicking immediately deep-links** to the exact source tab, report, or form row.
> - **Source Evidence Highlighting**: Navigating from any evidence link performs a **smooth scroll to the target element with a pulsating glow highlight** (amber-teal clinical ring with pulse animation) that automatically draws attention to the exact supporting data.

---

## 1. System Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. AI CLINICAL CASE PRESENTATION (Top of Workspace / Tabs)                  │
│                                                                             │
│ "Patient presents with exertional chest pain [①] and elevated BP 160/96 [②] │
│  Recent HbA1c 7.8% [③] and Creatinine 1.3 mg/dL [④] indicate nephropathy..."│
│                                                                             │
│  [Hover on ①] ──► Shows Hover Preview Card:                                 │
│                   ┌──────────────────────────────────────────────────────┐  │
│                   │ 📄 Source: Presenting Symptoms Intake Form           │  │
│                   │ 📅 Recorded: 04 Jun 2026, 09:30 AM · Verified by MA  │  │
│                   │ 💬 "Pain scale 7/10, worse with walking"             │  │
│                   │ [ Click to View Original Record → ]                 │  │
│                   └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Click on Evidence Token)
                                       │ 1. Push current view & scroll to Nav Stack
                                       │ 2. Switch tab / open target modal
                                       │ 3. Smooth scroll to element ID
                                       │ 4. Apply pulsating glow highlight
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. TARGET SOURCE VIEW (e.g., Records Tab / Pathology Lab Report)            │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⬅ Back to AI Case Presentation (or previous view)                       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ City Diagnostics Laboratory — Lipid & Renal Profile                     │ │
│ │                                                                         │ │
│ │ 🌟 [ Serum Creatinine: 1.3 mg/dL (High) ]  ◄── PULSATING GLOW HIGHLIGHT │ │
│ │    Reference: 0.7 - 1.2 mg/dL · Verified by Dr. Meera Nair              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Components & Data Structures

### A. Navigation Context & History Stack (`src/context/NavigationContext.tsx`)
A universal navigation context managing breadcrumb state, history stack, and deep-link target restoration:
- **`NavigationEntry`**:
  ```ts
  interface NavigationEntry {
    view: 'patient-list' | 'patient-detail' | 'doctor-view' | 'trends-view';
    patientId?: string;
    tab?: string; // 'overview' | 'records' | 'vitals' | 'symptoms' | 'history' | 'trends' | 'doctor-view'
    sectionId?: string;
    targetElementId?: string;
    reportId?: string;
    scrollPosition?: number;
    label: string; // e.g. "AI Case Presentation", "Today's Consultation", "Patient Overview"
    timestamp: number;
  }
  ```
- **Methods**:
  - `pushNavigation(entry)`: Records current position before jumping.
  - `goBack()`: Pops previous entry, smoothly returns to previous tab/view, and restores scroll position.
  - `canGoBack`: Boolean indicating if previous stack entries exist.
  - `previousLabel`: Human-readable label for sticky button (e.g., `"Back to AI Case Presentation"`).
  - `highlightTarget(elementId: string)`: Activates pulsating highlight on element for 3 seconds.

### B. Universal Back Button Component (`src/components/UniversalBackButton.tsx`)
- Renders as a fixed or sticky navigation header bar with high contrast clinical styling.
- Features left-arrow icon, dynamic `"Back to [Previous Location]"` label, and optional keyboard shortcut hint (`Esc` or `Alt + ←`).
- Seamlessly fits into:
  - Global top navbar for page-level navigation
  - Sticky header bar of `PatientDetailModal`
  - Specialized Doctor View & Trends dashboards

### C. Clinical Evidence Link & Hover Preview (`src/components/ClinicalEvidenceLink.tsx`)
- Wraps any clinical phrase or parameter into an interactive inline evidence token.
- **Visuals**: Distinct subtle underline (`border-b border-teal-400/60 font-medium text-teal-900 hover:text-teal-700 hover:bg-teal-50/80 rounded px-1 -mx-1 transition-all cursor-pointer inline-flex items-center gap-0.5`).
- **Hover Card**:
  - Floating tooltip card anchored via CSS `group-hover` or portal with micro-arrow.
  - Displays:
    - Evidence Category tag (`Lab Result`, `Vital Sign`, `Intake Symptom`, `Medical History`, `Imaging Report`)
    - Source Document Title (e.g., `"Lipid Profile - 03 Jun 2026"`, `"ECG Report - 12 Jan 2025"`)
    - Timestamp & Verification status (`Verified by Dr. Meera Nair`, `Patient-Reported Intake`)
    - Snippet of original text / raw recorded values
    - Direct Call-To-Action: `"View Original Source →"`
- **Click Handling**:
  - Dispatches deep navigation to `targetTab` (`records`, `vitals`, `symptoms`, `history`, `trends`).
  - Passes `targetElementId` (e.g. `evidence-vital-bp`, `evidence-lab-creatinine`, `evidence-symptom-chest-pain`).
  - Triggers scroll & pulsating glow on the target element.

### D. Deep-Link Target Highlighting Utility (`src/utils/evidenceHighlighter.ts`)
- Implements:
  ```ts
  export function scrollToAndHighlight(elementId: string, customPulseClass?: string)
  ```
- Finds the DOM element by ID.
- Issues `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
- Applies CSS classes for pulsating glow:
  - `ring-4 ring-amber-400/90 ring-offset-2 ring-offset-white bg-amber-50/60 shadow-lg animate-pulse transition-all duration-300`
- Automatically removes the highlight after 3.5 seconds with graceful fade-out.

---

## 3. Evidence Mapping Matrix across SoalTech

| Evidence Mention in AI Presentation | Source Type | Deep-Link Target Tab | Target Element ID | Hover Preview Data |
|---|---|---|---|---|
| **"Exertional chest pain (7/10)"** | Intake Symptom | `symptoms` | `symptom-item-chest-pain` | Symptoms Form · 04 Jun 2026 · Pain Scale 7/10 |
| **"BP 128/84 mmHg (Elevated)"** | Vital Sign | `vitals` | `vital-card-bp` | Manual Vitals · 04 Jun 2026 09:30 AM · MA Verified |
| **"Serum Creatinine 1.3 mg/dL"** | Lab Test | `records` | `lab-row-creatinine-03jun` | Pathology Lab · City Diagnostics · Ref < 1.2 |
| **"LDL Cholesterol 162 mg/dL"** | Lab Test | `records` | `lab-row-ldl-03jun` | Lipid Profile · 03 Jun 2026 · High Status |
| **"HbA1c 7.8%"** | Lab Test | `records` | `lab-row-hba1c-03jun` | Diabetes Panel · 03 Jun 2026 · Uncontrolled |
| **"ST-3 changes / Abnormal TMT"** | Cardiology | `records` | `report-card-tmt-12jan` | TMT Stress Report · 12 Jan 2025 · Dr. S. Menon |
| **"Type 2 Diabetes Mellitus"** | History | `medical-history` | `history-cond-diabetes` | Chronic Condition · Since 2018 · Active |
| **"Penicillin Allergy (Severe)"** | Allergy | `medical-history` | `history-allergy-penicillin` | Drug Allergy · Anaphylaxis / Rash risk |
| **"Bypass Surgery (2018)"** | Surgical | `medical-history` | `history-surg-bypass` | Major Cardiac Surgery · Past Admission |
| **"Metformin 500mg BD"** | Medication | `medical-history` | `history-med-metformin` | Oral Antidiabetic · Dosage: 500mg twice daily |

---

## 4. Implementation Steps

1. **Step 1: Navigation Context & Sticky Header Back Button**
   - Create `src/context/NavigationContext.tsx` with location stack, breadcrumbs, and target highlight dispatcher.
   - Build `src/components/UniversalBackButton.tsx` with dynamic previous location label (`← Back to [Previous Label]`), sticky bar positioning, and accessible touch target.

2. **Step 2: Interactive Clinical Evidence Tokens**
   - Create `src/components/ClinicalEvidenceLink.tsx` supporting hover preview tooltip with micro-actions and direct deep-link triggers.
   - Update `src/components/ClinicalCasePresentation.tsx`:
     - Tokenize clinical narrative sentences in HPI, Objective Findings, and Medical Insights to render interactive `ClinicalEvidenceLink`s for key clinical phrases.
     - Connect Level 3 source links to deep-link directly into specific tabs and elements.

3. **Step 3: Target Tagging & Element IDs**
   - In `PatientDetailModal.tsx` and child tabs (`RecordsTab`, `VitalsTab`, `SymptomsTab`, `MedicalHistoryTab`):
     - Assign unique `id="evidence-..."` attributes to corresponding lab rows, vitals cards, symptom items, and medical history rows.
     - Add listener to auto-scroll and trigger pulsating highlight when deep-linked.

4. **Step 4: Sticky Back Button Integration Across All Workspaces**
   - Embed `UniversalBackButton` in the sticky top header of `PatientDetailModal.tsx`.
   - Embed in `DoctorViewDashboard.tsx` and `PatientTrendsView.tsx`.
   - Ensure the Back button accurately remembers previous tabs and sub-views without losing state.

5. **Step 5: Verification & Quality Assurance**
   - Test hovering over each clinical term in Level 1 and Level 2 AI Case Presentation to verify hover card appearance.
   - Test clicking evidence links to verify instant tab switch, smooth scroll, and pulsating glow highlight.
   - Test clicking the sticky Back button to verify return to previous location and scroll restoration.
   - Validate TypeScript compilation (`compile_applet`) and code cleanliness (`lint_applet`).
