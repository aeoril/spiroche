/**
 * Created by Scott on 8/24/14.
 */

(function() {
    'use strict';

    var LINE_LENGTH = 200,
        MINIMUM_LINE_SEPARATION = 6,
        ANGLE_DIVISOR = 300,
        BLACK='rgb(0, 0, 0)',
        GRAY = 'rgb(128, 128, 128)',//'rgb(100, 100, 100)',
        FONT = 'normal 48pt "Droid Sans", sans-serif',
        INSTRUCTIONS = 'Drag pointer or finger here to draw',
        length,
        separation,
        divisor,
        color,
        sizeElem,
        isSizable = false,
        menuClearElem,
        menuResetElem,
        clearElem,
        resetElem,
        lengthElem,
        separationElem,
        divisorElem,
        colorElem,
        canvasElem,
        context,
        mouseDownPos,
        mousePos = null,
        prevMousePos,
        mouseIsDown = false,
        isClean = true,
        startingPointAngle;

    function calcDistance(point1, point2) {
        var deltaX = point2.x - point1.x,
            deltaY = point2.y - point1.y;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    function calcMousePos(e, element, isTouch) {
        var top = 0,
            left = 0,
            mousePos = {},
            canvasScale = canvasElem.clientWidth / canvasElem.width;

        if (isTouch) {
            mousePos.x = (e.targetTouches[0].pageX - element.offsetLeft) / canvasScale;
            mousePos.y = (e.targetTouches[0].pageY - element.offsetTop) / canvasScale;
            return mousePos;
        }
        // get canvas position
        while (element.tagName != 'BODY') {

            top += element.offsetTop;
            left += element.offsetLeft;

            element = element.offsetParent;
        }
        // return relative mouse position
        mousePos.x = (e.clientX - left + window.pageXOffset) / canvasScale;
        mousePos.y = (e.clientY - top + window.pageYOffset) / canvasScale;
        return mousePos;
    }
    function fromPolar(mag, angle) {
        return {x: Math.cos(angle) * mag, y: Math.sin(angle) * mag};
    }
    function calcPoints(stationaryPoint, point, lineLength) {
        var radius = calcDistance(stationaryPoint, point),
            angle = Math.PI * (radius / divisor),
            point1 = fromPolar(lineLength, angle),
            point2 = fromPolar(lineLength, angle + Math.PI);

        return {point1: {x: point.x + point1.x, y: point.y + point1.y},
            point2: {x: point.x + point2.x, y: point.y + point2.y}};
    }
    function drawInstructions() {
        if (isSizable) {
            return;
        }
        context.save();
        context.fillStyle = GRAY;
        context.font = FONT;
        context.fillText(INSTRUCTIONS, (canvasElem.width - context.measureText(INSTRUCTIONS).width) / 2,
            canvasElem.height / 2);
        context.restore();
    }
    function sizeClick() {
        if (isSizable) {
            isSizable = false;
            if (isClean) {
                drawInstructions();
            }
            sizeElem.value = 'Size';
        } else {
            isSizable = true;
            mouseIsDown = false;
            if (isClean) {
                context.clearRect(0, 0, canvasElem.width, canvasElem.height);
            }
            sizeElem.value = 'Draw';
        }
    }
    function mouseMove(e, isTouch) {
        var newMousePos,
            points;
        if (isSizable) {
            return;
        }
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
        if (isSizable) {
            return;
        }
        mouseDownPos = calcMousePos(e, canvasElem, isTouch);
        mouseIsDown = true;
        mousePos = mouseDownPos;
        startingPointAngle = 0;
        if (isTouch) {
            e.preventDefault();
        }
    }
    function mouseUp(e, isTouch) {
        if (isSizable) {
            return;
        }
        mouseIsDown = false;
        if (isTouch) {
            e.preventDefault();
        }
    }
    function clear() {
        isClean = true;
        context.clearRect(0, 0, canvasElem.width, canvasElem.height);
        drawInstructions();
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
    function reset() {
        lengthElem.value = LINE_LENGTH;
        separationElem.value = MINIMUM_LINE_SEPARATION;
        divisorElem.value = ANGLE_DIVISOR;
        colorElem.value = BLACK;
        lengthChange();
        separationChange();
        divisorChange();
        colorChange();
    }
    window.addEventListener('load', function () {
        sizeElem = document.getElementById('size');
        menuClearElem = document.getElementById('menuClear');
        menuResetElem = document.getElementById('menuReset');
        clearElem = document.getElementById('clear');
        resetElem = document.getElementById('reset');
        lengthElem = document.getElementById('length');
        separationElem = document.getElementById('separation');
        divisorElem = document.getElementById('divisor');
        menuClearElem.addEventListener('click', clear, false);
        menuResetElem.addEventListener('click', reset, false);
        colorElem = document.getElementById('color');
        canvasElem = document.getElementById('canvas');
        context = canvasElem.getContext('2d');
        drawInstructions();
        reset();
        sizeElem.addEventListener('click', sizeClick, false);
        clearElem.addEventListener('click', clear, false);
        resetElem.addEventListener('click', reset, false);
        lengthElem.addEventListener('change', lengthChange, false);
        separationElem.addEventListener('input', separationChange, false);
        divisorElem.addEventListener('input', divisorChange, false);
        colorElem.addEventListener('input', colorChange, false);
        canvasElem.addEventListener('mousedown', function(e) { mouseDown(e, false); }, false);
        canvasElem.addEventListener('mousemove', function(e) { mouseMove(e, false); }, false);
        canvasElem.addEventListener('mouseup', function(e) { mouseUp(e, false); }, false);
        canvasElem.addEventListener('mouseleave', function(e) { mouseUp(e, false); }, false);
        canvasElem.addEventListener('touchstart', function(e) { mouseDown(e, true); }, false);
        canvasElem.addEventListener('touchmove', function(e) { mouseMove(e, true); }, false);
        canvasElem.addEventListener('touchend', function (e) { mouseUp(e, true); }, false);
    }, false);
}());