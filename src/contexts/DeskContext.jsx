import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { usePostureTimer } from './PostureTimerContext';
import {
  getDeskData,
  updateDeskPosition,
  getAllDesks,
} from '../lib/backendAPI';
import {
  upsertDeskByMacAddress,
  setDeskInUse,
  setDeskNotInUse,
  addUserDesk,
  updateLastConnected,
  getLastConnectedDesk,
  getAllDesksWithStatus,
  updateDeskHeight,
  getUserDeskPreset,
} from '../lib/database';

const DeskContext = createContext();

export function DeskProvider({ children }) {
  const { user } = useAuth();
  const { changeMode, isTracking } = usePostureTimer();

  // Desk connection state
  const [isConnected, setIsConnected] = useState(false);
  const [deskId, setDeskId] = useState(null);
  const [deskName, setDeskName] = useState('');
  const [dbDeskId, setDbDeskId] = useState(null);
  
  // Desk physical state
  const [currentHeight, setCurrentHeight] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [targetHeight, setTargetHeight] = useState(null);
  
  // UI state
  const [showDeskDialog, setShowDeskDialog] = useState(false);
  
  // Refs
  const pollingIntervalRef = useRef(null);
  const autoConnectAttemptedRef = useRef(false);
  const prevModeRef = useRef(null);

  // Auto-reconnect removed - now handled by Connect button

  // Poll desk state when connected
  useEffect(() => {
    if (!isConnected || !deskId) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    let lastHeight = currentHeight;
    let wasMoving = false;
    let lastSpeedSign = 0;

    const pollDeskState = async () => {
      try {
        const data = await getDeskData(deskId);
        const newHeight = data.state.position_mm;
        const newSpeed = data.state.speed_mms || data.state.speed || 0;

        setCurrentHeight(newHeight);
        setSpeed(newSpeed);

        // Handle target movement
        if (targetHeight !== null) {
          const tolerance = 30; // mm
          const heightDiff = Math.abs(newHeight - targetHeight);
          const reachedTarget = heightDiff <= tolerance;

          // Target reached and stopped
          if (reachedTarget && newSpeed === 0) {
            setTargetHeight(null);
            
            // Sync to database
            if (user && dbDeskId) {
              try {
                await updateDeskHeight(dbDeskId, newHeight);
              } catch (error) {
                console.error('Failed to update height:', error);
              }
            }
          }
        }

        wasMoving = newSpeed !== 0;
        lastHeight = newHeight;
      } catch (error) {
        console.error('Failed to get desk data:', error);
        
        // Check if desk is unavailable (404 or network error)
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          console.error('❌ Desk is unavailable. Disconnecting...');
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // Disconnect from desk
          await disconnectFromDesk();
          
          // Show notification to user
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Desk Disconnected', {
              body: 'The desk is no longer available and has been disconnected.',
              icon: '/vite.svg'
            });
          }
        }
      }
    };

    pollingIntervalRef.current = setInterval(pollDeskState, 500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isConnected, deskId, user, dbDeskId]); // Remove currentHeight from dependencies!

  // Detect mode changes globally (works on any page)
  useEffect(() => {
    if (!isConnected || !isTracking) {
      prevModeRef.current = null;
      return;
    }
    
    // Check when desk stops moving
    if (speed === 0 && currentHeight > 0) {
      const currentMode = currentHeight < 900 ? "sitting" : "standing";
      
      if (prevModeRef.current === null) {
        prevModeRef.current = currentMode;
      } else if (currentMode !== prevModeRef.current) {
        changeMode(currentMode, currentHeight, dbDeskId);
        prevModeRef.current = currentMode;
      }
    }
  }, [currentHeight, speed, isConnected, isTracking, changeMode]);

  // Connect to a desk
  const connectToDesk = useCallback(async (selectedDesk) => {
    try {
      if (!user) {
        console.error('User must be logged in to connect to a desk');
        return;
      }

      // Disconnect from previous desk if connected
      if (isConnected && dbDeskId) {
        await setDeskNotInUse(dbDeskId);
      }

      // Handle different desk object structures
      // From Desk page: { id, name, data: { state, config }, dbDesk }
      // From auto-reconnect: { id, name, state, mac_address }
      const mac = selectedDesk.mac_address || selectedDesk.id;
      const position = selectedDesk.state?.position_mm || selectedDesk.data?.state?.position_mm || 0;
      const deskName = selectedDesk.name || `DESK ${mac.slice(-4)}`;

      // Ensure desk exists in database
      const dbDesk = await upsertDeskByMacAddress(mac, deskName, position);
      
      if (!dbDesk || !dbDesk.id) {
        throw new Error('Failed to get desk from database');
      }

      // Mark desk as in use
      await setDeskInUse(dbDesk.id, user.id);

      // Add/update user_desk record
      await addUserDesk(user.id, dbDesk.id);
      
      // Update last connected timestamp
      await updateLastConnected(user.id, dbDesk.id);

      setDeskId(selectedDesk.id);
      setDeskName(deskName);
      setCurrentHeight(position);
      setIsConnected(true);
      setDbDeskId(dbDesk.id);
    } catch (error) {
      console.error('Failed to connect to desk:', error);
      throw error;
    }
  }, [user, isConnected, dbDeskId]);

  // Disconnect from desk
  const disconnectFromDesk = useCallback(async () => {
    try {
      if (dbDeskId) {
        await setDeskNotInUse(dbDeskId);
      }
      
      setIsConnected(false);
      setDeskId(null);
      setDeskName('');
      setCurrentHeight(0);
      setSpeed(0);
      setTargetHeight(null);
      setDbDeskId(null);
      prevModeRef.current = null;
      autoConnectAttemptedRef.current = false;
    } catch (error) {
      console.error('Failed to disconnect from desk:', error);
      throw error;
    }
  }, [dbDeskId]);

  // Move desk to target height
  const moveDeskToHeight = useCallback(async (height) => {
    if (!isConnected || !deskId) return;
    
    try {
      setTargetHeight(height);
      await updateDeskPosition(deskId, height);
    } catch (error) {
      console.error('Failed to move desk:', error);
      throw error;
    }
  }, [isConnected, deskId]);

  const value = {
    // State
    isConnected,
    deskId,
    deskName,
    dbDeskId,
    currentHeight,
    speed,
    targetHeight,
    showDeskDialog,
    
    // Setters
    setShowDeskDialog,
    
    // Actions
    connectToDesk,
    disconnectFromDesk,
    moveDeskToHeight,
  };

  return (
    <DeskContext.Provider value={value}>
      {children}
    </DeskContext.Provider>
  );
}

export function useDesk() {
  const context = useContext(DeskContext);
  if (!context) {
    throw new Error('useDesk must be used within DeskProvider');
  }
  return context;
}
