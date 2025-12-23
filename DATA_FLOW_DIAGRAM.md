# Smart Desk App - Data Flow Diagram

## Complete System Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        User[👤 User]
        Home[🏠 Home Page]
        Desk[🪑 Desk Page]
        Reports[📊 Reports Page]
        Manager[👥 Manager Dashboard]
        Config[⚙️ Configuration Page]
        Profile[👤 Profile Page]
        
        User --> Home
        User --> Desk
        User --> Reports
        User --> Manager
        User --> Config
        User --> Profile
    end

    subgraph "Component Layer"
        Navbar[📱 Navbar]
        Auth[🔐 Auth Component]
        Layout[📐 Layout]
        MobileMenu[📱 Mobile Menu]
        
        Layout --> Navbar
        Layout --> MobileMenu
    end

    subgraph "Context Layer - State Management"
        AuthContext[🔐 AuthContext<br/>- user<br/>- userRole<br/>- isManager<br/>- loading]
        PostureTimer[⏱️ PostureTimerContext<br/>- currentMode<br/>- timeInCurrentMode<br/>- isTracking<br/>- reminders]
        DeskContext[🪑 DeskContext<br/>- isConnected<br/>- deskId<br/>- currentHeight<br/>- targetHeight<br/>- polling 500ms]
    end

    subgraph "Service Layer"
        BackendAPI[🌐 backendAPI.js<br/>- getDeskData<br/>- updateDeskPosition]
        PostureData[💾 postureData.js<br/>- createPostureSession<br/>- endPostureSession<br/>- logPostureChange<br/>- getPostureSessions<br/>- getPostureChanges]
        PostureAnalytics[📈 postureAnalytics.js<br/>- calculateDailyStats<br/>- getWeeklyStats<br/>- msToHours<br/>- calculatePostureBalance]
        ManagerAnalytics[👥 managerAnalytics.js<br/>- getUserPostureRankings<br/>- getOrganizationStats<br/>- getUserEmail]
        Supabase[📦 supabase.js<br/>- Supabase Client]
    end

    subgraph "External Services"
        BackendServer[🖥️ Backend Server<br/>HTTP://51.21.129.98:3000<br/>- Desk Control API]
        SupabaseDB[(🗄️ Supabase Database<br/>- auth.users<br/>- profiles<br/>- user<br/>- desk<br/>- posture_sessions<br/>- posture_changes<br/>- user_desk_presets<br/>- desk_global_presets<br/>- notifications)]
    end

    %% Authentication Flow
    Auth --> AuthContext
    AuthContext --> Supabase
    Supabase --> SupabaseDB
    SupabaseDB -->|user data + role| AuthContext
    Profile --> AuthContext

    %% Desk Control Flow
    Desk --> DeskContext
    DeskContext --> BackendAPI
    BackendAPI --> BackendServer
    BackendServer -->|desk state| BackendAPI
    BackendAPI -->|height, speed| DeskContext
    DeskContext -->|sync to DB| Supabase
    Supabase -->|save desk state| SupabaseDB

    %% Posture Tracking Flow
    Desk -->|start/stop tracking| PostureTimer
    DeskContext -->|mode detection| PostureTimer
    PostureTimer --> PostureData
    PostureData --> Supabase
    Supabase -->|save sessions| SupabaseDB
    PostureTimer -->|notifications| User

    %% Reports Flow
    Reports --> PostureAnalytics
    PostureAnalytics --> PostureData
    PostureData --> Supabase
    Supabase -->|fetch sessions| SupabaseDB

    %% Manager Flow
    Manager --> ManagerAnalytics
    ManagerAnalytics --> Supabase
    Supabase -->|all users data| SupabaseDB
    AuthContext -->|role check| Manager

    %% Configuration Flow
    Config --> Supabase
    Supabase -->|presets| SupabaseDB
    Config --> PostureTimer

    %% Navigation
    Navbar --> AuthContext
    Navbar -->|role-based menu| Manager

    %% Styling
    classDef contextStyle fill:#4a90e2,stroke:#2e5c8a,color:#fff
    classDef serviceStyle fill:#50c878,stroke:#2d7a4a,color:#fff
    classDef externalStyle fill:#ff6b6b,stroke:#c44444,color:#fff
    classDef uiStyle fill:#9b59b6,stroke:#6c3483,color:#fff
    
    class AuthContext,PostureTimer,DeskContext contextStyle
    class BackendAPI,PostureData,PostureAnalytics,ManagerAnalytics,Supabase serviceStyle
    class BackendServer,SupabaseDB externalStyle
    class Home,Desk,Reports,Manager,Config,Profile,Navbar,Auth,Layout uiStyle
```

## Detailed Data Flows

### 1. Authentication Flow
```
User Login
    ↓
Auth Component
    ↓
AuthContext.signIn()
    ↓
Supabase Auth
    ↓
auth.users table
    ↓
profiles table (fetch role)
    ↓
AuthContext (user, userRole, isManager)
    ↓
All protected components
```

### 2. Desk Control Flow
```
User clicks "Connect"
    ↓
DeskContext.connectToDesk()
    ↓
backendAPI.getDeskData()
    ↓
Backend Server (HTTP GET)
    ↓
Backend returns {deskData: {height, speed, ...}}
    ↓
DeskContext state update
    ↓
Start 500ms polling interval
    ↓
Every 500ms: fetch desk state
    ↓
Mode detection (height > 900mm = standing)
    ↓
PostureTimerContext.changeMode()
    ↓
Save to posture_sessions table
```

### 3. Position Change Flow
```
User clicks preset button
    ↓
DeskContext.moveDeskToHeight(height)
    ↓
backendAPI.updateDeskPosition(deskId, height)
    ↓
Backend Server (HTTP POST)
    ↓
Desk motor moves
    ↓
Polling detects height change
    ↓
When speed === 0 (stopped):
    ↓
Sync final height to desk table
```

### 4. Posture Tracking Flow
```
User on Desk page + connected
    ↓
PostureTimerContext.startTracking(mode, height, deskId)
    ↓
postureData.createPostureSession()
    ↓
INSERT into posture_sessions table
    ↓
Timer starts (Date.now() based)
    ↓
User changes position
    ↓
DeskContext detects mode change
    ↓
PostureTimerContext.changeMode(newMode, height, deskId)
    ↓
postureData.endPostureSession() + logPostureChange()
    ↓
UPDATE posture_sessions + INSERT posture_changes
    ↓
postureData.createPostureSession() (new session)
    ↓
Timer resets for new mode
```

### 5. Reports Generation Flow
```
User navigates to Reports
    ↓
Reports.jsx useEffect
    ↓
postureAnalytics.getWeeklyStats(userId, 7)
    ↓
postureData.getPostureSessions(userId, dateRange)
    ↓
Supabase query posture_sessions
    ↓
Calculate aggregations (sitting/standing time, averages)
    ↓
Transform data for charts
    ↓
postureAI.generatePostureInsights(stats)
    ↓
Gemini API request
    ↓
AI returns {habits, tips}
    ↓
Render charts + AI insights
    ↓
Fallback to rule-based analysis if AI fails
```

### 6. Manager Dashboard Flow
```
Manager logs in
    ↓
AuthContext fetches role from profiles table
    ↓
Navbar shows Manager menu item (if isManager)
    ↓
Manager navigates to /manager
    ↓
Manager.jsx useEffect
    ↓
managerAnalytics.getUserPostureRankings(7)
    ↓
Supabase query posture_sessions (ALL users via RLS)
    ↓
Group by user_id, calculate metrics
    ↓
Sort by balance score
    ↓
Parallel fetch user emails from user table
    ↓
Render rankings table + org stats
```

### 7. Notification Flow
```
PostureTimerContext monitors timeInCurrentMode
    ↓
Check reminder settings (localStorage)
    ↓
Time >= reminder.frequency?
    ↓
useNotifications.sendPostureReminder()
    ↓
Browser Notification API
    ↓
User sees desktop notification
```

## Database Schema Relationships

```mermaid
erDiagram
    AUTH_USERS ||--o{ PROFILES : has
    AUTH_USERS ||--o{ USER : references
    AUTH_USERS ||--o{ DESK : owns
    AUTH_USERS ||--o{ POSTURE_SESSIONS : tracks
    AUTH_USERS ||--o{ POSTURE_CHANGES : logs
    AUTH_USERS ||--o{ USER_DESK_PRESETS : creates
    
    DESK ||--o{ POSTURE_SESSIONS : "used for"
    DESK ||--o{ POSTURE_CHANGES : "used for"
    DESK ||--o{ USER_DESKS : "linked in"
    
    USER ||--o{ USER_DESKS : has
    
    PROFILES {
        uuid user_id PK
        text role
    }
    
    POSTURE_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid desk_id FK
        text mode
        timestamp start_time
        timestamp end_time
        int duration_ms
        int start_height_mm
        int end_height_mm
    }
    
    POSTURE_CHANGES {
        uuid id PK
        uuid user_id FK
        uuid desk_id FK
        text from_mode
        text to_mode
        timestamp changed_at
        int height_mm
    }
```

## Key Features Summary

### ✅ Implemented Features

1. **Authentication System**
   - Sign up / Sign in / Sign out
   - Role-based access (user / manager)
   - Profile management
   - RLS security policies

2. **Desk Control**
   - Real-time desk connection
   - Position control (move to height)
   - Live height monitoring (500ms polling)
   - Preset management (global + user)
   - Auto-reconnect on Connect button

3. **Posture Tracking**
   - Automatic mode detection (sitting/standing)
   - Timestamp-based timer (browser-throttle resistant)
   - Session recording to database
   - Change event logging
   - Configurable reminders

4. **Reports & Analytics**
   - 7-day posture history
   - Sitting vs standing charts
   - Posture change frequency
   - Session duration analysis
   - AI-powered insights (Gemini)
   - Fallback rule-based analysis

5. **Manager Dashboard**
   - Organization-wide statistics
   - User posture rankings
   - Balance score calculation
   - Read-only access to all data

6. **Configuration**
   - Height preset management
   - Reminder settings
   - Dark mode support

## Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **Backend**: Node.js REST API (external)

## Security Implementation

- **Row Level Security (RLS)**: Users see only their own data
- **Manager Policies**: `is_manager()` function with SECURITY DEFINER
- **API Keys**: Environment variables (.env)
- **Authentication**: JWT tokens via Supabase
- **HTTPS**: SSL encryption for all API calls
