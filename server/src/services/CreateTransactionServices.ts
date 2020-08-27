import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';
import CreateCategoryServices from './CreateCategoryServices';
import AppError from '../errors/AppError';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface Request {
  type: 'income' | 'outcome';
  value: number;
  title: string;
  category: string;
}
class CreateTransactionServices {
  public async execute({
    type,
    value,
    title,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(
      TransactionRepository,
      'default'
    );

    const balance = await transactionRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Value is higher than balance');
    }

    const categoryServices = new CreateCategoryServices();
    const categoryFound = await categoryServices.execute({ title: category });

    const transaction = transactionRepository.create({
      title,
      value,
      category_id: categoryFound,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionServices;
