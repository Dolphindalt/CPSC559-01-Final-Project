import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Web3Service } from "./contract/web3.service";

@Injectable({
    providedIn: 'any'
})
export class AuthenticationService {

    private authenticated: BehaviorSubject<boolean>;
    private address: BehaviorSubject<string | undefined>;

    constructor(private web3: Web3Service) {
      this.authenticated = new BehaviorSubject<boolean>(false);
      this.address = new BehaviorSubject<string | undefined>(undefined);

      this.Connect();
    }

    private onAccountsChange(accounts: string[]): any {
      console.log("Account change detected: ", accounts);
      if (accounts) {
        
        // Multiple wallets will cause this strange behavior.
        if (!this.address) {
          this.address = new BehaviorSubject<string | undefined>(undefined);
        }
        
        this.address.next(accounts[0]);
      }
      window.location.reload();
    }

    public async Connect(): Promise<void> {
      return this.web3.connectAccount(this.onAccountsChange).then(response => {
          if (response) {
            this.address.next(response[0]);
            this.authenticated.next(true);
          }
      });
    }

    public isAuthenticated(): boolean {
      return this.authenticated.value;
    }

    public getAddress(): string | undefined {
      return this.address.value;
    }

}