import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('SIMPLE INTERCEPTOR TEST - URL:', req.url);

  try {
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (token) {
      console.log('INTERCEPTOR: Adding token');
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    }
  } catch (error) {
    console.error('INTERCEPTOR ERROR:', error);
  }

  console.log('INTERCEPTOR: No token, proceeding without auth');
  return next(req);
};
