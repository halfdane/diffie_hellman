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
    JXG.Options.text.useMathJax = true;
    target.style.height = "700px";
    target.style.width = "700px";
    var board = JXG.JSXGraph.initBoard(target.id, {
        boundingbox: [-5, 5, 5, -5],
        axis: true,
        showCopyright: false
    });

    board.create("text", [-4, 4, function () {
        return "\\[y^2 = x^3 + ax + b\\]";
    }], { fontSize: 24 });

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

function createEquationLabel(canvasWidth, canvasHeight, ctx) {
    var equationLabel = undefined;

    function set() {
        var newEquationLabel = arguments[0] === undefined ? "hey baby;" : arguments[0];

        equationLabel = newEquationLabel;
    }

    function draw() {
        ctx.save();

        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(equationLabel, canvasWidth / 2, canvasHeight / 2);
        //ctx.strokeText(equationLabel, canvasWidth / 2, canvasHeight / 2);

        ctx.restore();
    }

    return {
        draw: draw,
        set: set
    };
}

function createEquation(scaled, label) {
    var equationFunction = undefined;

    function set(newEquationFunction) {
        var newLabelString = arguments[1] === undefined ? "wut?" : arguments[1];

        equationFunction = newEquationFunction;
        label.set(newLabelString);
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
        label.draw();
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
    var label = createEquationLabel(canvas.width, canvas.height, ctx);
    var equation = createEquation(scaled, label);
    var highLight = createHighLight(scaled, equation);

    scaled.set(500, 100);
    scaled.zoomTo(500, 100);
    highLight.reset();
    equation.set(function (x) {
        return 17 + x;
    }, "f(x) = 17 + x");
    stepper.use([function () {
        return equation.set(function (x) {
            return 17 + x % 97;
        }, "f(x) = 17 + x mod 97");
    }, function () {
        return equation.set(function (x) {
            return 17 * x;
        }, "f(x) = 17 * x");
    }, function () {
        return equation.set(function (x) {
            return 17 * x % 97;
        }, "f(x) = 17 * x mod 97");
    }, function () {
        return equation.set(function (x) {
            return Math.pow(17, x);
        }, "f(x) = 17 ^ x");
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
        }, "f(x) = 17 ^ x mod 97");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvbWFpbi5qcyIsIi9ob21lL3RvbS9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9lbGxpcHRpYzIuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwuanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvaW50cm8uanMiLCIvaG9tZS90b20vcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvc3RlcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7QUFBYixNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzVCLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4QyxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNwRCxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FDSGhELFlBQVksQ0FBQzs7QUFBYixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztBQUMxQyxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7O0FBRXRCLElBQUksQ0FBQyxHQUFBLFNBQUEsQ0FBQztBQUNOLElBQUksQ0FBQyxHQUFBLFNBQUEsQ0FBQzs7QUFFTixTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDVixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMs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cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmRoID0gd2luZG93LmRoIHx8IHt9O1xud2luZG93LmRoLmludHJvID0gcmVxdWlyZSgnLi9pbnRyby5qcycpO1xud2luZG93LmRoLmV4cG9uZW50aWFsID0gcmVxdWlyZSgnLi9leHBvbmVudGlhbC5qcycpO1xud2luZG93LmRoLmVsbGlwdGljMiA9IHJlcXVpcmUoJy4vZWxsaXB0aWMyLmpzJyk7XG5cblxuIiwiY29uc3Qgc3RlcHBlciA9IHJlcXVpcmUoJy4vc3RlcHBlci5qcycpKCk7XG5jb25zdCBzdHJva2V3aWR0aCA9IDM7XG5cbmxldCBhO1xubGV0IGI7XG5cbmZ1bmN0aW9uIGYoeCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKiB4ICsgYS5WYWx1ZSgpICogeCArIGIuVmFsdWUoKSk7XG59XG5cbmZ1bmN0aW9uIGludmVyc2VGKHgpIHtcbiAgICByZXR1cm4gLWYoeCk7XG59XG5cbmZ1bmN0aW9uIGluaXQodGFyZ2V0KSB7XG4gICAgSlhHLk9wdGlvbnMudGV4dC51c2VNYXRoSmF4ID0gdHJ1ZTtcbiAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0PVwiNzAwcHhcIjtcbiAgICB0YXJnZXQuc3R5bGUud2lkdGg9XCI3MDBweFwiO1xuICAgIGNvbnN0IGJvYXJkID0gSlhHLkpTWEdyYXBoLmluaXRCb2FyZCh0YXJnZXQuaWQsIHtcbiAgICAgICAgYm91bmRpbmdib3g6IFstNSwgNSwgNSwgLTVdLFxuICAgICAgICBheGlzOiB0cnVlLFxuICAgICAgICBzaG93Q29weXJpZ2h0OiBmYWxzZVxuICAgIH0pO1xuXG4gICAgYm9hcmQuY3JlYXRlKCd0ZXh0JywgWy00LCA0LFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ1xcXFxbeV4yID0geF4zICsgYXggKyBiXFxcXF0nO1xuICAgICAgICB9XSwge2ZvbnRTaXplOiAyNH0pO1xuXG4gICAgYSA9IGJvYXJkLmNyZWF0ZSgnc2xpZGVyJywgW1swLCAtM10sIFs0LCAtM10sIFstNSwgLTMsIDVdXSk7XG4gICAgYiA9IGJvYXJkLmNyZWF0ZSgnc2xpZGVyJywgW1swLCAtNF0sIFs0LCAtNF0sIFstNSwgMywgNV1dKTtcblxuICAgIGNvbnN0IGdyYXBoMSA9IGJvYXJkLmNyZWF0ZSgnZnVuY3Rpb25ncmFwaCcsIFtmXSwge3N0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgIGNvbnN0IGdyYXBoMiA9IGJvYXJkLmNyZWF0ZSgnZnVuY3Rpb25ncmFwaCcsIFtpbnZlcnNlRl0sIHtzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcblxuICAgIGxldCBvcmlnaW5hbFBvaW50LCBwb2ludCxcbiAgICAgICAgICAgIHRhbmdlbnQsXG4gICAgICAgICAgICBpbnRlcnNlY3Q7XG5cbiAgICBzdGVwcGVyLnVzZShbXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIG9yaWdpbmFsUG9pbnQgPSBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgW2dyYXBoMV0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB0YW5nZW50ID0gYm9hcmQuY3JlYXRlKCd0YW5nZW50JywgW3BvaW50XSwge3N0cm9rZUNvbG9yOiAnI2ZmMDAwMCcsIGRhc2g6IDIsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMl0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IC0xLjI2O1xuICAgICAgICAgICAgb3JpZ2luYWxQb2ludC5tb3ZlVG8oW3RhcmdldCwgZih0YXJnZXQpXSwgMjAwMCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMl0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDIsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgcG9pbnQgPSBib2FyZC5jcmVhdGUoJ2dsaWRlcicsIFsoKSA9PiB7IHJldHVybiBpbnRlcnNlY3QuWCgpIH0sICgpID0+IHsgcmV0dXJuIC1pbnRlcnNlY3QuWSgpIH0sIGdyYXBoMV0pO1xuICAgICAgICAgICAgYm9hcmQuY3JlYXRlKCdsaW5lJywgW2ludGVyc2VjdCwgcG9pbnRdLFxuICAgICAgICAgICAgICAgICAgICB7ZGFzaDogMywgc3RyYWlnaHRGaXJzdDogZmFsc2UsIHN0cmFpZ2h0TGFzdDogZmFsc2UsIHN0cm9rZVdpZHRoOiBzdHJva2V3aWR0aCwgbGFzdEFycm93OiB0cnVlfSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgICAgICBpbnRlcnNlY3QgPSBib2FyZC5jcmVhdGUoJ2ludGVyc2VjdGlvbicsIFtncmFwaDEsIHRhbmdlbnQsIDBdKTtcbiAgICAgICAgfVxuICAgIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGhhc01vcmVTdGVwczogc3RlcHBlci5oYXNNb3JlU3RlcHMsXG4gICAgc3RlcDogc3RlcHBlci5zdGVwLFxuICAgIHN0b3A6IHN0ZXBwZXIuc3RvcFxufTsiLCJjb25zdCBzdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJykoKTtcblxuZnVuY3Rpb24gY3JlYXRlU2NhbGVyKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIGN0eCkge1xuICAgIGxldCBpdGVyYXRpb247XG5cbiAgICBsZXQgc2NhbGVYLCBzY2FsZVk7XG4gICAgbGV0IHRhcmdldE1heFgsIHRhcmdldE1heFk7XG4gICAgbGV0IHhTdGVwLCB5U3RlcDtcbiAgICBsZXQgbWF4WCA9IDUsIG1heFkgPSAxMDAwMDA7XG5cbiAgICBmdW5jdGlvbiBkcmF3KGNhbGxiYWNrKSB7XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoMCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgICAgY3R4LnNjYWxlKHNjYWxlWCwgLXNjYWxlWSk7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICBjYWxsYmFjayhjdHgsIGl0ZXJhdGlvbiwgbWF4WCwgc2NhbGVYLCBzY2FsZVkpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgY3R4LmxpbmVKb2luID0gJ3JvdW5kJztcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB6b29tVG8obmV3TWF4WCwgbmV3TWF4WSkge1xuICAgICAgICB0YXJnZXRNYXhYID0gbmV3TWF4WDtcbiAgICAgICAgdGFyZ2V0TWF4WSA9IG5ld01heFk7XG5cbiAgICAgICAgeFN0ZXAgPSAodGFyZ2V0TWF4WCAtIG1heFgpIC8gMTAwO1xuICAgICAgICB5U3RlcCA9ICh0YXJnZXRNYXhZIC0gbWF4WSkgLyAxMDA7XG5cbiAgICAgICAgem9vbVN0ZXAobWF4WCwgbWF4WSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0KG5ld01heFgsIG5ld01heFkpIHtcbiAgICAgICAgbWF4WCA9IG5ld01heFg7XG4gICAgICAgIG1heFkgPSBuZXdNYXhZO1xuICAgICAgICBpdGVyYXRpb24gPSBuZXdNYXhYIC8gMTAwMDtcblxuICAgICAgICBzY2FsZVggPSBjYW52YXNXaWR0aCAvIG5ld01heFg7XG4gICAgICAgIHNjYWxlWSA9IGNhbnZhc0hlaWdodCAvIG5ld01heFk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gem9vbVN0ZXAoKSB7XG4gICAgICAgIGNvbnN0IHhEaWZmID0gTWF0aC5hYnModGFyZ2V0TWF4WCAtIG1heFgpO1xuICAgICAgICBjb25zdCB5RGlmZiA9IE1hdGguYWJzKHRhcmdldE1heFkgLSBtYXhZKTtcblxuICAgICAgICBpZiAoeERpZmYgPiAwLjEgfHwgeURpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgIGlmICh4RGlmZiA+IDAuMSkge1xuICAgICAgICAgICAgICAgIG1heFggKz0geFN0ZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeURpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICBtYXhZICs9IHlTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0KG1heFgsIG1heFkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2V0LFxuICAgICAgICBkcmF3LFxuICAgICAgICB6b29tVG8sXG4gICAgICAgIHpvb21TdGVwXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQXhlcyhjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBjdHgpIHtcbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgIGN0eC5zY2FsZSgxLCAtMSk7XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKDAsIDApO1xuICAgICAgICBjdHgubGluZVRvKGNhbnZhc1dpZHRoLCAwKTtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNhYWEnO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgICAgY3R4LmxpbmVUbygwLCBjYW52YXNIZWlnaHQpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2FhYSc7XG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkcmF3XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFcXVhdGlvbkxhYmVsKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIGN0eCkge1xuICAgIGxldCBlcXVhdGlvbkxhYmVsO1xuXG4gICAgZnVuY3Rpb24gc2V0KG5ld0VxdWF0aW9uTGFiZWwgPSAnaGV5IGJhYnk7Jykge1xuICAgICAgICBlcXVhdGlvbkxhYmVsID0gbmV3RXF1YXRpb25MYWJlbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBjdHguc2F2ZSgpO1xuXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguZm9udCA9ICc2MHB4IEFyaWFsJztcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgIGN0eC5maWxsVGV4dChlcXVhdGlvbkxhYmVsLCBjYW52YXNXaWR0aCAvIDIsIGNhbnZhc0hlaWdodCAvIDIpO1xuICAgICAgICAvL2N0eC5zdHJva2VUZXh0KGVxdWF0aW9uTGFiZWwsIGNhbnZhc1dpZHRoIC8gMiwgY2FudmFzSGVpZ2h0IC8gMik7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkcmF3LFxuICAgICAgICBzZXRcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVxdWF0aW9uKHNjYWxlZCwgbGFiZWwpIHtcbiAgICBsZXQgZXF1YXRpb25GdW5jdGlvbjtcblxuICAgIGZ1bmN0aW9uIHNldChuZXdFcXVhdGlvbkZ1bmN0aW9uLCBuZXdMYWJlbFN0cmluZyA9ICd3dXQ/Jykge1xuICAgICAgICBlcXVhdGlvbkZ1bmN0aW9uID0gbmV3RXF1YXRpb25GdW5jdGlvbjtcbiAgICAgICAgbGFiZWwuc2V0KG5ld0xhYmVsU3RyaW5nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxjdWxhdGUoeCkge1xuICAgICAgICByZXR1cm4gZXF1YXRpb25GdW5jdGlvbih4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBzY2FsZWQuZHJhdyhmdW5jdGlvbiAoY3R4LCBpdGVyYXRpb24sIG1heFgsIHNjYWxlWCwgc2NhbGVZKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMCArIGl0ZXJhdGlvbjsgeCA8PSBtYXhYOyB4ICs9IGl0ZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSc7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KHgsIGVxdWF0aW9uRnVuY3Rpb24oeCksIDQgLyBzY2FsZVgsIDQgLyBzY2FsZVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbGFiZWwuZHJhdygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHNldCxcbiAgICAgICAgZHJhdyxcbiAgICAgICAgY2FsY3VsYXRlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVIaWdoTGlnaHQoc2NhbGVkLCBlcXVhdGlvbikge1xuICAgIGxldCBhbmltYXRlSGlnaGxpZ2h0O1xuICAgIGxldCBzaG91bGREcmF3SGlnaGxpZ2h0O1xuICAgIGxldCBjdXJyZW50SGlnaGxpZ2h0O1xuICAgIGxldCBoaWdobGlnaHRFbmQ7XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgYW5pbWF0ZUhpZ2hsaWdodCA9IGZhbHNlO1xuICAgICAgICBzaG91bGREcmF3SGlnaGxpZ2h0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWN0aXZhdGUoaGlnaGxpZ2h0U3RhcnQpIHtcbiAgICAgICAgc2hvdWxkRHJhd0hpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgIGN1cnJlbnRIaWdobGlnaHQgPSBoaWdobGlnaHRTdGFydDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhbmltYXRlVG8odG8pIHtcbiAgICAgICAgYW5pbWF0ZUhpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgIGhpZ2hsaWdodEVuZCA9IHRvO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIGlmICghc2hvdWxkRHJhd0hpZ2hsaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGVkLmRyYXcoZnVuY3Rpb24gKGN0eCwgaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudEhpZ2hsaWdodCA+IGhpZ2hsaWdodEVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRlSGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRIaWdobGlnaHQgLT0gaXRlcmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgeCA9IGVxdWF0aW9uLmNhbGN1bGF0ZShjdXJyZW50SGlnaGxpZ2h0KTtcblxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhjdXJyZW50SGlnaGxpZ2h0LCAwKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oY3VycmVudEhpZ2hsaWdodCwgeCk7XG5cbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oMCwgeCk7XG4gICAgICAgICAgICBjdHgubGluZVRvKGN1cnJlbnRIaWdobGlnaHQsIHgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXNldCxcbiAgICAgICAgYWN0aXZhdGUsXG4gICAgICAgIGFuaW1hdGVUbyxcbiAgICAgICAgZHJhd1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5pdChjYW52YXMpIHtcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCBzY2FsZWQgPSBjcmVhdGVTY2FsZXIoY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBjdHgpO1xuICAgIGNvbnN0IGxhYmVsID0gY3JlYXRlRXF1YXRpb25MYWJlbChjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQsIGN0eCk7XG4gICAgY29uc3QgZXF1YXRpb24gPSBjcmVhdGVFcXVhdGlvbihzY2FsZWQsIGxhYmVsKTtcbiAgICBjb25zdCBoaWdoTGlnaHQgPSBjcmVhdGVIaWdoTGlnaHQoc2NhbGVkLCBlcXVhdGlvbik7XG5cbiAgICBzY2FsZWQuc2V0KDUwMCwgMTAwKTtcbiAgICBzY2FsZWQuem9vbVRvKDUwMCwgMTAwKTtcbiAgICBoaWdoTGlnaHQucmVzZXQoKTtcbiAgICBlcXVhdGlvbi5zZXQoeCA9PiAxNyArIHgsICdmKHgpID0gMTcgKyB4Jyk7XG4gICAgc3RlcHBlci51c2UoW1xuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiAxNyArIHggJSA5NywgJ2YoeCkgPSAxNyArIHggbW9kIDk3JyksXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IDE3ICogeCwgJ2YoeCkgPSAxNyAqIHgnKSxcbiAgICAgICAgKCkgPT4gZXF1YXRpb24uc2V0KHggPT4gMTcgKiB4ICUgOTcsICdmKHgpID0gMTcgKiB4IG1vZCA5NycpLFxuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiBNYXRoLnBvdygxNywgeCksICdmKHgpID0gMTcgXiB4JyksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGhpZ2hMaWdodC5yZXNldCgpO1xuICAgICAgICAgICAgc2NhbGVkLnpvb21Ubyg1LCAxMDAwMDApO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiBoaWdoTGlnaHQuYWN0aXZhdGUoNCksXG4gICAgICAgICgpID0+IGhpZ2hMaWdodC5hbmltYXRlVG8oMyksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGhpZ2hMaWdodC5yZXNldCgpO1xuICAgICAgICAgICAgc2NhbGVkLnpvb21UbygxMDAsIDEwMCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IE1hdGgucG93KDE3LCB4KSAlIDk3LCAnZih4KSA9IDE3IF4geCBtb2QgOTcnKSxcbiAgICAgICAgKCkgPT4gaGlnaExpZ2h0LmFjdGl2YXRlKDUwKSxcbiAgICAgICAgKCkgPT4gaGlnaExpZ2h0LmFuaW1hdGVUbygzMClcbiAgICBdKTtcblxuICAgIGNvbnN0IGF4ZXMgPSBjcmVhdGVBeGVzKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCwgY3R4KTtcblxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIGlmICghc3RlcHBlci5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBheGVzLmRyYXcoKTtcbiAgICAgICAgZXF1YXRpb24uZHJhdygpO1xuICAgICAgICBoaWdoTGlnaHQuZHJhdygpO1xuICAgICAgICBzY2FsZWQuem9vbVN0ZXAoKTtcblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICAgIH1cblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgaGFzTW9yZVN0ZXBzOiBzdGVwcGVyLmhhc01vcmVTdGVwcyxcbiAgICBzdGVwOiBzdGVwcGVyLnN0ZXAsXG4gICAgc3RvcDogc3RlcHBlci5zdG9wXG59OyIsImNvbnN0IGNyZWF0ZVN0ZXBwZXIgPSByZXF1aXJlKCcuL3N0ZXBwZXIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAgKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBhY3RvcldpZHRoO1xuICAgIHZhciBoYWxmV2lkdGgsIGhhbGZIZWlnaHQsIGhhbGZBY3RvcldpZHRoO1xuXG4gICAgdmFyIGFjdG9yWSwgaW50cnVkZXJZLCBtZXNzYWdlWTtcblxuICAgIGZ1bmN0aW9uIHNldFNpemVzKGNhbnZhcykge1xuICAgICAgICBtYXhXaWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICAgICAgbWF4SGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgICAgYWN0b3JXaWR0aCA9IDEwMDtcblxuICAgICAgICBoYWxmV2lkdGggPSBtYXhXaWR0aCAvIDI7XG4gICAgICAgIGhhbGZIZWlnaHQgPSBtYXhIZWlnaHQgLyAyO1xuICAgICAgICBoYWxmQWN0b3JXaWR0aCA9IGFjdG9yV2lkdGggLyAyO1xuXG4gICAgICAgIGFjdG9yWSA9IGhhbGZIZWlnaHQtYWN0b3JXaWR0aDtcbiAgICAgICAgaW50cnVkZXJZID0gbWF4SGVpZ2h0LTIqYWN0b3JXaWR0aDtcbiAgICAgICAgbWVzc2FnZVkgPSBhY3RvclktNTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlQWN0aXZhdGFibGUoc29tZXRoaW5nKSB7XG4gICAgICAgIHZhciBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdmFyIG9yaWdpbmFsRHJhdyA9IHNvbWV0aGluZy5kcmF3O1xuXG4gICAgICAgIHNvbWV0aGluZy5kcmF3ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAoISFvcmlnaW5hbERyYXcgJiYgYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxEcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzb21ldGhpbmcuYWN0aXZhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhY3RpdmUgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNvbWV0aGluZy5kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHNvbWV0aGluZztcbiAgICB9XG5cbiAgICB2YXIgY3JlYXRlSW1hZ2VzID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcbiAgICAgICAgdmFyIGltYWdlcyA9IFtcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL3NlYW5fY29ubmVyeS5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvbS5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvZHJfbm8uanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2NsaWVudC5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvZWJheS5wbmcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvaGFja2VyLmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9vdHBib29rbGV0LmpwZycsXG4gICAgICAgIF07XG4gICAgICAgIHZhciBpbWFnZU9iamVjdHMgPSBbXTtcblxuICAgICAgICB2YXIgbG9hZGVkID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgICAgICBsb2FkZWQrKztcbiAgICAgICAgICAgIGlmIChsb2FkZWQgPT09IGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKHtcbiAgICAgICAgICAgICAgICAgICAgamI6IGltYWdlT2JqZWN0c1swXSxcbiAgICAgICAgICAgICAgICAgICAgbTogaW1hZ2VPYmplY3RzWzFdLFxuICAgICAgICAgICAgICAgICAgICBubzogaW1hZ2VPYmplY3RzWzJdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnQ6IGltYWdlT2JqZWN0c1szXSxcbiAgICAgICAgICAgICAgICAgICAgc2hvcDogaW1hZ2VPYmplY3RzWzRdLFxuICAgICAgICAgICAgICAgICAgICBoYWNrZXI6IGltYWdlT2JqZWN0c1s1XSxcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2s6IGltYWdlT2JqZWN0c1s2XSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBpbWFnZXNbaV07XG4gICAgICAgICAgICBpbWFnZU9iamVjdHMucHVzaChpbWcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVBY3RvciA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIGltYWdlLCBhbHRlcm5hdGVJbWFnZSkge1xuICAgICAgICB2YXIgd2lkdGggPSAxMDAsXG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gaW1hZ2U7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBjdXJyZW50SW1hZ2UuaGVpZ2h0ICogKHdpZHRoIC8gY3VycmVudEltYWdlLndpZHRoKVxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShjdXJyZW50SW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7XG4gICAgICAgICAgICBkcmF3OiBkcmF3LFxuICAgICAgICAgICAgdXNlSkI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SW1hZ2UgPSBhbHRlcm5hdGVJbWFnZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1c2VOb3JtYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVNZXNzYWdlID0gZnVuY3Rpb24gKGN0eCwgeCwgeSwgc3RyKSB7XG4gICAgICAgIHZhciB0YXJnZXRYLCB0YXJnZXRZLCB4U3RlcCwgeVN0ZXAsXG4gICAgICAgICAgICAgICAgbW92ZVgsIG1vdmVZLFxuICAgICAgICAgICAgICAgIHhPZmZzZXQsIHlPZmZzZXQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3KHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAobW92ZVgoeCArIHhPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgeE9mZnNldCArPSBwcm9ncmVzcyAqIHhTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1vdmVZKHkgKyB5T2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgIHlPZmZzZXQgKz0gcHJvZ3Jlc3MgKiB5U3RlcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjQ4cHggc2VyaWZcIjtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChtZXNzYWdlLCB4ICsgeE9mZnNldCwgeSArIHlPZmZzZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2FsY1N0ZXAoKSB7XG4gICAgICAgICAgICB4U3RlcCA9ICh0YXJnZXRYIC0geCArIHhPZmZzZXQpIC8gbWF4V2lkdGg7XG4gICAgICAgICAgICBpZiAodGFyZ2V0WCA+IHggKyB4T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA8IHRhcmdldFg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA+IHRhcmdldFg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeVN0ZXAgPSAodGFyZ2V0WSAtIHkgKyB5T2Zmc2V0KSAvIG1heFdpZHRoO1xuICAgICAgICAgICAgaWYgKHRhcmdldFkgPiB5ICsgeU9mZnNldCkge1xuICAgICAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkgPCB0YXJnZXRZO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkgPiB0YXJnZXRZO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlVG9IYWxmKCkge1xuICAgICAgICAgICAgdGFyZ2V0WCA9IGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVUb0Z1bGwoKSB7XG4gICAgICAgICAgICB0YXJnZXRYID0gbWF4V2lkdGggLSBhY3RvcldpZHRoIC0gNDA7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZURvd24oKSB7XG4gICAgICAgICAgICB0YXJnZXRZID0gaW50cnVkZXJZLTIwO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldFN0YXJ0KG5ld1gsIG5ld1kpIHtcbiAgICAgICAgICAgIHggPSBuZXdYIHx8IHg7XG4gICAgICAgICAgICB5ID0gbmV3WSB8fCB5O1xuICAgICAgICAgICAgdGFyZ2V0WCA9IG5ld1ggfHwgeDtcbiAgICAgICAgICAgIHRhcmdldFkgPSBuZXdZIHx8IHk7XG4gICAgICAgICAgICB4U3RlcCA9IDE7XG4gICAgICAgICAgICB5U3RlcCA9IDE7XG4gICAgICAgICAgICBtb3ZlWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeE9mZnNldCA9IDA7XG4gICAgICAgICAgICB5T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnNzYyNic7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0TWVzc2FnZShuZXdNZXNzYWdlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gbmV3TWVzc2FnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFN0YXJ0KCk7XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7XG4gICAgICAgICAgICBkcmF3OiBkcmF3LFxuICAgICAgICAgICAgbW92ZVRvSGFsZjogbW92ZVRvSGFsZixcbiAgICAgICAgICAgIG1vdmVUb0Z1bGw6IG1vdmVUb0Z1bGwsXG4gICAgICAgICAgICBtb3ZlRG93bjogbW92ZURvd24sXG4gICAgICAgICAgICBzZXRTdGFydDogc2V0U3RhcnQsXG4gICAgICAgICAgICBzZXRNZXNzYWdlOiBzZXRNZXNzYWdlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2wgPSBmdW5jdGlvbiAoY3R4LCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGFjdG9yV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2xEb3RzID0gZnVuY3Rpb24gKGN0eCwgeSkge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyhoYWxmV2lkdGgsIHksIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtkcmF3OiBkcmF3fSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVQcm90b2NvbExpc3RlbmVyID0gZnVuY3Rpb24gKGN0eCwgeTEsIHkyKSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGhhbGZXaWR0aCwgeTEpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIHkyKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe2RyYXc6IGRyYXd9KTtcbiAgICB9O1xuXG4gICAgdmFyIHN0ZXBzID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICB2YXIgc3RlcHM7XG4gICAgICAgIHZhciBjdXJyZW50U3RlcCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdChjbGllbnQsIHNlcnZlciwgaW50cnVkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSwgbWVzc2FnZUNvcHksIHByb3RvY29sLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cywgcHJvdG9jb2xMaXN0ZW5lcixcbiAgICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEsIGNvZGVib29rMikge1xuICAgICAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICBjdXJyZW50U3RlcCA9IDA7XG5cbiAgICAgICAgICAgIHN0ZXBzID0gW1xuICAgICAgICAgICAgICAgIHNlcnZlci5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIHByb3RvY29sLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvSGFsZixcbiAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvRnVsbCgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0U3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudC51c2VKQigpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIudXNlSkIoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci51c2VKQigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2syLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgnNzYyNiArIDYwODExJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSg3NjI2ICsgNjA4MTEpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRNZXNzYWdlKDc2MjYgKyA2MDgxMSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0hhbGYsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0Z1bGwoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydChtYXhXaWR0aCAtIDMqYWN0b3JXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgoNzYyNiArIDYwODExKSArICctIDYwODExJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQobWF4V2lkdGggLSBhY3RvcldpZHRoIC0gNDApO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydCgxKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRTdGFydChtYXhXaWR0aCAtIGFjdG9yV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci51c2VOb3JtYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMi5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgnNzYyNiArIEtleScpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRNZXNzYWdlKCdLZXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhc01vcmVTdGVwcygpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICAgICAgc3RvcDogc3RvcCxcbiAgICAgICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgICAgICBzdGVwOiBzdGVwXG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgZnVuY3Rpb24gaW5pdChjYW52YXMpIHtcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHNldFNpemVzKGNhbnZhcyk7XG5cbiAgICAgICAgY3JlYXRlSW1hZ2VzKGZ1bmN0aW9uIChpbWFnZXMpIHtcbiAgICAgICAgICAgIHZhciBjbGllbnQgPSBjcmVhdGVBY3RvcihjdHgsIDAsIGFjdG9yWSwgaW1hZ2VzLmNsaWVudCwgaW1hZ2VzLmpiKTtcbiAgICAgICAgICAgIGNsaWVudC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgdmFyIHNlcnZlciA9IGNyZWF0ZUFjdG9yKGN0eCwgbWF4V2lkdGggLSBhY3RvcldpZHRoLCBhY3RvclksIGltYWdlcy5zaG9wLCBpbWFnZXMubSk7XG4gICAgICAgICAgICB2YXIgaW50cnVkZXIgPSBjcmVhdGVBY3RvcihjdHgsIGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoLCBpbnRydWRlclksIGltYWdlcy5oYWNrZXIsIGltYWdlcy5ubyk7XG4gICAgICAgICAgICB2YXIgY29kZWJvb2sxID0gY3JlYXRlQWN0b3IoY3R4LCAwLCA0MCwgaW1hZ2VzLmNvZGVib29rKTtcbiAgICAgICAgICAgIHZhciBjb2RlYm9vazIgPSBjcmVhdGVBY3RvcihjdHgsIG1heFdpZHRoIC0gYWN0b3JXaWR0aCwgNDAsIGltYWdlcy5jb2RlYm9vayk7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGNyZWF0ZU1lc3NhZ2UoY3R4LCAwLCBtZXNzYWdlWSwgJ29yaWcnKTtcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VDb3B5ID0gY3JlYXRlTWVzc2FnZShjdHgsIGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoLCBtZXNzYWdlWSwgJ2NvcHknKTtcblxuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gY3JlYXRlUHJvdG9jb2woY3R4LCBhY3RvclkpO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sRG90cyA9IGNyZWF0ZVByb3RvY29sRG90cyhjdHgsIGFjdG9yWSk7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2xMaXN0ZW5lciA9IGNyZWF0ZVByb3RvY29sTGlzdGVuZXIoY3R4LCBhY3RvclksIGludHJ1ZGVyWSk7XG5cbiAgICAgICAgICAgIHN0ZXBzLmluaXQoY2xpZW50LCBzZXJ2ZXIsIGludHJ1ZGVyLCBtZXNzYWdlLCBtZXNzYWdlQ29weSwgcHJvdG9jb2wsXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cywgcHJvdG9jb2xMaXN0ZW5lcixcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLCBjb2RlYm9vazIpO1xuXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuXG4gICAgICAgICAgICB2YXIgbGFzdFRpbWU7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3M7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXcoY3VycmVudFRpbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXN0ZXBzLmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWxhc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSAoY3VycmVudFRpbWUgLSBsYXN0VGltZSk7XG4gICAgICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcblxuICAgICAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIGNsaWVudC5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgaW50cnVkZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBwcm90b2NvbC5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBjb2RlYm9vazEuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgY29kZWJvb2syLmRyYXcocHJvZ3Jlc3MpO1xuXG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICBoYXNNb3JlU3RlcHM6IHN0ZXBzLmhhc01vcmVTdGVwcyxcbiAgICAgICAgc3RlcDogc3RlcHMuc3RlcCxcbiAgICAgICAgc3RvcDogc3RlcHMuc3RvcFxuICAgIH07XG59KSgpO1xuICBcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlU3RlcHBlcigpIHtcbiAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgIHZhciBjdXJyZW50U3RlcCA9IDA7XG4gICAgdmFyIHN0ZXBzLCBzdG9wU3RlcDtcblxuICAgIGZ1bmN0aW9uIHVzZSh0aGVzZVN0ZXBzLCB1c2VUaGlzU3RvcFN0ZXApIHtcbiAgICAgICAgc3RlcHMgPSB0aGVzZVN0ZXBzO1xuICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgc3RvcFN0ZXAgPSB1c2VUaGlzU3RvcFN0ZXA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoISFzdG9wU3RlcCkge1xuICAgICAgICAgICAgc3RvcFN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc01vcmVTdGVwcygpIHtcbiAgICAgICAgcmV0dXJuIHJ1bm5pbmcgJiYgY3VycmVudFN0ZXAgPCBzdGVwcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgc3RlcHNbY3VycmVudFN0ZXArK10oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHVzZTogdXNlLFxuICAgICAgICBzdG9wOiBzdG9wLFxuICAgICAgICBoYXNNb3JlU3RlcHM6IGhhc01vcmVTdGVwcyxcbiAgICAgICAgaXNSdW5uaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgIHN0ZXA6IHN0ZXBcbiAgICB9XG59OyJdfQ==
