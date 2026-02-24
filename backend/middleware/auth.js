import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', ''); // Expecting Bearer <token>
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing, Access denied' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: decoded.id, email: decoded.email}; // Attach user info to request object
        next();

    } catch (err) {
        console.error('Authentication Middleware error:', err);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authMiddleware;