import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SujetosListComponent } from './sujetos-list';

describe('SujetosListComponent', () => {
  let component: SujetosListComponent;
  let fixture: ComponentFixture<SujetosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SujetosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
