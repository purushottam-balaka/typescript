
import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { createConnection } from 'typeorm';
import { User } from './entity/User';

const app = express();

app.use(express.json());

app.get('/users', async (req: Request, res: Response) => {
  try {
    const userRepository = createConnection().getRepository(User);
    const users = await userRepository.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const userRepository = createConnection().getRepository(User);
    const newUser = userRepository.create(req.body);
    await userRepository.save(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = createConnection().getRepository(User);
    const user = await userRepository.findOne(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    userRepository.merge(user, req.body);
    const updatedUser = await userRepository.save(user);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = createConnection().getRepository(User);
    const user = await userRepository.findOne(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userRepository.delete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log('Server is running on port 4000');
});
