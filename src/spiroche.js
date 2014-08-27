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
        divElem,
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
    function calcMousePos(e) {
        var top = 0,
            left = 0,
            obj = canvasElem;

        // get canvas position
        while (obj.tagName != 'BODY') {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        // return relative mouse position
        return {x: e.clientX - left + window.pageXOffset, y: e.clientY - top + window.pageYOffset};
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
    function mouseMove(e) {
        var newMousePos,
            points;

        if (!mouseIsDown) {
            return;
        }
        newMousePos = calcMousePos(e);
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
    function mouseDown(e) {
        mouseDownPos = calcMousePos(e);
        mouseIsDown = true;
        mousePos = mouseDownPos;
        startingPointAngle = 0;
    }
    function mouseUp() {
        mouseIsDown = false;
    }
    function drawInstructions() {
        context.save();
        context.fillStyle = GRAY;
        context.font = FONT;
        context.fillText(INSTRUCTIONS, (canvasElem.width - context.measureText(INSTRUCTIONS).width) / 2,
            canvasElem.height / 2);
        context.restore();
    }
    function resize() {
        var imageData;

        if (clean) {
            canvasElem.width = window.innerWidth;
            canvasElem.height = window.innerHeight - divElem.offsetHeight;
            drawInstructions();
        } else {
            imageData = context.getImageData(0, 0, canvasElem.width, canvasElem.height);
            canvasElem.width = window.innerWidth;
            canvasElem.height = window.innerHeight - divElem.offsetHeight;
            context.putImageData(imageData, 0, 0);
        }
    }
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
        divElem = document.getElementById('div');
        clearElem = document.getElementById('clear');
        resetElem = document.getElementById('reset');
        lineLengthElem = document.getElementById('lineLength');
        minimumLineSeparationElem = document.getElementById('minimumLineSeparation');
        angleDivisorElem = document.getElementById('angleDivisor');
        colorElem = document.getElementById('color');
        clearElem.addEventListener('click', clear, false);
        resetElem.addEventListener('click', reset, false);
        lineLengthElem.addEventListener('change', lineLengthChange, false);
        minimumLineSeparationElem.addEventListener('change', minimumLineSeparationChange, false);
        angleDivisorElem.addEventListener('change', angleDivisorChange, false);
        colorElem.addEventListener('change', colorChange, false);
        canvasElem = document.getElementById('canvas');
        context = canvasElem.getContext('2d');
        resize();
        reset();
        canvasElem.addEventListener('mousedown', mouseDown, false);
        canvasElem.addEventListener('mousemove', mouseMove, false);
        canvasElem.addEventListener('mouseup', mouseUp, false);
        canvasElem.addEventListener('mouseleave', mouseUp, false);
        window.addEventListener('resize', resize, false);
    }, false);
}());