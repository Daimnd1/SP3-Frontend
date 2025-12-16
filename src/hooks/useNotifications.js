import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createNotification } from '../lib/database';

/**
 * Custom hook for browser notifications
 * Handles permission requests, notification display, sound playback, and database logging
 */
export function useNotifications() {
  const { user } = useAuth();
  const audioRef = useRef(null);
  const lastNotificationDate = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check if this is the first login of the day
  const isFirstLoginToday = () => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    
    if (lastLogin !== today) {
      localStorage.setItem('lastLoginDate', today);
      return true;
    }
    return false;
  };

  // Send welcome notification on first daily login
  useEffect(() => {
    if (user && isFirstLoginToday()) {
      const welcomeMessage = `Welcome back! Ready to maintain good posture today?`;
      sendNotification('Daily Check-in', welcomeMessage, true);
    }
  }, [user]);

  /**
   * Send a browser notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {boolean} saveToDatabase - Whether to save to database for Pico W
   * @returns {Promise<void>}
   */
  const sendNotification = async (title, body, saveToDatabase = true) => {
    // Play notification sound
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          tag: 'posture-reminder',
          requireInteraction: false,
          silent: true,
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    } else if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Save to database if user is logged in and saveToDatabase is true
    if (user && saveToDatabase) {
      try {
        await createNotification(user.id, body, new Date().toISOString());
      } catch (error) {
        console.error('Failed to save notification to database:', error);
      }
    }
  };

  /**
   * Send a posture reminder notification
   * @param {string} mode - Current posture mode ('sitting' or 'standing')
   * @param {string} customMessage - Optional custom message
   */
  const sendPostureReminder = async (mode, customMessage) => {
    const defaultMessages = {
      sitting: "Time to stand up and stretch! Your body will thank you.",
      standing: "Time to sit down and rest. Great job staying active!",
    };

    const message = customMessage || defaultMessages[mode];
    const title = mode === 'sitting' ? '🧍 Stand Up Reminder' : '🪑 Sit Down Reminder';
    
    await sendNotification(title, message, true);
  };

  return {
    sendNotification,
    sendPostureReminder,
    isPermissionGranted: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
    requestPermission: () => {
      if ('Notification' in window) {
        return Notification.requestPermission();
      }
      return Promise.resolve('denied');
    },
  };
}
