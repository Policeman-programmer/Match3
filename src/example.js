let game;
let gameOptions = {
    fieldSize: 7,
    gemColors: 6,
    gemSize: 100,
    swapSpeed: 200,
    fallSpeed: 100,
    destroySpeed: 200
};
const HORIZONTAL = 1;
const VERTICAL = 2;
window.onload = function () {
    let gameConfig = {
        width: 700,
        height: 700,
        scene: playGame,
    };
    game = new Phaser.Game(gameConfig);
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    preload() {
        this.load.spritesheet("gems", "../resourses/sprites/gems.png", {
            frameWidth: gameOptions.gemSize,
            frameHeight: gameOptions.gemSize
        });
    }

    create() {
        this.canPick = true;
        this.dragging = false;
        this.drawField();
        this.selectedGem = null;
        this.input.on("pointerdown", this.gemSelect, this);
        this.input.on("pointermove", this.startSwipe, this);
        this.input.on("pointerup", this.stopSwipe, this);
        let background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);
    }

    drawField() {
        this.gameArray = [];
        this.poolArray = [];
        this.gemGroup = this.add.group();
        for (let i = 0; i < gameOptions.fieldSize; i++) {
            this.gameArray[i] = [];
            for (let j = 0; j < gameOptions.fieldSize; j++) {
                let gem = this.add.sprite(gameOptions.gemSize * j + gameOptions.gemSize / 2, gameOptions.gemSize * i + gameOptions.gemSize / 2, "gems");
                this.gemGroup.add(gem);
                do {
                    let randomColor = Phaser.Math.Between(0, gameOptions.gemColors - 1);
                    gem.setFrame(randomColor);
                    this.gameArray[i][j] = {
                        gemNumber: randomColor,
                        gemSprite: gem,
                        isEmpty: false
                    }
                } while (this.isMatch(i, j));
            }
        }
    }

    isMatch(row, col) {
        return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col);
    }

    isHorizontalMatch(row, col) {
        return this.gemAt(row, col).gemNumber == this.gemAt(row, col - 1).gemNumber && this.gemAt(row, col).gemNumber == this.gemAt(row, col - 2).gemNumber;
    }

    isVerticalMatch(row, col) {
        return this.gemAt(row, col).gemNumber == this.gemAt(row - 1, col).gemNumber && this.gemAt(row, col).gemNumber == this.gemAt(row - 2, col).gemNumber;
    }

    gemAt(row, col) {
        if (row < 0 || row >= gameOptions.fieldSize || col < 0 || col >= gameOptions.fieldSize) {
            return -1;
        }
        return this.gameArray[row][col];
    }

    gemSelect(pointer) {
        if (this.canPick) {
            this.dragging = true;
            let row = Math.floor(pointer.y / gameOptions.gemSize);
            let col = Math.floor(pointer.x / gameOptions.gemSize);
            let pickedGem = this.gemAt(row, col)
            if (pickedGem != -1) {
                if (this.selectedGem == null) {
                    pickedGem.gemSprite.setScale(1.2);
                    pickedGem.gemSprite.setDepth(1);
                    this.selectedGem = pickedGem;
                } else {
                    if (this.areTheSame(pickedGem, this.selectedGem)) {
                        this.selectedGem.gemSprite.setScale(1);
                        this.selectedGem = null;
                    } else {
                        if (this.areNext(pickedGem, this.selectedGem)) {
                            this.selectedGem.gemSprite.setScale(1);
                            this.swapGems(this.selectedGem, pickedGem, true);
                        } else {
                            this.selectedGem.gemSprite.setScale(1);
                            pickedGem.gemSprite.setScale(1.2);
                            this.selectedGem = pickedGem;
                        }
                    }
                }
            }
        }
    }

    startSwipe(pointer) {
        if (this.dragging && this.selectedGem != null) {
            let deltaX = pointer.downX - pointer.x;
            let deltaY = pointer.downY - pointer.y;
            let deltaRow = 0;
            let deltaCol = 0;
            if (deltaX > gameOptions.gemSize / 2 && Math.abs(deltaY) < gameOptions.gemSize / 4) {
                deltaCol = -1;
            }
            if (deltaX < -gameOptions.gemSize / 2 && Math.abs(deltaY) < gameOptions.gemSize / 4) {
                deltaCol = 1;
            }
            if (deltaY > gameOptions.gemSize / 2 && Math.abs(deltaX) < gameOptions.gemSize / 4) {
                deltaRow = -1;
            }
            if (deltaY < -gameOptions.gemSize / 2 && Math.abs(deltaX) < gameOptions.gemSize / 4) {
                deltaRow = 1;
            }
            if (deltaRow + deltaCol != 0) {
                let pickedGem = this.gemAt(this.getGemRow(this.selectedGem) + deltaRow, this.getGemCol(this.selectedGem) + deltaCol);
                if (pickedGem != -1) {
                    this.selectedGem.gemSprite.setScale(1);
                    this.swapGems(this.selectedGem, pickedGem, true);
                    this.dragging = false;
                }
            }
        }
    }

    stopSwipe() {
        this.dragging = false;
    }

    areTheSame(gem1, gem2) {
        return this.getGemRow(gem1) == this.getGemRow(gem2) && this.getGemCol(gem1) == this.getGemCol(gem2);
    }

    getGemRow(gem) {
        return Math.floor(gem.gemSprite.y / gameOptions.gemSize);
    }

    getGemCol(gem) {
        return Math.floor(gem.gemSprite.x / gameOptions.gemSize);
    }

    areNext(gem1, gem2) {
        return Math.abs(this.getGemRow(gem1) - this.getGemRow(gem2)) + Math.abs(this.getGemCol(gem1) - this.getGemCol(gem2)) == 1;
    }

    swapGems(gem1, gem2, swapBack) {
        this.swappingGems = 2;
        this.canPick = false;
        let fromColor = gem1.gemNumber;
        let fromSprite = gem1.gemSprite;
        let toColor = gem2.gemNumber;
        let toSprite = gem2.gemSprite;
        let gem1Row = this.getGemRow(gem1);
        let gem1Col = this.getGemCol(gem1);
        let gem2Row = this.getGemRow(gem2);
        let gem2Col = this.getGemCol(gem2);
        this.gameArray[gem1Row][gem1Col].gemNumber = toColor;
        this.gameArray[gem1Row][gem1Col].gemSprite = toSprite;
        this.gameArray[gem2Row][gem2Col].gemNumber = fromColor;
        this.gameArray[gem2Row][gem2Col].gemSprite = fromSprite;
        this.tweenGem(gem1, gem2, swapBack);
        this.tweenGem(gem2, gem1, swapBack);
    }

    tweenGem(gem1, gem2, swapBack) {
        let row = this.getGemRow(gem1);
        let col = this.getGemCol(gem1);
        this.tweens.add({
            targets: this.gameArray[row][col].gemSprite,
            x: col * gameOptions.gemSize + gameOptions.gemSize / 2,
            y: row * gameOptions.gemSize + gameOptions.gemSize / 2,
            duration: gameOptions.swapSpeed,
            callbackScope: this,
            onComplete: function () {
                this.swappingGems--;
                if (this.swappingGems == 0) {
                    if (!this.matchInBoard() && swapBack) {
                        this.swapGems(gem1, gem2, false);
                    } else {
                        if (this.matchInBoard()) {
                            this.handleMatches();
                        } else {
                            this.canPick = true;
                            this.selectedGem = null;
                        }
                    }
                }
            }
        });
    }

    matchInBoard() {
        for (let i = 0; i < gameOptions.fieldSize; i++) {
            for (let j = 0; j < gameOptions.fieldSize; j++) {
                if (this.isMatch(i, j)) {
                    return true;
                }
            }
        }
        return false;
    }

    handleMatches() {
        this.removeMap = [];
        for (let i = 0; i < gameOptions.fieldSize; i++) {
            this.removeMap[i] = [];
            for (let j = 0; j < gameOptions.fieldSize; j++) {
                this.removeMap[i].push(0);
            }
        }
        this.markMatches(HORIZONTAL);
        this.markMatches(VERTICAL);
        this.destroyGems();
    }

    markMatches(direction) {
        for (let i = 0; i < gameOptions.fieldSize; i++) {
            let colorStreak = 1;
            let currentColor = -1;
            let startStreak = 0;
            let colorToWatch = 0;
            for (let j = 0; j < gameOptions.fieldSize; j++) {
                if (direction == HORIZONTAL) {
                    colorToWatch = this.gemAt(i, j).gemNumber;
                } else {
                    colorToWatch = this.gemAt(j, i).gemNumber;
                }
                if (colorToWatch == currentColor) {
                    colorStreak++;
                }
                if (colorToWatch != currentColor || j == gameOptions.fieldSize - 1) {
                    if (colorStreak >= 3) {
                        if (direction == HORIZONTAL) {
                            console.log("HORIZONTAL :: Length = " + colorStreak + " :: Start = (" + i + "," + startStreak + ") :: Color = " + currentColor);
                        } else {
                            console.log("VERTICAL :: Length = " + colorStreak + " :: Start = (" + startStreak + "," + i + ") :: Color = " + currentColor);
                        }
                        for (let k = 0; k < colorStreak; k++) {
                            if (direction == HORIZONTAL) {
                                this.removeMap[i][startStreak + k]++;
                            } else {
                                this.removeMap[startStreak + k][i]++;
                            }
                        }
                    }
                    startStreak = j;
                    colorStreak = 1;
                    currentColor = colorToWatch;
                }
            }
        }
    }

    destroyGems() {
        let destroyed = 0;
        for (let i = 0; i < gameOptions.fieldSize; i++) {
            for (let j = 0; j < gameOptions.fieldSize; j++) {
                if (this.removeMap[i][j] > 0) {
                    destroyed++;
                    this.tweens.add({
                        targets: this.gameArray[i][j].gemSprite,
                        alpha: 0.5,
                        duration: gameOptions.destroySpeed,
                        callbackScope: this,
                        onComplete: function () {
                            destroyed--;
                            this.gameArray[i][j].gemSprite.visible = false;
                            this.poolArray.push(this.gameArray[i][j].gemSprite);
                            if (destroyed == 0) {
                                this.makeGemsFall();
                                this.replenishField();
                            }
                        }
                    });
                    this.gameArray[i][j].isEmpty = true;
                }
            }
        }
    }

    makeGemsFall() {
        for (let i = gameOptions.fieldSize - 2; i >= 0; i--) {
            for (let j = 0; j < gameOptions.fieldSize; j++) {
                if (!this.gameArray[i][j].isEmpty) {
                    let fallTiles = this.holesBelow(i, j);
                    if (fallTiles > 0) {
                        this.tweens.add({
                            targets: this.gameArray[i][j].gemSprite,
                            y: this.gameArray[i][j].gemSprite.y + fallTiles * gameOptions.gemSize,
                            duration: gameOptions.fallSpeed * fallTiles
                        });
                        this.gameArray[i + fallTiles][j] = {
                            gemSprite: this.gameArray[i][j].gemSprite,
                            gemNumber: this.gameArray[i][j].gemNumber,
                            isEmpty: false
                        }
                        this.gameArray[i][j].isEmpty = true;
                    }
                }
            }
        }
    }

    holesBelow(row, col) {
        let result = 0;
        for (let i = row + 1; i < gameOptions.fieldSize; i++) {
            if (this.gameArray[i][col].isEmpty) {
                result++;
            }
        }
        return result;
    }

    replenishField() {
        let replenished = 0;
        for (let j = 0; j < gameOptions.fieldSize; j++) {
            let emptySpots = this.holesInCol(j);
            if (emptySpots > 0) {
                for (let i = 0; i < emptySpots; i++) {
                    replenished++;
                    let randomColor = Phaser.Math.Between(0, gameOptions.gemColors - 1);
                    this.gameArray[i][j].gemNumber = randomColor;
                    this.gameArray[i][j].gemSprite = this.poolArray.pop()
                    this.gameArray[i][j].gemSprite.setFrame(randomColor);
                    this.gameArray[i][j].gemSprite.visible = true;
                    this.gameArray[i][j].gemSprite.x = gameOptions.gemSize * j + gameOptions.gemSize / 2;
                    this.gameArray[i][j].gemSprite.y = gameOptions.gemSize / 2 - (emptySpots - i) * gameOptions.gemSize;
                    this.gameArray[i][j].gemSprite.alpha = 1;
                    this.gameArray[i][j].isEmpty = false;
                    this.tweens.add({
                        targets: this.gameArray[i][j].gemSprite,
                        y: gameOptions.gemSize * i + gameOptions.gemSize / 2,
                        duration: gameOptions.fallSpeed * emptySpots,
                        callbackScope: this,
                        onComplete: function () {
                            replenished--;
                            if (replenished == 0) {
                                if (this.matchInBoard()) {
                                    this.time.addEvent({
                                        delay: 250,
                                        callback: this.handleMatches()
                                    });
                                } else {
                                    this.canPick = true;
                                    this.selectedGem = null;
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    holesInCol(col) {
        var result = 0;
        for (let i = 0; i < gameOptions.fieldSize; i++) {
            if (this.gameArray[i][col].isEmpty) {
                result++;
            }
        }
        return result;
    }
}

function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    } else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
