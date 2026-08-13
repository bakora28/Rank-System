import { api } from './client';
import type { Book, Category, Subject } from '@/types';

export async function listCategories(params: { subject?: Subject } = {}) {
  const { data } = await api.get<{ data: Category[] }>('/categories', { params });
  return data.data;
}

export async function createCategory(payload: { name: string; subject: Subject; color?: string }) {
  const { data } = await api.post<{ data: Category }>('/categories', payload);
  return data.data;
}

export async function updateCategory(id: number, payload: { name: string; subject: Subject; color?: string }) {
  const { data } = await api.put<{ data: Category }>(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}

export async function listBooks(categoryId: number) {
  const { data } = await api.get<{ data: Book[] }>(`/categories/${categoryId}/books`);
  return data.data;
}

export async function createBook(categoryId: number, name: string, images: File[] = []) {
  const form = new FormData();
  form.append('name', name);
  images.forEach((file) => form.append('images[]', file));
  const { data } = await api.post<{ data: Book }>(`/categories/${categoryId}/books`, form);
  return data.data;
}

export async function updateBook(bookId: number, payload: { name: string; category_id?: number }) {
  const { data } = await api.put<{ data: Book }>(`/books/${bookId}`, payload);
  return data.data;
}

export async function uploadBookFiles(bookId: number, images: File[]) {
  const form = new FormData();
  images.forEach((file) => form.append('images[]', file));
  const { data } = await api.post<{ data: Book }>(`/books/${bookId}/files`, form);
  return data.data;
}

export async function deleteBookFile(bookId: number, fileId: number) {
  await api.delete(`/books/${bookId}/files/${fileId}`);
}

export async function deleteBook(bookId: number) {
  await api.delete(`/books/${bookId}`);
}
