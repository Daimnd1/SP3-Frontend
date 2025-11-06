import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine, Power } from "lucide-react";

const BUTTON_STYLE_ENABLED = "p-2 text-sky-900 hover:text-sky-700 transition-colors cursor-pointer";
const BUTTON_STYLE_DISABLED = "p-2 text-zinc-700 cursor-not-allowed";

export default function Desk() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="flex flex-col gap-12 items-center pt-8 text-center">
      <ConnectionStatus isConnected={isConnected} />
      <DeskDashboard isConnected={isConnected} setIsConnected={setIsConnected} />
    </div>
  )
}

function DeskDashboard({ isConnected, setIsConnected }) {
  return (
    <div className="flex flex-col bg-zinc-800 w-full rounded-xl gap-4 p-8 pb-24">
        <div className="flex justify-between md:justify-center items-center">
          <h2 className="font-bold text-2xl text-zinc-200">Desk</h2>
          <div className="md:hidden">
            <ButtonConnectToDesk isConnected={isConnected} setIsConnected={setIsConnected} size={32} />
          </div>
        </div>
        <div className="border-t border-zinc-600" />
        <DeskStatus isConnected={isConnected} />
        <DeskControls isConnected={isConnected} setIsConnected={setIsConnected} />
      </div>
  )
}
function ConnectionStatus({ isConnected, deskName = "Smart Desk" }) {
  return (
    <div className="flex justify-center items-center gap-4 text-center">
      <div className={`rounded-full w-4 h-4 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
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
  )
}

function DeskStatus({height = 75, mode = "Sitting", isConnected}) {
  return (
    <div className="text-center mb-8">
      <h2 className="font-bold text-2xl text-zinc-200 -mb-3">Status</h2>
      <p className="font-medium text-zinc-400 mt-4">
        {isConnected ? `Height: ${height} cm | Mode: ${mode}` : 'Not connected'}
      </p>
    </div>
  )
}

function DeskControls({ isConnected, setIsConnected }) {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <h1 className="font-bold text-2xl text-zinc-200">Controls</h1>
      <div className="flex flex-row justify-center gap-16 mt-6">
        <ButtonsMoveDesk isConnected={isConnected} />
        <div className="hidden md:block">
          <ButtonConnectToDesk isConnected={isConnected} setIsConnected={setIsConnected} size={164} />
        </div>
        <ButtonsSetMode isConnected={isConnected} />
      </div>
    </div>
  )
}

function ButtonConnectToDesk({ isConnected, setIsConnected, size=196 }) {
  return (
    <button
      className={`p-2 transition-all  ${
        isConnected 
          ? 'text-sky-400 drop-shadow-[0_0_16px_rgba(56,189,248,0.8)] hover:drop-shadow-[0_0_24px_rgba(56,189,248,1)]' 
          : 'text-zinc-400 hover:text-sky-400'
      }`}
      onClick={() => setIsConnected(!isConnected)}
      aria-label={isConnected ? 'Disconnect from desk' : 'Connect to desk'}
    >
      <Power size={size} strokeWidth={3} />
    </button>
  )
}

function ButtonsMoveDesk({ isConnected }) {
  return (
    <div className="flex flex-col gap-4 items-center py-2 border-2 border-zinc-600 rounded-full">
      <ButtonMoveDesk direction="Up" icon={ArrowUp} disabled={!isConnected} />
      <ButtonMoveDesk direction="Down" icon={ArrowDown} disabled={!isConnected} />
    </div>
  )
}

function ButtonsSetMode({ isConnected }) {
  return (
    <div className="flex flex-col gap-4 items-center py-2 border-2 border-zinc-600 rounded-full">
      <ButtonMoveDesk direction="Standing" icon={ArrowUpToLine} disabled={!isConnected} />
      <ButtonMoveDesk direction="Sitting" icon={ArrowDownToLine} disabled={!isConnected} />
    </div>
  )
}

function ButtonMoveDesk({ direction, icon = ArrowUp, disabled }) {
  const Icon = icon;

  function handleMoveDesk() {
    alert(`Moving desk ${direction}`);
  }

  return (
    <button
      className={disabled ? BUTTON_STYLE_DISABLED : BUTTON_STYLE_ENABLED}
      onClick={handleMoveDesk}
      disabled={disabled}
      aria-label={`Move desk ${direction}`}
    >
      <Icon size={64} strokeWidth={3} />
    </button>
  )
}
