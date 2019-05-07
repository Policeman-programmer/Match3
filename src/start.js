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

var score = 0,
    scoreText,
    timerText,
    startTime_ms = 0,
    start = {};

const DONUT_WERE_EATEN = "Donuts were eaten: ",
    TIME_FROM_START = "Time from start: ";

start.state1 = function () {
};
start.state1.prototype = {
    preload: function () {
        game.load.image("background", "./resources/images/backgrounds/background.jpg");
        game.load.image("shadow", "./resources/images/game/shadow.png");
        for (let i = 1; i <= gameOptions.donutTypes; i++) {
            game.load.image('donut' + i, './resources/images/game/gem-' + i + '.png');
        }
    },
    create: function () {
        game.stage.backgroundColor = '#fffa90';
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.add.sprite(0, 0, "background");
        //toDo: make cool font
        scoreText = game.add.text(game.world.centerX, gameHeight, DONUT_WERE_EATEN + score, {
            font: "65px Arial",
            fill: "#5151b0",
            align: "center"
        });
        scoreText.anchor.setTo(0.5, 0);

        timerText = game.add.text(game.world.centerX, gameHeight + scoreText.height, null, {
            font: "65px Arial",
            fill: "#5151b0",
            align: "center"
        });
        timerText.anchor.setTo(0.5, 0);
        startTime_ms = new Date().getTime();

        drawField();
        game.canPick = true;
        game.selectedDonut = null;
        game.donutGroup.onChildInputDown.add(donutSelect, this);
        game.cursorShadow = null;
        game.donutGroup.onChildInputOver.add(onOver, this);
    },
    update: function () {
        scoreText.text = DONUT_WERE_EATEN + score;
        timerText.text = TIME_FROM_START + millisecondsToTime(new Date().getTime(), startTime_ms);
    }
};

function millisecondsToTime(timeStampFrom, timeStampTo) {
    let secs = (timeStampFrom - timeStampTo) / 1000;
    let hours = Math.floor(secs / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    return plusZero(hours) + ":" + plusZero(minutes) + ":" + plusZero(seconds);

    function plusZero(number){
        return number.toString().length < 2 ? number = '0' + number : number;
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
    col = Math.floor(pickedDonut.donutSprite.position.x / gameOptions.donutWidth);
    row = Math.floor(pickedDonut.donutSprite.position.y / gameOptions.donutHeight);
    console.log('donutCol(x) :' + col + "; donutRow(y) :" + row);
    if (pickedDonut !== -1) {
        if (game.selectedDonut == null) {
            pickedDonut.donutSprite.scale.setTo(1.2);
            pickedDonut.donutSprite.bringToTop();
            game.selectedDonut = pickedDonut;
        } else {
            if (areTheSame(pickedDonut, game.selectedDonut)) {
                pickedDonut.donutSprite.scale.setTo(1);
                game.selectedDonut = null;
            } else {
                if (areNext(pickedDonut, game.selectedDonut)) {
                    game.selectedDonut.donutSprite.scale.setTo(1);
                    swapDonuts(game.selectedDonut, pickedDonut, true);
                    game.selectedDonut = null;
                } else {
                    game.selectedDonut.donutSprite.scale.setTo(1);
                    pickedDonut.donutSprite.scale.setTo(1.2);
                    game.selectedDonut = pickedDonut;
                }
            }
        }
    }
}


function onOver(donut) {
    // if(game.cursorShadow){
    //     game.cursorShadow.destroy();
    // }
    // game.cursorShadow = game.add.sprite(donut.position.x, donut.position.y, "shadow");
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
                    deleteDonut(col, row);
                    console.log("deleted donut at col :" + col + " row :" + row);
                }
                let randomNumber = game.math.between(1, gameOptions.donutTypes);
                let donut = game.donutGroup.create(gameOptions.donutWidth * col, gameOptions.donutHeight * row, "donut" + randomNumber);
                game.gameArray[col][row] = {
                    donutNumber: randomNumber,
                    donutSprite: donut,
                    isEmpty: false
                };
            } while (isMatch(col, row));
        }
    }
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

