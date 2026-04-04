import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationErrors } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import {
  deleteUser as deleteUserService,
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from '../services/users.service.js';

const getAuthenticatedUser = (req) => {
  const token = cookies.get(req, 'token');

  if (!token) {
    const error = new Error('Authentication required');
    error.name = 'UnauthorizedError';
    throw error;
  }

  try {
    return jwttoken.verify(token);
  } catch {
    const error = new Error('Invalid authentication token');
    error.name = 'UnauthorizedError';
    throw error;
  }
};

const handleUserError = (error, res, next, context) => {
  logger.error(`Error in ${context}: ${error.message}`);

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized', details: error.message });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({ error: 'Forbidden', details: error.message });
  }

  if (error.name === 'UserNotFoundError') {
    return res.status(404).json({ error: 'User not found', details: error.message });
  }

  next(error);
};

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Received a request to get all users');
    const users = await getAllUsers();
    res.json({
      message: 'Users retrieved successfully',
      users,
      count: users.length,
    });
  } catch (error) {
    handleUserError(error, res, next, 'fetchAllUsers');
  }
};

export const getUserById = async (req, res, next) => {
  try {
    logger.info(`Received a request to get user by id: ${req.params.id}`);
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(validationResult.error) });
    }

    const user = await getUserByIdService(validationResult.data.id);
    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    handleUserError(error, res, next, 'getUserById');
  }
};

export const updateUser = async (req, res, next) => {
  try {
    logger.info(`Received a request to update user: ${req.params.id}`);

    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(paramsValidation.error) });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(bodyValidation.error) });
    }

    const authenticatedUser = getAuthenticatedUser(req);
    const targetUserId = paramsValidation.data.id;
    const updates = { ...bodyValidation.data };

    if (authenticatedUser.role !== 'admin' && authenticatedUser.id !== targetUserId) {
      return res.status(403).json({ error: 'Forbidden', details: 'Users can only update their own information' });
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'role') && authenticatedUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', details: 'Only admin users can change user roles' });
    }

    const updatedUser = await updateUserService(targetUserId, updates);
    logger.info(`User updated successfully: ${updatedUser.id}`);
    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    handleUserError(error, res, next, 'updateUser');
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    logger.info(`Received a request to delete user: ${req.params.id}`);

    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(validationResult.error) });
    }

    const authenticatedUser = getAuthenticatedUser(req);
    const targetUserId = validationResult.data.id;

    if (authenticatedUser.role !== 'admin' && authenticatedUser.id !== targetUserId) {
      return res.status(403).json({ error: 'Forbidden', details: 'Users can only delete their own account' });
    }

    const deletedUser = await deleteUserService(targetUserId);
    logger.info(`User deleted successfully: ${deletedUser.id}`);
    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    handleUserError(error, res, next, 'deleteUser');
  }
};
