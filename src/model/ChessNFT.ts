export class ChessNFT {
    private white: string | undefined;
    private black: string | undefined;
    private date: string | undefined;
    private moves: string[];

    public constructor(moves: string[]) {
        this.moves = moves;
    }

    public getMoveCount(): number {
        return this.moves.length;
    }

    public getMoves(): string[] {
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