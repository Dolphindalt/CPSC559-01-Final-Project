import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Web3Service } from 'src/app/services/contract/web3.service';
import ChessNFTContract from 'build/contracts/ChessNFT.json'; 
import { GlobalConstants } from 'src/app/global-constants';
import { ChessNFT } from 'src/model/ChessNFT';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {

  private chessNFTContract: any;

  public nftIds: string[] = [];
  public nftData: ChessNFT[] = [];
  public owner: string = "";

  constructor(
    private web3: Web3Service,
    private auth: AuthenticationService,
    private toast: ToastrService
  ) {
    if (this.auth.getAddress() == null) {
      this.auth.Connect().then(() => {
        this.populateDataFromAddress();
      });
    } else {
      this.populateDataFromAddress();
    }
  }

  ngOnInit(): void {
  }

  private populateDataFromAddress() {
    this.web3.getWeb3().then((web3js) => {

      this.chessNFTContract = new web3js.eth.Contract(ChessNFTContract.abi, GlobalConstants.chessNFTContractAddress);
    
      console.log(this.auth.getAddress());

      this.chessNFTContract.methods.fetchOwnersTokens(this.auth.getAddress())
        .call({ from: this.auth.getAddress() })
        .then((data: any) => {
          this.nftIds = data[0];
          for (let i in data[1]) {
            let obj = data[1][i];
            let model = new ChessNFT();
            model.moves = obj.game;
            model.name = obj.name;
            model.white = obj.white;
            model.black = obj.black;
            model.date = obj.date;
            this.nftData.push(model); 
          }
          this.owner = data[2];
        })
        .catch((err: any) => {
          console.log(err);
          this.toast.error("Something went wrong!");
        }); 
    })
    .catch((err: any) => {
      console.log(err);
      this.toast.error("Something went wrong!");
    });
  }

}
