let gameOptions = {
    fieldWidth: 13,
    fieldHeight: 11,
    gemTypes: 12,
    gemWidth: 100,
    gemHeight: 87,
    swapSpeed: 200,
    fallSpeed: 100,
    destroySpeed: 200
};

var start = {};
start.state1 = function () {
};
start.state1.prototype = {
    preload: function () {
        game.load.image("background", "../resources/images/backgrounds/background.jpg");
        for (let i = 1; i <= gameOptions.gemTypes; i++) {
            game.load.image('gem' + i, '../resources/images/game/gem-' + i + '.png');
        }
    },
    create: function () {
        game.stage.backgroundColor = '#ffffff';
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        let background = game.add.sprite(game.world.centerX, game.world.centerY, "background");
        background.anchor.setTo(0.5, 0.5);
        drawField();
        game.canPick = true;
        game.selectedGem = null;
        game.gemGroup.onChildInputDown.add(gemSelect, this);
    },
    update: function () {
    }
};

function gemSelect(pointer) {
    if (!game.canPick) return;
    //     this.dragging = true;
    let row = Math.floor(pointer.position.y / gameOptions.gemHeight);
    let col = Math.floor(pointer.position.x / gameOptions.gemWidth);
    let pickedGem = gemAt(row, col);
    if (pickedGem !== -1) {
        if (game.selectedGem == null) {
            pickedGem.gemSprite.scale.setTo(1.2);
            pickedGem.gemSprite.bringToTop();
            game.selectedGem = pickedGem;
        } else {
            if (areTheSame(pickedGem, game.selectedGem)) {
                pickedGem.gemSprite.scale.setTo(1);
                game.selectedGem = null;
            } else {
                if (areNext(pickedGem, game.selectedGem)) {
                    game.selectedGem.gemSprite.scale.setTo(1);
                    swapGems(game.selectedGem, pickedGem, true);
                } else {
                    game.selectedGem.gemSprite.scale.setTo(1);
                    pickedGem.gemSprite.scale.setTo(1.2);
                    game.selectedGem = pickedGem;
                }
            }
        }
    }
}


