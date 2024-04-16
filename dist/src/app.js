"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express = __importStar(require("express"));
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const bodyParser = __importStar(require("body-parser"));
const dotenv = __importStar(require("dotenv"));
const loggers_1 = __importDefault(require("../util/loggers"));
const app = express();
app.use(bodyParser.json());
dotenv.config();
const generateToken = (payload) => {
    try {
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        loggers_1.default.info('Token generated successfully');
        return token;
    }
    catch (error) {
        loggers_1.default.error('Error when generaring the token');
        throw error;
    }
};
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token authentication is failed' });
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        console.error('Error verifying token:', error);
        throw error;
    }
};
const hashPassword = async (plainPassword) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    }
    catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};
app.get('/users', async (req, res) => {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user } });
        // console.log('User repository',userRepository)
        if (user.role == 'admin' || user.role == 'reader') {
            const users = await userRepository.find();
            loggers_1.default.info("Registered users ", users);
            return res.status(200).json(users);
        }
        else {
            loggers_1.default.info('Not an autheticated action');
            return res.status(401).json({ message: 'Not an authenticated action' });
        }
    }
    catch (error) {
        loggers_1.default.error('Error fetching users');
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});
app.post('/signup', async (req, res) => {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const name = req.body.name;
        const role = req.body.role;
        const email = req.body.email;
        const password = req.body.password;
        const hash = await hashPassword(password);
        const newUser = userRepository.create({
            name: name,
            email: email,
            password: hash,
            role: role
        });
        // const email=req.body.email;
        // const uniEmail=await userRepository.findOne({where:{email:email}})
        // if(uniEmail){
        //   return res.status(409).json({ message:'User with same email is already existed'})
        // }
        await userRepository.save(newUser);
        loggers_1.default.info('New user create successfully');
        return res.status(201).json('New user create successfully');
    }
    catch (error) {
        loggers_1.default.error('Error creating user', error);
        return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});
app.put('/users/:id', verifyToken, async (req, res) => {
    try {
        const uid = req.params.id;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // console.log('uid:', uid)
        const user = await userRepository.findOne({ where: { id: req.user } });
        const toBeUpd = await userRepository.findOne({ where: { id: uid } });
        if (user.role == 'admin' || user.role == 'writer') {
            if (!toBeUpd) {
                loggers_1.default.warn('User not found');
                return res.status(404).json({ message: 'User not found' });
            }
            toBeUpd.email = req.body.email;
            await userRepository.save(toBeUpd);
            loggers_1.default.info('User updated successfully');
            return res.status(200).json(toBeUpd);
        }
        else {
            loggers_1.default.warn('Not an authenticated action');
            return res.status(401).json({ message: 'Not an authenticated action' });
        }
    }
    catch (error) {
        loggers_1.default.error('Error updating user', error);
        return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});
app.delete('/users/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user } });
        const toBeDel = await userRepository.findOne({ where: { id: id } });
        if (user.role == 'admin' || user.role === 'writer') {
            if (!toBeDel) {
                loggers_1.default.warn('User not found');
                return res.status(404).json({ message: 'User not found' });
            }
            await userRepository.remove(toBeDel);
            loggers_1.default.info('User deleted successfully');
            return res.status(200).json({ message: 'User deleted successfully' });
        }
        else {
            loggers_1.default.warn('Not an authenticated action');
            return res.status(401).json({ message: 'Not an authenticated action' });
        }
    }
    catch (error) {
        loggers_1.default.error('Error deleting user', error);
        return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});
// app.get('/users/:id', verifyToken,async(req, res)=>{
//   try{
//       const id=req.params.id;
//       const userRepository=await AppDataSource.getRepository(User);
//       const user=await userRepository.findOne({where:{id:req.user}});
//       const toBeGet=await userRepository.findOne({where:{id:id}})
//       if(user.role === 'admin' || user.role=== 'reader'){
//         if(!toBeGet){
//           return res.status(404).json({ message: 'User does not exist'})
//         }
//         const users=await userRepository.find()
//         return res.status(200).json(users)
//       }
//       else
//         return res.status(401).json({message:'Not an authenticated action'})
//   }catch(error){
//     return res.status(500).json({ message:'Error getting specific user', error: error.message })
//   }
// })
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userRepository = await data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { email: email } });
        if (!user) {
            loggers_1.default.warn('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        else if (email == user.email && await bcrypt.compare(password, user.password)) {
            const token = generateToken(user.id);
            loggers_1.default.info('User loggedin successfully', token);
            return res.status(200).json({ message: 'User loggedin successfully', token });
        }
        else {
            loggers_1.default.warn('Entered Email or Password is wrong');
            return res.status(401).json({ message: 'Entered Email or Password is wrong' });
        }
    }
    catch (err) {
        loggers_1.default.error('Error in loging the user', err);
        return res.status(500).json({ message: 'Error in loging the user', err });
    }
});
app.listen(process.env.PORT, () => {
    loggers_1.default.info(`Server is running on port ${process.env.PORT}`);
});
exports.default = app;
