import "phaser";

const config: GameConfig = {
    title: "Match 3",
    width: 800,
    height: 600,
    parent: "game",
    backgroundColor: "#18216D"
};

export class Match3 extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.onload = () => {
    var game = new Match3(config);
};

