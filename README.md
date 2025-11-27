# SP3 Smart Desk Frontend

A React-based web application for monitoring and controlling smart standing desks with posture tracking and reminder features.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Development Guidelines](#development-guidelines)

## Overview

SP3 Frontend is a web application that connects to smart standing desks via a REST API backend. It provides users with:
- Real-time desk height monitoring and control
- Posture tracking (sitting/standing time)
- Customizable reminders for posture changes
- Height preset management
- Usage statistics and reports

## Tech Stack

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.15
- **Icons**: Lucide React
- **Charts**: Recharts 3.3.0
- **Authentication**: Supabase
- **Linting**: ESLint 9.36.0

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Layout.jsx          # Main app layout with navbar
│   ├── pages/
│   │   ├── Home.jsx            # Dashboard with tracker, reminder, and goal cards
│   │   ├── Desk.jsx            # Desk control interface
│   │   ├── Configuration.jsx   # Settings for reminders and presets
│   │   ├── Reports.jsx         # Usage statistics
│   │   ├── Profile.jsx         # User profile
│   │   ├── Settings.jsx        # App settings
│   │   └── AboutUs.jsx         # About page
│   ├── Auth.jsx                # Authentication component
│   ├── Navbar.jsx              # Navigation bar
│   └── MobileMenuButton.jsx    # Mobile menu toggle
├── contexts/
│   ├── AuthContext.jsx         # Authentication state management
│   └── PostureTimerContext.jsx # Timer and reminder logic
├── data/
│   └── navigationItems.js      # Navigation menu items
├── hooks/
│   └── useClickOutside.js      # Click outside detection hook
├── lib/
│   ├── backendAPI.js           # Backend API client
│   └── supabase.js             # Supabase client configuration
├── assets/                     # Static assets (icons, images)
├── App.jsx                     # Root component
├── main.jsx                    # App entry point
└── index.css                   # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to the backend API (default: `http://51.21.129.98:3000`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SP3-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase credentials:

   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **To get these credentials:**
   - Go to [supabase.com](https://supabase.com) and sign in
   - Select your project (or ask a team member for access)
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**
   - Paste them into your `.env.local` file

   > **Note**: Contact a team member if you need access to the existing Supabase project.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### 1. Desk Control
- **Connection**: Connect to available smart desks via selection dialog
- **Real-time Monitoring**: Live height updates (mm/cm)
- **Position Control**: Preset buttons for sitting/standing positions
- **Status Display**: Shows height, mode (sitting/standing/rising/lowering), and timer

### 2. Posture Tracking
- **Automatic Tracking**: Starts when connected to a desk
- **Mode Detection**: 90cm threshold separates sitting (< 90cm) from standing (≥ 90cm)
- **Timer**: Tracks time in current posture (milliseconds precision)
- **Persistence**: Timer continues across page navigation

### 3. Reminders
- **Separate Settings**: Independent settings for sitting and standing
- **Frequency Options**: Test intervals (5s, 10s) and real intervals (15-90 min)
- **Custom Messages**: Personalized reminder text
- **Visual Alerts**: Orange pulsing card when reminder threshold is reached
- **localStorage**: Settings persist between sessions

### 4. Configuration
- **Height Presets**: Edit sitting and standing height presets
- **Reminder Settings**: Configure frequency and messages
- **Inline Editing**: Quick preset adjustments

## Architecture

### State Management

#### Global State (Context API)
- **AuthContext**: User authentication state
- **PostureTimerContext**: Timer state, reminder settings, and tracking logic

#### Local State (App.jsx)
- `currentPage`: Active page navigation
- `heightPresets`: Desk height presets
- `isConnected`: Desk connection status
- `currentHeight`: Current desk height (mm)
- `deskId`: Connected desk identifier
- `deskName`: Connected desk name
- `showDeskDialog`: Desk selection dialog visibility

### Component Communication

```
App.jsx (Root)
  ├─ PostureTimerProvider (Global timer state)
  │   ├─ Home.jsx (Reads timer, displays reminders)
  │   ├─ Desk.jsx (Reads timer, manages tracking)
  │   └─ Configuration.jsx (Updates reminder settings)
  └─ Layout.jsx (Navigation wrapper)
```

### Timer System

The timer system works as follows:

1. **Start**: When desk connects, `startTracking()` is called with initial mode
2. **Increment**: Timer increments by 100ms every 100ms
3. **Mode Change**: When desk crosses 90cm threshold while stationary, `changeMode()` resets timer
4. **Stop**: When desk disconnects, `stopTracking()` clears timer

### Polling Mechanism

- **Location**: `Desk.jsx` → `DeskDashboard` component
- **Interval**: 500ms
- **Data**: Fetches `position_mm` and `speed_mms` from backend
- **Lifecycle**: Starts on connection, stops on disconnection

## API Integration

### Backend API (`lib/backendAPI.js`)

Base URL: `http://51.21.129.98:3000`

#### Endpoints

**Get All Desks**
```javascript
getAllDesks() // GET /api/desks
// Returns: Array of desk objects with id, name, mac_address
```

**Get Desk Data**
```javascript
getDeskData(deskId) // GET /api/desks/:id
// Returns: Desk details with state (position_mm, speed_mms, status)
```

**Update Desk Position**
```javascript
updateDeskPosition(deskId, targetHeight) // POST /api/desks/:id/state
// Body: { target_position: number }
```

### Response Format

```javascript
// Desk Object
{
  id: string,
  name: string,
  mac_address: string,
  state: {
    position_mm: number,    // Current height in millimeters
    speed_mms: number,      // Speed in mm/s (positive=rising, negative=lowering, 0=stationary)
    status: string          // "idle", "moving_up", "moving_down"
  }
}
```

## Development Guidelines

### Styling Conventions

- Use Tailwind utility classes
- Dark mode: `dark:` prefix
- Color scheme: Sky blue (`sky-600`) for primary actions, Zinc for background and other elements
- Consistent spacing: `gap-6`, `p-6`, `mb-8`

## License

This is our work please don't steal 🙏

## Team

[Add team member information here]
