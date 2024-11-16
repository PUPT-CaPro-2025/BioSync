import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetComputerComponent } from './set-computer.component';

describe('SetComputerComponent', () => {
  let component: SetComputerComponent;
  let fixture: ComponentFixture<SetComputerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetComputerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetComputerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
