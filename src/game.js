window.onload = function () {

    var game = new Phaser.Game(1280, 960, Phaser.AUTO, '', {preload: preload, create: create});

    const countOfGems = 12;

    function preload() {

        game.load.image('background', './resourses/images/backgrounds/background.jpg');

        for (let i = 0; i < countOfGems; i++) {
            game.load.image('gem' + i, './resourses/images/game/gem-' + i + '.png');
        }

    }

    function create() {

        var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        logo.anchor.setTo(0.5, 0.5);

    }
};
