import { signIn, signOut, signup } from '#controllers/auth.controller.js';
import express from 'express';

const authRoutes = express.Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', signIn);
authRoutes.post('/logout', signOut);

export default authRoutes;
