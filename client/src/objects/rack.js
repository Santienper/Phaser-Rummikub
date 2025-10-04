export default class Rack extends Phaser.GameObjects.Container {
    constructor(scene, cellWidth, cellHeight, offsetX, offsetY) {
        super(scene, offsetX, offsetY);
        this.scene = scene;
        this.scene.add.existing(this);

        this.rows = 2;
        this.cols = 10;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.posX = this.offsetX - this.cols * this.cellWidth / 2.0;
        this.posY = this.offsetY - this.cellHeight;

        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));

        this.previousBoard = null;
        this.groupToMove = [];
        this.graphics = scene.add.graphics();

        this.drawMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight, this.posX, this.posY);

        this.handBgImg = this.scene.add.image(0, 0, "handBg").setOrigin(0.5, 0.5);
        this.add(this.handBgImg);

    }

    drawMatrix(rows, cols, cellWidth, cellHeight, startX, startY) {
        const g = this.graphics;
        g.lineStyle(1, 0xFFFFFF, 1);

        const width = cols * cellWidth;
        const height = rows * cellHeight;

        // Dibujar líneas verticales
        for (let c = 0; c <= cols; c++) {
            let x = startX + c * cellWidth;
            g.moveTo(x, startY);
            g.lineTo(x, startY + height);
        }

        // Dibujar líneas horizontales
        for (let r = 0; r <= rows; r++) {
            let y = startY + r * cellHeight;
            g.moveTo(startX, y);
            g.lineTo(startX + width, y);
        }

        g.strokePath();
        // g.setDepth(100);
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
        piece.x = this.posX + col * this.cellWidth + this.cellWidth / 2;
        piece.y = this.posY + row * this.cellHeight + this.cellHeight / 2;
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
        let col = Math.floor((piece.x - this.posX) / this.cellWidth);
        let row = Math.floor((piece.y - this.posY) / this.cellHeight);

        if (
            row >= 0 && row < this.rows &&
            col >= 0 && col < this.cols
        ) {
            this.placePieces(row, col, pieces);
            return true;
        }
        return false;
    }

    print() {
        let text = "";
        let matriz = this.grid;
        for (let i = 0; i < matriz.length; i++) {
            for (let j = 0; j < matriz[i].length; j++) {
                if (matriz[i][j]) text += matriz[i][j].number + " ";
                else text += "_ "
            }
            text += "\n";   // salto de línea al terminar la fila
        }

        console.log(text)
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

    getPiece(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }


}