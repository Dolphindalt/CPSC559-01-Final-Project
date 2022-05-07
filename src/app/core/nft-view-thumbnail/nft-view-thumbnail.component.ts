import { AfterViewInit } from '@angular/core';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ChessNFT } from 'src/model/ChessNFT';
import { MarketItem } from 'src/model/MarketItem';
const Chess = require('chess.js');
const ChessBoard = require('chessboardjs/www/js/chessboard');
import MarketplaceContract from 'build/contracts/MarketPlace.json'; 
import { GlobalConstants } from 'src/app/global-constants';
import { Web3Service } from 'src/app/services/contract/web3.service';
import { ToastrService } from 'ngx-toastr';
import { MarketItemSoldEvent } from 'src/model/MarketItemSoldEvent';

@Component({
  selector: 'app-nft-view-thumbnail',
  templateUrl: './nft-view-thumbnail.component.html',
  styleUrls: ['./nft-view-thumbnail.component.css']
})
export class NftViewThumbnailComponent implements OnInit, AfterViewInit, OnChanges {

  private static boardNo = 0;
  private marketplaceContract: any;

  public boardId: number;
  @Input() public marketItem: MarketItem | null = null;
  @Input() public tokenId: string = "";
  @Input() public game: ChessNFT = new ChessNFT();
  @Input() public owner: string = "";
  public chessDisplay: any;
  public fen: string = "";

  public forSale: boolean = false;
  public transactionInProgress = false;

  public web3lit = require('web3');

  constructor(
    public auth: AuthenticationService,
    private web3: Web3Service,
    private toast: ToastrService
  ) {
    this.boardId = NftViewThumbnailComponent.boardNo++;
  }

  ngOnInit(): void {
    this.web3.getWeb3().then((web3js: any) => {
      this.marketplaceContract = new web3js.eth.Contract(MarketplaceContract.abi, GlobalConstants.marketplaceContractAddress);
    
      this.marketplaceContract.events.MarketItemSold()
        .on("data", (event: any) => {
          window.location.reload();
          let marketItemSold: MarketItemSoldEvent = event.returnValues;
          this.transactionInProgress = false;
          this.toast.success("Purchase for market item " + marketItemSold.itemId + " completed!");
        });
    });
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

    if (this.marketItem) {
      this.forSale = true;
    }
  }

  onBuyButton(itemId: string | null): void {
    this.transactionInProgress = true;
    this.marketplaceContract.methods.createMarketSale(GlobalConstants.chessNFTContractAddress, itemId)
      .send({ from: this.auth.getAddress(), value: this.marketItem?.price })
      .on('error', (error: any) => {
        console.log(error);
        this.toast.warning("Purchase failed!");
        this.transactionInProgress = false;
      });
  }

}
