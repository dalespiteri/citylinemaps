var map;

// array of markers set on map
var markers = {};

// array of drawn objects
var all_overlays = [];
// a selected shape for the drawing manager to control
var selectedShape;

//map style options
var styleOptionCityLabels = {
  featureType: 'administrative',
  elementType: 'labels',
  stylers: [{'visibility': 'on'}]
};

var styleOptionStreetLabels = {
  featureType: 'road',
  elementType: 'labels',
  stylers: [{'visibility': 'on'}]
};

var styleOptionLabelOpacity = {
  featureType: 'all',
  elementType: 'labels.text.fill',
  stylers: [{'color': '#003657'}]
};

var styleOptionWaterLabels = {
  featureType: 'water',
  elementType: 'labels.text.fill',
  stylers: [{'visibility': 'on'}]
};

  //master map style
var mapStyle = [
  {
    'featureType': 'all',
    'elementType': 'labels',
    'stylers': [{'visibility': 'off'}]
  },
  {
    'featureType': 'all',
    'elementType': 'labels.icon',
    'stylers': [{'visibility': 'off'}]
  },
  {
    'featureType': 'landscape',
    'elementType': 'geometry',
    'stylers': [{'color': '#eaeaea'}]
  },
  {
    'featureType': 'poi',
    'elementType': 'geometry',
    'stylers': [{'color': '#c1c1c1'}]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry',
    'stylers': [{'color': '#ffffff'}]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry.stroke',
    'stylers': [{'color': '#e7a32b'}]
  },
  {
    'featureType': 'water',
    'elementType': 'geometry',
    'stylers': [{'color': '#002840'}]
  },
  styleOptionCityLabels,
  styleOptionStreetLabels,
  styleOptionLabelOpacity,
  styleOptionWaterLabels,
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{'color': '#FFFFFF'}]
  }
];

// default centering of map on Toronto
var mapCenter = {lat: 43.6532, lng: -79.3832};

// marker highlight
var markerHighlight = '';

// default marker color to blue
var markerColor = 'blue' + markerHighlight;

// define the center of the markers
var markerCenter = 14;

// set route points
var routeCreation = false;
var routePoints = [];
var start;
var end;
var waypointList;

