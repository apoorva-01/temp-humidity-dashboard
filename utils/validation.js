import Joi from 'joi';

// Common validation patterns
const patterns = {
  devEUI: /^[a-fA-F0-9]{16}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

// Device Entry validation
export const deviceEntrySchema = Joi.object({
  deviceName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Device name is required',
      'string.min': 'Device name must be at least 3 characters',
      'string.max': 'Device name cannot exceed 100 characters'
    }),
    
  devEUI: Joi.string()
    .pattern(patterns.devEUI)
    .required()
    .messages({
      'string.pattern.base': 'devEUI must be a 16-character hexadecimal string',
      'string.empty': 'devEUI is required'
    }),
    
  temperature: Joi.number()
    .min(-50)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Temperature must be a number',
      'number.min': 'Temperature cannot be below -50°C',
      'number.max': 'Temperature cannot exceed 100°C',
      'number.empty': 'Temperature is required'
    }),
    
  humidity: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Humidity must be a number',
      'number.min': 'Humidity cannot be below 0%',
      'number.max': 'Humidity cannot exceed 100%',
      'number.empty': 'Humidity is required'
    }),
    
  timestamp: Joi.date()
    .default(Date.now)
    .messages({
      'date.base': 'Timestamp must be a valid date'
    }),
    
  rssi: Joi.number()
    .min(-150)
    .max(0)
    .optional(),
    
  snr: Joi.number()
    .min(-20)
    .max(20)
    .optional(),
    
  batteryLevel: Joi.number()
    .min(0)
    .max(100)
    .optional(),
    
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }).optional()
});

// User validation
export const userSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters'
    }),
    
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Must be a valid email address'
    }),
    
  isAdmin: Joi.boolean().default(false),
  isSuperAdmin: Joi.boolean().default(false)
});

// Login validation
export const loginSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Name is required'
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// Device calibration validation
export const deviceCalibrationSchema = Joi.object({
  devEUI: Joi.string()
    .pattern(patterns.devEUI)
    .required(),
    
  temperatureOffset: Joi.number()
    .min(-10)
    .max(10)
    .precision(2)
    .default(0),
    
  humidityOffset: Joi.number()
    .min(-10)
    .max(10)
    .precision(2)
    .default(0),
    
  calibrationDate: Joi.date()
    .default(Date.now)
});

// AHC Status validation
export const ahcStatusSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),
    
  status: Joi.boolean()
    .required()
});

// Buzzer command validation
export const buzzerCommandSchema = Joi.object({
  deviceName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),
    
  devEUI: Joi.string()
    .pattern(patterns.devEUI)
    .required(),
    
  command: Joi.string()
    .valid('on', 'off', 'test')
    .required(),
    
  duration: Joi.number()
    .min(1)
    .max(3600)
    .when('command', {
      is: 'on',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
});

// Query parameter validation
export const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
    
  sortBy: Joi.string()
    .valid('timestamp', 'deviceName', 'temperature', 'humidity')
    .default('timestamp'),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
    
  startDate: Joi.date()
    .iso()
    .optional(),
    
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional(),
    
  deviceName: Joi.string()
    .trim()
    .optional(),
    
  devEUI: Joi.string()
    .pattern(patterns.devEUI)
    .optional()
});

// Organization validation
export const organizationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),
    
  Alert: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .default(''),
    
  settings: Joi.object({
    temperatureThresholds: Joi.object({
      min: Joi.number().min(-50).max(50).default(18),
      max: Joi.number().min(0).max(100).default(25)
    }),
    humidityThresholds: Joi.object({
      min: Joi.number().min(0).max(100).default(40),
      max: Joi.number().min(0).max(100).default(60)
    }),
    alertEnabled: Joi.boolean().default(true),
    dataRetentionDays: Joi.number().min(1).max(365).default(90)
  }).optional()
});

// Validation middleware factory
export function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details
      });
    }

    req[property] = value;
    next();
  };
}

// Async validation wrapper
export async function validateAsync(schema, data) {
  try {
    const value = await schema.validateAsync(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });
    return { value, error: null };
  } catch (error) {
    return { value: null, error };
  }
}

// Custom validation functions
export const customValidators = {
  isValidDevEUI: (devEUI) => patterns.devEUI.test(devEUI),
  isValidObjectId: (id) => patterns.objectId.test(id),
  isValidEmail: (email) => patterns.email.test(email),
  isValidPassword: (password) => patterns.password.test(password),
  
  // Temperature range validation
  isTemperatureInRange: (temp, min = 18, max = 25) => {
    return temp >= min && temp <= max;
  },
  
  // Humidity range validation
  isHumidityInRange: (humidity, min = 40, max = 60) => {
    return humidity >= min && humidity <= max;
  },
  
  // Check if device reading is within normal operational range
  isReadingNormal: (temperature, humidity) => {
    return customValidators.isTemperatureInRange(temperature) &&
           customValidators.isHumidityInRange(humidity);
  }
}; 