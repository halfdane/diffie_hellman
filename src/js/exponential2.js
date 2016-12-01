const stepper = require('./stepper.js')();
const strokewidth = 3;

function f(x) {
    return x*x;
}

function init(target) {
    const board = JXG.JSXGraph.initBoard(target.id, {
        boundingbox: [-5, 5, 5, -5],
        axis: true,
        showCopyright: false
    });

    const graph1 = board.create('functiongraph', [f], {strokeWidth: strokewidth});

    stepper.use([
        () => { }
    ]);
}

module.exports = {
    init: init,
    hasMoreSteps: stepper.hasMoreSteps,
    step: stepper.step,
    stop: stepper.stop
};