function areNext(donut1, donut2) {
    return Math.abs(getDonutRow(donut1) - getDonutRow(donut2)) + Math.abs(getDonutCol(donut1) - getDonutCol(donut2)) === 1;
}

function areTheSame(donut1, donut2) {
    return getDonutRow(donut1) == getDonutRow(donut2) && getDonutCol(donut1) === getDonutCol(donut2);
}

function getDonutRow(donut) {
    return Math.floor(donut.donutSprite.y / gameOptions.donutHeight);
}

function getDonutCol(donut) {
    return Math.floor(donut.donutSprite.x / gameOptions.donutWidth);
}

function swapDonuts(donut1, donut2, swapBack) {
    game.canPick = false;

    game.add.tween(donut1.donutSprite).to({
        x: donut2.donutSprite.position.x,
        y: donut2.donutSprite.position.y
    }, gameOptions.swapSpeed, Phaser.Easing.Linear.None, true);
    var orb2Tween = game.add.tween(donut2.donutSprite).to({
        x: donut1.donutSprite.position.x,
        y: donut1.donutSprite.position.y
    }, gameOptions.swapSpeed, Phaser.Easing.Linear.None, true);

    var tempDonut1 = Object.assign({}, donut1);
    donut1.donutNumber = donut2.donutNumber;
    donut1.donutSprite = donut2.donutSprite;
    donut2.donutNumber = tempDonut1.donutNumber;
    donut2.donutSprite = tempDonut1.donutSprite;

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
    console.log(game.removeMap);
}


function destroyDonuts() {
    let destroyed = 0;
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            if (game.gameArray[col][row] == null)
                continue;
            if (game.removeMap[col][row] > 0) {
                let destroyTween = game.add.tween(game.gameArray[col][row].donutSprite).to({
                    alpha: 0
                }, gameOptions.destroySpeed, Phaser.Easing.Linear.None, true);
                game.gameArray[col][row] = null;
                destroyed++;
                score++;
                destroyTween.onComplete.add(function (donut) {
                    donut.destroy();
                    destroyed--;
                    if (destroyed === 0) {
                        makeDonutsFall()
                    }
                });
            }
        }
    }
}

function deleteDonut(col, row) {
    game.gameArray[col][row].donutSprite.destroy();
    game.gameArray[col][row] = null;
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
                let donutOverHoles = game.gameArray[col][row].donutSprite;
                let donut2Tween = game.add.tween(donutOverHoles).to({
                    y: donutOverHoles.position.y + holesBelow * gameOptions.donutHeight
                }, gameOptions.fallSpeed, Phaser.Easing.Linear.None, true);
                game.gameArray[col][row + holesBelow] = {
                    donutSprite: game.gameArray[col][row].donutSprite,
                    donutNumber: game.gameArray[col][row].donutNumber
                };
                game.gameArray[col][row] = null;
                fallen++;
                donut2Tween.onComplete.add(function () {
                    fallen--;
                    if (fallen === 0) {
                        replenishField();
                        if (matchInBoard()) {
                            handleMatches();
                        }
                    }
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
}

function replenishField() { //todo: make donuts full from up side not just appear at empty sell
    // let replenished = 0;
    for (let row = gameOptions.fieldHeight - 1; row >= 0; row--) {
        for (let col = 0; col < gameOptions.fieldWidth; col++) {
            if (game.gameArray[col][row] == null) {
                let randomNumber = game.math.between(1, gameOptions.donutTypes);
                let donut = game.donutGroup.create(gameOptions.donutWidth * col, gameOptions.donutHeight * row, "donut" + randomNumber);
                game.gameArray[col][row] = {
                    donutNumber: randomNumber,
                    donutSprite: donut
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
// }

function getHolesInCol(col) {
    let result = 0;
    for (let row = 0; row < gameOptions.fieldHeight; row++) {
        if (game.gameArray[col][row] == null) {
            result++;
        }
    }
    return result;
}

function getHolesBelow(col, row) {
    let result = 0;
    for (let i = row + 1; i < gameOptions.fieldHeight; i++) {
        if (game.gameArray[col][i] == null) {
            result++;
        }
    }
    return result;
}


