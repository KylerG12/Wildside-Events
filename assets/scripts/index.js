
// Gloabl varibles
const seatGeekClientId = "NDA0MDIwNTl8MTcxMDQ2Nzk3NS41ODgwMzE";
const seatGeekSecretKey = "3dd594f6f71a3122b77bd6260492f8a4c175be74026a726c05a3642205615c1b";
var userLocation = {
  City: "Portland, OR",
  latitude: 45.523064,
  longitude: -122.676483,
};
var map = L.map('map') // Create a map from leaflet library

//<a target="_blank" href="https://icons8.com/icon/9vrl4rG9wDf4/person">Person</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
var userIcon = L.icon ({
  iconSize: [43,43],
  iconAnchor: [ 21,21 ],
  popupAnchor: [21,21],
  iconUrl: "./assets/images/icons8-person-48.png"


});



// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



// Update map function
function updateMap(){

  map.setView([userLocation.latitude, userLocation.longitude], 13);
  
  // Remove old markers first
  map.eachLayer( function(layer){
    if (layer instanceof L.marker){
      map.removeLayer(layer);
    }
  });

  // Add a marker for user location
  var marker = L.marker(
    [userLocation.latitude, userLocation.longitude],
    {icon: userIcon}).addTo(map);
}


async function fetchUserLocation(){

  try {
    const response = await fetch( "https://api.seatgeek.com/2/events?geoip=true&client_id="+ seatGeekClientId + "&client_secret=" + seatGeekSecretKey);
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


async function getUserLocation(){

fetchUserLocation()
    .then(data => {
      userLocation.City = data.meta.geolocation.display_name;
      userLocation.latitude = data.meta.geolocation.lat;
      userLocation.longitude = data.meta.geolocation.lon;
      updateMap();      
    })
    .catch (error =>{
      return error;
    });

}

getUserLocation();




