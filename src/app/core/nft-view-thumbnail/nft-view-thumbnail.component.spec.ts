import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftViewThumbnailComponent } from './nft-view-thumbnail.component';

describe('NftViewThumbnailComponent', () => {
  let component: NftViewThumbnailComponent;
  let fixture: ComponentFixture<NftViewThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftViewThumbnailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftViewThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
