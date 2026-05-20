# Deskberg - Smart Desk Frontend

React frontend for a distributed smart-desk system built as a third-semester Software Engineering project at the University of Southern Denmark.

Deskberg supports LINAK height-adjustable desks with authentication, remote desk controls, posture tracking, reminders, user settings, usage reports, and management insights. The frontend integrates with backend APIs, Supabase authentication/database services, and embedded Raspberry Pi Pico W notification workflows.

This was a team project. I owned the frontend and a large part of the application/business logic. For the detailed breakdown, see [MY_CONTRIBUTIONS.md](./MY_CONTRIBUTIONS.md).

## My Role

- Designed the full frontend experience in Figma.
- Built the React/Vite application structure, navigation, authentication flow, dashboard, desk controls, configuration, reports, profile, and management views.
- Implemented core business logic for live desk polling, desk connection state, posture mode detection, timer tracking, reminders, user settings, and usage analytics.
- Integrated the frontend with backend APIs, Supabase auth/database workflows, and embedded Pico W notification flows.
- Added Playwright end-to-end tests and deployed the frontend through Netlify from the main branch.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Supabase
- Recharts
- Lucide React
- Playwright
- Vitest
- Netlify

## Features

### Authentication and User Flow

- Supabase-based authentication
- Protected application views
- User profile and settings screens
- Navigation across dashboard, desk control, reports, profile, and management views

### Smart Desk Control

- Desk selection and connection state
- Live height polling from backend APIs
- Current height, movement state, and sitting/standing mode display
- Sitting and standing presets
- Remote target-height updates through backend integration

### Posture Tracking and Reminders

- Sitting/standing mode detection based on desk height
- Timer logic for current posture state
- Configurable sitting and standing reminders
- Persistent reminder settings
- Visual reminder state in the UI

### Reporting and Insights

- Usage reporting views
- Sitting/standing balance visualizations
- Session and posture analytics
- Management-oriented insight views

### Testing and Deployment

- Playwright end-to-end tests for authentication, navigation, and smoke flows
- Vite production build
- Netlify deployment configuration
- Environment-based Supabase configuration

## Project Structure

```text
src/
  components/
    layout/             Application layout
    pages/              Dashboard, desk, configuration, reports, profile, manager views
    Auth.jsx            Authentication UI
    Navbar.jsx          Main navigation
  contexts/
    AuthContext.jsx     Authentication state
    PostureTimerContext.jsx
  data/                 Navigation data
  hooks/                Shared React hooks
  lib/
    backendAPI.js       Backend API client
    supabase.js         Supabase client
tests/
  e2e/                  Playwright end-to-end tests
supabase/               Supabase-related project files
```

## Architecture Notes

The frontend uses React context for cross-page state that needs to survive navigation, especially authentication state and posture timer/reminder state. Desk hardware state is pulled from the backend through a small API client layer, keeping network integration separate from UI components.

The most important frontend logic is in the desk and posture workflow:

1. User connects to a desk.
2. Frontend polls the backend for current height and movement state.
3. Height and movement data are translated into sitting, standing, rising, or lowering states.
4. Timer/reminder logic updates based on posture state.
5. Dashboard and reports use that state to show behavior and usage insights.

## Running Locally

Requirements:

- Node.js 18+
- npm
- Supabase project credentials
- Access to the backend API

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Run checks:

```bash
npm run build
npm run lint
npm run test:e2e
```

## Environment

The frontend expects Supabase credentials and a backend API. The Netlify configuration proxies `/api/*` requests to the deployed backend used during the semester project.

No secrets should be committed. Use `.env.local` for local credentials and `.env.example` as the public reference.
