import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';

const Chess = require('chess.js');
const ChessBoard = require('chessboardjs/www/js/chessboard');

@Component({
  selector: 'app-chess-nft',
  templateUrl: './chess-nft.component.html',
  styleUrls: ['./chess-nft.component.css']
})
export class ChessNFTComponent implements OnInit, AfterViewInit, OnChanges {

  private static boardNo = 0;

  public boardId: number;
  @Input() public notation: string = "";
  public chessLogic;
  public chessDisplay: any;

  private fenMoves: string[] = [];
  private currentMove: number = 0;

  constructor() {
    this.chessLogic = Chess.Chess();
    ChessNFTComponent.boardNo += 1;
    this.boardId = ChessNFTComponent.boardNo;
  }

  ngAfterViewInit(): void {
    this.chessDisplay = ChessBoard('board' + this.boardId, 'start');
  }

  ngOnChanges(): void {
    if (this.notation) {
      this.buildMoveConfigurations();
    }
  }

  ngOnInit(): void {
  }

  public nextMove(): void {
    console.log("Next move");
    if (this.currentMove + 1 < this.fenMoves.length) {
      this.currentMove += 1;
      this.chessDisplay.position(this.fenMoves[this.currentMove]);
    }
  }

  public prevMove(): void {
    console.log("Previous move");
    if (this.currentMove - 1 >= 0) {
      this.currentMove -= 1;
      this.chessDisplay.position(this.fenMoves[this.currentMove]);
    }
  }

  private buildMoveConfigurations(): void {
    this.chessLogic.reset();
    this.fenMoves = [];
    this.fenMoves.push(this.chessLogic.fen());

    let splitNotation = this.notation.split(" ");
    let lastIndex = 0;
    for (let idx in splitNotation) {
      this.chessLogic.move(splitNotation[idx], { sloppy: true });
      if (this.fenMoves.length != 0 && this.fenMoves[lastIndex] != this.chessLogic.fen()) {
        this.fenMoves.push(this.chessLogic.fen());
        lastIndex++;
      }
    }

    if (this.fenMoves.length > 0)
      this.currentMove = this.fenMoves.length - 1;
    
    this.chessDisplay.position(this.fenMoves[this.currentMove]);
  }

}
