import express from 'express';
import {
  deleteUser,
  fetchAllUsers,
  getUserById,
  updateUser,
} from '#controllers/users.controller.js';

const userRoutes = express.Router();

userRoutes.get('/', fetchAllUsers);
userRoutes.get('/:id', getUserById);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);

export default userRoutes;
