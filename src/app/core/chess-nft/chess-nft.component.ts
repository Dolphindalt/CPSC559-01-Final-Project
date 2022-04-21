import { Component, Input, OnInit } from '@angular/core';

const Chess = require('chess.js');

@Component({
  selector: 'app-chess-nft',
  templateUrl: './chess-nft.component.html',
  styleUrls: ['./chess-nft.component.css']
})
export class ChessNFTComponent implements OnInit {

  @Input() public algebraicNotation: string = "";
  public chessLogic;

  constructor() {
    this.chessLogic = Chess.Chess();
  }

  ngOnInit(): void {
  }

}
