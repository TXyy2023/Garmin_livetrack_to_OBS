var geo_in_data = {
	type: "Feature",
	properties: {},
	geometry: {
		type: "LineString",
		coordinates: [
			[-122.483696, 37.833818],
			[-122.483482, 37.833174],
			[-122.483396, 37.8327],
			[-122.483568, 37.832056],
			[-122.48404, 37.831141],
			[-122.48404, 37.830497],
			[-122.483482, 37.82992],
			[-122.483568, 37.829548],
			[-122.48507, 37.829446],
			[-122.4861, 37.828802],
			[-122.486958, 37.82931],
			[-122.487001, 37.830802],
			[-122.487516, 37.831683],
			[-122.488031, 37.832158],
			[-122.488889, 37.832971],
			[-122.489876, 37.832632],
			[-122.490434, 37.832937],
			[-122.49125, 37.832429],
			[-122.491636, 37.832564],
			[-122.492237, 37.833378],
			[-122.493782, 37.833683],
		],
	},
};

const geo_in_data_test = {
	type: "Feature",
	properties: {},
	geometry: {
		type: "LineString",
		coordinates: [
			[116.141190771014, 40.2499238401651],
			[116.14099547267, 40.2499238401651],
		],
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

function geo_add_data(lon, lat) {
	// 将新的坐标添加到 geo_in_data.features[0].geometry.coordinates
	geo_in_data_test.geometry.coordinates.push([lon, lat]);

	// console.log(geo_in_data_test.geometry.coordinates);
	return geo_in_data_test; // 返回更新后的 geo_in_data
}

document.addEventListener("DOMContentLoaded", function () {
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
	var gauge1 = new Gauge(target).setOptions(opts);

	gauge1.maxValue = 60;
	gauge1.setMinValue(0);
	gauge1.animationSpeed = 32;

	// 初始设置
	var currentValue = 25;
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
	var gauge2 = new Gauge(target).setOptions(opts);

	gauge2.maxValue = 200;
	gauge2.setMinValue(0);
	gauge2.animationSpeed = 32;

	// 初始设置
	var currentValue = 25;
	gauge2.set(currentValue);

	// 同步显示上方的数值
	document.getElementById("heartrate_gauge-value").innerText = currentValue;

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
		document.getElementById("distance").textContent = `distance: ${(data.distance / 1000).toFixed(
			2
		)} km`;
		document.getElementById("During_time").textContent = `During_time: ${data.During_time}`;
		document.getElementById("altitude").textContent = `altitude: ${data.altitude}`;
		document.getElementById("true_time").textContent = `true_time: ${data.true_time}`;
		// document.getElementById("position").textContent = `position: ${data.lat + data.lon}`;
		document.getElementById("position").textContent = `lat:${data.lat} lon:${data.lon}`;
		document.getElementById("activityType").textContent = `activityType: ${data.activityType}`;
		document.getElementById("pointStatus").textContent = `pointStatus: ${data.pointStatus}`;
		document.getElementById("cadence").textContent = `cadence: ${data.cadence}`;
		// console.log(data);
		geo_add_data(parseFloat(data.lon), parseFloat(data.lat));

		gauge1.set(parseInt(data.speed));
		document.getElementById("speed_gauge-value").innerText = `Speed: ${data.speed} km/h`;
		gauge2.set(parseInt(data.heart_rate));
		document.getElementById(
			"heartrate_gauge-value"
		).innerText = `heart_rate: ${data.heart_rate} bpm`;
	});

	mapboxgl.accessToken =
		"pk.eyJ1IjoiYmJuZHNrb3dlIiwiYSI6ImNtOHhzc2xwdTA5MzAyanIzOHQwdmY4Z3gifQ.PCVJZBjlDOnQIvsADOaVaQ";
	const map = new mapboxgl.Map({
		container: "map",
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: "mapbox://styles/mapbox/dark-v11",
		center: [116.141190771014, 40.2499238401651],
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
			data: geo_in_data,
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
});
