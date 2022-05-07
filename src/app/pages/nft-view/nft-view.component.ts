import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalConstants } from 'src/app/global-constants';
import { Web3Service } from 'src/app/services/contract/web3.service';
import { ChessNFT } from 'src/model/ChessNFT';
import ChessNFTContract from 'build/contracts/ChessNFT.json'; 
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { MarketItem } from 'src/model/MarketItem';
import MarketplaceContract from 'build/contracts/MarketPlace.json'; 
import { MarketItemSoldEvent } from 'src/model/MarketItemSoldEvent';

@Component({
  selector: 'app-nft-view',
  templateUrl: './nft-view.component.html',
  styleUrls: ['./nft-view.component.css']
})
export class NftViewComponent implements OnInit {

  public transactionInProgress: boolean = false;

  private chessNFTContract: any;
  private marketplaceContract: any;

  private tokenId: string | null = "";
  private itemId: string | null = "";
  
  public game: ChessNFT = new ChessNFT();
  public owner: string = "";
  public marketItem: MarketItem | null = null;

  public web3lit = require('web3');

  constructor(
    private web3: Web3Service,
    private route: ActivatedRoute,
    public auth: AuthenticationService,
    private toast: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tokenId = params['tokenId'];
      this.itemId = params['itemId'];
    });

    this.tokenId = this.route.snapshot.paramMap.get("tokenId");
    this.itemId = this.route.snapshot.paramMap.get("itemId");

    if (this.tokenId != null) {

      this.web3.getWeb3().then((web3js) => {
        this.chessNFTContract = new web3js.eth.Contract(ChessNFTContract.abi, GlobalConstants.chessNFTContractAddress);

        this.chessNFTContract.methods.fetchToken(this.tokenId)
          .call({ from: this.auth.getAddress() })
          .then((data: any) => {
            console.log(data);
            let chessGame = data[0];
            let ownerAddress = data[1];
            this.game.name = chessGame.name;
            this.game.moves = chessGame.game;
            this.game.black = chessGame.black;
            this.game.white = chessGame.white;
            this.game.date = chessGame.date;
            this.owner = ownerAddress;

            if (this.game.white == "")
              this.game.white = "Anonymous";
            if (this.game.black == "")
              this.game.black = "Anonymous";
          }).catch((err: any) => {
            console.log(err);
            this.toast.error("Something went wrong!");
          });

          if (this.itemId != null) {
            this.marketplaceContract = new web3js.eth.Contract(MarketplaceContract.abi, GlobalConstants.marketplaceContractAddress);
          
            this.marketplaceContract.methods.fetchMarketItem(this.itemId)
              .call({ from: this.auth.getAddress() })
              .then((data: any) => {
                this.marketItem = data;
              });

            this.marketplaceContract.events.MarketItemSold()
              .on("data", (event: any) => {
                window.location.reload();
                let marketItemSold: MarketItemSoldEvent = event.returnValues;
                this.transactionInProgress = false;
                this.toast.success("Purchase for market item " + marketItemSold.itemId + " completed!");
              });
          }
      });

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
