import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import logger from './loggers'
dotenv.config();
import express, { Request,Response,NextFunction } from 'express';
export const generateToken = (payload: any): any => {
    try {
      const token = jwt.sign(payload, process.env.SECRET_KEY);
      if(token){
      logger.info('Token generated successfully')
      return token;
      }
    } catch (error) {
      logger.error('Error when generaring the token')
      throw error;
    }
  };
  
  export const verifyToken = (req:any, res:Response,next:NextFunction): any => {
    try {
    const token =req.headers['authorization'] 
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token authentication is failed' });
      }
      req.user = decoded;
      next();
    });
  
    } catch (error) {
        console.log(error)
      logger.error('Error verifying token:')
      return res.status(500).json({message: 'Internal error'})
    }
  };
  
  export const hashPassword = async (plainPassword: string): Promise<string> => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      return hashedPassword;
    } catch (error) {
      logger.error('Error verifying token:', error)
      throw error;
    }
  };
  