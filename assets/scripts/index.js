
//---------------------------------------------------------------------
// Wildside Events - index.js
//
// This code calls three APIs to support this project
//
// please note the following immage attribution used in the icons 
//    Attribution for images to be implimented later
//    <a href="https://www.flaticon.com/free-icons/concert" title="concert icons">Concert icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/football" title="football icons">Football icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/nba" title="nba icons">Nba icons created by amoghdesign - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/validating-ticket" title="validating ticket icons">Validating ticket icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/sport" title="sport icons">Sport icons created by mavadee - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/baseball" title="baseball icons">Baseball icons created by Smashicons - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/ice-hockey" title="ice hockey icons">Ice hockey icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/theater" title="theater icons">Theater icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/beer" title="beer icons">Beer icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/beer-bottle" title="beer bottle icons">Beer bottle icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/brewery" title="brewery icons">Brewery icons created by Freepik - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/brewery" title="brewery icons">Brewery icons created by Flat Icons - Flaticon</a>
//    <a href="https://www.flaticon.com/free-icons/brewery" title="brewery icons">Brewery icons created by wanicon - Flaticon</a>
//---------------------------------------------------------------------

//---------------------------------------------------------------------
// Gloabl Declarations
//---------------------------------------------------------------------
const appName = "WildSideEvents";

// API calls
const locationUrl = "https://ipinfo.io/json";
const seatGeekClientId = "NDA0MDIwNTl8MTcxMDQ2Nzk3NS41ODgwMzE";
const seatGeekSecretKey =
  "3dd594f6f71a3122b77bd6260492f8a4c175be74026a726c05a3642205615c1b";
const seatgeekUrl = "https://api.seatgeek.com/2/events";

const openBreweryApi = "https://api.openbrewerydb.org/breweries";

// Glabal varibles
var userLocation = {
  city: "",
  state: "",
  latitude: 0,
  longitude: 0,
};

var events = [];
var eventPage = 1; // current event page counter
const eventsPerPage = 7;
var breweries = [];
var breweriesPage = 1; // current breweries page counter
const breweriesPerPage = 7;

// Create a map from leaflet library
var map = L.map("map");
var markers = [];

// Add the google satalite map tile layer to the map
L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  maxZoom: 22,
  maxNativeZoom: 20,
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
}).addTo(map);

// User icon comes from
// https://www.flaticon.com/free-icons/question, Question icons created by Freepik
var userIcon = L.icon({
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [30, 30],
  iconUrl: "./assets/images/question.png",
});

//---------------------------------------------------------------------
// Function declarations
//---------------------------------------------------------------------
function updateBreweryList() {
  //Event count
  $(".breweryCount").text(
    `${breweries.length} Breweries available`
  );

  // Clear existing items from the list
  $("#breweryList").empty();

  if (breweries.length == 0) {
    // No events in area
    $("#breweryList").append(`<li>No Breweries in your area.</li>`);
    $("#breweryListControls").hide();
    
  } else {
    // Iterate through Breweries and create list, per page.
    $("#breweryListControls").show();
    
    var index = 0;
    var min = breweriesPerPage * (breweriesPage - 1);
    var max = breweriesPerPage * breweriesPage;

    breweries.forEach((brewery) => {
      if (index >= min && index <= max) {
        var li = $(`<li> ${brewery.name} - ${brewery.brewery_type}</li>`);
        li.addClass(`breweryItem`);
        li.attr("value", "brewery" + index);

        li.click(function () {
          selectEvent($(this).attr("value"));
        });

        $("#breweryList").append(li);
      }
      selectEvent(min);
      index++;
    });
  }

  $("#breweryPageCount").text(
    `Page ${breweriesPage} of ${Math.ceil(breweries.length / breweriesPerPage)}`
  );
}

