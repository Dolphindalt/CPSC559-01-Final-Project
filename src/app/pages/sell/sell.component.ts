import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Web3Service } from 'src/app/services/contract/web3.service';
import { ChessNFT } from 'src/model/ChessNFT';
import ChessNFTContract from 'build/contracts/ChessNFT.json';
import MarketplaceContract from 'build/contracts/MarketPlace.json'; 
import { GlobalConstants } from 'src/app/global-constants';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.css']
})
export class SellComponent implements OnInit {

  private chessNFTContract: any;
  private marketplaceContract: any;

  public saleInProgress: boolean = false;
  public price: number = 0.0;
  public tokenId: string | null = "";
  public game: ChessNFT = new ChessNFT();
  public owner: string = "";

  private web3lit: any;

  constructor(
    private web3: Web3Service,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.web3lit = require('web3');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tokenId = params['tokenId'];
    });

    this.tokenId = this.route.snapshot.paramMap.get("tokenId");

    this.web3.getWeb3().then((web3js) => {
      this.chessNFTContract = new web3js.eth.Contract(ChessNFTContract.abi, GlobalConstants.chessNFTContractAddress);
      this.marketplaceContract = new web3js.eth.Contract(MarketplaceContract.abi, GlobalConstants.marketplaceContractAddress);

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
      
      this.marketplaceContract.events.MarketItemCreated()
        .on("data", (event: any) => {
          let itemId = event.returnValues.itemId;
          let tokenId = event.returnValues.tokenId;
          this.toast.success("Your NFT is now for sale!");
          this.saleInProgress = false;
          this.router.navigate(["/browse/" + tokenId + "/" + itemId]);
        })
        .on("error", (error: any) => {
          this.toast.error("Failed to put NFT for sale!", error);
          this.saleInProgress = false;
        });

    });
  }

  onSubmit(): void {
    if (this.price <= 0) {
      this.toast.warning("Your selling price must be greater than 0!");
      return;
    }

    let ethToWei = this.web3lit.utils.toWei(this.price.toString(), 'ether');

    console.log(GlobalConstants.chessNFTContractAddress);
    console.log(this.tokenId);
    console.log(ethToWei);
    console.log(this.auth.getAddress());

    this.chessNFTContract.methods.approve(GlobalConstants.marketplaceContractAddress, this.tokenId)
      .send({ from: this.auth.getAddress() })
      .on("error", (error: any) => {
        console.log(error);
        this.saleInProgress = false;
        this.toast.error("Failed to sell NFT", "An error has occurred.");
      })
      .then(() => {
        this.marketplaceContract.methods.createMarketItem(GlobalConstants.chessNFTContractAddress, this.tokenId, ethToWei)
          .send({ from: this.auth.getAddress() })
          .on("error", (error: any) => {
            console.log(error);
            this.saleInProgress = false;
            this.toast.error("Failed to sell NFT", "An error has occurred.");
          })
          .then(() => {
            this.saleInProgress = true;
          });
      });

  }

}
