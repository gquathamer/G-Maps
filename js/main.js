// eslint-disable-next-line no-undef
var map = L.map('map').setView([33.694975, -117.743969], 13);
// eslint-disable-next-line no-undef
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);
// eslint-disable-next-line no-undef
var markupLayer = L.geoJSON().addTo(map);
var $barContainer = document.querySelector('.bar-container');
var $map = document.querySelector('#map');
var $dropdownContainer = document.querySelector('.dropdown-container');
var $dropdownContainerDesktop = document.querySelector('.dropdown-container-desktop');
var $reverseGeocodeDesktopForm = document.forms[0];
var $directionsDesktopForm = document.forms[1];
var $poisDesktopForm = document.forms[2];
var $geocodeDesktopForm = document.forms[3];
var $geocodeForm = document.forms[4];
var $reverseGeocodeForm = document.forms[5];
var $directionsForm = document.forms[6];
var $poisForm = document.forms[7];
var $directionsButtonOnThePopup;
var $poiButtonOnThePopup;
var $getDirectionsMenu = document.querySelector('#directions-menu');
var $getDirectionsForm = document.querySelector('#directions-form');
var $getDirectionsMenuDesktop = document.querySelector('#directions-menu-desktop');
var $getDirectionsFormDesktop = document.querySelector('#directions-form-desktop');
var $poisMenu = document.querySelector('#pois-menu');
var $poisMenuDesktop = document.querySelector('#pois-menu-desktop');

map.addEventListener('click', function (event) {
  getReverseGeocode(event);
});

$barContainer.addEventListener('click', function () {
  toggleFormContainer();
});

$dropdownContainer.addEventListener('click', function (event) {
  if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'geocode-menu') {
    toggleGeocodeMenu();
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'reverse-geocode-menu') {
    toggleReverseGeocodeMenu();
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'directions-menu') {
    toggleDirectionsMenu();
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'pois-menu') {
    togglePOIsMenu();
  }
});

$dropdownContainerDesktop.addEventListener('click', function (event) {
  if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'reverse-geocode-menu-desktop') {
    toggleReverseGeocodeMenuDesktop();
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'directions-menu-desktop') {
    toggleDirectionsMenuDesktop();
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'pois-menu-desktop') {
    togglePOIsMenuDesktop();
  }
});

$geocodeForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getGeocode(event);
  $geocodeForm.reset();
});

$geocodeDesktopForm.addEventListener('submit', function () {
  event.preventDefault();
  getGeocode(event);
  $geocodeDesktopForm.reset();
});

$reverseGeocodeForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getReverseGeocode(event);
  $reverseGeocodeForm.reset();
});

$reverseGeocodeDesktopForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getReverseGeocode(event);
  $reverseGeocodeDesktopForm.reset();
});

$directionsForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getBestRouteDestinationAJAXRequest(event);
  $directionsForm.reset();
  $getDirectionsMenu.style.display = 'none';
  $getDirectionsForm.style.display = 'none';
});

$directionsDesktopForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getBestRouteDestinationAJAXRequest(event);
  $directionsDesktopForm.reset();
  $getDirectionsMenuDesktop.style.display = 'none';
  $getDirectionsFormDesktop.style.display = 'none';
});

$poisForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getPOIs(event);
  $poisForm.reset();
  $poisMenu.style.display = 'none';
  $poisForm.style.display = 'none';
});

$poisDesktopForm.addEventListener('submit', function (event) {
  event.preventDefault();
  data.eventTarget = event.target.id;
  getPOIs(event);
  $poisDesktopForm.reset();
  $poisMenuDesktop.style.display = 'none';
  $poisDesktopForm.style.display = 'none';
});

function toggleFormContainer() {
  if (window.getComputedStyle($map).display === 'block') {
    $map.style.display = 'none';
    $dropdownContainer.style.display = 'block';
  } else {
    $dropdownContainer.style.display = 'none';
    $map.style.display = 'block';
  }
}

function toggleGeocodeMenu() {
  if (window.getComputedStyle($geocodeForm).display === 'block') {
    $geocodeForm.style.display = 'none';
  } else {
    $geocodeForm.style.display = 'block';
    $reverseGeocodeForm.style.display = 'none';
  }
}

function toggleReverseGeocodeMenu() {
  if (window.getComputedStyle($reverseGeocodeForm).display === 'block') {
    $reverseGeocodeForm.style.display = 'none';
  } else {
    $reverseGeocodeForm.style.display = 'block';
    $geocodeForm.style.display = 'none';
  }
}

function toggleReverseGeocodeMenuDesktop() {
  if (window.getComputedStyle($reverseGeocodeDesktopForm).display === 'block') {
    $reverseGeocodeDesktopForm.style.display = 'none';
  } else {
    $reverseGeocodeDesktopForm.style.display = 'block';
  }
}

