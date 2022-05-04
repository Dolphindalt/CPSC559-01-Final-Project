import { AfterViewInit } from '@angular/core';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChessNFT } from 'src/model/ChessNFT';
const Chess = require('chess.js');
const ChessBoard = require('chessboardjs/www/js/chessboard');

@Component({
  selector: 'app-nft-view-thumbnail',
  templateUrl: './nft-view-thumbnail.component.html',
  styleUrls: ['./nft-view-thumbnail.component.css']
})
export class NftViewThumbnailComponent implements OnInit, AfterViewInit, OnChanges {

  private static boardNo = 0;

  public boardId: number;
  @Input() public tokenId: string = "";
  @Input() public game: ChessNFT = new ChessNFT();
  @Input() public owner: string = "";
  public chessDisplay: any;
  public fen: string = "";

  constructor() {
    this.boardId = NftViewThumbnailComponent.boardNo++;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.chessDisplay = ChessBoard('board' + this.boardId, this.fen);
  }

  ngOnChanges(): void {
    if (this.tokenId && this.game && this.owner) {
      let chessLogic = Chess.Chess();
      chessLogic.load_pgn(this.game.moves, { sloppy: true });
      this.fen = chessLogic.fen();
    }
  }

}
