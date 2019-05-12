let gameOptions = {
    fieldWidth: 13,
    fieldHeight: 11,
    donutTypes: 7,
    donutWidth: 99,
    donutHeight: 87,
    swapSpeed: 100,
    fallSpeed: 300,
    destroySpeed: 200
};

let score = 0,
    audioKill,
    audioSelect,
    audioSelect4,
    audioBackground,
    hand,
    emitter,
    emitter2,
    emitter3,
    emitter4,
    emitter5;

const hendOffset = 20,
    shadowOffset = 10,
    TIME = "Time: ",
    timeAtStart_ms = 30000;

WebFontConfig = {
    google: {families: ['Fredoka One']}
};

state.gameState = function () {};

state.gameState.prototype = {
    preload: function () {
        for (let i = 1; i <= gameOptions.donutTypes; i++) {
            game.load.image('donut' + i, './resources/images/game/gem-' + i + '.png');
        }
        game.load.image("background", "./resources/images/backgrounds/background.jpg");
        game.load.image("shadow", "./resources/images/game/shadow.png");
        game.load.image("score", "./resources/images/bg-score.png");
        game.load.image("timeup", "./resources/images/text-timeup.png");
        game.load.image("sound", "./resources/images/btn-sfx.png");
        game.load.image("hand", "./resources/images/game/hand.png");
        game.load.image("particle1", "./resources/images/particles/particle-1.png");
        game.load.image("particle2", "./resources/images/particles/particle-2.png");
        game.load.image("particle3", "./resources/images/particles/particle-3.png");
        game.load.image("particle4", "./resources/images/particles/particle-4.png");
        game.load.image("particle5", "./resources/images/particles/particle-5.png");
        game.load.image("particle_ex1", "./resources/images/particles/particle_ex1.png");
        game.load.image("particle_ex2", "./resources/images/particles/particle_ex2.png");
        game.load.image("particle_ex3", "./resources/images/particles/particle_ex3.png");

        game.load.audio('startMusic', ['./resources/audio/background.mp3']);
        game.load.audio('select', ['./resources/audio/select-1.mp3']);
        game.load.audio('select4', ['./resources/audio/select-4.mp3']);
        game.load.audio('kill', ['./resources/audio/kill.mp3']);

        game.load.script("webfont", "//fonts.googleapis.com/css?family=Fredoka+One");
    },
    create: function () {
        game.add.button(scoreWidth * 2, gameHeight + scoreHeight / 2, 'sound', soundOnOff, this, 2, 1, 0).anchor.setTo(0, 0.6);
        game.stage.backgroundColor = backgroundColor;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        game.add.sprite(0, 0, "background");
        game.add.sprite(0, gameHeight, "score");
        hand = game.add.sprite(game.world._height, game.world._width, "hand");

        game.scoreText = game.add.text(scoreWidth / 2, gameHeight + scoreHeight / 2, score, {
            font: "65px Fredoka One",
            fill: "#f8fffd",
            align: "center"
        });
        game.scoreText.anchor.setTo(0.5, 0.6);

        game.timerText = game.add.text(scoreWidth, gameHeight + scoreHeight / 2, null, {
            font: "65px Fredoka One",
            fill: "#fbfbff",
            align: "center"
        });
        game.timerText.anchor.setTo(0, 0.6);
        game.timeTo_ms = new Date().getTime() + timeAtStart_ms;

        if (!audioBackground) {
            audioBackground = game.add.audio('startMusic', 1, true).play();
        }

        audioKill = game.add.audio('kill');
        audioSelect = game.add.audio('select');
        audioSelect4 = game.add.audio('select4');

        drawField();
        game.canPick = true;
        game.selectedDonut = null;
        game.donutGroup.onChildInputDown.add(donutSelect, this);

        game.physics.startSystem(Phaser.Physics.ARCADE);
        emitter = game.add.emitter(0, 0, 100);
        let keyAndFrameArr = ['particle_ex1','particle_ex2','particle_ex3'];
        emitter.makeParticles(keyAndFrameArr,keyAndFrameArr);
        emitter.gravity = 1000;
    },
    update: function () {
        game.scoreText.text = score;
        let timeDistance_ms = game.timeTo_ms - new Date().getTime();
        game.timerText.text = TIME + millisecondsToTime(timeDistance_ms);
        if (timeDistance_ms <= 0) {
            gameOver();
        }
        hand.bringToTop();
        hand.x = game.input.mousePointer.x -hendOffset;
        hand.y = game.input.mousePointer.y - hendOffset;
    }
};

