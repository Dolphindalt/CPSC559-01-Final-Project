import { Injectable } from "@angular/core";
import { Web3Service } from "./contract/web3.service";

@Injectable({
    providedIn: 'any'
})
export class AuthenticationService {

    private authenticated: boolean = false;
    private data: string[] | undefined;
    private address: string | undefined;


    constructor(private web3: Web3Service) {}

    Connect() {
      this.web3.connectAccount().then(response => {
          console.log(response);
          this.data = response
          if (this.data) {
          this.address = this.data[0];
          this.authenticated = true;
          }
      });
    }

    get isAuthenticated(): boolean {
      return this.authenticated;
    }

    get getAddress(): string | undefined {
      return this.address;
    }

}