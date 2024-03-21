//TODO: add page counter on events and brewerys
// loading page

//---------------------------------------------------------------------
// TODO: need to aaatribute the following icons
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
//<a href="https://www.flaticon.com/free-icons/beer" title="beer icons">Beer icons created by Freepik - Flaticon</a>
// <a href="https://www.flaticon.com/free-icons/beer-bottle" title="beer bottle icons">Beer bottle icons created by Freepik - Flaticon</a>
//scottalananthony pixabay.com https://pixabay.com/photos/bar-liquid-diet-beverage-liquid-4769520/

//---------------------------------------------------------------------
// Gloabl Declarations
//---------------------------------------------------------------------

const appName = 'WildSideEvents';
// API calls
const locationUrl = 'https://ipinfo.io/json'

const seatGeekClientId = "NDA0MDIwNTl8MTcxMDQ2Nzk3NS41ODgwMzE";
const seatGeekSecretKey = "3dd594f6f71a3122b77bd6260492f8a4c175be74026a726c05a3642205615c1b";
const seatgeekUrl = 'https://api.seatgeek.com/2/events';

const openBreweryApi = "https://api.openbrewerydb.org/breweries";

// 
var userLocation = {
  city: "",
  state: "",
  latitude: 0,
  longitude: 0
};

var events = [];
var eventPage = 1; // current event page counter
const eventsPerPage = 10;
var breweries = [];
var breweriesPage = 1; // current breweries page counter
const breweriesPerPage = 10;

 // Create a map from leaflet library
var map = L.map('map')
var markers = [];

