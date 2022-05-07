import { AfterViewChecked, AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';

const Chess = require('chess.js');
const ChessBoard = require('chessboardjs/www/js/chessboard');

@Component({
  selector: 'app-chess-nft',
  templateUrl: './chess-nft.component.html',
  styleUrls: ['./chess-nft.component.css']
})
export class ChessNFTComponent implements OnInit, AfterViewInit, OnChanges {

  private static boardNo = 1000;

  public boardId: number;
  @Input() public notation: string = "";
  public chessLogic;
  public chessDisplay: any = false;

  private fenMoves: string[] = [];
  private currentMove: number = 0;

  constructor() {
    this.chessLogic = Chess.Chess();
    ChessNFTComponent.boardNo += 1;
    this.boardId = ChessNFTComponent.boardNo;
  }

  ngAfterViewInit(): void {
    this.chessDisplay = ChessBoard('board' + this.boardId, {
      snapbackSpeed: 10,
      snapSpeed: 10,
      trashSpeed: 10,
      moveSpeed: 10,
      showErrors: 'console',
      position: 'start'
    });
  }

  ngOnChanges(): void {
    if (this.notation) {
      this.buildMoveConfigurations();
      this.chessDisplay.position(this.fenMoves[this.currentMove]);
    }
  }

  ngOnInit(): void {
  }

  public nextMove(): void {
    if (this.currentMove + 1 < this.fenMoves.length) {
      this.currentMove += 1;
      this.chessDisplay.position(this.fenMoves[this.currentMove]);
    }
  }

  public prevMove(): void {
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
  }

}
