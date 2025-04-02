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

	mapboxgl.accessToken =
		"pk.eyJ1IjoiYmJuZHNrb3dlIiwiYSI6ImNtOHhzc2xwdTA5MzAyanIzOHQwdmY4Z3gifQ.PCVJZBjlDOnQIvsADOaVaQ";
	const map = new mapboxgl.Map({
		container: "map",
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: "mapbox://styles/mapbox/streets-v12",
		zoom: 1.5,
	});

	map.on("load", async () => {
		// Get the initial location of the International Space Station (ISS).
		const geojson = await getLocation();
		// Add the ISS location as a source.
		map.addSource("iss", {
			type: "geojson",
			data: geojson,
		});
		// Add the rocket symbol layer to the map.
		map.addLayer({
			id: "iss",
			type: "symbol",
			source: "iss",
			layout: {
				// This icon is a part of the Mapbox Streets style.
				// To view all images available in a Mapbox style, open
				// the style in Mapbox Studio and click the "Images" tab.
				// To add a new image to the style at runtime see
				// https://docs.mapbox.com/mapbox-gl-js/example/add-image/
				"icon-image": "rocket",
			},
		});

		// Update the source from the API every 2 seconds.
		const updateSource = setInterval(async () => {
			const geojson = await getLocation(updateSource);
			map.getSource("iss").setData(geojson);
		}, 2000);

		async function getLocation(updateSource) {
			// Make a GET request to the API and return the location of the ISS.
			try {
				const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
					method: "GET",
				});
				const { latitude, longitude } = await response.json();
				console.log(latitude, longitude);
				// Fly the map to the location.
				map.flyTo({
					center: [longitude, latitude],
					speed: 0.5,
				});
				// Return the location of the ISS as GeoJSON.
				return {
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							geometry: {
								type: "Point",
								coordinates: [longitude, latitude],
							},
						},
					],
				};
			} catch (err) {
				// If the updateSource interval is defined, clear the interval to stop updating the source.
				if (updateSource) clearInterval(updateSource);
				throw new Error(err);
			}
		}
	});
});
