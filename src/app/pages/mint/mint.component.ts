import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChessNFT } from 'src/model/ChessNFT';
import { Web3Service } from 'src/app/services/contract/web3.service';
import ChessNFTContract from 'build/contracts/ChessNFT.json'; 
import { GlobalConstants } from 'src/app/global-constants';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.css']
})
export class MintComponent implements OnInit {

  public nft: ChessNFT = new ChessNFT();
  public chessNFTContract: any;
  public mintingInProgress: boolean = false;

  constructor(
    private web3: Web3Service,
    private auth: AuthenticationService,
    private toast: ToastrService,
    private router: Router
  ) {
    
  }

  ngOnInit(): void {
    this.web3.getWeb3().then((web3js) => {
      this.chessNFTContract = new web3js.eth.Contract(ChessNFTContract.abi, GlobalConstants.chessNFTContractAddress);

      this.chessNFTContract.events.ChessNFTCreated()
        .on("data", (event: any) => {
          let tokenId = event.returnValues.tokenId;
          this.mintingInProgress = false;
          this.toast.success("Your NFT is minted!");
          this.router.navigate(["/browse/" + tokenId]);
        })
        .on("error", (error: any) => {
          this.toast.error("Failed to Mint NFT", error);
          this.mintingInProgress = false;
        });
    });
  }

  public onSubmit() {
    console.log("Attempting to mint NFT");
    this.mintChessNFT();
  }

  private mintChessNFT(): void {
    this.chessNFTContract.methods.mintItem(this.nft.moves, this.nft.name, this.nft.black, this.nft.white, this.nft.date)
      .send({ from: this.auth.getAddress() })
      .on("error", (error: any) => {
        console.log(error);
        this.mintingInProgress = false;
        this.toast.error("Failed to Mint NFT", "An error has occurred.");
      })
      .then(() => {
        this.mintingInProgress = true;
        this.toast.info("Minting in progress...", "Please wait warmly.");
      });
  }

}
