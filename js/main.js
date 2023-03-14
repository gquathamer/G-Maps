// eslint-disable-next-line no-undef
var map = L.map('map').setView([39.717449, -105.089117], 13);
// eslint-disable-next-line no-undef
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);
// eslint-disable-next-line no-undef
var markupLayer = L.geoJSON().addTo(map);
// eslint-disable-next-line no-undef
var highlightLayer = L.geoJSON(null, {
  style: function () {
    return { color: 'red' };
  }
}).addTo(map);
var $barContainer = document.querySelector('.bar-container');
var $dropdownContainer = document.querySelector('.dropdown-container');
var $geocodeForm = document.querySelector('#geocode-form');
var $reverseGeocodeForm = document.querySelector('#reverse-geocode-form');
var $directionsForm = document.querySelector('#directions-form');
var $poisForm = document.querySelector('#pois-form');
var $loaderContainer = document.querySelector('.loader-container');
var $radius = document.querySelector('#buffer');
var $radiusError = document.querySelector('#buffer + span.error');
var $bufferAddress = document.querySelector('#buffer-address');
var $bufferAddressError = document.querySelector('#buffer-address + span.error');
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
var $routeInstructions = document.querySelector('#route-instructions');
var $poiResults = document.querySelector('#pois-results');

map.addEventListener('click', function (event) {
  event.target.id = 'map';
  getReverseGeocode(event);
});

$barContainer.addEventListener('click', function () {
  $dropdownContainer.classList.toggle('show-dropdown-container');
});

$dropdownContainer.addEventListener('click', function (event) {
  if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'geocode-menu') {
    $geocodeForm.classList.toggle('show');
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'reverse-geocode-menu') {
    $reverseGeocodeForm.classList.toggle('show');
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'directions-menu') {
    $directionsForm.classList.toggle('show');
  } else if (event.target.tagName === 'I' && event.target.closest('DIV').id === 'pois-menu') {
    $poisForm.classList.toggle('show');
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
  getGeocode();
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
});

$directionsForm.addEventListener('submit', function (event) {
  if (!$start.validity.valid) {
    showError($start, $startError);
    event.preventDefault();
    return;
  }
  $startError.textContent = '';
  if (!$destination.validity.valid) {
    showError($destination, $destinationError);
    event.preventDefault();
    return;
  }
  $destinationError.textContent = '';
  event.preventDefault();
  getRoute(event);
});

$poisForm.addEventListener('submit', function (event) {
  if (!$radius.validity.valid) {
    showError($radius, $radiusError);
    event.preventDefault();
    return;
  }
  if (!$bufferAddress.validity.valid) {
    showError($bufferAddress, $bufferAddressError);
    event.preventDefault();
    return;
  }
  event.preventDefault();
  getPOIs(event);
});

// All input listeners

$radius.addEventListener('input', event => {
  if ($radius.validity.valid) {
    $radiusError.textContent = '';
    $radiusError.className = 'error';
  } else {
    showError($radius, $radiusError);
  }
});

$bufferAddress.addEventListener('input', event => {
  if ($bufferAddress.validity.valid) {
    $bufferAddressError.textContent = '';
    $bufferAddressError.className = 'error';
  } else {
    showError($bufferAddress, $bufferAddressError);
  }
});

