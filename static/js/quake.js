var urlAllDay = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var colors = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'];

d3.json(urlAllDay, function(response) {
  createFeatures(response.features);
})

function createFeatures(earthquakeData)  {
    var earthquakes = L.geoJson(earthquakeData, {
        style: function(feature) {           
            return {
                color: markerColor(feature.properties.mag),
            };
        },
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillOpacity: 0.7,
                riseOnHover: true,
            })
        },
        onEachFeature: function(feature, layer) {
            layer.on({
                // On mouse over, make the feature (neighborhood) more visible
                mouseover: function(event) {
                  layer = event.target;
                  layer.setStyle({
                    fillOpacity: 0.9
                  });
                },
                // Set the features style back to the way it was
                mouseout: function(event) {
                  earthquakes.resetStyle(event.target);
                }
              });
            layer.bindPopup("<div class='popup' style:'background-color:=lightblue'><h3>" + feature.properties.title
          + "</h3><hr class='popup-hr' color="+ markerColor(feature.properties.mag) +"><p>" + new Date(feature.properties.time) + "</p>"
          + "<b>Place : </b>" + feature.properties.place + "<br>"
          + "<b>Magnitude : </b>" + feature.properties.mag + "<br>"
          + "<b>Coordinates: </b>" + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0]+"</div>");
        }
    });
    createMap(earthquakes)
}

function createMap(earthquakes) {
  var streetsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    })
    
    var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    })


    var terrainBG = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 7,
        ext: 'png',
        id: "main-map"
    });

    var baseMaps = {
        "Streets": streetsMap,
        "Dark": darkMap,
        "Terrain": terrainBG,
    }
    tectonicPlates = createPlates()

    var overlayMaps = {
        FaultLines: tectonicPlates,
        Earthquakes: earthquakes
    };

    var myMap = L.map('myMap', {
        center: [39.8097, -98.5556],
        zoom: 2,
        layers: [streetsMap, earthquakes]
    })

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
    }).addTo(myMap);

    var legend = makeLegend()
    legend.addTo(myMap);
}

function makeLegend() {
  var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        var div = L.DomUtil.create("table", "info legend");
        var magnitudes = [0,2,3,4,5];
        var labels = [];
        var legendInfo = '<tr><th>Magnitude</th></tr>'
        div.innerHTML = legendInfo
        magnitudes.forEach(function(magnitude, index) {
            if (magnitudes[index] < magnitudes.length) {
                labels.push('<tr><td bgcolor="'+colors[index]+'"></td><td>'+magnitude+'-'+magnitudes[index+1]+'</td></tr>');
            }
            else {
                labels.push('<tr><td bgcolor="'+colors[index]+'"></td><td>>'+magnitude+'</td></tr>');
            }  
        });
        div.innerHTML += labels.join('');
        return div;
    };
  return legend
}

function createPlates() {
    //Tried calling it by file name but was not successful.  
    
    // faultLinesLayer = d3.json("/static/data/PB2002_plates.json", function(response) {   
    //     var tectonicPlates = L.geoJson(response.features, {      
    //         style: function(feature) {
    //             return {
    //                 color: 'orange', 
    //                 weight: 6  
    //             }
    //         },
    //         pointToLayer: function(feature, latlng) {
    //              return stuff = L.polyline(latlng)
    //         }
    //     })
    //     return tectonicPlates
    // })
    
    // return faultLinesLayer
    var plateData = L.geoJson(plates, {
        style: {
            color: 'orange',
            weight: 3,
            fillOpacity: 0
        },
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseover: function(event) {
                  layer = event.target;
                  layer.bindPopup('Plate Name: ' + feature.properties.PlateName);
                  layer.setStyle({
                    color: 'red',
                    weight: 5,
                    fillOpacity: 0.2
                  });
                  layer.bringToBack()
                  },
                mouseout: function(event) {
                layer = event.target;
                layer.setStyle({
                    color: 'orange',
                    weight: 3,
                    fillOpacity: 0
                });
                layer.bringToBack()
                },  
              });
        }
    })
    return plateData

}

function markerSize(magnitude) {
    return magnitude * 5;
  }

function markerColor(magnitude) {
    var color = "";
    if (magnitude > 5) {
      color = colors[4];
    }
    else if (magnitude > 4) {
        color = colors[3];
      }
    else if (magnitude > 3) {
      color = colors[2];
    }
    else if (magnitude > 2) {
      color = colors[1];
    }
    else {
      color = colors[0];
    }
    return color
}