function updateEventList() {
  //Event count
  $(".eventCount").text(
    `${events.length} events available`
  );

  // Clear existing items from the list
  $("#eventList").empty();

  if (events.length == 0) {
    // No events in area
    $("#eventList").append(`<li>No Events in your area.</li>`);
    $("#eventListControls").hide();
    selectEvent(`clear`);
  } else {
    // Iterate through events and create list, per page.
    $("#eventListControls").show();
    var index = 0;
    var min = eventsPerPage * (eventPage - 1);
    var max = eventsPerPage * eventPage;

    events.forEach((event) => {
      if (index >= min && index <= max) {
        var li = $(`<li> ${event.title} - ${event.type}</li>`);
        li.addClass(`eventItem`);
        li.attr("value", "event" + index);

        li.click(function () {
          selectEvent($(this).attr("value"));
        });

        $("#eventList").append(li);
      }
      selectEvent(min);
      index++;
    });
    $("#eventPageCount").text(
      `Page ${eventPage} of ${Math.ceil(events.length / eventsPerPage)}`
    );
  }
  updateBreweryList();
}

// Update map function
async function updateMap() {
  var marker;
  var bounds = new L.LatLngBounds();

  // Remove old markers first
  markers.forEach(function (marker) {
    map.removeLayer(marker);
  });

  // add events markers
  if (events.length > 0) {
    // Create markers for each event

    var index = 0;
    events.forEach((event) => {
      // create custom icon for events

      var icon = L.icon({
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        popupAnchor: [0, 0],
        iconUrl: `./assets/images/${eventIcon(event.type)}.png`,
      });

      var coord = [event.venue.location.lat, event.venue.location.lon];

      marker = L.marker(coord, {
        id: "event" + index,
        icon: icon,
      })
        .addTo(map)
        .bindTooltip(`${event.title}`, { sticky: false });

      // Create bound to emcompass all marker positions
      bounds.extend(marker.getLatLng());

      // Show tooltip on marker hover
      marker.on("mouseover", function (e) {
        this.openTooltip();
      });

      // Hide tooltip when mouse leaves the marker
      marker.on("mouseout", function (e) {
        this.closeTooltip();
      });

      marker.on("click", function (e) {
        selectEvent(e.target.options.id);
      });

      markers.push(marker);
      index++;
    });

    map.fitBounds(bounds);
  }

  // Add brewery markers
  if (breweries.length > 0) {
    // Create markers for each event

    var index = 0;
    breweries.forEach((brewery) => {
      // create custom icon for events

      var icon = L.icon({
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        popupAnchor: [0, 0],
        iconUrl: `./assets/images/${breweryIcon(brewery.brewery_type)}.png`,
      });

      // Ignore items with lat lon
      if (brewery.latitude && brewery.longitude) {
        var coord = [brewery.latitude, brewery.longitude];

        marker = L.marker(coord, {
          id: "brewery" + index,
          icon: icon,
        })
          .addTo(map)
          .bindTooltip(`${brewery.name}`, { sticky: false });

        // Create bound to emcompass all marker positions
        bounds.extend(marker.getLatLng());

        // Show tooltip on marker hover
        marker.on("mouseover", function (e) {
          this.openTooltip();
        });

        // Hide tooltip when mouse leaves the marker
        marker.on("mouseout", function (e) {
          this.closeTooltip();
        });

        marker.on("click", function (e) {
          selectEvent(e.target.options.id);
        });

        markers.push(marker);
        index++;
      }
    });

    map.fitBounds(bounds);

    
    //Update user location to footer
    $("#location").text(
    //  `Activities in ${userLocation.city}, ${userLocation.state}`
    );
  }

  if (events.length == 0 && breweries.length == 0) {
    // Create question icon for maps that have no markers

    // Add a marker for user location

    marker = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: userIcon,
    }).addTo(map);

    bounds.extend(marker.getLatLng());

    markers.push(marker);

    map.fitBounds(bounds);
  }
}

