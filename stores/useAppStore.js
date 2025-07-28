import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Dynamic logger import to avoid server-side dependencies on client
const getAuthLogger = async () => {
  if (typeof window === 'undefined') {
    // Server-side
    const { logAuth } = await import('../utils/logger.js');
    return logAuth;
  } else {
    // Client-side fallback
    return (user, action, success = true, details = {}) => {
      console.log(`[AUTH] ${action} ${success ? 'successful' : 'failed'}`, {
        user: user?.name || 'Unknown',
        action,
        success,
        ...details
      });
    };
  }
};

const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Authentication state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        
        // Theme and UI state
        theme: 'light',
        sidebarOpen: true,
        notifications: [],
        
        // App settings
        settings: {
          autoRefresh: true,
          refreshInterval: 5 * 60 * 1000, // 5 minutes
          notifications: true,
          soundAlerts: false,
          language: 'en',
          dateFormat: 'MM/dd/yyyy',
          temperatureUnit: 'celsius'
        },

        // Actions
        setLoading: (loading) => set({ isLoading: loading }),
        
        setAuthError: (error) => set({ authError: error }),
        
        clearAuthError: () => set({ authError: null }),

        // Authentication actions
        login: async (credentials) => {
          const logAuth = await getAuthLogger();
          
          try {
            set({ isLoading: true, authError: null });
            
            const response = await fetch('/api/users/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.success) {
              set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                authError: null
              });

              logAuth(data.user, 'login', true, {
                ip: 'client',
                userAgent: navigator?.userAgent || 'Unknown'
              });

              return { success: true, user: data.user };
            } else {
              throw new Error(data.error || 'Login failed');
            }
          } catch (error) {
            const errorMessage = error.message || 'Login failed';
            
            set({
              isLoading: false,
              authError: errorMessage,
              isAuthenticated: false,
              user: null
            });

            logAuth(null, 'login', false, {
              error: errorMessage,
              ip: 'client',
              userAgent: navigator?.userAgent || 'Unknown'
            });

            return { success: false, error: errorMessage };
          }
        },

        logout: async () => {
          const logAuth = await getAuthLogger();
          const { user } = get();
          
          try {
            // Call logout API if available
            await fetch('/api/users/logout', {
              method: 'POST',
            }).catch(() => {
              // Ignore logout API errors
            });

            set({
              user: null,
              isAuthenticated: false,
              authError: null
            });

            logAuth(user, 'logout', true);

            return { success: true };
          } catch (error) {
            logAuth(user, 'logout', false, { error: error.message });
            return { success: false, error: error.message };
          }
        },

        register: async (userData) => {
          const logAuth = await getAuthLogger();
          
          try {
            set({ isLoading: true, authError: null });
            
            const response = await fetch('/api/users/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success) {
              set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                authError: null
              });

              logAuth(data.user, 'register', true);

              return { success: true, user: data.user };
            } else {
              throw new Error(data.error || 'Registration failed');
            }
          } catch (error) {
            const errorMessage = error.message || 'Registration failed';
            
            set({
              isLoading: false,
              authError: errorMessage
            });

            logAuth(null, 'register', false, { error: errorMessage });

            return { success: false, error: errorMessage };
          }
        },

        // Profile management
        updateProfile: async (profileData) => {
          const logAuth = await getAuthLogger();
          const { user } = get();
          
          if (!user || !user.token) {
            const error = new Error('User is not authenticated.');
            set({ authError: error.message });
            logAuth(null, 'profile_update', false, { error: error.message });
            return { success: false, error: error.message };
          }

          try {
            set({ isLoading: true, authError: null });
            
            const response = await fetch('/api/users/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
              },
              body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.success) {
              set({
                user: { ...user, ...data.user },
                isLoading: false,
                authError: null
              });

              logAuth(data.user, 'profile_update', true);

              return { success: true, user: data.user };
            } else {
              throw new Error(data.message || 'Profile update failed');
            }
          } catch (error) {
            const errorMessage = error.message || 'Profile update failed';
            
            set({
              isLoading: false,
              authError: errorMessage
            });

            logAuth(user, 'profile_update', false, { error: errorMessage });

            return { success: false, error: errorMessage };
          }
        },

        // Theme actions
        setTheme: (theme) => set({ theme }),
        
        toggleTheme: () => {
          const currentTheme = get().theme;
          set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
        },

        // Sidebar actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        
        toggleSidebar: () => {
          const currentState = get().sidebarOpen;
          set({ sidebarOpen: !currentState });
        },

        // Notification actions
        addNotification: (notification) => {
          const notifications = get().notifications;
          const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...notification
          };
          
          set({ 
            notifications: [newNotification, ...notifications].slice(0, 50) // Keep only last 50
          });
        },

        removeNotification: (id) => {
          const notifications = get().notifications.filter(n => n.id !== id);
          set({ notifications });
        },

        clearNotifications: () => set({ notifications: [] }),

        markNotificationAsRead: (id) => {
          const notifications = get().notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          );
          set({ notifications });
        },

        // Settings actions
        updateSettings: (newSettings) => {
          const currentSettings = get().settings;
          set({
            settings: { ...currentSettings, ...newSettings }
          });
        },

        resetSettings: () => {
          set({
            settings: {
              autoRefresh: true,
              refreshInterval: 5 * 60 * 1000,
              notifications: true,
              soundAlerts: false,
              language: 'en',
              dateFormat: 'MM/dd/yyyy',
              temperatureUnit: 'celsius'
            }
          });
        },

        // Utility actions
        showAlert: (message, type = 'info') => {
          get().addNotification({
            message,
            type,
            autoHide: true,
            duration: 3000
          });
        },

        showError: (message) => {
          get().addNotification({
            message,
            type: 'error',
            autoHide: false
          });
        },

        showSuccess: (message) => {
          get().addNotification({
            message,
            type: 'success',
            autoHide: true,
            duration: 3000
          });
        },

        // Initialize app state
        initialize: async () => {
          const logAuth = await getAuthLogger();
          
          try {
            // Check if user is already authenticated (e.g., from localStorage token)
            const token = localStorage?.getItem('authToken');
            
            if (token) {
              const response = await fetch('/api/users/profile', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success) {
                  set({
                    user: data.user,
                    isAuthenticated: true,
                    isLoading: false
                  });

                  logAuth(data.user, 'session_restored', true);
                }
              }
            }
          } catch (error) {
            logAuth(null, 'session_restore', false, { error: error.message });
            // Silent fail for initialization
          } finally {
            set({ isLoading: false });
          }
        },

        // Get user preferences
        getUserPreferences: () => {
          const { user, settings, theme } = get();
          return {
            theme,
            settings,
            user: {
              name: user?.name,
              email: user?.email,
              role: user?.role
            }
          };
        },

        // Get unread notifications count
        getUnreadNotificationsCount: () => {
          return get().notifications.filter(n => !n.read).length;
        }
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          // Persist these fields
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          settings: state.settings,
          user: state.user,
          isAuthenticated: state.isAuthenticated
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

export default useAppStore; 