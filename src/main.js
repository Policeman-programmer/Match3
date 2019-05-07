
var gameWidth = 1280,
    gameHeight = 960;
var game = new Phaser.Game(gameWidth, gameHeight + 150, Phaser.AUTO);
game.state.add('start', start.state1);
game.state.start('start');

