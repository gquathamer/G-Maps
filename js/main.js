// eslint-disable-next-line no-undef
var map = L.map('map').setView([39.717449, -105.089117], 13);
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
var $radius = document.querySelector('#buffer');
var $radiusError = document.querySelector('#buffer + span.error');
var $start = document.querySelector('#start');
var $startError = document.querySelector('#start + span.error');
var $destination = document.querySelector('#destination');
var $destinationError = document.querySelector('#destination + span.error');
var $reverseLat = document.querySelector('#latitude');
var $reverseLatError = document.querySelector('#latitude + span.error');
var $reverseLng = document.querySelector('#longitude');
var $reverseLngError = document.querySelector('#longitude + span.error');
var $geocode = document.querySelector('#geocode-address');
var $geocodeError = document.querySelector('#geocode-address + span.error');

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

// All form listeners

$geocodeForm.addEventListener('submit', function (event) {
  if (!$geocode.validity.valid) {
    showError($geocode, $geocodeError);
    event.preventDefault();
    return;
  }
  event.preventDefault();
  getGeocode(event);
  $geocodeForm.reset();
  toggleElement($geocodeForm);
});

$reverseGeocodeForm.addEventListener('submit', function (event) {
  if (!$reverseLat.validity.valid) {
    showError($reverseLat, $reverseLatError);
    event.preventDefault();
    return;
  }
  if (!$reverseLng.validity.valid) {
    showError($reverseLng, $reverseLngError);
    event.preventDefault();
    return;
  }
  event.preventDefault();
  getReverseGeocode(event);
  $reverseGeocodeForm.reset();
  toggleElement($reverseGeocodeForm);
});

$directionsForm.addEventListener('submit', function (event) {
  if (!data.latitude || !data.longitude) {
    $startError.textContent = 'Please select a location on the map or use the geocoder tool to get a starting point!';
    event.preventDefault();
    return;
  }
  if (!$start.validity.valid) {
    showError($start, $startError);
    event.preventDefault();
    return;
  }
  if (!$destination.validity.valid) {
    showError($destination, $destinationError);
    event.preventDefault();
    return;
  }
  event.preventDefault();
  $startError.textContent = '';
  $destinationError.textContent = '';
  getBestRouteDestinationAJAXRequest(event);
  $directionsForm.reset();
  toggleElement($directionsForm);
});

$poisForm.addEventListener('submit', function (event) {
  if (!$radius.validity.valid) {
    showError($radius, $radiusError);
    event.preventDefault();
    return;
  }
  if (!data.latitude || !data.longitude) {
    $radiusError.textContent = 'Please select a location on the map or use the geocoder tool to get a starting point!';
    event.preventDefault();
    return;
  }
  event.preventDefault();
  data.eventTarget = event.target.id;
  getPOIs(event);
  $poisForm.reset();
  toggleElement($poisForm);
});

// All input listeners

$radius.addEventListener('input', event => {
  if (!data.latitude || !data.longitude) {
    $radiusError.textContent = 'Please select a location on the map or use the geocoder tool to get a starting point!';
    event.preventDefault();
  } else if ($radius.validity.valid) {
    $radiusError.textContent = '';
    $radiusError.className = 'error';
  } else {
    showError($radius, $radiusError);
  }
});

$start.addEventListener('input', event => {
  if (!data.latitude || !data.longitude) {
    $startError.textContent = 'Please select a location on the map or use the geocoder tool to get a starting point!';
    event.preventDefault();
  } else if ($start.validity.valid) {
    $startError.textContent = '';
    $startError.classname = 'error';
  } else {
    showError($start, $startError);
  }
});

$destination.addEventListener('input', event => {
  if ($destination.validity.valid) {
    $destinationError.textContent = '';
    $destinationError.classname = 'error';
  } else {
    showError($destination, $destinationError);
  }
});

$reverseLat.addEventListener('input', event => {
  data.latitude = event.target.value;
  if ($reverseLat.validity.valid) {
    $reverseLatError.textContent = '';
    $reverseLatError.classname = 'error';
  } else {
    showError($reverseLat, $reverseLatError);
  }
});

$reverseLng.addEventListener('input', () => {
  if ($reverseLng.validity.valid) {
    $reverseLngError.textContent = '';
    $reverseLngError.classname = 'error';
  } else {
    showError($reverseLng, $reverseLngError);
  }
});

