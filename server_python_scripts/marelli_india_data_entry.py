
import base64
import codecs
import pandas as pd
import time
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from chirpstack_api import integration
from google.protobuf.json_format import Parse
import json
import requests
import pymongo
myclient = pymongo.MongoClient("mongodb://igscs:IGSCS041173WelcomeChirpstack@localhost:27017")
mydb = myclient["next-marelli"]
entriesCollection = mydb["entries"]
buzzerEntriesCollection = mydb["buzzer-entries"]
deviceCalibrationCollection = mydb["device-calibration"]
organisationCollection = mydb["organisation"]
deviceAlarmStatusCollection = mydb["device-alarm-status"]

def runCommand(devEUI,command,jwt='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5X2lkIjoiZmJkMWM0NjktOGE4Yy00NmZiLTgyM2EtN2ZlZmVjMDJlYzk2IiwiYXVkIjoiYXMiLCJpc3MiOiJhcyIsIm5iZiI6MTY3ODQ0MDY5NCwic3ViIjoiYXBpX2tleSJ9.1JIq5A_TrP5zNm8GXz5ipTQROXc3Jp960BlvMxQmx-Y'):
    url = 'https://01.chirpstack.igscs.in/api/devices/'+devEUI+'/queue'
    headers = { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Grpc-Metadata-Authorization': 'Bearer '+ jwt
        }
    data={
    'deviceQueueItem': {'confirmed': True, 
                        'data':command, 
                        'devEUI':devEUI,  
                        'fCnt': 0,  
                        'fPort': 7}}
    r = requests.post(url, headers=headers, json=data)
    files = r.json()
    print(files)




def temperature_command_117a_function(HexDecoded,jsonResponse):
    calibration_object=list(deviceCalibrationCollection.find({'devEUI':base64.b64decode(jsonResponse["devEUI"]).hex()}))
    temp_calibration=calibration_object[0]['temperature_calibration']
    humidity_calibration=calibration_object[0]['humidity_calibration']

    deviceName=jsonResponse['deviceName']
    devEUI=base64.b64decode(jsonResponse["devEUI"]).hex()
    publishedTime=jsonResponse['publishedAt']
    temperature=(int(HexDecoded[14:18], 16)/100)+temp_calibration
    humidity=(int(HexDecoded[8:12], 16)/10)+humidity_calibration

    entriesCollection.insert_one(
    {
        'deviceName':deviceName,
        'devEUI':devEUI,
        'temperature':temperature,
        'humidity':humidity,
        'timestamp':datetime.datetime.utcnow()
    })
    device_alarm_status_object=list(deviceAlarmStatusCollection.find({}))
    deviceStatusDF = pd.DataFrame(device_alarm_status_object)
    io4_list = deviceStatusDF['io4_status'].tolist()
    io5_list = deviceStatusDF['io5_status'].tolist()

    buzzer_object=list(organisationCollection.find({}))
    buzzer_io4_status=buzzer_object[0]['FF01_I04_status']
    buzzer_io5_status=buzzer_object[0]['FF01_I05_status']
    # print('buzzer_io4_status',buzzer_io4_status)
    # print('buzzer_io5_status',buzzer_io5_status)

    
    if temperature<20 or temperature>26:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io4_status': 1 }})
        print('devEUI',devEUI,'io4_status On')

    if humidity<40 or humidity>60:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io5_status': 1 }})
        print('devEUI',devEUI,'io5_status On')

    if temperature>=20 and temperature<=26:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io4_status': 0 }})
        print('devEUI',devEUI,'io4_status Off')

    if humidity>=40 and humidity<=60:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io5_status': 0 }})
        print('devEUI',devEUI,'io5_status Off')
 



    print('IO4 List',io4_list) 
    print('IO5 List',io5_list) 


    if 1 in io4_list :
        if buzzer_io4_status==False:
            print('temperature Red Zone','Reading',temperature)
            runCommand('ff0006f201000001','+gcMRE00PTRJ')
            organisationCollection.update_one({},{"$set": { 'FF01_I04_status': True }})
        else:
            print('FF_01 IO_4 is Already On')

    if 1 in io5_list :
        if buzzer_io5_status==False:        
            print('Humidity Red Zone','Reading',humidity)
            runCommand('ff0006f201000001','+gcMRE01PTRK')
            organisationCollection.update_one({},{"$set": { 'FF01_I05_status': True }})
        else:
            print('FF_01 IO_5 is Already On')


    if 1 not in io4_list :
        if buzzer_io4_status==True:        
            runCommand('ff0006f201000001','+gcMRE00PTNI')
            organisationCollection.update_one({},{"$set": { 'FF01_I04_status': False }})
        else:
            print('FF_01 IO_4 is Already Off')

    if 1 not in io5_list :
        if buzzer_io5_status==True:        
            runCommand('ff0006f201000001','+gcMRE01PTNJ')     
            organisationCollection.update_one({},{"$set": { 'FF01_I05_status': False }})
        else:
            print('FF_01 IO_5 is Already Off')
    
