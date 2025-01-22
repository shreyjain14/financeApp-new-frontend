import { Payment, CreatePaymentDto } from "../types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}

export async function getPayments(page: number = 1, token: string): Promise<PaginatedResponse<Payment>> {
  const response = await fetch(`${API_BASE_URL}/api/payment?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  const data = await response.json();
  return {
    data,
    hasMore: data.length === 10, // Assuming server returns 10 items per page
    totalPages: Math.ceil(data.length / 10),
    currentPage: page,
  };
}

export async function createPayment(payment: CreatePaymentDto, token: string): Promise<Payment> {
  const response = await fetch(`${API_BASE_URL}/api/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment");
  }

  return response.json();
}

export async function deletePayment(paymentId: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/payment?paymentId=${paymentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete payment");
  }

  return response.json();
}

export async function getSharedUserPayments(email: string, page: number = 1, token: string): Promise<PaginatedResponse<Payment>> {
  const response = await fetch(
    `${API_BASE_URL}/api/share/check?email=${encodeURIComponent(email)}&page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch shared user payments");
  const data = await response.json();
  return {
    data,
    hasMore: data.length === 20,
    totalPages: Math.ceil(data.length / 20),
    currentPage: page,
  };
} 