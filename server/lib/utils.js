import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // ✅ Using 'id' to match middleware
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};