
import 'reflect-metadata';
import * as express from 'express';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { where } from 'sequelize';

const app = express();

app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    // console.log('User repository',userRepository)
    const users = await userRepository.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const newUser = userRepository.create(req.body);
    const role=req.body.role
    // const email=req.body.email;
    // const uniEmail=await userRepository.findOne({where:{email:email}})
    // if(uniEmail){
    //   return res.status(409).json({ message:'User with same email is already existed'})
    // }
    if( role=='admin' || role=== 'writer'){
      await userRepository.save(newUser);
      return res.status(201).json(newUser);
    }
    else{
      return res.status(200).json({ message: 'Not an authenticated action'})
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const uid = req.params.id;
    const userRepository = AppDataSource.getRepository(User);
    // console.log('uid:', uid)
    const user = await userRepository.findOne({where:{id:uid}});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if( user.role === 'admin' || user.role === 'writer'){
      user.email=req.body.email;
      await userRepository.save(user);
      return res.status(200).json(user)
    }else{
      return res.status(200).json({message: 'Not an authenticated action'})
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const id  = req.params.id;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where:{id:id}});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if(user.role== 'admin' || user.role=== 'writer'){
      await userRepository.remove(user);
      return res.status(200).json({ message: 'User deleted successfully'});
    }
    else{
      return res.status(200).json({message : 'Not an authenticated action'})
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

app.get('/users/:id', async(req, res)=>{
  try{
      const id=req.params.id;
      const userRepository=await AppDataSource.getRepository(User);
      const user=await userRepository.findOne({where:{id:id}});
      if(!user){
        return res.status(404).json({ message: 'User does not exist'})
      }
      if(user.role === 'admin' || user.role=== 'reader'){
        const users=await userRepository.find()
        return res.status(200).json(users)
      }
      else
        return res.status(200).json({message:'Not an authenticated action'})
  }catch(error){
    return res.status(500).json({ message:'Error getting specific user', error: error.message })
  }
})

const PORT = 9000;
app.listen(PORT, () => {
  console.log('Server is running on port 9000');
});
