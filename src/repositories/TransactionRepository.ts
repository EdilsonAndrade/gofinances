import { EntityRepository, getRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
@EntityRepository(Transaction)
class TransactionRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const data = await this.find();
    const balance = data.reduce(
      (total: Balance, current: Transaction) => {
        switch (current.type) {
          case 'income':
            total.income += Number(current.value);
            break;
          case 'outcome':
            total.outcome += Number(current.value);
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
}

export default TransactionRepository;
