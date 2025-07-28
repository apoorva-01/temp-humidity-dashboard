import Router from 'next-connect';
import Entries from '../../../models/Entries';
import db from '../../../utils/db';

const handler = Router();

handler.post(async (req, res) => {
  await db.connect();
  const filteredEntries = await Entries.find({devEUI: req.body.deviceEUI}).sort({timestamp: -1})
  await db.disconnect();
  res.send(filteredEntries);
});

export default handler;
