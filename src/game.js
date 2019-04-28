window.onload = function () {

    //  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
    //  Although it will work fine with this tutorial, it's almost certainly not the most current version.
    //  Be sure to replace it with an updated version before you start experimenting with adding your own code.

var game = new Phaser.Game(1280, 960, Phaser.AUTO, '', {preload: preload, create: create});

    function preload() {

        game.load.image('background', './resourses/images/backgrounds/background.jpg');
        game.load.image('gem01', './resourses/images/game/gem-01.png');
        game.load.image('gem02', './resourses/images/game/gem-02.png');
        game.load.image('gem03', './resourses/images/game/gem-03.png');
        game.load.image('gem04', './resourses/images/game/gem-04.png');
        game.load.image('gem05', './resourses/images/game/gem-05.png');
        game.load.image('gem06', './resourses/images/game/gem-06.png');
        game.load.image('gem07', './resourses/images/game/gem-07.png');
        game.load.image('gem08', './resourses/images/game/gem-08.png');
        game.load.image('gem09', './resourses/images/game/gem-09.png');
        game.load.image('gem10', './resourses/images/game/gem-10.png');
        game.load.image('gem11', './resourses/images/game/gem-11.png');
        game.load.image('gem12', './resourses/images/game/gem-12.png');

    }

    function create() {

        var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        logo.anchor.setTo(0.5, 0.5);

    }

};
