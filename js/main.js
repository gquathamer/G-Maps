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
// var $map = document.querySelector('#map');
var $dropdownContainer = document.querySelector('.dropdown-container');
var $geocodeForm = document.querySelector('#geocode-form');
var $reverseGeocodeForm = document.querySelector('#reverse-geocode-form');
var $directionsForm = document.querySelector('#directions-form');
var $poisForm = document.querySelector('#pois-form');
var $loaderContainer = document.querySelector('.loader-container');
var $directionsButtonOnThePopup;
var $poiButtonOnThePopup;
var radius = document.querySelector('#buffer');
var radiusError = document.querySelector('#buffer + span.error');

map.addEventListener('click', function (event) {
  event.target.id = 'map';
  getReverseGeocode(event);
});

$barContainer.addEventListener('click', function () {
  $dropdownContainer.classList.toggle('show-dropdown-container');
});

$dropdownContainer.addEventListener('click', function (event) {
  if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'geocode-menu') {
    toggleElement($geocodeForm);
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'reverse-geocode-menu') {
    toggleElement($reverseGeocodeForm);
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'directions-menu') {
    toggleElement($directionsForm);
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'pois-menu') {
    toggleElement($poisForm);
  }
});

$geocodeForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getGeocode(event);
  $geocodeForm.reset();
  toggleElement($geocodeForm);
});

$reverseGeocodeForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getReverseGeocode(event);
  $reverseGeocodeForm.reset();
  toggleElement($reverseGeocodeForm);
});

$directionsForm.addEventListener('submit', function (event) {
  event.preventDefault();
  getBestRouteDestinationAJAXRequest(event);
  $directionsForm.reset();
  toggleElement($directionsForm);
});

$poisForm.addEventListener('submit', function (event) {
  if (!radius.validity.valid) {
    // If it isn't, we display an appropriate error message
    showError();
    // Then we prevent the form from being sent by canceling the event
    event.preventDefault();
    return;
  }
  event.preventDefault();
  data.eventTarget = event.target.id;
  getPOIs(event);
  $poisForm.reset();
  toggleElement($poisForm);
});

radius.addEventListener('input', event => {
  if (radius.validity.valid) {
    radiusError.textContent = '';
    radiusError.className = 'error';
  } else {
    showError();
  }
});

function showError() {
  if (radius.validity.rangeUnderflow || radius.validity.rangeOverflow) {
    radiusError.textContent = `Radius distance should be at least ${radius.min} and less than ${radius.max}`;
  }
  if (radius.validity.typeMismatch) {
    radiusError.textContent = 'Type must be a valid number!';
  }
}

function toggleElement(element) {
  element.classList.toggle('show');
  element.classList.toggle('hide');
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
  markupLayer.openPopup();
  $directionsButtonOnThePopup = document.querySelector('#directions-button');
  $poiButtonOnThePopup = document.querySelector('#poi-button');
  $directionsButtonOnThePopup.addEventListener('click', function (event) {
    toggleElement($directionsForm);
    $dropdownContainer.classList.toggle('show-dropdown-container');
    document.querySelector('#start').value = data.address;
  });
  $poiButtonOnThePopup.addEventListener('click', function (event) {
    toggleElement($poisForm);
    $dropdownContainer.classList.toggle('show-dropdown-container');
  });
  map.setView(markupLayer.getLayers()[0]._latlng);
}

function getOpenRoutesJSON(url, params, callback) {
  var xhr = new XMLHttpRequest();
  var searchParams = new URLSearchParams(params);
  searchParams.set('api_key', '5b3ce3597851110001cf62489e44bfb8d57d4a17b815aa9f855e19da');
  var ajaxURL = new URL('https://api.openrouteservice.org' + url + '?' + searchParams.toString());
  xhr.open('GET', ajaxURL.toString());
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    if (xhr.status === 404) {
      alert('something went wrong');
      return;
    }
    callback(xhr.response);
  });
  xhr.addEventListener('error', function () {
    alert('something went wrong');
  });
  xhr.send();
}