function soundOnOff(soundImg) {
    if (audioBackground.isPlaying) {
        audioBackground.stop();
        audioKill.mute = true;
        audioSelect.mute = true;
        audioSelect4.mute = true;
        soundImg.alpha = 0.5;
        soundImg.tint = 0xff0000;
    } else {
        audioBackground.play();
        audioKill.mute = false;
        audioSelect.mute = false;
        audioSelect4.mute = false;
        soundImg.alpha = 1;
        soundImg.tint = 0xffffff;
    }
}

function drawField() {
    game.gameArray = [];
    game.donutGroup = game.add.group();
    game.donutGroup.inputEnableChildren = true;
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        game.gameArray[col] = [];
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            do {
                if (game.gameArray[col][row] && game.gameArray[col][row] !== undefined) {
                    game.gameArray[col][row].shadow.destroy();
                    game.gameArray[col][row].donutSprite.destroy();
                    game.gameArray[col][row] = null;
                }
                let randomNumber = game.math.between(1, gameOptions.donutTypes);
                let donutShadow = game.donutGroup.create(gameOptions.donutWidth * col + shadowOffset, gameOptions.donutHeight * row + shadowOffset, "shadow");
                let donut = game.donutGroup.create(gameOptions.donutWidth * col, gameOptions.donutHeight * row, "donut" + randomNumber);
                game.gameArray[col][row] = {
                    donutNumber: randomNumber,
                    donutSprite: donut,
                    shadow: donutShadow
                };
            } while (isMatch(col, row));
        }
    }
}

function gameOver() {
    game.timerText.text = TIME + millisecondsToTime(0);
    game.canPick = false;
    let timeUp = game.add.sprite(game.world.centerX, game.world.centerY, "timeup");
    timeUp.anchor.setTo(0.5, 0.9);
    game.add.button(timeUp.x, timeUp.y + timeUp.height, 'btn-play', actionOnClick, this, 2, 1, 0).anchor.setTo(0.5, 0.5);

    function actionOnClick() {
        game.state.start('gameState');
    }
}

