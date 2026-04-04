import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationErrors } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import {
  loginSchema,
  logoutSchema,
  signupSchema,
} from '#validations/auth.validations.js';
import { authenticateUser, createUser } from '../services/auth.service.js';

const buildAuthResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(validationResult.error) });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });
    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User signup completed: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user: buildAuthResponse(user),
    });
  } catch (error) {
    logger.error('Error in signup controller:', error);
    if (error.name === 'EmailAlreadyExistsError') {
      return res.status(409).json({ error: 'Email already exists', details: error.message });
    }
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(validationResult.error) });
    }

    const { email, password } = validationResult.data;
    const user = await authenticateUser({ email, password });
    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User sign-in completed: ${email}`);
    res.status(200).json({
      message: 'User logged in successfully',
      user: buildAuthResponse(user),
    });
  } catch (error) {
    logger.error('Error in sign-in controller:', error);
    if (error.name === 'UserNotFoundError' || error.name === 'InvalidCredentialsError') {
      return res.status(401).json({ error: 'Invalid email or password', details: error.message });
    }
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const token = cookies.get(req, 'token') || req.body?.token;
    const validationResult = logoutSchema.safeParse({ token });
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: formatValidationErrors(validationResult.error) });
    }

    cookies.clear(res, 'token');
    logger.info('User sign-out completed');
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    logger.error('Error in sign-out controller:', error);
    next(error);
  }
};
