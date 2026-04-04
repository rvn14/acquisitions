import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const createAuthError = (name, message) => {
  const error = new Error(message);
  error.name = name;
  return error;
};

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password', { cause: error });
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Failed to compare password', { cause: error });
  }
};

export const createUser = async ({ name, email, password, role }) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw createAuthError('EmailAlreadyExistsError', 'User with this email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });
    logger.info(`User created successfully: ${email}`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    if (error.name === 'EmailAlreadyExistsError') {
      throw error;
    }
    throw new Error('Failed to create user', { cause: error });
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw createAuthError('UserNotFoundError', 'User not found');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createAuthError('InvalidCredentialsError', 'Invalid email or password');
    }

    logger.info(`User authenticated successfully: ${email}`);
    return user;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    if (error.name === 'UserNotFoundError' || error.name === 'InvalidCredentialsError') {
      throw error;
    }
    throw new Error('Failed to authenticate user', { cause: error });
  }
};
