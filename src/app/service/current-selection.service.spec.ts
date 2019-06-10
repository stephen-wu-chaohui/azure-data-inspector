/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CurrentSelectionService } from './current-selection.service';

describe('Service: CurrentSelection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrentSelectionService]
    });
  });

  it('should ...', inject([CurrentSelectionService], (service: CurrentSelectionService) => {
    expect(service).toBeTruthy();
  }));
});
