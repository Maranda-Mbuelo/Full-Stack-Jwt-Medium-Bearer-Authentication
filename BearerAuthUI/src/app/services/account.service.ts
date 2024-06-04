import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = 'https://localhost:7111/api/UserAccount';

  private http: HttpClient = inject(HttpClient)

  constructor() { }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-users`);
  }
}
