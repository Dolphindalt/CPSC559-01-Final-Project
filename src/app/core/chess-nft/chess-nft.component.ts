import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

const Chess = require('chess.js');
const ChessBoard = require('chessboardjs/www/js/chessboard');

@Component({
  selector: 'app-chess-nft',
  templateUrl: './chess-nft.component.html',
  styleUrls: ['./chess-nft.component.css']
})
export class ChessNFTComponent implements OnInit, AfterViewInit {

  @Input() public algebraicNotation: string = "";
  public chessLogic;
  public chessDisplay: any;

  constructor() {
    this.chessLogic = Chess.Chess();
  }

  ngAfterViewInit(): void {
    this.chessDisplay = ChessBoard('board1', 'start');
  }

  ngOnInit(): void {
  }

}
