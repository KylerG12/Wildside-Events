
    // Create a map centered on a specific location
    var map = L.map('map').setView([121.505, 47], 13);

    // Add the OpenStreetMap tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker to the map
    L.marker([51.5, -0.09]).addTo(map)
      .bindPopup('A sample location.')
      .openPopup();
  
      fetch('https://api.seatgeek.com/2/events?geoip=true&client_id=MzIyODkzMTZ8MTcxMDMwNDcxOS40ODQxOTE0', {
  // method: 'GET', //GET is the default.
  // credentials: 'same-origin', // include, *same-origin, omit
  // redirect: 'follow', // manual, *follow, error
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
  });
