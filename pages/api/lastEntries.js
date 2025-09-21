import Entries from '../../models/Entries';
import db from '../../utils/db';
import { getAllowedDeviceEUIs } from '../../utils/deviceConfig';

// Rate limiting
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per minute
const WINDOW_MS = 60000; // 1 minute

const rateLimit = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter(timestamp => timestamp > windowStart);
  
  if (requests.length >= RATE_LIMIT) {
    return false;
  }
  
  requests.push(now);
  requestCounts.set(ip, requests);
  return true;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  // Apply rate limiting
  if (!rateLimit(req)) {
    return res.status(429).json({ 
      success: false,
      error: 'Too many requests' 
    });
  }

  try {
    await db.connect();
    
    // Get allowed device EUIs from configuration
    const devEUIs = getAllowedDeviceEUIs();

    // Use aggregation pipeline for better performance
    const pipeline = [
      { $match: { devEUI: { $in: devEUIs } } },
      { $sort: { timestamp: -1 } },
      { 
        $group: { 
          _id: "$devEUI", 
          latest: { $first: "$$ROOT" } 
        } 
      },
      { $replaceRoot: { newRoot: "$latest" } },
      { $sort: { deviceName: 1 } }
    ];

    const results = await Entries.aggregate(pipeline);
    
    // Transform results to ensure consistent field names
    const transformedResults = results.map(entry => ({
      _id: entry._id,
      deviceName: entry.deviceName,
      devEUI: entry.devEUI,
      temperature: parseFloat(entry.temperature) || 0,
      humidity: parseFloat(entry.humidity) || 0,
      timestamp: entry.timestamp,
      rssi: entry.rssi,
      snr: entry.snr,
      batteryLevel: entry.batteryLevel,
      location: entry.location,
      isWithinNormalRange: entry.temperature >= 18 && entry.temperature <= 25 && 
                         entry.humidity >= 40 && entry.humidity <= 60
    }));

    await db.disconnect();

    // Cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    
    return res.status(200).json({
      success: true,
      data: transformedResults,
      count: transformedResults.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Error fetching latest entries:', err);
    
    // Ensure database disconnection
    try {
      await db.disconnect();
    } catch (disconnectError) {
      console.error('Database disconnect error:', disconnectError);
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Error fetching latest entries',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
    });
  }
}
