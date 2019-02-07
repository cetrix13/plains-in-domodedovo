/*
 *   Table shows plain's info (e.g velocity, coords ets). Source of data https://www.flightradar24.com/
 */
(function() {
    'use strict';

    const URL = 'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48';
    const DOMODEDOVO = {
        latitude: 55.410307,
        longitude: 37.902451
    };
    // make a call first time, then subsequent call in 5 sec interval
    showTable();
    setInterval(showTable, 5000);

    function getDataFromFlightRadar() {
        return fetch(URL, {
            method: 'GET',
            mode: 'cors',
        }).then(res => res.json()).catch(error => console.error('Error:', error));
    }

    function showTable() {
        getDataFromFlightRadar().then(response => {
            const listOfPlains = [];
            for (let key in response) {
                if (response.hasOwnProperty(key) && key != 'full_count' && key != 'version') {
                    listOfPlains.push({
                        coords: response[key][1] + ', ' + response[key][2],
                        degree: response[key][3],
                        speed: response[key][5] ? response[key][5] : '-',
                        isLanded: response[key][14] ? 'Да': 'Нет',
                        flight: response[key][13] ? response[key][13] : '-',
                        departure: response[key][11] ? response[key][11] : '-',
                        arrival: response[key][12] ? response[key][12] : '-',
                    });
                }
            }
            renderTable(sortByDistance(listOfPlains));
        });
    }

    // расстояния небольшие, поэтому для простоты будем рассчитывать как на плоскости
    function caclDistanceToDomodedovo(coords) {
        return Math.sqrt((coords['latitude'] - DOMODEDOVO['latitude']) ** 2 +
            (coords['longitude'] - DOMODEDOVO['longitude']) ** 2);
    }

    function sortByDistance(records) {
        for (let key in records) {
            let latitude;
            let longitude;
            [latitude, longitude] = records[key]['coords'].split(', ');
            const dist = caclDistanceToDomodedovo({ latitude, longitude });
            records[key]['dist'] = dist;
        }
        return records.sort((a, b) => a.dist - b.dist);
    }

    function renderTable(data) {
        // if there is old table remove it
        const plainsTable = document.querySelector('table');
        if (document.contains(plainsTable)) {
            plainsTable.remove();
        }

        const container = document.querySelector('.container');
        const table = document.createElement('table');
        container.appendChild(table);
        // create table header
        const thead = document.createElement('thead');
        table.appendChild(thead);
        const tr = thead.insertRow();
        tr.innerHTML += '<th>Координаты</th>';
        tr.innerHTML += '<th>Курс, градусы</th>';
        tr.innerHTML += '<th>Скорость, км/ч</th>';
        tr.innerHTML += '<th>На земле?</th>';
        tr.innerHTML += '<th>Номер рейса</th>';
        tr.innerHTML += '<th>Аэропорт вылета</th>';
        tr.innerHTML += '<th>Аэропорт назначения</th>';
        table.appendChild(thead);
        // create body of the table
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        data.forEach((el) => {
            const tr = tbody.insertRow();
            for (let key in el) {
                if (key == 'dist') {
                    continue;
                }
                const td = tr.insertCell();
                td.appendChild(document.createTextNode(el[key]));
            }
        });
    }
})();
