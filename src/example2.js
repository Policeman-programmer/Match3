var game;
var fieldSize = 7;
var orbColors = 6;
var orbSize = 100;
//
var swapSpeed = 200;
var fallSpeed = 1000;
var destroySpeed = 500;
var fastFall = true;
//
var gameArray = [];
var removeMap = [];
var orbGroup;
var selectedOrb;
var canPick = true;

window.onload = function() {
    game = new Phaser.Game(700, 700);
    game.state.add("PlayGame", playGame)
    game.state.start("PlayGame");
}

var playGame = function(game){}
playGame.prototype = {
    preload: function(){
        game.load.spritesheet("orbs", "assets/sprites/orbs.png", orbSize, orbSize);
    },
    create: function(){
        drawField();
        canPick = true;
        game.input.onDown.add(orbSelect);
        game.input.onUp.add(orbDeselect);
    }
}

function drawField(){
    orbGroup = game.add.group();
    for(var i = 0; i < fieldSize; i ++){
        gameArray[i] = [];
        for(var j = 0; j < fieldSize; j ++){
            var orb = game.add.sprite(orbSize * j + orbSize / 2, orbSize * i + orbSize / 2, "orbs");
            orb.anchor.set(0.5);
            orbGroup.add(orb);
            do{
                var randomColor = game.rnd.between(0, orbColors - 1);
                orb.frame = randomColor;
                gameArray[i][j] = {
                    orbColor: randomColor,
                    donutSprite: orb
                }
            } while(isMatch(i, j));
        }
    }
    selectedOrb = null;
}

function orbSelect(e){
    if(canPick){
        var row = Math.floor(e.clientY / orbSize);
        var col = Math.floor(e.clientX / orbSize);
        var pickedOrb = gemAt(row, col)
        if(pickedOrb != -1){
            if(selectedOrb == null){
                pickedOrb.donutSprite.scale.setTo(1.2);
                pickedOrb.donutSprite.bringToTop();
                selectedOrb = pickedOrb;
                game.input.addMoveCallback(orbMove);
            }
            else{
                if(areTheSame(pickedOrb, selectedOrb)){
                    selectedOrb.donutSprite.scale.setTo(1);
                    selectedOrb = null;
                }
                else{
                    if(areNext(pickedOrb, selectedOrb)){
                        selectedOrb.donutSprite.scale.setTo(1);
                        swapOrbs(selectedOrb, pickedOrb, true);
                    }
                    else{
                        selectedOrb.donutSprite.scale.setTo(1);
                        pickedOrb.donutSprite.scale.setTo(1.2);
                        selectedOrb = pickedOrb;
                        game.input.addMoveCallback(orbMove);
                    }
                }
            }
        }
    }
}

function orbDeselect(e){
    game.input.deleteMoveCallback(orbMove);
}

function orbMove(event, pX, pY){
    if(event.id == 0){
        var distX = pX - selectedOrb.donutSprite.x;
        var distY = pY - selectedOrb.donutSprite.y;
        var deltaRow = 0;
        var deltaCol = 0;
        if(Math.abs(distX) &gt; orbSize / 2){
            if(distX &gt; 0){
                deltaCol = 1;
            }
            else{
                deltaCol = -1;
            }
        }
        else{
            if(Math.abs(distY) &gt; orbSize / 2){
                if(distY &gt; 0){
                    deltaRow = 1;
                }
                else{
                    deltaRow = -1;
                }
            }
        }
        if(deltaRow + deltaCol != 0){
            var pickedOrb = gemAt(getOrbRow(selectedOrb) + deltaRow, getOrbCol(selectedOrb) + deltaCol);
            if(pickedOrb != -1){
                selectedOrb.donutSprite.scale.setTo(1);
                swapOrbs(selectedOrb, pickedOrb, true);
                game.input.deleteMoveCallback(orbMove);
            }
        }
    }
}

