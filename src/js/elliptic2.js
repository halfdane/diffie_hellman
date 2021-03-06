const stepper = require('./stepper.js')();
const strokewidth = 3;

let a;
let b;

function f(x) {
    return Math.sqrt(x * x * x + a.Value() * x + b.Value());
}

function inverseF(x) {
    return -f(x);
}

function init(target) {
    JXG.Options.text.useMathJax = true;
    target.style.height="700px";
    target.style.width="700px";
    const board = JXG.JSXGraph.initBoard(target.id, {
        boundingbox: [-5, 5, 5, -5],
        axis: true,
        showCopyright: false
    });

    board.create('text', [-4, 4,
        function () {
            return '\\[y^2 = x^3 + ax + b\\]';
        }], {fontSize: 24});

    a = board.create('slider', [[0, -3], [4, -3], [-5, -3, 5]]);
    b = board.create('slider', [[0, -4], [4, -4], [-5, 3, 5]]);

    const graph1 = board.create('functiongraph', [f], {strokeWidth: strokewidth});
    const graph2 = board.create('functiongraph', [inverseF], {strokeWidth: strokewidth});

    let originalPoint, point,
            tangent,
            intersect;

    stepper.use([
        () => {
            originalPoint = point = board.create('glider', [graph1]);
        },
        () => {
            tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
        },
        () => {
            intersect = board.create('intersection', [graph1, tangent, 0]);
        },
        () => {
            point = board.create('glider', [() => { return intersect.X() }, () => { return -intersect.Y() }, graph2]);
            board.create('line', [intersect, point],
                    {dash: 3, straightFirst: false, straightLast: false, strokeWidth: strokewidth, lastArrow: true});
        },
        () => {
            const target = -1.26;
            originalPoint.moveTo([target, f(target)], 2000);
        },
        () => {
            tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
            intersect = board.create('intersection', [graph1, tangent, 0]);
        },
        () => {
            point = board.create('glider', [() => { return intersect.X() }, () => { return -intersect.Y() }, graph2]);
            board.create('line', [intersect, point],
                    {dash: 3, straightFirst: false, straightLast: false, strokeWidth: strokewidth, lastArrow: true});
        },
        () => {
            tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
            intersect = board.create('intersection', [graph2, tangent, 0]);
        },
        () => {
            point = board.create('glider', [() => { return intersect.X() }, () => { return -intersect.Y() }, graph1]);
            board.create('line', [intersect, point],
                    {dash: 3, straightFirst: false, straightLast: false, strokeWidth: strokewidth, lastArrow: true});
        },
        () => {
            tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
            intersect = board.create('intersection', [graph1, tangent, 0]);
        }
    ]);
}

module.exports = {
    init: init,
    hasMoreSteps: stepper.hasMoreSteps,
    step: stepper.step,
    stop: stepper.stop
};