import { Timestamp } from 'firebase/firestore';

export interface Expense {
  id?: string;
  date: Date | Timestamp | string | null | undefined;
  source?: string | null;
  amount?: number;
}