$geocode.addEventListener('input', () => {
  if ($geocode.validity.valid) {
    $geocodeError.textContent = '';
    $geocodeError.classname = 'error';
  } else {
    showError($geocode, $geocodeError);
  }
});

// show error function for all form inputs
function showError(element, errorElement) {
  if (element.validity.rangeUnderflow || element.validity.rangeOverflow) {
    errorElement.textContent = `Must be at least ${element.min} and less than ${element.max}`;
    return;
  }
  if (element.validity.typeMismatch) {
    errorElement.textContent = 'Type must be a valid number!';
    return;
  }
  if (element.validity.badInput) {
    errorElement.textContent = 'Received bad input';
    return;
  }
  if (element.validity.valueMissing) {
    errorElement.textContent = 'This field is required';
    return;
  }
  if (element.validity.tooShort || element.validity.tooLong) {
    errorElement.textContent = `Address or location length should be at least ${element.minLength} characters long and less than ${element.maxLength} characters long`;
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
    callback(xhr.response);
  });
  xhr.send();
}

function getGeocode(event, startCoordinates) {
  var submittedAddress = $geocodeForm.elements.address.value;
  // data.eventTarget = event.target.id;
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/search', { text: submittedAddress }, function (response) {
    if (response.error || response.code) {
      checkResponseForError(response, $geocodeForm, $geocodeError);
      return;
    }
    if (response.features.length < 1) {
      $dropdownContainer.classList.toggle('show-dropdown-container');
      $loaderContainer.classList.toggle('hide-loader-container');
      toggleElement($geocodeForm);
      $geocodeError.textContent = 'That address could not be found, please try changing the format or selecting a different address';
      return;
    }
    data.latitude = response.features[0].geometry.coordinates[1];
    data.longitude = response.features[0].geometry.coordinates[0];
    data.address = response.features[0].properties.label;
    data.geoJSON = response.features[0];
    getElevationAJAXRequest($geocodeForm, $geocodeError);
    $dropdownContainer.classList.toggle('show-dropdown-container');
    $loaderContainer.classList.toggle('hide-loader-container');
  });
}

function getElevationAJAXRequest(element, errorElement) {
  getOpenRoutesJSON('/elevation/point', { geometry: data.longitude + ',' + data.latitude }, function (response) {
    if (response.error || response.code) {
      checkResponseForError(response, element, errorElement);
      return;
    }
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
    getElevationAJAXRequest($reverseGeocodeForm, $reverseLatError);
    if (event.target.id !== 'map') {
      $dropdownContainer.classList.toggle('show-dropdown-container');
    }
    $loaderContainer.classList.toggle('hide-loader-container');
  });
}

function checkResponseForError(response, element, errorElement) {
  if (response.error) {
    toggleElement(element);
    errorElement.textContent = `${response.error.code}: ${response.error.message}`;

  }
  if (response.code && response.message) {
    toggleElement(element);
    errorElement.textContent = `${response.code}: ${response.message}`;
  }
}

function getBestRouteDestinationAJAXRequest(event) {
  data.eventTarget = event.target.id;
  data.address = $directionsForm.elements.destination.value;
  var startCoordinates = [];
  if (!data.latitude || !data.longitude) {
    getOpenRoutesJSON('/geocode/search', { text: $start.value }, function (response) {
      if (response.error || response.code) {
        checkResponseForError(response, $directionsForm, $startError);
        $dropdownContainer.classList.toggle('show-dropdown-container');
        return;
      }
      startCoordinates.push(response.features[0].geometry.coordinates[1]);
      startCoordinates.push(response.features[0].geometry.coordinates[0]);
    });
  }
  startCoordinates.push(data.latitude);
  startCoordinates.push(data.longitude);
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/search', { text: data.address }, function (response) {
    if (response.error || response.code) {
      checkResponseForError(response, $directionsForm, $startError);
      $dropdownContainer.classList.toggle('show-dropdown-container');
      return;
    }
    var routeParameters = {
      start: startCoordinates[1] + ',' + startCoordinates[0],
      end: response.features[0].geometry.coordinates[0] + ',' + response.features[0].geometry.coordinates[1]
    };
    getOpenRoutesJSON('/v2/directions/driving-car', routeParameters, function (response) {
      if (response.error || response.code) {
        checkResponseForError(response, $directionsForm, $startError);
        $loaderContainer.classList.toggle('hide-loader-container');
        return;
      }
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
  });
}

function getPOIs(event) {
  var bufferDistance;
  data.eventTarget = event.target.id;
  bufferDistance = event.target.elements.buffer.value;
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
