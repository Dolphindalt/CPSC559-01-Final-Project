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

    Connect() {
      this.web3.connectAccount().then(response => {
          console.log(response);
          let data = response
          if (data) {
            this.address.next(data[0]);
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