function millisecondsToTime(timeDistance_ms) {
    let secs = (timeDistance_ms) / 1000;
    let hours = Math.floor(secs / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    return plusZero(hours) + ":" + plusZero(minutes) + ":" + plusZero(seconds);

    function plusZero(number) {
        return number.toString().length < 2 ? '0' + number : number;
    }
}

function donutSelect(pointer) {
    if (!game.canPick) {
        return;
    }
    let col = Math.floor(pointer.position.x / gameOptions.donutWidth);
    let row = Math.floor(pointer.position.y / gameOptions.donutHeight);
    console.log('col(x) :' + col + "; row(y) :" + row);
    let pickedDonut = donutAt(col, row);
    console.log("pickedDonut", pickedDonut);

    if (pickedDonut !== -1) {
        if (game.selectedDonut == null) {
            audioSelect.play();
            pickedDonut.shadow.scale.setTo(1.1);
            pickedDonut.donutSprite.scale.setTo(1.1);
            pickedDonut.donutSprite.bringToTop();
            game.selectedDonut = pickedDonut;
        } else {
            if (areTheSame(pickedDonut, game.selectedDonut)) {
                pickedDonut.shadow.scale.setTo(1);
                pickedDonut.donutSprite.scale.setTo(1);
                game.selectedDonut = null;
            } else {
                if (areNext(pickedDonut, game.selectedDonut)) {
                    audioSelect4.play();
                    game.selectedDonut.shadow.scale.setTo(1);
                    game.selectedDonut.donutSprite.scale.setTo(1);
                    swapDonuts(game.selectedDonut, pickedDonut, true);
                    game.selectedDonut = null;
                } else {
                    audioSelect.play();
                    game.selectedDonut.shadow.scale.setTo(1);
                    game.selectedDonut.donutSprite.scale.setTo(1);
                    pickedDonut.shadow.scale.setTo(1.1);
                    pickedDonut.donutSprite.scale.setTo(1.1);
                    game.selectedDonut = pickedDonut;
                }
            }
        }
    }

    function areNext(donut1, donut2) {
        return Math.abs(getDonutRow(donut1) - getDonutRow(donut2)) + Math.abs(getDonutCol(donut1) - getDonutCol(donut2)) === 1;
    }

    function areTheSame(donut1, donut2) {
        return getDonutRow(donut1) == getDonutRow(donut2) && getDonutCol(donut1) === getDonutCol(donut2);
    }
}

function swapDonuts(donut1, donut2, swapBack) {
    game.canPick = false;

    function swapSprites(sprite1, sprite2) {
        return game.add.tween(sprite1).to({
            x: sprite2.position.x,
            y: sprite2.position.y
        }, gameOptions.swapSpeed, Phaser.Easing.Linear.None, true);
    }

    swapSprites(donut1.shadow, donut2.shadow);
    swapSprites(donut1.donutSprite, donut2.donutSprite);

    swapSprites(donut2.shadow, donut1.shadow);
    var orb2Tween = swapSprites(donut2.donutSprite, donut1.donutSprite);

    var tempDonut1 = Object.assign({}, donut1);

    replaceDonut(donut1,donut2);
    replaceDonut(donut2,tempDonut1);

    orb2Tween.onComplete.add(function () {
        if (!matchInBoard() && swapBack) {
            game.canPick = true;
            swapDonuts(donut1, donut2, false);
        } else {
            if (matchInBoard()) {
                handleMatches();
            } else {
                game.canPick = true;
                game.selectedDonut = null;
            }
        }
    });

    function replaceDonut(donut1,donut2) {
        donut1.donutNumber = donut2.donutNumber;
        donut1.donutSprite = donut2.donutSprite;
        donut1.shadow = donut2.shadow;
    }
}

function matchInBoard() {
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            if (isMatch(col, row)) {
                return true;
            }
        }
    }
    return false;
}

function initRemoveMap() {
    let removeMap = [];
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        removeMap[col] = [];
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            removeMap[col].push(0);
        }
    }
    return removeMap;
}

function handleMatches() {
    game.canPick = false;
    game.removeMap = initRemoveMap();
    checkHorizontalMatches();
    checkVerticalMatches();
    destroyDonuts();
}

function checkHorizontalMatches() {
    for (let row = 0; row < gameOptions.fieldHeight; row++) {
        let numberStreak = 1,
            currentNumber = -1,
            startStreak = 0,
            donutToWatch = null;
        for (let col = 0; col < gameOptions.fieldWidth; col++) {
            donutToWatch = donutAt(col, row);
            if (donutToWatch === -1) {
                startStreak = row;
                currentNumber = -1;
                numberStreak = 1;
                continue;
            }
            if (donutToWatch.donutNumber === currentNumber) {
                numberStreak++;
            }
            if (donutToWatch.donutNumber !== currentNumber || col === gameOptions.fieldWidth - 1) {
                if (numberStreak >= 3) {
                    console.log("HORIZONTAL :: Length = " + numberStreak + " :: Start = (" + startStreak + "," + row + ") :: number = " + currentNumber);
                    for (let k = 0; k < numberStreak; k++) {
                        game.removeMap[startStreak + k][row]++;
                    }
                }
                startStreak = col;
                numberStreak = 1;
                currentNumber = donutToWatch.donutNumber;
            }
        }
    }
    console.log(game.removeMap);
}

