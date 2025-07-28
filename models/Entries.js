import mongoose from 'mongoose';

const entriesSchema = new mongoose.Schema(
  {
    deviceName: { type: String, required: true, trim: true, maxlength: 100 },
    devEUI: { 
      type: String, 
      required: true, 
      validate: {
        validator: function(v) {
          return /^[a-fA-F0-9]{16}$/.test(v);
        },
        message: 'devEUI must be a 16-character hexadecimal string'
      }
    },
    temperature: { 
      type: Number, 
      required: true,
      min: -50,
      max: 100,
      validate: {
        validator: function(v) {
          return !isNaN(v) && isFinite(v);
        },
        message: 'Temperature must be a valid number'
      }
    },
    humidity: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return !isNaN(v) && isFinite(v);
        },
        message: 'Humidity must be a valid number'
      }
    },
    timestamp: { type: Date, required: true, default: Date.now },
    rssi: { type: Number }, // Signal strength
    snr: { type: Number }, // Signal-to-noise ratio
    batteryLevel: { type: Number, min: 0, max: 100 }, // Battery percentage
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'entries'
  }
);

// Add indexes for better query performance
entriesSchema.index({ devEUI: 1, timestamp: -1 });
entriesSchema.index({ timestamp: -1 });
entriesSchema.index({ deviceName: 1 });

// Add virtual for temperature in Fahrenheit
entriesSchema.virtual('temperatureFahrenheit').get(function() {
  return (this.temperature * 9/5) + 32;
});

// Add method to check if readings are within normal range
entriesSchema.methods.isWithinNormalRange = function() {
  return this.temperature >= 18 && this.temperature <= 25 && 
         this.humidity >= 40 && this.humidity <= 60;
};

const Entries = mongoose.models.Entries || mongoose.model('Entries', entriesSchema);
export default Entries;
