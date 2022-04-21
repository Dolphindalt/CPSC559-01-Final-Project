import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chess-nft',
  templateUrl: './chess-nft.component.html',
  styleUrls: ['./chess-nft.component.css']
})
export class ChessNFTComponent implements OnInit {

  @Input() public algebraicNotation: string = "";

  constructor() {
  }

  ngOnInit(): void {
  }

}
