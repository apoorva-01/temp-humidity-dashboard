import Router from 'next-connect';
import DeviceCalibration from '../../../models/DeviceCalibration';
import db from '../../../utils/db';

const handler = Router();


handler.put(async (req, res) => {
  await db.connect();
  const findResult = await DeviceCalibration.find({ devEUI: req.body.devEUI })
  findResult[0].temperature_calibration = req.body.temperatureCalibration
  findResult[0].humidity_calibration = req.body.humidityCalibration
  await  findResult[0].save();
  await db.disconnect();
  res.send({ message: 'User Updated Successfully' });

});

export default handler;
