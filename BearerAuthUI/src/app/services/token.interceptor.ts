import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { jwtDecode } from "jwt-decode";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Token attached to request:', token);  // Debugging log

    const decodedToken = jwtDecode(token);
    console.log(decodedToken);

    // decode header by passing in options (useful for when you need `kid` to verify a JWT):
    const decodedHeader = jwtDecode(token, { header: true });
    console.log(decodedHeader);
    
    return next(cloned).pipe(
      catchError((error) => {
        console.error('Interceptor Error:', error);
        return throwError(() => error);
      })
    );
  } else {
        return next(req).pipe(
        catchError((error) => {
            console.error('Interceptor Error:', error);
            return throwError(() => error);
        })
        );
    }
};
