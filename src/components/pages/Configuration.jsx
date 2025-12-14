import { useState } from "react";
import { usePostureTimer } from "../../contexts/PostureTimerContext";
import { useAuth } from "../../contexts/AuthContext";
import { upsertUserDeskPreset } from "../../lib/database";

export default function Configuration({ heightPresets, setHeightPresets, dbDeskId }) {
  const { user } = useAuth();
  const { sittingReminder, standingReminder, setSittingReminder, setStandingReminder } = usePostureTimer();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleSavePreset = async (preset) => {
    setHeightPresets(
      heightPresets.map((p) => (p.id === preset.id ? preset : p))
    );

    // Save to database if user is logged in
    if (user) {
      try {
        const sitting = heightPresets.find(p => p.name === "Sitting");
        const standing = heightPresets.find(p => p.name === "Standing");
        
        const sittingHeight = preset.name === "Sitting" ? preset.height : sitting?.height || 720;
        const standingHeight = preset.name === "Standing" ? preset.height : standing?.height || 1100;
        
        await upsertUserDeskPreset(
          user.id,
          sittingHeight,
          standingHeight,
          null // notification frequency - we'll add this later
        );
      } catch (error) {
        console.error('Failed to save preset to database:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-4xl text-gray-900 dark:text-gray-200">Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sitting Reminder */}
        <ConfigSection title="Sitting Reminder">
          <div className="flex flex-col gap-2">
            <ToggleSwitch
              label="Enable Reminder"
              checked={sittingReminder.enabled}
              onChange={(checked) =>
                setSittingReminder({ ...sittingReminder, enabled: checked })
              }
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Reminder Frequency (minutes)
              </label>
              <select
                value={sittingReminder.frequency}
                onChange={(e) =>
                  setSittingReminder({
                    ...sittingReminder,
                    frequency: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5000}>5 seconds (test)</option>
                <option value={10000}>10 seconds (test)</option>
                <option value={1800000}>30 minutes</option>
                <option value={2700000}>45 minutes</option>
                <option value={3600000}>60 minutes</option>
                <option value={5400000}>90 minutes</option>
              </select>
            </div>

            <InputField
              label="Reminder Message"
              value={sittingReminder.message}
              onChange={(e) =>
                setSittingReminder({
                  ...sittingReminder,
                  message: e.target.value,
                })
              }
              placeholder="Enter custom reminder message"
            />
          </div>
        </ConfigSection>

        {/* Standing Reminder */}
        <ConfigSection title="Standing Reminder">
          <div className="flex flex-col gap-2">
            <ToggleSwitch
              label="Enable Reminder"
              checked={standingReminder.enabled}
              onChange={(checked) =>
                setStandingReminder({ ...standingReminder, enabled: checked })
              }
            />

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Reminder Frequency (minutes)
              </label>
              <select
                value={standingReminder.frequency}
                onChange={(e) =>
                  setStandingReminder({
                    ...standingReminder,
                    frequency: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5000}>5 seconds (test)</option>
                <option value={10000}>10 seconds (test)</option>
                <option value={900000}>15 minutes</option>
                <option value={1200000}>20 minutes</option>
                <option value={1800000}>30 minutes</option>
                <option value={2700000}>45 minutes</option>
              </select>
            </div>

            <InputField
              label="Reminder Message"
              value={standingReminder.message}
              onChange={(e) =>
                setStandingReminder({
                  ...standingReminder,
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
      <div className="flex justify-end items-center gap-4">
        {showSaveConfirmation && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            Settings saved!
          </span>
        )}
        <button 
          onClick={() => {
            setShowSaveConfirmation(true);
            setTimeout(() => setShowSaveConfirmation(false), 3000);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-200 font-semibold rounded-lg transition-colors"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}

// Reusable Components
function ConfigSection({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
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

function PresetCard({ preset, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  // Display in cm (divide mm by 10)
  const [editedHeight, setEditedHeight] = useState(Math.round(preset.height / 10));

  const handleSave = () => {
    // Convert cm back to mm for storage
    onSave({ ...preset, height: editedHeight * 10 });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedHeight(Math.round(preset.height / 10));
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg p-2">
      <div className="h-0.5 w-full bg-gray-300 dark:bg-gray-700 mb-4" />
      <div className="flex  justify-between items-center">
        <span className="text-gray-900 dark:text-gray-200">
          {preset.name} ({preset.unit})
        </span>
        <div className="flex flex-wrap justify-end items-center gap-2">
          {isEditing ? (
            <>
              <input
                type="number"
                value={editedHeight}
                onChange={(e) => setEditedHeight(Number(e.target.value))}
                className="px-2 py-1 w-16 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-bold text-gray-900 dark:text-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 mr-1 bg-blue-600 hover:bg-blue-700 text-sm text-white dark:text-gray-200 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-sm text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-gray-700 dark:text-gray-400">{Math.round(preset.height / 10)}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded transition-colors text-sm"
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
