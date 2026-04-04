import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { hashPassword } from './auth.service.js';

const createUserServiceError = (name, message) => {
  const error = new Error(message);
  error.name = name;
  return error;
};

const publicUserSelection = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const getAllUsers = async () => {
  try {
    return await db.select(publicUserSelection).from(users);
  } catch (error) {
    logger.error(`Error in getAllUsers: ${error.message}`);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db.select(publicUserSelection).from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      throw createUserServiceError('UserNotFoundError', 'User not found');
    }

    return user;
  } catch (error) {
    logger.error(`Error in getUserById: ${error.message}`);
    if (error.name === 'UserNotFoundError') {
      throw error;
    }
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    await getUserById(id);

    const nextUpdates = { ...updates };
    if (nextUpdates.password) {
      nextUpdates.password = await hashPassword(nextUpdates.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...nextUpdates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning(publicUserSelection);

    return updatedUser;
  } catch (error) {
    logger.error(`Error in updateUser: ${error.message}`);
    if (error.name === 'UserNotFoundError') {
      throw error;
    }
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const user = await getUserById(id);

    await db.delete(users).where(eq(users.id, id));

    return user;
  } catch (error) {
    logger.error(`Error in deleteUser: ${error.message}`);
    if (error.name === 'UserNotFoundError') {
      throw error;
    }
    throw error;
  }
};
