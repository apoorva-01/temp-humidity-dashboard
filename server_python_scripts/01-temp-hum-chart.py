import os
from flask_cors import CORS, cross_origin
from flask import Flask, request, Response,jsonify
import pandas as pd
import moment
from datetime import datetime 
from bson import ObjectId
from gevent.pywsgi import WSGIServer
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
import pymongo
import time
import json
# Use an environment variable for the MongoDB connection string
mongodb_uri = os.environ.get("MONGODB_URI", "mongodb://igscs:IGSCS041173WelcomeChirpstack@localhost:27017")
myclient = pymongo.MongoClient(mongodb_uri)
mydb = myclient["next-marelli"]
entriesCollection = mydb["entries"]

zero_timestamp = time.time()
ist_timestamp = zero_timestamp + 5*60*60+30*60
offset = datetime.fromtimestamp(ist_timestamp) - datetime.utcfromtimestamp(zero_timestamp)

    
def Average(lst):
    return sum(lst) / len(lst)


def GetTempHourlyData(e):
    tempDF=pd.DataFrame(e)
    ret = []
    for hcounter in range(24):
        df_query=tempDF[(tempDF.time==hcounter)]
        hdata = df_query['temperature']
        if(len(df_query.index)==0):
          ret.append({
          "hour": hcounter, "min": None,
          "max": None, "avg": None})
          continue
        ret.append({
        "hour": hcounter, "min":"{:.2f}".format(min(hdata)),
        "max":"{:.2f}".format(max(hdata)), "avg":"{:.2f}".format(Average(hdata))
        })
    ret_df=pd.DataFrame(ret)
    minArray=ret_df['min'].to_numpy().tolist()
    maxArray=ret_df['max'].to_numpy().tolist()
    avgArray=ret_df['avg'].to_numpy().tolist()

    return {'minArray':minArray, 'maxArray':maxArray,'avgArray':avgArray}


def GetHumHourlyData(e):
    humDF=pd.DataFrame(e)
    ret = []
    for hcounter in range(24):
        df_query=humDF[(humDF.time==hcounter)]
        hdata = df_query['humidity']
        if(len(df_query.index)==0):
          ret.append({
          "hour": hcounter, "min": None,
          "max": None, "avg": None})
          continue
        ret.append({
        "hour": hcounter, "min":"{:.2f}".format(min(hdata)),
        "max":"{:.2f}".format(max(hdata)), "avg":"{:.2f}".format(Average(hdata))
        })
    ret_df=pd.DataFrame(ret)
    minArray=ret_df['min'].to_numpy().tolist()
    maxArray=ret_df['max'].to_numpy().tolist()
    avgArray=ret_df['avg'].to_numpy().tolist()
    return {'minArray':minArray, 'maxArray':maxArray,'avgArray':avgArray}


@app.route("/",methods=['POST'])
def hello_world():
    try:
        start_date = datetime.strptime(request.json['start_date'], '%Y-%m-%d')
        end_date = datetime.strptime(request.json['end_date'], '%Y-%m-%d')
        dev_eui = request.json['deviceEUI']

        # Adjust for UTC storage
        start_date_utc = start_date - offset
        end_date_utc = end_date - offset

        query = {
            'devEUI': dev_eui,
            'timestamp': {'$gte': start_date_utc, '$lte': end_date_utc}
        }
        
        entries_object = list(entriesCollection.find(query))

        if not entries_object:
            return jsonify({"tempData": [], "humData": []}), 200

        df = pd.DataFrame(entries_object)
        df['timestamp'] = pd.to_datetime(df['timestamp']) + offset
        df['hour'] = df['timestamp'].dt.hour
        
        temp_arr = df[['hour', 'temperature']].rename(columns={'hour': 'time'}).to_dict('records')
        hum_arr = df[['hour', 'humidity']].rename(columns={'hour': 'time'}).to_dict('records')

        hourly_temp_data = GetTempHourlyData(temp_arr)
        hourly_hum_data = GetHumHourlyData(hum_arr)

        return jsonify({"tempData": hourly_temp_data, "humData": hourly_hum_data}), 200
    except Exception as e:
        print(f"Error in / endpoint: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


@app.route("/all-devices-comparison",methods=['POST'])
def comparison():
    try:
        # Get device EUIs from request, fallback to default if not provided
        device_euis = request.json.get('device_euis', [
            'a84041b931837a0a', 'a840417eb1837a01', 'a8404181e18379fd',
            'a8404152a1837a0e', 'a8404151518379f9', 'a84041c2718379fe'
        ])

        start_date = datetime.strptime(request.json['start_date'], '%Y-%m-%d')
        end_date = datetime.strptime(request.json['end_date'], '%Y-%m-%d')

        start_date_utc = start_date - offset
        end_date_utc = end_date - offset

        query = {
            'devEUI': {'$in': device_euis},
            'timestamp': {'$gte': start_date_utc, '$lte': end_date_utc}
        }
        
        entries_object = list(entriesCollection.find(query))
        
        results = {}
        # Initialize results to ensure all devices are in the response
        for eui in device_euis:
            eui_suffix = eui[-4:]
            results[f"tempData{eui_suffix}"] = []
            results[f"humData{eui_suffix}"] = []

        if not entries_object:
            return jsonify(results), 200

        df = pd.DataFrame(entries_object)
        df['timestamp'] = pd.to_datetime(df['timestamp']) + offset
        df['hour'] = df['timestamp'].dt.hour
        
        grouped_by_device = df.groupby('devEUI')

        for eui in device_euis:
            eui_suffix = eui[-4:]
            if eui in grouped_by_device.groups:
                device_df = grouped_by_device.get_group(eui)
                
                temp_arr = device_df[['hour', 'temperature']].rename(columns={'hour': 'time'}).to_dict('records')
                hum_arr = device_df[['hour', 'humidity']].rename(columns={'hour': 'time'}).to_dict('records')

                results[f"tempData{eui_suffix}"] = GetTempHourlyData(temp_arr)
                results[f"humData{eui_suffix}"] = GetHumHourlyData(hum_arr)
        
        return jsonify(results), 200
    except Exception as e:
        print(f"Error in /all-devices-comparison endpoint: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


if __name__ == '__main__':
    http_server = WSGIServer(("0.0.0.0", 1240), app)
    http_server.serve_forever()


