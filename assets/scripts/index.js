//---------------------------------------------------------------------
// TO DO
//---------------------------------------------------------------------

// Attribution for images to be implimented later
//<a href="https://www.flaticon.com/free-icons/concert" title="concert icons">Concert icons created by Freepik - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/football" title="football icons">Football icons created by Freepik - Flaticon</a>
  
//<a href="https://www.flaticon.com/free-icons/nba" title="nba icons">Nba icons created by amoghdesign - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/validating-ticket" title="validating ticket icons">Validating ticket icons created by Freepik - Flaticon</a>

//<a href="https://www.flaticon.com/free-icons/sport" title="sport icons">Sport icons created by mavadee - Flaticon</a>
 //<a href="https://www.flaticon.com/free-icons/baseball" title="baseball icons">Baseball icons created by Smashicons - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/ice-hockey" title="ice hockey icons">Ice hockey icons created by Freepik - Flaticon</a>
//<a href="https://www.flaticon.com/free-icons/theater" title="theater icons">Theater icons created by Freepik - Flaticon</a>


//---------------------------------------------------------------------
// Gloabl varibles
//---------------------------------------------------------------------

const seatGeekClientId = "NDA0MDIwNTl8MTcxMDQ2Nzk3NS41ODgwMzE";
const seatGeekSecretKey = "3dd594f6f71a3122b77bd6260492f8a4c175be74026a726c05a3642205615c1b";
var userLocation = {
  City: "Portland, OR",
  latitude: 45.523064,
  longitude: -122.676483
};
var events = [];
var eventPage = 1; // current event page counter
const eventsPerPage = 10;

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

//---------------------------------------------------------------------
// Function declarations
//---------------------------------------------------------------------
function updateEventList(){
  
  //Event count
  $('.eventCount').text(`${events.length} Events available`);
  
// Clear existing items from the list
  $('#eventList').empty();
  
  if (events.length == 0){
    // No events in area
    $('#eventList').append(`<li>No Events in your area.</li>`);
  } else {
    // Iterate through events and create list, per page.

    var index = 0;
    var min =  eventsPerPage * (eventPage - 1);
    var max =  eventsPerPage * eventPage;

    events.forEach( event => {
      if (index >= min && index <= max) {
        var li =  $(`<li> ${event.title} - ${event.type}</li>`);
        li.addClass(`eventItem`); 
        li.attr('value', index);
        $('#eventList').append(li);
      }
      selectEvent(min);
      index++;
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

    var index = 0;
    events.forEach( event => {
      // create custom icon for events


      var icon = L.icon ({
        iconSize: [60,60],
        iconAnchor: [ 30,30 ],
        popupAnchor: [0,0],
        iconUrl: `./assets/images/${eventIcon(event.type)}.png`
      });

      var coord = [event.venue.location.lat, event.venue.location.lon];
      
      
      var marker = L.marker( coord,
        {
          id: index,
          icon: icon} ).addTo(map)
        .bindTooltip(`${event.title}`, {sticky: false});
        
        // Show tooltip on marker hover
      marker.on('mouseover', function(e) {
        this.openTooltip();
      });

      // Hide tooltip when mouse leaves the marker
      marker.on('mouseout', function(e) {
        this.closeTooltip();
      });
    
      marker.on('click', function (e) {
        selectEvent(e.target.options.id);
      });

      // Save cooridinates
      coordinates.push(coord);
      index++;
    });

      // Get center of LatLngBounds object
    var mapCenter = L.latLngBounds(coordinates).getCenter();
  }
}

// show selected event in viewer
function selectEvent(id){
  var event = events[id];

  $('#eventTitle').text(event.title);
  $('#eventDescription').text(event.venue.name + ", " + event.venue.address);

  if (event.performers[0].image){
    $('#eventImage').attr(`src`, event.performers[0].image);
  } else {
    $('#eventImage').attr(`src`, `./assets/images/music-1357918_640.png`);
  
  }
  
  map.setView([events[id].venue.location.lat, events[id].venue.location.lon], 30)
  
  console.log(events[id]);
}


async function fetchEventsBySelect(city, state){
  var selector;
  const apiUrl = 'https://api.seatgeek.com/2/events';
  const startDate = new Date();
  const endDate = new Date();

  eventPage = 1; // reset page index for global event display

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
    'sort' : 'datetime_utc.asc',
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

        // Add events to array
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
    case "concert":
      result = type;
      break;
    case "soccer", "national_womens_soccer":
      result = "soccer";
      break;
    case "nba_dleague", "nba":
      result = "basketball";
      break;
    case "mls":
      result = "baseball";
      break;
    case "minor_league_hockey":
      result = "hockey";
      break;
    case "broadway_tickets_national", "comedy", "classical_opera":
      result = "theater";
      break;
  
      
    default:
      result = "tickets";
  }

  return result;
}

// Add click events to match index stored in valie of li item
$('#eventList').on('click', function(event) {
  // Check if the clicked element is an <li> element
  if (event.target.tagName === 'LI') {
    selectEvent(event.target.value);
  }
});

// Button click events
$('#next-button').on('click', function(event) {
  if (eventPage < events.length / eventsPerPage ) {
    eventPage++;
  }
  updateEventList();
});

$('#previous-button').on('click', function(event) {
  eventPage--;
  
  if (eventPage < 1) {
    eventPage = 1;
  }
  updateEventList();
});

// Run with null args to set user location.
fetchEventsBySelect("Portland", null);