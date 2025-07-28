const config = {
  development: {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/marelli-dashboard',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    
    // Server
    server: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost'
    },
    
    // JWT
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // ChirpStack
    chirpstack: {
      url: process.env.NEXT_PUBLIC_CHIRPSTACK_URL || 'http://localhost:8080',
      apiKey: process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
      applicationId: process.env.NEXT_PUBLIC_CHIRPSTACK_APPLICATION_ID
    },
    
    // Data refresh intervals (in milliseconds)
    refresh: {
      dashboard: 30000, // 30 seconds
      devices: 60000,   // 1 minute
      gateways: 120000  // 2 minutes
    },
    
    // Logging
    logging: {
      level: 'debug',
      console: true,
      file: true
    },
    
    // Cache
    cache: {
      ttl: 300, // 5 minutes
      checkPeriod: 60 // 1 minute
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 1000, // requests per window
      message: 'Too many requests from this IP'
    },
    
    // CORS
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    
    // File upload
    upload: {
      maxSize: 5242880, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
  },
  
  production: {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    
    // Server
    server: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0'
    },
    
    // JWT
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1d'
    },
    
    // ChirpStack
    chirpstack: {
      url: process.env.NEXT_PUBLIC_CHIRPSTACK_URL,
      apiKey: process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
      applicationId: process.env.NEXT_PUBLIC_CHIRPSTACK_APPLICATION_ID
    },
    
    // Data refresh intervals (in milliseconds)
    refresh: {
      dashboard: 60000,  // 1 minute
      devices: 300000,   // 5 minutes
      gateways: 600000   // 10 minutes
    },
    
    // Logging
    logging: {
      level: 'info',
      console: false,
      file: true
    },
    
    // Cache
    cache: {
      ttl: 900, // 15 minutes
      checkPeriod: 300 // 5 minutes
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100, // requests per window
      message: 'Too many requests from this IP'
    },
    
    // CORS
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    },
    
    // File upload
    upload: {
      maxSize: 2097152, // 2MB
      allowedTypes: ['image/jpeg', 'image/png']
    }
  },
  
  test: {
    // Database
    mongodb: {
      uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/marelli-dashboard-test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    
    // Server
    server: {
      port: process.env.TEST_PORT || 3001,
      host: 'localhost'
    },
    
    // JWT
    jwt: {
      secret: 'test-secret-key',
      expiresIn: '1h',
      refreshExpiresIn: '2h'
    },
    
    // ChirpStack
    chirpstack: {
      url: 'http://localhost:8080',
      apiKey: 'test-api-key',
      applicationId: 'test-app-id'
    },
    
    // Data refresh intervals
    refresh: {
      dashboard: 5000,  // 5 seconds
      devices: 10000,   // 10 seconds
      gateways: 15000   // 15 seconds
    },
    
    // Logging
    logging: {
      level: 'error',
      console: false,
      file: false
    },
    
    // Cache
    cache: {
      ttl: 60, // 1 minute
      checkPeriod: 10 // 10 seconds
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: 60000,
      max: 1000,
      message: 'Too many requests'
    },
    
    // CORS
    cors: {
      origin: '*',
      credentials: true
    },
    
    // File upload
    upload: {
      maxSize: 1048576, // 1MB
      allowedTypes: ['image/jpeg', 'image/png']
    }
  }
};

// Device configuration
export const deviceConfig = {
  // Supported device types
  deviceTypes: {
    TEMP_HUMIDITY: 'temperature_humidity',
    TEMP_ONLY: 'temperature_only',
    HUMIDITY_ONLY: 'humidity_only'
  },
  
  // Default device settings
  defaults: {
    temperatureUnit: 'celsius', // or fahrenheit
    humidityUnit: 'percent',
    dataRetentionDays: 90,
    alertThresholds: {
      temperature: { min: 18, max: 25 },
      humidity: { min: 40, max: 60 }
    }
  },
  
  // Known device EUIs (for validation)
  knownDevices: [
    'a8404151518379f9',
    'a8404181e18379fd',
    'a8404152a1837a0e',
    'a840417eb1837a01',
    'a84041c2718379fe',
    'a84041b931837a0a'
  ]
};

// Application features
export const features = {
  authentication: true,
  realTimeData: true,
  dataExport: true,
  deviceControl: true,
  alertSystem: true,
  userManagement: true,
  dataVisualization: true,
  mobileSupport: true,
  darkMode: true,
  pwa: true
};

// Get configuration based on environment
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

if (!currentConfig) {
  throw new Error(`Configuration for environment '${env}' not found`);
}

export default currentConfig; 