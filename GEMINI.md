# Aksana Business Lab - Project Context

## Project Overview
Aksana Business Lab is a modern Next.js web application designed as a suite of business simulation and calculation tools. It aims to help entrepreneurs build "cleaner, growing, and more peaceful" businesses through data-driven insights and structured planning tools.

### Key Technologies
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with `aksana-glass` glassmorphism effects)
- **Animations:** Framer Motion
- **Database/Auth:** Supabase
- **Visualization:** Chart.js & React-Chartjs-2
- **Icons:** Lucide React

## Architecture & Structure
The project follows a standard Next.js App Router structure with a focus on modular "tools".

### Core Directories
- `src/app/`: Contains the application routes (Home, Dashboard, Tools, Login, etc.).
- `src/components/tools/`: The heart of the application. Each sub-directory represents a specific business tool:
  - `cac-ltv-calculator`: Customer Acquisition Cost & Lifetime Value analysis.
  - `cashflow-calculator`: Cashflow management and health scoring.
  - `funnel-simulator`: Sales funnel optimization.
  - `growth-simulator`: Growth projections and ROI.
  - `l10-meeting`: EOS-style meeting management.
  - `people-analyzer`: Organizational health and talent analysis.
  - `production-target-simulator`: Operational capacity planning.
  - `sop-generator`: Documentation automation.
  - `todo-tracker`: Internal task management.
- `src/lib/supabase/`: Supabase client configuration for data persistence.
- `src/types/`: TypeScript definitions and declarations.

## Development Workflows

### Building and Running
- **Development:** `npm run dev` (Starts Next.js dev server on port 3000)
- **Build:** `npm run build` (Production build)
- **Start:** `npm run start` (Start production server)
- **Lint:** `npm run lint` (ESLint check)

### Coding Conventions
- **Client Components:** Use the `"use client"` directive for interactive tool components.
- **Modular Tools:** Each tool should be self-contained within `src/components/tools/[tool-name]`, typically using an `index.tsx` for the main logic.
- **Visual Style:** Adhere to the "Sederhana, Terukur, dan Manusiawi" (Simple, Measured, and Human) philosophy. Use Tailwind v4 utility classes and Framer Motion for smooth transitions.
- **State Management:** Local state is preferred for calculator logic, with optional Supabase syncing for authenticated users.
- **Formatting:** Standard Prettier/ESLint configurations as defined in `eslint.config.mjs`.

## Integration Points
- **Supabase:** Used for user authentication and persisting tool data (e.g., in `CashflowCalculator`).
- **PDF Generation:** Utilizes `@react-pdf/renderer` and `jspdf` for exporting reports from various tools.
- **Image Export:** Uses `dom-to-image-more` and `html2canvas` for capturing tool visualizations.
