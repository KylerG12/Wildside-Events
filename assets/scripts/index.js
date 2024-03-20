// Attribution for images to be implimented later
//<a href="https://www.flaticon.com/free-icons/concert" title="concert icons">Concert icons created by Freepik - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/football" title="football icons">Football icons created by Freepik - Flaticon</a>
  
//<a href="https://www.flaticon.com/free-icons/nba" title="nba icons">Nba icons created by amoghdesign - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/validating-ticket" title="validating ticket icons">Validating ticket icons created by Freepik - Flaticon</a>

//<a href="https://www.flaticon.com/free-icons/sport" title="sport icons">Sport icons created by mavadee - Flaticon</a>
 //<a href="https://www.flaticon.com/free-icons/baseball" title="baseball icons">Baseball icons created by Smashicons - Flaticon</a>


// Gloabl varibles
const seatGeekClientId = "NDA0MDIwNTl8MTcxMDQ2Nzk3NS41ODgwMzE";
const seatGeekSecretKey = "3dd594f6f71a3122b77bd6260492f8a4c175be74026a726c05a3642205615c1b";
var userLocation = {
  City: "Portland, OR",
  latitude: 45.523064,
  longitude: -122.676483
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

// User icon comes from 
// https://www.flaticon.com/free-icons/question, Question icons created by Freepik
var userIcon = L.icon ({
  iconSize: [60,60],
  iconAnchor: [ 30,30 ],
  popupAnchor: [30,30],
  iconUrl: "./assets/images/question.png"


});



// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function updateEventList(){
  

  //Event count
  
  $('.eventCount').text(`${events.length} Events available`);
  
// Clear existing items from the list
  $('#eventList').empty();
  
  if (events.length == 0){
    // No events in area
    $('#eventList').append(`<li>No Events in your area.</li>`);
  } else {
    // Iterate through events and create list
    events.forEach( event => {
      $('#eventList').append(`<li> ${event.title} - ${event.type}</li>`);
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
  }
  
  if (events.length > 0) {
    // Create markers for each event

    events.forEach( event => {
      // create custom icon for events
      console.log(event);      

      var icon = L.icon ({
        iconSize: [60,60],
        iconAnchor: [ 30,30 ],
        popupAnchor: [0,0],
        iconUrl: `./assets/images/${eventIcon(event.type)}.png`
      });

      var coord = [event.venue.location.lat, event.venue.location.lon];
      
      
      var marker = L.marker( coord,
        {icon: icon} ).addTo(map)
        .bindTooltip(`${event.title}`, {sticky: false});
        
        // Show tooltip on marker hover
      marker.on('mouseover', function(e) {
        this.openTooltip();
      });

      // Hide tooltip when mouse leaves the marker
      marker.on('mouseout', function(e) {
        this.closeTooltip();
      });
    
      // Save cooridinates
      coordinates.push(coord);
    });

      // Get center of LatLngBounds object
    var mapCenter = L.latLngBounds(coordinates).getCenter();
  }

  

}



async function fetchEventsBySelect(city, state){
  var selector;
  const apiUrl = 'https://api.seatgeek.com/2/events';
  const startDate = new Date();
  const endDate = new Date();

  // City overides state and ip address is used if neither is supplied
  if (city ){
    selector = `venue.city=${city}`;
  } else if (state) {
    selector = `state=${state}`;
  } else {
    selector = `geoip=true`;
  }
  
  // Clear events list
  events = [];
  
  // Set to a week of events
  endDate.setDate(endDate.getDate() + 7);

  const params = {
    'client_id': seatGeekClientId, 
    'client_secret' : seatGeekSecretKey,
    'per_page': 50, 
    'datetime_local.gte': startDate.toISOString().split('T')[0], // Start date in ISO format (YYYY-MM-DD)
    'datetime_local.lte': endDate.toISOString().split('T')[0], // End date in ISO format (YYYY-MM-DD)
    'page': 1 // Page number, start with 1
  };

  // Function to fetch events
  async function fetchEvents() {
    try {
        // Fetch the first page of events
        let response = await fetch(apiUrl + '?' + selector + "&" + new URLSearchParams(params));
        let data = await response.json();
        
        // save user locations
        if( data.meta.geolocation != null ){
          userLocation.City = data.meta.geolocation.display_name;
          userLocation.latitude = data.meta.geolocation.lat;
          userLocation.longitude = data.meta.geolocation.lon;
          userLocation.longitude = data.meta.geolocation.lon;
         } 

        // Handle successful response
        for (let i = 0; i < data.events.length; i++) {
          events.push(data.events[i]);
        }

        // Check if there are more pages of results
        if (data.meta && data.meta.total > params.per_page * params.page) {
            // Increment the page number and fetch the next page
            params.page++;
            await fetchEvents();
        }
        updateEventList();
        updateMap();    
    } catch (error) {
    }
  }

  fetchEvents();
}

function eventIcon(type){
  var result;

  switch (type){      
    case "concert", "nba", "soccer","nba_dleague":
      result = type;
      break;
    case "nba_dleague":
      result = "baseball";
      break;
    default:
      result = "tickets";
  }

  return result;
}

// Run with null args to set user location.
fetchEventsBySelect("Portland", null);