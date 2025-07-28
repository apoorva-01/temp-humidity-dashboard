import Router from 'next-connect';
import Organisation from '../../models/Organisation';
import db from '../../utils/db';

const handler = Router();


handler.post(async (req, res) => {

    await db.connect();
    const newEntry = new AHCStatusEntries({
      name: req.body.name,
      status: req.body.status
    });
    const entry = await newEntry.save();
    
    await db.disconnect();

  res.send({ message: 'User Updated Successfully' });

});

export default handler;