function getGeocode(event, startCoordinates) {
  var submittedAddress;
  data.eventTarget = event.target.id;
  submittedAddress = $geocodeForm.elements.address.value;
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/search', { text: submittedAddress }, function (response) {
    data.latitude = response.features[0].geometry.coordinates[1];
    data.longitude = response.features[0].geometry.coordinates[0];
    data.address = response.features[0].properties.label;
    data.geoJSON = response.features[0];
    getElevationAJAXRequest();
    $dropdownContainer.classList.toggle('show-dropdown-container');
    $loaderContainer.classList.toggle('hide-loader-container');
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
  if (event.target.id === 'reverse-geocode-form') {
    submittedLatLng.push($reverseGeocodeForm.elements.latitude.value);
    submittedLatLng.push($reverseGeocodeForm.elements.longitude.value);
  } else {
    submittedLatLng.push(event.latlng.lat);
    submittedLatLng.push(event.latlng.lng);
  }
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/reverse', { 'point.lat': submittedLatLng[0], 'point.lon': submittedLatLng[1] }, function (response) {
    data.latitude = response.features[0].geometry.coordinates[1];
    data.longitude = response.features[0].geometry.coordinates[0];
    data.address = response.features[0].properties.label;
    data.geoJSON = response.features[0];
    getElevationAJAXRequest();
    if (event.target.id !== 'map') {
      $dropdownContainer.classList.toggle('show-dropdown-container');
    }
    $loaderContainer.classList.toggle('hide-loader-container');
  });
}

function getBestRouteDestinationAJAXRequest(event) {
  data.eventTarget = event.target.id;
  data.address = $directionsForm.elements.destination.value;
  var startCoordinates = [];
  startCoordinates.push(data.latitude);
  startCoordinates.push(data.longitude);
  $loaderContainer.classList.toggle('hide-loader-container');
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
      $loaderContainer.classList.toggle('hide-loader-container');
    });
    $dropdownContainer.classList.toggle('show-dropdown-container');
    /* if (data.eventTarget === 'directions-form') {
      toggleElement($map);
      toggleElement($dropdownContainer);
    } */
  });
}

function getPOIs(event) {
  var bufferDistance;
  data.eventTarget = event.target.id;
  /* if (data.eventTarget === 'pois-form') { */
  bufferDistance = event.target.elements.buffer.value;
  /* } else {
    bufferDistance = event.target.elements['buffer-desktop'].value;
  } */
  var requestBody = {
    request: 'pois',
    geometry: {
      geojson: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      },
      buffer: bufferDistance
    }
  };
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.openrouteservice.org/pois');
  xhr.setRequestHeader('authorization', '5b3ce3597851110001cf62489e44bfb8d57d4a17b815aa9f855e19da');
  xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    var poisArray = xhr.response.features;
    var markersArray = [];
    poisArray.forEach(element => {
      // eslint-disable-next-line no-undef
      var marker = L.marker([element.geometry.coordinates[1], element.geometry.coordinates[0]]);
      var osmID = Object.keys(element.properties.category_ids);
      var poiName;
      if (element.properties.osm_tags) {
        poiName = element.properties.osm_tags.name;
      } else {
        poiName = 'Name not found!';
      }
      marker.bindPopup(`
        <p>POI category: ${element.properties.category_ids[osmID[0]].category_name}</p>
        <p>Name: ${poiName}</p>
      `);
      markersArray.push(marker);
    });
    // eslint-disable-next-line no-undef
    var layerGroup = L.layerGroup(markersArray);
    layerGroup.addTo(markupLayer);
    $loaderContainer.classList.toggle('hide-loader-container');
  });
  xhr.send(JSON.stringify(requestBody));
  $loaderContainer.classList.toggle('hide-loader-container');
}