function toggleDirectionsMenu() {
  if (window.getComputedStyle($getDirectionsForm).display === 'block') {
    $getDirectionsForm.style.display = 'none';
  } else {
    $getDirectionsForm.style.display = 'block';
  }
}

function toggleDirectionsMenuDesktop() {
  if (window.getComputedStyle($getDirectionsFormDesktop).display === 'block') {
    $getDirectionsFormDesktop.style.display = 'none';
  } else {
    $getDirectionsFormDesktop.style.display = 'block';
  }
}

function togglePOIsMenu() {
  if (window.getComputedStyle($poisForm).display === 'block') {
    $poisForm.style.display = 'none';
  } else {
    $poisForm.style.display = 'block';
  }
}

function togglePOIsMenuDesktop() {
  if (window.getComputedStyle($poisDesktopForm).display === 'block') {
    $poisDesktopForm.style.display = 'none';
  } else $poisDesktopForm.style.display = 'block';
}

function createPopupContent() {
  var popupDiv = document.createElement('div');
  popupDiv.setAttribute('class', 'popup-div');
  var address = document.createElement('p');
  address.textContent = 'Address: ' + data.address;
  popupDiv.appendChild(address);
  var latitude = document.createElement('p');
  latitude.textContent = 'Latitude: ' + data.latitude;
  popupDiv.appendChild(latitude);
  var longitude = document.createElement('p');
  longitude.textContent = 'Longitude: ' + data.longitude;
  popupDiv.appendChild(longitude);
  var elevationData = document.createElement('p');
  elevationData.textContent = 'Elevation: ' + data.elevation + ' meters';
  popupDiv.appendChild(elevationData);
  var buttonDiv = document.createElement('div');
  buttonDiv.setAttribute('class', 'button-div');
  var directionsButton = document.createElement('button');
  directionsButton.setAttribute('id', 'directions-button');
  directionsButton.setAttribute('class', 'popup-button');
  directionsButton.textContent = 'Directions';
  buttonDiv.appendChild(directionsButton);
  var poiButton = document.createElement('button');
  poiButton.setAttribute('id', 'poi-button');
  poiButton.setAttribute('class', 'popup-button');
  poiButton.textContent = 'POI';
  buttonDiv.appendChild(poiButton);
  popupDiv.appendChild(buttonDiv);
  return popupDiv;
}

function displayPopupContent() {
  markupLayer.clearLayers();
  markupLayer.unbindPopup();
  markupLayer.addData(data.geoJSON);
  markupLayer.bindPopup(createPopupContent());
  if (data.eventTarget === 'geocode-form') {
    toggleFormContainer();
  } else if (data.eventTarget === 'reverse-geocode-form') {
    toggleFormContainer();
  }
  markupLayer.openPopup();
  $directionsButtonOnThePopup = document.querySelector('#directions-button');
  $poiButtonOnThePopup = document.querySelector('#poi-button');
  $directionsButtonOnThePopup.addEventListener('click', function (event) {
    displayBestRouteForm();
  });
  $poiButtonOnThePopup.addEventListener('click', function (event) {
    displayPOIForm();
  });
  map.setView(markupLayer.getLayers()[0]._latlng, 13);
}

function displayBestRouteForm() {
  if (window.getComputedStyle($dropdownContainerDesktop).display === 'block') {
    $getDirectionsMenuDesktop.style.display = 'flex';
    $getDirectionsFormDesktop.style.display = 'block';
    document.querySelector('#start-desktop').value = data.address;
  } else {
    if (window.getComputedStyle($map).display === 'block') {
      $map.style.display = 'none';
      $dropdownContainer.style.display = 'block';
    } else {
      $map.style.display = 'block';
      $dropdownContainer.style.display = 'none';
    }
    if (window.getComputedStyle($getDirectionsMenu).display !== 'flex') {
      $getDirectionsMenu.style.display = 'flex';
    }
    if (window.getComputedStyle($getDirectionsForm).display !== 'flex') {
      $getDirectionsForm.style.display = 'block';
    }
  }
  document.querySelector('#start').value = data.address;
}

function displayPOIForm() {
  if (window.getComputedStyle($dropdownContainerDesktop).display === 'block') {
    $poisMenuDesktop.style.display = 'flex';
    $poisDesktopForm.style.display = 'block';
  } else {
    if (window.getComputedStyle($map).display === 'block') {
      $map.style.display = 'none';
      $dropdownContainer.style.display = 'block';
    } else {
      $map.style.display = 'block';
      $dropdownContainer.style.display = 'none';
    }
    if (window.getComputedStyle($poisMenu).display !== 'flex') {
      $poisMenu.style.display = 'flex';
    }
    if (window.getComputedStyle($poisForm).display !== 'block') {
      $poisForm.style.display = 'block';
    }
  }
}

