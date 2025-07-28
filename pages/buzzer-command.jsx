import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import axios from "axios";
import useAppStore from "../stores/useAppStore";

export default function Payload() {
    const { user, isAuthenticated } = useAppStore();
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [tempBuzzerStatus, setTempBuzzerStatus] = useState(null);
    const [humBuzzerStatus, setHumBuzzerStatus] = useState(null);
    const mockMode = process.env.NEXT_PUBLIC_BUZZER_MOCK_MODE === 'true';

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (mockMode) {
            setTempBuzzerStatus(false);
            setHumBuzzerStatus(false);
            return;
        }

        async function fetch() {
            const { data } = await axios.get(`/api/getBuzzerStatus`);
            await setTempBuzzerStatus(data.FF01_I04_status);
            await setHumBuzzerStatus(data.FF01_I05_status);
        }
        fetch();
    }, [isAuthenticated, router, mockMode]);


    async function OnOffTempBuzzer() {
        if (mockMode) {
            const newStatus = !tempBuzzerStatus;
            setTempBuzzerStatus(newStatus);
            enqueueSnackbar(`Temperature alert is ${newStatus ? 'on' : 'off'}`, { variant: "success" });
            return;
        }
        if (tempBuzzerStatus == true) {
            OffBuzzerIO4()
        }
        else {
            OnBuzzerIO4()
        }
    }

    async function OnOffHumBuzzer() {
        if (mockMode) {
            const newStatus = !humBuzzerStatus;
            setHumBuzzerStatus(newStatus);
            enqueueSnackbar(`Humidity alert is ${newStatus ? 'on' : 'off'}`, { variant: "success" });
            return;
        }
        if (humBuzzerStatus == true) {
            OffBuzzerIO5()
        }
        else {
            OnBuzzerIO5()
        }
    }







    async function OnBuzzerIO4() {

        closeSnackbar();
        const requestOptions = {
            method: "POST",
            headers: {
                "Grpc-Metadata-Authorization":
                'Bearer'+' '+process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
            },
            body: JSON.stringify({
                deviceQueueItem: {
                    confirmed: true,
                    data: "+gcMRE00PTRJ",
                    devEUI: `ff0006f201000001`,
                    fCnt: 0,
                    fPort: 7,
                },
            }),
        };
        fetch(
            `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices/ff0006f201000001/queue`,
            requestOptions
        )
            .then((response) => response.json())
            .then((data) => {




                // console.log(data)
                // console.log('On I04 command To Chiprstack')
                if (data.fCnt) {
                    const downlinkTime = new Date()
                    async function run() {
                        try {
                            await axios.post(`/api/setTempBuzzerStatus`, {
                                buzzerStatus: true,
                            });
                            setTempBuzzerStatus(true)
                            enqueueSnackbar("Temperature Buzzer On ", { variant: "success" });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    run()

                    // async function uplinkRecords(time) {
                    //     const { entries } = await axios.post(`/api/last20Entries`, { time: time });
                    //     console.log(entries)
                    // }
                    // setTimeout(uplinkRecords(downlinkTime), 7000)


                }
                else {
                    enqueueSnackbar(data.error, { variant: "error" });
                }

            });





    }

    async function OffBuzzerIO4() {

        closeSnackbar();
        const requestOptions = {
            method: "POST",
            headers: {
                "Grpc-Metadata-Authorization":
                'Bearer'+' '+process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
            },
            body: JSON.stringify({
                deviceQueueItem: {
                    confirmed: true,
                    data: "+gcMRE00PTNI",
                    devEUI: `ff0006f201000001`,
                    fCnt: 0,
                    fPort: 7,
                },
            }),
        };
        fetch(
            `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices/ff0006f201000001/queue`,
            requestOptions
        )
            .then((response) => response.json())
            .then((data) => {
                // console.log(data)
                // console.log('Off I04 command To Chiprstack')
                if (data.fCnt) {
                    async function run() {
                        try {

                            await axios.post(`/api/setTempBuzzerStatus`, {
                                buzzerStatus: false,
                            });
                            setTempBuzzerStatus(false)
                            enqueueSnackbar("Temperature Buzzer Off ", { variant: "success" });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    run()
                }
                else {
                    enqueueSnackbar(data.error, { variant: "error" });
                }

            });






    }



    async function OnBuzzerIO5() {

        closeSnackbar();
        const requestOptions = {
            method: "POST",
            headers: {
                "Grpc-Metadata-Authorization":
                'Bearer'+' '+process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
            },
            body: JSON.stringify({
                deviceQueueItem: {
                    confirmed: true,
                    data: "+gcMRE01PTRK",
                    devEUI: `ff0006f201000001`,
                    fCnt: 0,
                    fPort: 7,
                },
            }),
        };
        fetch(
            `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices/ff0006f201000001/queue`,
            requestOptions
        )
            .then((response) => response.json())
            .then((data) => {
                // console.log(data)
                // console.log('On I05 command To Chiprstack')
                if (data.fCnt) {

                    async function run() {
                        try {
                            await axios.post(`/api/setHumBuzzerStatus`, {
                                buzzerStatus: true,
                            });
                            setHumBuzzerStatus(true)
                            enqueueSnackbar("Humidity Buzzer On ", { variant: "success" });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    run()




                }
                else {
                    enqueueSnackbar(data.error, { variant: "error" });
                }

            });










    }


    async function OffBuzzerIO5() {

        closeSnackbar();
        const requestOptions = {
            method: "POST",
            headers: {
                "Grpc-Metadata-Authorization":
                'Bearer'+' '+process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
            },
            body: JSON.stringify({
                deviceQueueItem: {
                    confirmed: true,
                    data: "+gcMRE01PTNJ",
                    devEUI: `ff0006f201000001`,
                    fCnt: 0,
                    fPort: 7,
                },
            }),
        };
        fetch(
            `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices/ff0006f201000001/queue`,
            requestOptions
        )
            .then((response) => response.json())
            .then((data) => {
                // console.log(data)
                // console.log('Off I05 command To Chiprstack')
                if (data.fCnt) {
                    async function run() {
                        try {
                            await axios.post(`/api/setHumBuzzerStatus`, {
                                buzzerStatus: false,
                            });
                            setHumBuzzerStatus(false)
                            enqueueSnackbar("Humidity Buzzer Off ", { variant: "success" });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    run()
                }
                else {
                    enqueueSnackbar(data.error, { variant: "error" });
                }

            });


    }


    // console.log('IO4' + ' ' + tempBuzzerStatus)
    // console.log('IO5' + ' ' + humBuzzerStatus)

    return (
        <Layout>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography sx={{ mb: 3 }} variant="h5">
                        Temperature Buzzer
                    </Typography>
                    <Box sx={{ "& > :not(style)": { m: 1 } }}>
                        <FormGroup>

                            <FormControlLabel
                                onChange={() => OnOffTempBuzzer()}
                                control={<Switch size="large" color="warning" checked={tempBuzzerStatus === true ? true : false} />}
                                label={tempBuzzerStatus === true ? 'On' : 'Off'}
                            />

                        </FormGroup>
                    </Box>
                </Grid>



                <Grid item xs={12}>
                    <Typography sx={{ mb: 3 }} variant="h5">
                        Humidity Buzzer
                    </Typography>
                    <Box sx={{ "& > :not(style)": { m: 1 } }}>
                        <FormGroup>

                            <FormControlLabel
                                onChange={() => OnOffHumBuzzer()}
                                control={<Switch size="large" color="warning" checked={humBuzzerStatus === true ? true : false} />}
                                label={humBuzzerStatus === true ? 'On' : 'Off'}
                            />

                        </FormGroup>
                    </Box>
                </Grid>
            </Grid>
        </Layout>
    );
}
