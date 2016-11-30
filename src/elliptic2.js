module.exports = (function () {

    var a;
    var b;

    var strokewidth= 3;

    var stepper = createStepper();

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

        a = board.create('slider', [[0,-3],[4,-3],[-5,-3,5]]);
        b = board.create('slider', [[0,-4],[4,-4],[-5,3,5]]);

        var graph1 = board.create('functiongraph', [f], {strokeWidth: strokewidth});
        var graph2 = board.create('functiongraph', [inverseF], {strokeWidth: strokewidth});

        var originalPoint, point,
                tangent,
                intersect;

        stepper.use([
            function () {
                originalPoint = point = board.create('glider', [graph1]);
            },
            function () {
                tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
            },
            function () {
                intersect = board.create('intersection', [graph1, tangent, 0]);
            },
            function () {
                point = board.create('glider', [function() {return intersect.X()}, function () {return -intersect.Y()}, graph2]);
                board.create('line', [intersect, point], {dash: 3, straightFirst: false, straightLast:false, strokeWidth: strokewidth, lastArrow: true});
            },
            function () {
                var target = -1.26;
                originalPoint.moveTo([target, f(target)], 2000);
            },
            function() {
                tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
                intersect = board.create('intersection', [graph1, tangent, 0]);
            },
            function () {
                point = board.create('glider', [function() {return intersect.X()}, function () {return -intersect.Y()}, graph2]);
                board.create('line', [intersect, point], {dash: 3, straightFirst: false, straightLast:false, strokeWidth: strokewidth, lastArrow: true});
            },
            function() {
                tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
                intersect = board.create('intersection', [graph2, tangent, 0]);
            },
            function () {
                point = board.create('glider', [function() {return intersect.X()}, function () {return -intersect.Y()}, graph1]);
                board.create('line', [intersect, point], {dash: 3, straightFirst: false, straightLast:false, strokeWidth: strokewidth, lastArrow: true});
            },
            function() {
                tangent = board.create('tangent', [point], {strokeColor: '#ff0000', dash: 2, strokeWidth: strokewidth});
                intersect = board.create('intersection', [graph1, tangent, 0]);
            }
        ]);
    }

    return {
        init: init,
        hasMoreSteps: stepper.hasMoreSteps,
        step: stepper.step,
        stop: stepper.stop
    }
})();