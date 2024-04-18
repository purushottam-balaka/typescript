
import 'reflect-metadata';
import express, {Request, Response, NextFunction } from 'express';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import logger from '../util/loggers';
import {verifyToken,generateToken,hashPassword} from '../util/token'
import bcrypt from 'bcrypt'

const app = express();
app.use(bodyParser.json());

dotenv.config();
// console.log(process.env.SECRET_KEY)

app.get('/users',verifyToken, async (req:any, res:Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user=await userRepository.findOne({where:{id:req.user}})
    // console.log('User repository',userRepository,user,req.user)
    if (user.role=='admin' || user.role=='reader'){
    const users = await userRepository.find();
    logger.info("Registered users ",users)
    return res.status(200).json(users);
    }
    else{
      logger.info('Not an autheticated action')
      return res.status(401).json({message:'Not an authenticated action'})
    }
  } catch (error) {
    logger.error('Error fetching users',error)
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.post('/signup', async (req:Request, res:Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const name=req.body.name;
    const role=req.body.role;
    const email=req.body.email;
    const password=req.body.password;
    const hash=await hashPassword(password)
     const newUser = userRepository.create({
     name:name,
     email:email,
     password:hash,
     role:role
     });
    // const email=req.body.email;
    // const uniEmail=await userRepository.findOne({where:{email:email}})
    // if(uniEmail){
    //   return res.status(409).json({ message:'User with same email is already existed'})
    // }
      await userRepository.save(newUser);
      logger.info('New user create successfully');
      return res.status(201).json({message:'New user created successfully'});
  } catch (error) {
    logger.error('Error creating user', error)
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/users/:id',verifyToken, async (req:any, res: Response) => {
  try {
    const uid = req.params.id;
    const userRepository = AppDataSource.getRepository(User);
    // console.log('uid:', uid)
    const user = await userRepository.findOne({where:{id:req.user}});
    const toBeUpd=await userRepository.findOne({where:{id:+uid}})
    if( user.role == 'admin' || user.role == 'writer'){
      if (!toBeUpd) {
        logger.warn('User not found')
        return res.status(404).json({ message: 'User not found' });
      }
      toBeUpd.email=req.body.email;
      await userRepository.save(toBeUpd);
      logger.info('User updated successfully')
      return res.status(200).json({message:'User updated successfully',toBeUpd})
    }else{
      logger.warn('Not an authenticated action')
      return res.status(401).json({message: 'Not an authenticated action'})
    }
  } catch (error) {
    logger.error('Error updating user', error)
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/users/:id',verifyToken, async (req:any, res:any) => {
  try {
    const id  = req.params.id;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where:{id:+req.user}});
    const toBeDel=await userRepository.findOne({where:{id:+id}})
    
    if(user.role==='admin' || user.role=== 'writer'){
      if (!toBeDel) {
        logger.warn( 'User not found')
        return res.status(404).json({ message: 'User not found' });
      }
      await userRepository.remove(toBeDel);
      logger.info('User deleted successfully')
      return res.status(200).json({ message: 'User deleted successfully'});
    }
    else{
      logger.warn( 'Not an authenticated action')
      return res.status(401).json({message : 'Not an authenticated action'})
    }
  } catch (error) {
    logger.error('Error deleting user', error)
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

app.post('/login', async(req:Request, res:Response)=>{
  try{
  const email=req.body.email;
  const password=req.body.password;
  const userRepository=await AppDataSource.getRepository(User)
  const user=await userRepository.findOne({where:{email:email}})
  if(!user){
    logger.warn('User not found')
    return res.status(404).json({message:'User not found'})
    }
  else if(email==user.email && await bcrypt.compare(password, user.password)){
    const token=generateToken(user.id)
    logger.info('User loggedin successfully',token)
    return res.status(200).json({ message:'User loggedin successfully',token})
  }
  else{
    logger.warn('Entered Email or Password is wrong')
    return res.status(401).json({message:'Entered Email or Password is wrong'})
  }
  
  }catch(err){
    logger.error('Error in loging the user',err)
    return res.status(500).json({ message:'Error in loging the user',err })
}

})


app.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});

export default app