function checkVerticalMatches() {
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        let numberStreak = 1,
            currentNumber = -1,
            startStreak = 0,
            donutToWatch = null;
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            donutToWatch = donutAt(col, row);
            if (donutToWatch === -1) {
                startStreak = row;
                currentNumber = -1;
                numberStreak = 1;
                continue;
            }
            if (donutToWatch.donutNumber === currentNumber) {
                numberStreak++;
            }
            if (donutToWatch.donutNumber !== currentNumber || row === gameOptions.fieldHeight - 1) {
                if (numberStreak >= 3) {
                    console.log("VERTICAL :: Length = " + numberStreak + " :: Start = (" + col + "," + startStreak + ") :: number = " + currentNumber);
                    for (let k = 0; k < numberStreak; k++) {
                        game.removeMap[col][startStreak + k]++;
                    }
                }
                startStreak = row;
                numberStreak = 1;
                currentNumber = donutToWatch.donutNumber;
            }
        }
    }
}


function destroyDonuts() {
    let destroyed = 0;

    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            if (game.gameArray[col][row] == null)
                continue;

            if (game.removeMap[col][row] > 0) {
                let donutToDestroy = game.gameArray[col][row].donutSprite,
                    shadowDestroyed = disappear(game.gameArray[col][row].shadow),
                    donutDestroyed = disappear(donutToDestroy);

                emitter.x = donutToDestroy.x + gameOptions.donutWidth/2;
                emitter.y = donutToDestroy.y + gameOptions.donutHeight/2;
                emitter.start(true, 500, null, 8);

                game.gameArray[col][row] = null;
                destroyed++;
                score++;
                game.timeTo_ms += 1000;

                shadowDestroyed.onComplete.add(function (shadow) {
                    shadow.destroy();
                    donutDestroyed.onComplete.add(function (donut) {
                        donut.destroy();
                        destroyed--;
                        if (destroyed === 0) {
                            audioKill.play();
                            makeDonutsFall()
                        }
                    });
                });
            }
        }
    }

    function disappear(sprite) {
        return game.add.tween(sprite).to({
            alpha: 0
        }, gameOptions.destroySpeed, Phaser.Easing.Linear.None, true);
    }
}

function makeDonutsFall() {
    let fallen = 0;

    for (let row = gameOptions.fieldHeight - 2; row >= 0; row--) {
        for (let col = 0; col < gameOptions.fieldWidth; col++) {
            if (game.gameArray[col][row] == null) {
                continue;
            }
            let holesBelow = getHolesBelow(col, row);
            if (holesBelow > 0) {
                let donutOverHoles = game.gameArray[col][row].donutSprite,
                    donutShadow = game.gameArray[col][row].shadow,
                    shadow2Tween = fallTo(donutShadow, holesBelow),
                    donut2Tween = fallTo(donutOverHoles, holesBelow);
                game.gameArray[col][row + holesBelow] = {
                    donutSprite: game.gameArray[col][row].donutSprite,
                    donutNumber: game.gameArray[col][row].donutNumber,
                    shadow: game.gameArray[col][row].shadow
                };
                game.gameArray[col][row] = null;
                fallen++;
                shadow2Tween.onComplete.add(function () {
                    donut2Tween.onComplete.add(function () {
                        fallen--;
                        if (fallen === 0) {
                            replenishField();
                            if (matchInBoard()) {
                                handleMatches();
                            }
                        }
                    });
                });
            }
        }
    }
    if (fallen === 0) {
        replenishField();
        if (matchInBoard()) {
            handleMatches();
        }
    }


    function fallTo(sprite, holesBelow) {
        return game.add.tween(sprite).to({
            y: sprite.position.y + holesBelow * gameOptions.donutHeight
        }, gameOptions.fallSpeed, Phaser.Easing.Linear.None, true);
    }
}

