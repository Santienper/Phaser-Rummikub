import Piece from "../objects/piece";
import Board from "../objects/board"

export default class Test extends Phaser.Scene {
    constructor() {
        super({ key: "test" });
    }

    preload() {
        this.load.setPath('/.proxy/assets');

        this.load.image("YIPEE", "YIPEE.png");

        this.load.image("background", "background.png");
        this.load.image("handBg", "handBg.png");
        this.load.image("piece", "piece.png");
        this.load.image("wildcardIcon", "wildcard.png");
    }

    create() {
        this.CANVAS_WIDTH = this.sys.canvas.width;
        this.CANVAS_HEIGHT = this.sys.game.canvas.height;

        let bg = this.add.image(0, 0, "background").setOrigin(0, 0);

        // Test
        let sprite = this.add.image(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2, "YIPEE");
        sprite.setInteractive({ draggable: true });
        sprite.on("drag", (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
        });

        this.SORT_SENSITIVITY = {
            x: 10,
            y: 10
        }
        this.maxDepth = this.CANVAS_HEIGHT + 1;
        this.board = new Board(this, 3, 12, 120, 150, 75, 75);

        let handBg = this.add.image(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT, "handBg").setOrigin(0.5, 1);
        let piece = new Piece(this, 100, 100, 12, Piece.Colors.Red);


        let piece2 = new Piece(this, 100, 100, 0, Piece.Colors.Red);
        let piece3 = new Piece(this, 100, 100, 12, Piece.Colors.Black);
        let piece4 = new Piece(this, 100, 100, 12, Piece.Colors.Blue);
        let piece5 = new Piece(this, 100, 100, 11, Piece.Colors.Red);
        let piece6 = new Piece(this, 100, 100, 10, Piece.Colors.Red);
        let piece7 = new Piece(this, 100, 100, 13, Piece.Colors.Red);


        this.input.keyboard.on('keydown-SPACE', () => {
            let text = "";
            let matriz = this.board.board;
            for (let i = 0; i < matriz.length; i++) {
                for (let j = 0; j < matriz[i].length; j++) {
                    if (matriz[i][j]) text += matriz[i][j].number + " ";
                    else text += "_ "
                }
                text += "\n";   // salto de línea al terminar la fila
            }

            console.log(text)
        });


    }

    update(t, dt) {
        super.update(t, dt);
        const objects = this.children.list.filter(obj => obj.active);
        objects.forEach((obj, index) => {
            if (obj.sortDragging) {
                obj.setDepth(0);
                const yFactor = Math.floor(obj.y / this.SORT_SENSITIVITY.x);
                const xFactor = Math.floor(obj.x / this.SORT_SENSITIVITY.y);

                const baseDepth = yFactor + xFactor;
                obj.setDepth(baseDepth + index * 0.1);

                obj.sortDragging();
            }
        });
    }

}
