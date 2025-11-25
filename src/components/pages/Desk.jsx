import { useEffect, useRef, useState } from "react";
import {
  ArrowUpToLine,
  ArrowDownToLine,
  Power,
} from "lucide-react";
import { getAllDesks, getDeskData, updateDeskPosition } from "../../lib/backendAPI";

export default function Desk({ heightPresets = [], isConnected, setIsConnected, currentHeight, setCurrentHeight, deskId, setDeskId, deskName, setDeskName, showDeskDialog, setShowDeskDialog }) {
  const [speed, setSpeed] = useState(0);
  const [targetHeight, setTargetHeight] = useState(null);

  return (
    <div className="flex flex-col gap-12 items-center pt-8 text-center">
      <ConnectionStatus isConnected={isConnected} deskName={deskName} />
      <DeskDashboard
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        heightPresets={heightPresets}
        currentHeight={currentHeight}
        setCurrentHeight={setCurrentHeight}
        deskId={deskId}
        setDeskId={setDeskId}
        deskName={deskName}
        setDeskName={setDeskName}
        speed={speed}
        setSpeed={setSpeed}
        targetHeight={targetHeight}
        setTargetHeight={setTargetHeight}
        showDeskDialog={showDeskDialog}
        setShowDeskDialog={setShowDeskDialog}
      />
    </div>
  );
}

