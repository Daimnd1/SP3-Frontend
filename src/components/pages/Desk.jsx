import { useState, useEffect } from 'react';
import { Armchair, TrendingUp, MonitorUp, Wifi, WifiOff } from 'lucide-react';
import { getDeskData, updateDeskPosition, getAllDesks } from '../../lib/backendAPI';

export default function Desk() {
  const [connectedDesk, setConnectedDesk] = useState(null);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeskSelection, setShowDeskSelection] = useState(false);
  const [availableDesks, setAvailableDesks] = useState([]);
  
  // Load settings from localStorage
  const [heightUnit, setHeightUnit] = useState('mm');
  const [heightPresets, setHeightPresets] = useState({
    sitting: 750,
    standing: 1100
  });

  // Load user preferences on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('deskSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.heightUnit) setHeightUnit(settings.heightUnit);
      if (settings.sittingHeight) {
        setHeightPresets(prev => ({ ...prev, sitting: settings.sittingHeight }));
      }
      if (settings.standingHeight) {
        setHeightPresets(prev => ({ ...prev, standing: settings.standingHeight }));
      }
    }
  }, []);

  // Convert height based on unit preference
  const convertHeight = (heightMm) => {
    switch (heightUnit) {
      case 'cm':
        return (heightMm / 10).toFixed(1);
      case 'in':
        return (heightMm / 25.4).toFixed(1);
      default:
        return Math.round(heightMm);
    }
  };

  const getUnitLabel = () => {
    switch (heightUnit) {
      case 'cm': return 'cm';
      case 'in': return 'in';
      default: return 'mm';
    }
  };

  // Poll desk data every 500ms when connected
  useEffect(() => {
    if (!connectedDesk) return;

    const interval = setInterval(async () => {
      try {
        const data = await getDeskData(connectedDesk);
        if (data?.state?.position_mm) {
          setCurrentHeight(data.state.position_mm);
        }
      } catch (error) {
        console.error('Failed to fetch desk data:', error);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [connectedDesk]);

  // Fetch initial height when desk connects
  useEffect(() => {
    if (connectedDesk) {
      getDeskData(connectedDesk)
        .then(data => {
          if (data?.state?.position_mm) {
            setCurrentHeight(data.state.position_mm);
          }
        })
        .catch(error => console.error('Failed to fetch initial desk data:', error));
    }
  }, [connectedDesk]);

  const handleConnectDesk = async () => {
    try {
      setIsLoading(true);
      const desks = await getAllDesks();
      setAvailableDesks(desks);
      setShowDeskSelection(true);
    } catch (error) {
      console.error('Failed to fetch desks:', error);
      alert('Failed to find desks. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDesk = (deskId) => {
    setConnectedDesk(deskId);
    setShowDeskSelection(false);
  };

  const handleDisconnect = () => {
    setConnectedDesk(null);
    setCurrentHeight(0);
  };

  const handleSetPosition = async (mode) => {
    if (!connectedDesk) {
      alert('Please connect to a desk first');
      return;
    }

    const targetHeight = heightPresets[mode];
    setIsLoading(true);
    
    try {
      await updateDeskPosition(connectedDesk, targetHeight);
      // Height will update automatically via polling
    } catch (error) {
      console.error('Failed to update desk position:', error);
      alert('Failed to adjust desk height. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Desk</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Control your smart standing desk</p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {connectedDesk ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {connectedDesk ? 'Connected' : 'Not Connected'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {connectedDesk ? `Desk ID: ${connectedDesk}` : 'Connect to your desk to start'}
              </p>
            </div>
          </div>
          
          {connectedDesk ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectDesk}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Connect to Desk'}
            </button>
          )}
        </div>
      </div>

      {/* Current Height Display - Shows in user's preferred unit */}
      {connectedDesk && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-8 text-center text-white">
          <MonitorUp className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h3 className="text-lg font-medium mb-2 opacity-90">Current Height</h3>
          <div className="text-6xl font-bold mb-2">{convertHeight(currentHeight)}</div>
          <p className="text-blue-100 text-lg">{getUnitLabel()}</p>
        </div>
      )}

      {/* Preset Position Controls - Shows configured presets with units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sitting Position */}
        <button
          onClick={() => handleSetPosition('sitting')}
          disabled={!connectedDesk || isLoading}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group border-2 border-transparent hover:border-orange-200"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Armchair className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sitting</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Optimal height for seated work</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
              <span className="text-3xl font-bold text-orange-600">
                {convertHeight(heightPresets.sitting)}
              </span>
              <span className="text-orange-600 font-medium">{getUnitLabel()}</span>
            </div>
          </div>
        </button>

        {/* Standing Position */}
        <button
          onClick={() => handleSetPosition('standing')}
          disabled={!connectedDesk || isLoading}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group border-2 border-transparent hover:border-blue-200"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Standing</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Optimal height for standing work</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-3xl font-bold text-blue-600">
                {convertHeight(heightPresets.standing)}
              </span>
              <span className="text-blue-600 font-medium">{getUnitLabel()}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Info Card */}
      {connectedDesk && (
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">i</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-gray-100 mb-1">Quick Tips</h4>
              <ul className="text-sm text-blue-800 dark:text-gray-400 space-y-1">
                <li>• Switch positions every 30-60 minutes for best results</li>
                <li>• Adjust preset heights in Configuration if needed</li>
                <li>• The desk will move smoothly to your selected position</li>
                <li>• Current display unit: {heightUnit === 'mm' ? 'Millimeters' : heightUnit === 'cm' ? 'Centimeters' : 'Inches'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Desk Selection Dialog */}
      {showDeskSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Select Your Desk</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Choose from available desks nearby</p>
            
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {availableDesks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No desks found</p>
                </div>
              ) : (
                availableDesks.map((desk) => (
                  <button
                    key={desk.id}
                    onClick={() => handleSelectDesk(desk.id)}
                    className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                          Desk {desk.id}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Click to connect</div>
                      </div>
                      <Wifi className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowDeskSelection(false)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