// Add the OpenStreetMap tile layer to the map
/*
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/

L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 22,
    maxNativeZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

// User icon comes from 
// https://www.flaticon.com/free-icons/question, Question icons created by Freepik
var userIcon = L.icon ({
  iconSize: [60,60],
  iconAnchor: [ 30,30 ],
  popupAnchor: [30,30],
  iconUrl: "./assets/images/question.png"
});


//---------------------------------------------------------------------
// Function declarations
//---------------------------------------------------------------------
function updateBreweryList(){
  
  //Event count
  $('.breweryCount').text(`${breweries.length} Breweries available in ${userLocation.city},${userLocation.state}`);
  
// Clear existing items from the list
  $('#breweryList').empty();
  
  if (breweries.length == 0){
    // No events in area
    $('#breweryList').append(`<li>No Breweries in your area.</li>`);
  } else {
    // Iterate through Breweries and create list, per page.
    
    var index = 0;
    var min =  breweriesPerPage * (breweriesPage - 1);
    var max =  breweriesPerPage * breweriesPage;

    breweries.forEach( brewery => {
      if (index >= min && index <= max) {
        var li =  $(`<li> ${brewery.name} - ${brewery.brewery_type}</li>`);
        li.addClass(`breweryItem`); 
        li.attr('value', "brewery" + index);
      
        li.click(function() {
          selectEvent( $(this).attr('value'));
        });

        $('#breweryList').append(li);
        
      }
      selectEvent(min);
      index++;
    });
    
    
  }
}

function updateEventList(){
  
  //Event count
  $('.eventCount').text(`${events.length} Events available in ${userLocation.city},${userLocation.state}`);
  
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
        li.attr('value', "event" + index);
      
        li.click(function() {
          selectEvent( $(this).attr('value'));
        });

        $('#eventList').append(li);
        
      }
      selectEvent(min);
      index++;
    });
    
  }
}

// Update map function
async function updateMap(){
  var marker;
  var bounds = new L.LatLngBounds();
  
  // Remove old markers first
  markers.forEach( function(marker){
    map.removeLayer(marker);
  });
  
    // add events markers
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
      
      marker = L.marker( coord,
        {
          id: "event" + index,
          icon: icon} ).addTo(map)
        .bindTooltip(`${event.title}`, {sticky: false});

      // Create bound to emcompass all marker positions
      bounds.extend(marker.getLatLng());

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

      markers.push(marker);
      index++;
    });

    map.fitBounds(bounds)
  }
  
  // Add brewery markers
  if (breweries.length > 0) {
    // Create markers for each event

    var index = 0;
    breweries.forEach( brewery => {
      // create custom icon for events

      var icon = L.icon ({
        iconSize: [60,60],
        iconAnchor: [ 30,30 ],
        popupAnchor: [0,0],
        iconUrl: `./assets/images/beer.png`
      });

      // Ignore items with lat lon
      if (brewery.latitude && brewery.longitude) {
        var coord = [brewery.latitude, brewery.longitude];
        
        marker = L.marker( coord,
          {
            id: "brewery" + index,
            icon: icon} ).addTo(map)
          .bindTooltip(`${brewery.name}`, {sticky: false});

        // Create bound to emcompass all marker positions
        bounds.extend(marker.getLatLng());

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

        markers.push(marker);
        index++;
      }
      });

    map.fitBounds(bounds);

    //Update user location to footer
    $('#location').text(`Activities in ${userLocation.city}, ${userLocation.state}` );


  }
  
  if (events.length == 0 && breweries.length == 0 ){
    // Create question icon for maps that have no markers  
    
      // Add a marker for user location
      
      marker = L.marker(
        [userLocation.latitude, userLocation.longitude],
        {icon: userIcon}
      ).addTo(map);

      bounds.extend(marker.getLatLng());

      markers.push(marker);

      map.fitBounds(bounds)
    
  }
}

// show selected event in viewer
function selectEvent(id){
  var item = new String(id);
  
  
  // Set event 
  if (item.includes('event') ) {
    var event = events[item.replace('event','')];
    
    $('#selectedTitle').text(event.title);
    $('#selectedDescription').text(event.venue.name + ", " + event.venue.address);

    if (event.performers[0].image){
      $('#eventImage').attr(`src`, event.performers[0].image);
      $('#imageCaption').attr(`href`, event.performers[0].image_attribution);
      $('#imageCaption').text(event.performers[0].image_license);
      imageCaption
    } else {
      $('#eventImage').attr(`src`, `./assets/images/music-1357918_640.png`);
      $('#imageCaption').attr(`href`, `https://pixabay.com/illustrations/music-dance-abstract-clip-art-1357918/`);
      $('#imageCaption').text(`Photo by ArtsyBee`);
    
    }
    var coord = [event.venue.location.lat,event.venue.location.lon];
    map.setView(coord, 30)
    return;
  }
  
  if ( item.includes('brewery')){
    
    var brewery = breweries[new Number(item.replace('brewery',''))];
    
    
    
    $('#selectedTitle').text(brewery.name);
    $('#selectedDescription').text(brewery.brewery_type);

    // TODO need image option for breweryies
    
      $('#eventImage').attr(`src`, `./assets/images/bar-4769520_640.jpg`);
      $('#imageCaption').attr(`href`, `https://pixabay.com/photos/bar-liquid-diet-beverage-liquid-4769520/`);
      $('#imageCaption').text(`Photo by scottalananthony`);
    
    
    
    map.setView([brewery.latitude, brewery.longitude], 30)
    return;
  } 

}

//---------------------------------------------------------------------
// Fetch functions
//---------------------------------------------------------------------

async function fetchUserLocation() {
  try {
      const response = await fetch(locationUrl);
      const data = await response.json();
      const city = data.city;
      const state = data.region;
      const [latitude, longitude] = data.loc.split(',').map(parseFloat);
      return {  latitude, longitude, city, state };
  } catch (error) {
      console.error('Error fetching user location:', error);
      return null;
  }
}


// Fetch breweries by city
// Pushes results into:  breweries
async function fetchBreweries() {
  
  try {
      const response = await fetch(`${openBreweryApi}?by_city=${userLocation.city}&by_state=${userLocation.state}`);

      const data = await response.json();
      
      return data;
  } catch (error) {
      console.error('Error fetching brewery:', error);
      return null;
  }

}


// Fetch events by city and state
// Pushes results into:  events
async function getEvents(){
  var selector;
  const startDate = new Date();
  const endDate = new Date();

  eventPage = 1; // reset page index for global event display
  
  // Clear events list
  events = [];
  
  // Set to a week of events
  endDate.setDate(endDate.getDate() + 7);

  const params = {
    'client_id': seatGeekClientId, 
    'client_secret' : seatGeekSecretKey,
    'venue.city' : userLocation.city,
    'venue.state' : getStateAbbr(userLocation.state),
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
        let response = await fetch(seatgeekUrl + '?'  + new URLSearchParams(params));
        let data = await response.json();
        
        // save user locations
        if( data.meta.geolocation != null ){
          userLocation.city = data.meta.geolocation.display_name;
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
        updateBreweryList();
        updateMap();
    } catch (error) {
    }
  }
  
  fetchEvents();
  
}



function getBreweries(){

  breweriesPage = 1; // reset page index for global event display
  breweries = [];

  fetchBreweries()
  .then(results => {
      if (results && results.length > 0) {
        results.forEach(brewery => {
            breweries.push(brewery);
          });
      } else {
          console.log(`No breweries found`);
      }
  })
  .catch(error => console.error('Error:', error));
 
  updateMap();

}


// Function to return icon for event
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


//---------------------------------------------------------------------
// Event Handlers
//---------------------------------------------------------------------

// Add click events to match index stored in valie of li item


// Button click events
$('#eventNextButton').on('click', function(event) {
  if (eventPage < events.length / eventsPerPage ) {
    eventPage++;
  }
  updateEventList();
});

$('#eventPreviousButton').on('click', function(event) {
  eventPage--;
  
  if (eventPage < 1) {
    eventPage = 1;
  }
  updateEventList();
});

$('#breweryNextButton').on('click', function(event) {
  if (breweriesPage < breweries.length / breweriesPerPage ) {
    breweriesPage++;
  }
  updateBreweryList();
});

$('#breweryPreviousButton').on('click', function(event) {
  breweriesPage--;
  
  if (breweriesPage < 1) {
    breweriesPage = 1;
  }
  updateBreweryList();
});


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

$('#states').on('change', async function(event) {
  
  userLocation.state = $(this).val();
  populateCityList();
  userLocation.city = $("#cities").val();
  
  await getEvents();
  await getBreweries();
  
  localStorage.setItem(appName, JSON.stringify([userLocation.state, userLocation.city]))
});

$('#cities').on('change', async function(event) {
  var location = [];

  
  userLocation.city = $(this).val();
  
  location =  getCityLocation( userLocation.state, userLocation.city);
  userLocation.latitude = location[0];
  userLocation.longitude = location[1];
  
  await getEvents();
  await getBreweries();

  localStorage.setItem(appName, JSON.stringify([userLocation.state, userLocation.city]))
});


//---------------------------------------------------------------------
// Entry Point
//---------------------------------------------------------------------

async function main(){

  // Get current user location
  await fetchUserLocation()
  .then(({ latitude, longitude, city, state }) => {
      if (latitude && longitude && city && state) {
          userLocation.latitude = latitude;
          userLocation.longitude = longitude;
          userLocation.city = city;
          userLocation.state = state;
      } else {
          // TODO: needs call to tell cannot find user location in modal dialog
          console.log('Unable to determine user location.');
          return null;
      }
  })

  // Override userlocation if there is saved location
  var lastCity = getLastCity();
  var lastState = getLastState();

  if (lastCity) {
    userLocation.city = lastCity;
  }

  if (lastState) {
    userLocation.state = lastState;
  }

  // Populate dropdowns
  populateStateList(userLocation.state);
  populateCityList(userLocation.city);

  // Get event by user locations
  await getEvents();
  await getBreweries();
  
  

}

main();









