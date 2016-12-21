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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvbWFpbi5qcyIsIi9ob21lL3RvbS9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9lbGxpcHRpYzIuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvaW50cm8uanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvc3RlcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7QUFBYixNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzVCLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4QyxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwRCxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FDSGhELFlBQVksQ0FBQzs7QUFBYixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztBQUMxQyxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7O0FBRXRCLElBQUksQ0FBQyxHQUFBLFNBQUEsQ0FBQztBQUNOLElBQUksQ0FBQyxHQUFBLFNBQUEsQ0FBQzs7QUFFTixTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDVixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMs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QUksS0FBSyxFQUFFLFFBQVEsQ0FBQzs7QUFFcEIsYUFBUyxHQUFHLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRTtBQUN0QyxhQUFLLEdBQUcsVUFBVSxDQUFDO0FBQ25CLGVBQU8sR0FBRyxJQUFJLENBQUM7QUFDZixnQkFBUSxHQUFHLGVBQWUsQ0FBQztLQUM5Qjs7QUFFRCxhQUFTLElBQUksR0FBRztBQUNaLGVBQU8sR0FBRyxLQUFLLENBQUM7QUFDaEIsWUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQ1osb0JBQVEsRUFBRSxDQUFDO1NBQ2Q7S0FDSjs7QUFFRCxhQUFTLFlBQVksR0FBRztBQUNwQixlQUFPLE9BQU8sSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUNoRDs7QUFFRCxhQUFTLElBQUksR0FBRztBQUNaLGFBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDMUI7O0FBRUQsYUFBUyxTQUFTLEdBQUc7QUFDakIsZUFBTyxPQUFPLENBQUM7S0FDbEI7O0FBRUQsV0FBTztBQUNILFdBQUcsRUFBRSxHQUFHO0FBQ1IsWUFBSSxFQUFFLElBQUk7QUFDVixvQkFBWSxFQUFFLFlBQVk7QUFDMUIsaUJBQVMsRUFBRSxTQUFTO0FBQ3BCLFlBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQTtDQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmRoID0gd2luZG93LmRoIHx8IHt9O1xud2luZG93LmRoLmludHJvID0gcmVxdWlyZSgnLi9pbnRyby5qcycpO1xud2luZG93LmRoLmV4cG9uZW50aWFsID0gcmVxdWlyZSgnLi9leHBvbmVudGlhbC5qcycpO1xud2luZG93LmRoLmVsbGlwdGljMiA9IHJlcXVpcmUoJy4vZWxsaXB0aWMyLmpzJyk7XG5cblxuIiwiY29uc3Qgc3RlcHBlciA9IHJlcXVpcmUoJy4vc3RlcHBlci5qcycpKCk7XG5jb25zdCBzdHJva2V3aWR0aCA9IDM7XG5cbmxldCBhO1xubGV0IGI7XG5cbmZ1bmN0aW9uIGYoeCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKiB4ICsgYS5WYWx1ZSgpICogeCArIGIuVmFsdWUoKSk7XG59XG5cbmZ1bmN0aW9uIGludmVyc2VGKHgpIHtcbiAgICByZXR1cm4gLWYoeCk7XG59XG5cbmZ1bmN0aW9uIGluaXQodGFyZ2V0KSB7XG4gICAgdGFyZ2V0LnN0eWxlLmhlaWdodD1cIjcwMHB4XCI7XG4gICAgdGFyZ2V0LnN0eWxlLndpZHRoPVwiNzAwcHhcIjtcbiAgICBjb25zdCBib2FyZCA9IEpYRy5KU1hHcmFwaC5pbml0Qm9hcmQodGFyZ2V0LmlkLCB7XG4gICAgICAgIGJvdW5kaW5nYm94OiBbLTUsIDUsIDUsIC01XSxcbiAgICAgICAgYXhpczogdHJ1ZSxcbiAgICAgICAgc2hvd0NvcHlyaWdodDogZmFsc2VcbiAgICB9KTtcblxuICAgIGEgPSBib2FyZC5jcmVhdGUoJ3NsaWRlcicsIFtbMCwgLTNdLCBbNCwgLTNdLCBbLTUsIC0zLCA1XV0pO1xuICAgIGIgPSBib2FyZC5jcmVhdGUoJ3NsaWRlcicsIFtbMCwgLTRdLCBbNCwgLTRdLCBbLTUsIDMsIDVdXSk7XG5cbiAgICBjb25zdCBncmFwaDEgPSBib2FyZC5jcmVhdGUoJ2Z1bmN0aW9uZ3JhcGgnLCBbZl0sIHtzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICBjb25zdCBncmFwaDIgPSBib2FyZC5jcmVhdGUoJ2Z1bmN0aW9uZ3JhcGgnLCBbaW52ZXJzZUZdLCB7c3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG5cbiAgICBsZXQgb3JpZ2luYWxQb2ludCwgcG9pbnQsXG4gICAgICAgICAgICB0YW5nZW50LFxuICAgICAgICAgICAgaW50ZXJzZWN0O1xuXG4gICAgc3RlcHBlci51c2UoW1xuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBvcmlnaW5hbFBvaW50ID0gcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFtncmFwaDFdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaW50ZXJzZWN0ID0gYm9hcmQuY3JlYXRlKCdpbnRlcnNlY3Rpb24nLCBbZ3JhcGgxLCB0YW5nZW50LCAwXSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHBvaW50ID0gYm9hcmQuY3JlYXRlKCdnbGlkZXInLCBbKCkgPT4geyByZXR1cm4gaW50ZXJzZWN0LlgoKSB9LCAoKSA9PiB7IHJldHVybiAtaW50ZXJzZWN0LlkoKSB9LCBncmFwaDJdKTtcbiAgICAgICAgICAgIGJvYXJkLmNyZWF0ZSgnbGluZScsIFtpbnRlcnNlY3QsIHBvaW50XSxcbiAgICAgICAgICAgICAgICAgICAge2Rhc2g6IDMsIHN0cmFpZ2h0Rmlyc3Q6IGZhbHNlLCBzdHJhaWdodExhc3Q6IGZhbHNlLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGgsIGxhc3RBcnJvdzogdHJ1ZX0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSAtMS4yNjtcbiAgICAgICAgICAgIG9yaWdpbmFsUG9pbnQubW92ZVRvKFt0YXJnZXQsIGYodGFyZ2V0KV0sIDIwMDApO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0YW5nZW50ID0gYm9hcmQuY3JlYXRlKCd0YW5nZW50JywgW3BvaW50XSwge3N0cm9rZUNvbG9yOiAnI2ZmMDAwMCcsIGRhc2g6IDIsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgICAgICAgICAgaW50ZXJzZWN0ID0gYm9hcmQuY3JlYXRlKCdpbnRlcnNlY3Rpb24nLCBbZ3JhcGgxLCB0YW5nZW50LCAwXSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHBvaW50ID0gYm9hcmQuY3JlYXRlKCdnbGlkZXInLCBbKCkgPT4geyByZXR1cm4gaW50ZXJzZWN0LlgoKSB9LCAoKSA9PiB7IHJldHVybiAtaW50ZXJzZWN0LlkoKSB9LCBncmFwaDJdKTtcbiAgICAgICAgICAgIGJvYXJkLmNyZWF0ZSgnbGluZScsIFtpbnRlcnNlY3QsIHBvaW50XSxcbiAgICAgICAgICAgICAgICAgICAge2Rhc2g6IDMsIHN0cmFpZ2h0Rmlyc3Q6IGZhbHNlLCBzdHJhaWdodExhc3Q6IGZhbHNlLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGgsIGxhc3RBcnJvdzogdHJ1ZX0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0YW5nZW50ID0gYm9hcmQuY3JlYXRlKCd0YW5nZW50JywgW3BvaW50XSwge3N0cm9rZUNvbG9yOiAnI2ZmMDAwMCcsIGRhc2g6IDIsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgICAgICAgICAgaW50ZXJzZWN0ID0gYm9hcmQuY3JlYXRlKCdpbnRlcnNlY3Rpb24nLCBbZ3JhcGgyLCB0YW5nZW50LCAwXSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHBvaW50ID0gYm9hcmQuY3JlYXRlKCdnbGlkZXInLCBbKCkgPT4geyByZXR1cm4gaW50ZXJzZWN0LlgoKSB9LCAoKSA9PiB7IHJldHVybiAtaW50ZXJzZWN0LlkoKSB9LCBncmFwaDFdKTtcbiAgICAgICAgICAgIGJvYXJkLmNyZWF0ZSgnbGluZScsIFtpbnRlcnNlY3QsIHBvaW50XSxcbiAgICAgICAgICAgICAgICAgICAge2Rhc2g6IDMsIHN0cmFpZ2h0Rmlyc3Q6IGZhbHNlLCBzdHJhaWdodExhc3Q6IGZhbHNlLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGgsIGxhc3RBcnJvdzogdHJ1ZX0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0YW5nZW50ID0gYm9hcmQuY3JlYXRlKCd0YW5nZW50JywgW3BvaW50XSwge3N0cm9rZUNvbG9yOiAnI2ZmMDAwMCcsIGRhc2g6IDIsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgICAgICAgICAgaW50ZXJzZWN0ID0gYm9hcmQuY3JlYXRlKCdpbnRlcnNlY3Rpb24nLCBbZ3JhcGgxLCB0YW5nZW50LCAwXSk7XG4gICAgICAgIH1cbiAgICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBoYXNNb3JlU3RlcHM6IHN0ZXBwZXIuaGFzTW9yZVN0ZXBzLFxuICAgIHN0ZXA6IHN0ZXBwZXIuc3RlcCxcbiAgICBzdG9wOiBzdGVwcGVyLnN0b3Bcbn07IiwiY29uc3Qgc3RlcHBlciA9IHJlcXVpcmUoJy4vc3RlcHBlci5qcycpKCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVNjYWxlcihjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBjdHgpIHtcbiAgICBsZXQgaXRlcmF0aW9uO1xuXG4gICAgbGV0IHNjYWxlWCwgc2NhbGVZO1xuICAgIGxldCB0YXJnZXRNYXhYLCB0YXJnZXRNYXhZO1xuICAgIGxldCB4U3RlcCwgeVN0ZXA7XG4gICAgbGV0IG1heFggPSA1LCBtYXhZID0gMTAwMDAwO1xuICAgIGZ1bmN0aW9uIGRyYXcoY2FsbGJhY2spIHtcbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBjYW52YXNIZWlnaHQpO1xuICAgICAgICBjdHguc2NhbGUoc2NhbGVYLCAtc2NhbGVZKTtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIGNhbGxiYWNrKGN0eCwgaXRlcmF0aW9uLCBtYXhYLCBzY2FsZVgsIHNjYWxlWSk7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICBjdHgubGluZUpvaW4gPSAncm91bmQnO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHpvb21UbyhuZXdNYXhYLCBuZXdNYXhZKSB7XG4gICAgICAgIHRhcmdldE1heFggPSBuZXdNYXhYO1xuICAgICAgICB0YXJnZXRNYXhZID0gbmV3TWF4WTtcblxuICAgICAgICB4U3RlcCA9ICh0YXJnZXRNYXhYIC0gbWF4WCkgLyAxMDA7XG4gICAgICAgIHlTdGVwID0gKHRhcmdldE1heFkgLSBtYXhZKSAvIDEwMDtcblxuICAgICAgICB6b29tU3RlcChtYXhYLCBtYXhZKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXQobmV3TWF4WCwgbmV3TWF4WSkge1xuICAgICAgICBtYXhYID0gbmV3TWF4WDtcbiAgICAgICAgbWF4WSA9IG5ld01heFk7XG4gICAgICAgIGl0ZXJhdGlvbiA9IG5ld01heFggLyAxMDAwO1xuXG4gICAgICAgIHNjYWxlWCA9IGNhbnZhc1dpZHRoIC8gbmV3TWF4WDtcbiAgICAgICAgc2NhbGVZID0gY2FudmFzSGVpZ2h0IC8gbmV3TWF4WTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB6b29tU3RlcCgpIHtcbiAgICAgICAgY29uc3QgeERpZmYgPSBNYXRoLmFicyh0YXJnZXRNYXhYIC0gbWF4WCk7XG4gICAgICAgIGNvbnN0IHlEaWZmID0gTWF0aC5hYnModGFyZ2V0TWF4WSAtIG1heFkpO1xuXG4gICAgICAgIGlmICh4RGlmZiA+IDAuMSB8fCB5RGlmZiA+IDAuMSkge1xuICAgICAgICAgICAgaWYgKHhEaWZmID4gMC4xKSB7XG4gICAgICAgICAgICAgICAgbWF4WCArPSB4U3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5RGlmZiA+IDAuMSkge1xuICAgICAgICAgICAgICAgIG1heFkgKz0geVN0ZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXQobWF4WCwgbWF4WSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXQsXG4gICAgICAgIGRyYXcsXG4gICAgICAgIHpvb21UbyxcbiAgICAgICAgem9vbVN0ZXBcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBeGVzKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIGN0eCkge1xuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoMCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgICAgY3R4LnNjYWxlKDEsIC0xKTtcblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG4gICAgICAgIGN0eC5saW5lVG8oY2FudmFzV2lkdGgsIDApO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2FhYSc7XG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKDAsIDApO1xuICAgICAgICBjdHgubGluZVRvKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjYWFhJztcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGRyYXdcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVxdWF0aW9uKHNjYWxlZCkge1xuICAgIGxldCBlcXVhdGlvbkZ1bmN0aW9uO1xuXG4gICAgZnVuY3Rpb24gc2V0KG5ld0VxdWF0aW9uRnVuY3Rpb24pIHtcbiAgICAgICAgZXF1YXRpb25GdW5jdGlvbiA9IG5ld0VxdWF0aW9uRnVuY3Rpb247XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlKHgpIHtcbiAgICAgICAgcmV0dXJuIGVxdWF0aW9uRnVuY3Rpb24oeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgc2NhbGVkLmRyYXcoZnVuY3Rpb24gKGN0eCwgaXRlcmF0aW9uLCBtYXhYLCBzY2FsZVgsIHNjYWxlWSkge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDAgKyBpdGVyYXRpb247IHggPD0gbWF4WDsgeCArPSBpdGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCh4LCBlcXVhdGlvbkZ1bmN0aW9uKHgpLCA0IC8gc2NhbGVYLCA0IC8gc2NhbGVZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2V0LFxuICAgICAgICBkcmF3LFxuICAgICAgICBjYWxjdWxhdGVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhpZ2hMaWdodChzY2FsZWQsIGVxdWF0aW9uKSB7XG4gICAgbGV0IGFuaW1hdGVIaWdobGlnaHQ7XG4gICAgbGV0IHNob3VsZERyYXdIaWdobGlnaHQ7XG4gICAgbGV0IGN1cnJlbnRIaWdobGlnaHQ7XG4gICAgbGV0IGhpZ2hsaWdodEVuZDtcblxuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICBhbmltYXRlSGlnaGxpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHNob3VsZERyYXdIaWdobGlnaHQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhY3RpdmF0ZShoaWdobGlnaHRTdGFydCkge1xuICAgICAgICBzaG91bGREcmF3SGlnaGxpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudEhpZ2hsaWdodCA9IGhpZ2hsaWdodFN0YXJ0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFuaW1hdGVUbyh0bykge1xuICAgICAgICBhbmltYXRlSGlnaGxpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgaGlnaGxpZ2h0RW5kID0gdG87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgaWYgKCFzaG91bGREcmF3SGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZWQuZHJhdyhmdW5jdGlvbiAoY3R4LCBpdGVyYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50SGlnaGxpZ2h0ID4gaGlnaGxpZ2h0RW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGVIaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhpZ2hsaWdodCAtPSBpdGVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB4ID0gZXF1YXRpb24uY2FsY3VsYXRlKGN1cnJlbnRIaWdobGlnaHQpO1xuXG4gICAgICAgICAgICBjdHgubW92ZVRvKGN1cnJlbnRIaWdobGlnaHQsIDApO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhjdXJyZW50SGlnaGxpZ2h0LCB4KTtcblxuICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCB4KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oY3VycmVudEhpZ2hsaWdodCwgeCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc2V0LFxuICAgICAgICBhY3RpdmF0ZSxcbiAgICAgICAgYW5pbWF0ZVRvLFxuICAgICAgICBkcmF3XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbml0KGNhbnZhcykge1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnN0IHNjYWxlZCA9IGNyZWF0ZVNjYWxlcihjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQsIGN0eCk7XG4gICAgY29uc3QgZXF1YXRpb24gPSBjcmVhdGVFcXVhdGlvbihzY2FsZWQpO1xuICAgIGNvbnN0IGhpZ2hMaWdodCA9IGNyZWF0ZUhpZ2hMaWdodChzY2FsZWQsIGVxdWF0aW9uKTtcblxuICAgIHNjYWxlZC5zZXQoNTAwLCAxMDApO1xuICAgIHNjYWxlZC56b29tVG8oNTAwLCAxMDApO1xuICAgIGhpZ2hMaWdodC5yZXNldCgpO1xuICAgIGVxdWF0aW9uLnNldCh4ID0+IDE3ICsgeCk7XG4gICAgc3RlcHBlci51c2UoW1xuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiAxNyArIHggJSA5NyksXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IDE3ICogeCksXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IDE3ICogeCAlIDk3KSxcbiAgICAgICAgKCkgPT4gZXF1YXRpb24uc2V0KHggPT4gTWF0aC5wb3coMTcsIHgpKSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaGlnaExpZ2h0LnJlc2V0KCk7XG4gICAgICAgICAgICBzY2FsZWQuem9vbVRvKDUsIDEwMDAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IGhpZ2hMaWdodC5hY3RpdmF0ZSg0KSxcbiAgICAgICAgKCkgPT4gaGlnaExpZ2h0LmFuaW1hdGVUbygzKSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaGlnaExpZ2h0LnJlc2V0KCk7XG4gICAgICAgICAgICBzY2FsZWQuem9vbVRvKDEwMCwgMTAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gZXF1YXRpb24uc2V0KHggPT4gTWF0aC5wb3coMTcsIHgpICUgOTcpLFxuICAgICAgICAoKSA9PiBoaWdoTGlnaHQuYWN0aXZhdGUoNTApLFxuICAgICAgICAoKSA9PiBoaWdoTGlnaHQuYW5pbWF0ZVRvKDMwKVxuICAgIF0pO1xuXG4gICAgY29uc3QgYXhlcyA9IGNyZWF0ZUF4ZXMoY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBjdHgpO1xuXG4gICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgaWYgKCFzdGVwcGVyLmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGF4ZXMuZHJhdygpO1xuICAgICAgICBlcXVhdGlvbi5kcmF3KCk7XG4gICAgICAgIGhpZ2hMaWdodC5kcmF3KCk7XG4gICAgICAgIHNjYWxlZC56b29tU3RlcCgpO1xuXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gICAgfVxuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBoYXNNb3JlU3RlcHM6IHN0ZXBwZXIuaGFzTW9yZVN0ZXBzLFxuICAgIHN0ZXA6IHN0ZXBwZXIuc3RlcCxcbiAgICBzdG9wOiBzdGVwcGVyLnN0b3Bcbn07IiwiY29uc3QgY3JlYXRlU3RlcHBlciA9IHJlcXVpcmUoJy4vc3RlcHBlci5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIG1heFdpZHRoLCBtYXhIZWlnaHQsIGFjdG9yV2lkdGg7XG4gICAgdmFyIGhhbGZXaWR0aCwgaGFsZkhlaWdodCwgaGFsZkFjdG9yV2lkdGg7XG5cbiAgICB2YXIgYWN0b3JZLCBpbnRydWRlclksIG1lc3NhZ2VZO1xuXG4gICAgZnVuY3Rpb24gc2V0U2l6ZXMoY2FudmFzKSB7XG4gICAgICAgIG1heFdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgICAgICBtYXhIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICAgICAgICBhY3RvcldpZHRoID0gMTAwO1xuXG4gICAgICAgIGhhbGZXaWR0aCA9IG1heFdpZHRoIC8gMjtcbiAgICAgICAgaGFsZkhlaWdodCA9IG1heEhlaWdodCAvIDI7XG4gICAgICAgIGhhbGZBY3RvcldpZHRoID0gYWN0b3JXaWR0aCAvIDI7XG5cbiAgICAgICAgYWN0b3JZID0gaGFsZkhlaWdodC1hY3RvcldpZHRoO1xuICAgICAgICBpbnRydWRlclkgPSBtYXhIZWlnaHQtMiphY3RvcldpZHRoO1xuICAgICAgICBtZXNzYWdlWSA9IGFjdG9yWS01O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VBY3RpdmF0YWJsZShzb21ldGhpbmcpIHtcbiAgICAgICAgdmFyIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgb3JpZ2luYWxEcmF3ID0gc29tZXRoaW5nLmRyYXc7XG5cbiAgICAgICAgc29tZXRoaW5nLmRyYXcgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGlmICghIW9yaWdpbmFsRHJhdyAmJiBhY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbERyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHNvbWV0aGluZy5hY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgc29tZXRoaW5nLmRlYWN0aXZhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc29tZXRoaW5nO1xuICAgIH1cblxuICAgIHZhciBjcmVhdGVJbWFnZXMgPSBmdW5jdGlvbiAob25Db21wbGV0ZSkge1xuICAgICAgICB2YXIgaW1hZ2VzID0gW1xuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvc2Vhbl9jb25uZXJ5LmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9tLmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9kcl9uby5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvY2xpZW50LmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9lYmF5LnBuZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9oYWNrZXIuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL290cGJvb2tsZXQuanBnJyxcbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGltYWdlT2JqZWN0cyA9IFtdO1xuXG4gICAgICAgIHZhciBsb2FkZWQgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgICAgIGxvYWRlZCsrO1xuICAgICAgICAgICAgaWYgKGxvYWRlZCA9PT0gaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoe1xuICAgICAgICAgICAgICAgICAgICBqYjogaW1hZ2VPYmplY3RzWzBdLFxuICAgICAgICAgICAgICAgICAgICBtOiBpbWFnZU9iamVjdHNbMV0sXG4gICAgICAgICAgICAgICAgICAgIG5vOiBpbWFnZU9iamVjdHNbMl0sXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudDogaW1hZ2VPYmplY3RzWzNdLFxuICAgICAgICAgICAgICAgICAgICBzaG9wOiBpbWFnZU9iamVjdHNbNF0sXG4gICAgICAgICAgICAgICAgICAgIGhhY2tlcjogaW1hZ2VPYmplY3RzWzVdLFxuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazogaW1hZ2VPYmplY3RzWzZdLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBvbkxvYWQpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IGltYWdlc1tpXTtcbiAgICAgICAgICAgIGltYWdlT2JqZWN0cy5wdXNoKGltZyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZUFjdG9yID0gZnVuY3Rpb24gKGN0eCwgeCwgeSwgaW1hZ2UsIGFsdGVybmF0ZUltYWdlKSB7XG4gICAgICAgIHZhciB3aWR0aCA9IDEwMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50SW1hZ2UgPSBpbWFnZTtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IGN1cnJlbnRJbWFnZS5oZWlnaHQgKiAod2lkdGggLyBjdXJyZW50SW1hZ2Uud2lkdGgpXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGN1cnJlbnRJbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtcbiAgICAgICAgICAgIGRyYXc6IGRyYXcsXG4gICAgICAgICAgICB1c2VKQjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRJbWFnZSA9IGFsdGVybmF0ZUltYWdlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVzZU5vcm1hbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRJbWFnZSA9IGltYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZU1lc3NhZ2UgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCBzdHIpIHtcbiAgICAgICAgdmFyIHRhcmdldFgsIHRhcmdldFksIHhTdGVwLCB5U3RlcCxcbiAgICAgICAgICAgICAgICBtb3ZlWCwgbW92ZVksXG4gICAgICAgICAgICAgICAgeE9mZnNldCwgeU9mZnNldCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGlmIChtb3ZlWCh4ICsgeE9mZnNldCkpIHtcbiAgICAgICAgICAgICAgICB4T2Zmc2V0ICs9IHByb2dyZXNzICogeFN0ZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW92ZVkoeSArIHlPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgeU9mZnNldCArPSBwcm9ncmVzcyAqIHlTdGVwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHguZm9udCA9IFwiNDhweCBzZXJpZlwiO1xuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsIHggKyB4T2Zmc2V0LCB5ICsgeU9mZnNldCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjYWxjU3RlcCgpIHtcbiAgICAgICAgICAgIHhTdGVwID0gKHRhcmdldFggLSB4ICsgeE9mZnNldCkgLyBtYXhXaWR0aDtcbiAgICAgICAgICAgIGlmICh0YXJnZXRYID4geCArIHhPZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBtb3ZlWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4IDwgdGFyZ2V0WDtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb3ZlWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4ID4gdGFyZ2V0WDtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5U3RlcCA9ICh0YXJnZXRZIC0geSArIHlPZmZzZXQpIC8gbWF4V2lkdGg7XG4gICAgICAgICAgICBpZiAodGFyZ2V0WSA+IHkgKyB5T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgbW92ZVkgPSBmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geSA8IHRhcmdldFk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbW92ZVkgPSBmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geSA+IHRhcmdldFk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVUb0hhbGYoKSB7XG4gICAgICAgICAgICB0YXJnZXRYID0gaGFsZldpZHRoIC0gaGFsZkFjdG9yV2lkdGg7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZVRvRnVsbCgpIHtcbiAgICAgICAgICAgIHRhcmdldFggPSBtYXhXaWR0aCAtIGFjdG9yV2lkdGggLSA0MDtcbiAgICAgICAgICAgIGNhbGNTdGVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlRG93bigpIHtcbiAgICAgICAgICAgIHRhcmdldFkgPSBpbnRydWRlclktMjA7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0U3RhcnQobmV3WCwgbmV3WSkge1xuICAgICAgICAgICAgeCA9IG5ld1ggfHwgeDtcbiAgICAgICAgICAgIHkgPSBuZXdZIHx8IHk7XG4gICAgICAgICAgICB0YXJnZXRYID0gbmV3WCB8fCB4O1xuICAgICAgICAgICAgdGFyZ2V0WSA9IG5ld1kgfHwgeTtcbiAgICAgICAgICAgIHhTdGVwID0gMTtcbiAgICAgICAgICAgIHlTdGVwID0gMTtcbiAgICAgICAgICAgIG1vdmVYID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbW92ZVkgPSBmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB4T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIHlPZmZzZXQgPSAwO1xuICAgICAgICAgICAgbWVzc2FnZSA9ICc3NjI2JztcbiAgICAgICAgICAgIGNhbGNTdGVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZXRNZXNzYWdlKG5ld01lc3NhZ2UpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBuZXdNZXNzYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0U3RhcnQoKTtcblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtcbiAgICAgICAgICAgIGRyYXc6IGRyYXcsXG4gICAgICAgICAgICBtb3ZlVG9IYWxmOiBtb3ZlVG9IYWxmLFxuICAgICAgICAgICAgbW92ZVRvRnVsbDogbW92ZVRvRnVsbCxcbiAgICAgICAgICAgIG1vdmVEb3duOiBtb3ZlRG93bixcbiAgICAgICAgICAgIHNldFN0YXJ0OiBzZXRTdGFydCxcbiAgICAgICAgICAgIHNldE1lc3NhZ2U6IHNldE1lc3NhZ2VcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVQcm90b2NvbCA9IGZ1bmN0aW9uIChjdHgsIHkpIHtcbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oYWN0b3JXaWR0aCwgeSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKG1heFdpZHRoIC0gYWN0b3JXaWR0aCwgeSk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtkcmF3OiBkcmF3fSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVQcm90b2NvbERvdHMgPSBmdW5jdGlvbiAoY3R4LCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHguYXJjKGhhbGZXaWR0aCwgeSwgMiwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe2RyYXc6IGRyYXd9KTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZVByb3RvY29sTGlzdGVuZXIgPSBmdW5jdGlvbiAoY3R4LCB5MSwgeTIpIHtcbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oaGFsZldpZHRoLCB5MSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgeTIpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgc3RlcHMgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciBzdGVwcztcbiAgICAgICAgdmFyIGN1cnJlbnRTdGVwID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KGNsaWVudCwgc2VydmVyLCBpbnRydWRlcixcbiAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLCBtZXNzYWdlQ29weSwgcHJvdG9jb2wsXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLCBwcm90b2NvbExpc3RlbmVyLFxuICAgICAgICAgICAgICAgICAgICAgIGNvZGVib29rMSwgY29kZWJvb2syKSB7XG4gICAgICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwID0gMDtcblxuICAgICAgICAgICAgc3RlcHMgPSBbXG4gICAgICAgICAgICAgICAgc2VydmVyLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgcHJvdG9jb2wuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9IYWxmLFxuICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9GdWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRTdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LnVzZUpCKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci51c2VKQigpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLnVzZUpCKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKCc3NjI2ICsgNjA4MTEnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKDc2MjYgKyA2MDgxMSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LnNldE1lc3NhZ2UoNzYyNiArIDYwODExKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvSGFsZixcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvRnVsbCgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KG1heFdpZHRoIC0gMyphY3RvcldpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKCg3NjI2ICsgNjA4MTEpICsgJy0gNjA4MTEnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydChtYXhXaWR0aCAtIGFjdG9yV2lkdGggLSA0MCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgnNzYyNicpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KDEpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LnNldFN0YXJ0KG1heFdpZHRoIC0gYWN0b3JXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudC51c2VOb3JtYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLnVzZU5vcm1hbCgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci51c2VOb3JtYWwoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2syLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKCc3NjI2ICsgS2V5Jyk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LnNldE1lc3NhZ2UoJ0tleScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFzTW9yZVN0ZXBzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgJiYgY3VycmVudFN0ZXAgPCBzdGVwcy5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgICAgc3RlcHNbY3VycmVudFN0ZXArK10oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGlzUnVubmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXQ6IGluaXQsXG4gICAgICAgICAgICBzdG9wOiBzdG9wLFxuICAgICAgICAgICAgaGFzTW9yZVN0ZXBzOiBoYXNNb3JlU3RlcHMsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGlzUnVubmluZyxcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXBcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBmdW5jdGlvbiBpbml0KGNhbnZhcykge1xuICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgc2V0U2l6ZXMoY2FudmFzKTtcblxuICAgICAgICBjcmVhdGVJbWFnZXMoZnVuY3Rpb24gKGltYWdlcykge1xuICAgICAgICAgICAgdmFyIGNsaWVudCA9IGNyZWF0ZUFjdG9yKGN0eCwgMCwgYWN0b3JZLCBpbWFnZXMuY2xpZW50LCBpbWFnZXMuamIpO1xuICAgICAgICAgICAgY2xpZW50LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICB2YXIgc2VydmVyID0gY3JlYXRlQWN0b3IoY3R4LCBtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIGFjdG9yWSwgaW1hZ2VzLnNob3AsIGltYWdlcy5tKTtcbiAgICAgICAgICAgIHZhciBpbnRydWRlciA9IGNyZWF0ZUFjdG9yKGN0eCwgaGFsZldpZHRoIC0gaGFsZkFjdG9yV2lkdGgsIGludHJ1ZGVyWSwgaW1hZ2VzLmhhY2tlciwgaW1hZ2VzLm5vKTtcbiAgICAgICAgICAgIHZhciBjb2RlYm9vazEgPSBjcmVhdGVBY3RvcihjdHgsIDAsIDQwLCBpbWFnZXMuY29kZWJvb2spO1xuICAgICAgICAgICAgdmFyIGNvZGVib29rMiA9IGNyZWF0ZUFjdG9yKGN0eCwgbWF4V2lkdGggLSBhY3RvcldpZHRoLCA0MCwgaW1hZ2VzLmNvZGVib29rKTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gY3JlYXRlTWVzc2FnZShjdHgsIDAsIG1lc3NhZ2VZLCAnb3JpZycpO1xuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZUNvcHkgPSBjcmVhdGVNZXNzYWdlKGN0eCwgaGFsZldpZHRoIC0gaGFsZkFjdG9yV2lkdGgsIG1lc3NhZ2VZLCAnY29weScpO1xuXG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBjcmVhdGVQcm90b2NvbChjdHgsIGFjdG9yWSk7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2xEb3RzID0gY3JlYXRlUHJvdG9jb2xEb3RzKGN0eCwgYWN0b3JZKTtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbExpc3RlbmVyID0gY3JlYXRlUHJvdG9jb2xMaXN0ZW5lcihjdHgsIGFjdG9yWSwgaW50cnVkZXJZKTtcblxuICAgICAgICAgICAgc3RlcHMuaW5pdChjbGllbnQsIHNlcnZlciwgaW50cnVkZXIsIG1lc3NhZ2UsIG1lc3NhZ2VDb3B5LCBwcm90b2NvbCxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLCBwcm90b2NvbExpc3RlbmVyLFxuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEsIGNvZGVib29rMik7XG5cbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG5cbiAgICAgICAgICAgIHZhciBsYXN0VGltZTtcbiAgICAgICAgICAgIHZhciBwcm9ncmVzcztcblxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhdyhjdXJyZW50VGltZSkge1xuICAgICAgICAgICAgICAgIGlmICghc3RlcHMuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghbGFzdFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IChjdXJyZW50VGltZSAtIGxhc3RUaW1lKTtcbiAgICAgICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgY2xpZW50LmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIHNlcnZlci5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBpbnRydWRlci5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIHByb3RvY29sLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGNvZGVib29rMS5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBjb2RlYm9vazIuZHJhdyhwcm9ncmVzcyk7XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQ6IGluaXQsXG4gICAgICAgIGhhc01vcmVTdGVwczogc3RlcHMuaGFzTW9yZVN0ZXBzLFxuICAgICAgICBzdGVwOiBzdGVwcy5zdGVwLFxuICAgICAgICBzdG9wOiBzdGVwcy5zdG9wXG4gICAgfTtcbn0pKCk7XG4gIFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVTdGVwcGVyKCkge1xuICAgIHZhciBydW5uaW5nID0gZmFsc2U7XG4gICAgdmFyIGN1cnJlbnRTdGVwID0gMDtcbiAgICB2YXIgc3RlcHMsIHN0b3BTdGVwO1xuXG4gICAgZnVuY3Rpb24gdXNlKHRoZXNlU3RlcHMsIHVzZVRoaXNTdG9wU3RlcCkge1xuICAgICAgICBzdGVwcyA9IHRoZXNlU3RlcHM7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBzdG9wU3RlcCA9IHVzZVRoaXNTdG9wU3RlcDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGlmICghIXN0b3BTdGVwKSB7XG4gICAgICAgICAgICBzdG9wU3RlcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzTW9yZVN0ZXBzKCkge1xuICAgICAgICByZXR1cm4gcnVubmluZyAmJiBjdXJyZW50U3RlcCA8IHN0ZXBzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICBzdGVwc1tjdXJyZW50U3RlcCsrXSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzUnVubmluZygpIHtcbiAgICAgICAgcmV0dXJuIHJ1bm5pbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXNlOiB1c2UsXG4gICAgICAgIHN0b3A6IHN0b3AsXG4gICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICBpc1J1bm5pbmc6IGlzUnVubmluZyxcbiAgICAgICAgc3RlcDogc3RlcFxuICAgIH1cbn07Il19
