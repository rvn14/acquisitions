import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20; 
        message = 'Admin access - generous limits applied';
        break;
      case 'user':
        limit = 10;
        message = 'User access - standard limits applied';
        break;  
      case 'guest':
        limit = 10;
        message = 'Guest access - strict limits applied';
        break;
    }
    const client = aj.withRule([
      slidingWindow({ mode: 'LIVE', interval: 60, max: limit, name: `Rate limit for ${role}`, message })
    ]);
    const decision  = await client.protect(req);
    if (decision.isDenied() && decision.reason.isBot()){
      logger.warn('Bot request block', {ip: req.ip, userAgent: req.get('User-Agent'), path:req.path});
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Malicious request block', {ip: req.ip, userAgent: req.get('User-Agent'), path:req.path, method: req.method});
    }

    next();

  } catch (error) {
    console.error('Error in security middleware:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error in security middleware' });
  }
};