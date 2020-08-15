import { Router } from 'express';
import TransactionRepository from '../repositories/TransactionRepository';
import CreateTransactionService from '../services/CreateTransactionServices';

const transactionRouter = Router();
const transationRepository = new TransactionRepository();

transactionRouter.get('/', (resquest, response) => {
  const transactions = transationRepository.all();
  const balance = transationRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});
transactionRouter.post('/', (resquest, response) => {
  try {
    const createTransactionService = new CreateTransactionService(
      transationRepository
    );

    const { type, title, value } = resquest.body;
    const transaction = createTransactionService.execute({
      title,
      type,
      value,
    });

    return response.json(transaction);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

export default transactionRouter;