function drawField() {
    game.gameArray = [];
    game.poolArray = [];
    game.gemGroup = game.add.group();
    game.gemGroup.inputEnableChildren = true;
    for (let i = 0; i < gameOptions.fieldHeight; i++) {
        game.gameArray[i] = [];
        for (let j = 0; j < gameOptions.fieldWidth; j++) {
            do {
                let randomNumber = game.math.between(1, gameOptions.gemTypes);
                // let gem = game.add.sprite(gameOptions.gemWidth * j, gameOptions.gemHeight * i, "gem" + randomColor);
                // game.gemGroup.create(gem);
                let gem = game.gemGroup.create(gameOptions.gemWidth * j, gameOptions.gemHeight * i, "gem" + randomNumber);
                game.gameArray[i][j] = {
                    gemNumber: randomNumber,
                    gemSprite: gem,
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
    return gemAt(row, col).gemNumber == gemAt(row, col - 1).gemNumber && gemAt(row, col).gemNumber == gemAt(row, col - 2).gemNumber;
}

function isVerticalMatch(row, col) {
    return gemAt(row, col).gemNumber == gemAt(row - 1, col).gemNumber && gemAt(row, col).gemNumber == gemAt(row - 2, col).gemNumber;
}

function gemAt(row, col) {
    if (row < 0 || row >= gameOptions.fieldSize || col < 0 || col >= gameOptions.fieldSize) {
        return -1;
    }
    return game.gameArray[row][col];
}

function areNext(orb1, orb2) {
    return Math.abs(getGemRow(orb1) - getGemRow(orb2)) + Math.abs(getGemCol(orb1) - getGemCol(orb2)) == 1;
}

function areTheSame(orb1, orb2) {
    return getGemRow(orb1) == getGemRow(orb2) && getGemCol(orb1) == getGemCol(orb2);
}

function getGemRow(orb) {
    return Math.floor(orb.gemSprite.y / gameOptions.gemHeight);
}

function getGemCol(orb) {
    return Math.floor(orb.gemSprite.x / gameOptions.gemWidth);
}

function swapGems(gem1, gem2, swapBack) {
    game.canPick = false;

    game.add.tween(gem1.gemSprite).to({
        x: gem2.gemSprite.position.x,
        y: gem2.gemSprite.position.y
    }, gameOptions.swapSpeed, Phaser.Easing.Linear.None, true);
    var orb2Tween = game.add.tween(gem2.gemSprite).to({
        x: gem1.gemSprite.position.x,
        y: gem1.gemSprite.position.y
    }, gameOptions.swapSpeed, Phaser.Easing.Linear.None, true);

    var tempGem1 = Object.assign({}, gem1);
    gem1.gemNumber = gem2.gemNumber;
    gem1.gemSprite = gem2.gemSprite;
    gem2.gemNumber = tempGem1.gemNumber;
    gem2.gemSprite = tempGem1.gemSprite;

    orb2Tween.onComplete.add(function () {
        if (!matchInBoard() && swapBack) {
            game.canPick = true;
            swapGems(gem1, gem2, false);
        } else {
            if (matchInBoard()) {
                handleMatches();
            } else {
                game.canPick = true;
                game.selectedGem = null;
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
    removeMap = [];
    for(var i = 0; i < gameOptions.fieldWidth; i++){
        removeMap[i] = [];
        for(var j = 0; j < gameOptions.fieldHeight; j++){
            removeMap[i].push(0);
        }
    }
    handleHorizontalMatches();
    // handleVerticalMatches();
    // destroyOrbs();
    game.canPick = true;
}

// function handleHorizontalMatches(){
//     for(var i = 0; i < gameOptions.gemWidth; i++){
//         var colorStreak = 1;
//         var currentColor = -1;
//         var startStreak = 0;
//         for(var j = 0; j < fieldSize; j++){
//             if(gemAt(i, j).orbColor == currentColor){
//                 colorStreak ++;
//             }
//             if(gemAt(i, j).orbColor != currentColor || j == fieldSize - 1){
//                 if(colorStreak &gt;= 3){
//                     console.log("HORIZONTAL :: Length = "+colorStreak + " :: Start = ("+i+","+startStreak+") :: Color = "+currentColor);
//                     for(var k = 0; k < colorStreak; k++){
//                         removeMap[i][startStreak + k] ++;
//                     }
//                 }
//                 startStreak = j;
//                 colorStreak = 1;
//                 currentColor = gemAt(i, j).orbColor;
//             }
//         }
//     }
// }

// function handleVerticalMatches(){
//     for(var i = 0; i < fieldSize; i++){
//         var colorStreak = 1;
//         var currentColor = -1;
//         var startStreak = 0;
//         for(var j = 0; j < fieldSize; j++){
//             if(gemAt(j, i).orbColor == currentColor){
//                 colorStreak ++;
//             }
//             if(gemAt(j, i).orbColor != currentColor || j == fieldSize - 1){
//                 if(colorStreak &gt;= 3){
//                     console.log("VERTICAL :: Length = "+colorStreak + " :: Start = ("+startStreak+","+i+") :: Color = "+currentColor);
//                     for(var k = 0; k < colorStreak; k++){
//                         removeMap[startStreak + k][i] ++;
//                     }
//                 }
//                 startStreak = j;
//                 colorStreak = 1;
//                 currentColor = gemAt(j, i).orbColor;
//             }
//         }
//     }
// }

// function destroyOrbs(){
//     var destroyed = 0;
//     for(var i = 0; i < fieldSize; i++){
//         for(var j = 0; j < fieldSize; j++){
//             if(removeMap[i][j]&gt;0){
//                 var destroyTween = game.add.tween(gameArray[i][j].orbSprite).to({
//                     alpha: 0
//                 }, destroySpeed, Phaser.Easing.Linear.None, true);
//                 destroyed ++;
//                 destroyTween.onComplete.add(function(orb){
//                     orb.destroy();
//                     destroyed --;
//                     if(destroyed == 0){
//                         makeOrbsFall();
//                         if(fastFall){
//                             replenishField();
//                         }
//                     }
//                 });
//                 gameArray[i][j] = null;
//             }
//         }
//     }


