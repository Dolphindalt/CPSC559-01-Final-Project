import {Inject, Injectable} from '@angular/core';
import { WEB3 } from '../../core/web3';
import { Subject } from 'rxjs';
import Web3 from 'web3';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { provider } from 'web3-core';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3Modal;
  private web3js: any;
  private provider: any;

  constructor(@Inject(WEB3) private web3: Web3) {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: 'c25445d03e9d47faacc124810648a747', // required change this with your own infura id
          description: 'Scan the qr code and sign in',
          qrcodeModalOptions: {
            mobileLinks: [
              'rainbow',
              'metamask',
              'argent',
              'trust',
              'imtoken',
              'pillar'
            ]
          }
        }
      },
      injected: {
        display: {
          logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
          name: 'metamask',
          description: "Connect with the provider in your Browser"
        },
        package: null
      },
    };

    this.web3Modal = new Web3Modal({
      // network: "mainnet", // optional change this with the net you want to use like rinkeby etc
      cacheProvider: false, // optional
      providerOptions, // required
      theme: {
        background: "rgb(39, 49, 56)",
        main: "rgb(199, 199, 199)",
        secondary: "rgb(136, 136, 136)",
        border: "rgba(195, 195, 195, 0.14)",
        hover: "rgb(16, 26, 32)"
      }
    });
  }


  async connectAccount() {
    this.provider = await this.web3Modal.connect(); // set provider
    if (this.provider) {
      this.web3js = new Web3(this.provider);
      this.provider.on("accountsChanged", (accounts: string[]) => {
        console.log(accounts);
      });
    } // create web3 instance

    let accounts = await this.web3js.eth.getAccounts();
    return accounts;
  }

  async accountInfo(account: any[]){
    const initialvalue = await this.web3js.eth.getBalance(account);
    let balance = this.web3js.utils.fromWei(initialvalue , 'ether');
    return balance;
  }

}

