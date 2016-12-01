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

    var maxWidth = 500,
        maxHeight = 500;
    var actorWidth = 100;

    var halfWidth = maxWidth / 2;
    var halfHeight = maxHeight / 2;
    var halfActorWidth = actorWidth / 2;

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
            console.log("Adjusting", str);
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
            targetY = 440;
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

    var createProtocolListener = function createProtocolListener(ctx, y) {
        function draw() {
            ctx.beginPath();
            ctx.moveTo(halfWidth, y);
            ctx.lineTo(halfWidth, y + 100);
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
                message.setStart(200);
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

        createImages(function (images) {
            var client = createActor(ctx, 0, 200, images.client, images.jb);
            client.activate();
            var server = createActor(ctx, maxWidth - actorWidth, 200, images.shop, images.m);
            var intruder = createActor(ctx, halfWidth - halfActorWidth, 300, images.hacker, images.no);
            var codebook1 = createActor(ctx, 0, 40, images.codebook);
            var codebook2 = createActor(ctx, maxWidth - actorWidth, 40, images.codebook);
            var message = createMessage(ctx, 0, 180, "orig");

            var messageCopy = createMessage(ctx, halfWidth - halfActorWidth, 180, "copy");

            var protocol = createProtocol(ctx, 185);
            var protocolDots = createProtocolDots(ctx, 185);
            var protocolListener = createProtocolListener(ctx, 185);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvbWFpbi5qcyIsIi9ob21lL3RvbS9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9lbGxpcHRpYzIuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwyLmpzIiwiL2hvbWUvdG9tL3ByaXZhdGUvZGlmZmllX2hlbGxtYW4vc3JjL2pzL2ludHJvLmpzIiwiL2hvbWUvdG9tL3ByaXZhdGUvZGlmZmllX2hlbGxtYW4vc3JjL2pzL3N0ZXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7O0FBQWIsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7O0FDSmhELElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO0FBQzFDLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQzs7QUFFdEIsSUFBSSxDQUFDLFlBQUEsQ0FBQztBQUNOLElBQUksQ0FBQyxZQUFBLENBQUM7O0FBRU4sU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ1YsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Q0FDM0Q7O0FBRUQsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ2pCLFdBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDaEI7O0FBRUQsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2xCLFFBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7QUFDNUMsbUJBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0IsWUFBSSxFQUFFLElBQUk7QUFDVixxQkFBYSxFQUFFLEtBQUs7S0FDdkIsQ0FBQyxDQUFDOztBQUVILEtBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxLQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUUzRCxRQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFB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LEVBQUUsS0FBSyxDQUFDLElBQUk7S0FDbkIsQ0FBQztDQUNMLENBQUEsRUFBRyxDQUFDOzs7QUNsWkwsWUFBWSxDQUFDOztBQUFiLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxhQUFhLEdBQUc7QUFDdEMsUUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixRQUFJLEtBQUssRUFBRSxRQUFRLENBQUM7O0FBRXBCLGFBQVMsR0FBRyxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUU7QUFDdEMsYUFBSyxHQUFHLFVBQVUsQ0FBQztBQUNuQixlQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ2YsZ0JBQVEsR0FBRyxlQUFlLENBQUM7S0FDOUI7O0FBRUQsYUFBUyxJQUFJLEdBQUc7QUFDWixlQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ2hCLFlBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNaLG9CQUFRLEVBQUUsQ0FBQztTQUNkO0tBQ0o7O0FBRUQsYUFBUyxZQUFZLEdBQUc7QUFDcEIsZUFBTyxPQUFPLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDaEQ7O0FBRUQsYUFBUyxJQUFJLEdBQUc7QUFDWixhQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQzFCOztBQUVELGFBQVMsU0FBUyxHQUFHO0FBQ2pCLGVBQU8sS0FBSyxDQUFDO0tBQ2hCOztBQUVELFdBQU87QUFDSCxXQUFHLEVBQUUsR0FBRztBQUNSLFlBQUksRUFBRSxJQUFJO0FBQ1Ysb0JBQVksRUFBRSxZQUFZO0FBQzFCLGlCQUFTLEVBQUUsU0FBUztBQUNwQixZQUFJLEVBQUUsSUFBSTtLQUNiLENBQUE7Q0FDSixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIndpbmRvdy5kaCA9IHdpbmRvdy5kaCB8fCB7fTtcbndpbmRvdy5kaC5pbnRybyA9IHJlcXVpcmUoJy4vaW50cm8uanMnKTtcbndpbmRvdy5kaC5leHBvbmVudGlhbDIgPSByZXF1aXJlKCcuL2V4cG9uZW50aWFsMi5qcycpO1xud2luZG93LmRoLmV4cG9uZW50aWFsID0gcmVxdWlyZSgnLi9leHBvbmVudGlhbC5qcycpO1xud2luZG93LmRoLmVsbGlwdGljMiA9IHJlcXVpcmUoJy4vZWxsaXB0aWMyLmpzJyk7XG5cblxuIiwiY29uc3Qgc3RlcHBlciA9IHJlcXVpcmUoJy4vc3RlcHBlci5qcycpKCk7XG5jb25zdCBzdHJva2V3aWR0aCA9IDM7XG5cbmxldCBhO1xubGV0IGI7XG5cbmZ1bmN0aW9uIGYoeCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKiB4ICsgYS5WYWx1ZSgpICogeCArIGIuVmFsdWUoKSk7XG59XG5cbmZ1bmN0aW9uIGludmVyc2VGKHgpIHtcbiAgICByZXR1cm4gLWYoeCk7XG59XG5cbmZ1bmN0aW9uIGluaXQodGFyZ2V0KSB7XG4gICAgY29uc3QgYm9hcmQgPSBKWEcuSlNYR3JhcGguaW5pdEJvYXJkKHRhcmdldC5pZCwge1xuICAgICAgICBib3VuZGluZ2JveDogWy01LCA1LCA1LCAtNV0sXG4gICAgICAgIGF4aXM6IHRydWUsXG4gICAgICAgIHNob3dDb3B5cmlnaHQ6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBhID0gYm9hcmQuY3JlYXRlKCdzbGlkZXInLCBbWzAsIC0zXSwgWzQsIC0zXSwgWy01LCAtMywgNV1dKTtcbiAgICBiID0gYm9hcmQuY3JlYXRlKCdzbGlkZXInLCBbWzAsIC00XSwgWzQsIC00XSwgWy01LCAzLCA1XV0pO1xuXG4gICAgY29uc3QgZ3JhcGgxID0gYm9hcmQuY3JlYXRlKCdmdW5jdGlvbmdyYXBoJywgW2ZdLCB7c3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgY29uc3QgZ3JhcGgyID0gYm9hcmQuY3JlYXRlKCdmdW5jdGlvbmdyYXBoJywgW2ludmVyc2VGXSwge3N0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuXG4gICAgbGV0IG9yaWdpbmFsUG9pbnQsIHBvaW50LFxuICAgICAgICAgICAgdGFuZ2VudCxcbiAgICAgICAgICAgIGludGVyc2VjdDtcblxuICAgIHN0ZXBwZXIudXNlKFtcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgb3JpZ2luYWxQb2ludCA9IHBvaW50ID0gYm9hcmQuY3JlYXRlKCdnbGlkZXInLCBbZ3JhcGgxXSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMSwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgWygpID0+IHsgcmV0dXJuIGludGVyc2VjdC5YKCkgfSwgKCkgPT4geyByZXR1cm4gLWludGVyc2VjdC5ZKCkgfSwgZ3JhcGgyXSk7XG4gICAgICAgICAgICBib2FyZC5jcmVhdGUoJ2xpbmUnLCBbaW50ZXJzZWN0LCBwb2ludF0sXG4gICAgICAgICAgICAgICAgICAgIHtkYXNoOiAzLCBzdHJhaWdodEZpcnN0OiBmYWxzZSwgc3RyYWlnaHRMYXN0OiBmYWxzZSwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRoLCBsYXN0QXJyb3c6IHRydWV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gLTEuMjY7XG4gICAgICAgICAgICBvcmlnaW5hbFBvaW50Lm1vdmVUbyhbdGFyZ2V0LCBmKHRhcmdldCldLCAyMDAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMSwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgWygpID0+IHsgcmV0dXJuIGludGVyc2VjdC5YKCkgfSwgKCkgPT4geyByZXR1cm4gLWludGVyc2VjdC5ZKCkgfSwgZ3JhcGgyXSk7XG4gICAgICAgICAgICBib2FyZC5jcmVhdGUoJ2xpbmUnLCBbaW50ZXJzZWN0LCBwb2ludF0sXG4gICAgICAgICAgICAgICAgICAgIHtkYXNoOiAzLCBzdHJhaWdodEZpcnN0OiBmYWxzZSwgc3RyYWlnaHRMYXN0OiBmYWxzZSwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRoLCBsYXN0QXJyb3c6IHRydWV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMiwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgWygpID0+IHsgcmV0dXJuIGludGVyc2VjdC5YKCkgfSwgKCkgPT4geyByZXR1cm4gLWludGVyc2VjdC5ZKCkgfSwgZ3JhcGgxXSk7XG4gICAgICAgICAgICBib2FyZC5jcmVhdGUoJ2xpbmUnLCBbaW50ZXJzZWN0LCBwb2ludF0sXG4gICAgICAgICAgICAgICAgICAgIHtkYXNoOiAzLCBzdHJhaWdodEZpcnN0OiBmYWxzZSwgc3RyYWlnaHRMYXN0OiBmYWxzZSwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRoLCBsYXN0QXJyb3c6IHRydWV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMSwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9XG4gICAgXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgaGFzTW9yZVN0ZXBzOiBzdGVwcGVyLmhhc01vcmVTdGVwcyxcbiAgICBzdGVwOiBzdGVwcGVyLnN0ZXAsXG4gICAgc3RvcDogc3RlcHBlci5zdG9wXG59OyIsImNvbnN0IGNyZWF0ZVN0ZXBwZXIgPSByZXF1aXJlKCcuL3N0ZXBwZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNjYWxlciAoY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgY3R4KSB7XG4gICAgICAgIHZhciBpdGVyYXRpb247XG5cbiAgICAgICAgdmFyIHNjYWxlWDtcbiAgICAgICAgdmFyIHNjYWxlWTtcblxuICAgICAgICB2YXIgbWF4WCA9IDUsIG1heFkgPSAxMDAwMDA7XG5cbiAgICAgICAgdmFyIHRhcmdldE1heFg7XG4gICAgICAgIHZhciB0YXJnZXRNYXhZO1xuICAgICAgICB2YXIgeFN0ZXAsIHlTdGVwO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgICAgICBjdHguc2NhbGUoc2NhbGVYLCAtc2NhbGVZKTtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICAgICAgY2FsbGJhY2soY3R4LCBpdGVyYXRpb24sIG1heFgsIHNjYWxlWCwgc2NhbGVZKTtcblxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAgICAgY3R4LmxpbmVKb2luID0gJ3JvdW5kJztcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gem9vbVRvKG5ld01heFgsIG5ld01heFkpIHtcbiAgICAgICAgICAgIHRhcmdldE1heFggPSBuZXdNYXhYO1xuICAgICAgICAgICAgdGFyZ2V0TWF4WSA9IG5ld01heFk7XG5cbiAgICAgICAgICAgIHhTdGVwID0gKHRhcmdldE1heFggLSBtYXhYKSAvIDEwMDtcbiAgICAgICAgICAgIHlTdGVwID0gKHRhcmdldE1heFkgLSBtYXhZKSAvIDEwMDtcblxuICAgICAgICAgICAgem9vbVN0ZXAobWF4WCwgbWF4WSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZXQobmV3TWF4WCwgbmV3TWF4WSkge1xuICAgICAgICAgICAgbWF4WCA9IG5ld01heFg7XG4gICAgICAgICAgICBtYXhZID0gbmV3TWF4WTtcbiAgICAgICAgICAgIGl0ZXJhdGlvbiA9IG5ld01heFggLyAxMDAwO1xuXG4gICAgICAgICAgICBzY2FsZVggPSBjYW52YXNXaWR0aCAvIG5ld01heFg7XG4gICAgICAgICAgICBzY2FsZVkgPSBjYW52YXNIZWlnaHQgLyBuZXdNYXhZO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gem9vbVN0ZXAoKSB7XG4gICAgICAgICAgICB2YXIgeERpZmYgPSBNYXRoLmFicyh0YXJnZXRNYXhYIC0gbWF4WCk7XG4gICAgICAgICAgICB2YXIgeURpZmYgPSBNYXRoLmFicyh0YXJnZXRNYXhZIC0gbWF4WSk7XG5cbiAgICAgICAgICAgIGlmICh4RGlmZiA+IDAuMSB8fCB5RGlmZiA+IDAuMSkge1xuICAgICAgICAgICAgICAgIGlmICh4RGlmZiA+IDAuMSkge1xuICAgICAgICAgICAgICAgICAgICBtYXhYICs9IHhTdGVwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeURpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4WSArPSB5U3RlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0KG1heFgsIG1heFkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNldDogc2V0LFxuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIHpvb21Ubzogem9vbVRvLFxuICAgICAgICAgICAgem9vbVN0ZXA6IHpvb21TdGVwXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQXhlcyhjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBjdHgpIHtcbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgICAgICBjdHguc2NhbGUoMSwgLTEpO1xuXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKDAsIDApO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhjYW52YXNXaWR0aCwgMCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2FhYSc7XG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oMCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjYWFhJztcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRyYXc6IGRyYXdcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVxdWF0aW9uKHNjYWxlZCkge1xuICAgICAgICB2YXIgZXF1YXRpb25GdW5jdGlvbjtcblxuICAgICAgICBmdW5jdGlvbiBzZXQobmV3RXF1YXRpb25GdW5jdGlvbikge1xuICAgICAgICAgICAgZXF1YXRpb25GdW5jdGlvbiA9IG5ld0VxdWF0aW9uRnVuY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGUoeCkge1xuICAgICAgICAgICAgcmV0dXJuIGVxdWF0aW9uRnVuY3Rpb24oeCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgc2NhbGVkLmRyYXcoZnVuY3Rpb24gKGN0eCwgaXRlcmF0aW9uLCBtYXhYLCBzY2FsZVgsIHNjYWxlWSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwICsgaXRlcmF0aW9uOyB4IDw9IG1heFg7IHggKz0gaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmVkJztcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KHgsIGVxdWF0aW9uRnVuY3Rpb24oeCksIDIgLyBzY2FsZVgsIDIgLyBzY2FsZVkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNldDogc2V0LFxuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIGNhbGN1bGF0ZTogY2FsY3VsYXRlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVIaWdoTGlnaHQoc2NhbGVkLCBlcXVhdGlvbikge1xuICAgICAgICB2YXIgYW5pbWF0ZUhpZ2hsaWdodDtcbiAgICAgICAgdmFyIHNob3VsZERyYXdIaWdobGlnaHQ7XG4gICAgICAgIHZhciBjdXJyZW50SGlnaGxpZ2h0O1xuICAgICAgICB2YXIgaGlnaGxpZ2h0RW5kO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAgICAgYW5pbWF0ZUhpZ2hsaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgc2hvdWxkRHJhd0hpZ2hsaWdodCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoaGlnaGxpZ2h0U3RhcnQpIHtcbiAgICAgICAgICAgIHNob3VsZERyYXdIaWdobGlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgY3VycmVudEhpZ2hsaWdodCA9IGhpZ2hsaWdodFN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVRvKHRvKSB7XG4gICAgICAgICAgICBhbmltYXRlSGlnaGxpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGhpZ2hsaWdodEVuZCA9IHRvO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIGlmICghc2hvdWxkRHJhd0hpZ2hsaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NhbGVkLmRyYXcoZnVuY3Rpb24gKGN0eCwgaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRIaWdobGlnaHQgPiBoaWdobGlnaHRFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFuaW1hdGVIaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRIaWdobGlnaHQgLT0gaXRlcmF0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHggPSBlcXVhdGlvbi5jYWxjdWxhdGUoY3VycmVudEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhjdXJyZW50SGlnaGxpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKGN1cnJlbnRIaWdobGlnaHQsIHgpO1xuXG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCB4KTtcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKGN1cnJlbnRIaWdobGlnaHQsIHgpO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc2V0OiByZXNldCxcbiAgICAgICAgICAgIGFjdGl2YXRlOiBhY3RpdmF0ZSxcbiAgICAgICAgICAgIGFuaW1hdGVUbzogYW5pbWF0ZVRvLFxuICAgICAgICAgICAgZHJhdzogZHJhd1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN0ZXBzID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICB2YXIgaGlnaExpZ2h0LCBzY2FsZWQsIGVxdWF0aW9uO1xuICAgICAgICB2YXIgc3RlcHMgPSBbXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZXF1YXRpb24uc2V0KGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxNyt4ICUgOTc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVxdWF0aW9uLnNldChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTcqeDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZXF1YXRpb24uc2V0KGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxNyp4ICUgOTc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVxdWF0aW9uLnNldChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5wb3coMTcsIHgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBoaWdoTGlnaHQucmVzZXQoKTtcbiAgICAgICAgICAgICAgICBzY2FsZWQuem9vbVRvKDUsIDEwMDAwMCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGhpZ2hMaWdodC5hY3RpdmF0ZSg0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGlnaExpZ2h0LmFuaW1hdGVUbygzKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBoaWdoTGlnaHQucmVzZXQoKTtcbiAgICAgICAgICAgICAgICBzY2FsZWQuem9vbVRvKDEwMCwgMTAwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZXF1YXRpb24uc2V0KGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdygxNywgeCkgJSA5NztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGlnaExpZ2h0LmFjdGl2YXRlKDUwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGlnaExpZ2h0LmFuaW1hdGVUbygzMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGN1cnJlbnRTdGVwID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KG5ld0hpZ2hMaWdodCwgbmV3U2NhbGVkLCBuZXdFcXVhdGlvbikge1xuICAgICAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICBjdXJyZW50U3RlcCA9IDA7XG5cbiAgICAgICAgICAgIGhpZ2hMaWdodCA9IG5ld0hpZ2hMaWdodDtcbiAgICAgICAgICAgIHNjYWxlZCA9IG5ld1NjYWxlZDtcbiAgICAgICAgICAgIGVxdWF0aW9uID0gbmV3RXF1YXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFzTW9yZVN0ZXBzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgJiYgY3VycmVudFN0ZXAgPCBzdGVwcy5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzdGVwKCkge1xuICAgICAgICAgICAgc3RlcHNbY3VycmVudFN0ZXArK10oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGlzUnVubmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXQ6IGluaXQsXG4gICAgICAgICAgICBzdG9wOiBzdG9wLFxuICAgICAgICAgICAgaGFzTW9yZVN0ZXBzOiBoYXNNb3JlU3RlcHMsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGlzUnVubmluZyxcbiAgICAgICAgICAgIHN0ZXA6IHN0ZXBcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBmdW5jdGlvbiBpbml0KGNhbnZhcykge1xuICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdmFyIHNjYWxlZCA9IGNyZWF0ZVNjYWxlcihjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQsIGN0eCk7XG4gICAgICAgIHNjYWxlZC5zZXQoNTAwLCAxMDApO1xuICAgICAgICBzY2FsZWQuem9vbVRvKDUwMCwgMTAwKTtcblxuICAgICAgICB2YXIgZXF1YXRpb24gPSBjcmVhdGVFcXVhdGlvbihzY2FsZWQpO1xuICAgICAgICBlcXVhdGlvbi5zZXQoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE3ICsgeDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB2YXIgaGlnaExpZ2h0ID0gY3JlYXRlSGlnaExpZ2h0KHNjYWxlZCwgZXF1YXRpb24pO1xuICAgICAgICBoaWdoTGlnaHQucmVzZXQoKTtcblxuICAgICAgICBzdGVwcy5pbml0KGhpZ2hMaWdodCwgc2NhbGVkLCBlcXVhdGlvbik7XG5cbiAgICAgICAgdmFyIGF4ZXMgPSBjcmVhdGVBeGVzKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCwgY3R4KTtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgaWYgKCFzdGVwcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgYXhlcy5kcmF3KCk7XG4gICAgICAgICAgICBlcXVhdGlvbi5kcmF3KCk7XG4gICAgICAgICAgICBoaWdoTGlnaHQuZHJhdygpO1xuICAgICAgICAgICAgc2NhbGVkLnpvb21TdGVwKCk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQ6IGluaXQsXG4gICAgICAgIGhhc01vcmVTdGVwczogc3RlcHMuaGFzTW9yZVN0ZXBzLFxuICAgICAgICBzdGVwOiBzdGVwcy5zdGVwLFxuICAgICAgICBzdG9wOiBzdGVwcy5zdG9wXG4gICAgfTtcbn0pKCk7XG4gIFxuIiwiY29uc3Qgc3RlcHBlciA9IHJlcXVpcmUoJy4vc3RlcHBlci5qcycpKCk7XG5jb25zdCBzdHJva2V3aWR0aCA9IDM7XG5cbmZ1bmN0aW9uIGYoeCkge1xuICAgIHJldHVybiB4Kng7XG59XG5cbmZ1bmN0aW9uIGluaXQodGFyZ2V0KSB7XG4gICAgY29uc3QgYm9hcmQgPSBKWEcuSlNYR3JhcGguaW5pdEJvYXJkKHRhcmdldC5pZCwge1xuICAgICAgICBib3VuZGluZ2JveDogWy01LCA1LCA1LCAtNV0sXG4gICAgICAgIGF4aXM6IHRydWUsXG4gICAgICAgIHNob3dDb3B5cmlnaHQ6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBjb25zdCBncmFwaDEgPSBib2FyZC5jcmVhdGUoJ2Z1bmN0aW9uZ3JhcGgnLCBbZl0sIHtzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcblxuICAgIHN0ZXBwZXIudXNlKFtcbiAgICAgICAgKCkgPT4geyB9XG4gICAgXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgaGFzTW9yZVN0ZXBzOiBzdGVwcGVyLmhhc01vcmVTdGVwcyxcbiAgICBzdGVwOiBzdGVwcGVyLnN0ZXAsXG4gICAgc3RvcDogc3RlcHBlci5zdG9wXG59OyIsImNvbnN0IGNyZWF0ZVN0ZXBwZXIgPSByZXF1aXJlKCcuL3N0ZXBwZXIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAgKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBtYXhXaWR0aCA9IDUwMCxcbiAgICAgICAgICAgIG1heEhlaWdodCA9IDUwMDtcbiAgICB2YXIgYWN0b3JXaWR0aCA9IDEwMDtcblxuICAgIHZhciBoYWxmV2lkdGggPSBtYXhXaWR0aCAvIDI7XG4gICAgdmFyIGhhbGZIZWlnaHQgPSBtYXhIZWlnaHQgLyAyO1xuICAgIHZhciBoYWxmQWN0b3JXaWR0aCA9IGFjdG9yV2lkdGggLyAyO1xuXG4gICAgZnVuY3Rpb24gbWFrZUFjdGl2YXRhYmxlKHNvbWV0aGluZykge1xuICAgICAgICB2YXIgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHZhciBvcmlnaW5hbERyYXcgPSBzb21ldGhpbmcuZHJhdztcblxuICAgICAgICBzb21ldGhpbmcuZHJhdyA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKCEhb3JpZ2luYWxEcmF3ICYmIGFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsRHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc29tZXRoaW5nLmFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBzb21ldGhpbmcuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzb21ldGhpbmc7XG4gICAgfVxuXG4gICAgdmFyIGNyZWF0ZUltYWdlcyA9IGZ1bmN0aW9uIChvbkNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBpbWFnZXMgPSBbXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9zZWFuX2Nvbm5lcnkuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL20uanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2RyX25vLmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9jbGllbnQuanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2ViYXkucG5nJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2hhY2tlci5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvb3RwYm9va2xldC5qcGcnLFxuICAgICAgICBdO1xuICAgICAgICB2YXIgaW1hZ2VPYmplY3RzID0gW107XG5cbiAgICAgICAgdmFyIGxvYWRlZCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAgICAgbG9hZGVkKys7XG4gICAgICAgICAgICBpZiAobG9hZGVkID09PSBpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb25Db21wbGV0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGpiOiBpbWFnZU9iamVjdHNbMF0sXG4gICAgICAgICAgICAgICAgICAgIG06IGltYWdlT2JqZWN0c1sxXSxcbiAgICAgICAgICAgICAgICAgICAgbm86IGltYWdlT2JqZWN0c1syXSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50OiBpbWFnZU9iamVjdHNbM10sXG4gICAgICAgICAgICAgICAgICAgIHNob3A6IGltYWdlT2JqZWN0c1s0XSxcbiAgICAgICAgICAgICAgICAgICAgaGFja2VyOiBpbWFnZU9iamVjdHNbNV0sXG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rOiBpbWFnZU9iamVjdHNbNl0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG9uTG9hZCk7XG4gICAgICAgICAgICBpbWcuc3JjID0gaW1hZ2VzW2ldO1xuICAgICAgICAgICAgaW1hZ2VPYmplY3RzLnB1c2goaW1nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlQWN0b3IgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCBpbWFnZSwgYWx0ZXJuYXRlSW1hZ2UpIHtcbiAgICAgICAgdmFyIHdpZHRoID0gMTAwLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRJbWFnZSA9IGltYWdlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gY3VycmVudEltYWdlLmhlaWdodCAqICh3aWR0aCAvIGN1cnJlbnRJbWFnZS53aWR0aClcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoY3VycmVudEltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe1xuICAgICAgICAgICAgZHJhdzogZHJhdyxcbiAgICAgICAgICAgIHVzZUpCOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gYWx0ZXJuYXRlSW1hZ2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXNlTm9ybWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIHN0cikge1xuICAgICAgICB2YXIgdGFyZ2V0WCwgdGFyZ2V0WSwgeFN0ZXAsIHlTdGVwLFxuICAgICAgICAgICAgICAgIG1vdmVYLCBtb3ZlWSxcbiAgICAgICAgICAgICAgICB4T2Zmc2V0LCB5T2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdyhwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKG1vdmVYKHggKyB4T2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgIHhPZmZzZXQgKz0gcHJvZ3Jlc3MgKiB4U3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb3ZlWSh5ICsgeU9mZnNldCkpIHtcbiAgICAgICAgICAgICAgICB5T2Zmc2V0ICs9IHByb2dyZXNzICogeVN0ZXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0eC5mb250ID0gXCI0OHB4IHNlcmlmXCI7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQobWVzc2FnZSwgeCArIHhPZmZzZXQsIHkgKyB5T2Zmc2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNhbGNTdGVwKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FkanVzdGluZycsIHN0cik7XG4gICAgICAgICAgICB4U3RlcCA9ICh0YXJnZXRYIC0geCArIHhPZmZzZXQpIC8gbWF4V2lkdGg7XG4gICAgICAgICAgICBpZiAodGFyZ2V0WCA+IHggKyB4T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA8IHRhcmdldFg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA+IHRhcmdldFg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeVN0ZXAgPSAodGFyZ2V0WSAtIHkgKyB5T2Zmc2V0KSAvIG1heFdpZHRoO1xuICAgICAgICAgICAgaWYgKHRhcmdldFkgPiB5ICsgeU9mZnNldCkge1xuICAgICAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkgPCB0YXJnZXRZO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkgPiB0YXJnZXRZO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlVG9IYWxmKCkge1xuICAgICAgICAgICAgdGFyZ2V0WCA9IGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVUb0Z1bGwoKSB7XG4gICAgICAgICAgICB0YXJnZXRYID0gbWF4V2lkdGggLSBhY3RvcldpZHRoIC0gNDA7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZURvd24oKSB7XG4gICAgICAgICAgICB0YXJnZXRZID0gNDQwO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldFN0YXJ0KG5ld1gsIG5ld1kpIHtcbiAgICAgICAgICAgIHggPSBuZXdYIHx8IHg7XG4gICAgICAgICAgICB5ID0gbmV3WSB8fCB5O1xuICAgICAgICAgICAgdGFyZ2V0WCA9IG5ld1ggfHwgeDtcbiAgICAgICAgICAgIHRhcmdldFkgPSBuZXdZIHx8IHk7XG4gICAgICAgICAgICB4U3RlcCA9IDE7XG4gICAgICAgICAgICB5U3RlcCA9IDE7XG4gICAgICAgICAgICBtb3ZlWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeE9mZnNldCA9IDA7XG4gICAgICAgICAgICB5T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnNzYyNic7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0TWVzc2FnZShuZXdNZXNzYWdlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gbmV3TWVzc2FnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFN0YXJ0KCk7XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7XG4gICAgICAgICAgICBkcmF3OiBkcmF3LFxuICAgICAgICAgICAgbW92ZVRvSGFsZjogbW92ZVRvSGFsZixcbiAgICAgICAgICAgIG1vdmVUb0Z1bGw6IG1vdmVUb0Z1bGwsXG4gICAgICAgICAgICBtb3ZlRG93bjogbW92ZURvd24sXG4gICAgICAgICAgICBzZXRTdGFydDogc2V0U3RhcnQsXG4gICAgICAgICAgICBzZXRNZXNzYWdlOiBzZXRNZXNzYWdlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2wgPSBmdW5jdGlvbiAoY3R4LCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGFjdG9yV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2xEb3RzID0gZnVuY3Rpb24gKGN0eCwgeSkge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyhoYWxmV2lkdGgsIHksIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtkcmF3OiBkcmF3fSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVQcm90b2NvbExpc3RlbmVyID0gZnVuY3Rpb24gKGN0eCwgeSkge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhoYWxmV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIHkgKyAxMDApO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgc3RlcHMgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciBzdGVwcztcbiAgICAgICAgdmFyIGN1cnJlbnRTdGVwID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBpbml0KGNsaWVudCwgc2VydmVyLCBpbnRydWRlcixcbiAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLCBtZXNzYWdlQ29weSwgcHJvdG9jb2wsXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLCBwcm90b2NvbExpc3RlbmVyLFxuICAgICAgICAgICAgICAgICAgICAgIGNvZGVib29rMSwgY29kZWJvb2syKSB7XG4gICAgICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwID0gMDtcblxuICAgICAgICAgICAgc3RlcHMgPSBbXG4gICAgICAgICAgICAgICAgc2VydmVyLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgcHJvdG9jb2wuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9IYWxmLFxuICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5tb3ZlVG9GdWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRTdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LnVzZUpCKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci51c2VKQigpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLnVzZUpCKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cy5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazIuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKCc3NjI2ICsgNjA4MTEnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRNZXNzYWdlKDc2MjYgKyA2MDgxMSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LnNldE1lc3NhZ2UoNzYyNiArIDYwODExKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvSGFsZixcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvRnVsbCgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldFN0YXJ0KDIwMCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgoNzYyNiArIDYwODExKSArICctIDYwODExJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQobWF4V2lkdGggLSBhY3RvcldpZHRoIC0gNDApO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydCgxKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRTdGFydChtYXhXaWR0aCAtIGFjdG9yV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci51c2VOb3JtYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMi5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgnNzYyNiArIEtleScpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRNZXNzYWdlKCdLZXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhc01vcmVTdGVwcygpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICAgICAgc3RvcDogc3RvcCxcbiAgICAgICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgICAgICBzdGVwOiBzdGVwXG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgZnVuY3Rpb24gaW5pdChjYW52YXMpIHtcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNyZWF0ZUltYWdlcyhmdW5jdGlvbiAoaW1hZ2VzKSB7XG4gICAgICAgICAgICB2YXIgY2xpZW50ID0gY3JlYXRlQWN0b3IoY3R4LCAwLCAyMDAsIGltYWdlcy5jbGllbnQsIGltYWdlcy5qYik7XG4gICAgICAgICAgICBjbGllbnQuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBjcmVhdGVBY3RvcihjdHgsIG1heFdpZHRoIC0gYWN0b3JXaWR0aCwgMjAwLCBpbWFnZXMuc2hvcCwgaW1hZ2VzLm0pO1xuICAgICAgICAgICAgdmFyIGludHJ1ZGVyID0gY3JlYXRlQWN0b3IoY3R4LCBoYWxmV2lkdGggLSBoYWxmQWN0b3JXaWR0aCwgMzAwLCBpbWFnZXMuaGFja2VyLCBpbWFnZXMubm8pO1xuICAgICAgICAgICAgdmFyIGNvZGVib29rMSA9IGNyZWF0ZUFjdG9yKGN0eCwgMCwgNDAsIGltYWdlcy5jb2RlYm9vayk7XG4gICAgICAgICAgICB2YXIgY29kZWJvb2syID0gY3JlYXRlQWN0b3IoY3R4LCBtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIDQwLCBpbWFnZXMuY29kZWJvb2spO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBjcmVhdGVNZXNzYWdlKGN0eCwgMCwgMTgwLCAnb3JpZycpO1xuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZUNvcHkgPSBjcmVhdGVNZXNzYWdlKGN0eCwgaGFsZldpZHRoIC0gaGFsZkFjdG9yV2lkdGgsIDE4MCwgJ2NvcHknKTtcblxuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gY3JlYXRlUHJvdG9jb2woY3R4LCAxODUpO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sRG90cyA9IGNyZWF0ZVByb3RvY29sRG90cyhjdHgsIDE4NSk7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2xMaXN0ZW5lciA9IGNyZWF0ZVByb3RvY29sTGlzdGVuZXIoY3R4LCAxODUpO1xuXG4gICAgICAgICAgICBzdGVwcy5pbml0KGNsaWVudCwgc2VydmVyLCBpbnRydWRlciwgbWVzc2FnZSwgbWVzc2FnZUNvcHksIHByb3RvY29sLFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMsIHByb3RvY29sTGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMSwgY29kZWJvb2syKTtcblxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcblxuICAgICAgICAgICAgdmFyIGxhc3RUaW1lO1xuICAgICAgICAgICAgdmFyIHByb2dyZXNzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3KGN1cnJlbnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGVwcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFsYXN0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gKGN1cnJlbnRUaW1lIC0gbGFzdFRpbWUpO1xuICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBjbGllbnQuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGludHJ1ZGVyLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2wuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIHByb3RvY29sTGlzdGVuZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgY29kZWJvb2sxLmRyYXcocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgICAgIGNvZGVib29rMi5kcmF3KHByb2dyZXNzKTtcblxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgaGFzTW9yZVN0ZXBzOiBzdGVwcy5oYXNNb3JlU3RlcHMsXG4gICAgICAgIHN0ZXA6IHN0ZXBzLnN0ZXAsXG4gICAgICAgIHN0b3A6IHN0ZXBzLnN0b3BcbiAgICB9O1xufSkoKTtcbiAgXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVN0ZXBwZXIoKSB7XG4gICAgdmFyIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB2YXIgY3VycmVudFN0ZXAgPSAwO1xuICAgIHZhciBzdGVwcywgc3RvcFN0ZXA7XG5cbiAgICBmdW5jdGlvbiB1c2UodGhlc2VTdGVwcywgdXNlVGhpc1N0b3BTdGVwKSB7XG4gICAgICAgIHN0ZXBzID0gdGhlc2VTdGVwcztcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIHN0b3BTdGVwID0gdXNlVGhpc1N0b3BTdGVwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKCEhc3RvcFN0ZXApIHtcbiAgICAgICAgICAgIHN0b3BTdGVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNNb3JlU3RlcHMoKSB7XG4gICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXNlOiB1c2UsXG4gICAgICAgIHN0b3A6IHN0b3AsXG4gICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICBpc1J1bm5pbmc6IGlzUnVubmluZyxcbiAgICAgICAgc3RlcDogc3RlcFxuICAgIH1cbn07Il19
