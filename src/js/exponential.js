const stepper = require('./stepper.js')();

function createScaler(canvasWidth, canvasHeight, ctx) {
    let iteration;

    let scaleX, scaleY;
    let targetMaxX, targetMaxY;
    let xStep, yStep;
    let maxX = 5, maxY = 100000;

    function draw(callback) {
        ctx.save();
        ctx.translate(0, canvasHeight);
        ctx.scale(scaleX, -scaleY);
        ctx.beginPath();

        callback(ctx, iteration, maxX, scaleX, scaleY);

        ctx.restore();

        ctx.lineJoin = 'round';
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
        const xDiff = Math.abs(targetMaxX - maxX);
        const yDiff = Math.abs(targetMaxY - maxY);

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
        set,
        draw,
        zoomTo,
        zoomStep
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
        draw
    }
}

function createEquationLabel(canvasWidth, canvasHeight, ctx) {
    let equationLabel;

    function set(newEquationLabel = 'hey baby;') {
        equationLabel = newEquationLabel;
    }

    function draw() {
        ctx.save();

        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(equationLabel, canvasWidth / 2, canvasHeight / 2);
        //ctx.strokeText(equationLabel, canvasWidth / 2, canvasHeight / 2);

        ctx.restore();
    }

    return {
        draw,
        set
    }
}

function createEquation(scaled, label) {
    let equationFunction;

    function set(newEquationFunction, newLabelString = 'wut?') {
        equationFunction = newEquationFunction;
        label.set(newLabelString);
    }

    function calculate(x) {
        return equationFunction(x);
    }

    function draw() {
        scaled.draw(function (ctx, iteration, maxX, scaleX, scaleY) {
            for (var x = 0 + iteration; x <= maxX; x += iteration) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x, equationFunction(x), 4 / scaleX, 4 / scaleY);
            }
        });
        label.draw();
    }

    return {
        set,
        draw,
        calculate
    }
}

function createHighLight(scaled, equation) {
    let animateHighlight;
    let shouldDrawHighlight;
    let currentHighlight;
    let highlightEnd;

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

            const x = equation.calculate(currentHighlight);

            ctx.moveTo(currentHighlight, 0);
            ctx.lineTo(currentHighlight, x);

            ctx.moveTo(0, x);
            ctx.lineTo(currentHighlight, x);
            ctx.strokeStyle = 'blue';
        });
    }

    return {
        reset,
        activate,
        animateTo,
        draw
    }
}

function init(canvas) {
    const ctx = canvas.getContext('2d');
    const scaled = createScaler(canvas.width, canvas.height, ctx);
    const label = createEquationLabel(canvas.width, canvas.height, ctx);
    const equation = createEquation(scaled, label);
    const highLight = createHighLight(scaled, equation);

    scaled.set(500, 100);
    scaled.zoomTo(500, 100);
    highLight.reset();
    equation.set(x => 17 + x, 'f(x) = 17 + x');
    stepper.use([
        () => equation.set(x => 17 + x % 97, 'f(x) = 17 + x mod 97'),
        () => equation.set(x => 17 * x, 'f(x) = 17 * x'),
        () => equation.set(x => 17 * x % 97, 'f(x) = 17 * x mod 97'),
        () => equation.set(x => Math.pow(17, x), 'f(x) = 17 ^ x'),
        () => {
            highLight.reset();
            scaled.zoomTo(5, 100000);
        },
        () => highLight.activate(4),
        () => highLight.animateTo(3),
        () => {
            highLight.reset();
            scaled.zoomTo(100, 100);
        },
        () => equation.set(x => Math.pow(17, x) % 97, 'f(x) = 17 ^ x mod 97'),
        () => highLight.activate(50),
        () => highLight.animateTo(30)
    ]);

    const axes = createAxes(canvas.width, canvas.height, ctx);

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