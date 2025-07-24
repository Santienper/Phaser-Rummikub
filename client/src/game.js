import Phaser from "phaser";
import Test from "./scenes/test";

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [Test]
};

new Phaser.Game(config);
