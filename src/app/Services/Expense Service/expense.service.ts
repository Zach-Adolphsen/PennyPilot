import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private firestore: Firestore = inject(Firestore); // Inject Firestore

  private expenseSourceAdded = new Subject<void>();
  expenseAdded$ = this.expenseSourceAdded.asObservable();

  constructor(private authService: AuthService) {}

  private getUserExpenseCollection(): Observable<
    CollectionReference<DocumentData>
  > {
    return this.authService.getUser().pipe(
      map((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const userDoc = doc(this.firestore, 'users', user.uid);
        return collection(userDoc, 'ExpenseList');
      })
    );
  }

  addExpense(expense: Expense): Observable<string> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const { id, ...expenseData } = expense;
        return from(addDoc(expenseCollection, expenseData)).pipe(
          map((docRef) => {
            this.expenseSourceAdded.next(); // Notify that expense was added
            return docRef.id;
          })
        );
      })
    );
  }

  getExpenseList(): Observable<Expense[]> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const orderedCollection = query(expenseCollection, orderBy('date'));
        return from(getDocs(orderedCollection)).pipe(
          map((snapshot) => {
            return snapshot.docs.map((doc) => {
              const data = doc.data() as any;
              const date: Timestamp = data.date;
              const formattedDate = date
                ? date.toDate().toLocaleDateString()
                : '';

              return { id: doc.id, ...data, date: formattedDate } as Expense;
            });
          })
        );
      })
    );
  }

  deleteExpense(expenseId: string): Observable<void> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const expenseDocument = doc(expenseCollection, expenseId);
        return from(deleteDoc(expenseDocument));
      })
    );
  }

  updateExpense(expense: Expense): Observable<void> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const expenseDocument = doc(expenseCollection, expense.id);
        return from(updateDoc(expenseDocument, { ...expense }));
      })
    );
  }
}
