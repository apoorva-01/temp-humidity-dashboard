import Router from 'next-connect';
import AHCStatusEntries from '../../models/AHCStatusEntries';
import db from '../../utils/db';

const handler = Router();


handler.get(async (req, res) => {

    await db.connect();
    const ac1 = await AHCStatusEntries.find({name: 'AC1'}).sort({timestamp:-1}).limit(1);
    const ac2 = await AHCStatusEntries.find({name: 'AC2'}).sort({timestamp:-1}).limit(1);
    const ac3 = await AHCStatusEntries.find({name: 'AC3'}).sort({timestamp:-1}).limit(1);
    const ac4 = await AHCStatusEntries.find({name: 'AC4'}).sort({timestamp:-1}).limit(1);
    const humidifier1 = await AHCStatusEntries.find({name: 'Humidifier1'}).sort({timestamp:-1}).limit(1);
    const humidifier2 = await AHCStatusEntries.find({name: 'Humidifier2'}).sort({timestamp:-1}).limit(1);
    const humidifier3 = await AHCStatusEntries.find({name: 'Humidifier3'}).sort({timestamp:-1}).limit(1);
    const humidifier4 = await AHCStatusEntries.find({name: 'Humidifier4'}).sort({timestamp:-1}).limit(1);
    const chillar1 = await AHCStatusEntries.find({name: 'Chillar1'}).sort({timestamp:-1}).limit(1);
    const chillar2 = await AHCStatusEntries.find({name: 'Chillar2'}).sort({timestamp:-1}).limit(1);
    const chillar3 = await AHCStatusEntries.find({name: 'Chillar3'}).sort({timestamp:-1}).limit(1);
    const chillar4 = await AHCStatusEntries.find({name: 'Chillar4'}).sort({timestamp:-1}).limit(1);
    await db.disconnect();

  res.send({ac1:ac1[0].status,ac2:ac2[0].status,ac3:ac3[0].status,ac4:ac4[0].status,humidifier1:humidifier1[0].status,humidifier2:humidifier2[0].status,humidifier3:humidifier3[0].status,humidifier4:humidifier4[0].status,chillar1:chillar1[0].status,chillar2:chillar2[0].status,chillar3:chillar3[0].status,chillar4:chillar4[0].status});

});

export default handler;
