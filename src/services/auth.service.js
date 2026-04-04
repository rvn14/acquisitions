import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password', { cause: error });
  }
};

export const createUser = async ({ name, email, password, role }) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      throw new Error('user with this email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db.insert({ name, email, password: hashedPassword, role }).into(users).returning({id: users.id, email: users.email, role: users.role});
    logger.info(`User created successfully: ${email}`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Failed to create user', { cause: error });
  }
};