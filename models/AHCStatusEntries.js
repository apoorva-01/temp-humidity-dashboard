import mongoose from 'mongoose';

const entriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const AHCStatusEntries = mongoose.models.AHCStatusEntries || mongoose.model('AHCStatusEntries', entriesSchema,'ahc-status');
export default AHCStatusEntries;
