// Copyright © 2019 by Xitalogy.  MIT License.  See LICENSE.MD

(function() {

  'use strict';

  var LINE_LENGTH = 120;
  var MINIMUM_LINE_SEPARATION = 6;

  var ANGLE_DIVISOR = 300;

  var FUCHSIA = '#ff00ff';
  var BLACK = '#000000';

  var length;
  var separation;
  var divisor;
  var color;

  var clearElem;
  var resetElem;

  var lengthElem;
  var separationElem;
  var divisorElem;
  var colorElem;
  var backgroundElem;

  var canvasElem;
  var context;

  var instructionsElem;

  var mouseDownPos;
  var mousePos = null;
  var prevMousePos;
  var mouseIsDown = false;

  var isClean = true;
  var inhibitResize = false;

  function calcOppositeHexColor (color) {

    function opposite (byteStr) {

      var opp;
      var c = parseInt(byteStr, 16);
      var quadrant = Math.floor(c / 64);

      switch (quadrant) {
      case 0 :
      case 3 :
        opp = 255 - c;
        break;
      case 1 :
        opp = 128 + c;
        break;
      case 2 :
        opp = c - 128;
        break;
      default :
        opp = 0;
        break;
      }

      opp = opp.toString(16);

      return opp.length === 1 ? '0' + opp : opp;
    }

    // slice off initial #
    color = color.slice(1);

    if (color.length === 3) {
      // convert rgb to rrggbb
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    // calculate opposite colors
    var r = opposite(color.slice(0, 2));
    var g = opposite(color.slice(2, 4));
    var b = opposite(color.slice(4, 6));

    return '#' + r + g + b;
  }

  function showInstructions (show) {

    if (show) {
      instructionsElem.style.color = calcOppositeHexColor(backgroundElem.value);

      instructionsElem.style.display = 'block';
    } else {
      instructionsElem.style.display = 'none';
    }
  }

  function resize (ctx) {

    var imageData;

    var realToCSSPixels = window.devicePixelRatio;

    var displayWidth  = Math.floor(ctx.canvas.clientWidth * realToCSSPixels);
    var displayHeight = Math.floor(ctx.canvas.clientHeight * realToCSSPixels);

    if (inhibitResize) {
      return;
    }

    if (ctx.canvas.width !== displayWidth ||
        ctx.canvas.height !== displayHeight) {

      if (!isClean) {
        imageData = context.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      }

      ctx.canvas.width  = displayWidth;
      ctx.canvas.height = displayHeight;

      colorElem.style.width = clearElem.clientWidth + 'px';
      colorElem.style.height = clearElem.clientHeight + 'px';

      backgroundElem.style.width = clearElem.clientWidth + 'px';
      backgroundElem.style.height = clearElem.clientHeight + 'px';

      if (isClean) {
        showInstructions(true);
      } else {
        showInstructions(false);
        context.putImageData(imageData, 0, 0);
      }

      return true;
    }

    return false;
  }

  function calcDistance(point1, point2) {

    var deltaX = point2.x - point1.x;
    var deltaY = point2.y - point1.y;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  function calcMousePos(e, element, isTouch) {

    var top = 0;
    var left = 0;

    var mousePos = {};

    var canvasScaleX = canvasElem.clientWidth / canvasElem.width;
    var canvasScaleY = canvasElem.clientHeight / canvasElem.height;

    if (isTouch) {
      mousePos.x = (e.targetTouches[0].pageX - element.offsetLeft) / canvasScaleX;
      mousePos.y = (e.targetTouches[0].pageY - element.offsetTop) / canvasScaleY;

      return mousePos;
    }
    // get canvas position
    while (element.tagName != 'BODY') {

      top += element.offsetTop;
      left += element.offsetLeft;

      element = element.offsetParent;
    }

    // return relative mouse position
    mousePos.x = (e.clientX - left + window.pageXOffset) / canvasScaleX;
    mousePos.y = (e.clientY - top + window.pageYOffset) / canvasScaleY;

    return mousePos;

  }

  function fromPolar(mag, angle) {

    return {x: Math.cos(angle) * mag, y: Math.sin(angle) * mag};

  }

  function calcPoints(stationaryPoint, point, lineLength) {

    var radius = calcDistance(stationaryPoint, point);
    var angle = Math.PI * (radius / divisor);

    var point1 = fromPolar(lineLength, angle);
    var point2 = fromPolar(lineLength, angle + Math.PI);

    return {
      point1: { x: point.x + point1.x, y: point.y + point1.y },
      point2: {x: point.x + point2.x, y: point.y + point2.y}
    };
  }

  function mouseMove(e, isTouch) {

    var newMousePos;
    var points;

    if (isTouch) {
      e.preventDefault();
    }

    if (!mouseIsDown) {
      return;
    }

    newMousePos = calcMousePos(e, canvasElem, isTouch);

    if (calcDistance(newMousePos, mousePos) < separation) {
      return;
    }

    if (mousePos) {
      prevMousePos = mousePos;
    }

    mousePos = newMousePos;

    mousePos.x = Math.min(mousePos.x, canvasElem.width);
    mousePos.y = Math.min(mousePos.y, canvasElem.height);

    if (prevMousePos !== null) {

      showInstructions(false);

      points = calcPoints(mouseDownPos, mousePos, length);

      context.strokeStyle = color;

      context.beginPath();
      context.moveTo(points.point1.x, points.point1.y);
      context.lineTo(points.point2.x, points.point2.y);

      context.stroke();

      if (isClean) {
        isClean = false;
        context.clearRect(0, 0, canvasElem.width, canvasElem.height);
      }
    }
  }

  function mouseDown(e, isTouch) {

    mouseDownPos = calcMousePos(e, canvasElem, isTouch);
    mouseIsDown = true;
    mousePos = mouseDownPos;

    if (isTouch) {
      e.preventDefault();
    }
  }

  function mouseUp(e, isTouch) {

    mouseIsDown = false;

    if (isTouch) {
      e.preventDefault();
    }
  }

  function clear() {

    isClean = true;

    context.clearRect(0, 0, canvasElem.width, canvasElem.height);

    showInstructions(true);
  }

  function lengthChange() {
    length = lengthElem.value;
  }

  function separationChange() {
    separation = separationElem.value;
  }

  function divisorChange() {
    divisor = divisorElem.value;
  }

  function colorChange() {
    color = colorElem.value;
  }

  function backgroundChange() {
    canvasElem.style.backgroundColor = backgroundElem.value;
    showInstructions(isClean);
  }

  function numberFocus () {
    inhibitResize = true;
  }

  function numberBlur () {
    inhibitResize = false;
  }

  function reset() {

    lengthElem.value = LINE_LENGTH;
    separationElem.value = MINIMUM_LINE_SEPARATION;
    divisorElem.value = ANGLE_DIVISOR;
    colorElem.value = FUCHSIA;
    backgroundElem.value = BLACK;

    lengthChange();
    separationChange();
    divisorChange();
    colorChange();
    backgroundChange();

    resize(context);
  }

  window.addEventListener('load', function () {

    clearElem = document.getElementById('clear');
    resetElem = document.getElementById('reset');

    lengthElem = document.getElementById('length');

    separationElem = document.getElementById('separation');
    divisorElem = document.getElementById('divisor');

    colorElem = document.getElementById('color');
    backgroundElem = document.getElementById('background');

    canvasElem = document.getElementById('canvas');
    context = canvasElem.getContext('2d');

    instructionsElem = document.getElementById('instructions');

    reset();

    window.addEventListener('resize', function () {
      resize(context);
    });

    clearElem.addEventListener('click', clear, false);
    resetElem.addEventListener('click', reset, false);

    lengthElem.addEventListener('change', lengthChange, false);

    separationElem.addEventListener('input', separationChange, false);
    divisorElem.addEventListener('input', divisorChange, false);
    colorElem.addEventListener('input', colorChange, false);
    backgroundElem.addEventListener('input', backgroundChange, false);

    lengthElem.addEventListener('focus', numberFocus, false);
    lengthElem.addEventListener('blur', numberBlur, false);

    separationElem.addEventListener('focus', numberFocus, false);
    separationElem.addEventListener('blur', numberBlur, false);

    divisorElem.addEventListener('focus', numberFocus, false);
    divisorElem.addEventListener('blur', numberBlur, false);

    canvasElem.addEventListener('mousedown', function(e) { mouseDown(e, false); }, false);
    canvasElem.addEventListener('mousemove', function(e) { mouseMove(e, false); }, false);
    canvasElem.addEventListener('mouseup', function(e) { mouseUp(e, false); }, false);
    canvasElem.addEventListener('mouseleave', function(e) { mouseUp(e, false); }, false);

    canvasElem.addEventListener('touchstart', function(e) { mouseDown(e, true); }, false);
    canvasElem.addEventListener('touchmove', function(e) { mouseMove(e, true); }, false);
    canvasElem.addEventListener('touchend', function (e) { mouseUp(e, true); }, false);

  }, false);
}());
