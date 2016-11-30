module.exports = function createStepper() {
    var running = false;
    var currentStep = 0;
    var steps;

    function use(theseSteps) {
        steps = theseSteps;
        running = true;
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
        use: use,
        stop: stop,
        hasMoreSteps: hasMoreSteps,
        isRunning: isRunning,
        step: step
    }
};