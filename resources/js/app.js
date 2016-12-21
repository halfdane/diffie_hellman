(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.dh = window.dh || {};
window.dh.intro = require("./intro.js");
window.dh.exponential = require("./exponential.js");
window.dh.elliptic2 = require("./elliptic2.js");

},{"./elliptic2.js":2,"./exponential.js":3,"./intro.js":4}],2:[function(require,module,exports){
"use strict";

var stepper = require("./stepper.js")();
var strokewidth = 3;

var a = undefined;
var b = undefined;

function f(x) {
    return Math.sqrt(x * x * x + a.Value() * x + b.Value());
}

function inverseF(x) {
    return -f(x);
}

function init(target) {
    target.style.height = "700px";
    target.style.width = "700px";
    var board = JXG.JSXGraph.initBoard(target.id, {
        boundingbox: [-5, 5, 5, -5],
        axis: true,
        showCopyright: false
    });

    a = board.create("slider", [[0, -3], [4, -3], [-5, -3, 5]]);
    b = board.create("slider", [[0, -4], [4, -4], [-5, 3, 5]]);

    var graph1 = board.create("functiongraph", [f], { strokeWidth: strokewidth });
    var graph2 = board.create("functiongraph", [inverseF], { strokeWidth: strokewidth });

    var originalPoint = undefined,
        point = undefined,
        tangent = undefined,
        intersect = undefined;

    stepper.use([function () {
        originalPoint = point = board.create("glider", [graph1]);
    }, function () {
        tangent = board.create("tangent", [point], { strokeColor: "#ff0000", dash: 2, strokeWidth: strokewidth });
    }, function () {
        intersect = board.create("intersection", [graph1, tangent, 0]);
    }, function () {
        point = board.create("glider", [function () {
            return intersect.X();
        }, function () {
            return -intersect.Y();
        }, graph2]);
        board.create("line", [intersect, point], { dash: 3, straightFirst: false, straightLast: false, strokeWidth: strokewidth, lastArrow: true });
    }, function () {
        var target = -1.26;
        originalPoint.moveTo([target, f(target)], 2000);
    }, function () {
        tangent = board.create("tangent", [point], { strokeColor: "#ff0000", dash: 2, strokeWidth: strokewidth });
        intersect = board.create("intersection", [graph1, tangent, 0]);
    }, function () {
        point = board.create("glider", [function () {
            return intersect.X();
        }, function () {
            return -intersect.Y();
        }, graph2]);
        board.create("line", [intersect, point], { dash: 3, straightFirst: false, straightLast: false, strokeWidth: strokewidth, lastArrow: true });
    }, function () {
        tangent = board.create("tangent", [point], { strokeColor: "#ff0000", dash: 2, strokeWidth: strokewidth });
        intersect = board.create("intersection", [graph2, tangent, 0]);
    }, function () {
        point = board.create("glider", [function () {
            return intersect.X();
        }, function () {
            return -intersect.Y();
        }, graph1]);
        board.create("line", [intersect, point], { dash: 3, straightFirst: false, straightLast: false, strokeWidth: strokewidth, lastArrow: true });
    }, function () {
        tangent = board.create("tangent", [point], { strokeColor: "#ff0000", dash: 2, strokeWidth: strokewidth });
        intersect = board.create("intersection", [graph1, tangent, 0]);
    }]);
}

module.exports = {
    init: init,
    hasMoreSteps: stepper.hasMoreSteps,
    step: stepper.step,
    stop: stepper.stop
};

},{"./stepper.js":5}],3:[function(require,module,exports){
"use strict";

var stepper = require("./stepper.js")();

function createScaler(canvasWidth, canvasHeight, ctx) {
    var iteration = undefined;

    var scaleX = undefined,
        scaleY = undefined;
    var targetMaxX = undefined,
        targetMaxY = undefined;
    var xStep = undefined,
        yStep = undefined;
    var maxX = 5,
        maxY = 100000;
    function draw(callback) {
        ctx.save();
        ctx.translate(0, canvasHeight);
        ctx.scale(scaleX, -scaleY);
        ctx.beginPath();

        callback(ctx, iteration, maxX, scaleX, scaleY);

        ctx.restore();

        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function zoomTo(newMaxX, newMaxY) {
        targetMaxX = newMaxX;
        targetMaxY = newMaxY;

        xStep = (targetMaxX - maxX) / 100;
        yStep = (targetMaxY - maxY) / 100;

        zoomStep(maxX, maxY);
    }

    function set(newMaxX, newMaxY) {
        maxX = newMaxX;
        maxY = newMaxY;
        iteration = newMaxX / 1000;

        scaleX = canvasWidth / newMaxX;
        scaleY = canvasHeight / newMaxY;
    }

    function zoomStep() {
        var xDiff = Math.abs(targetMaxX - maxX);
        var yDiff = Math.abs(targetMaxY - maxY);

        if (xDiff > 0.1 || yDiff > 0.1) {
            if (xDiff > 0.1) {
                maxX += xStep;
            }
            if (yDiff > 0.1) {
                maxY += yStep;
            }
            set(maxX, maxY);
        }
    }

    return {
        set: set,
        draw: draw,
        zoomTo: zoomTo,
        zoomStep: zoomStep
    };
}

function createAxes(canvasWidth, canvasHeight, ctx) {
    function draw() {
        ctx.save();
        ctx.translate(0, canvasHeight);
        ctx.scale(1, -1);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvasWidth, 0);
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvasHeight);
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    return {
        draw: draw
    };
}

function createEquation(scaled) {
    var equationFunction = undefined;

    function set(newEquationFunction) {
        equationFunction = newEquationFunction;
    }

    function calculate(x) {
        return equationFunction(x);
    }

    function draw() {
        scaled.draw(function (ctx, iteration, maxX, scaleX, scaleY) {
            for (var x = 0 + iteration; x <= maxX; x += iteration) {
                ctx.fillStyle = "blue";
                ctx.fillRect(x, equationFunction(x), 4 / scaleX, 4 / scaleY);
            }
        });
    }

    return {
        set: set,
        draw: draw,
        calculate: calculate
    };
}

function createHighLight(scaled, equation) {
    var animateHighlight = undefined;
    var shouldDrawHighlight = undefined;
    var currentHighlight = undefined;
    var highlightEnd = undefined;

    function reset() {
        animateHighlight = false;
        shouldDrawHighlight = false;
    }

    function activate(highlightStart) {
        shouldDrawHighlight = true;
        currentHighlight = highlightStart;
    }

    function animateTo(to) {
        animateHighlight = true;
        highlightEnd = to;
    }

    function draw() {
        if (!shouldDrawHighlight) {
            return;
        }

        scaled.draw(function (ctx, iteration) {
            if (currentHighlight > highlightEnd) {
                if (animateHighlight) {
                    currentHighlight -= iteration;
                }
            }

            var x = equation.calculate(currentHighlight);

            ctx.moveTo(currentHighlight, 0);
            ctx.lineTo(currentHighlight, x);

            ctx.moveTo(0, x);
            ctx.lineTo(currentHighlight, x);
            ctx.strokeStyle = "blue";
        });
    }

    return {
        reset: reset,
        activate: activate,
        animateTo: animateTo,
        draw: draw
    };
}

function init(canvas) {
    var ctx = canvas.getContext("2d");
    var scaled = createScaler(canvas.width, canvas.height, ctx);
    var equation = createEquation(scaled);
    var highLight = createHighLight(scaled, equation);

    scaled.set(500, 100);
    scaled.zoomTo(500, 100);
    highLight.reset();
    equation.set(function (x) {
        return 17 + x;
    });
    stepper.use([function () {
        return equation.set(function (x) {
            return 17 + x % 97;
        });
    }, function () {
        return equation.set(function (x) {
            return 17 * x;
        });
    }, function () {
        return equation.set(function (x) {
            return 17 * x % 97;
        });
    }, function () {
        return equation.set(function (x) {
            return Math.pow(17, x);
        });
    }, function () {
        highLight.reset();
        scaled.zoomTo(5, 100000);
    }, function () {
        return highLight.activate(4);
    }, function () {
        return highLight.animateTo(3);
    }, function () {
        highLight.reset();
        scaled.zoomTo(100, 100);
    }, function () {
        return equation.set(function (x) {
            return Math.pow(17, x) % 97;
        });
    }, function () {
        return highLight.activate(50);
    }, function () {
        return highLight.animateTo(30);
    }]);

    var axes = createAxes(canvas.width, canvas.height, ctx);

    function draw() {
        if (!stepper.isRunning()) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        axes.draw();
        equation.draw();
        highLight.draw();
        scaled.zoomStep();

        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
}

module.exports = {
    init: init,
    hasMoreSteps: stepper.hasMoreSteps,
    step: stepper.step,
    stop: stepper.stop
};

},{"./stepper.js":5}],4:[function(require,module,exports){
"use strict";

var createStepper = require("./stepper.js");

module.exports = (function () {

    var maxWidth, maxHeight, actorWidth;
    var halfWidth, halfHeight, halfActorWidth;

    var actorY, intruderY, messageY;

    function setSizes(canvas) {
        maxWidth = canvas.width;
        maxHeight = canvas.height;
        actorWidth = 100;

        halfWidth = maxWidth / 2;
        halfHeight = maxHeight / 2;
        halfActorWidth = actorWidth / 2;

        actorY = halfHeight - actorWidth;
        intruderY = maxHeight - 2 * actorWidth;
        messageY = actorY - 5;
    }

    function makeActivatable(something) {
        var active = false;
        var originalDraw = something.draw;

        something.draw = function (progress) {
            if (!!originalDraw && active) {
                originalDraw(progress);
            }
        };

        something.activate = function () {
            active = true;
        };

        something.deactivate = function () {
            active = false;
        };

        return something;
    }

    var createImages = function createImages(onComplete) {
        var images = ["resources/img/sean_connery.jpg", "resources/img/m.jpg", "resources/img/dr_no.jpg", "resources/img/client.jpg", "resources/img/ebay.png", "resources/img/hacker.jpg", "resources/img/otpbooklet.jpg"];
        var imageObjects = [];

        var loaded = 0;

        function onLoad() {
            loaded++;
            if (loaded === images.length) {
                onComplete({
                    jb: imageObjects[0],
                    m: imageObjects[1],
                    no: imageObjects[2],
                    client: imageObjects[3],
                    shop: imageObjects[4],
                    hacker: imageObjects[5],
                    codebook: imageObjects[6] });
            }
        }

        for (var i = 0; i < images.length; i++) {
            var img = new Image();
            img.addEventListener("load", onLoad);
            img.src = images[i];
            imageObjects.push(img);
        }
    };

    var createActor = function createActor(ctx, x, y, image, alternateImage) {
        var width = 100,
            currentImage = image;

        function draw() {
            var height = currentImage.height * (width / currentImage.width);
            ctx.drawImage(currentImage, x, y, width, height);
        }

        return makeActivatable({
            draw: draw,
            useJB: function useJB() {
                currentImage = alternateImage;
            },
            useNormal: function useNormal() {
                currentImage = image;
            }
        });
    };

    var createMessage = function createMessage(ctx, x, y, str) {
        var targetX, targetY, xStep, yStep, moveX, moveY, xOffset, yOffset, message;

        function draw(progress) {
            if (moveX(x + xOffset)) {
                xOffset += progress * xStep;
            }
            if (moveY(y + yOffset)) {
                yOffset += progress * yStep;
            }

            ctx.font = "48px serif";
            ctx.fillText(message, x + xOffset, y + yOffset);
        }

        function calcStep() {
            xStep = (targetX - x + xOffset) / maxWidth;
            if (targetX > x + xOffset) {
                moveX = function (x) {
                    return x < targetX;
                };
            } else {
                moveX = function (x) {
                    return x > targetX;
                };
            }

            yStep = (targetY - y + yOffset) / maxWidth;
            if (targetY > y + yOffset) {
                moveY = function (y) {
                    return y < targetY;
                };
            } else {
                moveY = function (y) {
                    return y > targetY;
                };
            }
        }

        function moveToHalf() {
            targetX = halfWidth - halfActorWidth;
            calcStep();
        }

        function moveToFull() {
            targetX = maxWidth - actorWidth - 40;
            calcStep();
        }

        function moveDown() {
            targetY = intruderY - 20;
            calcStep();
        }

        function setStart(newX, newY) {
            x = newX || x;
            y = newY || y;
            targetX = newX || x;
            targetY = newY || y;
            xStep = 1;
            yStep = 1;
            moveX = function (x) {
                return false;
            };
            moveY = function (y) {
                return false;
            };
            xOffset = 0;
            yOffset = 0;
            message = "7626";
            calcStep();
        }

        function setMessage(newMessage) {
            message = newMessage;
        }

        setStart();

        return makeActivatable({
            draw: draw,
            moveToHalf: moveToHalf,
            moveToFull: moveToFull,
            moveDown: moveDown,
            setStart: setStart,
            setMessage: setMessage
        });
    };

    var createProtocol = function createProtocol(ctx, y) {
        function draw() {
            ctx.beginPath();
            ctx.moveTo(actorWidth, y);
            ctx.lineTo(maxWidth - actorWidth, y);
            ctx.stroke();
        }

        return makeActivatable({ draw: draw });
    };

    var createProtocolDots = function createProtocolDots(ctx, y) {
        function draw() {
            ctx.beginPath();
            ctx.arc(halfWidth, y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        return makeActivatable({ draw: draw });
    };

    var createProtocolListener = function createProtocolListener(ctx, y1, y2) {
        function draw() {
            ctx.beginPath();
            ctx.moveTo(halfWidth, y1);
            ctx.lineTo(halfWidth, y2);
            ctx.stroke();
        }

        return makeActivatable({ draw: draw });
    };

    var steps = (function () {

        var running = false;
        var steps;
        var currentStep = 0;

        function init(client, server, intruder, message, messageCopy, protocol, protocolDots, protocolListener, codebook1, codebook2) {
            running = true;
            currentStep = 0;

            steps = [server.activate, message.activate, protocol.activate, message.moveToHalf, protocolDots.activate, function () {
                protocolListener.activate();
                intruder.activate();
            }, function () {
                message.moveToFull();
                messageCopy.activate();
                messageCopy.moveDown();
            }, function () {
                message.deactivate();
                message.setStart();
                protocol.deactivate();
                messageCopy.deactivate();
                messageCopy.setStart();
                protocolDots.deactivate();
                protocolListener.deactivate();
                client.useJB();
                server.deactivate();
                server.useJB();
                intruder.deactivate();
                intruder.useJB();
            }, function () {
                message.activate();
                server.activate();
                protocol.activate();
            }, function () {
                protocolDots.activate();
                protocolListener.activate();
                intruder.activate();
            }, function () {
                codebook1.activate();
                codebook2.activate();
            }, function () {
                message.setMessage("7626 + 60811");
            }, function () {
                message.setMessage(7626 + 60811);
                messageCopy.setMessage(7626 + 60811);
            }, message.moveToHalf, function () {
                message.moveToFull();
                messageCopy.activate();
                messageCopy.moveDown();
            }, function () {
                message.setStart(maxWidth - 3 * actorWidth);
                message.setMessage(7626 + 60811 + "- 60811");
            }, function () {
                message.setStart(maxWidth - actorWidth - 40);
                message.setMessage("7626");
            }, function () {
                message.setStart(1);
                messageCopy.deactivate();
                messageCopy.setStart(maxWidth - actorWidth);
                client.useNormal();
                server.useNormal();
                intruder.useNormal();
            }, function () {
                codebook1.deactivate();
                codebook2.deactivate();
            }, function () {
                message.setMessage("7626 + Key");
                messageCopy.activate();
                messageCopy.setMessage("Key");
            }];
        }

        function stop() {
            running = false;
        }

        function hasMoreSteps() {
            return running && currentStep < steps.length;
        }

        function step() {
            steps[currentStep++]();
        }

        function isRunning() {
            return running;
        }

        return {
            init: init,
            stop: stop,
            hasMoreSteps: hasMoreSteps,
            isRunning: isRunning,
            step: step
        };
    })();

    function init(canvas) {
        var ctx = canvas.getContext("2d");

        setSizes(canvas);

        createImages(function (images) {
            var client = createActor(ctx, 0, actorY, images.client, images.jb);
            client.activate();
            var server = createActor(ctx, maxWidth - actorWidth, actorY, images.shop, images.m);
            var intruder = createActor(ctx, halfWidth - halfActorWidth, intruderY, images.hacker, images.no);
            var codebook1 = createActor(ctx, 0, 40, images.codebook);
            var codebook2 = createActor(ctx, maxWidth - actorWidth, 40, images.codebook);
            var message = createMessage(ctx, 0, messageY, "orig");

            var messageCopy = createMessage(ctx, halfWidth - halfActorWidth, messageY, "copy");

            var protocol = createProtocol(ctx, actorY);
            var protocolDots = createProtocolDots(ctx, actorY);
            var protocolListener = createProtocolListener(ctx, actorY, intruderY);

            steps.init(client, server, intruder, message, messageCopy, protocol, protocolDots, protocolListener, codebook1, codebook2);

            window.requestAnimationFrame(draw);

            var lastTime;
            var progress;

            function draw(currentTime) {
                if (!steps.isRunning()) {
                    return;
                }

                if (!lastTime) {
                    lastTime = currentTime;
                }

                progress = currentTime - lastTime;
                lastTime = currentTime;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                client.draw(progress);
                server.draw(progress);
                intruder.draw(progress);
                message.draw(progress);
                messageCopy.draw(progress);
                protocol.draw(progress);
                protocolDots.draw(progress);
                protocolListener.draw(progress);
                codebook1.draw(progress);
                codebook2.draw(progress);

                window.requestAnimationFrame(draw);
            }
        });
    }

    return {
        init: init,
        hasMoreSteps: steps.hasMoreSteps,
        step: steps.step,
        stop: steps.stop
    };
})();

},{"./stepper.js":5}],5:[function(require,module,exports){
"use strict";

module.exports = function createStepper() {
    var running = false;
    var currentStep = 0;
    var steps, stopStep;

    function use(theseSteps, useThisStopStep) {
        steps = theseSteps;
        running = true;
        stopStep = useThisStopStep;
    }

    function stop() {
        running = false;
        if (!!stopStep) {
            stopStep();
        }
    }

    function hasMoreSteps() {
        return running && currentStep < steps.length;
    }

    function step() {
        steps[currentStep++]();
    }

    function isRunning() {
        return running;
    }

    return {
        use: use,
        stop: stop,
        hasMoreSteps: hasMoreSteps,
        isRunning: isRunning,
        step: step
    };
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvbWFpbi5qcyIsIi9ob21lL3RvbS9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9lbGxpcHRpYzIuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvaW50cm8uanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvc3RlcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7O0FDSGhELElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO0FBQzFDLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQzs7QUFFdEIsSUFBSSxDQUFDLFlBQUEsQ0FBQztBQUNOLElBQUksQ0FBQyxZQUFBLENBQUM7O0FBRU4sU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ1YsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Q0FD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QUMxQjs7QUFFRCxhQUFTLFNBQVMsR0FBRztBQUNqQixlQUFPLE9BQU8sQ0FBQztLQUNsQjs7QUFFRCxXQUFPO0FBQ0gsV0FBRyxFQUFFLEdBQUc7QUFDUixZQUFJLEVBQUUsSUFBSTtBQUNWLG9CQUFZLEVBQUUsWUFBWTtBQUMxQixpQkFBUyxFQUFFLFNBQVM7QUFDcEIsWUFBSSxFQUFFLElBQUk7S0FDYixDQUFBO0NBQ0osQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cuZGggPSB3aW5kb3cuZGggfHwge307XG53aW5kb3cuZGguaW50cm8gPSByZXF1aXJlKCcuL2ludHJvLmpzJyk7XG53aW5kb3cuZGguZXhwb25lbnRpYWwgPSByZXF1aXJlKCcuL2V4cG9uZW50aWFsLmpzJyk7XG53aW5kb3cuZGguZWxsaXB0aWMyID0gcmVxdWlyZSgnLi9lbGxpcHRpYzIuanMnKTtcblxuXG4iLCJjb25zdCBzdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJykoKTtcbmNvbnN0IHN0cm9rZXdpZHRoID0gMztcblxubGV0IGE7XG5sZXQgYjtcblxuZnVuY3Rpb24gZih4KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCAqIHggKyBhLlZhbHVlKCkgKiB4ICsgYi5WYWx1ZSgpKTtcbn1cblxuZnVuY3Rpb24gaW52ZXJzZUYoeCkge1xuICAgIHJldHVybiAtZih4KTtcbn1cblxuZnVuY3Rpb24gaW5pdCh0YXJnZXQpIHtcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0PVwiNzAwcHhcIjtcbiAgICB0YXJnZXQuc3R5bGUud2lkdGg9XCI3MDBweFwiO1xuICAgIGNvbnN0IGJvYXJkID0gSlhHLkpTWEdyYXBoLmluaXRCb2FyZCh0YXJnZXQuaWQsIHtcbiAgICAgICAgYm91bmRpbmdib3g6IFstNSwgNSwgNSwgLTVdLFxuICAgICAgICBheGlzOiB0cnVlLFxuICAgICAgICBzaG93Q29weXJpZ2h0OiBmYWxzZVxuICAgIH0pO1xuXG4gICAgYSA9IGJvYXJkLmNyZWF0ZSgnc2xpZGVyJywgW1swLCAtM10sIFs0LCAtM10sIFstNSwgLTMsIDVdXSk7XG4gICAgYiA9IGJvYXJkLmNyZWF0ZSgnc2xpZGVyJywgW1swLCAtNF0sIFs0LCAtNF0sIFstNSwgMywgNV1dKTtcblxuICAgIGNvbnN0IGdyYXBoMSA9IGJvYXJkLmNyZWF0ZSgnZnVuY3Rpb25ncmFwaCcsIFtmXSwge3N0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgIGNvbnN0IGdyYXBoMiA9IGJvYXJkLmNyZWF0ZSgnZnVuY3Rpb25ncmFwaCcsIFtpbnZlcnNlRl0sIHtzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcblxuICAgIGxldCBvcmlnaW5hbFBvaW50LCBwb2ludCxcbiAgICAgICAgICAgIHRhbmdlbnQsXG4gICAgICAgICAgICBpbnRlcnNlY3Q7XG5cbiAgICBzdGVwcGVyLnVzZShbXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIG9yaWdpbmFsUG9pbnQgPSBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgW2dyYXBoMV0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0YW5nZW50ID0gYm9hcmQuY3JlYXRlKCd0YW5nZW50JywgW3BvaW50XSwge3N0cm9rZUNvbG9yOiAnI2ZmMDAwMCcsIGRhc2g6IDIsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMl0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IC0xLjI2O1xuICAgICAgICAgICAgb3JpZ2luYWxQb2ludC5tb3ZlVG8oW3RhcmdldCwgZih0YXJnZXQpXSwgMjAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMl0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDIsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMV0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfVxuICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGhhc01vcmVTdGVwczogc3RlcHBlci5oYXNNb3JlU3RlcHMsXG4gICAgc3RlcDogc3RlcHBlci5zdGVwLFxuICAgIHN0b3A6IHN0ZXBwZXIuc3RvcFxufTsiLCJjb25zdCBzdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJykoKTtcblxuZnVuY3Rpb24gY3JlYXRlU2NhbGVyKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIGN0eCkge1xuICAgIGxldCBpdGVyYXRpb247XG5cbiAgICBsZXQgc2NhbGVYLCBzY2FsZVk7XG4gICAgbGV0IHRhcmdldE1heFgsIHRhcmdldE1heFk7XG4gICAgbGV0IHhTdGVwLCB5U3RlcDtcbiAgICBsZXQgbWF4WCA9IDUsIG1heFkgPSAxMDAwMDA7XG4gICAgZnVuY3Rpb24gZHJhdyhjYWxsYmFjaykge1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgIGN0eC5zY2FsZShzY2FsZVgsIC1zY2FsZVkpO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgY2FsbGJhY2soY3R4LCBpdGVyYXRpb24sIG1heFgsIHNjYWxlWCwgc2NhbGVZKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgICAgIGN0eC5saW5lSm9pbiA9ICdyb3VuZCc7XG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gem9vbVRvKG5ld01heFgsIG5ld01heFkpIHtcbiAgICAgICAgdGFyZ2V0TWF4WCA9IG5ld01heFg7XG4gICAgICAgIHRhcmdldE1heFkgPSBuZXdNYXhZO1xuXG4gICAgICAgIHhTdGVwID0gKHRhcmdldE1heFggLSBtYXhYKSAvIDEwMDtcbiAgICAgICAgeVN0ZXAgPSAodGFyZ2V0TWF4WSAtIG1heFkpIC8gMTAwO1xuXG4gICAgICAgIHpvb21TdGVwKG1heFgsIG1heFkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldChuZXdNYXhYLCBuZXdNYXhZKSB7XG4gICAgICAgIG1heFggPSBuZXdNYXhYO1xuICAgICAgICBtYXhZID0gbmV3TWF4WTtcbiAgICAgICAgaXRlcmF0aW9uID0gbmV3TWF4WCAvIDEwMDA7XG5cbiAgICAgICAgc2NhbGVYID0gY2FudmFzV2lkdGggLyBuZXdNYXhYO1xuICAgICAgICBzY2FsZVkgPSBjYW52YXNIZWlnaHQgLyBuZXdNYXhZO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHpvb21TdGVwKCkge1xuICAgICAgICBjb25zdCB4RGlmZiA9IE1hdGguYWJzKHRhcmdldE1heFggLSBtYXhYKTtcbiAgICAgICAgY29uc3QgeURpZmYgPSBNYXRoLmFicyh0YXJnZXRNYXhZIC0gbWF4WSk7XG5cbiAgICAgICAgaWYgKHhEaWZmID4gMC4xIHx8IHlEaWZmID4gMC4xKSB7XG4gICAgICAgICAgICBpZiAoeERpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICBtYXhYICs9IHhTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHlEaWZmID4gMC4xKSB7XG4gICAgICAgICAgICAgICAgbWF4WSArPSB5U3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldChtYXhYLCBtYXhZKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHNldCxcbiAgICAgICAgZHJhdyxcbiAgICAgICAgem9vbVRvLFxuICAgICAgICB6b29tU3RlcFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUF4ZXMoY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgY3R4KSB7XG4gICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBjYW52YXNIZWlnaHQpO1xuICAgICAgICBjdHguc2NhbGUoMSwgLTEpO1xuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgICAgY3R4LmxpbmVUbyhjYW52YXNXaWR0aCwgMCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjYWFhJztcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG4gICAgICAgIGN0eC5saW5lVG8oMCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNhYWEnO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZHJhd1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRXF1YXRpb24oc2NhbGVkKSB7XG4gICAgbGV0IGVxdWF0aW9uRnVuY3Rpb247XG5cbiAgICBmdW5jdGlvbiBzZXQobmV3RXF1YXRpb25GdW5jdGlvbikge1xuICAgICAgICBlcXVhdGlvbkZ1bmN0aW9uID0gbmV3RXF1YXRpb25GdW5jdGlvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxjdWxhdGUoeCkge1xuICAgICAgICByZXR1cm4gZXF1YXRpb25GdW5jdGlvbih4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBzY2FsZWQuZHJhdyhmdW5jdGlvbiAoY3R4LCBpdGVyYXRpb24sIG1heFgsIHNjYWxlWCwgc2NhbGVZKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMCArIGl0ZXJhdGlvbjsgeCA8PSBtYXhYOyB4ICs9IGl0ZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSc7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KHgsIGVxdWF0aW9uRnVuY3Rpb24oeCksIDQgLyBzY2FsZVgsIDQgLyBzY2FsZVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXQsXG4gICAgICAgIGRyYXcsXG4gICAgICAgIGNhbGN1bGF0ZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlSGlnaExpZ2h0KHNjYWxlZCwgZXF1YXRpb24pIHtcbiAgICBsZXQgYW5pbWF0ZUhpZ2hsaWdodDtcbiAgICBsZXQgc2hvdWxkRHJhd0hpZ2hsaWdodDtcbiAgICBsZXQgY3VycmVudEhpZ2hsaWdodDtcbiAgICBsZXQgaGlnaGxpZ2h0RW5kO1xuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIGFuaW1hdGVIaWdobGlnaHQgPSBmYWxzZTtcbiAgICAgICAgc2hvdWxkRHJhd0hpZ2hsaWdodCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFjdGl2YXRlKGhpZ2hsaWdodFN0YXJ0KSB7XG4gICAgICAgIHNob3VsZERyYXdIaWdobGlnaHQgPSB0cnVlO1xuICAgICAgICBjdXJyZW50SGlnaGxpZ2h0ID0gaGlnaGxpZ2h0U3RhcnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZVRvKHRvKSB7XG4gICAgICAgIGFuaW1hdGVIaWdobGlnaHQgPSB0cnVlO1xuICAgICAgICBoaWdobGlnaHRFbmQgPSB0bztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBpZiAoIXNob3VsZERyYXdIaWdobGlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlZC5kcmF3KGZ1bmN0aW9uIChjdHgsIGl0ZXJhdGlvbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRIaWdobGlnaHQgPiBoaWdobGlnaHRFbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0ZUhpZ2hsaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SGlnaGxpZ2h0IC09IGl0ZXJhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHggPSBlcXVhdGlvbi5jYWxjdWxhdGUoY3VycmVudEhpZ2hsaWdodCk7XG5cbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oY3VycmVudEhpZ2hsaWdodCwgMCk7XG4gICAgICAgICAgICBjdHgubGluZVRvKGN1cnJlbnRIaWdobGlnaHQsIHgpO1xuXG4gICAgICAgICAgICBjdHgubW92ZVRvKDAsIHgpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhjdXJyZW50SGlnaGxpZ2h0LCB4KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzZXQsXG4gICAgICAgIGFjdGl2YXRlLFxuICAgICAgICBhbmltYXRlVG8sXG4gICAgICAgIGRyYXdcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoY2FudmFzKSB7XG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY29uc3Qgc2NhbGVkID0gY3JlYXRlU2NhbGVyKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCwgY3R4KTtcbiAgICBjb25zdCBlcXVhdGlvbiA9IGNyZWF0ZUVxdWF0aW9uKHNjYWxlZCk7XG4gICAgY29uc3QgaGlnaExpZ2h0ID0gY3JlYXRlSGlnaExpZ2h0KHNjYWxlZCwgZXF1YXRpb24pO1xuXG4gICAgc2NhbGVkLnNldCg1MDAsIDEwMCk7XG4gICAgc2NhbGVkLnpvb21Ubyg1MDAsIDEwMCk7XG4gICAgaGlnaExpZ2h0LnJlc2V0KCk7XG4gICAgZXF1YXRpb24uc2V0KHggPT4gMTcgKyB4KTtcbiAgICBzdGVwcGVyLnVzZShbXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IDE3ICsgeCAlIDk3KSxcbiAgICAgICAgKCkgPT4gZXF1YXRpb24uc2V0KHggPT4gMTcgKiB4KSxcbiAgICAgICAgKCkgPT4gZXF1YXRpb24uc2V0KHggPT4gMTcgKiB4ICUgOTcpLFxuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiBNYXRoLnBvdygxNywgeCkpLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBoaWdoTGlnaHQucmVzZXQoKTtcbiAgICAgICAgICAgIHNjYWxlZC56b29tVG8oNSwgMTAwMDAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gaGlnaExpZ2h0LmFjdGl2YXRlKDQpLFxuICAgICAgICAoKSA9PiBoaWdoTGlnaHQuYW5pbWF0ZVRvKDMpLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBoaWdoTGlnaHQucmVzZXQoKTtcbiAgICAgICAgICAgIHNjYWxlZC56b29tVG8oMTAwLCAxMDApO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiBNYXRoLnBvdygxNywgeCkgJSA5NyksXG4gICAgICAgICgpID0+IGhpZ2hMaWdodC5hY3RpdmF0ZSg1MCksXG4gICAgICAgICgpID0+IGhpZ2hMaWdodC5hbmltYXRlVG8oMzApXG4gICAgXSk7XG5cbiAgICBjb25zdCBheGVzID0gY3JlYXRlQXhlcyhjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQsIGN0eCk7XG5cbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBpZiAoIXN0ZXBwZXIuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgYXhlcy5kcmF3KCk7XG4gICAgICAgIGVxdWF0aW9uLmRyYXcoKTtcbiAgICAgICAgaGlnaExpZ2h0LmRyYXcoKTtcbiAgICAgICAgc2NhbGVkLnpvb21TdGVwKCk7XG5cbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgICB9XG5cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGhhc01vcmVTdGVwczogc3RlcHBlci5oYXNNb3JlU3RlcHMsXG4gICAgc3RlcDogc3RlcHBlci5zdGVwLFxuICAgIHN0b3A6IHN0ZXBwZXIuc3RvcFxufTsiLCJjb25zdCBjcmVhdGVTdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gIChmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgbWF4V2lkdGgsIG1heEhlaWdodCwgYWN0b3JXaWR0aDtcbiAgICB2YXIgaGFsZldpZHRoLCBoYWxmSGVpZ2h0LCBoYWxmQWN0b3JXaWR0aDtcblxuICAgIHZhciBhY3RvclksIGludHJ1ZGVyWSwgbWVzc2FnZVk7XG5cbiAgICBmdW5jdGlvbiBzZXRTaXplcyhjYW52YXMpIHtcbiAgICAgICAgbWF4V2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgICAgIG1heEhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGFjdG9yV2lkdGggPSAxMDA7XG5cbiAgICAgICAgaGFsZldpZHRoID0gbWF4V2lkdGggLyAyO1xuICAgICAgICBoYWxmSGVpZ2h0ID0gbWF4SGVpZ2h0IC8gMjtcbiAgICAgICAgaGFsZkFjdG9yV2lkdGggPSBhY3RvcldpZHRoIC8gMjtcblxuICAgICAgICBhY3RvclkgPSBoYWxmSGVpZ2h0LWFjdG9yV2lkdGg7XG4gICAgICAgIGludHJ1ZGVyWSA9IG1heEhlaWdodC0yKmFjdG9yV2lkdGg7XG4gICAgICAgIG1lc3NhZ2VZID0gYWN0b3JZLTU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUFjdGl2YXRhYmxlKHNvbWV0aGluZykge1xuICAgICAgICB2YXIgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHZhciBvcmlnaW5hbERyYXcgPSBzb21ldGhpbmcuZHJhdztcblxuICAgICAgICBzb21ldGhpbmcuZHJhdyA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKCEhb3JpZ2luYWxEcmF3ICYmIGFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsRHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc29tZXRoaW5nLmFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBzb21ldGhpbmcuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzb21ldGhpbmc7XG4gICAgfVxuXG4gICAgdmFyIGNyZWF0ZUltYWdlcyA9IGZ1bmN0aW9uIChvbkNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBpbWFnZXMgPSBbXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9zZWFuX2Nvbm5lcnkuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL20uanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2RyX25vLmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9jbGllbnQuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2ViYXkucG5nJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2hhY2tlci5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvb3RwYm9va2xldC5qcGcnLFxuICAgICAgICBdO1xuICAgICAgICB2YXIgaW1hZ2VPYmplY3RzID0gW107XG5cbiAgICAgICAgdmFyIGxvYWRlZCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAgICAgbG9hZGVkKys7XG4gICAgICAgICAgICBpZiAobG9hZGVkID09PSBpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb25Db21wbGV0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGpiOiBpbWFnZU9iamVjdHNbMF0sXG4gICAgICAgICAgICAgICAgICAgIG06IGltYWdlT2JqZWN0c1sxXSxcbiAgICAgICAgICAgICAgICAgICAgbm86IGltYWdlT2JqZWN0c1syXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50OiBpbWFnZU9iamVjdHNbM10sXG4gICAgICAgICAgICAgICAgICAgIHNob3A6IGltYWdlT2JqZWN0c1s0XSxcbiAgICAgICAgICAgICAgICAgICAgaGFja2VyOiBpbWFnZU9iamVjdHNbNV0sXG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rOiBpbWFnZU9iamVjdHNbNl0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZCk7XG4gICAgICAgICAgICBpbWcuc3JjID0gaW1hZ2VzW2ldO1xuICAgICAgICAgICAgaW1hZ2VPYmplY3RzLnB1c2goaW1nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlQWN0b3IgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCBpbWFnZSwgYWx0ZXJuYXRlSW1hZ2UpIHtcbiAgICAgICAgdmFyIHdpZHRoID0gMTAwLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRJbWFnZSA9IGltYWdlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gY3VycmVudEltYWdlLmhlaWdodCAqICh3aWR0aCAvIGN1cnJlbnRJbWFnZS53aWR0aClcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoY3VycmVudEltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe1xuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIHVzZUpCOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gYWx0ZXJuYXRlSW1hZ2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlTm9ybWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIHN0cikge1xuICAgICAgICB2YXIgdGFyZ2V0WCwgdGFyZ2V0WSwgeFN0ZXAsIHlTdGVwLFxuICAgICAgICAgICAgICAgIG1vdmVYLCBtb3ZlWSxcbiAgICAgICAgICAgICAgICB4T2Zmc2V0LCB5T2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdyhwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKG1vdmVYKHggKyB4T2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgIHhPZmZzZXQgKz0gcHJvZ3Jlc3MgKiB4U3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb3ZlWSh5ICsgeU9mZnNldCkpIHtcbiAgICAgICAgICAgICAgICB5T2Zmc2V0ICs9IHByb2dyZXNzICogeVN0ZXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0eC5mb250ID0gXCI0OHB4IHNlcmlmXCI7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQobWVzc2FnZSwgeCArIHhPZmZzZXQsIHkgKyB5T2Zmc2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNhbGNTdGVwKCkge1xuICAgICAgICAgICAgeFN0ZXAgPSAodGFyZ2V0WCAtIHggKyB4T2Zmc2V0KSAvIG1heFdpZHRoO1xuICAgICAgICAgICAgaWYgKHRhcmdldFggPiB4ICsgeE9mZnNldCkge1xuICAgICAgICAgICAgICAgIG1vdmVYID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHggPCB0YXJnZXRYO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdmVYID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHggPiB0YXJnZXRYO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlTdGVwID0gKHRhcmdldFkgLSB5ICsgeU9mZnNldCkgLyBtYXhXaWR0aDtcbiAgICAgICAgICAgIGlmICh0YXJnZXRZID4geSArIHlPZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBtb3ZlWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB5IDwgdGFyZ2V0WTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb3ZlWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB5ID4gdGFyZ2V0WTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZVRvSGFsZigpIHtcbiAgICAgICAgICAgIHRhcmdldFggPSBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aDtcbiAgICAgICAgICAgIGNhbGNTdGVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlVG9GdWxsKCkge1xuICAgICAgICAgICAgdGFyZ2V0WCA9IG1heFdpZHRoIC0gYWN0b3JXaWR0aCAtIDQwO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVEb3duKCkge1xuICAgICAgICAgICAgdGFyZ2V0WSA9IGludHJ1ZGVyWS0yMDtcbiAgICAgICAgICAgIGNhbGNTdGVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZXRTdGFydChuZXdYLCBuZXdZKSB7XG4gICAgICAgICAgICB4ID0gbmV3WCB8fCB4O1xuICAgICAgICAgICAgeSA9IG5ld1kgfHwgeTtcbiAgICAgICAgICAgIHRhcmdldFggPSBuZXdYIHx8IHg7XG4gICAgICAgICAgICB0YXJnZXRZID0gbmV3WSB8fCB5O1xuICAgICAgICAgICAgeFN0ZXAgPSAxO1xuICAgICAgICAgICAgeVN0ZXAgPSAxO1xuICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBtb3ZlWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHhPZmZzZXQgPSAwO1xuICAgICAgICAgICAgeU9mZnNldCA9IDA7XG4gICAgICAgICAgICBtZXNzYWdlID0gJzc2MjYnO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldE1lc3NhZ2UobmV3TWVzc2FnZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IG5ld01lc3NhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRTdGFydCgpO1xuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe1xuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIG1vdmVUb0hhbGY6IG1vdmVUb0hhbGYsXG4gICAgICAgICAgICBtb3ZlVG9GdWxsOiBtb3ZlVG9GdWxsLFxuICAgICAgICAgICAgbW92ZURvd246IG1vdmVEb3duLFxuICAgICAgICAgICAgc2V0U3RhcnQ6IHNldFN0YXJ0LFxuICAgICAgICAgICAgc2V0TWVzc2FnZTogc2V0TWVzc2FnZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZVByb3RvY29sID0gZnVuY3Rpb24gKGN0eCwgeSkge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhhY3RvcldpZHRoLCB5KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8obWF4V2lkdGggLSBhY3RvcldpZHRoLCB5KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe2RyYXc6IGRyYXd9KTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZVByb3RvY29sRG90cyA9IGZ1bmN0aW9uIChjdHgsIHkpIHtcbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5hcmMoaGFsZldpZHRoLCB5LCAyLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2xMaXN0ZW5lciA9IGZ1bmN0aW9uIChjdHgsIHkxLCB5Mikge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhoYWxmV2lkdGgsIHkxKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCB5Mik7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtkcmF3OiBkcmF3fSk7XG4gICAgfTtcblxuICAgIHZhciBzdGVwcyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdmFyIHN0ZXBzO1xuICAgICAgICB2YXIgY3VycmVudFN0ZXAgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoY2xpZW50LCBzZXJ2ZXIsIGludHJ1ZGVyLFxuICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UsIG1lc3NhZ2VDb3B5LCBwcm90b2NvbCxcbiAgICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMsIHByb3RvY29sTGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLCBjb2RlYm9vazIpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgY3VycmVudFN0ZXAgPSAwO1xuXG4gICAgICAgICAgICBzdGVwcyA9IFtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBwcm90b2NvbC5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0hhbGYsXG4gICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0Z1bGwoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2wuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LnNldFN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQudXNlSkIoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLnVzZUpCKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIudXNlSkIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2wuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMi5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYgKyA2MDgxMScpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoNzYyNiArIDYwODExKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0TWVzc2FnZSg3NjI2ICsgNjA4MTEpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9IYWxmLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9GdWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQobWF4V2lkdGggLSAzKmFjdG9yV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoKDc2MjYgKyA2MDgxMSkgKyAnLSA2MDgxMScpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KG1heFdpZHRoIC0gYWN0b3JXaWR0aCAtIDQwKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKCc3NjI2Jyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQoMSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0U3RhcnQobWF4V2lkdGggLSBhY3RvcldpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LnVzZU5vcm1hbCgpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLnVzZU5vcm1hbCgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYgKyBLZXknKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0TWVzc2FnZSgnS2V5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYXNNb3JlU3RlcHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZyAmJiBjdXJyZW50U3RlcCA8IHN0ZXBzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgICAgICBzdGVwc1tjdXJyZW50U3RlcCsrXSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaXNSdW5uaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgICAgIHN0b3A6IHN0b3AsXG4gICAgICAgICAgICBoYXNNb3JlU3RlcHM6IGhhc01vcmVTdGVwcyxcbiAgICAgICAgICAgIGlzUnVubmluZzogaXNSdW5uaW5nLFxuICAgICAgICAgICAgc3RlcDogc3RlcFxuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGZ1bmN0aW9uIGluaXQoY2FudmFzKSB7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBzZXRTaXplcyhjYW52YXMpO1xuXG4gICAgICAgIGNyZWF0ZUltYWdlcyhmdW5jdGlvbiAoaW1hZ2VzKSB7XG4gICAgICAgICAgICB2YXIgY2xpZW50ID0gY3JlYXRlQWN0b3IoY3R4LCAwLCBhY3RvclksIGltYWdlcy5jbGllbnQsIGltYWdlcy5qYik7XG4gICAgICAgICAgICBjbGllbnQuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBjcmVhdGVBY3RvcihjdHgsIG1heFdpZHRoIC0gYWN0b3JXaWR0aCwgYWN0b3JZLCBpbWFnZXMuc2hvcCwgaW1hZ2VzLm0pO1xuICAgICAgICAgICAgdmFyIGludHJ1ZGVyID0gY3JlYXRlQWN0b3IoY3R4LCBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aCwgaW50cnVkZXJZLCBpbWFnZXMuaGFja2VyLCBpbWFnZXMubm8pO1xuICAgICAgICAgICAgdmFyIGNvZGVib29rMSA9IGNyZWF0ZUFjdG9yKGN0eCwgMCwgNDAsIGltYWdlcy5jb2RlYm9vayk7XG4gICAgICAgICAgICB2YXIgY29kZWJvb2syID0gY3JlYXRlQWN0b3IoY3R4LCBtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIDQwLCBpbWFnZXMuY29kZWJvb2spO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBjcmVhdGVNZXNzYWdlKGN0eCwgMCwgbWVzc2FnZVksICdvcmlnJyk7XG5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlQ29weSA9IGNyZWF0ZU1lc3NhZ2UoY3R4LCBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aCwgbWVzc2FnZVksICdjb3B5Jyk7XG5cbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGNyZWF0ZVByb3RvY29sKGN0eCwgYWN0b3JZKTtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbERvdHMgPSBjcmVhdGVQcm90b2NvbERvdHMoY3R4LCBhY3RvclkpO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sTGlzdGVuZXIgPSBjcmVhdGVQcm90b2NvbExpc3RlbmVyKGN0eCwgYWN0b3JZLCBpbnRydWRlclkpO1xuXG4gICAgICAgICAgICBzdGVwcy5pbml0KGNsaWVudCwgc2VydmVyLCBpbnRydWRlciwgbWVzc2FnZSwgbWVzc2FnZUNvcHksIHByb3RvY29sLFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMsIHByb3RvY29sTGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMSwgY29kZWJvb2syKTtcblxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcblxuICAgICAgICAgICAgdmFyIGxhc3RUaW1lO1xuICAgICAgICAgICAgdmFyIHByb2dyZXNzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGVwcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFsYXN0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gKGN1cnJlbnRUaW1lIC0gbGFzdFRpbWUpO1xuICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBjbGllbnQuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGludHJ1ZGVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2wuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgY29kZWJvb2sxLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGNvZGVib29rMi5kcmF3KHByb2dyZXNzKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgaGFzTW9yZVN0ZXBzOiBzdGVwcy5oYXNNb3JlU3RlcHMsXG4gICAgICAgIHN0ZXA6IHN0ZXBzLnN0ZXAsXG4gICAgICAgIHN0b3A6IHN0ZXBzLnN0b3BcbiAgICB9O1xufSkoKTtcbiAgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVN0ZXBwZXIoKSB7XG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB2YXIgY3VycmVudFN0ZXAgPSAwO1xuICAgIHZhciBzdGVwcywgc3RvcFN0ZXA7XG5cbiAgICBmdW5jdGlvbiB1c2UodGhlc2VTdGVwcywgdXNlVGhpc1N0b3BTdGVwKSB7XG4gICAgICAgIHN0ZXBzID0gdGhlc2VTdGVwcztcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIHN0b3BTdGVwID0gdXNlVGhpc1N0b3BTdGVwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKCEhc3RvcFN0ZXApIHtcbiAgICAgICAgICAgIHN0b3BTdGVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNNb3JlU3RlcHMoKSB7XG4gICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB1c2U6IHVzZSxcbiAgICAgICAgc3RvcDogc3RvcCxcbiAgICAgICAgaGFzTW9yZVN0ZXBzOiBoYXNNb3JlU3RlcHMsXG4gICAgICAgIGlzUnVubmluZzogaXNSdW5uaW5nLFxuICAgICAgICBzdGVwOiBzdGVwXG4gICAgfVxufTsiXX0=
