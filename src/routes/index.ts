import { Router } from 'express';
import TransactionsRoute from './transactions.routes';

const routes = Router();

routes.use('/transactions', TransactionsRoute);

export default routes;
