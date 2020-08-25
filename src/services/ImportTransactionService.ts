import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';
import CreateCategoryServices from './CreateCategoryServices';
import AppError from '../errors/AppError';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionService {
  public async execute(filePath: string): Promise<void> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const csvFile = path.resolve(filePath);
    const readStream = fs.createReadStream(csvFile);

    const parseStream = csvParse({
      fromLine: 2,
      delimiter: ',',
      ltrim: true,
      rtrim: true,
    });

    const parseCsv = readStream.pipe(parseStream);

    const transactions: CsvTransaction[] = [];

    const categories: string[] = [];

    parseCsv.on('data', async (line) => {
      const [title, type, value, category] = line.map((cell: string) => {
        return cell.trim();
      });

      if (!title || !type || !value || !category) return;

      transactions.push({
        title,
        type,
        value,
        category,
      });

      categories.push(category);
    });

    await new Promise((resolve) => parseCsv.on('end', resolve));

    fs.promises.unlink(filePath);

    const existedCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const existedCategroyTitles = existedCategories.map(
      (category: Category) => category.title
    );

    const categoriesToInsert = categories
      .filter((c) => !existedCategroyTitles.includes(c))
      .filter((actual, index, mySelf) => mySelf.indexOf(actual) === index);

    const newCategories = categoryRepository.create(
      categoriesToInsert.map((title) => ({
        title,
      }))
    );

    try {
      await categoryRepository.save(newCategories);

      const finalCategories = [...newCategories, ...existedCategories];

      const newTransactions = transactionRepository.create(
        transactions.map((t) => ({
          title: t.title,
          value: t.value,
          type: t.type,
          category_id: finalCategories.find(
            (category) => category.title === t.title
          ),
        }))
      );

      await transactionRepository.save(newTransactions);
    } catch (error) {
      console.log(`erro = ${error.message}`);
    }

    // console.log(newCategories);
    // // await transactionRepository.save(transaction);
    // // console.log(`transaction sved = ${transaction}`);
    // await fs.promises.unlink(filePath);
  }
}

export default ImportTransactionService;
