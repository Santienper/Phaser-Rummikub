export default class Grid {
    constructor(scene, rows, cols, maxRows, maxCols, cellWidth, cellHeight, offsetX, offsetY) {
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.maxRows = maxRows;
        this.maxCols = maxCols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.grid = Array.from({ length: this.maxRows }, () => Array(this.maxCols).fill(null));
        this.graphics = this.scene.add.graphics();
        //this.drawMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight, this.offsetX, this.offsetY);
    }

    drawMatrix(rows, cols, cellWidth, cellHeight, startX, startY, depth = 100) {
        const g = this.graphics;
        g.lineStyle(1, 0xFFFFFF, 1);

        const width = cols * cellWidth;
        const height = rows * cellHeight;

        // Dibujar líneas verticales
        for (let c = 0; c <= cols; c++) {
            const x = startX + c * cellWidth;
            g.moveTo(x, startY);
            g.lineTo(x, startY + height);
        }

        // Dibujar líneas horizontales
        for (let r = 0; r <= rows; r++) {
            const y = startY + r * cellHeight;
            g.moveTo(startX, y);
            g.lineTo(startX + width, y);
        }

        g.strokePath();
        g.setDepth(depth);
    }

    getPiece(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    print() {
        let text = "";
        let matriz = this.grid;
        for (let i = 0; i < matriz.length; i++) {
            for (let j = 0; j < matriz[i].length; j++) {
                if (matriz[i][j]) text += matriz[i][j].number + " ";
                else text += "_ "
            }
            text += "\n";
        }

        console.log(text)
    }
    
    // Ver si es valido el grupo
    isValidGroup(group) {
        if (!group || group.length === 0) return false;

        const allJokers = group.every(p => p.comodin);
        if (allJokers) return false;

        // Buscar la primera pieza que no es comodín
        const firstNonJokerIndex = group.findIndex(p => !p.comodin);
        const firstNonJoker = group[firstNonJokerIndex];

        const sameValue = group.every(p => p.comodin || p.number === firstNonJoker.number);
        const sameColor = group.every(p => p.comodin || p.color === firstNonJoker.color);

        if (sameValue && !sameColor && group.length <= 4) {
            // asegurarse de que no hay colores repetidos entre las fichas no-joker
            const seen = new Set();
            for (let p of group) {
                if (!p.comodin) {
                    if (seen.has(p.color)) return false;
                    seen.add(p.color);
                }
            }
            return true;
        }

        if (sameColor) {
            let cont = firstNonJoker.number + 1;
            for (let i = firstNonJokerIndex + 1; i < group.length; i++) {
                if (group[i].number !== cont && !group[i].comodin) return false;
                cont++;
            }
            return firstNonJoker.number - firstNonJokerIndex > 0 && firstNonJoker.number + group.length - 1 - firstNonJokerIndex <= 13;
        }
        return false;
    }

}