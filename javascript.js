import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({region: "eu-west-1",});
let response;

try {
  response = client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}
const secret = response.SecretString;

const slider = document.getElementById('building');
const sliderValue = document.getElementById('buildingValue');
const slider2 = document.getElementById('content');
const sliderValue2 = document.getElementById('contentValue');

slider.addEventListener('input', function() {
    sliderValue.value = slider.value;
});

sliderValue.addEventListener('input', function() {
    const inputValue = parseInt(sliderValue.value);
    if (!isNaN(inputValue) && inputValue >= parseInt(slider.min) && inputValue <= parseInt(slider.max)) {
        slider.value = inputValue;
    }
});

slider2.addEventListener('input', function() {
    sliderValue2.value = slider2.value;
});

sliderValue2.addEventListener('input', function() {
    const inputValue2 = parseInt(sliderValue2.value);
    if (!isNaN(inputValue2) && inputValue2 >= parseInt(slider2.min) && inputValue2 <= parseInt(slider2.max)) {
        slider2.value = inputValue2;
    }
});

function submitForm() {
    const address = document.getElementById("input1").value;
    const postal_code = document.getElementById("input2").value;
    const city = document.getElementById("input3").value;
    const country = document.getElementById("input4").value;

// specify all relevant location data to feed into the geocode API. 
    const inputdata = {
        "admin1Code": "CA",
        "cityName": city,
        "countryCode": country,
        "countryScheme": "ISO2A",
        "postalCode": postal_code,
        "streetAddress": address
    };

// This is the url that needs to be accessed and called to get the geocode data.
    const geocode_url = `https://api-euw1.rms.com/li/geocode/latest`;

// This is the API request that feeds inputdata to the geocode API and return RMS data about the location that works with LI API.
    fetch(geocode_url, {
            method: 'POST',
            headers: {
                'Authorization': 'NbJJAhlheCKsoARqzxF4Gl8ky72MKlJ1S2yMsMNcQBY',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputdata)
            })
        .then(response => response.json())
        .then(data => {
                const outputDiv = document.getElementById("output");
                outputDiv.innerHTML = `
                <p>Latitude: ${JSON.stringify(data.latitude)}</p>
                <p>Longitude: ${JSON.stringify(data.longitude)}</p>`;
                initMap(data.latitude, data.longitude);
//  raw output of the geocode API can be seen from the console.
                console.log(data);
// The peril is specified here to windstorm. It can be changed to any peril that is available in the RMS API.
                peril = "WS";
// both functions below use LI API to get the loss costs and risk score data for a given geocoded location and peril.
                runLossCosts(data, data.countryRmsCode, peril);
                runRiskScore(data, data.countryRmsCode, peril);
            })
    }


function initMap(lattitude, longitude) {
    const { Map } = google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = google.maps.importLibrary("marker");  
    const mapOptions = {
        center: { lat: lattitude, lng: longitude},
        zoom: 10 
    };
    const map = new Map(document.getElementById("map"), mapOptions);
    const marker = new AdvancedMarkerElement({map: map, position: { lat: lattitude, lng: longitude}, title: "Location"});
}



