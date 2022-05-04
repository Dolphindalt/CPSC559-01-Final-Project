import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AuthenticationService } from './services/authentication.service';
import { Web3Service } from './services/contract/web3.service';
import { ChessNFTComponent } from './core/chess-nft/chess-nft.component';
import { CollectionComponent } from './pages/collection/collection.component';
import { MintComponent } from './pages/mint/mint.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { NftViewComponent } from './pages/nft-view/nft-view.component';
import { NftViewThumbnailComponent } from './core/nft-view-thumbnail/nft-view-thumbnail.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'collection', component: CollectionComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'mint', component: MintComponent },
  { path: 'browse/:tokenId', component: NftViewComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChessNFTComponent,
    CollectionComponent,
    MintComponent,
    BrowseComponent,
    NftViewComponent,
    NftViewThumbnailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    CommonModule,
    FormsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    AuthenticationService,
    Web3Service
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
