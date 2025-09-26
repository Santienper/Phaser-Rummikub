export default class Board {
    constructor(scene, rows, cols, cellWidth, cellHeight, offsetX, offsetY) {
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.board = Array.from({ length: rows }, () => Array(cols).fill(null));

        this.previousBoard = null;
        this.groupToMove = [];
        this.graphics = scene.add.graphics();

        this.drawMatrix(this.rows, this.cols, this.cellWidth, this.cellHeight, this.offsetX, this.offsetY);
    }

    drawMatrix(rows, cols, cellWidth, cellHeight, startX, startY) {
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
        // g.setDepth(100);
    }

    // Añadir a lista de grupos de fichas que hay que cambiar de sitio o añadir a tablero
    addGroupToMove(x, y, group) {
        this.groupToMove.push({ x, y, group });
    }

    // Añadir a tablero
    addGroupToBoard(x, y, group) {
        for (let i = 0; i < group.length; ++i) {
            let col = x + i;
            let row = y;
            group[i].x = this.offsetX + col * this.cellWidth + this.cellWidth / 2;
            group[i].y = this.offsetY + row * this.cellHeight + this.cellHeight / 2;
            group[i].row = row;
            group[i].col = col;
            this.board[row][col] = group[i];
        }

        console.log("addGroupToBoard");
        console.log(group);

    }

    clearBoard(x, y, group) {
        for (let i = 0; i < group.length; ++i) {
            const col = x + i;
            if (col >= 0 && col < this.cols && y >= 0 && y < this.rows) {
                this.board[y][col] = null;
            }
        }
        console.log("clearBoard");

    }

    getLeftGroup(x, y) {
        let group = [];

        if (this.board[y][x] == null) return group;

        for (let i = x; i >= 0 && this.board[y][i]; i--) {
            group.push(this.board[y][i]);
        }

        group.reverse();

        return group;
    }

    getRightGroup(x, y) {
        let group = [];
        if (this.board[y][x] == null) x++;
        if (this.board[y][x] == null) return group;

        for (let i = x; i < this.board[y].length && this.board[y][i]; i++) {
            group.push(this.board[y][i]);
        }

        return group;
    }

    // Combina el grupo que queremos colocar con grupos vecinos válidos
    combineWithNeighbors(x, y, pieces) {
        // límites
        if (!(x >= 0 && y >= 0 && y < this.rows && x < this.cols)) return null;

        let left = this.getLeftGroup(x - 1, y);
        let right = this.getRightGroup(x, y);
        let group = left.concat(pieces);

        // intentar fusionar a la izquierda
        if (left.length > 0 && this.isValidGroup(group)) {
            this.clearBoard(x - left.length, y, left);
            return { x: x - left.length, y, group };
        }

        // intentar fusionar a la derecha (o quedarse solo)
        group = pieces.concat(right);
        if (right.length > 0 && this.isValidGroup(group)) {
            this.clearBoard(x + pieces.length, y, right);
            return { x, y, group };
        }

        return { x, y, group: pieces };
    }

    // Elimina grupos vecinos que estén adyacentes al grupo colocado
    removeNeighborGroups(x, y, group) {
        let startX = Math.max(0, x - 1);
        let endX = Math.min(this.cols - 1, x + group.length + 1);

        while (startX < endX) {
            if (this.board[y][startX]) {
                let g = this.getConnectedGroup(startX, y);
                this.clearBoard(g.x, y, g.group);
                this.addGroupToMove(g.x, y, g.group);
                startX = g.x + g.group.length - 1;
            } else {
                startX++;
            }
        }

        console.log("removeNeighborGroups");

    }

    // Buscar el hueco más cercano para cada grupo pendiente y lo coloca en el tablero
    findClosestPlacementForGroups() {
        for (let { x: origX, y: origY, group } of this.groupToMove) {
            let groupSize = group.length;
            let requiredSpace = groupSize + 2;
            let bestSpot = null;
            let bestDistance = Infinity;
            let freeSegmentLength = 0;

            for (let y = 0; y < this.rows; y++) {
                freeSegmentLength = 0;
                for (let x = 0; x <= this.cols - requiredSpace; x++) {
                    if (!this.board[y][x]) {
                        freeSegmentLength++;
                    }
                    else {
                        freeSegmentLength = 0;
                    }
                    if (freeSegmentLength >= requiredSpace) {
                        let startX = x - groupSize;
                        let distance = Math.abs(startX - origX) + Math.abs(y - origY);
                        if (distance < bestDistance) {
                            bestDistance = distance;
                            bestSpot = { x: startX, y };
                        }
                    }
                }
            }

            if (bestSpot) {
                this.addGroupToBoard(bestSpot.x, bestSpot.y, group);
            }
            console.log(bestSpot);

        }
        this.groupToMove = [];


    }

    // Colocar piezas en el tablero, fusiona con vecinos y elimina adyacentes
    placePieces(x, y, pieces) {
        let result = this.combineWithNeighbors(x, y, pieces);

        if (!result) {
            console.warn("placePieces: resultado null (pos fuera de rango):", x, y, pieces);
            return;
        }

        let { x: newX, y: newY, group } = result;

        // Eliminar grupos que queden pegados al nuevo grupo
        this.removeNeighborGroups(newX, newY, group);
        // Colocar el grupo definitivo en el tablero
        this.addGroupToBoard(newX, newY, group);
        this.findClosestPlacementForGroups();
    }

    tryPlace(pieces) {
        let piece = pieces[0];
        let col = Math.floor((piece.x - this.offsetX) / this.cellWidth);
        let row = Math.floor((piece.y - this.offsetY) / this.cellHeight);

        if (
            row >= 0 && row < this.rows &&
            col >= 0 && col < this.cols
        ) {
            this.placePieces(col, row, pieces);
            return true;
        }
        return false;
    }


    // saveState() {
    //     this.previousBoard = JSON.parse(JSON.stringify(this.board));
    // }

    // restoreState() {
    //     if (this.previousBoard) {
    //         this.board = JSON.parse(JSON.stringify(this.previousBoard));
    //     }
    // }


    // Conseguir un grupo de fichas 
    getConnectedGroup(x, y) {
        let group = [];

        if (this.board[y][x] == null) return group;

        for (let i = x - 1; i >= 0 && this.board[y][i]; i--) {
            group.push(this.board[y][i]);
        }

        group.reverse();

        let newX = x - group.length;

        for (let i = x; i < this.cols && this.board[y][i]; i++) {
            group.push(this.board[y][i]);
        }

        return { x: newX, group };
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

    // Ver si mapa es valido
    detectValidGroups() {
        for (let y = 0; y < this.rows; y++) {
            let group = [];
            for (let x = 0; x < this.cols; x++) {
                const piece = this.board[y][x];
                if (piece) {
                    group.push(piece);
                }
                else if (group.length > 0) {
                    if (!this.isValidGroup(group)) return false;
                    group = [];
                }
            }
            if (group.length > 0) {
                if (!this.isValidGroup(group)) return false;
            }
        }
        return true;
    }

}
