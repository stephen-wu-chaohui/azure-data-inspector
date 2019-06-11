import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulateModalPage } from './simulate-modal.page';

describe('SimulateModalPage', () => {
  let component: SimulateModalPage;
  let fixture: ComponentFixture<SimulateModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimulateModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulateModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