function DeskDashboard({ isConnected, setIsConnected, heightPresets, currentHeight, setCurrentHeight, deskId, setDeskId, deskName, setDeskName, speed, setSpeed, targetHeight, setTargetHeight, showDeskDialog, setShowDeskDialog }) {
  useEffect(() => {
    if (!isConnected || !deskId) return;

    // Poll desk state every 500ms
    const interval = setInterval(async () => {
      try {
        const data = await getDeskData(deskId);
        setCurrentHeight(data.state.position_mm);
        setSpeed(data.state.speed_mms);
      } catch (error) {
        console.error("Failed to poll desk data:", error);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isConnected, deskId, setCurrentHeight, setSpeed]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 w-full rounded-xl gap-4 p-8 pb-24">
      <div className="flex justify-between md:justify-center items-center">
        <h2 className="font-bold text-2xl text-gray-900 dark:text-zinc-200">Desk</h2>
        <div className="md:hidden flex flex-col items-center gap-2">
          <ButtonConnectToDesk
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            deskId={deskId}
            setDeskId={setDeskId}
            setDeskName={setDeskName}
            setCurrentHeight={setCurrentHeight}
            showDeskDialog={showDeskDialog}
            setShowDeskDialog={setShowDeskDialog}
            size={32}
          />
          {isConnected && (
            <button
              onClick={() => setShowDeskDialog(true)}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 underline transition-colors"
            >
              Change
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-gray-300 dark:border-zinc-600" />
      <DeskStatus isConnected={isConnected} currentHeight={currentHeight} heightPresets={heightPresets} speed={speed} />
      <DeskControls isConnected={isConnected} setIsConnected={setIsConnected} heightPresets={heightPresets} currentHeight={currentHeight} setCurrentHeight={setCurrentHeight} deskId={deskId} setDeskId={setDeskId} setDeskName={setDeskName} targetHeight={targetHeight} setTargetHeight={setTargetHeight} showDeskDialog={showDeskDialog} setShowDeskDialog={setShowDeskDialog} />
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
        <h2 className="font-medium text-2xl text-gray-700 dark:text-zinc-400">
          Connected to {deskName}
        </h2>
      ) : (
        <h2 className="font-medium text-2xl text-gray-700 dark:text-zinc-400">
          Connect to a desk...
        </h2>
      )}
    </div>
  );
}

function DeskStatus({ isConnected, currentHeight, heightPresets, speed }) {
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
      <h2 className="font-bold text-2xl text-gray-900 dark:text-zinc-200 -mb-3">Status</h2>
      <p className="font-medium text-gray-700 dark:text-zinc-400 mt-4">
        {isConnected ? `Height: ${heightInCm} cm | Mode: ${mode}` : "Not connected"}
      </p>
    </div>
  );
}

function DeskControls({ isConnected, setIsConnected, heightPresets, currentHeight, setCurrentHeight, deskId, setDeskId, setDeskName, targetHeight, setTargetHeight, showDeskDialog, setShowDeskDialog }) {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <h1 className="font-bold text-2xl text-gray-900 dark:text-zinc-200">Controls</h1>
      <div className="flex flex-row justify-center items-center gap-8 mt-6">
        <ButtonSetMode
          direction="Sitting"
          icon={ArrowDownToLine}
          disabled={!isConnected}
          heightPresets={heightPresets}
          deskId={deskId}
          setTargetHeight={setTargetHeight}
        />
        <div className="hidden md:flex md:flex-col md:items-center md:gap-3">
          <ButtonConnectToDesk
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            deskId={deskId}
            setDeskId={setDeskId}
            setDeskName={setDeskName}
            setCurrentHeight={setCurrentHeight}
            showDeskDialog={showDeskDialog}
            setShowDeskDialog={setShowDeskDialog}
            size={164}
          />
          {isConnected && (
            <button
              onClick={() => setShowDeskDialog(true)}
              className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 underline transition-colors"
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
          deskId={deskId}
          setTargetHeight={setTargetHeight}
        />
      </div>
    </div>
  );
}

function ButtonConnectToDesk({ isConnected, setIsConnected, deskId, setDeskId, setDeskName, setCurrentHeight, showDeskDialog, setShowDeskDialog, size = 196 }) {
  const [availableDesks, setAvailableDesks] = useState([]);
  const [loadingDesks, setLoadingDesks] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      // Disconnect
      setIsConnected(false);
      setDeskId(null);
      setDeskName("Smart Desk");
    } else {
      // Show desk selection dialog
      setLoadingDesks(true);
      try {
        const desks = await getAllDesks();
        if (desks && desks.length > 0) {
          // Fetch details for all desks
          const deskDetails = await Promise.all(
            desks.map(async (id) => {
              try {
                const data = await getDeskData(id);
                return { id, name: data.config.name, data };
              } catch (error) {
                console.error(`Failed to fetch desk ${id}:`, error);
                return null;
              }
            })
          );
          setAvailableDesks(deskDetails.filter(d => d !== null));
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

  const selectDesk = (desk) => {
    setDeskId(desk.id);
    setDeskName(desk.name || "Smart Desk");
    setCurrentHeight(desk.data.state.position_mm);
    setIsConnected(true);
    setShowDeskDialog(false);
    setAvailableDesks([]);
  };

  // Load desks when dialog is opened externally (via Change Desk button)
  useEffect(() => {
    if (showDeskDialog && availableDesks.length === 0 && !loadingDesks) {
      setLoadingDesks(true);
      getAllDesks()
        .then(desks => {
          if (desks && desks.length > 0) {
            return Promise.all(
              desks.map(async (id) => {
                try {
                  const data = await getDeskData(id);
                  return { id, name: data.config.name, data };
                } catch (error) {
                  console.error(`Failed to fetch desk ${id}:`, error);
                  return null;
                }
              })
            );
          }
          return [];
        })
        .then(deskDetails => {
          setAvailableDesks(deskDetails.filter(d => d !== null));
        })
        .catch(error => {
          console.error("Failed to fetch desks:", error);
        })
        .finally(() => {
          setLoadingDesks(false);
        });
    }
  }, [showDeskDialog, availableDesks.length, loadingDesks]);

  return (
    <>
      <button
        className={`p-2 transition-all  ${
          isConnected
            ? "text-sky-400 drop-shadow-[0_0_16px_rgba(56,189,248,0.8)] hover:drop-shadow-[0_0_24px_rgba(56,189,248,1)]"
            : "text-zinc-400 hover:text-sky-400"
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-200 mb-4">Select a Desk</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-zinc-400">Loading desks...</div>
          ) : desks.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-zinc-400">No desks available</div>
          ) : (
            desks.map((desk) => (
              <button
                key={desk.id}
                onClick={() => onSelect(desk)}
                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-sky-500 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                <div className="font-semibold text-gray-900 dark:text-zinc-200">{desk.name}</div>
                <div className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  ID: {desk.id} | Height: {Math.round(desk.data.state.position_mm / 10)} cm
                </div>
              </button>
            ))
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-zinc-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ButtonSetMode({ direction, icon, disabled, heightPresets, deskId, setTargetHeight }) {
  const Icon = icon;

  const handleClick = async () => {
    if (disabled || !deskId) return;

    const preset = heightPresets.find(p => p.name === direction);
    if (preset) {
      try {
        await updateDeskPosition(deskId, preset.height);
        setTargetHeight(preset.height);
      } catch (error) {
        console.error(`Failed to set ${direction} position:`, error);
      }
    }
  };

  return (
    <button
      className={disabled ? "p-2 text-gray-300 dark:text-zinc-700 cursor-not-allowed border-2 border-gray-300 dark:border-zinc-600 rounded-full" : "p-2 text-sky-700 hover:text-sky-900 dark:text-sky-900 dark:hover:text-sky-700 transition-colors cursor-pointer border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-sky-600 dark:hover:border-sky-700"}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Set desk to ${direction} position`}
    >
      <Icon size={64} strokeWidth={3} />
    </button>
  );
}