function replenishField() { //todo: make donuts full from up side down, not just appear at empty sell
    for (let row = gameOptions.fieldHeight - 1; row >= 0; row--) {
        for (let col = 0; col < gameOptions.fieldWidth; col++) {
            if (game.gameArray[col][row] == null) {
                let randomNumber = game.math.between(1, gameOptions.donutTypes);
                let donutShadow = game.donutGroup.create(gameOptions.donutWidth * col + shadowOffset, gameOptions.donutHeight * row + shadowOffset, "shadow");
                let donut = game.donutGroup.create(gameOptions.donutWidth * col, gameOptions.donutHeight * row, "donut" + randomNumber);
                game.gameArray[col][row] = {
                    donutNumber: randomNumber,
                    donutSprite: donut,
                    shadow: donutShadow
                };
            }
        }
    }
    game.canPick = true;
}

// function replenishField() {
//     let replenished = 0;
//     let restart = false;
//     for (let col = 0; col < gameOptions.fieldWidth; col++) {
//         let holesInCol = getHolesInCol(col);
//         if (holesInCol > 0) {
//             for (let row = 0; row < holesInCol; row++) {
//                 // var orb = game.add.sprite(orbSize * j + orbSize / 2, - (orbSize * (emptySpots - 1 - i) + orbSize / 2), "orbs");
//                 let randomNumber = game.math.between(1, gameOptions.donutTypes);
//                 let donut = game.donutGroup.create(gameOptions.donutWidth * col, gameOptions.donutHeight * row, "donut" + randomNumber);
//                 // donut.anchor.set(0.5);
//                 // orbGroup.add(donut);
//                 // donut.frame = randomColor;
//                 game.gameArray[col][row] = {
//                     donutNumber: randomNumber,
//                     donutSprite: donut
//                 };
//                 // var orb2Tween = game.add.tween(game.gameArray[col][row].donutSprite).to({
//                 //     y: gameOptions.donutHeight * row
//                 // }, gameOptions.fallSpeed, Phaser.Easing.Linear.None, true);
//                 // replenished++;
//                 // orb2Tween.onComplete.add(function () {
//                 //     replenished--;
//                 //     if (replenished === 0) {
//                 //         if (restart) {
//                 // makeDonutsFall();
//                 // } else {
//                 // if (matchInBoard()) {
//                 //     game.time.events.add(250, handleMatches);
//                 // } else {
//                 //     game.canPick = true;
//                 //     selectedOrb = null;
//                 // }
//                 // }
//                 // }
//                 // })
//             }
//         }
//     }
// function getHolesInCol(col) {
//     let result = 0;
//     for (let row = 0; row < gameOptions.fieldHeight; row++) {
//         if (game.gameArray[col][row] == null) {
//             result++;
//         }
//     }
//     return result;
// }
// }

function getHolesBelow(col, row) {
    let result = 0;
    for (let i = row + 1; i < gameOptions.fieldHeight; i++) {
        if (game.gameArray[col][i] == null) {
            result++;
        }
    }
    return result;
}

function isMatch(col, row) {
    return isHorizontalMatch(col, row) || isVerticalMatch(col, row);
}

function isHorizontalMatch(col, row) {
    return donutAt(col, row) !== -1 && donutAt(col, row).donutNumber === donutAt(col - 1, row).donutNumber && donutAt(col, row).donutNumber === donutAt(col - 2, row).donutNumber;
}

function isVerticalMatch(col, row) {
    return donutAt(col, row) !== -1 && donutAt(col, row).donutNumber === donutAt(col, row - 1).donutNumber && donutAt(col, row).donutNumber === donutAt(col, row - 2).donutNumber;
}

function donutAt(col, row) {
    if (row < 0 || row >= gameOptions.fieldHeight || col < 0 || col >= gameOptions.fieldWidth) {
        return -1;
    }
    return game.gameArray[col][row] !== null ? game.gameArray[col][row] : -1;
}

function getDonutRow(donut) {
    return Math.floor(donut.donutSprite.y / gameOptions.donutHeight);
}

function getDonutCol(donut) {
    return Math.floor(donut.donutSprite.x / gameOptions.donutWidth);
}

