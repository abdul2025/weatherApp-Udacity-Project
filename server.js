const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors');

app.use(cors());

app.use(express.static('website'));

const port = 8000;
const server = app.listen(port, () => {
	console.log(`server listening on ${port}`);
});

const projetData = {};
app.get('/all', (req, res) => {
	res.send(projetData);
});

function createProjetData(apiData) {
	const newEntery = {
		key: apiData.unique,
		userInput: apiData.userInput,
		userComments: apiData.userComment,
		temp: apiData.recievedApi.main.temp,
		humidity: apiData.recievedApi.main.humidity,
		cityName: apiData.recievedApi.name,
		countryName: apiData.recievedApi.sys.country,
		weatherDesc: apiData.recievedApi.weather[0].main,
		icon: apiData.recievedApi.weather[0].icon,
		wind: apiData.recievedApi.wind.speed,
	};
	return newEntery;
}
app.post('/apiData', (req, res) => {
	console.log('i got a request');
	const apiData = req.body;
	// console.log(apiData);
	projetData.newEntry = createProjetData(apiData);
	console.log(projetData);
	res.send(projetData);
});
