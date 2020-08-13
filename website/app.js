const start = performance.now();
const urlObj = {
	cityUrl: `http://api.openweathermap.org/data/2.5/weather?q=`,
	apiKey: '&units=metric&APPID=780ae065c3854c8733dcae94ca8cac6a',
	zipUrl: 'http://api.openweathermap.org/data/2.5/weather?zip=',
	lotAndlon: 'api.openweathermap.org/data/2.5/weather?',
};
const objDOM = {
	genrate: document.getElementById('genrate'),
	userInput: document.getElementById('zip-city'),
	userComment: document.getElementById('feeling'),
	cityName: document.getElementById('city-name'),
	countyName: document.getElementById('county-name'),
	condation: document.getElementById('condation'),
	temp: document.getElementById('temp'),
	wind: document.getElementById('wind'),
	imgIcon: document.getElementById('icon'),
	body: document.getElementsByTagName('body'),
	historyList: document.getElementById('history-list'),
	invalidInputs: document.getElementById('invalid-inputs'),
	overlay: document.getElementById('overlay'),
};

function geolocation() {
	let lat, lon;
	// current location for user
	if ('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition(async (position) => {
			lat = position.coords.latitude.toFixed();
			lon = position.coords.longitude.toFixed();
			const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}${urlObj.apiKey}`;
			// console.log(lat, lon);
			const response = await fetch(api_url);
			const json = await response.json();
			// console.log(json);
			// console.log(json);
			/////////////////////////////////// need to update UI as well
			sendData(json);
			//check preformance after geolocation
			const end = performance.now();
			const preformTimeout = end - start;

		});
		// city api
		async function retriveWeatherApi(url, apiKey, cityName) {
			let api = await fetch(`${url}${cityName}${apiKey}`);
			try {
				const data = api.json();
				const result = await data;
				return result;
			} catch (Error) {
				objDOM.overlay.style.display = 'grid';
				console.log('err weather API');
				console.log(Error);
			}
		}
		// post the weather data to backend
		async function postData(url, data) {
			const response = await fetch(url, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			try {
				const json = await response;
				// console.log(json);
				retriveData();
			} catch (Error) {
				objDOM.overlay.style.display = 'grid';
				console.log('err postDate');
				console.log(Error);
			}
		}

		let key = 0;
		// create object hold a certain data sent to the backend
		function sendData(api) {
			return {
				unique: key,
				userInput: objDOM.userInput.value,
				userComment: objDOM.userComment.value,
				recievedApi: api,
			};
		}
		// make an action to the user request
		async function preformRequest(e) {
			// check the userInput city or zipCode
			const type = isNaN(objDOM.userInput.value);
			////////////////////////////////
			////////////////////////////////
			//// check if inputs type
			//// check if the api response is valid
			//// call the api send request to backend
			if (objDOM.userInput.value.length > 0 && type) {
				// console.log(true);
				const recievedApi = await retriveWeatherApi(
					urlObj.cityUrl,
					urlObj.apiKey,
					objDOM.userInput.value
				);
				// console.log(recievedApi);
				if (recievedApi.cod === 200) {
					postData('/apiData', sendData(recievedApi));
				} else if (recievedApi.cod != 401) {
					objDOM.invalidInputs.style.display = 'block';
				} else {
					objDOM.overlay.style.display = 'grid';
				}

				// console.log(sendData(recievedApi));
				// search by zip code
			} else if (objDOM.userInput.value.length > 0 && !type) {
				const userInp = `${objDOM.userInput.value},us`;
				const recievedApi = await retriveWeatherApi(
					urlObj.zipUrl,
					urlObj.apiKey,
					userInp
				);
				if (recievedApi.cod === 200) {
					postData('/apiData', sendData(recievedApi));
				} else if (recievedApi.cod !== 401) {
					objDOM.invalidInputs.style.display = 'block';
				} else {
					objDOM.overlay.style.display = 'grid';
				}
			} else {
				objDOM.overlay.style.display = 'grid';
				// console.log(recievedApi);
				// console.log('Invalid input');
			}
		}
		//// get the certain data from the server
		async function retriveData() {
			let data = await fetch('/all');
			const finalData = await data.json();
			// console.log(finalData);
			updateUI(finalData);
			key++;
		}
		// update the UI with the right retriveData
		function updateUI(data) {
			// console.log(data);
			objDOM.cityName.innerHTML = data.newEntry.cityName;
			objDOM.countyName.innerHTML = `, ${data.newEntry.countryName}`;
			objDOM.condation.innerHTML = data.newEntry.weatherDesc;
			objDOM.temp.innerHTML = ` ${Math.round(data.newEntry.temp)}° C`;
			objDOM.wind.innerHTML = `Wind speed: ${Math.round(
				data.newEntry.wind
			)}mph`;
			objDOM.imgIcon.setAttribute(
				'src',
				`http://openweathermap.org/img/wn/${data.newEntry.icon}.png`
			);
			objDOM.body[0].style = `background-image: url(../imgs/${data.newEntry.weatherDesc}.jpg)`;
			entryHolder(data);
			init();
		}
		// date
		const date = new Date();
		const dateString = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;


		// create DOM elements
		function entryHolder(data) {
			if (objDOM.userInput.value == '') {
				const html = `<div id="entryHolder">
		<div id ="countryName">${data.newEntry.countryName}</div>
		<div id="cityName">${data.newEntry.cityName}</div>
		<div id="temp">${Math.round(data.newEntry.temp)}° C</div>
		<div id="date">${dateString}</div>
		</div>`;
				objDOM.historyList.insertAdjacentHTML('beforeend', html);
			} else {
				const html = `<div id="entryHolder">
			<div id ="content">content: "${objDOM.userInput.value}"</div>
			<div id ="contentComment">Comments: "${objDOM.userComment.value}"</div>
			<div id ="countryName">${data.newEntry.countryName}</div>
			<div id="cityName">${data.newEntry.cityName}</div>
			<div id="temp">${Math.round(data.newEntry.temp)}° C</div>
			<div id="date">${dateString}</div>
		</div>`;
				objDOM.historyList.insertAdjacentHTML('beforeend', html);
			}
		}
		genrate.addEventListener('click', preformRequest);
	} else {
		console.log('geolocation not available');
	}
}

// initialization
const init = () => {
	objDOM.userInput.value = '';
	objDOM.userComment.value = '';
	objDOM.userInput.focus();
	objDOM.invalidInputs.style.display = 'none';
	objDOM.overlay.style.display = 'none';
};
init();

geolocation();
