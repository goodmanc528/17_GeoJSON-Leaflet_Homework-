function markerSize(magnitude) {
    return magnitude * 10;
  }

function createFeatures(quakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
      + "<b>Magnitude: </b>" + feature.properties.mag + "<br>" +
      "<b>Coordinates: </b>" + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0]);
    };
    var earthquakes = L.geoJSON(quakeData, {
        onEachFeature: onEachFeature
    });
createMap(earthquakes, quakeData)
}

function createMap(earthquakes, quakeData) {
    var earthquakeMarkers = [];
    var coords = [];
    for (var i=0; i < quakeData.length; i++) {
        coords = quakeData[i].geometry.coordinates[1] + "," + quakeData[i].geometry.coordinates[0]
        console.log(coords)
        earthquakeMarkers.push(
            L.circle(coords, {
               fillOpacity: .80,
               color: "purple",
               stroke = false,
               fillColor:"red",
               radius: markerSize(quakeData[i].properties.mag)
            })

        );
    }
    var earthquakeLayer = L.layerGroup(earthquakes);


    var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    })

    var terrainBG = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 18,
        ext: 'png',
        id: "main-map"
    });

    var baseMaps = {
        "Light": lightMap,
        "Terrain": terrainBG
    }

    var overlayMaps = {
        Earthquakes: earthquakes,
        newEarthquakes: earthquakeLayer
    };

    var myMap = L.map('myMap', {
        center: centerUS,
        zoom: defaultZoom,
        layers: [lightMap, terrainBG, earthquakeLayer]
    })

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}
    // function createMarkers(quakeDataRaw)
 
var centerUS = [39.8097, -98.5556];
var defaultZoom = 3

var urlAllDay = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var urlSevenDays = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(urlAllDay, function(response) {
    createFeatures(response.features)
})