function getOpenRoutesJSON(url, params, callback) {
  var xhr = new XMLHttpRequest();
  var searchParams = new URLSearchParams(params);
  searchParams.set('api_key', '5b3ce3597851110001cf62489e44bfb8d57d4a17b815aa9f855e19da');
  var ajaxURL = new URL('https://api.openrouteservice.org' + url + '?' + searchParams.toString());
  xhr.open('GET', ajaxURL.toString());
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    callback(xhr.response);
  });
  xhr.send();
}

function getGeocode(event, startCoordinates) {
  var submittedAddress;
  data.eventTarget = event.target.id;
  if (event.target.id === 'geocode-desktop-form') {
    submittedAddress = $geocodeDesktopForm.elements.address.value;
  } else {
    submittedAddress = $geocodeForm.elements.address.value;
  }
  getOpenRoutesJSON('/geocode/search', { text: submittedAddress }, function (response, startCoordinates) {
    data.latitude = response.features[0].geometry.coordinates[1];
    data.longitude = response.features[0].geometry.coordinates[0];
    data.address = response.features[0].properties.label;
    data.geoJSON = response.features[0];
    getElevationAJAXRequest();
  });
}

function getElevationAJAXRequest() {
  getOpenRoutesJSON('/elevation/point', { geometry: data.longitude + ',' + data.latitude }, function (response) {
    data.elevation = response.geometry.coordinates[2];
    displayPopupContent();
  });
}

function getReverseGeocode(event) {
  var submittedLatLng = [];
  data.eventTarget = event.target.id;
  if (event.target.id === 'reverse-geocode-form-desktop') {
    submittedLatLng.push($reverseGeocodeDesktopForm.elements.latitude.value);
    submittedLatLng.push($reverseGeocodeDesktopForm.elements.longitude.value);
  } else if (event.target.id === 'reverse-geocode-form') {
    submittedLatLng.push($reverseGeocodeForm.elements.latitude.value);
    submittedLatLng.push($reverseGeocodeForm.elements.longitude.value);
  } else {
    submittedLatLng.push(event.latlng.lat);
    submittedLatLng.push(event.latlng.lng);
  }
  getOpenRoutesJSON('/geocode/reverse', { 'point.lat': submittedLatLng[0], 'point.lon': submittedLatLng[1] }, function (response) {
    data.latitude = response.features[0].geometry.coordinates[1];
    data.longitude = response.features[0].geometry.coordinates[0];
    data.address = response.features[0].properties.label;
    data.geoJSON = response.features[0];
    getElevationAJAXRequest();
  });
}

function getBestRouteDestinationAJAXRequest(event) {
  if (data.eventTarget === 'directions-form') {
    data.address = $directionsForm.elements.destination.value;
  } else {
    data.address = $directionsDesktopForm.elements.destination.value;
  }
  var startCoordinates = [];
  startCoordinates.push(data.latitude);
  startCoordinates.push(data.longitude);
  getOpenRoutesJSON('/geocode/search', { text: data.address }, function (response) {
    var routeParameters = {
      start: startCoordinates[1] + ',' + startCoordinates[0],
      end: response.features[0].geometry.coordinates[0] + ',' + response.features[0].geometry.coordinates[1]
    };
    getOpenRoutesJSON('/v2/directions/driving-car', routeParameters, function (response) {
      markupLayer.closePopup();
      markupLayer.clearLayers();
      markupLayer.unbindPopup();
      markupLayer.addData(response.features[0]);
      map.fitBounds(markupLayer.getBounds());
      var routeCoordinates = response.features[0].geometry.coordinates;
      // eslint-disable-next-line no-undef
      markupLayer.addData(L.marker([routeCoordinates[0][1], routeCoordinates[0][0]]).toGeoJSON());
      // eslint-disable-next-line no-undef
      markupLayer.addData(L.marker([routeCoordinates[routeCoordinates.length - 1][1], routeCoordinates[routeCoordinates.length - 1][0]]).toGeoJSON());
    });
    if (data.eventTarget === 'directions-form') {
      toggleFormContainer();
    }
  });
}

function getPOIs(event) {
  var bufferDistance;
  if (data.eventTarget === 'pois-form') {
    bufferDistance = event.target.elements.buffer.value;
  } else {
    bufferDistance = event.target.elements['buffer-desktop'].value;
  }
  var requestBody = { request: 'pois', geometry: { geojson: { type: 'Point', coordinates: [data.longitude, data.latitude] }, buffer: bufferDistance } };
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.openrouteservice.org/pois');
  xhr.setRequestHeader('authorization', '5b3ce3597851110001cf62489e44bfb8d57d4a17b815aa9f855e19da');
  xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {

  });
  xhr.send(JSON.stringify(requestBody));
}
