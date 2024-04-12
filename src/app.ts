
import 'reflect-metadata';
import * as express from 'express';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as bodyParser from 'body-parser'
// eyJhbGciOiJIUzI1NiJ9.MjY.o2AfwNJhgi0sYWr4Zvjn48popdWeczLZ7etMkd-m5lQ
const app = express();

app.use(bodyParser.json());

const SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const generateToken = (payload: any): string => {
  try {
    const token = jwt.sign(payload, SECRET_KEY);
    console.log('token', token)
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

const verifyToken = (req, res,next): any => {
  try {
  const token=req.headers['authorization'] 
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });

  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

const hashPassword = async (plainPassword: string): Promise<string> => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

app.get('/users',verifyToken, async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user=await userRepository.findOne({where:{id:req.user}})
    // console.log('User repository',userRepository)
    if (user.role=='admin' || user.role=='reader'){
    const users = await userRepository.find();
    return res.status(200).json(users);
    }
    else{
      return res.status(401).json({message:'Not an authenticated action'})
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.post('/signup', async (req, res) => {
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
      return res.status(201).json('New user create successfully');
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/users/:id',verifyToken, async (req, res) => {
  try {
    const uid = req.params.id;
    const userRepository = AppDataSource.getRepository(User);
    // console.log('uid:', uid)
    const user = await userRepository.findOne({where:{id:req.user}});
    const toBeUpd=await userRepository.findOne({where:{id:uid}})
    
    if( user.role === 'admin' || user.role === 'writer'){
      if (!toBeUpd) {
        return res.status(404).json({ message: 'User not found' });
      }
      toBeUpd.email=req.body.email;
      await userRepository.save(toBeUpd);
      return res.status(200).json(toBeUpd)
    }else{
      return res.status(401).json({message: 'Not an authenticated action'})
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/users/:id',verifyToken, async (req, res) => {
  try {
    const id  = req.params.id;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where:{id:req.user}});
    const toBeDel=await userRepository.findOne({where:{id:id}})
    
    if(user.role== 'admin' || user.role=== 'writer'){
      if (!toBeDel) {
        return res.status(404).json({ message: 'User not found' });
      }
      await userRepository.remove(toBeDel);
      return res.status(200).json({ message: 'User deleted successfully'});
    }
    else{
      return res.status(401).json({message : 'Not an authenticated action'})
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

app.get('/users/:id', verifyToken,async(req, res)=>{
  try{
      const id=req.params.id;
      const userRepository=await AppDataSource.getRepository(User);
      const user=await userRepository.findOne({where:{id:req.user}});
      const toBeGet=await userRepository.findOne({where:{id:id}})
      
      if(user.role === 'admin' || user.role=== 'reader'){
        if(!toBeGet){
          return res.status(404).json({ message: 'User does not exist'})
        }
        const users=await userRepository.find()
        return res.status(200).json(users)
      }
      else
        return res.status(401).json({message:'Not an authenticated action'})
  }catch(error){
    return res.status(500).json({ message:'Error getting specific user', error: error.message })
  }
})

app.post('/login', async(req, res)=>{
  try{
  const email=req.body.email;
  const password=req.body.password;
  const userRepository=await AppDataSource.getRepository(User)
  const user=await userRepository.findOne({where:{email:email}})
  // console.log('user',user)
  if(!user)
    return res.status(404).json({message:'User not found'})
  else if(email==user.email && await bcrypt.compare(password, user.password)){
    const token=generateToken(user.id)
    return res.status(200).json({ message:'User loggedin successfully',token})
  }
  else{
    return res.status(401).json({message:'Entered Email or Password is wrong'})
  }
  
  }catch(err){
    return res.status(500).json({ message:'Error in loging the user',err })
}

})

const PORT = 9000;
app.listen(PORT, () => {
  console.log('Server is running on port 9000');
});
