module.exports = (function () {

    function createScaler (canvasWidth, canvasHeight, ctx) {
        var iteration;

        var scaleX;
        var scaleY;

        var maxX = 5, maxY = 100000;

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

            ctx.lineJoin = 'round';
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
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, canvasHeight);
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }

        return {
            draw: draw
        }
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
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x, equationFunction(x), 2 / scaleX, 2 / scaleY);
                }
            });
        }

        return {
            set: set,
            draw: draw,
            calculate: calculate
        }
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
                ctx.strokeStyle = 'blue';
            });
        }

        return {
            reset: reset,
            activate: activate,
            animateTo: animateTo,
            draw: draw
        }
    }

    var steps = (function () {

        var running = false;
        var highLight, scaled, equation;
        var steps = [
            function () {
                equation.set(function (x) {
                    return 17+x % 97;
                });
            },
            function () {
                equation.set(function (x) {
                    return 17*x;
                });
            },
            function () {
                equation.set(function (x) {
                    return 17*x % 97;
                });
            },
            function () {
                equation.set(function (x) {
                    return Math.pow(17, x);
                });
            },
            function () {
                highLight.reset();
                scaled.zoomTo(5, 100000);
            },
            function () {
                highLight.activate(4);
            },
            function () {
                highLight.animateTo(3)
            },
            function () {
                highLight.reset();
                scaled.zoomTo(100, 100);
            },
            function () {
                equation.set(function (x) {
                    return Math.pow(17, x) % 97;
                });
            },
            function () {
                highLight.activate(50);
            },
            function () {
                highLight.animateTo(30)
            }
        ];
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
        }
    })();

    function init(canvas) {
        var ctx = canvas.getContext('2d');

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
  