$start.addEventListener('input', event => {
  if ($start.validity.valid) {
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

function checkResponseForError(response, errorElement) {
  if (!$loaderContainer.classList.contains('hide')) {
    $loaderContainer.classList.toggle('hide-loader-container');
  }
  if (response.error) {
    errorElement.textContent = `${response.error.code}: ${response.error.message}`;
    return;
  }
  if (response.code && response.message) {
    errorElement.textContent = `${response.message}`;
    return;
  }
  if (response.features.length < 1) {
    errorElement.textContent = 'Sorry that didn\'t yield any results';
  }
}

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

function createPopupContent(displayObject) {
  var popupDiv = document.createElement('div');
  popupDiv.setAttribute('class', 'popup-div');
  var address = document.createElement('p');
  address.textContent = 'Address: ' + displayObject.address;
  popupDiv.appendChild(address);
  var latitude = document.createElement('p');
  latitude.textContent = 'Latitude: ' + displayObject.latitude;
  popupDiv.appendChild(latitude);
  var longitude = document.createElement('p');
  longitude.textContent = 'Longitude: ' + displayObject.longitude;
  popupDiv.appendChild(longitude);
  var elevationData = document.createElement('p');
  elevationData.textContent = 'Elevation: ' + displayObject.elevation + ' meters';
  popupDiv.appendChild(elevationData);
  var buttonDiv = document.createElement('div');
  buttonDiv.setAttribute('class', 'button-div');
  var directionsButton = document.createElement('button');
  directionsButton.setAttribute('id', 'directions-button');
  directionsButton.setAttribute('class', 'popup-button');
  directionsButton.textContent = 'Directions';
  buttonDiv.appendChild(directionsButton);
  directionsButton.addEventListener('click', function (event) {
    $directionsForm.classList.toggle('show');
    $start.value = displayObject.address;
    $dropdownContainer.classList.toggle('show-dropdown-container');
  });
  var poiButton = document.createElement('button');
  poiButton.setAttribute('id', 'poi-button');
  poiButton.setAttribute('class', 'popup-button');
  poiButton.textContent = 'POI';
  buttonDiv.appendChild(poiButton);
  popupDiv.appendChild(buttonDiv);
  poiButton.addEventListener('click', function (event) {
    $poisForm.classList.toggle('show');
    $bufferAddress.value = displayObject.address;
    $dropdownContainer.classList.toggle('show-dropdown-container');
  });
  return popupDiv;
}

function displayPopupContent(displayObject) {
  markupLayer.unbindPopup();
  markupLayer.clearLayers();
  markupLayer.addData(displayObject.geoJSON);
  markupLayer.bindPopup(createPopupContent(displayObject));
  markupLayer.openPopup();
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

function getGeocode() {
  var submittedAddress = $geocodeForm.elements.address.value;
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/search', { text: submittedAddress }, function (response) {
    if (response.error || response.code || response.features.length < 1) {
      checkResponseForError(response, $geocodeError);
      return;
    }
    var displayObject = {
      latitude: response.features[0].geometry.coordinates[1],
      longitude: response.features[0].geometry.coordinates[0],
      address: response.features[0].properties.label,
      geoJSON: response.features[0]
    };
    getOpenRoutesJSON('/elevation/point', { geometry: displayObject.longitude + ',' + displayObject.latitude }, function (response) {
      if (response.error || response.code) {
        checkResponseForError(response, $geocodeError);
      }
      displayObject.elevation = response.geometry.coordinates[2];
      $loaderContainer.classList.toggle('hide-loader-container');
      displayPopupContent(displayObject);
      $geocodeForm.reset();
      $geocodeForm.classList.toggle('show');
    });
  });
}

function getReverseGeocode(event) {
  var submittedLatLng = [];
  if (event.target.id === 'reverse-geocode-form') {
    submittedLatLng.push($reverseGeocodeForm.elements.latitude.value);
    submittedLatLng.push($reverseGeocodeForm.elements.longitude.value);
  } else {
    submittedLatLng.push(event.latlng.lat);
    submittedLatLng.push(event.latlng.lng);
  }
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/reverse', { 'point.lat': submittedLatLng[0], 'point.lon': submittedLatLng[1] }, function (response) {
    if (response.error || response.code || response.features.length < 1) {
      checkResponseForError(response, $reverseLatError);
      return;
    }
    var displayObject = {
      latitude: response.features[0].geometry.coordinates[1],
      longitude: response.features[0].geometry.coordinates[0],
      address: response.features[0].properties.label,
      geoJSON: response.features[0]
    };
    getOpenRoutesJSON('/elevation/point', { geometry: displayObject.longitude + ',' + displayObject.latitude }, function (response) {
      if (event.target.id !== 'map') {
        $dropdownContainer.classList.toggle('show-dropdown-container');
      }
      if (response.error || response.code) {
        checkResponseForError(response, $reverseLatError);
        return;
      }
      displayObject.elevation = response.geometry.coordinates[2];
      $loaderContainer.classList.toggle('hide-loader-container');
      displayPopupContent(displayObject);
      $reverseGeocodeForm.reset();
    });
  });
}

