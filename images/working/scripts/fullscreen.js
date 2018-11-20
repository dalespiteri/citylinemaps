var mapElement = document.getElementById("mapContainer");

function toggleFullScreen() {
  if (!document.mozFullScreen && !document.webkitFullScreen) {
    if (mapElement.mozRequestFullScreen) {
      mapElement.mozRequestFullScreen();
    } else {
      mapElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitCancelFullScreen();
    }
  }
}

$('#fullscreen').on('click', function(){
  toggleFullScreen();
});
