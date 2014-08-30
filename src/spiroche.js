/**
 * Created by Scott on 8/24/14.
 */

(function() {
    'use strict';

    var LINE_LENGTH = 200,
        MINIMUM_LINE_SEPARATION = 6,
        ANGLE_DIVISOR = 300,
        BLACK='rgb(0, 0, 0)',
        GRAY = 'rgb(100, 100, 100)',
        FONT = 'normal 30pt "Droid Sans", sans-serif',
        INSTRUCTIONS = 'Click and drag mouse in this space to draw',
        lineLength,
        minimumLineSeparation,
        angleDivisor,
        color,
        menuClearElem,
        menuResetElem,
        clearElem,
        resetElem,
        lineLengthElem,
        minimumLineSeparationElem,
        angleDivisorElem,
        colorElem,
        canvasElem,
        context,
        mouseDownPos,
        mousePos = null,
        prevMousePos,
        mouseIsDown = false,
        clean = true,
        startingPointAngle;

    function calcDistance(point1, point2) {
        var deltaX = point2.x - point1.x,
            deltaY = point2.y - point1.y;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    function calcMousePos(e, element, isTouch) {
        var top = 0,
            left = 0,
            mousePos = {};

        if (isTouch) {
            mousePos.x = e.targetTouches[0].pageX - element.offsetLeft;
            mousePos.y = e.targetTouches[0].pageY - element.offsetTop;
            return mousePos;
        }
        // get canvas position
        while (element.tagName != 'BODY') {

            top += element.offsetTop;
            left += element.offsetLeft;

            element = element.offsetParent;
        }
        // return relative mouse position
        mousePos.x = e.clientX - left + window.pageXOffset;
        mousePos.y = e.clientY - top + window.pageYOffset;
        return mousePos;
    }
    function fromPolar(mag, angle) {
        return {x: Math.cos(angle) * mag, y: Math.sin(angle) * mag};
    }
    function calcPoints(stationaryPoint, point, lineLength) {
        var radius = calcDistance(stationaryPoint, point),
            angle = Math.PI * (radius / angleDivisor),
            point1 = fromPolar(lineLength, angle),
            point2 = fromPolar(lineLength, angle + Math.PI);

        return {point1: {x: point.x + point1.x, y: point.y + point1.y},
            point2: {x: point.x + point2.x, y: point.y + point2.y}};
    }
    function mouseMove(e, isTouch) {
        var newMousePos,
            points;

        if (isTouch) {
            e.preventDefault();
        }
        if (!mouseIsDown) {
            return;
        }
        newMousePos = calcMousePos(e, canvasElem, isTouch);
        if (calcDistance(newMousePos, mousePos) < minimumLineSeparation) {
            return;
        }
        if (mousePos) {
            prevMousePos = mousePos;
        }
        mousePos = newMousePos;
        mousePos.x = Math.min(mousePos.x, canvasElem.width);
        mousePos.y = Math.min(mousePos.y, canvasElem.height);
        if (prevMousePos !== null) {
            points = calcPoints(mouseDownPos, mousePos, lineLength);
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(points.point1.x, points.point1.y);
            context.lineTo(points.point2.x, points.point2.y);
            context.stroke();
            if (clean) {
                clean = false;
                context.clearRect(0, 0, canvasElem.width, canvasElem.height);
            }
        }
    }
    function mouseDown(e, isTouch) {
        mouseDownPos = calcMousePos(e, canvasElem, isTouch);
        mouseIsDown = true;
        mousePos = mouseDownPos;
        startingPointAngle = 0;
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
    function drawInstructions() {
        context.save();
        context.fillStyle = GRAY;
        context.font = FONT;
        context.fillText(INSTRUCTIONS, (canvasElem.width - context.measureText(INSTRUCTIONS).width) / 2,
            canvasElem.height / 2);
        context.restore();
    }
//    function resize() {
//        var imageData;
//
//        if (clean) {
//            canvasElem.width = window.innerWidth;
//            canvasElem.height = window.innerHeight - divElem.offsetHeight;
//            drawInstructions();
//        } else {
//            imageData = context.getImageData(0, 0, canvasElem.width, canvasElem.height);
//            canvasElem.width = window.innerWidth;
//            canvasElem.height = window.innerHeight - divElem.offsetHeight;
//            context.putImageData(imageData, 0, 0);
//        }
//    }
    function clear() {
        clean = true;
        context.clearRect(0, 0, canvasElem.width, canvasElem.height);
        drawInstructions();
    }
    function lineLengthChange() {
        lineLength = lineLengthElem.value;
    }
    function minimumLineSeparationChange() {
        minimumLineSeparation = minimumLineSeparationElem.value;
    }
    function angleDivisorChange() {
        angleDivisor = angleDivisorElem.value;
    }
    function colorChange() {
        color = colorElem.value;
    }
    function reset() {
        lineLengthElem.value = LINE_LENGTH;
        minimumLineSeparationElem.value = MINIMUM_LINE_SEPARATION;
        angleDivisorElem.value = ANGLE_DIVISOR;
        colorElem.value = BLACK;
        lineLengthChange();
        minimumLineSeparationChange();
        angleDivisorChange();
        colorChange();
    }
    window.addEventListener('load', function () {
        menuClearElem = document.getElementById('menuClear');
        menuResetElem = document.getElementById('menuReset');
        clearElem = document.getElementById('clear');
        resetElem = document.getElementById('reset');
        lineLengthElem = document.getElementById('lineLength');
        minimumLineSeparationElem = document.getElementById('minimumLineSeparation');
        angleDivisorElem = document.getElementById('angleDivisor');
        menuClearElem.addEventListener('click', clear, false);
        menuResetElem.addEventListener('click', reset, false);
        colorElem = document.getElementById('color');
        clearElem.addEventListener('click', clear, false);
        resetElem.addEventListener('click', reset, false);
        lineLengthElem.addEventListener('change', lineLengthChange, false);
//        minimumLineSeparationElem.addEventListener('change', minimumLineSeparationChange, false);
//        angleDivisorElem.addEventListener('change', angleDivisorChange, false);
//        lineLengthElem.addEventListener('change', lineLengthChange, false);
        minimumLineSeparationElem.addEventListener('input', minimumLineSeparationChange, false);
        angleDivisorElem.addEventListener('input', angleDivisorChange, false);
        colorElem.addEventListener('input', colorChange, false);
        canvasElem = document.getElementById('canvas');
        context = canvasElem.getContext('2d');
        drawInstructions();
        reset();
        canvasElem.addEventListener('mousedown', function(e) { mouseDown(e, false); }, false);
        canvasElem.addEventListener('mousemove', function(e) { mouseMove(e, false); }, false);
        canvasElem.addEventListener('mouseup', function(e) { mouseUp(e, false); }, false);
        canvasElem.addEventListener('mouseleave', function(e) { mouseUp(e, false); }, false);
        canvasElem.addEventListener('touchstart', function(e) { mouseDown(e, true); }, false);
        canvasElem.addEventListener('touchmove', function(e) { mouseMove(e, true); }, false);
        canvasElem.addEventListener('touchend', function (e) { mouseUp(e, true); }, false);
    }, false);
}());