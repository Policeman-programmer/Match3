var gameWidth = 1280,
    gameHeight = 960,
    scoreHeight = 228,
    scoreWidth = 529,
    backgroundColor = '#ffab95';

var game = new Phaser.Game(gameWidth, gameHeight + scoreHeight, Phaser.AUTO);
game.state.add('startState', state.startState);
game.state.start('startState');
game.state.add('gameState', state.gameState);



