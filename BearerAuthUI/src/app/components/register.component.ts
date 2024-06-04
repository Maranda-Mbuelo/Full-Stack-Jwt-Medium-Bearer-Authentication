import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-center mb-4">Register</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="name" class="block text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your name"
            />
            <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" class="text-red-600 text-sm">
              Name is required.
            </div>
          </div>
          <div class="mb-4">
            <label for="email" class="block text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
            />
            <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-600 text-sm">
              Email is required.
            </div>
          </div>
          <div class="mb-4">
            <label for="password" class="block text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
            />
            <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-600 text-sm">
              Password is required.
            </div>
          </div>
          <div class="mb-6">
            <label for="confirmPassword" class="block text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Confirm your password"
            />
            <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="text-red-600 text-sm">
              Confirm Password is required.
            </div>
          </div>
          <button
            type="submit"
            class="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
            [disabled]="registerForm.invalid"
          >
            Register
          </button>
          <div class="mt-4 text-center">
            <a routerLink="/login" class="text-blue-600 hover:underline">Already have an account? Login</a>
          </div>
        </form>
      </div>
    </div>

  `,
  styles: ``
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(formGroup: FormGroup): null | object {
    return formGroup.get('password')?.value === formGroup.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe(response => {
        if (response.flag) {
          this.router.navigate(['/login']);
        } else {
          alert(response.message);
        }
      });
    }
  }
}
