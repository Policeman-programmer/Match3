let gameOptions = {
    fieldWidth: 13,
    fieldHeight: 11,
    donutTypes: 7,
    donutWidth: 100,
    donutHeight: 87,
    swapSpeed: 200,
    fallSpeed: 100,
    destroySpeed: 200
};

const HORIZONTAL = 1;
const VERTICAL = 2;

var start = {};
start.state1 = function () {
};
start.state1.prototype = {
    preload: function () {
        game.load.image("background", "../resources/images/backgrounds/background.jpg");
        for (let i = 1; i <= gameOptions.donutTypes; i++) {
            game.load.image('donut' + i, '../resources/images/game/gem-' + i + '.png');
        }
    },
    create: function () {
        game.stage.backgroundColor = '#ffffff';
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        let background = game.add.sprite(game.world.centerX, game.world.centerY, "background");
        background.anchor.setTo(0.5, 0.5);
        drawField();
        game.canPick = true;
        game.selectedDonut = null;
        game.donutGroup.onChildInputDown.add(donutSelect, this);
    },
    update: function () {
    }
};

function donutSelect(pointer) {
    if (!game.canPick) return;
    //     this.dragging = true;
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


function drawField() {
    game.gameArray = [];
    game.poolArray = [];
    game.donutGroup = game.add.group();
    game.donutGroup.inputEnableChildren = true;
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        game.gameArray[col] = [];
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            do {
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
    return donutAt(col, row).donutNumber === donutAt(col - 1, row).donutNumber && donutAt(col, row).donutNumber === donutAt(col - 2, row).donutNumber;
}

function isVerticalMatch(col, row) {
    return donutAt(col, row).donutNumber === donutAt(col, row - 1).donutNumber && donutAt(col, row).donutNumber === donutAt(col, row - 2).donutNumber;
}

function donutAt(col, row) {
    if (row < 0 || row >= gameOptions.fieldHeight || col < 0 || col >= gameOptions.fieldWidth) {
        return -1;
    }
    return game.gameArray[col][row];
}

function areNext(donut1, donut2) {
    return Math.abs(getDonutRow(donut1) - getDonutRow(donut2)) + Math.abs(getDonutCol(donut1) - getDonutCol(donut2)) == 1;
}

function areTheSame(donut1, donut2) {
    return getDonutRow(donut1) == getDonutRow(donut2) && getDonutCol(donut1) == getDonutCol(donut2);
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

function handleMatches() {
    game.removeMap = [];
    for (let i = 0; i < gameOptions.fieldWidth; i++) {
        game.removeMap[i] = [];
        for (let j = 0; j < gameOptions.fieldHeight; j++) {
            game.removeMap[i].push(0);
        }
    }
    checkMatches(HORIZONTAL);
    checkMatches(VERTICAL);
    destroyDonuts();
    game.canPick = true;
}

function checkMatches(direction) {
    let firstIterationSize = gameOptions.fieldWidth;
    let secondIterationSize = gameOptions.fieldHeight;
    if (direction === HORIZONTAL) {
        firstIterationSize = gameOptions.fieldHeight;
        secondIterationSize = gameOptions.fieldWidth;
    }

    for (let i = 0; i < firstIterationSize; i++) {
        let numberStreak = 1;
        let currentNumber = -1;
        let startStreak = 0;
        let donutToWatch = null;
        for (let j = 0; j < secondIterationSize; j++) {
            direction === HORIZONTAL ? donutToWatch = donutAt(i, j) : donutToWatch = donutAt(j, i);
            if (donutToWatch.donutNumber === currentNumber) {
                numberStreak++;
            }
            if (donutToWatch.donutNumber !== currentNumber || j === gameOptions.fieldWidth - 1) {
                if (numberStreak >= 3) {
                    console.log("HORIZONTAL :: Length = " + numberStreak + " :: Start = (" + i + "," + startStreak + ") :: number = " + currentNumber);
                    for (let k = 0; k < numberStreak; k++) {
                        direction === HORIZONTAL ? game.removeMap[i][startStreak + k]++ : game.removeMap[startStreak + k][i]++;
                    }
                }
                startStreak = j;
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
            if (game.removeMap[col][row] > 0) {
                let destroyTween = game.add.tween(game.gameArray[col][row].donutSprite).to({
                    alpha: 0
                }, gameOptions.destroySpeed, Phaser.Easing.Linear.None, true);
                destroyed++;
                destroyTween.onComplete.add(function (donut) {
                    donut.destroy();
                    destroyed--;
                    if (destroyed === 0) {
                        makeDonutsFall();
                        replenishField();
                    }
                });
                game.gameArray[col][row] = null;
            }
        }
    }
}

function makeDonutsFall() {
    // let fallen = 0;
    // let restart = false;
    for (let col = gameOptions.fieldWidth - 2; col >= 0; col--) {
        for (let row = 0; row < gameOptions.fieldHeight; row++) {
            if (game.gameArray[col][row] != null) {
                let holesBelow = getHolesBelow(col, row);
                if (holesBelow > 0) {
                    let donutOverHoles = game.gameArray[col][row].donutSprite;
                    let donut2Tween = game.add.tween(donutOverHoles).to({
                        y: donutOverHoles.position.y + holesBelow * gameOptions.donutHeight
                    }, gameOptions.fallSpeed, Phaser.Easing.Linear.None, true);
                    donut2Tween.onComplete.add(function () {
                    });
                    game.gameArray[col][row + holesBelow] = {
                        donutSprite: game.gameArray[col][row].donutSprite,
                        donutNumber: game.gameArray[col][row].donutNumber
                    };
                    game.gameArray[col][row] = null;
                    makeDonutsFall();
                }
            }
        }
    }
    replenishField();
}

function replenishField() {
    let replenished = 0;
    let restart = false;
    for (let col = 0; col < gameOptions.fieldWidth; col++) {
        let holesInCol = getHolesInCol(col);
        if (holesInCol > 0) {
            for (let row = 0; row < holesInCol; row++) {
                // var orb = game.add.sprite(orbSize * j + orbSize / 2, - (orbSize * (emptySpots - 1 - i) + orbSize / 2), "orbs");
                let randomNumber = game.math.between(0, gameOptions.donutTypes - 1);
                let donut = game.donutGroup.create(gameOptions.donutWidth * col, gameOptions.donutHeight * row, "donut" + randomNumber);
                // donut.anchor.set(0.5);
                // orbGroup.add(donut);
                // donut.frame = randomColor;
                game.gameArray[col][row] = {
                    donutNumber: randomNumber,
                    donutSprite: donut
                };
                // var orb2Tween = game.add.tween(game.gameArray[col][row].donutSprite).to({
                //     y: gameOptions.donutHeight * row
                // }, gameOptions.fallSpeed, Phaser.Easing.Linear.None, true);
                // replenished++;
                // orb2Tween.onComplete.add(function () {
                    replenished--;
                    if (replenished === 0) {
                        if (restart) {
                            makeDonutsFall();
                        } else {
                            if (matchInBoard()) {
                                game.time.events.add(250, handleMatches);
                            } else {
                                game.canPick = true;
                                selectedOrb = null;
                            }
                        }
                    }
                // })
            }
        }
    }
}

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


