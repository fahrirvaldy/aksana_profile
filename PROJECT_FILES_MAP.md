# Aksana Business Lab - Project Files Map

Berikut adalah peta seluruh file penting (TypeScript, TSX, JSON, CSS, dan konfigurasi) di dalam proyek Aksana Business Lab:

## Root Directory
- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`
- `eslint.config.mjs`
- `GEMINI.md`
- `next.config.ts`
- `next-env.d.ts`
- `package.json`
- `package-lock.json`
- `postcss.config.mjs`
- `README.md`
- `tsconfig.json`

## Source Code (`src/`)

### App Router (`src/app/`)
- `middleware.ts`
- `[locale]/`
    - `globals.css`
    - `layout.tsx`
    - `page.tsx`
    - `dashboard/`
        - `page.tsx`
    - `kontak/`
        - `page.tsx`
    - `layanan/`
        - `page.tsx`
    - `login/`
        - `page.tsx`
    - `tools/`
        - `page.tsx`

### Components (`src/components/`)
- `Footer.tsx`
- `Navbar.tsx`
- `PageTransition.tsx`
- `ThemeProvider.tsx`
- `ThemeToggle.tsx`
- `layout/`
    - `LanguageSwitcher.tsx`
- `tools/`
    - `cac-ltv-calculator/index.tsx`
    - `cashflow-calculator/index.tsx`
    - `funnel-simulator/index.tsx`
    - `growth-simulator/index.tsx`
    - `l10-meeting/index.tsx`
    - `people-analyzer/`
        - `index.tsx`
        - `people_analyzer.tsx`
    - `production-target-simulator/index.tsx`
    - `sop-generator/index.tsx`
    - `todo-tracker/index.tsx`

### Localization & Logic (`src/i18n/`, `src/lib/`, `src/messages/`)
- `i18n/`
    - `request.ts`
    - `routing.ts`
- `lib/supabase/`
    - `client.ts`
- `messages/`
    - `en.json`
    - `id.json`

### Types (`src/types/`)
- `dom-to-image-more.d.ts`

---
*Dibuat secara otomatis pada 15 Juni 2026*
