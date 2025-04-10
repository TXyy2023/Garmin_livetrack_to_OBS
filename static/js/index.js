const geo_in_data_test = {
	type: "Feature",
	properties: {},
	geometry: {
		type: "LineString",
		coordinates: [],
	},
};
const point_pos = {
	type: "FeatureCollection",
	features: [
		{
			type: "Feature",
			properties: {},
			geometry: {
				type: "Point",
				coordinates: [116.141190771014, 40.2499238401651],
			},
		},
	],
};
let dataPoints = [];
var chart;
const data_length = 100;

var gauge1;
var gauge2;
var isMapOn = false;

function geo_add_data(lon, lat) {
	// 将新的坐标添加到 geo_in_data.features[0].geometry.coordinates
	geo_in_data_test.geometry.coordinates.push([lon, lat]);
	if (geo_in_data_test.geometry.coordinates.length >= 2) {
		if (isMapOn == false) {
			isMapOn = true;
			init_map();
		}

		var lastTwo_altitude = dataPoints.slice(-2);
		var lastTwo_lon_lat = geo_in_data_test.geometry.coordinates.slice(-2);
		// console.log(lastTwo_altitude);
		var result = calculateSlope(
			lastTwo_lon_lat[0][1],
			lastTwo_lon_lat[0][0],
			lastTwo_altitude[0],
			lastTwo_lon_lat[1][1],
			lastTwo_lon_lat[1][0],
			lastTwo_altitude[1]
		);
		console.log(result);
	}
	// console.log(geo_in_data_test.geometry.coordinates);
	return geo_in_data_test; // 返回更新后的 geo_in_data
}

document.addEventListener("DOMContentLoaded", function () {
	init_line_gauge();
	init_gauge();
	init_time();
	//   示例：动态更新数值
	// setInterval(() => {
	// 	currentValue = Math.floor(Math.random() * 201); // 随机值
	// 	gauge.set(currentValue);
	// 	document.getElementById("heartrate_gauge-value").innerText = currentValue;
	// }, 2000);

	// 确保 DOM 加载完成后再执行代码
	const socket = io.connect("http://127.0.0.1:4002");
	// 当接收到新数据时，更新界面
	socket.on("update_data", function (data) {
		document.getElementById("speed").textContent = `Speed: ${data.speed} km/h`;
		document.getElementById("heart_rate").textContent = `heart_rate: ${data.heart_rate} bpm`;
		document.getElementById("distance").textContent = `运动距离: ${(data.distance / 1000).toFixed(
			2
		)} km`;
		document.getElementById("During_time").textContent = `运动时间: ${data.During_time}`;
		document.getElementById("altitude").textContent = `海拔: ${data.altitude}`;
		// document.getElementById("true_time").textContent = `${data.true_time}`;
		// document.getElementById("position").textContent = `position: ${data.lat + data.lon}`;
		document.getElementById("position").textContent = `lat:${data.lat} lon:${data.lon}`;
		document.getElementById("activityType").textContent = `activityType: ${data.activityType}`;
		// document.getElementById("pointStatus").textContent = `pointStatus: ${data.pointStatus}`;
		// document.getElementById("cadence").textContent = `cadence: ${data.cadence}`;
		// console.log(data);

		gauge1.set(parseFloat(data.speed));
		document.getElementById("speed_gauge-value").innerText = `速度: ${data.speed} km/h`;
		gauge2.set(parseInt(data.heart_rate));
		document.getElementById("heartrate_gauge-value").innerText = `心率: ${data.heart_rate} bpm`;

		dataPoints.push(parseFloat(data.altitude));
		if (dataPoints.length >= data_length) {
			// timeLabels.shift();
			dataPoints.shift();
		}
		chart.data.datasets[0].data = dataPoints;
		chart.update(); // 刷新图表

		geo_add_data(parseFloat(data.lon), parseFloat(data.lat));
	});
});

