var screenshot = document.getElementById('capture');
var button = document.getElementById('download-button');

function takePicture() {
  html2canvas(screenshot, {
    windowWidth: "1920px",
    windowHeight: "1080px",
    // // useCORS: true,
    // foreignObjectRendering: true
  }).then(function(canvas){
    document.body.appendChild(canvas);
  });
}
