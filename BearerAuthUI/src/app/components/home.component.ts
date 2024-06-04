import { Component, inject, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { JwtService } from '../services/jwt.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">

    <div class="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
      <div class="flex">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h.01M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p><strong>Warning:</strong> This code might only be compatible with Angular 17 and .NET 8, as these were the versions used to develop the API and front-end.<br> I am not sure, just try first. I might even upgrade the versions in the near future.</p>
        </div>
      </div>
    </div>

    <div class="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
      <div class="flex">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h.01M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p>If you appreciate this full-stack implementation and wish to delve deeper into coding, please feel free to contact me. I am available for <strong>lessons</strong>, paid freelance projects, contract work, part-time or full-time employment. I am currently open to any job opportunities. Thank you in advance!</p>
          <ul class="list-disc list-inside mt-2">
            <li><strong>WhatsApp</strong>: <a href="https://wa.me/27673866562" class="text-blue-500">067 386 6562</a></li>
            <li><strong>Call</strong>: <a href="tel:+27787722573" class="text-blue-500">078 772 2573</a></li>
            <li><strong>Email</strong>: <a href="mailto:workwithmbuelo@gmail.com" class="text-blue-500">workwithmbuelo&#64;gmail.com</a></li>
          </ul>
        </div>
      </div>
    </div>

      <h1 class="text-4xl font-bold text-center mb-8 text-blue-500">You have successfully configured Jwt Full-Stack App.</h1>

      <div class="w-full flex justify-center items-center px-[10%]">
      <p class="bg-sky-400 text-sky-50 px-8 rounded-full">If you really want to know how to do this from scratch, Step-By-Step, I do paid <strong>lessons</strong>! <span class="w-24 h-auto">😃</span> Feel free to get in touch with me!</p>
      </div>
      
      <div *ngIf="token" class="mb-8">
        <h2 class="text-2xl font-semibold mb-2">Token:</h2>
        <div class="bg-gray-100 p-4 rounded-lg shadow">
          <pre class="whitespace-pre-wrap break-words">{{ token }}</pre>
        </div>
      </div>

      <div *ngIf="decodedToken" class="mb-8">
        <h2 class="text-2xl font-semibold mb-2">Decoded Token:</h2>
        <div class="bg-blue-100 p-4 rounded-lg shadow">
          <pre class="whitespace-pre-wrap break-words">{{ decodedToken | json }}</pre>
        </div>
      </div>

      <div *ngIf="decodedHeader" class="mb-8">
        <h2 class="text-2xl font-semibold mb-2">Decoded Header:</h2>
        <div class="bg-green-100 p-4 rounded-lg shadow">
          <pre class="whitespace-pre-wrap break-words">{{ decodedHeader | json }}</pre>
        </div>
      </div>

      <div *ngIf="roles.length" class="mb-8">
        <h2 class="text-2xl font-semibold mb-2">Roles:</h2>
        <div class="bg-yellow-100 p-4 rounded-lg shadow">
          <ul class="list-disc list-inside">
            <li *ngFor="let role of roles" class="text-lg">{{ role }}</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class HomeComponent implements OnInit {

  private accountService = inject(AccountService);
  private jwtService = inject(JwtService);

  token: string | null = null;
  decodedToken: any = null;
  decodedHeader: any = null;
  roles: string[] = [];


  ngOnInit(): void {
    this.accountService.getAllUsers()
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]); // Return an empty array or handle the error as needed
        })
      )
      .subscribe(
        data => console.table(data)
      );

      this.token = this.jwtService.getToken();
    if (this.token) {
      console.log('Token attached to request:', this.token);
      this.decodedToken = this.jwtService.getDecodedToken();
      console.log(this.decodedToken);
      this.decodedHeader = this.jwtService.getDecodedHeader();
      console.log(this.decodedHeader);
      this.roles = this.extractRoles(this.decodedToken);
    }
  }

  private extractRoles(decodedToken: any): string[] {
    if (decodedToken && decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      return Array.isArray(decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'])
        ? decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        : [decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']];
    }
    return [];
  }

}