function init_map() {
	mapboxgl.accessToken =
		"pk.eyJ1IjoiYmJuZHNrb3dlIiwiYSI6ImNtOHhzc2xwdTA5MzAyanIzOHQwdmY4Z3gifQ.PCVJZBjlDOnQIvsADOaVaQ";

	const map = new mapboxgl.Map({
		container: "map",
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: "mapbox://styles/mapbox/dark-v11",
		// center: [116.141190771014, 40.2499238401651],
		center: geo_in_data_test.geometry.coordinates[0],
		zoom: 14,
		attributionControl: false,

		// 下面这些是交互设置（如果你要确保能缩放平移，可以这样写）
		dragPan: true, // 允许拖动地图平移
		scrollZoom: true, // 允许滚轮缩放
		doubleClickZoom: true, // 双击缩放
		touchZoomRotate: true, // 触摸屏缩放旋转
		keyboard: true, // 键盘控制（上下左右、+-缩放）
	});

	map.on("load", () => {
		map.addSource("route", {
			type: "geojson",
			data: geo_in_data_test,
		});
		map.addSource("point", {
			type: "geojson",
			data: point_pos,
		});
		map.addLayer({
			id: "point",
			source: "point",
			type: "symbol",
			layout: {
				// This icon is a part of the Mapbox Streets style.
				// To view all images available in a Mapbox style, open
				// the style in Mapbox Studio and click the "Images" tab.
				// To add a new image to the style at runtime see
				// https://docs.mapbox.com/mapbox-gl-js/example/add-image/
				"icon-image": "airport",
				"icon-size": 1.5,
				"icon-rotate": ["get", "bearing"],
				"icon-rotation-alignment": "map",
				"icon-allow-overlap": true,
				"icon-ignore-placement": true,
			},
		});
		map.addLayer({
			id: "route",
			type: "line",
			source: "route",
			layout: {
				"line-join": "round",
				"line-cap": "round",
			},
			paint: {
				"line-color": "#888",
				"line-width": 8,
			},
		});

		// setInterval(async () => {
		// 	map.getSource("route").setData(geo_in_data_test);
		// 	console.log("get in ");
		// 	requestAnimationFrame(animate);
		// }, 1000);
		function animate() {
			map.getSource("route").setData(geo_in_data_test);
			// map.flyTo({
			// 	center: geo_in_data_test.geometry.coordinates.at(-1),
			// 	essential: true,
			// });
			map.panTo(geo_in_data_test.geometry.coordinates.at(-1));
			const last_point = geo_in_data_test.geometry.coordinates.at(-2);
			const now_point = geo_in_data_test.geometry.coordinates.at(-1);

			point_pos.features[0].geometry.coordinates = now_point;
			point_pos.features[0].properties.bearing = turf.bearing(
				turf.point(last_point),
				turf.point(now_point)
			);
			map.getSource("point").setData(point_pos);
			// console.log("get in ");
			requestAnimationFrame(animate);
		}
		animate();
		// map.getSource("route").setData(geo_in_data_test);
	});
}

function init_gauge() {
	var opts = {
		angle: 0, // 0 = 完整圆
		lineWidth: 0.2,
		radiusScale: 1,
		pointer: {
			length: 0.6,
			strokeWidth: 0.04,
			color: "#000000",
		},
		limitMax: false,
		limitMin: false,
		colorStart: "#20538C",
		colorStop: "#20538C",
		strokeColor: "#E0E0E0",
		generateGradient: true,
		highDpiSupport: true,

		// 添加 staticLabels
		staticLabels: {
			font: "12px sans-serif", // 刻度字体
			labels: [0, 10, 20, 30, 40, 50, 60], // 需要显示的刻度值
			color: "#000", // 刻度字体颜色
			fractionDigits: 0, // 小数位数
		},
		renderTicks: {
			divisions: 6,
			divWidth: 1.1,
			divLength: 0.7,
			divColor: "#333333",
			subDivisions: 10,
			subLength: 0.5,
			subWidth: 0.6,
			subColor: "#666666",
		},
		// 不需要 staticZones
		// staticZones: []
	};

	var target = document.getElementById("speed_gauge");
	gauge1 = new Gauge(target).setOptions(opts);

	gauge1.maxValue = 60;
	gauge1.setMinValue(0);
	gauge1.animationSpeed = 32;

	// 初始设置
	var currentValue = 5;
	gauge1.set(currentValue);

	// 同步显示上方的数值
	document.getElementById("speed_gauge-value").innerText = currentValue;

	var opts = {
		angle: -0.25, // 0 = 完整圆
		lineWidth: 0.2,
		radiusScale: 1,
		pointer: {
			length: 0.6,
			strokeWidth: 0.04,
			color: "#000000",
		},
		limitMax: false,
		limitMin: false,
		colorStart: "#20538C",
		colorStop: "#20538C",
		strokeColor: "#E0E0E0",
		generateGradient: true,
		highDpiSupport: true,

		// 添加 staticLabels
		staticLabels: {
			font: "12px sans-serif", // 刻度字体
			labels: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200], // 需要显示的刻度值
			color: "#000", // 刻度字体颜色
			fractionDigits: 0, // 小数位数
		},
		renderTicks: {
			divisions: 10,
			divWidth: 1.1,
			divLength: 0.7,
			divColor: "#333333",
			subDivisions: 5,
			subLength: 0.5,
			subWidth: 0.6,
			subColor: "#666666",
		},
		// 不需要 staticZones
		// staticZones: []
	};

	var target = document.getElementById("heartrate_gauge");
	gauge2 = new Gauge(target).setOptions(opts);

	gauge2.maxValue = 200;
	gauge2.setMinValue(0);
	gauge2.animationSpeed = 32;

	// 初始设置
	var currentValue = 5;
	gauge2.set(currentValue);

	// 同步显示上方的数值
	document.getElementById("heartrate_gauge-value").innerText = currentValue;
}

