import React, {  useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Layout from "../Layout/Layout"
import useAppStore from '../stores/useAppStore';
import db from '../utils/db';
import Typography from "@mui/material/Typography";
import Organisation from "../models/Organisation"
import { useRouter } from 'next/router';
import { useSnackbar } from "notistack";
import axios from "axios"
export default function AHCStatus({ organisation}) {
  const user = useAppStore((state) => state.user);
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [ac1Status, setAC1Status] = useState(false)
  const [ac2Status, setAC2Status] = useState(false)
  const [ac3Status, setAC3Status] = useState(false)
  const [ac4Status, setAC4Status] = useState(false)
  const [humidifier1Status, setHumidifier1Status] = useState(false)
  const [humidifier2Status, setHumidifier2Status] = useState(false)
  const [humidifier3Status, setHumidifier3Status] = useState(false)
  const [humidifier4Status, setHumidifier4Status] = useState(false)
  const [chillar1Status, setChillar1Status] = useState(false)
  const [chillar2Status, setChillar2Status] = useState(false)
  const [chillar3Status, setChillar3Status] = useState(false)
  const [chillar4Status, setChillar4Status] = useState(false)


  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
   async function run() {
    let {data} =await axios.get(`/api/getAHCStatus`);
    await setAC1Status(data.ac1)
    await setAC2Status(data.ac2)
    await setAC3Status(data.ac3)
    await setAC4Status(data.ac4)
    await setHumidifier1Status(data.humidifier1)
    await setHumidifier2Status(data.humidifier2)
    await setHumidifier3Status(data.humidifier3)
    await setHumidifier4Status(data.humidifier4)
    await setChillar1Status(data.chillar1)
    await setChillar2Status(data.chillar2)
    await setChillar3Status(data.chillar3)
    await setChillar4Status(data.chillar4)
   }
   run()
   

  // setAC1Status(organisation[0].AC1)
  // setAC2Status(organisation[0].AC2)
  // setAC3Status(organisation[0].AC3)
  // setAC4Status(organisation[0].AC4)

  // setHumidifier1Status(organisation[0].Humidifier1)
  // setHumidifier2Status(organisation[0].Humidifier2)
  // setHumidifier3Status(organisation[0].Humidifier3)
  // setHumidifier4Status(organisation[0].Humidifier4)

  // setChillar1Status(organisation[0].Chillar1)
  // setChillar2Status(organisation[0].Chillar2)
  // setChillar3Status(organisation[0].Chillar3)
  // setChillar4Status(organisation[0].Chillar4)
  }, [user, router]);



  async function OnOffDevice(status,setStatus,name) {
    if (status == true) {
      OffDevice(setStatus,name)
    }
    else {
      OnDevice(setStatus,name)
    }
  }



  async function OnDevice(setStatus,name) {
    closeSnackbar();
    try {
      setStatus(true)
      await axios.post(`/api/setAHCStatus`, {
        name: name,
        status: true,
      });
      enqueueSnackbar("Updated ", { variant: "success" });
    } catch (e) {
      console.log(e);
    }
  }

  async function OffDevice(setStatus,name) {
    closeSnackbar();
    try {
      setStatus(flase)
      await axios.post(`/api/setAHCStatus`, {
        name: name,
        status: false,
      });
      enqueueSnackbar("Updated ", { variant: "success" });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Layout>

      {/* AC */}
      <Grid container >
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            AC 1
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(ac1Status,setAC1Status,'AC1')}
                control={<Switch size="large" color="warning" checked={ac1Status === true ? true : false} />}
                label={ac1Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            AC 2
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(ac2Status,setAC2Status,'AC2')}
                control={<Switch size="large" color="warning" checked={ac2Status === true ? true : false} />}
                label={ac2Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            AC 3
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(ac3Status,setAC3Status,'AC3')}
                control={<Switch size="large" color="warning" checked={ac3Status === true ? true : false} />}
                label={ac3Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            AC 4
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(ac4Status,setAC4Status,'AC4')}
                control={<Switch size="large" color="warning" checked={ac4Status === true ? true : false} />}
                label={ac4Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
      </Grid>

      {/* Humidifier */}
      <Grid container >
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Humidifier 1
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(humidifier1Status,setHumidifier1Status,'Humidifier1')}
                control={<Switch size="large" color="warning" checked={humidifier1Status === true ? true : false} />}
                label={humidifier1Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Humidifier 2
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(humidifier2Status,setHumidifier2Status,'Humidifier2')}
                control={<Switch size="large" color="warning" checked={humidifier2Status === true ? true : false} />}
                label={humidifier2Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Humidifier 3
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(humidifier3Status,setHumidifier3Status,'Humidifier3')}
                control={<Switch size="large" color="warning" checked={humidifier3Status === true ? true : false} />}
                label={humidifier3Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Humidifier 4
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(humidifier4Status,setHumidifier4Status,'Humidifier4')}
                control={<Switch size="large" color="warning" checked={humidifier4Status === true ? true : false} />}
                label={humidifier4Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
      </Grid>


      {/* Chillar */}
      <Grid container >
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Chillar 1
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(chillar1Status,setChillar1Status,'Chillar1')}
                control={<Switch size="large" color="warning" checked={chillar1Status === true ? true : false} />}
                label={chillar1Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Chillar 2
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(chillar2Status,setChillar2Status,'Chillar2')}
                control={<Switch size="large" color="warning" checked={chillar2Status === true ? true : false} />}
                label={chillar2Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Chillar 3
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(chillar3Status,setChillar3Status,'Chillar3')}
                control={<Switch size="large" color="warning" checked={chillar3Status === true ? true : false} />}
                label={chillar3Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ mb: 3 }} variant="h5">
            Chillar 4
          </Typography>
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <FormGroup>
              <FormControlLabel
                onChange={() => OnOffDevice(chillar4Status,setChillar4Status,'Chillar4')}
                control={<Switch size="large" color="warning" checked={chillar4Status === true ? true : false} />}
                label={chillar4Status === true ? 'On' : 'Off'}
              />
            </FormGroup>
          </Box>
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const organisation = await Organisation.find({}).lean()
  await db.disconnect();
  return {
    props: {
      organisation: organisation.map(db.convertDocToObj),
    },
  };
}
