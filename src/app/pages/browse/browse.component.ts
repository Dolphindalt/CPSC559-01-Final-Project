import { Component, OnInit } from '@angular/core';
import MarketplaceContract from 'build/contracts/MarketPlace.json'; 
import { GlobalConstants } from 'src/app/global-constants';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Web3Service } from 'src/app/services/contract/web3.service';
import { ChessNFT } from 'src/model/ChessNFT';
import { MarketItem } from 'src/model/MarketItem';
import ChessNFTContract from 'build/contracts/ChessNFT.json'; 

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css']
})
export class BrowseComponent implements OnInit {

  private marketplaceContract: any;
  private chessNFTContract: any;

  public marketItems: MarketItem[] = [];
  public games: ChessNFT[] = [];
  public owners: string[] = [];

  constructor(
    private web3: Web3Service,
    private auth: AuthenticationService,
  ) {

  }

  ngOnInit(): void {
    this.web3.getWeb3().then((web3js) => {
      this.marketplaceContract = new web3js.eth.Contract(MarketplaceContract.abi, GlobalConstants.marketplaceContractAddress);
      this.chessNFTContract = new web3js.eth.Contract(ChessNFTContract.abi, GlobalConstants.chessNFTContractAddress);

      this.marketplaceContract.methods.fetchMarketItems()
        .call({ from: this.auth.getAddress() })
        .then((data: MarketItem[]) => {

          data.forEach((item, _) => {
            if (item.sold == false) {
              this.chessNFTContract.methods.fetchToken(item.tokenId)
                .call()
                .then((data2: any) => {
                  let chessGame = data2[0];
                  let game = new ChessNFT();
                  game.name = chessGame.name;
                  game.moves = chessGame.game;
                  game.black = chessGame.black;
                  game.white = chessGame.white;
                  game.date = chessGame.date;

                  if (game.white == "")
                    game.white = "Anonymous";
                  if (game.black == "")
                    game.black = "Anonymous";
                  
                  this.games.push(game);
                  this.marketItems.push(item);
                  this.owners.push(item.seller);
                });
            }
          });

        });
    });
  }

}
