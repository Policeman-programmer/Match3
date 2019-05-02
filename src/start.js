let gameOptions = {
    fieldWidth: 13,
    fieldHeight: 11,
    donutTypes: 12,
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
    let row = Math.floor(pointer.position.y / gameOptions.donutHeight);
    let col = Math.floor(pointer.position.x / gameOptions.donutWidth);
    let pickedDonut = donutAt(row, col);
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
    for (let i = 0; i < gameOptions.fieldHeight; i++) {
        game.gameArray[i] = [];
        for (let j = 0; j < gameOptions.fieldWidth; j++) {
            do {
                let randomNumber = game.math.between(1, gameOptions.donutTypes);
                // let donut = game.add.sprite(gameOptions.donutWidth * j, gameOptions.donutHeight * i, "donut" + randomColor);
                // game.donutGroup.create(donut);
                let donut = game.donutGroup.create(gameOptions.donutWidth * j, gameOptions.donutHeight * i, "donut" + randomNumber);
                game.gameArray[i][j] = {
                    donutNumber: randomNumber,
                    donutSprite: donut,
                    isEmpty: false
                };
            } while (isMatch(i, j));
        }
    }
}

function isMatch(row, col) {
    return isHorizontalMatch(row, col) || isVerticalMatch(row, col);
}

function isHorizontalMatch(row, col) {
    return donutAt(row, col).donutNumber == donutAt(row, col - 1).donutNumber && donutAt(row, col).donutNumber == donutAt(row, col - 2).donutNumber;
}

function isVerticalMatch(row, col) {
    return donutAt(row, col).donutNumber == donutAt(row - 1, col).donutNumber && donutAt(row, col).donutNumber == donutAt(row - 2, col).donutNumber;
}

function donutAt(row, col) {
    if (row < 0 || row >= gameOptions.fieldSize || col < 0 || col >= gameOptions.fieldSize) {
        return -1;
    }
    return game.gameArray[row][col];
}

function areNext(orb1, orb2) {
    return Math.abs(getDonutRow(orb1) - getDonutRow(orb2)) + Math.abs(getDonutCol(orb1) - getDonutCol(orb2)) == 1;
}

function areTheSame(orb1, orb2) {
    return getDonutRow(orb1) == getDonutRow(orb2) && getDonutCol(orb1) == getDonutCol(orb2);
}

function getDonutRow(orb) {
    return Math.floor(orb.donutSprite.y / gameOptions.donutHeight);
}

function getDonutCol(orb) {
    return Math.floor(orb.donutSprite.x / gameOptions.donutWidth);
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

function matchInBoard(){
    for(var i = 0; i < gameOptions.fieldHeight; i++){
        for(var j = 0; j < gameOptions.fieldWidth; j++){
            if(isMatch(i, j)){
                return true;
            }
        }
    }
    return false;
}

function handleMatches(){
    game.removeMap = [];
    for(let i = 0; i < gameOptions.fieldWidth; i++){
        game.removeMap[i] = [];
        for(let j = 0; j < gameOptions.fieldHeight; j++){
            game.removeMap[i].push(0);
        }
    }
    checkMatches(HORIZONTAL);
    checkMatches(VERTICAL);
    destroyDonuts();
    game.canPick = true;
}

function checkMatches(direction){
    let firstIterationSize = gameOptions.fieldWidth;
    let secondIterationSize = gameOptions.fieldHeight;
    if(direction === HORIZONTAL){
        firstIterationSize = gameOptions.fieldHeight;
        secondIterationSize = gameOptions.fieldWidth;
    }

    for(let i = 0; i < firstIterationSize; i++){
        let numberStreak = 1;
        let currentNumber = -1;
        let startStreak = 0;
        let donutToWatch = null;
        for(let j = 0; j < secondIterationSize; j++){
            direction === HORIZONTAL ? donutToWatch = donutAt(i, j) : donutToWatch = donutAt(j, i);
            if(donutToWatch.donutNumber === currentNumber){
                numberStreak ++;
            }
            if(donutToWatch.donutNumber !== currentNumber || j === gameOptions.fieldWidth - 1){
                if(numberStreak >= 3){
                    console.log("HORIZONTAL :: Length = "+numberStreak + " :: Start = ("+i+","+startStreak+") :: number = "+currentNumber);
                    for(let k = 0; k < numberStreak; k++){
                        direction === HORIZONTAL ? game.removeMap[i][startStreak + k] ++ : game.removeMap[startStreak + k][i] ++;
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
    for (let i = 0; i < gameOptions.fieldHeight; i++) {
        for (let j = 0; j < gameOptions.fieldWidth; j++) {
            if (game.removeMap[i][j] > 0) {
                let destroyTween = game.add.tween(game.gameArray[i][j].donutSprite).to({
                    alpha: 0
                }, gameOptions.destroySpeed, Phaser.Easing.Linear.None, true);
                destroyed++;
                destroyTween.onComplete.add(function (donut) {
                    donut.destroy();
                    destroyed--;
                    if (destroyed === 0) {
                        makeOrbsFall();
                        // if (fastFall) {
                        //     replenishField();
                        // }
                    }
                });
                game.gameArray[i][j] = null;
            }
        }
    }
}

function makeOrbsFall(){
    var fallen = 0;
    var restart = false;
    for(var i = fieldSize - 2; i &gt;= 0; i--){
        for(var j = 0; j < fieldSize; j++){
            if(gameArray[i][j] != null){
                var fallTiles = holesBelow(i, j);
                if(fallTiles &gt; 0){
                    if(!fastFall &amp;&amp; fallTiles &gt; 1){
                        fallTiles = 1;
                        restart = true;
                    }
                    var orb2Tween = game.add.tween(gameArray[i][j].orbSprite).to({
                        y: gameArray[i][j].orbSprite.y + fallTiles * orbSize
                    }, fallSpeed, Phaser.Easing.Linear.None, true);
                    fallen ++;
                    orb2Tween.onComplete.add(function(){
                        fallen --;
                        if(fallen == 0){
                            if(restart){
                                makeOrbsFall();
                            }
                            else{
                                if(!fastFall){
                                    replenishField();
                                }
                            }
                        }
                    })
                    gameArray[i + fallTiles][j] = {
                        orbSprite: gameArray[i][j].orbSprite,
                        orbColor: gameArray[i][j].orbColor
                    }
                    gameArray[i][j] = null;
                }
            }
        }
    }
    if(fallen == 0){
        replenishField();
    }
}


