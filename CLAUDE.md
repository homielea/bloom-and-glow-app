# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Requirements & Standards

### PRD — Menopause App

**Date:** Aug 2025  
**Owner:** Lea Hauser  

**Purpose:** A supportive app for women in peri/menopause to **track symptoms, gain education, and feel empowered**.

**SLC Commitment:**
- **Simple:** Symptom tracker + AI tips  
- **Lovable:** Empowering UI (not clinical)  
- **Complete:** Track → tip → progress  

**Problem Statement:** Menopause is stigmatized; women lack empowering, holistic tools.

**Goals & Metrics:**
- Daily log >40%  
- Delight >80%  

**Scope:**
- **Must:** tracker, AI tips, progress  
- **Should:** nutrition, podcasts  
- **Won't:** wearables (phase 2)  

**Risks:** Avoid "medical app" stigma

### Development Mode

**Prototype Mode: ON** - This allows for relaxed standards during rapid iteration, but production features must meet full standards before release.

### Polypreneur OS Coding Standards

**Key Rules to Follow:**

**Before Coding:**
- Ask clarifying questions before coding
- Draft and confirm approach for complex work
- In MVP mode, validate raw ideas quickly but plan fully before shipping

**While Coding:**
- Use existing domain vocabulary for naming
- Keep functions simple, composable, and testable
- Use `import type { ... }` for type-only imports
- Default to `type`; use `interface` only when needed
- Avoid unnecessary comments - rely on self-explanatory code

**Testing:**
- Colocate simple function tests in `*.spec.ts`
- Favor integration tests over heavy mocking
- Test entire output in one assertion where possible

**Git & Commits:**
- Use Conventional Commits
- Don't mention AI tools in commit messages
- Commit MVPs as `feat:` and refinements as `fix:` or `refactor:`

## Development Commands

**Start development server:**
```bash
npm run dev
# Runs on http://localhost:8080
```

**Build:**
```bash
npm run build              # Production build
npm run build:dev          # Development build
```

**Linting:**
```bash
npm run lint               # Run ESLint
```

**Preview:**
```bash
npm run preview            # Preview production build
```

## Architecture Overview

This is a **React PWA (Progressive Web App) for menopause wellness tracking** built with:

- **Frontend:** React 18 + TypeScript + Vite
- **UI Library:** shadcn/ui components with Radix UI primitives
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL database + Auth + Edge Functions)
- **State Management:** React Context (`AppContext`) + TanStack Query
- **Routing:** Single-page app with conditional rendering (no React Router for pages)

### Key Architecture Patterns

**Single-Page Navigation:** The app uses section-based navigation managed by `currentSection` state in `AppContext` rather than traditional routing. Main sections are rendered conditionally in `App.tsx:64-101`.

**Authentication Flow:** 
1. `AuthPage` → 2. `OnboardingQuiz` → 3. `PersonaReveal` → 4. `Dashboard`

**Component Organization:**
- `src/components/` - All React components (flat structure)
- `src/components/ui/` - shadcn/ui components
- `src/contexts/AppContext.tsx` - Central state management
- `src/types/` - TypeScript interfaces
- `src/data/` - Static data (personas, content library, quiz questions)

### Database Integration

**Supabase Client:** Configured in `src/integrations/supabase/client.ts`

**Key Tables:**
- `profiles` - User profiles with persona data
- `daily_checkins` - Health tracking data  
- `health_tracker_connections` - Wearable device connections
- `health_tracker_data` - Synced health data from devices

**Edge Functions:** Located in `supabase/functions/` for OAuth integrations (Fitbit, Oura)

### Health Tracking Integration

The app supports wearable device integration through:
- OAuth flows for Fitbit (`supabase/functions/fitbit-oauth/`)
- OAuth flows for Oura Ring (`supabase/functions/oura-oauth/`)
- Data synchronization (`supabase/functions/sync-health-data/`)

### PWA Features

- Service worker registration in `main.tsx`
- PWA manifest in `public/manifest.json`
- Install prompt component (`PWAPrompt.tsx`)

### State Management Patterns

**AppContext provides:**
- Authentication state (`user`, `session`)
- Health tracking data management
- Navigation state (`currentSection`)
- Supabase operations (CRUD for check-ins, health data)

**Component Communication:**
- Props for navigation callbacks (`onNavigate`, `onComplete`)
- Context for shared state access
- Toast notifications via Sonner

### Styling System

- **Tailwind CSS** with custom configuration
- **CSS Custom Properties** for theme colors
- **Responsive Design** using Tailwind breakpoints
- **Component Variants** using `class-variance-authority`

### Development Notes

**Path Aliases:** `@/` maps to `src/` directory

**TypeScript Config:** Relaxed settings with `noImplicitAny: false` and `strictNullChecks: false`

**Component Structure:** Most components are self-contained with their own state management, connecting to `AppContext` for shared data

**Data Flow:** 
1. User interactions update local state
2. Local state syncs to Supabase via `AppContext` methods
3. UI reflects changes through context subscriptions