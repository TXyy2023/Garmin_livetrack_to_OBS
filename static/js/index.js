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
		// console.log(result["slopeAngle"]);
		document.getElementById("slope").textContent = `坡度: ${result["slopeAngle"]}`;
	}
	// console.log(geo_in_data_test.geometry.coordinates);
	return geo_in_data_test; // 返回更新后的 geo_in_data
}

document.addEventListener("DOMContentLoaded", function () {
	init_line_gauge();
	init_gauge();
	init_time();
	// init_map();
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
		const shape1 = document.querySelector(".shape1");
		shape1.style.setProperty("--percent", parseInt((parseFloat(data.speed) / 60) * 100) + "%");
		const shape2 = document.querySelector(".shape2");
		shape2.style.setProperty("--percent", parseInt((parseInt(data.heart_rate) / 200) * 100) + "%");
	});
});

function init_map() {
	mapboxgl.accessToken =
		"pk.eyJ1IjoiYmJuZHNrb3dlIiwiYSI6ImNtOHhzc2xwdTA5MzAyanIzOHQwdmY4Z3gifQ.PCVJZBjlDOnQIvsADOaVaQ";

	const map = new mapboxgl.Map({
		container: "map",
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: "mapbox://styles/mapbox/dark-v11",
		center: [116.141190771014, 40.2499238401651],
		// center: geo_in_data_test.geometry.coordinates[0],
		zoom: 14,
		attributionControl: false,

		// 下面这些是交互设置（如果你要确保能缩放平移，可以这样写）
		// dragPan: true, // 允许拖动地图平移
		// scrollZoom: true, // 允许滚轮缩放
		// doubleClickZoom: true, // 双击缩放
		// touchZoomRotate: true, // 触摸屏缩放旋转
		// keyboard: true, // 键盘控制（上下左右、+-缩放）
	});

	fetch("/static/GPX/01.gpx")
		.then((response) => response.text())
		.then((gpxText) => {
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(gpxText, "application/xml");

			// 转换为 GeoJSON
			const geojson = toGeoJSON.gpx(xmlDoc);
			console.log("转换后的 GeoJSON:", geojson);

			// 添加轨迹到地图
			map.addSource("gpxRoute", {
				type: "geojson",
				data: geojson,
			});

			map.addLayer({
				id: "routeLine",
				type: "line",
				source: "gpxRoute",
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "#ff0000",
					"line-width": 4,
				},
			});

			// 调整视图，使地图适应轨迹范围
			const bounds = new mapboxgl.LngLatBounds();
			geojson.features.forEach((feature) => {
				feature.geometry.coordinates.forEach((coord) => {
					bounds.extend(coord);
				});
			});

			if (!bounds.isEmpty()) {
				map.fitBounds(bounds, { padding: 20 });
			}
		})
		.catch((error) => {
			console.error("加载 GPX 文件失败:", error);
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
		var is_showing = false;
		function animate() {
			map.getSource("route").setData(geo_in_data_test);
			// console.log(map.getPitch());
			// map.flyTo({
			// 	center: geo_in_data_test.geometry.coordinates.at(-1),
			// 	essential: true,
			// });
			if (is_showing == false) {
				map.panTo(geo_in_data_test.geometry.coordinates.at(-1), { duration: 1 * 1000 });
			}

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

		// const observer = new ResizeObserver(() => {
		// 	map.resize();
		// });
		// observer.observe(document.getElementById("map"));

		setInterval(() => {
			var rotate_center;
			animateMapbox();
			is_showing = true;
			const bbox = turf.bbox(geo_in_data_test); // [minX, minY, maxX, maxY]
			// console.log(bbox);
			map.fitBounds(
				[
					[bbox[0], bbox[1]],
					[bbox[2], bbox[3]],
				],
				{
					padding: 40,
					// maxZoom: 15,
					duration: 1000,
				}
			);
			rotate_center = map.getCenter();
			// setTimeout(rotate_show, 2000);
			setTimeout(function () {
				map.easeTo({
					// bearing: map.getBearing() + 30, // 旋转角度（45度）
					// zoom: 5,
					center: rotate_center,
					pitch: 60,
					duration: 1000,
				});

				setTimeout(runWhileForSeconds, 1050);
				// runWhileFor2Seconds();
			}, 1050);
			// map.easeTo({
			// 	zoom: 14, // 新的缩放级别
			// 	bearing: map.getBearing() + 1, // 旋转角度（45度）
			// 	pitch: 60, // 倾斜角度（60度）
			// 	duration: 50, // 动画持续时间（3000毫秒）
			// });
		}, 10 * 1000);
		const rotate_time = 4000;
		function runWhileForSeconds() {
			let startTime = Date.now();
			let elapsedTime = 0;

			function loop() {
				// 计算经过的时间
				elapsedTime = Date.now() - startTime;

				if (elapsedTime < rotate_time) {
					// console.log("Running...");
					rotateCamera(elapsedTime);
					setTimeout(loop, 2);
					// loop();
				} else {
					// console.log("Finished!");
					map.easeTo({
						center: geo_in_data_test.geometry.coordinates.at(-1),
						bearing: 0,
						pitch: 0,
						zoom: 14,
						duration: 1500,
					});
					setTimeout(function () {
						is_showing = false;
					}, 1550);
				}
			}

			loop();
		}
		function rotateCamera(elapsedTime) {
			map.easeTo({
				// center: geo_in_data_test.geometry.coordinates.at(-1),
				// center: rotate_center,
				bearing: (elapsedTime / rotate_time) * 360 * 1,
				pitch: 60,
				duration: 2,
			});
			// Request the next frame of the animation.
			// requestAnimationFrame(rotateCamera);
		}
		function animateMapbox() {
			const mapbox = document.getElementById("map");
			mapbox.style.transition = "all 1s ease-in-out";
			mapbox.style.width = "25vw";
			mapbox.style.height = "25vw";

			const altitude_datas = document.getElementById("altitude_datas");
			altitude_datas.style.transform = "translateY(-8vw)";
			// 动画期间不停调用 map.resize()
			const resizeInterval = setInterval(() => {
				map.resize();
			}, 30); // 每30ms刷新一次

			setTimeout(() => {
				clearInterval(resizeInterval); // 1秒后停止刷新

				// 准备缩回
				mapbox.style.width = "18vw";
				mapbox.style.height = "18vw";
				altitude_datas.style.transform = "translateY(0)";
				const shrinkInterval = setInterval(() => {
					map.resize();
				}, 30);

				setTimeout(() => {
					clearInterval(shrinkInterval);
				}, 1000);
			}, 5100);
		}
		// map.getSource("route").setData(geo_in_data_test);
	});
}