function runLossCosts(geocode, countryCode, peril) {
    const construction = document.getElementById("input5").value;
    const occupancy = document.getElementById("input6").value;
    const year_built = document.getElementById("input7").value;
    const stories = document.getElementById("input8").value;
    const building_value = document.getElementById("building").value;
    const contents_value = document.getElementById("content").value;
    const deductible_type = document.getElementById("input9").value;
    const deductible_amount = document.getElementById("input10").value;

// This is the url that needs to be accessed and called to get the loss costs data. 
// It uses a generic peril and country code to adapt to different locations and perils (which each have their own unique url)
    const losscosts_url = `https://api-euw1.rms.com/li/${countryCode.toLowerCase()}_${peril.toLowerCase()}_loss_cost/latest`;
    
// This is the data that needs to be fed into the loss costs API. The address is all covered by the geocode API.
    let losscosts = {
        "location": {
            "address": geocode,
            "characteristics": {
                "construction": construction,
                "occupancy": occupancy,
                "yearBuilt": year_built,
                "numOfStories": stories
            },
            "coverageValues": {
                "buildingValue": building_value,
                "contentsValue": contents_value,
                "businessInterruptionValue": 0
            }
        },
        "layerOptions": {
            "surgeFlag": 0,
            "deductibleType": deductible_type,
            "deductibleAmount": deductible_amount/100
        }
    }

// This is the API request that feeds losscosts to the LI API.
    fetch(losscosts_url, {
        method: 'POST',
        headers: {
            'Authorization': 'NbJJAhlheCKsoARqzxF4Gl8ky72MKlJ1S2yMsMNcQBY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(losscosts)})
        .then(response => response.json())
        .then(data => {
                const outputDiv = document.getElementById("output2");
                outputDiv.innerHTML = `
                <p> Gross Loss: ${JSON.stringify(data.grossLoss)}
                <p>Ground Up Loss: ${JSON.stringify(data.groundUpLoss)}</p>`;
// The raw output of the loss costs API can be seen from the console. It includes more metrics than the ones displayed.
                console.log(data);
            })
    };

function runRiskScore(geocode, countryCode, peril) {
    const construction = document.getElementById("input5").value;
    const occupancy = document.getElementById("input6").value;
    const year_built = document.getElementById("input7").value;
    const stories = document.getElementById("input8").value;

// This is the url that needs to be accessed and called to get the risk score data.
// It uses a generic peril and country code to adapt to different locations and perils (which each have their own unique url)
    const riskscore_url = `https://api-euw1.rms.com/li/${countryCode.toLowerCase()}_${peril.toLowerCase()}_risk_score/latest`;

// This is the data that needs to be fed into the risk score API. The address is all covered by the geocode API.
    let riskscore = {
        "location": {
            "address": geocode,
        },
        "characteristics": {
            "construction": construction,
            "occupancy": occupancy,
            "yearBuilt": year_built,
            "numOfStories": stories
        }
    }

// This is the API request that feeds riskscore to the LI API to get back useful metrics.
    fetch(riskscore_url, {
        method: 'POST',
        headers: {
            'Authorization': 'NbJJAhlheCKsoARqzxF4Gl8ky72MKlJ1S2yMsMNcQBY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(riskscore)})
        .then(response => response.json())
        .then(data => {
                const outputDiv = document.getElementById("output3");
                outputDiv.innerHTML = `
                <body>
                <table>
                    <tr>
                        <th>Return Period</th>
                        <th>Risk Score</th>
                    </tr>
                    <tr>
                        <td>100 Years</td>
                        <td>${JSON.stringify(data.score100yr)}</td>
                    </tr>
                    <tr>
                        <td>200 Years</td>
                        <td>${JSON.stringify(data.score200yr)}</td>
                    </tr>
                    <tr>
                        <td>500 Years</td>
                        <td>${JSON.stringify(data.score500yr)}</td>
                    </tr>
                    <tr>
                        <td>Overall</td>
                        <td>${JSON.stringify(data.scoreOverall)}</td>
                    </tr>
                </table>
            </body>`;
                console.log(data);
            })
    }


// This is the same as the first function, but it uses latitude and longitude instead of address.
function submitForm2() {
    const latitude = document.getElementById("input1").value;
    const longitude = document.getElementById("input2").value;

    const inputdata = {
        "latitude": latitude,
        "longitude": longitude
    };

    const geocode_url = `https://api-euw1.rms.com/li/geocode/latest`;

    fetch(geocode_url, {
            method: 'POST',
            headers: {
                'Authorization': 'NbJJAhlheCKsoARqzxF4Gl8ky72MKlJ1S2yMsMNcQBY',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputdata)
            })
        .then(response => response.json())
        .then(data => {
                const outputDiv = document.getElementById("output");
                outputDiv.innerHTML = `
                <p>Latitude: ${JSON.stringify(data.latitude)}</p>
                <p>Longitude: ${JSON.stringify(data.longitude)}</p>`;
                console.log(data);
                peril = "WS";
                runLossCosts(data, data.countryRmsCode, peril);
                runRiskScore(data, data.countryRmsCode, peril);
            })
        
    }