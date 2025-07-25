import Phaser from "phaser";
import Test from "./scenes/test";

const MAX_W = 1600, MAX_H = 900, MIN_W = 320, MIN_H = 240;

const config = {
    width: MAX_W,
    height: MAX_H,
    backgroundColor: "#000000",
    
    type: Phaser.AUTO,

    scene: [
        Test
    ],

    autoFocus: true,
    disableContextMenu: true,
    render: {
        antialias: true,
        roundPixels: true,
    },
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
        min: {
            width: MIN_W,
            height: MIN_H
        },
        max: {
            width: MAX_W,
            height: MAX_H,
        },
        zoom: 1,
        parent: "game",
    },
};

new Phaser.Game(config);