def temperature_command_79fd_function(HexDecoded,jsonResponse):
    calibration_object=list(deviceCalibrationCollection.find({'devEUI':base64.b64decode(jsonResponse["devEUI"]).hex()}))
    temp_calibration=calibration_object[0]['temperature_calibration']
    humidity_calibration=calibration_object[0]['humidity_calibration']   

    deviceName=jsonResponse['deviceName']
    devEUI=base64.b64decode(jsonResponse["devEUI"]).hex()
    publishedTime=jsonResponse['publishedAt']
    temperature=(int(HexDecoded[14:18], 16)/10)+temp_calibration
    humidity=(int(HexDecoded[18:], 16)/10)+humidity_calibration
    entriesCollection.insert_one(
    {
        'deviceName':deviceName,
        'devEUI':devEUI,
        'temperature':temperature,
        'humidity':humidity,
        'timestamp':datetime.datetime.utcnow()
    })
    device_alarm_status_object=list(deviceAlarmStatusCollection.find({}))
    deviceStatusDF = pd.DataFrame(device_alarm_status_object)
    io4_list = deviceStatusDF['io4_status'].tolist()
    io5_list = deviceStatusDF['io5_status'].tolist()

    buzzer_object=list(organisationCollection.find({}))
    buzzer_io4_status=buzzer_object[0]['FF01_I04_status']
    buzzer_io5_status=buzzer_object[0]['FF01_I05_status']
    # print('buzzer_io4_status',buzzer_io4_status)
    # print('buzzer_io5_status',buzzer_io5_status)

    
    if temperature<20 or temperature>26:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io4_status': 1 }})
        print('devEUI',devEUI,'io4_status On')

    if humidity<40 or humidity>60:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io5_status': 1 }})
        print('devEUI',devEUI,'io5_status On')

    if temperature>=20 and temperature<=26:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io4_status': 0 }})
        print('devEUI',devEUI,'io4_status Off')

    if humidity>=40 and humidity<=60:
        deviceAlarmStatusCollection.update_one({'devEUI':devEUI},{"$set": { 'io5_status': 0 }})
        print('devEUI',devEUI,'io5_status Off')
 



    print('IO4 List',io4_list) 
    print('IO5 List',io5_list) 


    if 1 in io4_list :
        if buzzer_io4_status==False:
            print('temperature Red Zone','Reading',temperature)
            runCommand('ff0006f201000001','+gcMRE00PTRJ')
            organisationCollection.update_one({},{"$set": { 'FF01_I04_status': True }})
        else:
            print('FF_01 IO_4 is Already On')

    if 1 in io5_list :
        if buzzer_io5_status==False:        
            print('Humidity Red Zone','Reading',humidity)
            runCommand('ff0006f201000001','+gcMRE01PTRK')
            organisationCollection.update_one({},{"$set": { 'FF01_I05_status': True }})
        else:
            print('FF_01 IO_5 is Already On')


    if 1 not in io4_list :
        if buzzer_io4_status==True:        
            runCommand('ff0006f201000001','+gcMRE00PTNI')
            organisationCollection.update_one({},{"$set": { 'FF01_I04_status': False }})
        else:
            print('FF_01 IO_4 is Already Off')

    if 1 not in io5_list :
        if buzzer_io5_status==True:        
            runCommand('ff0006f201000001','+gcMRE01PTNJ')     
            organisationCollection.update_one({},{"$set": { 'FF01_I05_status': False }})
        else:
            print('FF_01 IO_5 is Already Off')
    


def buzzer_function(HexDecoded,jsonResponse):

    deviceName=jsonResponse['deviceName']
    devEUI=base64.b64decode(jsonResponse["devEUI"]).hex()
    buzzerEntriesCollection.insert_one(
    {
        'deviceName':deviceName,
        'devEUI':devEUI,
        'timestamp':datetime.datetime.utcnow()
    })



# Main 
class Handler(BaseHTTPRequestHandler):
    json = True

    def do_POST(self):
        self.send_response(200)
        self.end_headers()
        query_args = parse_qs(urlparse(self.path).query)
        content_len = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_len)
        if query_args["event"][0] == "up":
            jsonResponse = json.loads(body.decode('utf-8'))
            HexDecoded = base64.b64decode(jsonResponse["data"]).hex()
            temperature_token=HexDecoded[:2]
            if (temperature_token=='cb'):
                temperature_command_117a_function(HexDecoded,jsonResponse)    
            elif(temperature_token=='0d' or temperature_token=='0c'):
                temperature_command_79fd_function(HexDecoded,jsonResponse)    
            elif(temperature_token=='fa' ):
                buzzer_function(HexDecoded,jsonResponse)    
            else:
                print('Command is not supported')   
                print(temperature_token)   

        elif query_args["event"][0] == "join":
            print(body)
        elif query_args["event"][0] == "txack":
            print("txack")
        elif query_args["event"][0] == "ack":
            print("ack")
        else:
            print("handler for event %s is not implemented" % query_args["event"][0])

    def up(self, body):
        up = self.unmarshal(body, integration.UplinkEvent())

        print(up.data)
        print("Uplink received from: %s with payload: %s" % (up.dev_eui.hex(),up.data.hex()))

    def join(self, body):
        join = self.unmarshal(body, integration.JoinEvent())
        print("Device: %s joined with DevAddr: %s" % (join.dev_eui.hex(), join.dev_addr.hex()))

    def unmarshal(self, body, pl):
        if self.json:
            return Parse(body, pl)

        pl.ParseFromString(body)
        return pl
httpd = HTTPServer(('', 1704), Handler)
httpd.serve_forever()
