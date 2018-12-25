(function() {
    'use strict';

    const url = 'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48';
    const domodedovo = {
        latitude: 55.410307,
        longitude: 37.902451
    };
    // make a call first time, then subsequent call in 5 sec interval
    getDataFromFlightRadarWrapper();
    setInterval(getDataFromFlightRadarWrapper, 5000);

    function getDataFromFlightRadar() {
        return fetch(url, {
            method: 'GET',
            cors: 'no-cors',
        }).then(res => res.json()).catch(error => console.error('Error:', error));
    }

    function getDataFromFlightRadarWrapper() {
        // if there is old table remove it
        const table = document.querySelector("table");
        if (document.contains(table)) {
            table.remove();
        }

        getDataFromFlightRadar().then((response) => {
            const listOfPlains = [];
            for (let key in response) {
                if (response.hasOwnProperty(key) && key != 'full_count' && key != 'version') {
                    listOfPlains.push({
                    latitude: response[key][1],
                    longitude: response[key][2],
                    degree: response[key][3],
                    speed: response[key][5],
                    height: response[key][6],
                    flight: response[key][9],
                    departure: response[key][11],
                    arrival: response[key][12]
                });
                }
            }
            sortByDistance(listOfPlains);
            renderTable(listOfPlains);
        });
    }

    // расстояния небольшие, поэтому для простоты будем рассчитывать как на плоскости
    function caclDistanceToDomodedovo(coords) {
        return Math.sqrt(Math.pow((coords['latitude'] - domodedovo['latitude']), 2) +
            Math.pow((coords['longitude'] - coords['latitude']), 2))
    }

    function sortByDistance(records) {
        for (let key in records) {
            let dist = caclDistanceToDomodedovo({
                latitude: records[key]['latitude'],
                longitude: records[key]['longitude']
            });
            records[key]['dist'] = dist;
        }
        records.sort(function(a, b) {
            return a.dist - b.dist;
        });
        return records;
    }

    function renderTable(data) {
        const container = document.querySelector('.container');
        const table = document.createElement('table');
        container.appendChild(table);
        // create header
        const thead = document.createElement('thead');
        table.appendChild(thead);
        let tr = thead.insertRow();
        tr.innerHTML += "<th>Координаты</th>";
        tr.innerHTML += "<th>Скорость, км/ч</th>";
        tr.innerHTML += "<th>Курс, градусы</th>";
        tr.innerHTML += "<th>Высота, м</th>";
        tr.innerHTML += "<th>Аэропорт вылета</th>";
        tr.innerHTML += "<th>Аэропорт назначения</th>";
        tr.innerHTML += "<th>Номер рейса</th>";

        data.forEach(function(el, key) {
            let tr = table.insertRow();
            //el.forEach(function(cell) {
            for (const key of Object.keys(el)) {
                let td = tr.insertCell();
                td.appendChild(document.createTextNode(el[key]));
            }
        });
    }
})();
