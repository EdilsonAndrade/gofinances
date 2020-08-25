import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import { Router } from 'express';

import TransactionRepository from '../repositories/TransactionRepository';
import ImportTransactionService from '../services/ImportTransactionService';
import CreateTransactionService from '../services/CreateTransactionServices';
import DeleteTransactionService from '../services/DeleteTransactionService';
import fileConfig from '../config/fileConfig';

const upload = multer(fileConfig);

const transactionRouter = Router();

transactionRouter.get('/', async (resquest, response) => {
  const transactionRepository = getCustomRepository(
    TransactionRepository,
    'default'
  );
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});
transactionRouter.post('/', async (request, response) => {
  try {
    const transactionService = new CreateTransactionService();

    const { type, title, value, category } = request.body;
    const transaction = await transactionService.execute({
      type,
      value,
      title,
      category,
    });

    return response.json(transaction);
  } catch (error) {
    return response
      .status(error.statusCode)
      .json({ status: 'error', message: error.message });
  }
});
transactionRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();
  const { id } = request.params;
  await deleteTransactionService.execute(id);
  return response.json({ message: 'Transaction Deleted' });
});
transactionRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    try {
      const transactionService = new ImportTransactionService();
      const transaction = transactionService.execute(request.file.path);

      return response.json(transaction);
    } catch (error) {
      return response
        .status(error.statusCode)
        .json({ status: 'error', message: error.message });
    }
  }
);

export default transactionRouter;
