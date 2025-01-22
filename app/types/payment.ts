export interface Payment {
  id: string;
  amount: number;
  currency: string;
  date: string;
  payedFrom: string;
  payedTo: string;
  userId: string;
}

export interface CreatePaymentDto {
  amount: number;
  currency: string;
  payedFrom: string;
  payedTo: string;
} 