function init_gauge() {
	var opts = {
		angle: 0.1, // 0 = 完整圆
		lineWidth: 0.2,
		radiusScale: 0.9,
		pointer: {
			length: 0.6,
			strokeWidth: 0.06,
			color: "#000000",
		},
		limitMax: true,
		limitMin: false,
		colorStart: "#ec7063 ",
		colorStop: "#f1c40f ",
		strokeColor: "#E0E0E0",
		generateGradient: true,
		highDpiSupport: true,

		// 添加 staticLabels
		staticLabels: {
			font: "1vw sans-serif", // 刻度字体
			labels: [0, 10, 20, 30, 40, 50, 60], // 需要显示的刻度值
			color: "#000", // 刻度字体颜色
			fractionDigits: 0, // 小数位数
		},
		renderTicks: {
			divisions: 6,
			divWidth: 1.8,
			divLength: 1.0,
			divColor: "#333333",
			subDivisions: 10,
			subLength: 0.5,
			subWidth: 0.6,
			subColor: "#666666",
		},
		// staticZones: [
		// 	{strokeStyle: "#00C853", min: 0, max: 10}, // Red from 100 to 130
		// 	{strokeStyle: "#64DD17", min: 10, max: 20}, // Yellow
		// 	{strokeStyle: "#FFD600", min: 20, max: 30}, // Green
		// 	{strokeStyle: "#FFAB00", min: 30, max: 40}, // Yellow
		// 	{strokeStyle: "#FF5722", min: 40, max: 50},  // Red
		// 	{strokeStyle: "#D50000", min: 50, max: 60}  // Red
		// ],
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
		lineWidth: 0.18,
		radiusScale: 0.8,
		pointer: {
			length: 0.6,
			strokeWidth: 0.025,
			color: "#000000",
		},
		limitMax: false,
		limitMin: false,
		colorStart: "#20538C",
		colorStop: "#ff4600",
		strokeColor: "#E0E0E0",
		generateGradient: true,
		highDpiSupport: true,

		// 添加 staticLabels
		staticLabels: {
			font: "0.8vw sans-serif", // 刻度字体
			labels: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200], // 需要显示的刻度值
			color: "#000", // 刻度字体颜色
			fractionDigits: 0, // 小数位数
		},
		renderTicks: {
			divisions: 10,
			divWidth: 0.6,
			divLength: 0.7,
			divColor: "#333333",
			subDivisions: 5,
			subLength: 0.5,
			subWidth: 0.1,
			subColor: "#666666",
		},
		// 不需要 staticZones
		staticZones: [
			{ strokeStyle: "#00B0FF", min: 0, max: 70 },
			{ strokeStyle: "#00C853", min: 70, max: 100 },
			{ strokeStyle: "#FFD600", min: 100, max: 140 },
			{ strokeStyle: "#FF9100", min: 140, max: 160 },
			{ strokeStyle: "#FF3D00", min: 160, max: 180 },
			{ strokeStyle: "#D50000", min: 180, max: 200 },
		],
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
