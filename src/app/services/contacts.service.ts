import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ContactDto {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

export interface UpdateContactDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private base = `${environment.apiUrl}/api/contacts`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ContactDto[]>(this.base);
  }

  create(dto: CreateContactDto) {
    return this.http.post<ContactDto>(this.base, dto);
  }

  update(id: number, dto: UpdateContactDto) {
    return this.http.put<void>(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}