// Initialize and add the map
function initMap() {

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: mapCenter,
    disableDefaultUI: true,
    styles: mapStyle
  });

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
      drawingModes: ['polyline', 'rectangle', 'circle']
    },
    circleOptions: {
      fillColor: '#ef3d1b',
      strokeColor: '#FFFFFF',
      fillOpacity: 0.25,
      strokeWeight: 5,
      clickable: true,
      editable: false,
      zIndex: 1
    },
    rectangleOptions: {
      fillColor: '#ef3d1b',
      strokeColor: '#FFFFFF',
      fillOpacity: 0.25,
      strokeWeight: 5,
      clickable: true,
      editable: false,
      zIndex: 1
    },
    polylineOptions: {
      strokeColor: '#ef3d1b',
      strokeWeight: 10
    }
  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e){
    all_overlays.push(e);
    drawingManager.setDrawingMode(null);
    var newShape = e.overlay;
    newShape.type = e.type;
    google.maps.event.addListener(newShape, 'click', function() {
      setSelection(newShape);
    });
    setSelection(newShape);
  });

  google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
  google.maps.event.addListener(map, 'click', clearSelection);
  $('#delete-shape').on('click', deleteSelectedShape);
  $('#delete-all-shape').on('click', deleteAllShape);
  $(document).keydown(function (e) {
    var tag = e.target.tagName.toLowerCase();
    if(e.which == 46 && tag != 'input') {
      deleteSelectedShape();
    }
  });

  $('#fullscreen').on('click', function(){
    drawingManager.setMap(null);
  });
  var drawingControls = true;
  $('#toggle-drawing-controls').on('click', function(){
    drawingControls ? drawingManager.setMap(null) : drawingManager.setMap(map);
    drawingControls = !drawingControls;
  });

  // linking maps search to the search input
  var input = document.getElementById('map-search-input');
  var searchBox = new google.maps.places.SearchBox(input);

  // bias search results to map location
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // move map on search selection
  searchBox.addListener('places_changed', function(){
    var places = searchBox.getPlaces();
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      // Create a marker for each place.
      var markerId = getMarkerUniqueId(place.geometry.location.lat(), place.geometry.location.lng());
      var marker = new google.maps.Marker({
          position: getLatLng(place.geometry.location.lat(), place.geometry.location.lng()),
          map: map,
          icon: selectedMarker,
          draggable: true,
          id: 'marker_' + markerId
      });
      markers[markerId] = marker; // cache marker in markers object
      bindMarkerEvents(marker); // bind right click event to marker
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  // custom marker properties
  var selectedMarker = {
    url: '/images/' + markerColor + '-marker.png',
    anchor: new google.maps.Point(markerCenter, markerCenter)
  };

  // pushes any changes to the marker to the marker properties
  $('.marker-select, #highlight-marker-check').on('click', function(){
    selectedMarker.url = '/images/' + markerColor + '-marker' + markerHighlight + '.png';
    selectedMarker.anchor = new google.maps.Point(markerCenter, markerCenter);
  });

  // addMarker(); start
  var getMarkerUniqueId = function(lat, lng) {
      return lat + '_' + lng;
  }

  var getLatLng = function(lat, lng) {
      return new google.maps.LatLng(lat, lng);
  };

  var addMarker = google.maps.event.addListener(map, 'click', function(e) {
      var lat = e.latLng.lat(); // lat of clicked point
      var lng = e.latLng.lng(); // lng of clicked point
      var markerId = getMarkerUniqueId(lat, lng); // an that will be used to cache this marker in markers object.
      var marker = new google.maps.Marker({
          position: getLatLng(lat, lng),
          map: map,
          icon: selectedMarker,
          draggable: true,
          id: 'marker_' + markerId
      });
      markers[markerId] = marker; // cache marker in markers object
      bindMarkerEvents(marker); // bind right click event to marker
  });

  var bindMarkerEvents = function(marker) {
      google.maps.event.addListener(marker, "rightclick", function (point) {

        // reset markers

        $.each(markers, function(key, value){

          renameProp = (
            oldProp,
            newProp,
            { [oldProp]: old, ...others }
          ) => {
            return {
              [newProp]: old,
              ...others
            };
          };

          newKey = getMarkerUniqueId(value.position.lat(), value.position.lng());
          markers = renameProp(key, newKey, markers);

        });

        // reset markers ends

          var markerId = getMarkerUniqueId(point.latLng.lat(), point.latLng.lng()); // get marker id by using clicked point's coordinate
          var marker = markers[markerId]; // find marker
          removeMarker(marker, markerId); // remove it
      });
  };

  var removeMarker = function(marker, markerId) {
      marker.setMap(null); // set markers setMap to null to remove it from map
      delete markers[markerId]; // delete marker instance from markers object
  };

  // sets the markers from the array on the map (only used to clear)
  function setMapMarkers(map) {
    for (var i = 0; i < Object.keys(markers).length; i++) {
      markers[Object.keys(markers)[i]].setMap(null);
    }
  }

  // removes markers from the map and clears the markers array
  function clearMarkers() {
    setMapMarkers(null);
    markers = {};
  }

  //adds event listener on clear button to run clearMarkers function
  $('#clear-markers').on('click', function(){
    clearMarkers();
  });

  // toggle map visuals
  var cityCheck = $('#city-labels-checkbox');
  cityCheck.on('click', function(){
    if ($(cityCheck).is(':checked')) {
     styleOptionCityLabels.stylers = [{'visibility': 'on'}];
    } else {
     styleOptionCityLabels.stylers = [{'visibility': 'off'}];
    }
    map.setOptions({styles: mapStyle});
  });

  var streetCheck = $('#street-labels-checkbox');
  streetCheck.on('click', function(){
    if ($(streetCheck).is(':checked')) {
     styleOptionStreetLabels.stylers = [{'visibility': 'on'}];
    } else {
     styleOptionStreetLabels.stylers = [{'visibility': 'off'}];
    }
    map.setOptions({styles: mapStyle});
  });

  var waterCheck = $('#water-labels-checkbox');
  waterCheck.on('click', function(){
    if ($(waterCheck).is(':checked')) {
     styleOptionWaterLabels.stylers = [{'visibility': 'on'}];
    } else {
     styleOptionWaterLabels.stylers = [{'visibility': 'off'}];
    }
    map.setOptions({styles: mapStyle});
  });

  var transitCheck = $('#transit-checkbox');
  var transitLayer = new google.maps.TransitLayer();
  transitCheck.on('click', function(){
    if ($(transitCheck).is(':checked')) {
      transitLayer.setMap(map);
    } else {
      transitLayer.setMap(null);
    }
  });

  var fadeCheck = $('#label-opacity-checkbox');
  fadeCheck.on('click', function(){
    if ($(fadeCheck).is(':checked')) {
     styleOptionLabelOpacity.stylers = [{'color': '#9a9ca0'}];
    } else {
     styleOptionLabelOpacity.stylers = [{'color': '#003657'}];
    }
    map.setOptions({styles: mapStyle});
  });

}

// add highlight to markers, and change the center
$('#highlight-marker-check').on('click', function(){
  if ($('#highlight-marker-check').is(':checked')) {
    markerHighlight = '-highlight';
    markerCenter = 26;
  } else {
    markerHighlight = '';
    markerCenter = 14;
  }
});

// changes marker color
$('.marker-select').click(function(){
    markerColor = $(this).attr('data-color');
});

// drawing manager tools
function clearSelection() {
  if (selectedShape) {
    selectedShape.setEditable(false);
    selectedShape = null;
  }
}
function setSelection(shape) {
  clearSelection();
  selectedShape = shape;
  shape.setEditable(true);
}
function deleteSelectedShape() {
  if(selectedShape){
    selectedShape.setMap(null);
  }
}
function deleteAllShape() {
  for(var i = 0; i < all_overlays.length; i++){
    all_overlays[i].overlay.setMap(null);
  }
  all_overlays = [];
}

// UI FUNCTIONALITY

$('.hamburger').on('click', function () {
  $('.menu').toggleClass('menu-visible');
  $('.outterBar').toggleClass('outterBarDisappear');
  $('.middleBar1').toggleClass('middleBarX1');
  $('.middleBar2').toggleClass('middleBarX2');
  $('.outterBar').toggleClass('menu-closed');
  $('.middleBar').toggleClass('menu-closed');
  $('.control-box').removeClass('control-show');
});
$('.menu-locals').on('click', function(){
  $('.control-box').removeClass('control-show');
  $('.location-controls').toggleClass('control-show');
});
$('.menu-labels').on('click', function(){
  $('.control-box').removeClass('control-show');
  $('.label-controls').toggleClass('control-show');
});
$('.menu-markers').on('click', function(){
  $('.control-box').removeClass('control-show');
  $('.marker-controls').toggleClass('control-show');
});
$('.label-type-select').on('click', function(){
  $('.label-type-select').removeClass('label-active');
  $(this).addClass('label-active');
});
$('.marker-select-radio').on('click', function(){
  $('.marker-select-radio').children().removeClass('marker-selected');
  $(this).children().addClass('marker-selected');
});
$('.highlight-marker-check').on('click', function(){
  $(this).toggleClass('highlight-checked');
});
$('.menu-drawing').on('click', function(){
  $('.control-box').removeClass('control-show');
  $('.drawing-controls').toggleClass('control-show');
});
$('.closeDrawer').on('click', function(){
  $('.control-box').removeClass('control-show');
});
