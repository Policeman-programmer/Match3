
var state = {},
    button;

state.startState = function () {};
state.startState.prototype = {
    preload: function () {
        game.load.image("background", "./resources/images/backgrounds/background.jpg");
        game.load.image("btn-play", "./resources/images/btn-play.png");
        game.load.image("donuts", "./resources/images/donuts_logo.png");
    },
    create: function () {
        game.stage.backgroundColor = '#f8fffd';
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.add.sprite(0, 0, "background");
        game.add.sprite(game.world.centerX, game.world.centerY/2, "donuts").anchor.setTo(0.5, 0.5);
        game.add.button(game.world.centerX - 130, 400, 'btn-play', actionOnClick, this, 2, 1, 0);
    },
    update: function () {

    }
};

function actionOnClick () {
    game.state.start('gameState');
}
