import { signup } from '#controllers/auth.controller.js';
import express from 'express';

const authRoutes = express.Router();

authRoutes.post('/signup', signup);

authRoutes.post('/login', (req, res) => {
  res.send('POST /api/auth/login response'); 
});

authRoutes.post('/logout', (req, res) => {  res.send('POST /api/auth/logout response'); 
});

export default authRoutes;