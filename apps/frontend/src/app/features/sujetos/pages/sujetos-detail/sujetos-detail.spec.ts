import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SujetosDetailComponent } from './sujetos-detail';

describe('SujetosDetailComponent', () => {
  let component: SujetosDetailComponent;
  let fixture: ComponentFixture<SujetosDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetosDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SujetosDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
