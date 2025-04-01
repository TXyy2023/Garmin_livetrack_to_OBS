document.addEventListener("DOMContentLoaded", function () {
	// 确保 DOM 加载完成后再执行代码
	const socket = io.connect("http://127.0.0.1:4002");

	// 当接收到新数据时，更新界面
	socket.on("update_data", function (data) {
		document.getElementById("speed").textContent = data.speed;
		document.getElementById("heart_rate").textContent = data.heart_rate;
		document.getElementById("distance").textContent = data.distance;
		document.getElementById("During_time").textContent = data.During_time;
		document.getElementById("true_time").textContent = data.true_time;
		document.getElementById("position").textContent = data.lat + data.lon;
		document.getElementById("activityType").textContent = data.activityType;
		document.getElementById("pointStatus").textContent = data.pointStatus;
		document.getElementById("cadence").textContent = data.cadence;
	});
});
