import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AuthenticationService } from './services/authentication.service';
import { ChessNFTComponent } from './core/chess-nft/chess-nft.component';
import { CollectionComponent } from './pages/collection/collection.component';
import { MintComponent } from './pages/mint/mint.component';
import { BrowseComponent } from './pages/browse/browse.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'collection', component: CollectionComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'mint', component: MintComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChessNFTComponent,
    CollectionComponent,
    MintComponent,
    BrowseComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
