import { useEffect, useRef, useState } from "react";
import { ArrowUpToLine, ArrowDownToLine, Power } from "lucide-react";
import {
  getAllDesks,
  getDeskData,
  updateDeskPosition,
} from "../../lib/backendAPI";
import { usePostureTimer } from "../../contexts/PostureTimerContext";
import { useDesk } from "../../contexts/DeskContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  upsertDeskByMacAddress,
  setDeskInUse,
  setDeskNotInUse,
  addUserDesk,
  updateLastConnected,
  getLastConnectedDesk,
  getUserDesks,
  getAllDesksWithStatus,
  updateDeskHeight,
  getUserDeskPreset,
  upsertUserDeskPreset,
} from "../../lib/database";

export default function Desk({
  heightPresets = [],
  setHeightPresets,
}) {
  const { isConnected, deskName } = useDesk();

  return (
    <div className="flex flex-col gap-12 items-center pt-8 text-center">
      <ConnectionStatus isConnected={isConnected} deskName={deskName} />
      <DeskDashboard
        heightPresets={heightPresets}
        setHeightPresets={setHeightPresets}
      />
    </div>
  );
}

function DeskDashboard({
  heightPresets,
  setHeightPresets,
}) {
  const { user } = useAuth();
  const {
    isConnected,
    currentHeight,
    speed,
    targetHeight,
    showDeskDialog,
    setShowDeskDialog,
    dbDeskId,
    deskId,
    deskName,
    connectToDesk,
    disconnectFromDesk,
    moveDeskToHeight,
  } = useDesk();
  const {
    startTracking,
    stopTracking,
    changeMode,
    isTracking,
    currentMode: timerMode,
    updateFrequencyFromDatabase,
  } = usePostureTimer();
  
  // Mode detection moved to DeskContext for global handling

  // Load presets from database when user is logged in
  useEffect(() => {
    const loadPresets = async () => {
      if (!user) return;

      try {
        const preset = await getUserDeskPreset(user.id);
        if (preset && preset.sitting_height && preset.standing_height) {
          setHeightPresets([
            { id: 1, name: "Sitting", height: preset.sitting_height, unit: "cm" },
            { id: 2, name: "Standing", height: preset.standing_height, unit: "cm" },
          ]);
          
          // Update notification frequency if available
          if (preset.notification_frequency) {
            updateFrequencyFromDatabase(preset.notification_frequency);
          }
        }
      } catch (error) {
        console.error('Failed to load desk presets:', error);
      }
    };

    loadPresets();
  }, [user, setHeightPresets, updateFrequencyFromDatabase]);

  // Start tracking when connected and height is available (only if not already tracking)
  useEffect(() => {
    if (isConnected && deskId && currentHeight > 0 && !isTracking && dbDeskId) {
      const initialMode = currentHeight < 900 ? "sitting" : "standing";
      startTracking(initialMode, currentHeight, dbDeskId);
    } else if (!isConnected && isTracking) {
      stopTracking();
    }
  }, [
    isConnected,
    deskId,
    dbDeskId,
    currentHeight,
    isTracking,
    startTracking,
    stopTracking,
  ]);

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 w-full rounded-xl gap-4 p-8 pb-24">
      <div className="flex justify-between md:justify-center items-center">
        <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-200">
          Desk
        </h2>
        <div className="md:hidden flex flex-col items-center gap-2">
          <ButtonConnect size={32} />
          {isConnected && (
            <button
              onClick={() => setShowDeskDialog(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
            >
              Change
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-gray-300 dark:border-gray-600" />
      <DeskStatus
        isConnected={isConnected}
        currentHeight={currentHeight}
        heightPresets={heightPresets}
        speed={speed}
      />
      <DeskControls
        heightPresets={heightPresets}
      />
    </div>
  );
}
function ConnectionStatus({ isConnected, deskName }) {
  return (
    <div className="flex justify-center items-center gap-4 text-center">
      <div
        className={`rounded-full w-4 h-4 ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {isConnected && deskName ? (
        <h2 className="font-medium text-2xl text-gray-700 dark:text-gray-400">
          Connected to {deskName}
        </h2>
      ) : (
        <h2 className="font-medium text-2xl text-gray-700 dark:text-gray-400">
          Connect to a desk...
        </h2>
      )}
    </div>
  );
}

function DeskStatus({ isConnected, currentHeight, heightPresets, speed }) {
  const { currentMode, timeInCurrentMode, formatTime, isTracking } =
    usePostureTimer();
  // Convert mm to cm for display
  const heightInCm = Math.round(currentHeight / 10);

  // Determine mode based on speed and current height
  let mode;
  if (speed > 0) {
    mode = "Rising";
  } else if (speed < 0) {
    mode = "Lowering";
  } else {
    // Use 900mm as breakpoint between sitting and standing
    mode = currentHeight < 900 ? "Sitting" : "Standing";
  }

  return (
    <div className="text-center mb-8">
      <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-200 -mb-3">
        Status
      </h2>
      <p className="font-medium text-gray-700 dark:text-gray-400 mt-4">
        {isConnected ? (
          <>
            Height:{" "}
            <span className="text-gray-900 dark:text-gray-200">
              {heightInCm} cm
            </span>{" "}
            | Mode:{" "}
            <span className="text-gray-900 dark:text-gray-200">{mode}</span>
            {isTracking && currentMode && (
              <>
                {" "}
                | Time:{" "}
                <span className="text-gray-900 dark:text-gray-200">
                  {formatTime(timeInCurrentMode)}
                </span>
              </>
            )}
          </>
        ) : (
          "Not connected"
        )}
      </p>
    </div>
  );
}

function DeskControls({
  heightPresets,
}) {
  const { isConnected, setShowDeskDialog } = useDesk();

  return (
    <div className="flex flex-col justify-center items-center text-center">
      <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-200">
        Controls
      </h1>
      <div className="flex flex-row justify-center items-center gap-8 mt-6">
        <ButtonSetMode
          direction="Sitting"
          icon={ArrowDownToLine}
          disabled={!isConnected}
          heightPresets={heightPresets}
        />
        <div className="hidden md:flex md:flex-col md:items-center md:gap-3">
          <ButtonConnect size={164} />
          {isConnected && (
            <button
              onClick={() => setShowDeskDialog(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
            >
              Change Desk
            </button>
          )}
        </div>
        <ButtonSetMode
          direction="Standing"
          icon={ArrowUpToLine}
          disabled={!isConnected}
          heightPresets={heightPresets}
        />
      </div>
    </div>
  );
}

function ButtonConnect({
  size = 196,
}) {
  const { user } = useAuth();
  const { isConnected, showDeskDialog, setShowDeskDialog, connectToDesk, disconnectFromDesk } = useDesk();
  const [availableDesks, setAvailableDesks] = useState([]);
  const [loadingDesks, setLoadingDesks] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      // Disconnect using context
      try {
        await disconnectFromDesk();
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    } else {
      // Try to reconnect to last desk first
      if (user) {
        try {
          const lastDesk = await getLastConnectedDesk(user.id);
          if (lastDesk && lastDesk.desk) {
            // Check if last desk is available
            const allDesks = await getAllDesks();
            const matchingDeskId = allDesks.find(id => {
              // The allDesks returns mac addresses, compare with last desk's mac
              return id === lastDesk.desk.mac_address;
            });

            if (matchingDeskId) {
              try {
                const data = await getDeskData(matchingDeskId);
                // Check if desk is available (not in use by someone else)
                if (!lastDesk.desk.is_in_use || lastDesk.desk.current_user_id === user.id) {
                  // Connect to last desk
                  await connectToDesk({
                    id: matchingDeskId,
                    name: lastDesk.desk.name || data.config.name,
                    data: data,
                  });
                  console.log('Reconnected to last desk:', lastDesk.desk.name);
                  return;
                }
              } catch (error) {
                console.log('Last desk unavailable, showing desk list');
              }
            }
          }
        } catch (error) {
          console.log('No last desk found, showing desk list');
        }
      }

      // Show desk selection dialog if no last desk or it's unavailable
      setLoadingDesks(true);
      try {
        const desks = await getAllDesks();
        if (desks && desks.length > 0) {
          // Fetch details for all desks from backend API
          const deskDetails = await Promise.all(
            desks.map(async (id) => {
              try {
                const data = await getDeskData(id);
                let dbDesk = null;
                
                // Get database info if user is logged in
                if (user) {
                  try {
                    dbDesk = await upsertDeskByMacAddress(
                      id,
                      data.config.name || "Smart Desk",
                      data.state.position_mm
                    );
                  } catch (error) {
                    console.error(`Failed to get desk ${id} from database:`, error);
                  }
                }
                
                return { 
                  id, 
                  name: data.config.name, 
                  data,
                  dbDesk,
                  isInUse: dbDesk?.is_in_use || false,
                  currentUserId: dbDesk?.current_user_id || null,
                };
              } catch (error) {
                console.error(`Failed to fetch desk ${id}:`, error);
                return null;
              }
            })
          );
          setAvailableDesks(deskDetails.filter((d) => d !== null));
          setShowDeskDialog(true);
        } else {
          console.error("No desks available");
        }
      } catch (error) {
        console.error("Failed to fetch desks:", error);
      } finally {
        setLoadingDesks(false);
      }
    }
  };

  const selectDesk = async (desk) => {
    try {
      // Use connectToDesk from context
      await connectToDesk(desk);
      setShowDeskDialog(false);
      setAvailableDesks([]);
      
      // Create default presets if they don't exist
      if (user) {
        const existing = await getUserDeskPreset(user.id);
        if (!existing) {
          await upsertUserDeskPreset(
            user.id,
            720,  // Default sitting height (mm)
            1100, // Default standing height (mm)
            null  // Notification frequency
          );
        }
      }
    } catch (error) {
      console.error('Failed to connect to desk:', error);
    }
  };

  // Load desks when dialog is opened externally (via Change Desk button)
  useEffect(() => {
    if (showDeskDialog && availableDesks.length === 0 && !loadingDesks) {
      setLoadingDesks(true);
      getAllDesks()
        .then(async (desks) => {
          if (desks && desks.length > 0) {
            return Promise.all(
              desks.map(async (id) => {
                try {
                  const data = await getDeskData(id);
                  let dbDesk = null;
                  
                  // Get database info if user is logged in
                  if (user) {
                    try {
                      dbDesk = await upsertDeskByMacAddress(
                        id,
                        data.config.name || "Smart Desk",
                        data.state.position_mm
                      );
                    } catch (error) {
                      console.error(`Failed to get desk ${id} from database:`, error);
                    }
                  }
                  
                  return { 
                    id, 
                    name: data.config.name, 
                    data,
                    dbDesk,
                    isInUse: dbDesk?.is_in_use || false,
                    currentUserId: dbDesk?.current_user_id || null,
                  };
                } catch (error) {
                  console.error(`Failed to fetch desk ${id}:`, error);
                  return null;
                }
              })
            );
          }
          return [];
        })
        .then((deskDetails) => {
          setAvailableDesks(deskDetails.filter((d) => d !== null));
        })
        .catch((error) => {
          console.error("Failed to fetch desks:", error);
        })
        .finally(() => {
          setLoadingDesks(false);
        });
    }
  }, [showDeskDialog, availableDesks.length, loadingDesks, user]);

  return (
    <>
      <button
        className={`p-2 transition-all  ${
          isConnected
            ? "text-blue-600 drop-shadow-[0_0_16px_rgba(56,189,248,0.8)] hover:drop-shadow-[0_0_24px_rgba(56,189,248,1)]"
            : "text-gray-400 hover:text-blue-400"
        }`}
        onClick={handleConnect}
        disabled={loadingDesks}
        aria-label={isConnected ? "Disconnect from desk" : "Connect to desk"}
      >
        <Power size={size} strokeWidth={3} />
      </button>

      {showDeskDialog && (
        <DeskSelectionDialog
          desks={availableDesks}
          onSelect={selectDesk}
          onClose={() => setShowDeskDialog(false)}
          loading={loadingDesks}
        />
      )}
    </>
  );
}

function DeskSelectionDialog({ desks, onSelect, onClose, loading }) {
  const { user } = useAuth();
  const [localDesks, setLocalDesks] = useState(desks);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh desk list every second
  useEffect(() => {
    setLocalDesks(desks);
    
    const refreshDesks = async () => {
      if (isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        const allDesks = await getAllDesks();
        if (allDesks && allDesks.length > 0) {
          const deskDetails = await Promise.all(
            allDesks.map(async (id) => {
              try {
                const data = await getDeskData(id);
                let dbDesk = null;
                
                if (user) {
                  try {
                    dbDesk = await upsertDeskByMacAddress(
                      id,
                      data.config.name || "Smart Desk",
                      data.state.position_mm
                    );
                  } catch (error) {
                    console.error(`Failed to get desk ${id} from database:`, error);
                  }
                }
                
                return { 
                  id, 
                  name: data.config.name, 
                  data,
                  dbDesk,
                  isInUse: dbDesk?.is_in_use || false,
                  currentUserId: dbDesk?.current_user_id || null,
                };
              } catch (error) {
                console.error(`Failed to fetch desk ${id}:`, error);
                return null;
              }
            })
          );
          setLocalDesks(deskDetails.filter((d) => d !== null));
        }
      } catch (error) {
        console.error('Failed to refresh desks:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    const interval = setInterval(refreshDesks, 1000);
    return () => clearInterval(interval);
  }, [desks, user, isRefreshing]);
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          Select a Desk
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading desks...
            </div>
          ) : localDesks.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No desks available
            </div>
          ) : (
            localDesks.map((desk) => {
              const isInUse = desk.isInUse && desk.currentUserId !== user?.id;
              const isCurrentUser = desk.currentUserId === user?.id;
              
              return (
                <button
                  key={desk.id}
                  onClick={() => !isInUse && onSelect(desk)}
                  disabled={isInUse}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    isInUse
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60'
                      : isCurrentUser
                      ? 'border-green-500 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-gray-900 dark:text-gray-200">
                      {desk.name}
                    </div>
                    {isInUse ? (
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                        In Use
                      </span>
                    ) : isCurrentUser ? (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ID: {desk.id} | Height:{" "}
                    {Math.round(desk.data.state.position_mm / 10)} cm
                  </div>
                </button>
              );
            })
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ButtonSetMode({
  direction,
  icon,
  disabled,
  heightPresets,
}) {
  const Icon = icon;
  const { deskId, moveDeskToHeight } = useDesk();

  const handleClick = async () => {
    if (disabled || !deskId) return;

    const preset = heightPresets.find((p) => p.name === direction);
    if (preset) {
      try {
        await moveDeskToHeight(preset.height);
      } catch (error) {
        console.error(`Failed to set ${direction} position:`, error);
      }
    }
  };

  return (
    <button
      className={
        disabled
          ? "p-2 text-gray-300 dark:text-gray-700 cursor-not-allowed border-2 border-gray-300 dark:border-gray-600 rounded-full"
          : "p-2 text-blue-300 hover:text-blue-500 dark:text-blue-700 dark:hover:text-blue-600 transition-colors cursor-pointer border-2 border-blue-300 dark:border-blue-700 rounded-full hover:border-blue-500 dark:hover:border-blue-600"
      }
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Set desk to ${direction} position`}
    >
      <Icon size={64} strokeWidth={3} />
    </button>
  );
}
