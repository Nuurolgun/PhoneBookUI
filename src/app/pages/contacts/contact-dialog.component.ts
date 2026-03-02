import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type ContactDialogData = {
  mode: 'create' | 'edit';
  value?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
    address?: string | null;
  };
};

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Yeni Kişi' : 'Kişiyi Güncelle' }}</h2>

    <div mat-dialog-content [formGroup]="form" style="display:grid; gap:12px; padding-top:8px;">
      <mat-form-field appearance="outline">
        <mat-label>Ad</mat-label>
        <input matInput formControlName="firstName" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Soyad</mat-label>
        <input matInput formControlName="lastName" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Telefon</mat-label>
        <input matInput formControlName="phone" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>E-posta</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Adres</mat-label>
        <input matInput formControlName="address" />
      </mat-form-field>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">İptal</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">
        Kaydet
      </button>
    </div>
  `
})
export class ContactDialogComponent {
  form: any;

  constructor(
  private fb: FormBuilder,
  private ref: MatDialogRef<ContactDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: ContactDialogData
) {
  this.form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.maxLength(200)]],
    address: ['', [Validators.maxLength(500)]]
  });

  if (data.mode === 'edit' && data.value) {
    this.form.patchValue({
      firstName: data.value.firstName,
      lastName: data.value.lastName,
      phone: data.value.phone,
      email: data.value.email ?? '',
      address: data.value.address ?? ''
    });
  }
}

  close() {
    this.ref.close(null);
  }

  save() {
    const v = this.form.value;
    this.ref.close({
      firstName: (v.firstName ?? '').trim(),
      lastName: (v.lastName ?? '').trim(),
      phone: (v.phone ?? '').trim(),
      email: (v.email ?? '').trim() || null,
      address: (v.address ?? '').trim() || null
    });
  }
}