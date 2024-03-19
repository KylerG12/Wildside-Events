
// Gloabl varibles
const seatGeekClientId = "NDA0MDIwNTl8MTcxMDQ2Nzk3NS41ODgwMzE";
const seatGeekSecretKey = "3dd594f6f71a3122b77bd6260492f8a4c175be74026a726c05a3642205615c1b";
var userLocation = {
  City: "Portland, OR",
  latitude: 45.523064,
  longitude: -122.676483,
  eventNum: 0
};
var events = [];

const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

var map = L.map('map') // Create a map from leaflet library

//<a target="_blank" href="https://icons8.com/icon/9vrl4rG9wDf4/person">Person</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
var userIcon = L.icon ({
  iconSize: [60,60],
  iconAnchor: [ 30,30 ],
  popupAnchor: [30,30],
  iconUrl: "./assets/images/question.png"
//<a href="https://www.flaticon.com/free-icons/question" title="question icons">Question icons created by Freepik - Flaticon</a>

});



// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function updateEventList(){
  console.log(events);

  //Event count
  console.log(1);
  $('#eventCount').text(`${userLocation.eventNum} Events available`);
  console.log(2);

// Clear existing items from the list
  $('#eventList').empty();
    
  if (events.length == 0){
    // No events in area
    $('#eventList').append('<li>No Events in your area, select a city</li>');
  } else {
    // Iterate through events and create list
    console.log(1);
    $.each(events, function(event) {
      console.log(2);
      console.log(`<li> ${event.themes.type}: ${event.themes.title}</li>`);
      $('#eventList').append(`<li> ${event.themes.type}: ${event.themes.title}</li>`);
    });
  }
}

// Update map function
function updateMap(){
  var coordinates = [];

    // Remove old markers first
    map.eachLayer( function(layer){
      if (layer instanceof L.marker){
        map.removeLayer(layer);
      }
    });
  
  // if user location is undefined get location from center of event coordinate
  if (userLocation.longitude && userLocation.latitude ) {
    map.setView([userLocation.latitude, userLocation.longitude], 13);
    
    // Add a marker for user location
    L.marker(
      [userLocation.latitude, userLocation.longitude],
      {icon: userIcon}
    ).addTo(map);
  } else {
    events.forEach( event => {
      coordinates.push([event.venue.location.lat, event.venue.location.lon]);
    });
    console.log(coordinates);
    // Create LatLngBounds object
    //var bounds = L.latLngBounds(coordinates);

      // Get center of LatLngBounds object
    var mapCenter = L.latLngBounds(coordinates).getCenter();
  }

  

  
  

 
}

/*
async function fetchEventsByUserLocation(){

  try {
    const response = await fetch( `https://api.seatgeek.com/2/events?geoip=true&client_id=${seatGeekClientId}&client_secret=${seatGeekSecretKey}`);
    if (!response.ok) {
        throw new Error ("Failed to get location data");
    }
    const data = await response.json();
    return data;
  } catch (error){
      console.log("Error fetching data");
      throw error;
  }

  return result;
}
*/

async function fetchEventsBySelect(city, state){
  var selector;
  console.log(city,state);
  // City overdes state and ip address is used if neither is supplied
  if (city ){
    selector = `venue.city=${city}`;
  } else if (state) {
    selector = `state=${state}`;
  } else {
    selector = `geoip=true`;
  }
  
  try {
    const response = await fetch( `https://api.seatgeek.com/2/events?${selector}&client_id=${seatGeekClientId}&client_secret=${seatGeekSecretKey}`);
    if (!response.ok) {
        throw new Error ("Failed to get location data");
    }
    const data = await response.json();

    console.log(data);
    return data;
  } catch (error){
      console.log("Error fetching data");
      throw error;
  }

  return result;
}


async function getEventBySelect(city, state){

  fetchEventsBySelect(city, state)
      .then(data => {
        
        if( data.meta.geolocation != null ){
          userLocation.City = data.meta.geolocation.display_name;
          userLocation.latitude = data.meta.geolocation.lat;
          userLocation.longitude = data.meta.geolocation.lon;
          userLocation.longitude = data.meta.geolocation.lon;
         } else {
          userLocation.City = "";
          userLocation.latitude = null;
          userLocation.longitude = null;
        }

        userLocation.eventNum = data.meta.total;
        events = data.events;
console.log(44);
        updateMap();      
        console.log(55);
        updateEventList();
        console.log(66);
      })
      .catch (error =>{
        return error;
      });
}

getEventBySelect("Portland", null);