function getRoute(event) {
  var startCoordinates = [];
  var start = event.currentTarget.start.value;
  var destination = event.currentTarget.destination.value;
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/search', { text: start }, function (response) {
    if (response.error || response.code || response.features.length < 1) {
      checkResponseForError(response, $startError);
      $dropdownContainer.classList.toggle('show-dropdown-container');
      return;
    }
    startCoordinates.push(response.features[0].geometry.coordinates[1]);
    startCoordinates.push(response.features[0].geometry.coordinates[0]);
    getOpenRoutesJSON('/geocode/search', { text: destination }, function (response) {
      if (response.error || response.code || response.features.length < 1) {
        // hande a click from the directions button popup that loads the popups current address
        // also handle just clicking in and changing the value
        checkResponseForError(response, $destinationError);
        $dropdownContainer.classList.toggle('show-dropdown-container');
        return;
      }
      var routeParameters = {
        start: startCoordinates[1] + ',' + startCoordinates[0],
        end: response.features[0].geometry.coordinates[0] + ',' + response.features[0].geometry.coordinates[1]
      };
      getOpenRoutesJSON('/v2/directions/driving-car', routeParameters, function (response) {
        if (response.error || response.code || response.features.length < 1) {
          checkResponseForError(response, $startError);
          $dropdownContainer.classList.toggle('show-dropdown-container');
          return;
        }
        var steps = response.features[0].properties.segments[0].steps;
        markupLayer.closePopup();
        markupLayer.clearLayers();
        markupLayer.unbindPopup();
        markupLayer.addData(response.features[0]);
        map.fitBounds(markupLayer.getBounds());
        // var routeCoordinates = response.features[0].geometry.coordinates;
        // eslint-disable-next-line no-undef
        // markupLayer.addData(L.marker([routeCoordinates[0][1], routeCoordinates[0][0]]).toGeoJSON());
        // eslint-disable-next-line no-undef
        // markupLayer.addData(L.marker([routeCoordinates[routeCoordinates.length - 1][1], routeCoordinates[routeCoordinates.length - 1][0]]).toGeoJSON());
        var totalTripStats = document.createElement('div');
        totalTripStats.classList.add('instruction');
        var totalTripTime = document.createElement('p');
        totalTripTime.textContent = `Total trip time: ${Math.floor(response.features[0].properties.summary.duration / 60)} minutes`;
        totalTripStats.appendChild(totalTripTime);
        var totalTripDistance = document.createElement('p');
        totalTripDistance.textContent = `Total trip distance: ${Math.floor(response.features[0].properties.summary.distance * 0.000621)} miles`;
        totalTripStats.appendChild(totalTripDistance);
        var instructionsElementsArray = [totalTripStats];
        instructionsElementsArray = instructionsElementsArray.concat(steps.map((elem, idx) => {
          var instructionDiv = document.createElement('div');
          instructionDiv.classList.add('instruction');
          var instruction = document.createElement('p');
          instruction.textContent = `Step ${idx + 1}: ${elem.instruction}`;
          instructionDiv.appendChild(instruction);
          var distance = document.createElement('p');
          distance.textContent = `Distance: ${Number(elem.distance * 0.000621).toFixed(2)} miles`;
          instructionDiv.appendChild(distance);
          var minutes = document.createElement('p');
          minutes.textContent = `Travel time for this step: ${Number(elem.duration / 60).toFixed(2)} minutes`;
          instructionDiv.appendChild(minutes);
          instructionDiv.addEventListener('mouseenter', event => {
            highlightLayer.addData({
              type: 'LineString',
              coordinates: response.features[0].geometry.coordinates.slice(steps[idx].way_points[0], steps[idx].way_points[1])
            });
          });
          instructionDiv.addEventListener('mouseleave', event => {
            highlightLayer.clearLayers();
          });
          return instructionDiv;
        }));
        $routeInstructions.replaceChildren(...instructionsElementsArray);
        $loaderContainer.classList.toggle('hide-loader-container');
        $directionsForm.reset();
      });
      $dropdownContainer.classList.toggle('show-dropdown-container');
    });
  });
}

