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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS92b2xsZXJ0aC9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9tYWluLmpzIiwiL2hvbWUvdm9sbGVydGgvcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZWxsaXB0aWMyLmpzIiwiL2hvbWUvdm9sbGVydGgvcHJpdmF0ZS9kaWZmaWVfaGVsbG1hbi9zcmMvanMvZXhwb25lbnRpYWwuanMiLCIvaG9tZS92b2xsZXJ0aC9wcml2YXRlL2RpZmZpZV9oZWxsbWFuL3NyYy9qcy9pbnRyby5qcyIsIi9ob21lL3ZvbGxlcnRoL3ByaXZhdGUvZGlmZmllX2hlbGxtYW4vc3JjL2pzL3N0ZXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7O0FBQWIsTUFBTSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7OztBQ0hoRCxZQUFZLENBQUM7O0FBQWIsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7QUFDMUMsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDOztBQUV0QixJQUFJLENBQUMsR0FBQSxTQUFBLENBQUM7QUFDTixJQUFJLENBQUMsR0FBQSxTQUFBLENBQUM7O0FBRU4sU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ1YsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMs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Q0FBQztBQUNmLGdCQUFRLEdBQUcsZUFBZSxDQUFDO0tBQzlCOztBQUVELGFBQVMsSUFBSSxHQUFHO0FBQ1osZUFBTyxHQUFHLEtBQUssQ0FBQztBQUNoQixZQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDWixvQkFBUSxFQUFFLENBQUM7U0FDZDtLQUNKOztBQUVELGFBQVMsWUFBWSxHQUFHO0FBQ3BCLGVBQU8sT0FBTyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQ2hEOztBQUVELGFBQVMsSUFBSSxHQUFHO0FBQ1osYUFBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQztLQUMxQjs7QUFFRCxhQUFTLFNBQVMsR0FBRztBQUNqQixlQUFPLE9BQU8sQ0FBQztLQUNsQjs7QUFFRCxXQUFPO0FBQ0gsV0FBRyxFQUFFLEdBQUc7QUFDUixZQUFJLEVBQUUsSUFBSTtBQUNWLG9CQUFZLEVBQUUsWUFBWTtBQUMxQixpQkFBUyxFQUFFLFNBQVM7QUFDcEIsWUFBSSxFQUFFLElBQUk7S0FDYixDQUFBO0NBQ0osQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cuZGggPSB3aW5kb3cuZGggfHwge307XG53aW5kb3cuZGguaW50cm8gPSByZXF1aXJlKCcuL2ludHJvLmpzJyk7XG53aW5kb3cuZGguZXhwb25lbnRpYWwgPSByZXF1aXJlKCcuL2V4cG9uZW50aWFsLmpzJyk7XG53aW5kb3cuZGguZWxsaXB0aWMyID0gcmVxdWlyZSgnLi9lbGxpcHRpYzIuanMnKTtcblxuXG4iLCJjb25zdCBzdGVwcGVyID0gcmVxdWlyZSgnLi9zdGVwcGVyLmpzJykoKTtcbmNvbnN0IHN0cm9rZXdpZHRoID0gMztcblxubGV0IGE7XG5sZXQgYjtcblxuZnVuY3Rpb24gZih4KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCAqIHggKyBhLlZhbHVlKCkgKiB4ICsgYi5WYWx1ZSgpKTtcbn1cblxuZnVuY3Rpb24gaW52ZXJzZUYoeCkge1xuICAgIHJldHVybiAtZih4KTtcbn1cblxuZnVuY3Rpb24gaW5pdCh0YXJnZXQpIHtcbiAgICBKWEcuT3B0aW9ucy50ZXh0LnVzZU1hdGhKYXggPSB0cnVlO1xuICAgIHRhcmdldC5zdHlsZS5oZWlnaHQ9XCI3MDBweFwiO1xuICAgIHRhcmdldC5zdHlsZS53aWR0aD1cIjcwMHB4XCI7XG4gICAgY29uc3QgYm9hcmQgPSBKWEcuSlNYR3JhcGguaW5pdEJvYXJkKHRhcmdldC5pZCwge1xuICAgICAgICBib3VuZGluZ2JveDogWy01LCA1LCA1LCAtNV0sXG4gICAgICAgIGF4aXM6IHRydWUsXG4gICAgICAgIHNob3dDb3B5cmlnaHQ6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBib2FyZC5jcmVhdGUoJ3RleHQnLCBbLTQsIDQsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnXFxcXFt5XjIgPSB4XjMgKyBheCArIGJcXFxcXSc7XG4gICAgICAgIH1dLCB7Zm9udFNpemU6IDI0fSk7XG5cbiAgICBhID0gYm9hcmQuY3JlYXRlKCdzbGlkZXInLCBbWzAsIC0zXSwgWzQsIC0zXSwgWy01LCAtMywgNV1dKTtcbiAgICBiID0gYm9hcmQuY3JlYXRlKCdzbGlkZXInLCBbWzAsIC00XSwgWzQsIC00XSwgWy01LCAzLCA1XV0pO1xuXG4gICAgY29uc3QgZ3JhcGgxID0gYm9hcmQuY3JlYXRlKCdmdW5jdGlvbmdyYXBoJywgW2ZdLCB7c3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgY29uc3QgZ3JhcGgyID0gYm9hcmQuY3JlYXRlKCdmdW5jdGlvbmdyYXBoJywgW2ludmVyc2VGXSwge3N0cm9rZVdpZHRoOiBzdHJva2V3aWR0aH0pO1xuXG4gICAgbGV0IG9yaWdpbmFsUG9pbnQsIHBvaW50LFxuICAgICAgICAgICAgdGFuZ2VudCxcbiAgICAgICAgICAgIGludGVyc2VjdDtcblxuICAgIHN0ZXBwZXIudXNlKFtcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgb3JpZ2luYWxQb2ludCA9IHBvaW50ID0gYm9hcmQuY3JlYXRlKCdnbGlkZXInLCBbZ3JhcGgxXSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBib2FyZC5jcmVhdGUoJ3RhbmdlbnQnLCBbcG9pbnRdLCB7c3Ryb2tlQ29sb3I6ICcjZmYwMDAwJywgZGFzaDogMiwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRofSk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMSwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgWygpID0+IHsgcmV0dXJuIGludGVyc2VjdC5YKCkgfSwgKCkgPT4geyByZXR1cm4gLWludGVyc2VjdC5ZKCkgfSwgZ3JhcGgyXSk7XG4gICAgICAgICAgICBib2FyZC5jcmVhdGUoJ2xpbmUnLCBbaW50ZXJzZWN0LCBwb2ludF0sXG4gICAgICAgICAgICAgICAgICAgIHtkYXNoOiAzLCBzdHJhaWdodEZpcnN0OiBmYWxzZSwgc3RyYWlnaHRMYXN0OiBmYWxzZSwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRoLCBsYXN0QXJyb3c6IHRydWV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gLTEuMjY7XG4gICAgICAgICAgICBvcmlnaW5hbFBvaW50Lm1vdmVUbyhbdGFyZ2V0LCBmKHRhcmdldCldLCAyMDAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMSwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgWygpID0+IHsgcmV0dXJuIGludGVyc2VjdC5YKCkgfSwgKCkgPT4geyByZXR1cm4gLWludGVyc2VjdC5ZKCkgfSwgZ3JhcGgyXSk7XG4gICAgICAgICAgICBib2FyZC5jcmVhdGUoJ2xpbmUnLCBbaW50ZXJzZWN0LCBwb2ludF0sXG4gICAgICAgICAgICAgICAgICAgIHtkYXNoOiAzLCBzdHJhaWdodEZpcnN0OiBmYWxzZSwgc3RyYWlnaHRMYXN0OiBmYWxzZSwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRoLCBsYXN0QXJyb3c6IHRydWV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMiwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBwb2ludCA9IGJvYXJkLmNyZWF0ZSgnZ2xpZGVyJywgWygpID0+IHsgcmV0dXJuIGludGVyc2VjdC5YKCkgfSwgKCkgPT4geyByZXR1cm4gLWludGVyc2VjdC5ZKCkgfSwgZ3JhcGgxXSk7XG4gICAgICAgICAgICBib2FyZC5jcmVhdGUoJ2xpbmUnLCBbaW50ZXJzZWN0LCBwb2ludF0sXG4gICAgICAgICAgICAgICAgICAgIHtkYXNoOiAzLCBzdHJhaWdodEZpcnN0OiBmYWxzZSwgc3RyYWlnaHRMYXN0OiBmYWxzZSwgc3Ryb2tlV2lkdGg6IHN0cm9rZXdpZHRoLCBsYXN0QXJyb3c6IHRydWV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgdGFuZ2VudCA9IGJvYXJkLmNyZWF0ZSgndGFuZ2VudCcsIFtwb2ludF0sIHtzdHJva2VDb2xvcjogJyNmZjAwMDAnLCBkYXNoOiAyLCBzdHJva2VXaWR0aDogc3Ryb2tld2lkdGh9KTtcbiAgICAgICAgICAgIGludGVyc2VjdCA9IGJvYXJkLmNyZWF0ZSgnaW50ZXJzZWN0aW9uJywgW2dyYXBoMSwgdGFuZ2VudCwgMF0pO1xuICAgICAgICB9XG4gICAgXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgaGFzTW9yZVN0ZXBzOiBzdGVwcGVyLmhhc01vcmVTdGVwcyxcbiAgICBzdGVwOiBzdGVwcGVyLnN0ZXAsXG4gICAgc3RvcDogc3RlcHBlci5zdG9wXG59OyIsImNvbnN0IHN0ZXBwZXIgPSByZXF1aXJlKCcuL3N0ZXBwZXIuanMnKSgpO1xuXG5mdW5jdGlvbiBjcmVhdGVTY2FsZXIoY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgY3R4KSB7XG4gICAgbGV0IGl0ZXJhdGlvbjtcblxuICAgIGxldCBzY2FsZVgsIHNjYWxlWTtcbiAgICBsZXQgdGFyZ2V0TWF4WCwgdGFyZ2V0TWF4WTtcbiAgICBsZXQgeFN0ZXAsIHlTdGVwO1xuICAgIGxldCBtYXhYID0gNSwgbWF4WSA9IDEwMDAwMDtcbiAgICBmdW5jdGlvbiBkcmF3KGNhbGxiYWNrKSB7XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoMCwgY2FudmFzSGVpZ2h0KTtcbiAgICAgICAgY3R4LnNjYWxlKHNjYWxlWCwgLXNjYWxlWSk7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICBjYWxsYmFjayhjdHgsIGl0ZXJhdGlvbiwgbWF4WCwgc2NhbGVYLCBzY2FsZVkpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgY3R4LmxpbmVKb2luID0gJ3JvdW5kJztcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB6b29tVG8obmV3TWF4WCwgbmV3TWF4WSkge1xuICAgICAgICB0YXJnZXRNYXhYID0gbmV3TWF4WDtcbiAgICAgICAgdGFyZ2V0TWF4WSA9IG5ld01heFk7XG5cbiAgICAgICAgeFN0ZXAgPSAodGFyZ2V0TWF4WCAtIG1heFgpIC8gMTAwO1xuICAgICAgICB5U3RlcCA9ICh0YXJnZXRNYXhZIC0gbWF4WSkgLyAxMDA7XG5cbiAgICAgICAgem9vbVN0ZXAobWF4WCwgbWF4WSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0KG5ld01heFgsIG5ld01heFkpIHtcbiAgICAgICAgbWF4WCA9IG5ld01heFg7XG4gICAgICAgIG1heFkgPSBuZXdNYXhZO1xuICAgICAgICBpdGVyYXRpb24gPSBuZXdNYXhYIC8gMTAwMDtcblxuICAgICAgICBzY2FsZVggPSBjYW52YXNXaWR0aCAvIG5ld01heFg7XG4gICAgICAgIHNjYWxlWSA9IGNhbnZhc0hlaWdodCAvIG5ld01heFk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gem9vbVN0ZXAoKSB7XG4gICAgICAgIGNvbnN0IHhEaWZmID0gTWF0aC5hYnModGFyZ2V0TWF4WCAtIG1heFgpO1xuICAgICAgICBjb25zdCB5RGlmZiA9IE1hdGguYWJzKHRhcmdldE1heFkgLSBtYXhZKTtcblxuICAgICAgICBpZiAoeERpZmYgPiAwLjEgfHwgeURpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgIGlmICh4RGlmZiA+IDAuMSkge1xuICAgICAgICAgICAgICAgIG1heFggKz0geFN0ZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeURpZmYgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICBtYXhZICs9IHlTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0KG1heFgsIG1heFkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2V0LFxuICAgICAgICBkcmF3LFxuICAgICAgICB6b29tVG8sXG4gICAgICAgIHpvb21TdGVwXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQXhlcyhjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBjdHgpIHtcbiAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgIGN0eC5zY2FsZSgxLCAtMSk7XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKDAsIDApO1xuICAgICAgICBjdHgubGluZVRvKGNhbnZhc1dpZHRoLCAwKTtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNhYWEnO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgICAgY3R4LmxpbmVUbygwLCBjYW52YXNIZWlnaHQpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2FhYSc7XG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkcmF3XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFcXVhdGlvbihzY2FsZWQpIHtcbiAgICBsZXQgZXF1YXRpb25GdW5jdGlvbjtcblxuICAgIGZ1bmN0aW9uIHNldChuZXdFcXVhdGlvbkZ1bmN0aW9uKSB7XG4gICAgICAgIGVxdWF0aW9uRnVuY3Rpb24gPSBuZXdFcXVhdGlvbkZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZSh4KSB7XG4gICAgICAgIHJldHVybiBlcXVhdGlvbkZ1bmN0aW9uKHgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIHNjYWxlZC5kcmF3KGZ1bmN0aW9uIChjdHgsIGl0ZXJhdGlvbiwgbWF4WCwgc2NhbGVYLCBzY2FsZVkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwICsgaXRlcmF0aW9uOyB4IDw9IG1heFg7IHggKz0gaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJztcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoeCwgZXF1YXRpb25GdW5jdGlvbih4KSwgNCAvIHNjYWxlWCwgNCAvIHNjYWxlWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHNldCxcbiAgICAgICAgZHJhdyxcbiAgICAgICAgY2FsY3VsYXRlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVIaWdoTGlnaHQoc2NhbGVkLCBlcXVhdGlvbikge1xuICAgIGxldCBhbmltYXRlSGlnaGxpZ2h0O1xuICAgIGxldCBzaG91bGREcmF3SGlnaGxpZ2h0O1xuICAgIGxldCBjdXJyZW50SGlnaGxpZ2h0O1xuICAgIGxldCBoaWdobGlnaHRFbmQ7XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgYW5pbWF0ZUhpZ2hsaWdodCA9IGZhbHNlO1xuICAgICAgICBzaG91bGREcmF3SGlnaGxpZ2h0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWN0aXZhdGUoaGlnaGxpZ2h0U3RhcnQpIHtcbiAgICAgICAgc2hvdWxkRHJhd0hpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgIGN1cnJlbnRIaWdobGlnaHQgPSBoaWdobGlnaHRTdGFydDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhbmltYXRlVG8odG8pIHtcbiAgICAgICAgYW5pbWF0ZUhpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgIGhpZ2hsaWdodEVuZCA9IHRvO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIGlmICghc2hvdWxkRHJhd0hpZ2hsaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGVkLmRyYXcoZnVuY3Rpb24gKGN0eCwgaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudEhpZ2hsaWdodCA+IGhpZ2hsaWdodEVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRlSGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRIaWdobGlnaHQgLT0gaXRlcmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgeCA9IGVxdWF0aW9uLmNhbGN1bGF0ZShjdXJyZW50SGlnaGxpZ2h0KTtcblxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhjdXJyZW50SGlnaGxpZ2h0LCAwKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oY3VycmVudEhpZ2hsaWdodCwgeCk7XG5cbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oMCwgeCk7XG4gICAgICAgICAgICBjdHgubGluZVRvKGN1cnJlbnRIaWdobGlnaHQsIHgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXNldCxcbiAgICAgICAgYWN0aXZhdGUsXG4gICAgICAgIGFuaW1hdGVUbyxcbiAgICAgICAgZHJhd1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5pdChjYW52YXMpIHtcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCBzY2FsZWQgPSBjcmVhdGVTY2FsZXIoY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBjdHgpO1xuICAgIGNvbnN0IGVxdWF0aW9uID0gY3JlYXRlRXF1YXRpb24oc2NhbGVkKTtcbiAgICBjb25zdCBoaWdoTGlnaHQgPSBjcmVhdGVIaWdoTGlnaHQoc2NhbGVkLCBlcXVhdGlvbik7XG5cbiAgICBzY2FsZWQuc2V0KDUwMCwgMTAwKTtcbiAgICBzY2FsZWQuem9vbVRvKDUwMCwgMTAwKTtcbiAgICBoaWdoTGlnaHQucmVzZXQoKTtcbiAgICBlcXVhdGlvbi5zZXQoeCA9PiAxNyArIHgpO1xuICAgIHN0ZXBwZXIudXNlKFtcbiAgICAgICAgKCkgPT4gZXF1YXRpb24uc2V0KHggPT4gMTcgKyB4ICUgOTcpLFxuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiAxNyAqIHgpLFxuICAgICAgICAoKSA9PiBlcXVhdGlvbi5zZXQoeCA9PiAxNyAqIHggJSA5NyksXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IE1hdGgucG93KDE3LCB4KSksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGhpZ2hMaWdodC5yZXNldCgpO1xuICAgICAgICAgICAgc2NhbGVkLnpvb21Ubyg1LCAxMDAwMDApO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiBoaWdoTGlnaHQuYWN0aXZhdGUoNCksXG4gICAgICAgICgpID0+IGhpZ2hMaWdodC5hbmltYXRlVG8oMyksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGhpZ2hMaWdodC5yZXNldCgpO1xuICAgICAgICAgICAgc2NhbGVkLnpvb21UbygxMDAsIDEwMCk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IGVxdWF0aW9uLnNldCh4ID0+IE1hdGgucG93KDE3LCB4KSAlIDk3KSxcbiAgICAgICAgKCkgPT4gaGlnaExpZ2h0LmFjdGl2YXRlKDUwKSxcbiAgICAgICAgKCkgPT4gaGlnaExpZ2h0LmFuaW1hdGVUbygzMClcbiAgICBdKTtcblxuICAgIGNvbnN0IGF4ZXMgPSBjcmVhdGVBeGVzKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCwgY3R4KTtcblxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIGlmICghc3RlcHBlci5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBheGVzLmRyYXcoKTtcbiAgICAgICAgZXF1YXRpb24uZHJhdygpO1xuICAgICAgICBoaWdoTGlnaHQuZHJhdygpO1xuICAgICAgICBzY2FsZWQuem9vbVN0ZXAoKTtcblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICAgIH1cblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgaGFzTW9yZVN0ZXBzOiBzdGVwcGVyLmhhc01vcmVTdGVwcyxcbiAgICBzdGVwOiBzdGVwcGVyLnN0ZXAsXG4gICAgc3RvcDogc3RlcHBlci5zdG9wXG59OyIsImNvbnN0IGNyZWF0ZVN0ZXBwZXIgPSByZXF1aXJlKCcuL3N0ZXBwZXIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAgKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBhY3RvcldpZHRoO1xuICAgIHZhciBoYWxmV2lkdGgsIGhhbGZIZWlnaHQsIGhhbGZBY3RvcldpZHRoO1xuXG4gICAgdmFyIGFjdG9yWSwgaW50cnVkZXJZLCBtZXNzYWdlWTtcblxuICAgIGZ1bmN0aW9uIHNldFNpemVzKGNhbnZhcykge1xuICAgICAgICBtYXhXaWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICAgICAgbWF4SGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgICAgYWN0b3JXaWR0aCA9IDEwMDtcblxuICAgICAgICBoYWxmV2lkdGggPSBtYXhXaWR0aCAvIDI7XG4gICAgICAgIGhhbGZIZWlnaHQgPSBtYXhIZWlnaHQgLyAyO1xuICAgICAgICBoYWxmQWN0b3JXaWR0aCA9IGFjdG9yV2lkdGggLyAyO1xuXG4gICAgICAgIGFjdG9yWSA9IGhhbGZIZWlnaHQtYWN0b3JXaWR0aDtcbiAgICAgICAgaW50cnVkZXJZID0gbWF4SGVpZ2h0LTIqYWN0b3JXaWR0aDtcbiAgICAgICAgbWVzc2FnZVkgPSBhY3RvclktNTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlQWN0aXZhdGFibGUoc29tZXRoaW5nKSB7XG4gICAgICAgIHZhciBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdmFyIG9yaWdpbmFsRHJhdyA9IHNvbWV0aGluZy5kcmF3O1xuXG4gICAgICAgIHNvbWV0aGluZy5kcmF3ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAoISFvcmlnaW5hbERyYXcgJiYgYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxEcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzb21ldGhpbmcuYWN0aXZhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhY3RpdmUgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNvbWV0aGluZy5kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHNvbWV0aGluZztcbiAgICB9XG5cbiAgICB2YXIgY3JlYXRlSW1hZ2VzID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcbiAgICAgICAgdmFyIGltYWdlcyA9IFtcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL3NlYW5fY29ubmVyeS5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvbS5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvZHJfbm8uanBnJyxcbiAgICAgICAgICAgICdyZXNvdXJjZXMvaW1nL2NsaWVudC5qcGcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvZWJheS5wbmcnLFxuICAgICAgICAgICAgJ3Jlc291cmNlcy9pbWcvaGFja2VyLmpwZycsXG4gICAgICAgICAgICAncmVzb3VyY2VzL2ltZy9vdHBib29rbGV0LmpwZycsXG4gICAgICAgIF07XG4gICAgICAgIHZhciBpbWFnZU9iamVjdHMgPSBbXTtcblxuICAgICAgICB2YXIgbG9hZGVkID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgICAgICBsb2FkZWQrKztcbiAgICAgICAgICAgIGlmIChsb2FkZWQgPT09IGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKHtcbiAgICAgICAgICAgICAgICAgICAgamI6IGltYWdlT2JqZWN0c1swXSxcbiAgICAgICAgICAgICAgICAgICAgbTogaW1hZ2VPYmplY3RzWzFdLFxuICAgICAgICAgICAgICAgICAgICBubzogaW1hZ2VPYmplY3RzWzJdLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnQ6IGltYWdlT2JqZWN0c1szXSxcbiAgICAgICAgICAgICAgICAgICAgc2hvcDogaW1hZ2VPYmplY3RzWzRdLFxuICAgICAgICAgICAgICAgICAgICBoYWNrZXI6IGltYWdlT2JqZWN0c1s1XSxcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2s6IGltYWdlT2JqZWN0c1s2XSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBpbWFnZXNbaV07XG4gICAgICAgICAgICBpbWFnZU9iamVjdHMucHVzaChpbWcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVBY3RvciA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIGltYWdlLCBhbHRlcm5hdGVJbWFnZSkge1xuICAgICAgICB2YXIgd2lkdGggPSAxMDAsXG4gICAgICAgICAgICAgICAgY3VycmVudEltYWdlID0gaW1hZ2U7XG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBjdXJyZW50SW1hZ2UuaGVpZ2h0ICogKHdpZHRoIC8gY3VycmVudEltYWdlLndpZHRoKVxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShjdXJyZW50SW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7XG4gICAgICAgICAgICBkcmF3OiBkcmF3LFxuICAgICAgICAgICAgdXNlSkI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SW1hZ2UgPSBhbHRlcm5hdGVJbWFnZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1c2VOb3JtYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVNZXNzYWdlID0gZnVuY3Rpb24gKGN0eCwgeCwgeSwgc3RyKSB7XG4gICAgICAgIHZhciB0YXJnZXRYLCB0YXJnZXRZLCB4U3RlcCwgeVN0ZXAsXG4gICAgICAgICAgICAgICAgbW92ZVgsIG1vdmVZLFxuICAgICAgICAgICAgICAgIHhPZmZzZXQsIHlPZmZzZXQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTtcblxuICAgICAgICBmdW5jdGlvbiBkcmF3KHByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAobW92ZVgoeCArIHhPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgeE9mZnNldCArPSBwcm9ncmVzcyAqIHhTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1vdmVZKHkgKyB5T2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgIHlPZmZzZXQgKz0gcHJvZ3Jlc3MgKiB5U3RlcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjQ4cHggc2VyaWZcIjtcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChtZXNzYWdlLCB4ICsgeE9mZnNldCwgeSArIHlPZmZzZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2FsY1N0ZXAoKSB7XG4gICAgICAgICAgICB4U3RlcCA9ICh0YXJnZXRYIC0geCArIHhPZmZzZXQpIC8gbWF4V2lkdGg7XG4gICAgICAgICAgICBpZiAodGFyZ2V0WCA+IHggKyB4T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA8IHRhcmdldFg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbW92ZVggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geCA+IHRhcmdldFg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeVN0ZXAgPSAodGFyZ2V0WSAtIHkgKyB5T2Zmc2V0KSAvIG1heFdpZHRoO1xuICAgICAgICAgICAgaWYgKHRhcmdldFkgPiB5ICsgeU9mZnNldCkge1xuICAgICAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkgPCB0YXJnZXRZO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkgPiB0YXJnZXRZO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtb3ZlVG9IYWxmKCkge1xuICAgICAgICAgICAgdGFyZ2V0WCA9IGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVUb0Z1bGwoKSB7XG4gICAgICAgICAgICB0YXJnZXRYID0gbWF4V2lkdGggLSBhY3RvcldpZHRoIC0gNDA7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZURvd24oKSB7XG4gICAgICAgICAgICB0YXJnZXRZID0gaW50cnVkZXJZLTIwO1xuICAgICAgICAgICAgY2FsY1N0ZXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldFN0YXJ0KG5ld1gsIG5ld1kpIHtcbiAgICAgICAgICAgIHggPSBuZXdYIHx8IHg7XG4gICAgICAgICAgICB5ID0gbmV3WSB8fCB5O1xuICAgICAgICAgICAgdGFyZ2V0WCA9IG5ld1ggfHwgeDtcbiAgICAgICAgICAgIHRhcmdldFkgPSBuZXdZIHx8IHk7XG4gICAgICAgICAgICB4U3RlcCA9IDE7XG4gICAgICAgICAgICB5U3RlcCA9IDE7XG4gICAgICAgICAgICBtb3ZlWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1vdmVZID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeE9mZnNldCA9IDA7XG4gICAgICAgICAgICB5T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAnNzYyNic7XG4gICAgICAgICAgICBjYWxjU3RlcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0TWVzc2FnZShuZXdNZXNzYWdlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gbmV3TWVzc2FnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFN0YXJ0KCk7XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7XG4gICAgICAgICAgICBkcmF3OiBkcmF3LFxuICAgICAgICAgICAgbW92ZVRvSGFsZjogbW92ZVRvSGFsZixcbiAgICAgICAgICAgIG1vdmVUb0Z1bGw6IG1vdmVUb0Z1bGwsXG4gICAgICAgICAgICBtb3ZlRG93bjogbW92ZURvd24sXG4gICAgICAgICAgICBzZXRTdGFydDogc2V0U3RhcnQsXG4gICAgICAgICAgICBzZXRNZXNzYWdlOiBzZXRNZXNzYWdlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2wgPSBmdW5jdGlvbiAoY3R4LCB5KSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGFjdG9yV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhtYXhXaWR0aCAtIGFjdG9yV2lkdGgsIHkpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ha2VBY3RpdmF0YWJsZSh7ZHJhdzogZHJhd30pO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUHJvdG9jb2xEb3RzID0gZnVuY3Rpb24gKGN0eCwgeSkge1xuICAgICAgICBmdW5jdGlvbiBkcmF3KCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyhoYWxmV2lkdGgsIHksIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFrZUFjdGl2YXRhYmxlKHtkcmF3OiBkcmF3fSk7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVQcm90b2NvbExpc3RlbmVyID0gZnVuY3Rpb24gKGN0eCwgeTEsIHkyKSB7XG4gICAgICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKGhhbGZXaWR0aCwgeTEpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIHkyKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYWtlQWN0aXZhdGFibGUoe2RyYXc6IGRyYXd9KTtcbiAgICB9O1xuXG4gICAgdmFyIHN0ZXBzID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICB2YXIgc3RlcHM7XG4gICAgICAgIHZhciBjdXJyZW50U3RlcCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdChjbGllbnQsIHNlcnZlciwgaW50cnVkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSwgbWVzc2FnZUNvcHksIHByb3RvY29sLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cywgcHJvdG9jb2xMaXN0ZW5lcixcbiAgICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEsIGNvZGVib29rMikge1xuICAgICAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICBjdXJyZW50U3RlcCA9IDA7XG5cbiAgICAgICAgICAgIHN0ZXBzID0gW1xuICAgICAgICAgICAgICAgIHNlcnZlci5hY3RpdmF0ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIHByb3RvY29sLmFjdGl2YXRlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvSGFsZixcbiAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuYWN0aXZhdGUsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbExpc3RlbmVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGludHJ1ZGVyLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UubW92ZVRvRnVsbCgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3B5LmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuc2V0U3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xEb3RzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudC51c2VKQigpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIudXNlSkIoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci51c2VKQigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbnRydWRlci5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlYm9vazEuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2syLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgnNzYyNiArIDYwODExJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSg3NjI2ICsgNjA4MTEpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRNZXNzYWdlKDc2MjYgKyA2MDgxMSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0hhbGYsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLm1vdmVUb0Z1bGwoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydChtYXhXaWR0aCAtIDMqYWN0b3JXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgoNzYyNiArIDYwODExKSArICctIDYwODExJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0U3RhcnQobWF4V2lkdGggLSBhY3RvcldpZHRoIC0gNDApO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnNldE1lc3NhZ2UoJzc2MjYnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRTdGFydCgxKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvcHkuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRTdGFydChtYXhXaWR0aCAtIGFjdG9yV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci51c2VOb3JtYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgaW50cnVkZXIudXNlTm9ybWFsKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMS5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVib29rMi5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0TWVzc2FnZSgnNzYyNiArIEtleScpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5zZXRNZXNzYWdlKCdLZXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhc01vcmVTdGVwcygpIHtcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nICYmIGN1cnJlbnRTdGVwIDwgc3RlcHMubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgICAgIHN0ZXBzW2N1cnJlbnRTdGVwKytdKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICAgICAgc3RvcDogc3RvcCxcbiAgICAgICAgICAgIGhhc01vcmVTdGVwczogaGFzTW9yZVN0ZXBzLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgICAgICBzdGVwOiBzdGVwXG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgZnVuY3Rpb24gaW5pdChjYW52YXMpIHtcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHNldFNpemVzKGNhbnZhcyk7XG5cbiAgICAgICAgY3JlYXRlSW1hZ2VzKGZ1bmN0aW9uIChpbWFnZXMpIHtcbiAgICAgICAgICAgIHZhciBjbGllbnQgPSBjcmVhdGVBY3RvcihjdHgsIDAsIGFjdG9yWSwgaW1hZ2VzLmNsaWVudCwgaW1hZ2VzLmpiKTtcbiAgICAgICAgICAgIGNsaWVudC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgdmFyIHNlcnZlciA9IGNyZWF0ZUFjdG9yKGN0eCwgbWF4V2lkdGggLSBhY3RvcldpZHRoLCBhY3RvclksIGltYWdlcy5zaG9wLCBpbWFnZXMubSk7XG4gICAgICAgICAgICB2YXIgaW50cnVkZXIgPSBjcmVhdGVBY3RvcihjdHgsIGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoLCBpbnRydWRlclksIGltYWdlcy5oYWNrZXIsIGltYWdlcy5ubyk7XG4gICAgICAgICAgICB2YXIgY29kZWJvb2sxID0gY3JlYXRlQWN0b3IoY3R4LCAwLCA0MCwgaW1hZ2VzLmNvZGVib29rKTtcbiAgICAgICAgICAgIHZhciBjb2RlYm9vazIgPSBjcmVhdGVBY3RvcihjdHgsIG1heFdpZHRoIC0gYWN0b3JXaWR0aCwgNDAsIGltYWdlcy5jb2RlYm9vayk7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGNyZWF0ZU1lc3NhZ2UoY3R4LCAwLCBtZXNzYWdlWSwgJ29yaWcnKTtcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VDb3B5ID0gY3JlYXRlTWVzc2FnZShjdHgsIGhhbGZXaWR0aCAtIGhhbGZBY3RvcldpZHRoLCBtZXNzYWdlWSwgJ2NvcHknKTtcblxuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gY3JlYXRlUHJvdG9jb2woY3R4LCBhY3RvclkpO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sRG90cyA9IGNyZWF0ZVByb3RvY29sRG90cyhjdHgsIGFjdG9yWSk7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2xMaXN0ZW5lciA9IGNyZWF0ZVByb3RvY29sTGlzdGVuZXIoY3R4LCBhY3RvclksIGludHJ1ZGVyWSk7XG5cbiAgICAgICAgICAgIHN0ZXBzLmluaXQoY2xpZW50LCBzZXJ2ZXIsIGludHJ1ZGVyLCBtZXNzYWdlLCBtZXNzYWdlQ29weSwgcHJvdG9jb2wsXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sRG90cywgcHJvdG9jb2xMaXN0ZW5lcixcbiAgICAgICAgICAgICAgICAgICAgY29kZWJvb2sxLCBjb2RlYm9vazIpO1xuXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuXG4gICAgICAgICAgICB2YXIgbGFzdFRpbWU7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3M7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXcoY3VycmVudFRpbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXN0ZXBzLmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWxhc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSAoY3VycmVudFRpbWUgLSBsYXN0VGltZSk7XG4gICAgICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcblxuICAgICAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIGNsaWVudC5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgaW50cnVkZXIuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlQ29weS5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBwcm90b2NvbC5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBwcm90b2NvbERvdHMuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgcHJvdG9jb2xMaXN0ZW5lci5kcmF3KHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBjb2RlYm9vazEuZHJhdyhwcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgY29kZWJvb2syLmRyYXcocHJvZ3Jlc3MpO1xuXG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBpbml0LFxuICAgICAgICBoYXNNb3JlU3RlcHM6IHN0ZXBzLmhhc01vcmVTdGVwcyxcbiAgICAgICAgc3RlcDogc3RlcHMuc3RlcCxcbiAgICAgICAgc3RvcDogc3RlcHMuc3RvcFxuICAgIH07XG59KSgpO1xuICBcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlU3RlcHBlcigpIHtcbiAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgIHZhciBjdXJyZW50U3RlcCA9IDA7XG4gICAgdmFyIHN0ZXBzLCBzdG9wU3RlcDtcblxuICAgIGZ1bmN0aW9uIHVzZSh0aGVzZVN0ZXBzLCB1c2VUaGlzU3RvcFN0ZXApIHtcbiAgICAgICAgc3RlcHMgPSB0aGVzZVN0ZXBzO1xuICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgc3RvcFN0ZXAgPSB1c2VUaGlzU3RvcFN0ZXA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoISFzdG9wU3RlcCkge1xuICAgICAgICAgICAgc3RvcFN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc01vcmVTdGVwcygpIHtcbiAgICAgICAgcmV0dXJuIHJ1bm5pbmcgJiYgY3VycmVudFN0ZXAgPCBzdGVwcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RlcCgpIHtcbiAgICAgICAgc3RlcHNbY3VycmVudFN0ZXArK10oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHVzZTogdXNlLFxuICAgICAgICBzdG9wOiBzdG9wLFxuICAgICAgICBoYXNNb3JlU3RlcHM6IGhhc01vcmVTdGVwcyxcbiAgICAgICAgaXNSdW5uaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgIHN0ZXA6IHN0ZXBcbiAgICB9XG59OyJdfQ==
