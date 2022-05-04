import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftViewComponent } from './nft-view.component';

describe('NftViewComponent', () => {
  let component: NftViewComponent;
  let fixture: ComponentFixture<NftViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
