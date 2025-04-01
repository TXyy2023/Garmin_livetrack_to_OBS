import requests
import json
import time

def seconds_to_hms(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    remaining_seconds = seconds % 60
    return f"{hours:02}:{minutes:02}:{remaining_seconds:02}"


def get_garmin_data(test_index):

    timestamp = int(time.time())  # 获取当前秒级时间戳
    # print(timestamp)

    # url = f"https://livetrack.garmin.com.tw/services/session/9db2613d-3835-8956-94cd-e67122517e00/trackpoints?requestTime={timestamp}"
    # response = requests.get(url)

    # 确保响应内容是 JSON 格式
    # if response.status_code == 200:
    if True:
        try:
            # data = response.json()  # 解析 JSON 数据
            with open("dataset01.txt", 'r', encoding='utf-8') as file:
                data = json.load(file)
            # print(json.dumps(data, indent=4, ensure_ascii=False))  # 美化输出 JSON

            # print(json.dumps(data["trackPoints"][test_index], indent=4, ensure_ascii=False))
            target=data["trackPoints"][test_index]
            # speed=target["speed"]
            # altitude=target["altitude"]
            # position=target["position"]
            # activityType=target["activityType"]
            # eventTypes=target["eventTypes"]
            # pointStatus=target['pointStatus']
            # durationSecs=target['durationSecs']
            # distanceMeters=target["distanceMeters"]
            # heartRateBeatsPerMin=target['heartRateBeatsPerMin']
            # cadenceCyclesPerMin=target['cadenceCyclesPerMin']
            return target
        except json.JSONDecodeError:
            print("响应内容不是有效的 JSON")
    else:
        print(f"请求失败，状态码: {response.status_code}")

if __name__ == '__main__':
    print(get_garmin_data(1))