"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express = require("express");
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const loggers_1 = require("../util/loggers");
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
const hashPassword = (plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saltRounds = 10;
        const hashedPassword = yield bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    }
    catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
});
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({ where: { id: req.user } });
        // console.log('User repository',userRepository)
        if (user.role == 'admin' || user.role == 'reader') {
            const users = yield userRepository.find();
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
}));
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const name = req.body.name;
        const role = req.body.role;
        const email = req.body.email;
        const password = req.body.password;
        const hash = yield hashPassword(password);
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
        yield userRepository.save(newUser);
        loggers_1.default.info('New user create successfully');
        return res.status(201).json('New user create successfully');
    }
    catch (error) {
        loggers_1.default.error('Error creating user', error);
        return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
}));
app.put('/users/:id', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uid = req.params.id;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // console.log('uid:', uid)
        const user = yield userRepository.findOne({ where: { id: req.user } });
        const toBeUpd = yield userRepository.findOne({ where: { id: uid } });
        if (user.role == 'admin' || user.role == 'writer') {
            if (!toBeUpd) {
                loggers_1.default.warn('User not found');
                return res.status(404).json({ message: 'User not found' });
            }
            toBeUpd.email = req.body.email;
            yield userRepository.save(toBeUpd);
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
}));
app.delete('/users/:id', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({ where: { id: req.user } });
        const toBeDel = yield userRepository.findOne({ where: { id: id } });
        if (user.role == 'admin' || user.role === 'writer') {
            if (!toBeDel) {
                loggers_1.default.warn('User not found');
                return res.status(404).json({ message: 'User not found' });
            }
            yield userRepository.remove(toBeDel);
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
}));
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
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userRepository = yield data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({ where: { email: email } });
        if (!user) {
            loggers_1.default.warn('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        else if (email == user.email && (yield bcrypt.compare(password, user.password))) {
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
}));
app.listen(process.env.PORT, () => {
    loggers_1.default.info(`Server is running on port ${process.env.PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map