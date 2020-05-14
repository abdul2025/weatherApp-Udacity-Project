const urlObj = {
	cityUrl: `http://api.openweathermap.org/data/2.5/weather?q=`,
	cityApiKey: '&units=metric&APPID=780ae065c3854c8733dcae94ca8cac6a',
	zipApiKey: '&units=metric&APPID=780ae065c3854c8733dcae94ca8cac6a',
	zipUrl: 'http://api.openweathermap.org/data/2.5/weather?zip=',
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
async function postData(url, data) {
	const response = await fetch(url, {
		method: 'POST',
		credentials: 'same-origin',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	try {
		const json = await response.json();
		// console.log(json);
		retriveData();
	} catch (Error) {
		objDOM.overlay.style.display = 'grid';
		console.log('err postDate');
		console.log(Error);
	}
}

let key = 0;

function sendData(api) {
	return {
		unique: key,
		userInput: objDOM.userInput.value,
		userComment: objDOM.userComment.value,
		recievedApi: api,
	};
}

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
			urlObj.cityApiKey,
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
	} else if (objDOM.userInput.value.length > 0 && !type) {
		const userInp = `${objDOM.userInput.value},us`;
		const recievedApi = await retriveWeatherApi(
			urlObj.zipUrl,
			urlObj.zipApiKey,
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

async function retriveData() {
	let data = await fetch('/all');
	const finalData = await data.json();
	// console.log(finalData);
	updateUI(finalData);
	key++;
}

function updateUI(data) {
	// console.log(data);
	objDOM.cityName.innerHTML = data.newEntry.cityName;
	objDOM.countyName.innerHTML = `, ${data.newEntry.countryName}`;
	objDOM.condation.innerHTML = data.newEntry.weatherDesc;
	objDOM.temp.innerHTML = ` ${Math.round(data.newEntry.temp)}° C`;
	objDOM.wind.innerHTML = `Wind speed: ${Math.round(data.newEntry.wind)}mph`;
	objDOM.imgIcon.setAttribute(
		'src',
		`http://openweathermap.org/img/wn/${data.newEntry.icon}.png`
	);
	objDOM.body[0].style = `background-image: url(../imgs/${data.newEntry.weatherDesc}.jpg)`;
	entryHolder(data);
}

const date = new Date();
const dateString = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
console.log(dateString);

function entryHolder(data) {
	const html = `<div id="entryHolder">
		<div id ="content">content: "${objDOM.userInput.value}"</div>
		<div id ="contentComment">Comments: "${objDOM.userComment.value}"</div>
		<div id ="countryName">${data.newEntry.countryName}</div>
		<div id="cityName">${data.newEntry.cityName}</div>
		<div id="temp">${Math.round(data.newEntry.temp)}° C</div>
		<div id="date">${dateString}</div>
	</div>`;
	objDOM.historyList.insertAdjacentHTML('beforeend', html);
	init();
}

genrate.addEventListener('click', preformRequest);

const init = () => {
	objDOM.userInput.value = '';
	objDOM.userComment.value = '';
	objDOM.userInput.focus();
	objDOM.invalidInputs.style.display = 'none';
	objDOM.overlay.style.display = 'none';
};
init();
