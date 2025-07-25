export default class Test extends Phaser.Scene {
    constructor() {
        super({ key: 'test' });
    }

    preload() {
        this.load.setPath('/.proxy/assets');
        this.load.image('YIPEE', 'YIPEE.png');
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        var sprite = this.add.image(width / 2, height / 2, 'YIPEE');
    }
}
