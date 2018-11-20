// default the label type to a primary label
var labelType = 'primary-label';

// make new labels if there is text in the input
$('#make-label').on('click', function(){
  if($('#label-input').val().length !== 0 && $('#sub-label-input').val().length === 0) {
    makeLabel();
    $('#make-label').addClass('btn-sccs');
    setTimeout(function(){ $('#make-label').removeClass('btn-sccs'); }, 1000);
  } else if ($('#label-input').val().length !== 0 && $('#sub-label-input').val().length !== 0) {
    makeDoubleLabel();
    $('#make-label').addClass('btn-sccs');
    setTimeout(function(){ $('#make-label').removeClass('btn-sccs'); }, 1000);
  } else {
    alert("don't forget your label text");
  }
});

$('#label-input, #sub-label-input').keypress(function (e) {
  if (e.which == 13) {
    if($('#label-input').val().length !== 0 && $('#sub-label-input').val().length === 0) {
      makeLabel();
      $('#make-label').addClass('btn-sccs');
      setTimeout(function(){ $('#make-label').removeClass('btn-sccs'); }, 1000);
    } else if ($('#label-input').val().length !== 0 && $('#sub-label-input').val().length !== 0) {
      makeDoubleLabel();
      $('#make-label').addClass('btn-sccs');
      setTimeout(function(){ $('#make-label').removeClass('btn-sccs'); }, 1000);
    } else {
      alert("don't forget your label text");
    }
  }
});

// change label type with radio selects
$('.label-type-select').on('click', function() {
  labelType = $(this).find('input').attr('data-label-type');
  $('#label-input').removeClass().addClass('control-input ' + labelType);
});

// remove single labels
// click event must be on the existing element of the labels div and effect the created individual label
$('.labels').on('click', ".label-close", function(){
  $(this).parent().parent().remove();
});

// clear all created labels
$('#clear-labels').click(function(){
  $('.labels').empty();
});

// label creation function
function makeLabel(){
  var labelCopy;
  var labelContainer = document.createElement("div");
  var label = document.createElement("div");
  var closeButton = document.createElement("div");
  $(closeButton).html('<p>+</p>');
  $(closeButton).addClass('label-close');
  $(labelContainer).addClass('labelContainer');
  $(label).addClass('label ' + labelType);
  var labelNum = $('.label').length;
  $(label).attr("id", "label" + labelNum);
  labelCopy = $('#label-input').val();
  $(label).html(labelCopy);
  $('.labels').append(labelContainer);
  $(labelContainer).append(label);
  $(label).append(closeButton);
}

function makeDoubleLabel(){
  var labelTopCopy;
  var labelBottomCopy;
  var labelContainer = document.createElement("div");
  var labelTop = document.createElement("div");
  var labelBottom = document.createElement("div");
  var closeButton = document.createElement("div");
  $(closeButton).html('<p>+</p>');
  $(closeButton).addClass('label-close');
  $(labelContainer).addClass('labelContainer');
  $(labelTop).addClass('labelTop ' + labelType);
  $(labelBottom).addClass('labelBottom');
  var labelNum = $('.label').length;
  $(labelContainer).attr("id", "label" + labelNum);
  labelTopCopy = $('#label-input').val();
  labelBottomCopy = $('#sub-label-input').val();
  $(labelTop).html(labelTopCopy);
  $(labelBottom).html(labelBottomCopy);
  $('.labels').append(labelContainer);
  $(labelContainer).append(labelTop);
  $(labelContainer).append(labelBottom);
  $(labelTop).append(closeButton);
}

// make the labels draggable and rotatable
$(document).on('mouseover mouseout', '.labelContainer', function() {
  $('.labelContainer').draggable();
  $('.label').rotatable();
});
