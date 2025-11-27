import { useState, useEffect } from 'react';
import { Save, RefreshCw, Zap, Bell, Palette, Ruler, Settings as SettingsIcon, Clock, BarChart3 } from 'lucide-react';

export default function Configuration() {
  // Desk Connection Settings
  const [apiUrl, setApiUrl] = useState('http://51.21.129.98:3000');
  const [apiKey, setApiKey] = useState('');
  const [deskId, setDeskId] = useState('');
  
  // Appearance Settings
  const [darkMode, setDarkMode] = useState(false);
  const [followSystemTheme, setFollowSystemTheme] = useState(false); // ✅ NEW STATE
  const [reduceMotion, setReduceMotion] = useState(false);
  
  // Units Preference
  const [heightUnit, setHeightUnit] = useState('mm');
  
  // Reminder Settings
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(30);
  const [reminderSound, setReminderSound] = useState(true);
  const [reminderMessage, setReminderMessage] = useState('Time to adjust your posture!');
  
  // Height Presets
  const [sittingHeight, setSittingHeight] = useState(750);
  const [standingHeight, setStandingHeight] = useState(1100);
  
  // Advanced Desk Settings
  const [movementSpeed, setMovementSpeed] = useState(5);
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [standTime, setStandTime] = useState('09:00');
  const [sitTime, setSitTime] = useState('10:30');
  const [collisionDetection, setCollisionDetection] = useState(true);
  
  // Analytics Settings
  const [trackData, setTrackData] = useState(true);
  const [emailReports, setEmailReports] = useState(false);
  
  // Notification Settings
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationStyle, setNotificationStyle] = useState('gentle');
  
  // User Preferences
  const [userHeight, setUserHeight] = useState(175);
  const [dailyGoal, setDailyGoal] = useState(8);
  const [workSchedule, setWorkSchedule] = useState('9to5');
  // Function to apply dark mode to document
  const applyDarkMode = (isDark) => {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    console.log('Dark mode applied:', isDark);
    console.log('HTML classList:', htmlElement.className);
  };

  // ✅ NEW: Function to get system theme preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    // ✅ Start clean - remove dark class only
    document.documentElement.classList.remove('dark');
    
    const savedSettings = localStorage.getItem('deskSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.apiUrl) setApiUrl(settings.apiUrl);
      if (settings.apiKey) setApiKey(settings.apiKey);
      if (settings.deskId) setDeskId(settings.deskId);
      if (settings.sittingHeight) setSittingHeight(settings.sittingHeight);
      if (settings.standingHeight) setStandingHeight(settings.standingHeight);
      
      if (settings.followSystemTheme !== undefined) {
        setFollowSystemTheme(settings.followSystemTheme);
      }
      
      if (settings.followSystemTheme) {
        const systemPrefersDark = getSystemTheme();
        setDarkMode(systemPrefersDark);
        applyDarkMode(systemPrefersDark);
      } else if (settings.darkMode) {
        setDarkMode(true);
        applyDarkMode(true);
      } else {
        setDarkMode(false);
        applyDarkMode(false);
      }
      
      // ...rest of your settings loading...
    } else {
      setDarkMode(false);
      setFollowSystemTheme(false);
      applyDarkMode(false);
    }
  }, []);

  // ✅ NEW: Listen to system theme changes
  useEffect(() => {
    if (!followSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const systemPrefersDark = e.matches;
      setDarkMode(systemPrefersDark);
      applyDarkMode(systemPrefersDark);
    };

    // Set initial value based on system
    const systemPrefersDark = mediaQuery.matches;
    setDarkMode(systemPrefersDark);
    applyDarkMode(systemPrefersDark);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [followSystemTheme]);

  // Handle dark mode toggle
  const handleDarkModeToggle = (value) => {
    if (followSystemTheme) return; // Don't allow manual toggle if following system
    setDarkMode(value);
    applyDarkMode(value);
  };

  // ✅ NEW: Handle follow system theme toggle
  const handleFollowSystemThemeToggle = (value) => {
    setFollowSystemTheme(value);
    
    if (value) {
      // If enabling, immediately sync with system
      const systemPrefersDark = getSystemTheme();
      setDarkMode(systemPrefersDark);
      applyDarkMode(systemPrefersDark);
    }
    // If disabling, keep current darkMode state
  };

  const handleSaveSettings = () => {
    const settings = {
      apiUrl,
      apiKey,
      deskId,
      darkMode,
      followSystemTheme, // ✅ SAVE NEW SETTING
      reduceMotion,
      heightUnit,
      remindersEnabled,
      reminderInterval,
      reminderSound,
      reminderMessage,
      sittingHeight,
      standingHeight,
      movementSpeed,
      autoAdjust,
      standTime,
      sitTime,
      collisionDetection,
      trackData,
      emailReports,
      browserNotifications,
      soundAlerts,
      emailNotifications,
      notificationStyle,
      userHeight,
      dailyGoal,
      workSchedule
    };
    
    localStorage.setItem('deskSettings', JSON.stringify(settings));
    applyDarkMode(darkMode);
    alert('Settings saved successfully! ✅');
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('deskSettings');
      window.location.reload();
    }
  };

  const convertHeight = (heightMm) => {
    switch (heightUnit) {
      case 'cm':
        return (heightMm / 10).toFixed(1);
      case 'in':
        return (heightMm / 25.4).toFixed(1);
      default:
        return heightMm;
    }
  };

  const getUnitLabel = () => {
    switch (heightUnit) {
      case 'cm': return 'cm';
      case 'in': return 'inches';
      default: return 'mm';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your SmartDesk experience</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="w-5 h-5" />
          Save All
        </button>
      </div>

      {/* 1. Desk Connection Settings */}
      <ConfigSection icon={<Zap className="w-6 h-6" />} title="Desk Connection">
        <div className="space-y-4">
          <InputField
            label="API URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://51.21.129.98:3000"
          />
          <InputField
            label="API Key (Optional)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            type="password"
          />
          <InputField
            label="Desk ID"
            value={deskId}
            onChange={(e) => setDeskId(e.target.value)}
            placeholder="Enter your desk ID"
          />
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-900 dark:text-blue-300">Connection Status: {deskId ? 'Ready' : 'Not Configured'}</span>
          </div>
        </div>
      </ConfigSection>

      {/* 2. HEIGHT PRESETS & DISPLAY UNITS - MERGED SECTION */}
      <ConfigSection icon={<Ruler className="w-6 h-6" />} title="Height Presets & Display Units">
        <div className="space-y-6">
          {/* Units Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height Units
            </label>
            <select
              value={heightUnit}
              onChange={(e) => setHeightUnit(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Preset Heights</h3>
            
            {/* Height Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label={`Sitting Height (${getUnitLabel()})`}
                type="number"
                value={heightUnit === 'mm' ? sittingHeight : convertHeight(sittingHeight)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (heightUnit === 'cm') setSittingHeight(val * 10);
                  else if (heightUnit === 'in') setSittingHeight(val * 25.4);
                  else setSittingHeight(val);
                }}
                min={heightUnit === 'mm' ? 600 : heightUnit === 'cm' ? 60 : 23.6}
                max={heightUnit === 'mm' ? 900 : heightUnit === 'cm' ? 90 : 35.4}
              />
              <InputField
                label={`Standing Height (${getUnitLabel()})`}
                type="number"
                value={heightUnit === 'mm' ? standingHeight : convertHeight(standingHeight)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (heightUnit === 'cm') setStandingHeight(val * 10);
                  else if (heightUnit === 'in') setStandingHeight(val * 25.4);
                  else setStandingHeight(val);
                }}
                min={heightUnit === 'mm' ? 950 : heightUnit === 'cm' ? 95 : 37.4}
                max={heightUnit === 'mm' ? 1300 : heightUnit === 'cm' ? 130 : 51.2}
              />
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>💡 Tip:</strong> Your sitting height should allow your elbows to be at 90° when typing. 
                Standing height should be 2-4 inches below elbow height.
              </p>
            </div>
          </div>
        </div>
      </ConfigSection>

      {/* 3. Reminders */}
      <ConfigSection icon={<Bell className="w-6 h-6" />} title="Posture Reminders">
        <div className="space-y-4">
          <ToggleSwitch
            label="Enable Reminders"
            checked={remindersEnabled}
            onChange={setRemindersEnabled}
            description="Get periodic reminders to adjust your posture"
          />
          
          {remindersEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder Interval
                </label>
                <select
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={45}>Every 45 minutes</option>
                  <option value={60}>Every 1 hour</option>
                  <option value={90}>Every 1.5 hours</option>
                  <option value={120}>Every 2 hours</option>
                </select>
              </div>

              <ToggleSwitch
                label="Play Sound"
                checked={reminderSound}
                onChange={setReminderSound}
                description="Play an audio alert with reminders"
              />

              <InputField
                label="Custom Reminder Message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Time to adjust your posture!"
              />
            </>
          )}
        </div>
      </ConfigSection>

      {/* 4. Appearance */}
      <ConfigSection icon={<Palette className="w-6 h-6" />} title="Appearance">
        <div className="space-y-4">
          {/* Follow System Theme Toggle */}
          <ToggleSwitch
            label="Follow System Theme"
            checked={followSystemTheme}
            onChange={handleFollowSystemThemeToggle}
            description="Automatically match your computer's dark/light mode setting"
          />

          {/* Show current system preference when following system */}
          {followSystemTheme && (
            <div className="ml-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>System theme detected:</strong> {getSystemTheme() ? 'Dark' : 'Light'}
              </p>
            </div>
          )}

          {/* Manual Dark Mode Toggle - Disabled when following system */}
          <div className={followSystemTheme ? 'opacity-50 pointer-events-none' : ''}>
            <ToggleSwitch
              label="Dark Mode"
              checked={darkMode}
              onChange={handleDarkModeToggle}
              description={
                followSystemTheme 
                  ? "Disabled - Currently following system theme" 
                  : "Manually switch to dark theme for comfortable viewing in low light"
              }
            />
          </div>

          <ToggleSwitch
            label="Reduce Motion"
            checked={reduceMotion}
            onChange={setReduceMotion}
            description="Minimize animations for accessibility"
          />
        </div>
      </ConfigSection>

      {/* 5. Advanced Desk Control */}
      <ConfigSection icon={<SettingsIcon className="w-6 h-6" />} title="Advanced Desk Control">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Movement Speed: {movementSpeed}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={movementSpeed}
              onChange={(e) => setMovementSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          <ToggleSwitch
            label="Auto-adjust on Schedule"
            checked={autoAdjust}
            onChange={setAutoAdjust}
            description="Automatically adjust desk height based on your schedule"
          />

          {autoAdjust && (
            <div className="ml-6 space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <InputField
                label="Stand at"
                type="time"
                value={standTime}
                onChange={(e) => setStandTime(e.target.value)}
              />
              <InputField
                label="Sit at"
                type="time"
                value={sitTime}
                onChange={(e) => setSitTime(e.target.value)}
              />
            </div>
          )}

          <ToggleSwitch
            label="Collision Detection"
            checked={collisionDetection}
            onChange={setCollisionDetection}
            description="Stop desk movement if objects are detected"
          />
        </div>
      </ConfigSection>

      {/* 6. Analytics & Data */}
      <ConfigSection icon={<BarChart3 className="w-6 h-6" />} title="Analytics & Data">
        <div className="space-y-4">
          <ToggleSwitch
            label="Track Posture Data"
            checked={trackData}
            onChange={setTrackData}
            description="Collect data about your sitting/standing habits"
          />
          <ToggleSwitch
            label="Weekly Email Reports"
            checked={emailReports}
            onChange={setEmailReports}
            description="Receive weekly summaries of your posture analytics"
          />
        </div>
      </ConfigSection>

      {/* Notifications */}
      <ConfigSection icon={<Bell className="w-6 h-6" />} title="Notifications">
        <div className="space-y-4">
          <ToggleSwitch
            label="Browser Notifications"
            checked={browserNotifications}
            onChange={setBrowserNotifications}
            description="Show notifications in your browser"
          />
          <ToggleSwitch
            label="Sound Alerts"
            checked={soundAlerts}
            onChange={setSoundAlerts}
            description="Play sounds for important alerts"
          />
          <ToggleSwitch
            label="Email Notifications"
            checked={emailNotifications}
            onChange={setEmailNotifications}
            description="Receive notifications via email"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Style
            </label>
            <select
              value={notificationStyle}
              onChange={(e) => setNotificationStyle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gentle">Gentle Reminder</option>
              <option value="persistent">Persistent Alert</option>
              <option value="silent">Silent (Visual Only)</option>
            </select>
          </div>
        </div>
      </ConfigSection>

      {/* User Preferences */}
      <ConfigSection icon={<Clock className="w-6 h-6" />} title="Personal Settings">
        <div className="space-y-4">
          <InputField
            label="Your Height (cm)"
            type="number"
            value={userHeight}
            onChange={(e) => setUserHeight(parseInt(e.target.value))}
            min={140}
            max={220}
          />
          <InputField
            label="Daily Desk Usage Goal (hours)"
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            min={1}
            max={16}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Schedule
            </label>
            <select
              value={workSchedule}
              onChange={(e) => setWorkSchedule(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="9to5">9 AM - 5 PM</option>
              <option value="flexible">Flexible Hours</option>
              <option value="custom">Custom Schedule</option>
            </select>
          </div>
        </div>
      </ConfigSection>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSaveSettings}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="w-5 h-5" />
          Save All Changes
        </button>
        <button
          onClick={handleResetToDefaults}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </div>
  );
}

// Helper Components
function ConfigSection({ icon, title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, min, max }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
