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
        this.rack = scene.rack;

        this.previousRow = -1;
        this.previousCol = -1;

        this.racklScale = 0.4;
        this.boardScale = 0.7;

        this.row = -1;
        this.col = -1;
        this.onBoard = false;


        this.pieces = [this];

        this.PIECES_OFFSET = 100 / 0.7;

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

        this.on("drag", (pointer, dragX, dragY) => {
            this.dragging = true;
            if (this.holdTimer) {
                this.holdTimer.remove();
                this.holdTimer = null;
                console.log("Empiezo a mover");
                for (let piece of this.pieces) {
                    piece.movePiece();
                }
            }
            for (let i = 0; i < this.pieces.length; i++) {
                this.pieces[i].x = dragX + i * this.PIECES_OFFSET * (this.onBoard ? this.boardScale : this.racklScale);
                this.pieces[i].y = dragY;
            }
        });

        this.on("dragend", () => {
            if (this.dragging && this.board.tryPlace(this.pieces)) {
                for (let piece of this.pieces) {
                    piece.setScale(this.boardScale);
                    piece.onBoard = true;
                }
            }
            else if (this.dragging && this.rack.tryPlace(this.pieces)) {
                for (let piece of this.pieces) {
                    piece.setScale(this.racklScale);
                    piece.onBoard = false;
                }
            }
            else {
                for (let piece of this.pieces) {
                    piece.goToStart();
                }
            }
            this.dragging = false;
            this.pieces = [this];
        });

        this.on("pointerdown", () => {
            this.dragging = false;
            this.holdTimer = this.scene.time.addEvent({
                delay: 500,
                loop: true,
                callback: () => {
                    let source = this.onBoard ? this.board : this.rack;
                    let scale = this.onBoard ? this.boardScale : this.racklScale;
                    let p = source.getPiece(this.row, this.col + this.pieces.length);
                    if (p) {
                        this.pieces.push(p);
                        if (this.board.isValidGroup(this.pieces)) {
                            p.x = (this.pieces.length - 1) * this.PIECES_OFFSET * scale + this.x;
                            return;
                        }
                        this.pieces.pop();
                    }
                    this.holdTimer.remove();
                    this.holdTimer = null;
                }
            });
        });

        this.on("pointerup", () => {
            if (this.holdTimer) {
                this.holdTimer.remove();
                this.holdTimer = null;
            }
        });

        this.setInteractive();
    }

    goToStart() {
        if (this.onBoard) {
            this.board.alignToGrid(this, this.row, this.col);
        }
        else {
            this.rack.alignToGrid(this, this.row, this.col);
        }
    }

    movePiece() {
        if (this.onBoard) {
            this.board.board[this.row][this.col] = null;
        }
        else {
            this.rack.grid[this.row][this.col] = null;
        }
    }



    sortDragging() {
        if (this.dragging) {
            this.setDepth(this.scene.maxDepth);
        }
    }
}