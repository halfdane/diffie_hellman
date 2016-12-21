const createStepper = require('./stepper.js');

module.exports =  (function () {

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

        actorY = halfHeight-actorWidth;
        intruderY = maxHeight-2*actorWidth;
        messageY = actorY-5;
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

    var createImages = function (onComplete) {
        var images = [
            'resources/img/sean_connery.jpg',
            'resources/img/m.jpg',
            'resources/img/dr_no.jpg',
            'resources/img/client.jpg',
            'resources/img/ebay.png',
            'resources/img/hacker.jpg',
            'resources/img/otpbooklet.jpg',
        ];
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
                    codebook: imageObjects[6],
                });
            }
        }

        for (var i = 0; i < images.length; i++) {
            var img = new Image();
            img.addEventListener("load", onLoad);
            img.src = images[i];
            imageObjects.push(img);
        }
    };

    var createActor = function (ctx, x, y, image, alternateImage) {
        var width = 100,
                currentImage = image;

        function draw() {
            var height = currentImage.height * (width / currentImage.width)
            ctx.drawImage(currentImage, x, y, width, height);
        }

        return makeActivatable({
            draw: draw,
            useJB: function () {
                currentImage = alternateImage;
            },
            useNormal: function () {
                currentImage = image;
            }
        });
    };

    var createMessage = function (ctx, x, y, str) {
        var targetX, targetY, xStep, yStep,
                moveX, moveY,
                xOffset, yOffset,
                message;

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
            targetY = intruderY-20;
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
            message = '7626';
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

    var createProtocol = function (ctx, y) {
        function draw() {
            ctx.beginPath();
            ctx.moveTo(actorWidth, y);
            ctx.lineTo(maxWidth - actorWidth, y);
            ctx.stroke();
        }

        return makeActivatable({draw: draw});
    };

    var createProtocolDots = function (ctx, y) {
        function draw() {
            ctx.beginPath();
            ctx.arc(halfWidth, y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        return makeActivatable({draw: draw});
    };

    var createProtocolListener = function (ctx, y1, y2) {
        function draw() {
            ctx.beginPath();
            ctx.moveTo(halfWidth, y1);
            ctx.lineTo(halfWidth, y2);
            ctx.stroke();
        }

        return makeActivatable({draw: draw});
    };

    var steps = (function () {

        var running = false;
        var steps;
        var currentStep = 0;

        function init(client, server, intruder,
                      message, messageCopy, protocol,
                      protocolDots, protocolListener,
                      codebook1, codebook2) {
            running = true;
            currentStep = 0;

            steps = [
                server.activate,
                message.activate,
                protocol.activate,
                message.moveToHalf,
                protocolDots.activate,
                function () {
                    protocolListener.activate();
                    intruder.activate();
                },
                function () {
                    message.moveToFull();
                    messageCopy.activate();
                    messageCopy.moveDown();
                },
                function () {
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
                },
                function () {
                    message.activate();
                    server.activate();
                    protocol.activate();
                },
                function () {
                    protocolDots.activate();
                    protocolListener.activate();
                    intruder.activate();
                },
                function () {
                    codebook1.activate();
                    codebook2.activate();
                },
                function () {
                    message.setMessage('7626 + 60811');
                },
                function () {
                    message.setMessage(7626 + 60811);
                    messageCopy.setMessage(7626 + 60811);
                },
                message.moveToHalf,
                function () {
                    message.moveToFull();
                    messageCopy.activate();
                    messageCopy.moveDown();
                },
                function () {
                    message.setStart(maxWidth - 3*actorWidth);
                    message.setMessage((7626 + 60811) + '- 60811');
                },
                function () {
                    message.setStart(maxWidth - actorWidth - 40);
                    message.setMessage('7626');
                },
                function () {
                    message.setStart(1);
                    messageCopy.deactivate();
                    messageCopy.setStart(maxWidth - actorWidth);
                    client.useNormal();
                    server.useNormal();
                    intruder.useNormal();
                },
                function () {
                    codebook1.deactivate();
                    codebook2.deactivate();
                },
                function () {
                    message.setMessage('7626 + Key');
                    messageCopy.activate();
                    messageCopy.setMessage('Key');
                }
            ];
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

        setSizes(canvas);

        createImages(function (images) {
            var client = createActor(ctx, 0, actorY, images.client, images.jb);
            client.activate();
            var server = createActor(ctx, maxWidth - actorWidth, actorY, images.shop, images.m);
            var intruder = createActor(ctx, halfWidth - halfActorWidth, intruderY, images.hacker, images.no);
            var codebook1 = createActor(ctx, 0, 40, images.codebook);
            var codebook2 = createActor(ctx, maxWidth - actorWidth, 40, images.codebook);
            var message = createMessage(ctx, 0, messageY, 'orig');

            var messageCopy = createMessage(ctx, halfWidth - halfActorWidth, messageY, 'copy');

            var protocol = createProtocol(ctx, actorY);
            var protocolDots = createProtocolDots(ctx, actorY);
            var protocolListener = createProtocolListener(ctx, actorY, intruderY);

            steps.init(client, server, intruder, message, messageCopy, protocol,
                    protocolDots, protocolListener,
                    codebook1, codebook2);

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

                progress = (currentTime - lastTime);
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
  