function init_line_gauge() {
	// 模拟的数据
	let timeLabels = Array.from({ length: data_length + 1 }, (_, index) => index);
	// 初始化图表
	const ctx = document.getElementById("myChart").getContext("2d");
	chart = new Chart(ctx, {
		type: "line",
		data: {
			labels: timeLabels,
			datasets: [
				{
					label: "实时数据",
					data: dataPoints,
					borderColor: "rgba(75, 192, 192, 1)",
					fill: false,
					cubicInterpolationMode: "monotone",
					tension: 0.1,
					pointRadius: 0, // 去掉数据点的小圆圈
				},
			],
		},
		options: {
			responsive: true,
			animation: {
				// 	duration: 0, // 禁用动画
				duration: 1000, // 动画持续时间（毫秒）
				easing: "easeOutQuart", // 动画缓动函数（变化曲线）
				delay: 0, // 动画开始前的延迟时间（毫秒）
				loop: false, // 是否循环播放动画
			},

			plugins: {
				legend: {
					display: false, // 隐藏图例
				},
			},
			scales: {
				x: {
					type: "linear",
					position: "bottom",
					grid: {
						display: false, // 隐藏 x 轴网格线
					},
					ticks: {
						display: false, // 隐藏 x 轴刻度
					},
				},
				y: {
					grid: {
						//   display: false // 隐藏 y 轴网格线
					},
					ticks: {
						//   display: false // 隐藏 y 轴刻度
					},
				},
			},
			elements: {
				line: {
					tension: 0.4, // 设置曲线平滑度
				},
			},
		},
	});

	// 模拟每秒钟接收新的数据
	let time = 0;
	// setInterval(() => {
	// 	// 模拟的实时数据（这里使用正弦函数作为示例）
	// 	//   const newData = Math.sin(time * 0.1) * 10 + 50;
	// 	const newData = Math.floor(Math.random() * 101); // 随机值
	// 	// 更新数据点

	// 	dataPoints.push(newData);
	// 	//   timeLabels.push(time);
	// 	// 限制最多显示20个数据点，超出则删除最老的数据
	// 	if (dataPoints.length >= data_length) {
	// 		// timeLabels.shift();
	// 		dataPoints.shift();
	// 	}

	// 	//   console.log(dataPoints.length)
	// 	console.log(dataPoints);

	// 	// 更新图表数据
	// 	//   chart.data.labels = timeLabels;
	// 	chart.data.datasets[0].data = dataPoints;
	// 	chart.update(); // 刷新图表

	// 	time++; // 时间递增
	// }, 200); // 每秒更新一次数据
}

function init_time() {
	function updateClock() {
		const now = new Date();
		const h = String(now.getHours()).padStart(2, "0");
		const m = String(now.getMinutes()).padStart(2, "0");
		const s = String(now.getSeconds()).padStart(2, "0");
		document.getElementById("true_time").innerText = `${h}:${m}:${s}`;
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份从0开始，要+1
		const day = String(now.getDate()).padStart(2, "0");
		document.getElementById("date").innerText = `${year}年${month}月${day}日`;
	}

	setInterval(updateClock, 1000);
	updateClock(); // 初始运行一次
}
function toRadians(degrees) {
	return (degrees * Math.PI) / 180;
}

function calculateSlope(lat1, lon1, ele1, lat2, lon2, ele2) {
	const R = 6371000; // 地球半径（米）

	const φ1 = toRadians(lat1);
	const φ2 = toRadians(lat2);
	const Δφ = toRadians(lat2 - lat1);
	const Δλ = toRadians(lon2 - lon1);

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const horizontalDistance = R * c;

	const elevationChange = ele2 - ele1;

	const slopePercent = (elevationChange / horizontalDistance) * 100;
	const slopeAngle = Math.atan2(elevationChange, horizontalDistance) * (180 / Math.PI);

	return {
		horizontalDistance: horizontalDistance.toFixed(2),
		elevationChange: elevationChange.toFixed(2),
		slopePercent: slopePercent.toFixed(2),
		slopeAngle: slopeAngle.toFixed(2),
	};
}

function calculate() {
	const lat1 = parseFloat(document.getElementById("lat1").value);
	const lon1 = parseFloat(document.getElementById("lon1").value);
	const ele1 = parseFloat(document.getElementById("ele1").value);

	const lat2 = parseFloat(document.getElementById("lat2").value);
	const lon2 = parseFloat(document.getElementById("lon2").value);
	const ele2 = parseFloat(document.getElementById("ele2").value);

	if (isNaN(lat1) || isNaN(lon1) || isNaN(ele1) || isNaN(lat2) || isNaN(lon2) || isNaN(ele2)) {
		document.getElementById("result").innerHTML =
			"<span style='color: red;'>请输入所有字段！</span>";
		return;
	}

	const result = calculateSlope(lat1, lon1, ele1, lat2, lon2, ele2);

	document.getElementById("result").innerHTML = `
        <h3>计算结果：</h3>
        <p><strong>水平距离：</strong> ${result.horizontalDistance} 米</p>
        <p><strong>高程变化：</strong> ${result.elevationChange} 米</p>
        <p><strong>坡度百分比：</strong> ${result.slopePercent} %</p>
        <p><strong>坡度角度：</strong> ${result.slopeAngle} °</p>
    `;
}
