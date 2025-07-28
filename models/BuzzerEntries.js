import mongoose from 'mongoose';

const entriesSchema = new mongoose.Schema(
  {
    deviceName: { type: String, required: true },
    devEUI: { type: String, required: true },
    timestamp: { type: Date, required: true },
  }
);

const BuzzerEntries = mongoose.models.Entries || mongoose.model('BuzzerEntries', entriesSchema,'buzzer-entries');
export default BuzzerEntries;