// show selected event in viewer
function selectEvent(id) {
  var item = new String(id);

  // Clear old event data 
  if (item == 'clear') {
    $("#selectedTitle").text(`Looking into`);
    $("#selectedDescription").text(userLocation.city);
    $("#selectedAddress").text(`${userLocation.state}`);
    $("#selectedCity").text(``);
    $("#ticketsButton").hide();
    
    $("#eventImage").attr(`src`, `./assets/images/cheers-204742_640.jpg`);
    $("#imageCaption").attr(`href`, `https://pixabay.com/users/geralt-9301/`);
    $("#imageCaption").text(`Photo by geralt`);
  }

  // Set event
  if (item.includes("event")) {
    var event = events[item.replace("event", "")];

    $("#selectedTitle").text(`${event.title} - ${event.type}`);
    $("#selectedDescription").text(event.venue.name);
    $("#selectedAddress").text(`${event.venue.address}`);
    $("#selectedCity").text(`${event.venue.extended_address}`);

    if (event.performers[0].image) {
      $("#eventImage").attr(`src`, event.performers[0].image);
      $("#imageCaption").attr(`href`, event.performers[0].image_attribution);
      $("#imageCaption").text(event.performers[0].image_license);
      imageCaption;
    } else {
      $("#eventImage").attr(`src`, `./assets/images/cheers-204742_640.jpg`);
      $("#imageCaption").attr(`href`, `https://pixabay.com/users/geralt-9301/`);
      $("#imageCaption").text(`Photo by geralt`);
    }
    $("#ticketsButton").show();
    $("#modal-image").attr("src", event.performers[0].image);
    $("#listEventTitle").text(event.title);
    var eventTime = dayjs(event.datetime_local);
    $("#listEventDate").text(eventTime.format("dddd, MMMM D, h:mm A"));
    $("#ticketAverage").text(
      "Average cost: $" + (event.stats.average_price || "TBD")
    );
    $("#ticketLowest").text(
      "Lowest cost: $" + (event.stats.lowest_price || "TBD")
    );
    $("#modalButtonLink").attr("href", event.url);
    

    var coord = [event.venue.location.lat, event.venue.location.lon];

    map.setView(coord, 30);

    return;
  }

  if (item.includes("brewery")) {
    var brewery = breweries[new Number(item.replace("brewery", ""))];

    $("#selectedTitle").text(brewery.name);
    $("#selectedDescription").text(brewery.brewery_type);

    $("#selectedAddress").text(`${brewery.street}`);
    $("#selectedCity").text(
      `${brewery.city}, ${brewery.state} ${brewery.postal_code} Phone:` +
        (brewery.phone || "None")
    );

    $("#eventImage").attr(
      `src`,
      `./assets/images/${breweryIcon(brewery.brewery_type)}.png`
    );

    $("#imageCaption").text(``);

    $(`#ticketsButton`).hide();

    map.setView([brewery.latitude, brewery.longitude], 30);
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
    const [latitude, longitude] = data.loc.split(",").map(parseFloat);
    return { latitude, longitude, city, state };
  } catch (error) {
    console.error("Error fetching user location:", error);
    return null;
  }
}

// Fetch breweries by city
// Pushes results into:  breweries
async function fetchBreweries() {
  try {
    const response = await fetch(
      `${openBreweryApi}?by_city=${userLocation.city}&by_state=${userLocation.state}`
    );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching brewery:", error);
    return null;
  }
}

