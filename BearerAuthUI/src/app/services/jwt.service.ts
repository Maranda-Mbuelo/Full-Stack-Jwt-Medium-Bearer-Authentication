import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  private authService: AuthService = inject(AuthService);

  getToken(): string | null {
    return this.authService.getToken();
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  getDecodedHeader(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token, { header: true });
    }
    return null;
  }

  getRoles(): string[] {
    const decodedToken = this.getDecodedToken();
    if (decodedToken && decodedToken.roles) {
      return decodedToken.roles;
    }
    return [];
  }
}
