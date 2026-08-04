import { api } from './client';
import type { Book, Category } from '@/types';

export async function listCategories() {
  const { data } = await api.get<{ data: Category[] }>('/categories');
  return data.data;
}

export async function createCategory(payload: { name: string; color?: string }) {
  const { data } = await api.post<{ data: Category }>('/categories', payload);
  return data.data;
}

export async function updateCategory(id: number, payload: { name: string; color?: string }) {
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

export async function createBook(categoryId: number, name: string) {
  const { data } = await api.post<{ data: Book }>(`/categories/${categoryId}/books`, { name });
  return data.data;
}

export async function updateBook(bookId: number, payload: { name: string; category_id?: number }) {
  const { data } = await api.put<{ data: Book }>(`/books/${bookId}`, payload);
  return data.data;
}

export async function deleteBook(bookId: number) {
  await api.delete(`/books/${bookId}`);
}
