import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Dynamic logger import to avoid server-side dependencies on client
const getLogger = async () => {
  if (typeof window === 'undefined') {
    // Server-side
    const { deviceLogger } = await import('../utils/logger.js');
    return deviceLogger;
  } else {
    // Client-side - use console
    return {
      info: (msg, data) => console.log(`[DEVICE] ${msg}`, data),
      error: (msg, data) => console.error(`[DEVICE] ${msg}`, data),
      warn: (msg, data) => console.warn(`[DEVICE] ${msg}`, data)
    };
  }
};

const useDeviceStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        devices: [],
        lastEntries: [],
        gateways: [],
        selectedDevice: null,
        selectedGateway: null,
        lastUpdated: null,
        isLoading: false,
        error: null,
        autoRefresh: true,
        refreshInterval: 5 * 60 * 1000, // 5 minutes
        refreshTimer: null,
        totalDevices: 0,
        onlineDevices: 0,
        alertsCount: 0,
        stats: {
          totalDevices: 0,
          onlineDevices: 0,
          offlineDevices: 0,
          alertsCount: 0,
          averageTemperature: 0,
          averageHumidity: 0,
          lastDataReceived: null
        },

        // Actions
        setLoading: (loading) => set({ isLoading: loading }),
        
        setError: async (error) => {
          const logger = await getLogger();
          logger.error('Device store error:', { error: error?.message || error });
          set({ error, isLoading: false });
        },

        clearError: () => set({ error: null }),

        setDevices: (devices) => {
          const stats = get().calculateStats(devices);
          set({ 
            devices, 
            stats,
            totalDevices: devices.length,
            lastUpdated: new Date().toISOString(),
            error: null 
          });
        },

        setLastEntries: async (entries) => {
          const logger = await getLogger();
          
          // Process and validate entries
          const processedEntries = entries.map(entry => ({
            ...entry,
            temperature: parseFloat(entry.temperature) || 0,
            humidity: parseFloat(entry.humidity) || 0,
            timestamp: entry.timestamp || new Date().toISOString(),
            status: get().getDeviceStatus(entry)
          }));

          logger.info('Updated device entries', { 
            count: processedEntries.length,
            devices: [...new Set(processedEntries.map(e => e.deviceName))]
          });

          const stats = get().calculateStatsFromEntries(processedEntries);
          
          set({ 
            lastEntries: processedEntries,
            stats,
            lastUpdated: new Date().toISOString(),
            error: null 
          });
        },

        setGateways: (gateways) => set({ 
          gateways, 
          lastUpdated: new Date().toISOString(),
          error: null 
        }),

        setSelectedDevice: (device) => set({ selectedDevice: device }),
        
        setSelectedGateway: (gateway) => set({ selectedGateway: gateway }),

        // Fetch latest device data
        fetchDeviceData: async () => {
          const logger = await getLogger();
          
          try {
            set({ isLoading: true, error: null });
            
            const response = await fetch('/api/lastEntries');
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
              get().setLastEntries(data.data);
              logger.info('Device data fetched successfully', { 
                count: data.data.length 
              });
            } else {
              throw new Error(data.error || 'Failed to fetch device data');
            }
            
          } catch (error) {
            logger.error('Failed to fetch device data:', error);
            get().setError(error.message);
          } finally {
            set({ isLoading: false });
          }
        },

        // Auto-refresh functionality
        startAutoRefresh: () => {
          const { refreshInterval, autoRefresh } = get();
          
          if (!autoRefresh) return;

          // Clear existing timer
          get().stopAutoRefresh();

          const timer = setInterval(() => {
            get().fetchDeviceData();
          }, refreshInterval);

          set({ refreshTimer: timer });
        },

        stopAutoRefresh: () => {
          const { refreshTimer } = get();
          if (refreshTimer) {
            clearInterval(refreshTimer);
            set({ refreshTimer: null });
          }
        },

        setAutoRefresh: (enabled) => {
          set({ autoRefresh: enabled });
          
          if (enabled) {
            get().startAutoRefresh();
          } else {
            get().stopAutoRefresh();
          }
        },

        setRefreshInterval: (interval) => {
          set({ refreshInterval: interval });
          
          // Restart auto-refresh with new interval
          if (get().autoRefresh) {
            get().stopAutoRefresh();
            get().startAutoRefresh();
          }
        },

        // Utility functions
        getDeviceStatus: (entry) => {
          const now = new Date();
          const entryTime = new Date(entry.timestamp);
          const timeDiff = (now - entryTime) / (1000 * 60); // minutes

          if (timeDiff > 30) return 'offline';
          if (entry.temperature > 30 || entry.humidity > 80) return 'warning';
          return 'online';
        },

        getDeviceById: (deviceId) => {
          return get().devices.find(device => device._id === deviceId);
        },

        getDeviceByName: (deviceName) => {
          return get().lastEntries.find(entry => entry.deviceName === deviceName);
        },

        getGatewayById: (gatewayId) => {
          return get().gateways.find(gateway => gateway._id === gatewayId);
        },

        // Calculate statistics
        calculateStats: (devices) => {
          const onlineDevices = devices.filter(d => d.status === 'online').length;
          const totalDevices = devices.length;
          
          return {
            totalDevices,
            onlineDevices,
            offlineDevices: totalDevices - onlineDevices,
            alertsCount: devices.filter(d => d.status === 'warning').length,
            averageTemperature: 0,
            averageHumidity: 0,
            lastDataReceived: devices.length > 0 ? new Date().toISOString() : null
          };
        },

        calculateStatsFromEntries: (entries) => {
          if (!entries.length) {
            return {
              totalDevices: 0,
              onlineDevices: 0,
              offlineDevices: 0,
              alertsCount: 0,
              averageTemperature: 0,
              averageHumidity: 0,
              lastDataReceived: null
            };
          }

          const uniqueDevices = [...new Set(entries.map(e => e.deviceName))];
          const onlineDevices = entries.filter(e => get().getDeviceStatus(e) === 'online');
          const alertDevices = entries.filter(e => get().getDeviceStatus(e) === 'warning');
          
          const avgTemp = entries.reduce((sum, e) => sum + (parseFloat(e.temperature) || 0), 0) / entries.length;
          const avgHum = entries.reduce((sum, e) => sum + (parseFloat(e.humidity) || 0), 0) / entries.length;
          
          return {
            totalDevices: uniqueDevices.length,
            onlineDevices: [...new Set(onlineDevices.map(e => e.deviceName))].length,
            offlineDevices: uniqueDevices.length - [...new Set(onlineDevices.map(e => e.deviceName))].length,
            alertsCount: [...new Set(alertDevices.map(e => e.deviceName))].length,
            averageTemperature: Math.round(avgTemp * 10) / 10,
            averageHumidity: Math.round(avgHum * 10) / 10,
            lastDataReceived: entries.length > 0 ? 
              entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp : 
              null
          };
        },

        // Filter and search functions
        filterDevicesByStatus: (status) => {
          return get().lastEntries.filter(entry => get().getDeviceStatus(entry) === status);
        },

        searchDevices: (searchTerm) => {
          const term = searchTerm.toLowerCase();
          return get().lastEntries.filter(entry => 
            entry.deviceName.toLowerCase().includes(term) ||
            entry.devEUI.toLowerCase().includes(term)
          );
        },

        // Export functionality
        exportDeviceData: async (format = 'json') => {
          const logger = await getLogger();
          
          try {
            const { lastEntries } = get();
            
            if (typeof window !== 'undefined') {
              // Dynamic import to avoid server-side issues
              const { exportData } = await import('../utils/dataExport.js');
              const exported = await exportData(lastEntries, format, 'device-data');
              
              logger.info('Device data exported', { 
                format, 
                recordCount: lastEntries.length 
              });
              
              return exported;
            }
          } catch (error) {
            logger.error('Failed to export device data:', error);
            throw error;
          }
        },

        // Cleanup function
        cleanup: () => {
          get().stopAutoRefresh();
        }
      }),
      {
        name: 'device-store',
        partialize: (state) => ({
          // Only persist these fields
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,
          selectedDevice: state.selectedDevice,
          selectedGateway: state.selectedGateway
        }),
      }
    ),
    {
      name: 'device-store',
    }
  )
);

export default useDeviceStore; 