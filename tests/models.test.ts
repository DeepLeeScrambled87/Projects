import 'dotenv/config';
import { upsertCategory, upsertAuth, prisma, pool } from '../prisma/seed';

describe('Model Helpers', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should upsert a category', async () => {
    const category = await upsertCategory('Test Category');
    expect(category).toBeDefined();
    expect(category.name).toBe('Test Category');
  });

  it('should upsert an auth method', async () => {
    const auth = await upsertAuth('Test Auth');
    expect(auth).toBeDefined();
    expect(auth.name).toBe('Test Auth');
  });
});
