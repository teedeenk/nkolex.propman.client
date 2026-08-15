import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ token: 'abc123' })),
          },
        },
        {
          provide: HttpClient,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(of({})),
          },
        },
        {
          provide: AuthService,
          useValue: {
            confirmEmail: jasmine.createSpy('confirmEmail').and.returnValue(of(undefined)),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should verify email using the token only', () => {
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(authService.confirmEmail).toHaveBeenCalledWith('abc123');
  });
});