function swapOrbs(orb1, orb2, swapBack){
    canPick = false;
    var fromColor = orb1.orbColor;
    var fromSprite = orb1.donutSprite;
    var toColor = orb2.orbColor;
    var toSprite = orb2.donutSprite;
    gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbColor = toColor;
    gameArray[getOrbRow(orb1)][getOrbCol(orb1)].donutSprite = toSprite;
    gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbColor = fromColor;
    gameArray[getOrbRow(orb2)][getOrbCol(orb2)].donutSprite = fromSprite;
    var orb1Tween = game.add.tween(gameArray[getOrbRow(orb1)][getOrbCol(orb1)].donutSprite).to({
        x: getOrbCol(orb1) * orbSize + orbSize / 2,
        y: getOrbRow(orb1) * orbSize + orbSize / 2
    }, swapSpeed, Phaser.Easing.Linear.None, true);
    var orb2Tween = game.add.tween(gameArray[getOrbRow(orb2)][getOrbCol(orb2)].donutSprite).to({
        x: getOrbCol(orb2) * orbSize + orbSize / 2,
        y: getOrbRow(orb2) * orbSize + orbSize / 2
    }, swapSpeed, Phaser.Easing.Linear.None, true);
    orb2Tween.onComplete.add(function(){
        if(!matchInBoard() &amp;&amp; swapBack){
            swapOrbs(orb1, orb2, false);
        }
        else{
            if(matchInBoard()){
                handleMatches();
            }
            else{
                canPick = true;
                selectedOrb = null;
            }
        }
    });
}

function areNext(orb1, orb2){
    return Math.abs(getOrbRow(orb1) - getOrbRow(orb2)) + Math.abs(getOrbCol(orb1) - getOrbCol(orb2)) == 1;
}

function areTheSame(orb1, orb2){
    return getOrbRow(orb1) == getOrbRow(orb2) &amp;&amp; getOrbCol(orb1) == getOrbCol(orb2);
}

function gemAt(row, col){
    if(row < 0 || row >= fieldSize || col < 0 || col &gt;= fieldSize){
        return -1;
    }
    return gameArray[row][col];
}

function getOrbRow(orb){
    return Math.floor(orb.donutSprite.y / orbSize);
}

function getOrbCol(orb){
    return Math.floor(orb.donutSprite.x / orbSize);
}

function isHorizontalMatch(row, col){
    return gemAt(row, col).orbColor == gemAt(row, col - 1).orbColor &amp;&amp; gemAt(row, col).orbColor == gemAt(row, col - 2).orbColor;
}

function isVerticalMatch(row, col){
    return gemAt(row, col).orbColor == gemAt(row - 1, col).orbColor &amp;&amp; gemAt(row, col).orbColor == gemAt(row - 2, col).orbColor;
}

function isMatch(row, col){
    return isHorizontalMatch(row, col) || isVerticalMatch(row, col);
}

function matchInBoard(){
    for(var i = 0; i < fieldSize; i++){
        for(var j = 0; j < fieldSize; j++){
            if(isMatch(i, j)){
                return true;
            }
        }
    }
    return false;
}

function handleMatches(){
    removeMap = [];
    for(var i = 0; i < fieldSize; i++){
        removeMap[i] = [];
        for(var j = 0; j < fieldSize; j++){
            removeMap[i].push(0);
        }
    }
    handleHorizontalMatches();
    handleVerticalMatches();
    destroyOrbs();
}

function handleVerticalMatches(){
    for(var i = 0; i < fieldSize; i++){
        var colorStreak = 1;
        var currentColor = -1;
        var startStreak = 0;
        for(var j = 0; j < fieldSize; j++){
            if(gemAt(j, i).orbColor == currentColor){
                colorStreak ++;
            }
            if(gemAt(j, i).orbColor != currentColor || j == fieldSize - 1){
                if(colorStreak &gt;= 3){
                    console.log("VERTICAL :: Length = "+colorStreak + " :: Start = ("+startStreak+","+i+") :: Color = "+currentColor);
                    for(var k = 0; k < colorStreak; k++){
                        removeMap[startStreak + k][i] ++;
                    }
                }
                startStreak = j;
                colorStreak = 1;
                currentColor = gemAt(j, i).orbColor;
            }
        }
    }
}

