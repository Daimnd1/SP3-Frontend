import { useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Power,
} from "lucide-react";

export default function Desk({ heightPresets = [], isConnected, setIsConnected, currentHeight, setCurrentHeight }) {
  return (
    <div className="flex flex-col gap-12 items-center pt-8 text-center">
      <ConnectionStatus isConnected={isConnected} />
      <DeskDashboard
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        heightPresets={heightPresets}
        currentHeight={currentHeight}
        setCurrentHeight={setCurrentHeight}
      />
    </div>
  );
}

function DeskDashboard({ isConnected, setIsConnected, heightPresets, currentHeight, setCurrentHeight }) {
  return (
    <div className="flex flex-col bg-zinc-800 border-2 border-zinc-700 w-full rounded-xl gap-4 p-8 pb-24">
      <div className="flex justify-between md:justify-center items-center">
        <h2 className="font-bold text-2xl text-zinc-200">Desk</h2>
        <div className="md:hidden">
          <ButtonConnectToDesk
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            size={32}
          />
        </div>
      </div>
      <div className="border-t border-zinc-600" />
      <DeskStatus isConnected={isConnected} currentHeight={currentHeight} heightPresets={heightPresets} />
      <DeskControls isConnected={isConnected} setIsConnected={setIsConnected} heightPresets={heightPresets} currentHeight={currentHeight} setCurrentHeight={setCurrentHeight} />
    </div>
  );
}
function ConnectionStatus({ isConnected, deskName = "Smart Desk" }) {
  return (
    <div className="flex justify-center items-center gap-4 text-center">
      <div
        className={`rounded-full w-4 h-4 ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {isConnected ? (
        <h2 className="font-medium text-2xl text-zinc-400">
          Connected to {deskName}
        </h2>
      ) : (
        <h2 className="font-medium text-2xl text-zinc-400">
          Connect to a desk...
        </h2>
      )}
    </div>
  );
}

function DeskStatus({ isConnected, currentHeight, heightPresets }) {
  // Convert mm to cm for display
  const heightInCm = Math.round(currentHeight / 10);
  
  // Determine mode based on current height
  let mode = "Custom";
  if (heightPresets && heightPresets.length > 0) {
    const sittingPreset = heightPresets.find(p => p.name === "Sitting");
    const standingPreset = heightPresets.find(p => p.name === "Standing");
    
    // Allow 20mm tolerance for preset matching
    if (sittingPreset && Math.abs(currentHeight - sittingPreset.height) <= 20) {
      mode = "Sitting";
    } else if (standingPreset && Math.abs(currentHeight - standingPreset.height) <= 20) {
      mode = "Standing";
    }
  }
  
  return (
    <div className="text-center mb-8">
      <h2 className="font-bold text-2xl text-zinc-200 -mb-3">Status</h2>
      <p className="font-medium text-zinc-400 mt-4">
        {isConnected ? `Height: ${heightInCm} cm | Mode: ${mode}` : "Not connected"}
      </p>
    </div>
  );
}

function DeskControls({ isConnected, setIsConnected, heightPresets, currentHeight, setCurrentHeight }) {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <h1 className="font-bold text-2xl text-zinc-200">Controls</h1>
      <div className="flex flex-row justify-center gap-16 mt-6">
        <ButtonsMoveDesk isConnected={isConnected} currentHeight={currentHeight} setCurrentHeight={setCurrentHeight} />
        <div className="hidden md:block">
          <ButtonConnectToDesk
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            size={164}
          />
        </div>
        <ButtonsSetMode isConnected={isConnected} heightPresets={heightPresets} currentHeight={currentHeight} setCurrentHeight={setCurrentHeight} />
      </div>
    </div>
  );
}

function ButtonConnectToDesk({ isConnected, setIsConnected, size = 196 }) {
  return (
    <button
      className={`p-2 transition-all  ${
        isConnected
          ? "text-sky-400 drop-shadow-[0_0_16px_rgba(56,189,248,0.8)] hover:drop-shadow-[0_0_24px_rgba(56,189,248,1)]"
          : "text-zinc-400 hover:text-sky-400"
      }`}
      onClick={() => setIsConnected(!isConnected)}
      aria-label={isConnected ? "Disconnect from desk" : "Connect to desk"}
    >
      <Power size={size} strokeWidth={3} />
    </button>
  );
}

function ButtonsMoveDesk({ isConnected, currentHeight, setCurrentHeight }) {
  return (
    <div className="flex flex-col gap-4 items-center py-2 border-2 border-zinc-600 rounded-full">
      <ButtonMoveDesk direction="Up" icon={ArrowUp} disabled={!isConnected} currentHeight={currentHeight} setCurrentHeight={setCurrentHeight} />
      <ButtonMoveDesk
        direction="Down"
        icon={ArrowDown}
        disabled={!isConnected}
        currentHeight={currentHeight}
        setCurrentHeight={setCurrentHeight}
      />
    </div>
  );
}

function ButtonsSetMode({ isConnected, heightPresets, currentHeight, setCurrentHeight }) {
  return (
    <div className="flex flex-col gap-4 items-center py-2 border-2 border-zinc-600 rounded-full">
      <ButtonMoveDesk
        direction="Standing"
        icon={ArrowUpToLine}
        disabled={!isConnected}
        heightPresets={heightPresets}
        currentHeight={currentHeight}
        setCurrentHeight={setCurrentHeight}
      />
      <ButtonMoveDesk
        direction="Sitting"
        icon={ArrowDownToLine}
        disabled={!isConnected}
        heightPresets={heightPresets}
        currentHeight={currentHeight}
        setCurrentHeight={setCurrentHeight}
      />
    </div>
  );
}

function ButtonMoveDesk({ direction, icon = ArrowUp, disabled, heightPresets = [], currentHeight, setCurrentHeight }) {
  const Icon = icon;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseDown = () => {
    if (disabled) return; 

    // For preset buttons (Standing/Sitting), set height directly
    if (direction === "Standing" || direction === "Sitting") {
      const preset = heightPresets.find(p => p.name === direction);
      if (preset) {
        setCurrentHeight(preset.height);
      }
      return;
    }

    // For Up/Down buttons, start continuous movement
    const increment = direction === "Up" ? 5 : -5;
    
    // Initial movement
    setCurrentHeight(prev => Math.max(600, Math.min(1300, prev + increment)));
    
    // Start continuous movement after a delay
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCurrentHeight(prev => Math.max(600, Math.min(1300, prev + increment)));
      }, 150);
    }, 300);
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      className={disabled ? "p-2 text-zinc-700 cursor-not-allowed" : "p-2 text-sky-900 hover:text-sky-700 transition-colors cursor-pointer"}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled}
      aria-label={`Move desk ${direction}`}
    >
      <Icon size={64} strokeWidth={3} />
    </button>
  );
}
