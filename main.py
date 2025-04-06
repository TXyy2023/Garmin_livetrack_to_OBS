from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import random
import time
import json
from datetime import datetime,timedelta
from threading import Thread
from Garmin_con import get_garmin_data,seconds_to_hms
app = Flask(__name__, static_folder='static')
socketio = SocketIO(app)


# 模拟生成随机数据
def generate_random_data():
    counter=0
    while True:

        # print("get in")
        # 随机生成数据
        # speed = random.randint(0, 100)
        # heart_rate = random.randint(60, 180)
        # distance = random.randint(0, 100)
        # elapsed_time = f"{random.randint(0, 99)}:{random.randint(10, 59)}:{random.randint(10, 59)}
        # print(speed,heart_rate,distance,elapsed_time)
        print(counter)
        data=get_garmin_data(counter)
        speed=data["speed"]
        speed=round(speed*3.6,2)
        heart_rate=data["fitnessPointData"]['heartRateBeatsPerMin']
        distance=data['fitnessPointData']['totalDistanceMeters']
        During_time=data['fitnessPointData']['totalDurationSecs']
        During_time=seconds_to_hms(During_time)
        lat=data['position']['lat']
        lon=data['position']['lon']
        true_time=data['dateTime']
        dt_object = datetime.strptime(true_time, "%Y-%m-%dT%H:%M:%S.%fZ")
        true_time = dt_object + timedelta(hours=8)
        altitude=data["altitude"]
        activityType=data['fitnessPointData']['activityType']
        pointStatus=data['fitnessPointData']['pointStatus']
        # cadence=data['fitnessPointData']['cadenceCyclesPerMin']
        cadence=-1
        # 将数据通过 WebSocket 推送到前端
        socketio.emit('update_data', {
            'speed': str(speed),
            'heart_rate': str(heart_rate),  
            'distance': str(distance),
            'During_time': str(During_time),
            'lat': str(lat),
            'lon': str(lon),
            'true_time': str(true_time),
            'activityType':str(activityType),
            'pointStatus': str(pointStatus),
            'cadence': str(cadence),     
            'altitude':str(altitude)       
        })

        counter+=1
        time.sleep(0.5)

# 在连接时启动后台线程
@socketio.on('connect')
def handle_connect():
    thread = Thread(target=generate_random_data)
    thread.daemon = True
    thread.start()

@app.route('/')
def index():
    return render_template('overlay.html')


@app.route('/test')
def test_page():
    return render_template('test.html')


if __name__ == '__main__':
    socketio.run(app, debug=True,port=4002)