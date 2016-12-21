(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.dh = window.dh || {};
window.dh.intro = require("./intro.js");
window.dh.exponential2 = require("./exponential2.js");
window.dh.exponential = require("./exponential.js");
window.dh.elliptic2 = require("./elliptic2.js");

},{"./elliptic2.js":2,"./exponential.js":3,"./exponential2.js":4,"./intro.js":5}],2:[function(require,module,exports){
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

},{"./stepper.js":6}],3:[function(require,module,exports){
"use strict";

var createStepper = require("./stepper.js");
module.exports = (function () {

    function createScaler(canvasWidth, canvasHeight, ctx) {
        var iteration;

        var scaleX;
        var scaleY;

        var maxX = 5,
            maxY = 100000;

        var targetMaxX;
        var targetMaxY;
        var xStep, yStep;

        function draw(callback) {
            ctx.save();
            ctx.translate(0, canvasHeight);
            ctx.scale(scaleX, -scaleY);
            ctx.beginPath();

            callback(ctx, iteration, maxX, scaleX, scaleY);

            ctx.restore();

            ctx.lineJoin = "round";
            ctx.lineWidth = 1;
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
        var equationFunction;

        function set(newEquationFunction) {
            equationFunction = newEquationFunction;
        }

        function calculate(x) {
            return equationFunction(x);
        }

        function draw() {
            scaled.draw(function (ctx, iteration, maxX, scaleX, scaleY) {
                for (var x = 0 + iteration; x <= maxX; x += iteration) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(x, equationFunction(x), 2 / scaleX, 2 / scaleY);
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
        var animateHighlight;
        var shouldDrawHighlight;
        var currentHighlight;
        var highlightEnd;

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

    var steps = (function () {

        var running = false;
        var highLight, scaled, equation;
        var steps = [function () {
            equation.set(function (x) {
                return 17 + x % 97;
            });
        }, function () {
            equation.set(function (x) {
                return 17 * x;
            });
        }, function () {
            equation.set(function (x) {
                return 17 * x % 97;
            });
        }, function () {
            equation.set(function (x) {
                return Math.pow(17, x);
            });
        }, function () {
            highLight.reset();
            scaled.zoomTo(5, 100000);
        }, function () {
            highLight.activate(4);
        }, function () {
            highLight.animateTo(3);
        }, function () {
            highLight.reset();
            scaled.zoomTo(100, 100);
        }, function () {
            equation.set(function (x) {
                return Math.pow(17, x) % 97;
            });
        }, function () {
            highLight.activate(50);
        }, function () {
            highLight.animateTo(30);
        }];
        var currentStep = 0;

        function init(newHighLight, newScaled, newEquation) {
            running = true;
            currentStep = 0;

            highLight = newHighLight;
            scaled = newScaled;
            equation = newEquation;
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

        var scaled = createScaler(canvas.width, canvas.height, ctx);
        scaled.set(500, 100);
        scaled.zoomTo(500, 100);

        var equation = createEquation(scaled);
        equation.set(function (x) {
            return 17 + x;
        });

        var highLight = createHighLight(scaled, equation);
        highLight.reset();

        steps.init(highLight, scaled, equation);

        var axes = createAxes(canvas.width, canvas.height, ctx);

        function draw() {
            if (!steps.isRunning()) {
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

    return {
        init: init,
        hasMoreSteps: steps.hasMoreSteps,
        step: steps.step,
        stop: steps.stop
    };
})();

},{"./stepper.js":6}],4:[function(require,module,exports){
"use strict";

var stepper = require("./stepper.js")();
var strokewidth = 3;

function f(x) {
    return x * x;
}

function init(target) {
    var board = JXG.JSXGraph.initBoard(target.id, {
        boundingbox: [-5, 5, 5, -5],
        axis: true,
        showCopyright: false
    });

    var graph1 = board.create("functiongraph", [f], { strokeWidth: strokewidth });

    stepper.use([function () {}]);
}

module.exports = {
    init: init,
    hasMoreSteps: stepper.hasMoreSteps,
    step: stepper.step,
    stop: stepper.stop
};

},{"./stepper.js":6}],5:[function(require,module,exports){
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

},{"./stepper.js":6}],6:[function(require,module,exports){
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
        return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvbWFpbi5qcyIsIi9ob21lL3RvbS9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9lbGxpcHRpYzIuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwyLmpzIiwiL2hvbWUvdG9tL3ByaXZhdGUvZGlmZmllX2hlbGxtYW4vc3JjL2pzL2ludHJvLmpzIiwiL2hvbWUvdG9tL3ByaXZhdGUvZGlmZmllX2hlbGxtYW4vc3JjL2pzL3N0ZXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7O0FBQWIsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7OztBQ0poRCxZQUFZLENBQUM7O0FBQWIsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7QUFDMUMsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDOztBQUV0QixJQUFJLENBQUMsR0FBQSxTQUFBLENBQUM7QUFDTixJQUFJLENBQUMsR0FBQSxTQUFBLENBQUM7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QUMsUUFBUSxFQUFFO0FBQ1osb0JBQVEsRUFBRSxDQUFDO1NBQ2Q7S0FDSjs7QUFFRCxhQUFTLFlBQVksR0FBRztBQUNwQixlQUFPLE9BQU8sSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUNoRDs7QUFFRCxhQUFTLElBQUksR0FBRztBQUNaLGFBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDMUI7O0FBRUQsYUFBUyxTQUFTLEdBQUc7QUFDakIsZUFBTyxLQUFLLENBQUM7S0FDaEI7O0FBRUQsV0FBTztBQUNILFdBQUcsRUFBRSxHQUFHO0FBQ1IsWUFBSSxFQUFFLElBQUk7QUFDVixvQkFBWSxFQUFFLFlBQVk7QUFDMUIsaUJBQVMsRUFBRSxTQUFTO0FBQ3BCLFlBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQTtDQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmRoID0gd2luZG93LmRoIHx8IHt9O1xud2luZG93LmRoLmludHJvID0gcmVxdWlyZSgnLi9pbnRyby5qcycpO1xud2luZG93LmRoLmV4cG9uZW50aWFsMiA9IHJlcXVpcmUoJy4vZXhwb25lbnRpYWwyLmpzJyk7XG53aW5kb3cuZGguZXhwb25lbnRpYWwgPSByZXF1aXJlKCcuL2V4cG9uZW50aWFsLmpzJyk7XG53aW5kb3cuZGguZWxsaXB0aWMyID0gcmVxdWlyZSgnLi9lbGxpcHRpYzIuanMnKTtcblxuXG4iLCJjb25zdCBzdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJykoKTtcbmNvbnN0IHN0cm9rZXdpZHRoID0gMztcblxubGV0IGE7XG5sZXQgYjtcblxuZnVuY3Rpb24gZih4KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCAqIHggKyBhLlZhbHVlKCkgKiB4ICsgYi5WYWx1ZSgpKTtcbn1cblxuZnVuY3Rpb24gaW52ZXJzZUYoeCkge1xuICAgIHJldHVybiAtZih4KTtcbn1cblxuZnVuY3Rpb24gaW5pdCh0YXJnZXQpIHtcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0PVwiNzAwcHhcIjtcbiAgICB0YXJnZXQuc3R5bGUud2lkdGg9XCI3MDBweFwiO1xuICAgIGNvbnN0IGJvYXJkID0gSlhHLkpTWEdyYXBoLmluaXRCb2FyZCh0YXJnZXQuaWQsIHtcbiAgICAgICAgYm91bmRpbmdib3g6IFstNSwgNSwgNSwgLTVdLFxuICAgICAgICBheGlzOiB0cnVlLFxuICAgICAgICBzaG93Q29weXJpZ2h0OiBmYWxzZVxuICAgIH0pO1xuXG4gICAgYSA9IGJvYXJkLmNyZWF0ZSgnc2xpZGVyJywgW1swLCAtM10sIFs0LCAtM10sIFstNSwgLTMsIDVdXSk7XG4gICAgYiA9IGJvYXJkLmNyZWF0ZSgnc2xpZGVyJywgW1swLCAtNF0sIFs0LCAtNF0sIFstNSwgMywgNV1dKTtcblxuICAgIGNvbnN0IGdyYXBoMSA9IGJvYXJkLmNyZWF0ZSgnZnVuY3Rpb25ncmFwaCcsIFtmXSwge3N0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgIGNvbnN0IGdyYXBoMiA9IGJvYXJkLmNyZWF0ZSgnZnVuY3Rpb25ncmFwaCcsIFtpbnZlcnNlRl0sIHtzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcblxuICAgIGxldCBvcmlnaW5hbFBvaW50LCBwb2ludCxcbiAgICAgICAgICAgIHRhbmdlbnQsXG4gICAgICAgICAgICBpbnRlcnNlY3Q7XG5cbiAgICBzdGVwcGVyLnVzZShbXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIG9yaWdpbmFsUG9pbnQgPSBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgW2dyYXBoMV0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0YW5nZW50ID0gYm9hcmQuY3JlYXRlKCd0YW5nZW50JywgW3BvaW50XSwge3N0cm9rZUNvbG9yOiAnI2ZmMDAwMCcsIGRhc2g6IDIsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMl0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IC0xLjI2O1xuICAgICAgICAgICAgb3JpZ2luYWxQb2ludC5tb3ZlVG8oW3RhcmdldCwgZih0YXJnZXQpXSwgMjAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMl0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDIsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMV0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfVxuICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGhhc01vcmVTdGVwczogc3RlcHBlci5oYXNNb3JlU3RlcHMsXG4gICAgc3RlcDogc3RlcHBlci5zdGVwLFxuICAgIHN0b3A6IHN0ZXBwZXIuc3RvcFxufTsiLCJjb25zdCBjcmVhdGVTdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTY2FsZXIgKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIGN0eCkge1xuICAgICAgICB2YXIgaXRlcmF0aW9uO1xuXG4gICAgICAgIHZhciBzY2FsZVg7XG4gICAgICAgIHZhciBzY2FsZVk7XG5cbiAgICAgICAgdmFyIG1heFggPSA1LCBtYXhZID0gMTAwMDAwO1xuXG4gICAgICAgIHZhciB0YXJnZXRNYXhYO1xuICAgICAgICB2YXIgdGFyZ2V0TWF4WTtcbiAgICAgICAgdmFyIHhTdGVwLCB5U3RlcDtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3KGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBjYW52YXNIZWlnaHQpO1xuICAgICAgICAgICAgY3R4LnNjYWxlKHNjYWxlWCwgLXNjYWxlWSk7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKGN0eCwgaXRlcmF0aW9uLCBtYXhYLCBzY2FsZVgsIHNjYWxlWSk7XG5cbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgICAgIGN0eC5saW5lSm9pbiA9ICdyb3VuZCc7XG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHpvb21UbyhuZXdNYXhYLCBuZXdNYXhZKSB7XG4gICAgICAgICAgICB0YXJnZXRNYXhYID0gbmV3TWF4WDtcbiAgICAgICAgICAgIHRhcmdldE1heFkgPSBuZXdNYXhZO1xuXG4gICAgICAgICAgICB4U3RlcCA9ICh0YXJnZXRNYXhYIC0gbWF4WCkgLyAxMDA7XG4gICAgICAgICAgICB5U3RlcCA9ICh0YXJnZXRNYXhZIC0gbWF4WSkgLyAxMDA7XG5cbiAgICAgICAgICAgIHpvb21TdGVwKG1heFgsIG1heFkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0KG5ld01heFgsIG5ld01heFkpIHtcbiAgICAgICAgICAgIG1heFggPSBuZXdNYXhYO1xuICAgICAgICAgICAgbWF4WSA9IG5ld01heFk7XG4gICAgICAgICAgICBpdGVyYXRpb24gPSBuZXdNYXhYIC8gMTAwMDtcblxuICAgICAgICAgICAgc2NhbGVYID0gY2FudmFzV2lkdGggLyBuZXdNYXhYO1xuICAgICAgICAgICAgc2NhbGVZID0gY2FudmFzSGVpZ2h0IC8gbmV3TWF4WTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHpvb21TdGVwKCkge1xuICAgICAgICAgICAgdmFyIHhEaWZmID0gTWF0aC5hYnModGFyZ2V0TWF4WCAtIG1heFgpO1xuICAgICAgICAgICAgdmFyIHlEaWZmID0gTWF0aC5hYnModGFyZ2V0TWF4WSAtIG1heFkpO1xuXG4gICAgICAgICAgICBpZiAoeERpZmYgPiAwLjEgfHwgeURpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICBpZiAoeERpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4WCArPSB4U3RlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHlEaWZmID4gMC4xKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heFkgKz0geVN0ZXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldChtYXhYLCBtYXhZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXQ6IHNldCxcbiAgICAgICAgICAgIGRyYXc6IGRyYXcsXG4gICAgICAgICAgICB6b29tVG86IHpvb21UbyxcbiAgICAgICAgICAgIHpvb21TdGVwOiB6b29tU3RlcFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUF4ZXMoY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgY3R4KSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBjYW52YXNIZWlnaHQpO1xuICAgICAgICAgICAgY3R4LnNjYWxlKDEsIC0xKTtcblxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oY2FudmFzV2lkdGgsIDApO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNhYWEnO1xuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG4gICAgICAgICAgICBjdHgubGluZVRvKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2FhYSc7XG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkcmF3OiBkcmF3XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVFcXVhdGlvbihzY2FsZWQpIHtcbiAgICAgICAgdmFyIGVxdWF0aW9uRnVuY3Rpb247XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0KG5ld0VxdWF0aW9uRnVuY3Rpb24pIHtcbiAgICAgICAgICAgIGVxdWF0aW9uRnVuY3Rpb24gPSBuZXdFcXVhdGlvbkZ1bmN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlKHgpIHtcbiAgICAgICAgICAgIHJldHVybiBlcXVhdGlvbkZ1bmN0aW9uKHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIHNjYWxlZC5kcmF3KGZ1bmN0aW9uIChjdHgsIGl0ZXJhdGlvbiwgbWF4WCwgc2NhbGVYLCBzY2FsZVkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMCArIGl0ZXJhdGlvbjsgeCA8PSBtYXhYOyB4ICs9IGl0ZXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3JlZCc7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCh4LCBlcXVhdGlvbkZ1bmN0aW9uKHgpLCAyIC8gc2NhbGVYLCAyIC8gc2NhbGVZKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXQ6IHNldCxcbiAgICAgICAgICAgIGRyYXc6IGRyYXcsXG4gICAgICAgICAgICBjYWxjdWxhdGU6IGNhbGN1bGF0ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlSGlnaExpZ2h0KHNjYWxlZCwgZXF1YXRpb24pIHtcbiAgICAgICAgdmFyIGFuaW1hdGVIaWdobGlnaHQ7XG4gICAgICAgIHZhciBzaG91bGREcmF3SGlnaGxpZ2h0O1xuICAgICAgICB2YXIgY3VycmVudEhpZ2hsaWdodDtcbiAgICAgICAgdmFyIGhpZ2hsaWdodEVuZDtcblxuICAgICAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgICAgIGFuaW1hdGVIaWdobGlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHNob3VsZERyYXdIaWdobGlnaHQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKGhpZ2hsaWdodFN0YXJ0KSB7XG4gICAgICAgICAgICBzaG91bGREcmF3SGlnaGxpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnRIaWdobGlnaHQgPSBoaWdobGlnaHRTdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFuaW1hdGVUbyh0bykge1xuICAgICAgICAgICAgYW5pbWF0ZUhpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgICAgICBoaWdobGlnaHRFbmQgPSB0bztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBpZiAoIXNob3VsZERyYXdIaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjYWxlZC5kcmF3KGZ1bmN0aW9uIChjdHgsIGl0ZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SGlnaGxpZ2h0ID4gaGlnaGxpZ2h0RW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmltYXRlSGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SGlnaGxpZ2h0IC09IGl0ZXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciB4ID0gZXF1YXRpb24uY2FsY3VsYXRlKGN1cnJlbnRIaWdobGlnaHQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8oY3VycmVudEhpZ2hsaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhjdXJyZW50SGlnaGxpZ2h0LCB4KTtcblxuICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8oMCwgeCk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhjdXJyZW50SGlnaGxpZ2h0LCB4KTtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNldDogcmVzZXQsXG4gICAgICAgICAgICBhY3RpdmF0ZTogYWN0aXZhdGUsXG4gICAgICAgICAgICBhbmltYXRlVG86IGFuaW1hdGVUbyxcbiAgICAgICAgICAgIGRyYXc6IGRyYXdcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdGVwcyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdmFyIGhpZ2hMaWdodCwgc2NhbGVkLCBlcXVhdGlvbjtcbiAgICAgICAgdmFyIHN0ZXBzID0gW1xuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVxdWF0aW9uLnNldChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTcreCAlIDk3O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlcXVhdGlvbi5zZXQoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE3Kng7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVxdWF0aW9uLnNldChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTcqeCAlIDk3O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlcXVhdGlvbi5zZXQoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucG93KDE3LCB4KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGlnaExpZ2h0LnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgc2NhbGVkLnpvb21Ubyg1LCAxMDAwMDApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBoaWdoTGlnaHQuYWN0aXZhdGUoNCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGhpZ2hMaWdodC5hbmltYXRlVG8oMylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGlnaExpZ2h0LnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgc2NhbGVkLnpvb21UbygxMDAsIDEwMCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVxdWF0aW9uLnNldChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5wb3coMTcsIHgpICUgOTc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGhpZ2hMaWdodC5hY3RpdmF0ZSg1MCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGhpZ2hMaWdodC5hbmltYXRlVG8oMzApXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIHZhciBjdXJyZW50U3RlcCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdChuZXdIaWdoTGlnaHQsIG5ld1NjYWxlZCwgbmV3RXF1YXRpb24pIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgY3VycmVudFN0ZXAgPSAwO1xuXG4gICAgICAgICAgICBoaWdoTGlnaHQgPSBuZXdIaWdoTGlnaHQ7XG4gICAgICAgICAgICBzY2FsZWQgPSBuZXdTY2FsZWQ7XG4gICAgICAgICAgICBlcXVhdGlvbiA9IG5ld0VxdWF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhc01vcmVTdGVwcygpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICAgICAgc3RvcDogc3RvcCxcbiAgICAgICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgICAgICBzdGVwOiBzdGVwXG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgZnVuY3Rpb24gaW5pdChjYW52YXMpIHtcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHZhciBzY2FsZWQgPSBjcmVhdGVTY2FsZXIoY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBjdHgpO1xuICAgICAgICBzY2FsZWQuc2V0KDUwMCwgMTAwKTtcbiAgICAgICAgc2NhbGVkLnpvb21Ubyg1MDAsIDEwMCk7XG5cbiAgICAgICAgdmFyIGVxdWF0aW9uID0gY3JlYXRlRXF1YXRpb24oc2NhbGVkKTtcbiAgICAgICAgZXF1YXRpb24uc2V0KGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxNyArIHg7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGhpZ2hMaWdodCA9IGNyZWF0ZUhpZ2hMaWdodChzY2FsZWQsIGVxdWF0aW9uKTtcbiAgICAgICAgaGlnaExpZ2h0LnJlc2V0KCk7XG5cbiAgICAgICAgc3RlcHMuaW5pdChoaWdoTGlnaHQsIHNjYWxlZCwgZXF1YXRpb24pO1xuXG4gICAgICAgIHZhciBheGVzID0gY3JlYXRlQXhlcyhjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQsIGN0eCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGlmICghc3RlcHMuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGF4ZXMuZHJhdygpO1xuICAgICAgICAgICAgZXF1YXRpb24uZHJhdygpO1xuICAgICAgICAgICAgaGlnaExpZ2h0LmRyYXcoKTtcbiAgICAgICAgICAgIHNjYWxlZC56b29tU3RlcCgpO1xuXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICBoYXNNb3JlU3RlcHM6IHN0ZXBzLmhhc01vcmVTdGVwcyxcbiAgICAgICAgc3RlcDogc3RlcHMuc3RlcCxcbiAgICAgICAgc3RvcDogc3RlcHMuc3RvcFxuICAgIH07XG59KSgpO1xuICBcbiIsImNvbnN0IHN0ZXBwZXIgPSByZXF1aXJlKCcuL3N0ZXBwZXIuanMnKSgpO1xuY29uc3Qgc3Ryb2tld2lkdGggPSAzO1xuXG5mdW5jdGlvbiBmKHgpIHtcbiAgICByZXR1cm4geCp4O1xufVxuXG5mdW5jdGlvbiBpbml0KHRhcmdldCkge1xuICAgIGNvbnN0IGJvYXJkID0gSlhHLkpTWEdyYXBoLmluaXRCb2FyZCh0YXJnZXQuaWQsIHtcbiAgICAgICAgYm91bmRpbmdib3g6IFstNSwgNSwgNSwgLTVdLFxuICAgICAgICBheGlzOiB0cnVlLFxuICAgICAgICBzaG93Q29weXJpZ2h0OiBmYWxzZVxuICAgIH0pO1xuXG4gICAgY29uc3QgZ3JhcGgxID0gYm9hcmQuY3JlYXRlKCdmdW5jdGlvbmdyYXBoJywgW2ZdLCB7c3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG5cbiAgICBzdGVwcGVyLnVzZShbXG4gICAgICAgICgpID0+IHsgfVxuICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGhhc01vcmVTdGVwczogc3RlcHBlci5oYXNNb3JlU3RlcHMsXG4gICAgc3RlcDogc3RlcHBlci5zdGVwLFxuICAgIHN0b3A6IHN0ZXBwZXIuc3RvcFxufTsiLCJjb25zdCBjcmVhdGVTdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gIChmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgbWF4V2lkdGgsIG1heEhlaWdodCwgYWN0b3JXaWR0aDtcbiAgICB2YXIgaGFsZldpZHRoLCBoYWxmSGVpZ2h0LCBoYWxmQWN0b3JXaWR0aDtcblxuICAgIHZhciBhY3RvclksIGludHJ1ZGVyWSwgbWVzc2FnZVk7XG5cbiAgICBmdW5jdGlvbiBzZXRTaXplcyhjYW52YXMpIHtcbiAgICAgICAgbWF4V2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgICAgIG1heEhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGFjdG9yV2lkdGggPSAxMDA7XG5cbiAgICAgICAgaGFsZldpZHRoID0gbWF4V2lkdGggLyAyO1xuICAgICAgICBoYWxmSGVpZ2h0ID0gbWF4SGVpZ2h0IC8gMjtcbiAgICAgICAgaGFsZkFjdG9yV2lkdGggPSBhY3RvcldpZHRoIC8gMjtcblxuICAgICAgICBhY3RvclkgPSBoYWxmSGVpZ2h0LWFjdG9yV2lkdGg7XG4gICAgICAgIGludHJ1ZGVyWSA9IG1heEhlaWdodC0yKmFjdG9yV2lkdGg7XG4gICAgICAgIG1lc3NhZ2VZID0gYWN0b3JZLTU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUFjdGl2YXRhYmxlKHNvbWV0aGluZykge1xuICAgICAgICB2YXIgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHZhciBvcmlnaW5hbERyYXcgPSBzb21ldGhpbmcuZHJhdztcblxuICAgICAgICBzb21ldGhpbmcuZHJhdyA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKCEhb3JpZ2luYWxEcmF3ICYmIGFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsRHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc29tZXRoaW5nLmFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBzb21ldGhpbmcuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzb21ldGhpbmc7XG4gICAgfVxuXG4gICAgdmFyIGNyZWF0ZUltYWdlcyA9IGZ1bmN0aW9uIChvbkNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBpbWFnZXMgPSBbXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9zZWFuX2Nvbm5lcnkuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL20uanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2RyX25vLmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9jbGllbnQuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2ViYXkucG5nJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2hhY2tlci5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvb3RwYm9va2xldC5qcGcnLFxuICAgICAgICBdO1xuICAgICAgICB2YXIgaW1hZ2VPYmplY3RzID0gW107XG5cbiAgICAgICAgdmFyIGxvYWRlZCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAgICAgbG9hZGVkKys7XG4gICAgICAgICAgICBpZiAobG9hZGVkID09PSBpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb25Db21wbGV0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGpiOiBpbWFnZU9iamVjdHNbMF0sXG4gICAgICAgICAgICAgICAgICAgIG06IGltYWdlT2JqZWN0c1sxXSxcbiAgICAgICAgICAgICAgICAgICAgbm86IGltYWdlT2JqZWN0c1syXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50OiBpbWFnZU9iamVjdHNbM10sXG4gICAgICAgICAgICAgICAgICAgIHNob3A6IGltYWdlT2JqZWN0c1s0XSxcbiAgICAgICAgICAgICAgICAgICAgaGFja2VyOiBpbWFnZU9iamVjdHNbNV0sXG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rOiBpbWFnZU9iamVjdHNbNl0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZCk7XG4gICAgICAgICAgICBpbWcuc3JjID0gaW1hZ2VzW2ldO1xuICAgICAgICAgICAgaW1hZ2VPYmplY3RzLnB1c2goaW1nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlQWN0b3IgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCBpbWFnZSwgYWx0ZXJuYXRlSW1hZ2UpIHtcbiAgICAgICAgdmFyIHdpZHRoID0gMTAwLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRJbWFnZSA9IGltYWdlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gY3VycmVudEltYWdlLmhlaWdodCAqICh3aWR0aCAvIGN1cnJlbnRJbWFnZS53aWR0aClcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoY3VycmVudEltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe1xuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIHVzZUpCOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gYWx0ZXJuYXRlSW1hZ2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlTm9ybWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIHN0cikge1xuICAgICAgICB2YXIgdGFyZ2V0WCwgdGFyZ2V0WSwgeFN0ZXAsIHlTdGVwLFxuICAgICAgICAgICAgICAgIG1vdmVYLCBtb3ZlWSxcbiAgICAgICAgICAgICAgICB4T2Zmc2V0LCB5T2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdyhwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKG1vdmVYKHggKyB4T2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgIHhPZmZzZXQgKz0gcHJvZ3Jlc3MgKiB4U3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb3ZlWSh5ICsgeU9mZnNldCkpIHtcbiAgICAgICAgICAgICAgICB5T2Zmc2V0ICs9IHByb2dyZXNzICogeVN0ZXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0eC5mb250ID0gXCI0OHB4IHNlcmlmXCI7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQobWVzc2FnZSwgeCArIHhPZmZzZXQsIHkgKyB5T2Zmc2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNhbGNTdGVwKCkge1xuICAgICAgICAgICAgeFN0ZXAgPSAodGFyZ2V0WCAtIHggKyB4T2Zmc2V0KSAvIG1heFdpZHRoO1xuICAgICAgICAgICAgaWYgKHRhcmdldFggPiB4ICsgeE9mZnNldCkge1xuICAgICAgICAgICAgICAgIG1vdmVYID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHggPCB0YXJnZXRYO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdmVYID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHggPiB0YXJnZXRYO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlTdGVwID0gKHRhcmdldFkgLSB5ICsgeU9mZnNldCkgLyBtYXhXaWR0aDtcbiAgICAgICAgICAgIGlmICh0YXJnZXRZID4geSArIHlPZmZzZXQpIHtcbiAgICAgICAgICAgICAgICBtb3ZlWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB5IDwgdGFyZ2V0WTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb3ZlWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB5ID4gdGFyZ2V0WTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZVRvSGFsZigpIHtcbiAgICAgICAgICAgIHRhcmdldFggPSBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aDtcbiAgICAgICAgICAgIGNhbGNTdGVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlVG9GdWxsKCkge1xuICAgICAgICAgICAgdGFyZ2V0WCA9IG1heFdpZHRoIC0gYWN0b3JXaWR0aCAtIDQwO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVEb3duKCkge1xuICAgICAgICAgICAgdGFyZ2V0WSA9IGludHJ1ZGVyWS0yMDtcbiAgICAgICAgICAgIGNhbGNTdGVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZXRTdGFydChuZXdYLCBuZXdZKSB7XG4gICAgICAgICAgICB4ID0gbmV3WCB8fCB4O1xuICAgICAgICAgICAgeSA9IG5ld1kgfHwgeTtcbiAgICAgICAgICAgIHRhcmdldFggPSBuZXdYIHx8IHg7XG4gICAgICAgICAgICB0YXJnZXRZID0gbmV3WSB8fCB5O1xuICAgICAgICAgICAgeFN0ZXAgPSAxO1xuICAgICAgICAgICAgeVN0ZXAgPSAxO1xuICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBtb3ZlWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHhPZmZzZXQgPSAwO1xuICAgICAgICAgICAgeU9mZnNldCA9IDA7XG4gICAgICAgICAgICBtZXNzYWdlID0gJzc2MjYnO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldE1lc3NhZ2UobmV3TWVzc2FnZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IG5ld01lc3NhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRTdGFydCgpO1xuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe1xuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIG1vdmVUb0hhbGY6IG1vdmVUb0hhbGYsXG4gICAgICAgICAgICBtb3ZlVG9GdWxsOiBtb3ZlVG9GdWxsLFxuICAgICAgICAgICAgbW92ZURvd246IG1vdmVEb3duLFxuICAgICAgICAgICAgc2V0U3RhcnQ6IHNldFN0YXJ0LFxuICAgICAgICAgICAgc2V0TWVzc2FnZTogc2V0TWVzc2FnZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZVByb3RvY29sID0gZnVuY3Rpb24gKGN0eCwgeSkge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhhY3RvcldpZHRoLCB5KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8obWF4V2lkdGggLSBhY3RvcldpZHRoLCB5KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe2RyYXc6IGRyYXd9KTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZVByb3RvY29sRG90cyA9IGZ1bmN0aW9uIChjdHgsIHkpIHtcbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5hcmMoaGFsZldpZHRoLCB5LCAyLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2xMaXN0ZW5lciA9IGZ1bmN0aW9uIChjdHgsIHkxLCB5Mikge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhoYWxmV2lkdGgsIHkxKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCB5Mik7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtkcmF3OiBkcmF3fSk7XG4gICAgfTtcblxuICAgIHZhciBzdGVwcyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdmFyIHN0ZXBzO1xuICAgICAgICB2YXIgY3VycmVudFN0ZXAgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoY2xpZW50LCBzZXJ2ZXIsIGludHJ1ZGVyLFxuICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UsIG1lc3NhZ2VDb3B5LCBwcm90b2NvbCxcbiAgICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMsIHByb3RvY29sTGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLCBjb2RlYm9vazIpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgY3VycmVudFN0ZXAgPSAwO1xuXG4gICAgICAgICAgICBzdGVwcyA9IFtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBwcm90b2NvbC5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0hhbGYsXG4gICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0Z1bGwoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2wuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LnNldFN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQudXNlSkIoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLnVzZUpCKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIudXNlSkIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2wuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMi5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYgKyA2MDgxMScpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoNzYyNiArIDYwODExKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0TWVzc2FnZSg3NjI2ICsgNjA4MTEpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9IYWxmLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9GdWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQobWF4V2lkdGggLSAzKmFjdG9yV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoKDc2MjYgKyA2MDgxMSkgKyAnLSA2MDgxMScpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KG1heFdpZHRoIC0gYWN0b3JXaWR0aCAtIDQwKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKCc3NjI2Jyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQoMSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0U3RhcnQobWF4V2lkdGggLSBhY3RvcldpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LnVzZU5vcm1hbCgpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLnVzZU5vcm1hbCgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYgKyBLZXknKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0TWVzc2FnZSgnS2V5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYXNNb3JlU3RlcHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZyAmJiBjdXJyZW50U3RlcCA8IHN0ZXBzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgICAgICBzdGVwc1tjdXJyZW50U3RlcCsrXSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaXNSdW5uaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgICAgIHN0b3A6IHN0b3AsXG4gICAgICAgICAgICBoYXNNb3JlU3RlcHM6IGhhc01vcmVTdGVwcyxcbiAgICAgICAgICAgIGlzUnVubmluZzogaXNSdW5uaW5nLFxuICAgICAgICAgICAgc3RlcDogc3RlcFxuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGZ1bmN0aW9uIGluaXQoY2FudmFzKSB7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBzZXRTaXplcyhjYW52YXMpO1xuXG4gICAgICAgIGNyZWF0ZUltYWdlcyhmdW5jdGlvbiAoaW1hZ2VzKSB7XG4gICAgICAgICAgICB2YXIgY2xpZW50ID0gY3JlYXRlQWN0b3IoY3R4LCAwLCBhY3RvclksIGltYWdlcy5jbGllbnQsIGltYWdlcy5qYik7XG4gICAgICAgICAgICBjbGllbnQuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBjcmVhdGVBY3RvcihjdHgsIG1heFdpZHRoIC0gYWN0b3JXaWR0aCwgYWN0b3JZLCBpbWFnZXMuc2hvcCwgaW1hZ2VzLm0pO1xuICAgICAgICAgICAgdmFyIGludHJ1ZGVyID0gY3JlYXRlQWN0b3IoY3R4LCBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aCwgaW50cnVkZXJZLCBpbWFnZXMuaGFja2VyLCBpbWFnZXMubm8pO1xuICAgICAgICAgICAgdmFyIGNvZGVib29rMSA9IGNyZWF0ZUFjdG9yKGN0eCwgMCwgNDAsIGltYWdlcy5jb2RlYm9vayk7XG4gICAgICAgICAgICB2YXIgY29kZWJvb2syID0gY3JlYXRlQWN0b3IoY3R4LCBtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIDQwLCBpbWFnZXMuY29kZWJvb2spO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBjcmVhdGVNZXNzYWdlKGN0eCwgMCwgbWVzc2FnZVksICdvcmlnJyk7XG5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlQ29weSA9IGNyZWF0ZU1lc3NhZ2UoY3R4LCBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aCwgbWVzc2FnZVksICdjb3B5Jyk7XG5cbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGNyZWF0ZVByb3RvY29sKGN0eCwgYWN0b3JZKTtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbERvdHMgPSBjcmVhdGVQcm90b2NvbERvdHMoY3R4LCBhY3RvclkpO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sTGlzdGVuZXIgPSBjcmVhdGVQcm90b2NvbExpc3RlbmVyKGN0eCwgYWN0b3JZLCBpbnRydWRlclkpO1xuXG4gICAgICAgICAgICBzdGVwcy5pbml0KGNsaWVudCwgc2VydmVyLCBpbnRydWRlciwgbWVzc2FnZSwgbWVzc2FnZUNvcHksIHByb3RvY29sLFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMsIHByb3RvY29sTGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMSwgY29kZWJvb2syKTtcblxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcblxuICAgICAgICAgICAgdmFyIGxhc3RUaW1lO1xuICAgICAgICAgICAgdmFyIHByb2dyZXNzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGVwcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFsYXN0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gKGN1cnJlbnRUaW1lIC0gbGFzdFRpbWUpO1xuICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBjbGllbnQuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGludHJ1ZGVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2wuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgY29kZWJvb2sxLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGNvZGVib29rMi5kcmF3KHByb2dyZXNzKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgaGFzTW9yZVN0ZXBzOiBzdGVwcy5oYXNNb3JlU3RlcHMsXG4gICAgICAgIHN0ZXA6IHN0ZXBzLnN0ZXAsXG4gICAgICAgIHN0b3A6IHN0ZXBzLnN0b3BcbiAgICB9O1xufSkoKTtcbiAgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVN0ZXBwZXIoKSB7XG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB2YXIgY3VycmVudFN0ZXAgPSAwO1xuICAgIHZhciBzdGVwcywgc3RvcFN0ZXA7XG5cbiAgICBmdW5jdGlvbiB1c2UodGhlc2VTdGVwcywgdXNlVGhpc1N0b3BTdGVwKSB7XG4gICAgICAgIHN0ZXBzID0gdGhlc2VTdGVwcztcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIHN0b3BTdGVwID0gdXNlVGhpc1N0b3BTdGVwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKCEhc3RvcFN0ZXApIHtcbiAgICAgICAgICAgIHN0b3BTdGVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNNb3JlU3RlcHMoKSB7XG4gICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXNlOiB1c2UsXG4gICAgICAgIHN0b3A6IHN0b3AsXG4gICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICBpc1J1bm5pbmc6IGlzUnVubmluZyxcbiAgICAgICAgc3RlcDogc3RlcFxuICAgIH1cbn07Il19
