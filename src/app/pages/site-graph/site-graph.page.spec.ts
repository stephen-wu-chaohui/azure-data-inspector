import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteGraphPage } from './site-graph.page';

describe('SiteGraphPage', () => {
  let component: SiteGraphPage;
  let fixture: ComponentFixture<SiteGraphPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteGraphPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteGraphPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
