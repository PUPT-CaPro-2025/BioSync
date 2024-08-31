import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLaboratoryComponent } from './view-laboratory.component';

describe('ViewLaboratoryComponent', () => {
  let component: ViewLaboratoryComponent;
  let fixture: ComponentFixture<ViewLaboratoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLaboratoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
