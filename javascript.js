function submitForm() {
    const address = document.getElementById("input1").value;
    const postal_code = document.getElementById("input2").value;
    const city = document.getElementById("input3").value;
    const country = document.getElementById("input4").value;
    let countryRmsCode = "";
    let latitude = "";
    let longitude = "";
    let postalCodeGeoId = "";
    let rmsGeoModelResolutionCode = "";

    // const inputdata = {
    //     "admin1Code": "CA",
    //     "cityName": "NEWARK",
    //     "countryCode": "US",
    //     "countryScheme": "ISO2A",
    //     "postalCode": "94560",
    //     "streetAddress": "7575 GATEWAY BLVD"
    // };

    const inputdata = {
        "admin1Code": "CA",
        "cityName": city,
        "countryCode": country,
        "countryScheme": "ISO2A",
        "postalCode": postal_code,
        "streetAddress": address
    };

    let geocode = {
        "countryScheme": "ISO2A",
        "countryRmsCode": countryRmsCode,
        "countryCode": country,
        "latitude": latitude,
        "longitude": longitude,
        "postalCodeGeoId": postalCodeGeoId,
        "rmsGeoModelResolutionCode": rmsGeoModelResolutionCode,
    } 

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
                outputDiv.innerHTML = `<p>GEOCODE API Response: ${JSON.stringify(data)}</p>`;
                // countryRmsCode = data.countryRmsCode;
                // latitude = data.latitude;
                // longitude = data.longitude;
                // postalCodeGeoId = data.postalCodeGeoId;
                // rmsGeoModelResolutionCode = data.rmsGeoModelResolutionCode;
                // console.log(data);
                // console.log(countryRmsCode);
                // console.log(data.countryRmsCode);
                let geocode = {
                    "countryScheme": "ISO2A",
                    "countryRmsCode": data.countryRmsCode,
                    "countryCode": country,
                    "latitude": data.latitude,
                    "longitude": data.longitude,
                    "postalCodeGeoId": data.postalCodeGeoId,
                    "rmsGeoModelResolutionCode": data.rmsGeoModelResolutionCode,
                } 
                console.log(data);
                runLossCosts(data, data.countryRmsCode);
                runRiskScore(data, data.countryRmsCode);
            })
        
    }

function runLossCosts(geocode, countryCode) {
    const construction = document.getElementById("input5").value;
    const occupancy = document.getElementById("input6").value;
    const year_built = document.getElementById("input7").value;
    const stories = document.getElementById("input8").value;

    const losscosts_url = `https://api-euw1.rms.com/li/${countryCode.toLowerCase()}_eq_loss_cost/latest`;

    // const losscosts_url = `https://api-euw1.rms.com/li/au_eq_loss_cost/latest`;

    // let losscosts = {
    //     "location": {
    //         "address": {
    //             "countryCode": "AU",
    //             "countryScheme": "ISO2A",
    //             "countryRmsCode": "AU",
    //             "latitude": -19.284868,
    //             "longitude": 146.772049,
    //             "rmsGeoModelResolutionCode": 1,
    //             "admin1GeoId": 2344702,
    //             "postalCodeGeoId": 12708445
    //         },
    //         "characteristics": {
    //             "construction": "",
    //             "occupancy": "ATC5",
    //             "yearBuilt": 1970,
    //             "numOfStories": 2
    //         },
    //         "coverageValues": {
    //             "buildingValue": 1000000,
    //             "contentsValue": 100000
    //         }
    //     },
    //     "layerOptions": {
    //         "surgeFlag": 0,
    //         "deductibleType": 1,
    //         "deductibleAmount": 0.1,
    //         "deductibleAmount2": 0.05,
    //         "deductibleAmount3": 0.02
    //     }
    // }
    
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
                "buildingValue": 1000000,
                "contentsValue": 100000
            }
        },
        "layerOptions": {
            "surgeFlag": 0,
            "deductibleType": 1,
        }

    }


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
                outputDiv.innerHTML = `<p>API Response: ${JSON.stringify(data)}</p>`;
                console.log(data);
            })
        }

runRiskScore(geocode, countryCode) {
    