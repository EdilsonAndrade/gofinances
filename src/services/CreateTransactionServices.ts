import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';

class CreateTransactionServices {
  private transactionRepository: TransactionRepository;

  constructor(transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  public execute({ type, value, title }: Omit<Transaction, 'id'>): Transaction {
    const balance = this.transactionRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw Error('Value is higher than balance');
    }
    const transaction = this.transactionRepository.create({
      type,
      value,
      title,
    });

    return transaction;
  }
}

export default CreateTransactionServices;
