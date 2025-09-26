import { setInteractive } from "../utils";

export default class Piece extends Phaser.GameObjects.Container {
    static Colors = {
        Red: "#be0407",
        Blue: "#0039ff",
        Yellow: "#f38331",
        Black: "#000000ff",
    }

    constructor(scene, x, y, number, color) {
        super(scene, x, y);
        this.scene = scene;
        this.scene.add.existing(this);

        this.comodin = number === 0;
        this.number = number;
        this.color = color;

        this.board = scene.board;
        this.startX = x;
        this.startY = y;
        this.initialScale = 0.6;
        this.boardScale = 0.7;

        this.row = -1;
        this.col = -1;
        this.onBoard = false;

        const DEFAULT_SCALE = 0.8;
        this.setScale(DEFAULT_SCALE);

        const WILDCARD_IMG_SCALE = 0.12;
        const TEXT_OFFSET = {
            x: -2,
            y: -25
            // x: -12,
            // y: -31
        };
        const TEXT_CONFIG = {
            fontFamily: "Arial",
            fontSize: 70,
            fontStyle: "bold",
            color: color,
            // stroke: "#ffffffff",
            // strokeThickness: 5,
            align: "center"
        };

        this.pieceImg = scene.add.image(0, 0, "piece");
        this.numberText = null;
        if (this.number == 0) {
            this.numberText = scene.add.image(this.pieceImg.x + TEXT_OFFSET.x, this.pieceImg.y + TEXT_OFFSET.y, "wildcardIcon").setOrigin(0.5, 0.5).setScale(WILDCARD_IMG_SCALE);
        }
        else {
            this.numberText = scene.add.text(this.pieceImg.x + TEXT_OFFSET.x, this.pieceImg.y + TEXT_OFFSET.y, this.number, TEXT_CONFIG).setOrigin(0.5, 0.5);
        }

        this.add(this.pieceImg);
        this.add(this.numberText);


        let dims = this.getBounds();
        this.setSize(dims.width, dims.height);

        let rectangle = new Phaser.Geom.Rectangle(dims.x + dims.width / 2 - this.x, dims.y + dims.height / 2 - this.y,
            dims.width, dims.height);

        setInteractive(this, {
            hitArea: rectangle,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true
        });

        this.dragging = false;

        this.on("dragstart", (pointer, dragX, dragY) => {
            this.dragging = true;
            if (this.onBoard) {
                this.board.board[this.row][this.col] = null;
            }
        });

        this.on("drag", (pointer, dragX, dragY) => {
            this.dragging = true;
            this.x = dragX;
            this.y = dragY;
        });

        this.on("dragend", () => {
            this.dragging = false;
            let l = [this];
            if (this.board.tryPlace(l)) {
                this.setScale(this.boardScale);
                this.onBoard = true;
            } else {
                this.goToStart();
            }
        });

        this.setInteractive();
    }

    goToStart() {
        this.x = this.startX;
        this.y = this.startY;
        this.setScale(this.initialScale);
    }



    sortDragging() {
        if (this.dragging) {
            this.setDepth(this.scene.maxDepth);
        }
    }
}