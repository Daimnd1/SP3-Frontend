import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from './AuthContext';
import { createPostureSession, endPostureSession, logPostureChange } from '../lib/postureData';

const PostureTimerContext = createContext();

export function PostureTimerProvider({ children }) {
  const { user } = useAuth();
  
  // Timer state
  const [currentMode, setCurrentMode] = useState(null); // 'sitting' or 'standing'
  const [timeInCurrentMode, setTimeInCurrentMode] = useState(0); // milliseconds
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef(null); // Timestamp when tracking started
  const timerIntervalRef = useRef(null);
  const lastReminderTimeRef = useRef(null);
  const currentSessionIdRef = useRef(null); // Track current session ID
  const currentHeightRef = useRef(null); // Track height for session
  
  // Notification hook
  const { sendPostureReminder } = useNotifications();

  // Reminder settings - load from localStorage or use defaults
  const [sittingReminder, setSittingReminder] = useState(() => {
    const saved = localStorage.getItem('sittingReminderSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      frequency: 10000, // 10 seconds for testing (change to 2700000 for production - 45 minutes)
      message: "Time to stand up and stretch!",
    };
  });

  const [standingReminder, setStandingReminder] = useState(() => {
    const saved = localStorage.getItem('standingReminderSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      frequency: 10000, // 10 seconds for testing (change to 1800000 for production - 30 minutes)
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

  // Timer logic using timestamps (works even when browser tab is inactive)
  useEffect(() => {
    if (isTracking) {
      // Set start time when tracking begins
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      // Update time based on elapsed time since start
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setTimeInCurrentMode(elapsed);
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      startTimeRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTracking]);

  // Change mode and reset timer
  const changeMode = async (newMode, height, deskId) => {
    if (newMode !== currentMode && user) {
      // End previous session
      if (currentMode && currentSessionIdRef.current) {
        const endTime = Date.now();
        const duration = endTime - startTimeRef.current;
        
        try {
          await endPostureSession(
            currentSessionIdRef.current,
            height || currentHeightRef.current,
            duration
          );

          // Log posture change
          await logPostureChange(
            user.id,
            deskId,
            currentMode,
            newMode,
            height || currentHeightRef.current
          );
        } catch (error) {
          console.error('Failed to save session data:', error);
        }
      }

      // Start new session
      setCurrentMode(newMode);
      setTimeInCurrentMode(0);
      startTimeRef.current = Date.now();
      currentHeightRef.current = height;

      if (user && deskId) {
        try {
          const session = await createPostureSession(user.id, deskId, newMode, height);
          currentSessionIdRef.current = session.id;
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      }
    }
  };

  // Start tracking
  const startTracking = async (initialMode, height, deskId) => {
    setCurrentMode(initialMode);
    setTimeInCurrentMode(0);
    startTimeRef.current = Date.now();
    currentHeightRef.current = height;
    setIsTracking(true);

    // Create initial session
    if (user && deskId) {
      try {
        const session = await createPostureSession(user.id, deskId, initialMode, height);
        if (session) {
          currentSessionIdRef.current = session.id;
        }
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    }
  };

  // Stop tracking
  const stopTracking = async () => {
    // End current session
    if (currentSessionIdRef.current && user) {
      const endTime = Date.now();
      const duration = endTime - startTimeRef.current;

      try {
        await endPostureSession(
          currentSessionIdRef.current,
          currentHeightRef.current,
          duration
        );
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }

    setIsTracking(false);
    setCurrentMode(null);
    setTimeInCurrentMode(0);
    startTimeRef.current = null;
    currentSessionIdRef.current = null;
    currentHeightRef.current = null;
  };

  // Trigger notification when reminder time is reached
  useEffect(() => {
    if (!isTracking || !currentMode) return;

    const currentReminder = currentMode === 'sitting' ? sittingReminder : standingReminder;
    
    if (!currentReminder.enabled) return;

    // Check if it's time for a reminder - send once when threshold is reached or exceeded
    if (timeInCurrentMode >= currentReminder.frequency && lastReminderTimeRef.current !== currentReminder.frequency) {
      lastReminderTimeRef.current = currentReminder.frequency;
      sendPostureReminder(currentMode, currentReminder.message);
    }
  }, [timeInCurrentMode, currentMode, isTracking, sittingReminder, standingReminder, sendPostureReminder]);

  // Reset reminder tracking when mode changes
  useEffect(() => {
    lastReminderTimeRef.current = null;
  }, [currentMode]);

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

  // Function to update frequency from database (called by Desk.jsx)
  const updateFrequencyFromDatabase = (frequencyMs) => {
    if (frequencyMs) {
      setSittingReminder(prev => ({ ...prev, frequency: frequencyMs }));
      setStandingReminder(prev => ({ ...prev, frequency: frequencyMs }));
    }
  };

  const value = {
    currentMode,
    timeInCurrentMode,
    isTracking,
    sittingReminder,
    standingReminder,
    setSittingReminder,
    setStandingReminder,
    updateFrequencyFromDatabase,
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