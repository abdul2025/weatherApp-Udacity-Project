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
};

async function retriveWeatherApi(url, apiKey, cityName) {
	try {
		let api = await fetch(`${url}${cityName}${apiKey}`);
		const data = api.json();
		return data;
	} catch (Error) {
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
		} else {
			objDOM.userInput.insertAdjacentHTML(
				'afterend',
				'<h4 id="invalid-inputs">invalid city name</h4>'
			);
		}

		// console.log(sendData(recievedApi));
	} else if (objDOM.userInput.value.length > 0 && !type) {
		const userInp = `${objDOM.userInput.value},us`;
		const recievedApi = await retriveWeatherApi(
			urlObj.zipUrl,
			urlObj.zipApiKey,
			userInp
		);
		// console.log(recievedApi);
		if (recievedApi.cod === 200) {
			postData('/apiData', sendData(recievedApi));
		} else {
			objDOM.userInput.insertAdjacentHTML(
				'afterend',
				'<h4>invalid zip code </h4>'
			);
		}
	} else {
		console.log('Invalid input');
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
	console.log(data);
	objDOM.cityName.textContent = data[data.length - 1].cityName;
	objDOM.countyName.textContent = `, ${data[data.length - 1].countryName}`;
	objDOM.condation.textContent = data[data.length - 1].weatherDesc;
	objDOM.temp.textContent = ` ${Math.round(data[data.length - 1].temp)}° C`;
	objDOM.wind.textContent = `Wind speed: ${Math.round(
		data[data.length - 1].wind
	)}mph`;
	objDOM.imgIcon.setAttribute(
		'src',
		`http://openweathermap.org/img/wn/${data[data.length - 1].icon}.png`
	);
	objDOM.body[0].style = `background-image: url(../imgs/${
		data[data.length - 1].weatherDesc
	}.jpg)`;
	updateHistory(data);
	document.getElementById('invalid-inputs').style.display = 'none';
	init();
}

function updateHistory(data) {
	const html = `<li>
		<span>Input: "${objDOM.userInput.value}"</span>
		<span>Comments: "${objDOM.userComment.value}"</span>
		<span>${data[data.length - 1].countryName}</span>
		<span>${data[data.length - 1].cityName}</span>
		<span>${Math.round(data[data.length - 1].temp)}° C</span>
	</li>`;
	objDOM.historyList.insertAdjacentHTML('beforeend', html);
}

genrate.addEventListener('click', preformRequest);

const init = () => {
	objDOM.userInput.value = '';
	objDOM.userComment.value = '';
	objDOM.userInput.focus();
};
init();
