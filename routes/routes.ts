
import 'reflect-metadata';
import express, {Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import logger from '../util/loggers';

dotenv.config();

const app=express()

  export default app