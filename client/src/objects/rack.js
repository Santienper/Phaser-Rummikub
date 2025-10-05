import Grid from "./grid";
export default class Rack extends Grid {
    constructor(scene, cellWidth, cellHeight, offsetX, offsetY) {
        super(scene, 2, 10, 2, 30, cellWidth, cellHeight, offsetX, offsetY);
        this.scene = scene;
        this.scene.add.existing(this);

        this.posX = this.offsetX + this.cols * this.cellWidth / 2.0;
        this.posY = this.offsetY + this.cellHeight;

        this.handBgImg = this.scene.add.image(this.posX, this.posY, "handBg");
        this.drawMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight, this.offsetX, this.offsetY);
    }

    // Convierte (row, col) a índice lineal
    toIndex(row, col) {
        return row * this.cols + col;
    }

    // Convierte índice lineal a (row, col)
    toCoord(index) {
        return [Math.floor(index / this.cols), index % this.cols];
    }

    alignToGrid(piece, row, col) {
        this.grid[row][col] = piece;
        piece.row = row;
        piece.col = col;
        piece.onBoard = false;
        piece.setScale(piece.racklScale);
        piece.x = this.offsetX + col * this.cellWidth + this.cellWidth / 2;
        piece.y = this.offsetY + row * this.cellHeight + this.cellHeight / 2;
    }

    placePieces(row, col, pieces) {
        const startIndex = this.toIndex(row, col);
        const length = pieces.length;

        // Reservar espacio y guardar las piezas
        let displaced = [];
        for (let i = 0; i < length; i++) {
            let idx = (startIndex + i) % (this.rows * this.cols);
            let [r, c] = this.toCoord(idx);
            if (this.grid[r][c] !== null) {
                displaced.push(this.grid[r][c]);
            }
            this.grid[r][c] = null;
        }

        // Colocar las piezas nuevas
        for (let i = 0; i < length; i++) {
            let idx = (startIndex + i) % (this.rows * this.cols);
            let [r, c] = this.toCoord(idx);
            this.alignToGrid(pieces[i], r, c);
        }

        // Recolocar las desplazadas hacia adelante
        let cont = 0;
        let idx = (startIndex + length) % (this.rows * this.cols);
        while (displaced.length > 0 && cont < this.rows * this.cols) {
            let [r, c] = this.toCoord(idx);
            if (this.grid[r][c] === null) {
                this.alignToGrid(displaced.shift(), r, c);
            }
            idx = (idx + 1) % (this.rows * this.cols);
            cont++;
        }

        if (displaced.length > 0) {
            console.warn("No hay suficiente espacio para recolocar todas las piezas desplazadas.");
        }
    }

    tryPlace(pieces) {
        let piece = pieces[0];
        let col = Math.floor((piece.x - this.offsetX) / this.cellWidth);
        let row = Math.floor((piece.y - this.offsetY) / this.cellHeight);
        if (
            row >= 0 && row < this.rows &&
            col >= 0 && col < this.cols
        ) {
            this.placePieces(row, col, pieces);
            return true;
        }
        return false;
    }

    addPiece(piece) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === null) {
                    this.alignToGrid(piece, r, c);
                    return true;
                }
            }
        }
        console.warn("No hay espacio libre en la mano");
        return false;
    }

}