import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablePage } from './variable.page';

describe('VariablePage', () => {
  let component: VariablePage;
  let fixture: ComponentFixture<VariablePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VariablePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
