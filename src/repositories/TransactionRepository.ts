import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
class TransactionRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const balance = this.transactions.reduce(
      (total: Balance, current: Transaction) => {
        switch (current.type) {
          case 'income':
            total.income += current.value;
            break;
          case 'outcome':
            total.outcome += current.value;
            break;
          default:
            break;
        }
        return total;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      }
    );
    balance.total = balance.income - balance.outcome;
    return balance;
  }

  public create({ title, type, value }: Omit<Transaction, 'id'>): Transaction {
    const transaction = new Transaction({ title, type, value });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionRepository;
