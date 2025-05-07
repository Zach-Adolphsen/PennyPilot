import { Timestamp } from 'firebase/firestore';

export interface Income {
  id?: string;
  date: Date | Timestamp | string | undefined;
  source?: string | null;
  amount?: number | null;
}
