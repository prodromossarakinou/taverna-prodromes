import { PrismaMenuRepository, PrismaOrderRepository } from './prisma';
import { MockOrderRepository } from './mock';

// Change this to 'prisma' to use the real database
const REPO_TYPE = process.env.NODE_ENV === 'production' ? 'prisma' : 'prisma';

export const menuRepository = new PrismaMenuRepository();

export const orderRepository = REPO_TYPE === 'prisma' 
  ? new PrismaOrderRepository() 
  : new MockOrderRepository();
