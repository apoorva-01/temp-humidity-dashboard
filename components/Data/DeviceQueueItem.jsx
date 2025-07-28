import React, {useEffect } from "react";
export default function DeviceQueueItem(props) {
    useEffect(() => {
            const requestOptions = {
              method: 'POST',
              headers: { 
                  'Grpc-Metadata-Authorization': 'Bearer'+' '+process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
              },
              body: JSON.stringify({
                      deviceQueueItem: { 
                        confirmed: true, 
                        data:`${props.commandInBas64}`, 
                        devEUI:`${props.devEUI}` ,  
                        fCnt: 0,  
                        fPort: 7
                      }  
              }),};
          fetch(`${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices/${props.devEUI}/queue`, requestOptions)
              .then(response => response.json())
              .then(data => console.log(data)).catch(function (error) {
                alert('Please Check your internet connection. Either their is no internet connection or the signals are weak');
              });
    }, [props.commandInBas64,props.devEUI])
    
    return (
        <>
       <p>EUI Number {props.devEUI} is given a command of {props.CommandName}</p>
        </>
        );}
    
