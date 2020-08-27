import { getRepository } from 'typeorm';

import Category from '../models/Category';

interface Request {
  title: string;
}
class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const repository = getRepository(Category, 'default');

    const category = await repository.findOne({ where: { title } });
    if (!category) {
      const newCategory = repository.create({ title });
      await repository.save(newCategory);

      return newCategory;
    }

    return category;
  }
}
export default CreateCategoryService;
