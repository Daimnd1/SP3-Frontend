import { useState } from "react";

export default function Configuration({ heightPresets, setHeightPresets }) {
  const [apiConfig, setApiConfig] = useState({
    baseUrl: "http://localhost:8000",
    apiKey: "",
    deskId: "",
  });

  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: 45,
    sound: true,
    message: "Time to change your posture!",
  });

  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected, connecting, connected

  const handleTestConnection = async () => {
    setConnectionStatus("connecting");
    // Simulate API call
    setTimeout(() => {
      setConnectionStatus("connected");
    }, 1500);
  };

  const handleSavePreset = (preset) => {
    setHeightPresets(
      heightPresets.map((p) => (p.id === preset.id ? preset : p))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-4xl text-zinc-200">Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desk Connection */}
        <ConfigSection title="Desk Connection">
          <div className="space-y-4">
            <InputField
              label="API Base URL"
              value={apiConfig.baseUrl}
              onChange={(e) =>
                setApiConfig({ ...apiConfig, baseUrl: e.target.value })
              }
              placeholder="http://localhost:8000"
            />
            <InputField
              label="API Key"
              value={apiConfig.apiKey}
              onChange={(e) =>
                setApiConfig({ ...apiConfig, apiKey: e.target.value })
              }
              placeholder="Enter your API key"
              type="password"
            />
            <InputField
              label="Desk ID"
              value={apiConfig.deskId}
              onChange={(e) =>
                setApiConfig({ ...apiConfig, deskId: e.target.value })
              }
              placeholder="cd:fb:1a:53:fb:e6"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleTestConnection}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-zinc-200 font-semibold rounded-lg transition-colors"
                disabled={connectionStatus === "connecting"}
              >
                {connectionStatus === "connecting"
                  ? "Testing..."
                  : "Test Connection"}
              </button>
              <ConnectionStatus status={connectionStatus} />
            </div>
          </div>
        </ConfigSection>

        {/* Posture Reminders */}
        <ConfigSection title="Posture Reminders">
          <div className="flex flex-col gap-2">
            <ToggleSwitch
              label="Enable Reminders"
              checked={reminderSettings.enabled}
              onChange={(checked) =>
                setReminderSettings({ ...reminderSettings, enabled: checked })
              }
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Reminder Frequency (minutes)
              </label>
              <select
                value={reminderSettings.frequency}
                onChange={(e) =>
                  setReminderSettings({
                    ...reminderSettings,
                    frequency: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>

            <ToggleSwitch
              label="Sound Notification"
              checked={reminderSettings.sound}
              onChange={(checked) =>
                setReminderSettings({ ...reminderSettings, sound: checked })
              }
            />

            <InputField
              label="Reminder Message"
              value={reminderSettings.message}
              onChange={(e) =>
                setReminderSettings({
                  ...reminderSettings,
                  message: e.target.value,
                })
              }
              placeholder="Enter custom reminder message"
            />
          </div>
        </ConfigSection>
      </div>

      {/* Height Presets */}
      <ConfigSection title="Height Presets">
        <div className="flex flex-col">
          {heightPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSave={handleSavePreset}
            />
          ))}
        </div>
      </ConfigSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-zinc-200 font-semibold rounded-lg transition-colors">
          Save Configuration
        </button>
      </div>
    </div>
  );
}

// Reusable Components
function ConfigSection({ title, children }) {
  return (
    <div className="bg-zinc-800 border-2 border-zinc-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-zinc-200 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-sky-600" : "bg-zinc-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ConnectionStatus({ status }) {
  const statusConfig = {
    disconnected: { color: "bg-red-500", text: "Disconnected" },
    connecting: { color: "bg-yellow-500", text: "Connecting..." },
    connected: { color: "bg-green-500", text: "Connected" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
      <span className="text-sm text-zinc-300">{config.text}</span>
    </div>
  );
}

function PresetCard({ preset, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeight, setEditedHeight] = useState(preset.height);

  const handleSave = () => {
    onSave({ ...preset, height: editedHeight });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedHeight(preset.height);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg p-2">
      <div className="h-0.5 w-full bg-zinc-700 mb-4" />
      <div className="flex  justify-between items-center">
        <span className="text-zinc-200">
          {preset.name} ({preset.unit})
        </span>
        <div className="flex flex-wrap justify-end items-center gap-2">
          {isEditing ? (
            <>
              <input
                type="number"
                value={editedHeight}
                onChange={(e) => setEditedHeight(Number(e.target.value))}
                className="px-2 py-1 w-16 bg-zinc-700 border border-zinc-600 rounded font-bold text-zinc-400 text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                autoFocus
              />
              <div>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 mr-1 bg-sky-600 hover:bg-sky-700 text-sm text-zinc-200 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 bg-zinc-600 hover:bg-zinc-500 text-sm text-zinc-200 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-zinc-400">{preset.height}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-200 rounded transition-colors text-sm"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
