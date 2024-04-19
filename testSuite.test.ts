import request  from 'supertest';
import app from './src/app'
import { initializeAppDataSource } from './src/data-source';
var arr;
var id;
var len
let testDataSource:any
   beforeAll(async () => {
     testDataSource= await initializeAppDataSource()
  });

  describe('Checking all api calls',()=>{
    it('Signup call 201',async()=>{
        let user={
            name:'vinay', email:'vinay@gmail.com',password:'123', role:'admin'
        }
        const response= await request(app).post('/signup').send(user)
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('New user created successfully');
    })
    it ('Get call  200', async()=>{
        const response= await request(app).get('/users').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE')
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.users)).toBeTruthy()
        arr=response.body.users
        len=arr.length-1
        id=arr[len].id
    })
    it('Update call 200', async()=>{
        const response= await request(app).put(`/users/${id}`).set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE').send({email:'hello@gmail.com'})
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User updated successfully');
    })
    it('Delete call 200', async()=>{
        const response= await request(app).delete(`/users/${id}`).set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE')
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    })
  })