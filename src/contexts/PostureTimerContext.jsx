import { createContext, useContext, useState, useEffect, useRef } from 'react';

const PostureTimerContext = createContext();

export function PostureTimerProvider({ children }) {
  // Timer state
  const [currentMode, setCurrentMode] = useState(null); // 'sitting' or 'standing'
  const [timeInCurrentMode, setTimeInCurrentMode] = useState(0); // milliseconds
  const [isTracking, setIsTracking] = useState(false);
  const timerIntervalRef = useRef(null);

  // Reminder settings - load from localStorage or use defaults
  const [sittingReminder, setSittingReminder] = useState(() => {
    const saved = localStorage.getItem('sittingReminderSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      frequency: 2700000, // 45 minutes in milliseconds
      message: "Time to stand up and stretch!",
    };
  });

  const [standingReminder, setStandingReminder] = useState(() => {
    const saved = localStorage.getItem('standingReminderSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      frequency: 1800000, // 30 minutes in milliseconds
      message: "Time to sit down and rest!",
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sittingReminderSettings', JSON.stringify(sittingReminder));
  }, [sittingReminder]);

  useEffect(() => {
    localStorage.setItem('standingReminderSettings', JSON.stringify(standingReminder));
  }, [standingReminder]);

  // Timer logic
  useEffect(() => {
    if (isTracking) {
      timerIntervalRef.current = setInterval(() => {
        setTimeInCurrentMode(prev => prev + 100);
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTracking]);

  // Change mode and reset timer
  const changeMode = (newMode) => {
    if (newMode !== currentMode) {
      setCurrentMode(newMode);
      setTimeInCurrentMode(0);
    }
  };

  // Start tracking
  const startTracking = (initialMode) => {
    setCurrentMode(initialMode);
    setTimeInCurrentMode(0);
    setIsTracking(true);
  };

  // Stop tracking
  const stopTracking = () => {
    setIsTracking(false);
    setCurrentMode(null);
    setTimeInCurrentMode(0);
  };

  // Check if reminder should be shown
  const shouldShowReminder = () => {
    if (currentMode === 'sitting' && sittingReminder.enabled) {
      return timeInCurrentMode >= sittingReminder.frequency;
    } else if (currentMode === 'standing' && standingReminder.enabled) {
      return timeInCurrentMode >= standingReminder.frequency;
    }
    return false;
  };

  // Get current reminder message
  const getCurrentReminderMessage = () => {
    if (currentMode === 'sitting') {
      return sittingReminder.message;
    } else if (currentMode === 'standing') {
      return standingReminder.message;
    }
    return '';
  };

  // Format time as "Xh Ym Zs" or "Xm Zs" or "Zs"
  const formatTime = (totalMilliseconds) => {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const value = {
    currentMode,
    timeInCurrentMode,
    isTracking,
    sittingReminder,
    standingReminder,
    setSittingReminder,
    setStandingReminder,
    changeMode,
    startTracking,
    stopTracking,
    shouldShowReminder,
    getCurrentReminderMessage,
    formatTime,
  };

  return (
    <PostureTimerContext.Provider value={value}>
      {children}
    </PostureTimerContext.Provider>
  );
}

export function usePostureTimer() {
  const context = useContext(PostureTimerContext);
  if (!context) {
    throw new Error('usePostureTimer must be used within PostureTimerProvider');
  }
  return context;
}