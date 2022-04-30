export class ChessNFT {
    private id: string | undefined;
    private white: string | undefined; // Optional 
    private black: string | undefined; // Optional 
    private date: string | undefined; // Optional 
    private moves: string;

    public constructor(moves: string) {
        this.moves = moves;
    }

    public getId(): string | undefined {
        return this.id;
    }

    public getMoveCount(): number {
        return this.moves.length;
    }

    public getMoves(): string {
        return this.moves;
    }

    public getWhitePlayer(): string | undefined {
        return this.white;
    }

    public getBlackPlayer(): string | undefined {
        return this.black;
    }

    public getDate(): string | undefined {
        return this.date;
    }
}