// Fetch events by city and state
// Pushes results into:  events
async function getEvents() {
  var selector;
  const startDate = new Date();
  const endDate = new Date();

  eventPage = 1; // reset page index for global event display

  // Clear events list
  events = [];

  // Set to a week of events
  endDate.setDate(endDate.getDate() + 7);

  const params = {
    client_id: seatGeekClientId,
    client_secret: seatGeekSecretKey,
    "venue.city": userLocation.city,
    "venue.state": getStateAbbr(userLocation.state),
    per_page: 50,
    sort: "datetime_utc.asc",
    "datetime_local.gte": startDate.toISOString().split("T")[0], // Start date in ISO format (YYYY-MM-DD)
    "datetime_local.lte": endDate.toISOString().split("T")[0], // End date in ISO format (YYYY-MM-DD)
    page: 1, // Page number, start with 1
  };

  // Function to fetch events
  async function fetchEvents() {
    try {
      // Fetch the first page of events
      let response = await fetch(
        seatgeekUrl + "?" + new URLSearchParams(params)
      );
      let data = await response.json();

      // save user locations
      if (data.meta.geolocation != null) {
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
        // select first item in list
      $("#eventList li:first").trigger('click');

      updateMap();

    } catch (error) {}
  }

  fetchEvents();
}

function getBreweries() {
  breweriesPage = 1; // reset page index for global event display
  breweries = [];

  fetchBreweries()
    .then((results) => {
      if (results && results.length > 0) {
        results.forEach((brewery) => {
          breweries.push(brewery);
        });
      } else {
        console.log(`No breweries found`);
      }
    })
    .catch((error) => console.error("Error:", error));

  updateMap();
}

// Function to return icon for event
function eventIcon(type) {
  var result;

  switch (type) {
    case "concert":
      result = type;
      break;
    case ("soccer", "national_womens_soccer"):
      result = "soccer";
      break;
    case ("nba_dleague", "nba"):
      result = "basketball";
      break;
    case "mls":
      result = "baseball";
      break;
    case "minor_league_hockey":
      result = "hockey";
      break;
    case ("broadway_tickets_national", "comedy", "classical_opera"):
      result = "theater";
      break;

    default:
      result = "tickets";
  }

  return result;
}

function breweryIcon(type) {
  var result;

  switch (type) {
    case "micro":
      result = "beer-bottle";
      break;
    case "brewpub":
      result = "barrel";
      break;
    case "closed":
      result = "beer-tap";
      break;
    default:
      result = "beer";
  }

  return result;
}

//---------------------------------------------------------------------
// Event Handlers
//---------------------------------------------------------------------

// Add click events to match index stored in valie of li item

// Button click events
$("#eventNextButton").on("click", function (event) {
  if (eventPage < events.length / eventsPerPage) {
    eventPage++;
  }

  updateEventList();

  // select first item in list
  $("#eventList li:first").trigger('click');
});

$("#eventPreviousButton").on("click", function (event) {
  eventPage--;

  if (eventPage < 1) {
    eventPage = 1;
  }

  updateEventList();

  // select first item in list
  $("#eventList li:first").trigger('click');

});

$("#breweryNextButton").on("click", function (event) {
  if (breweriesPage < breweries.length / breweriesPerPage) {
    breweriesPage++;
  }

  updateBreweryList();

  // select first item in list
  $("#breweryList li:first").trigger('click');

});

$("#breweryPreviousButton").on("click", function (event) {
  breweriesPage--;

  if (breweriesPage < 1) {
    breweriesPage = 1;
  }

  updateBreweryList();

  // select first item in list
  $("#breweryList li:first").trigger('click');

});

$("#next-button").on("click", function (event) {
  if (eventPage < events.length / eventsPerPage) {
    eventPage++;
  }
  updateEventList();
});

$("#previous-button").on("click", function (event) {
  eventPage--;

  if (eventPage < 1) {
    eventPage = 1;
  }
  updateEventList();
});

$("#states").on("change", async function (event) {
  userLocation.state = $(this).val();
  populateCityList();
  userLocation.city = $("#cities").val();

  await getEvents();
  await getBreweries();

  localStorage.setItem(
    appName,
    JSON.stringify([userLocation.state, userLocation.city])
  );
});

$("#cities").on("change", async function (event) {
  var location = [];

  userLocation.city = $(this).val();

  location = getCityLocation(userLocation.state, userLocation.city);
  userLocation.latitude = location[0];
  userLocation.longitude = location[1];

  await getEvents();
  await getBreweries();

  localStorage.setItem(
    appName,
    JSON.stringify([userLocation.state, userLocation.city])
  );
});

$("#ticketsButton").on("click", function (event) {
  openModal();
});

//---------------------------------------------------------------------
// Entry Point
//---------------------------------------------------------------------

async function main() {
  // Get current user location
  await fetchUserLocation().then(({ latitude, longitude, city, state }) => {
    if (latitude && longitude && city && state) {
      userLocation.latitude = latitude;
      userLocation.longitude = longitude;
      userLocation.city = city;
      userLocation.state = state;
    } else {
      console.log("Unable to determine user location.");
      return null;
    }
  });

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
//Modal Logic
var pressedX = document.getElementsByClassName("modal-close");
var modal = document.getElementsByClassName("modal-main");
function closeModal() {
  modal[0].classList.remove("is-active");
}
function openModal() {
  modal[0].classList.add("is-active");
}

pressedX[0].addEventListener("click", closeModal);

main();
