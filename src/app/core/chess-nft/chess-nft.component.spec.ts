import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChessNFTComponent } from './chess-nft.component';

describe('ChessNFTComponent', () => {
  let component: ChessNFTComponent;
  let fixture: ComponentFixture<ChessNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChessNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChessNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
