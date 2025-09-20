import db from '../../../utils/db';
import Entries from '../../../models/Entries';
import User from '../../../models/User';
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    await db.connect();

    // 1. Get all unique devEUIs from the Entries collection
    const devEUIs = await Entries.distinct('devEUI');

    // 2. Use an aggregation pipeline to find the last entry for each device
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
    ];

    const latestEntries = await Entries.aggregate(pipeline);

    // 3. Filter out devices that have been seen in the last two hours
    const twoHoursAgo = new Date(new Date().getTime() - (2 * 60 * 60 * 1000));
    const offlineDevices = latestEntries.filter(entry => {
      return new Date(entry.timestamp) < twoHoursAgo;
    });

    if (offlineDevices.length === 0) {
      await db.disconnect();
      return res.status(200).json({
        success: true,
        message: 'All devices are online.'
      });
    }

    // 4. Fetch all users with a whatsappNumber
    const usersToNotify = await User.find({ whatsappNumber: { $exists: true, $ne: null } });

    if (usersToNotify.length === 0) {
      await db.disconnect();
      return res.status(200).json({
        success: true,
        message: 'No users to notify.'
      });
    }
    
    // 5. Send WhatsApp notifications
    const offlineDeviceNames = offlineDevices.map(device => device.deviceName).join(', ');
    const messageBody = `The following devices are offline: ${offlineDeviceNames}`;

    for (const user of usersToNotify) {
      try {
        await client.messages.create({
          body: messageBody,
          from: `whatsapp:${twilioWhatsappNumber}`,
          to: `whatsapp:${user.whatsappNumber}`
        });
        console.log(`Notification sent to ${user.name}`);
      } catch (error) {
        console.error(`Failed to send notification to ${user.name}:`, error);
      }
    }

    await db.disconnect();

    res.status(200).json({
      success: true,
      offlineDevices,
      usersToNotify,
    });

  } catch (error) {
    console.error('Error in send-offline-notifications:', error);
    // Ensure db is disconnected even if there is an error
    await db.disconnect();
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
} 