function getPOIs(event) {
  var bufferDistance = event.target.elements.buffer.value;
  var bufferAddress = event.target.elements['buffer-address'].value;
  $loaderContainer.classList.toggle('hide-loader-container');
  getOpenRoutesJSON('/geocode/search', { text: bufferAddress }, function (response) {
    if (response.error || response.code || response.features.length < 1) {
      checkResponseForError(response, $bufferAddressError);
      $dropdownContainer.classList.toggle('show-dropdown-container');
      return;
    }
    map.setView([response.features[0].geometry.coordinates[1], response.features[0].geometry.coordinates[0]]);
    var requestBody = {
      request: 'pois',
      geometry: {
        geojson: {
          type: 'Point',
          coordinates: [response.features[0].geometry.coordinates[0], response.features[0].geometry.coordinates[1]]
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
      markupLayer.closePopup();
      markupLayer.unbindPopup();
      markupLayer.clearLayers();
      var poisArray = xhr.response.features;
      var markersArray = [];
      // This acts as the first item in results list, showing total results
      var poiSummary = document.createElement('div');
      poiSummary.classList.add('poi-result');
      var poiStats = document.createElement('p');
      poiStats.textContent = `Found ${poisArray.length} results`;
      poiSummary.appendChild(poiStats);
      var poiElementsArray = [poiSummary];
      // creating an array of dom elements to append to bottom of poi form
      poiElementsArray = poiElementsArray.concat(poisArray.map(element => {
        // eslint-disable-next-line no-undef
        var marker = L.marker([element.geometry.coordinates[1], element.geometry.coordinates[0]]);
        var osmID = Object.keys(element.properties.category_ids);
        var poiName;
        if (element.properties.osm_tags?.name) {
          poiName = element.properties.osm_tags.name.toUpperCase();
        } else {
          poiName = 'Name not found!';
        }
        marker.bindPopup(`
        <p>POI category: ${element.properties.category_ids[osmID[0]].category_name.toUpperCase()}</p>
        <p>Name: ${poiName}</p>
      `);
        markersArray.push(marker);
        var poiDiv = document.createElement('div');
        poiDiv.classList.add('poi-result');
        var poiCategory = document.createElement('p');
        poiCategory.textContent = element.properties.category_ids[osmID[0]].category_name.toUpperCase();
        poiDiv.appendChild(poiCategory);
        var nameOfPOI = document.createElement('p');
        nameOfPOI.textContent = poiName;
        poiDiv.appendChild(nameOfPOI);
        poiDiv.addEventListener('mouseenter', event => {
          marker.openPopup();
        });
        poiDiv.addEventListener('mouseleave', event => {
          marker.closePopup();
        });
        return poiDiv;
      }));
      $poiResults.replaceChildren(...poiElementsArray);
      // eslint-disable-next-line no-undef
      var layerGroup = L.layerGroup(markersArray);
      layerGroup.addTo(markupLayer);
      $loaderContainer.classList.toggle('hide-loader-container');
      $poisForm.reset();
    });
    xhr.send(JSON.stringify(requestBody));
  });

}