function handleHorizontalMatches(){
    for(var i = 0; i < fieldSize; i++){
        var colorStreak = 1;
        var currentColor = -1;
        var startStreak = 0;
        for(var j = 0; j < fieldSize; j++){
            if(gemAt(i, j).orbColor == currentColor){
                colorStreak ++;
            }
            if(gemAt(i, j).orbColor != currentColor || j == fieldSize - 1){
                if(colorStreak &gt;= 3){
                    console.log("HORIZONTAL :: Length = "+colorStreak + " :: Start = ("+i+","+startStreak+") :: Color = "+currentColor);
                    for(var k = 0; k < colorStreak; k++){
                        removeMap[i][startStreak + k] ++;
                    }
                }
                startStreak = j;
                colorStreak = 1;
                currentColor = gemAt(i, j).orbColor;
            }
        }
    }
}

function destroyOrbs(){
    var destroyed = 0;
    for(var i = 0; i < fieldSize; i++){
        for(var j = 0; j < fieldSize; j++){
            if(removeMap[i][j]&gt;0){
                var destroyTween = game.add.tween(gameArray[i][j].donutSprite).to({
                    alpha: 0
                }, destroySpeed, Phaser.Easing.Linear.None, true);
                destroyed ++;
                destroyTween.onComplete.add(function(orb){
                    orb.destroy();
                    destroyed --;
                    if(destroyed == 0){
                        makeOrbsFall();
                        if(fastFall){
                            replenishField();
                        }
                    }
                });
                gameArray[i][j] = null;
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
                    var orb2Tween = game.add.tween(gameArray[i][j].donutSprite).to({
                        y: gameArray[i][j].donutSprite.y + fallTiles * orbSize
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
                        donutSprite: gameArray[i][j].donutSprite,
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

function replenishField(){
    var replenished = 0;
    var restart = false;
    for(var j = 0; j < fieldSize; j++){
        var emptySpots = holesInCol(j);
        if(emptySpots &gt; 0){
            if(!fastFall &amp;&amp; emptySpots &gt; 1){
                emptySpots = 1;
                restart = true;
            }
            for(i = 0; i < emptySpots; i++){
                var orb = game.add.sprite(orbSize * j + orbSize / 2, - (orbSize * (emptySpots - 1 - i) + orbSize / 2), "orbs");
                orb.anchor.set(0.5);
                orbGroup.add(orb);
                var randomColor = game.rnd.between(0, orbColors - 1);
                orb.frame = randomColor;
                gameArray[i][j] = {
                    orbColor: randomColor,
                    donutSprite: orb
                };
                var orb2Tween = game.add.tween(gameArray[i][j].donutSprite).to({
                    y: orbSize * i + orbSize / 2
                }, fallSpeed, Phaser.Easing.Linear.None, true);
                replenished ++;
                orb2Tween.onComplete.add(function(){
                    replenished --;
                    if(replenished == 0){
                        if(restart){
                            makeOrbsFall();
                        }
                        else{
                            if(matchInBoard()){
                                game.time.events.add(250, handleMatches);
                            }
                            else{
                                canPick = true;
                                selectedOrb = null;
                            }
                        }
                    }
                })
            }
        }
    }
}

function holesBelow(row, col){
    let result = 0;
    for(let i = row + 1; i < fieldSize; i++){
        if(gameArray[i][col] == null){
            result ++;
        }
    }
    return result;
}

function holesInCol(col){
    var result = 0;
    for(let i = 0; i < fieldSize; i++){
        if(gameArray[i][col] == null){
            result ++;
        }
    }
    return result;
}
