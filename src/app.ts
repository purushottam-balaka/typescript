
import 'reflect-metadata';
import * as express from 'express';
import { AppDataSource } from './data-source';
import { User } from './entity/User';

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
    await userRepository.save(newUser);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const uid = req.params;
    const userRepository = AppDataSource.getRepository(User);
    console.log('userRepository::', userRepository)
    const user = await userRepository.findOne({where:{id:uid}});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userRepository.save(user);
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({where:{id:id}});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userRepository.delete(id);
    return res.status(304).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

const PORT = 9000;
app.listen(PORT, () => {
  console.log('Server is running on port 9000');
});
