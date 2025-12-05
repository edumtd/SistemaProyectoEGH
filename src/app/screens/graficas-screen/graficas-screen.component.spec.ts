import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficasScreenComponent } from './graficas-screen.component';

describe('GraficasScreenComponent', () => {
  let component: GraficasScreenComponent;
  let fixture: ComponentFixture<GraficasScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraficasScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficasScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
