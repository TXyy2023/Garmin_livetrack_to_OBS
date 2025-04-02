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

var geo_in_data_test = {
	type: "Feature",
	properties: {},
	geometry: {
		type: "LineString",
		coordinates: [
			[-122.483696, 37.833818],
			[-122.483482, 37.833174],
		],
	},
};

function geo_add_data(lon, lat) {
	// 将新的坐标添加到 geo_in_data.features[0].geometry.coordinates
	geo_in_data_test.geometry.coordinates.push([lon, lat]);

	console.log(geo_in_data_test.geometry.coordinates);
	return geo_in_data_test; // 返回更新后的 geo_in_data
}

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
		// console.log(data);
		geo_add_data(data.lon, data.lat);
	});

	mapboxgl.accessToken =
		"pk.eyJ1IjoiYmJuZHNrb3dlIiwiYSI6ImNtOHhzc2xwdTA5MzAyanIzOHQwdmY4Z3gifQ.PCVJZBjlDOnQIvsADOaVaQ";
	const map = new mapboxgl.Map({
		container: "map",
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: "mapbox://styles/mapbox/streets-v12",
		center: [-122.486052, 37.830348],
		zoom: 14,
	});

	map.on("load", () => {
		map.addSource("route", {
			type: "geojson",
			data: geo_in_data,
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

		setInterval(async () => {
			map.getSource("route").setData(geo_in_data_test);
			console.log("get in ");
		}, 1000);
		// map.getSource("route").setData(geo_in_data_test);
	});
});
