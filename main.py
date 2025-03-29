from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import random
import time
from threading import Thread

app = Flask(__name__, static_folder='static')
socketio = SocketIO(app)


# 模拟生成随机数据
def generate_random_data():
    while True:
        print("get in")
        # 随机生成数据
        speed = random.randint(0, 100)
        heart_rate = random.randint(60, 180)
        distance = random.randint(0, 100)
        elapsed_time = f"{random.randint(0, 99)}:{random.randint(10, 59)}:{random.randint(10, 59)}"
        print(speed,heart_rate,distance,elapsed_time)
        # 将数据通过 WebSocket 推送到前端
        socketio.emit('update_data', {
            'speed': f"Speed: {speed} km/h",
            'heart_rate': f"Heart Rate: {heart_rate} bpm",
            'distance': f"Distance: {distance} km",
            'time': f"Time: {elapsed_time}"
        })
        
        # 每3秒更新一次
        time.sleep(3)

# 在连接时启动后台线程
@socketio.on('connect')
def handle_connect():
    thread = Thread(target=generate_random_data)
    thread.daemon = True
    thread.start()

@app.route('/')
def index():
    return render_template('overlay.html')

if __name__ == '__main__':
    socketio.run(app, debug=True,port=4002)