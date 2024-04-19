import request  from 'supertest';
import app from './src/app'
import { initializeAppDataSource } from './src/data-source';

let testDataSource:any
   beforeAll(async () => {
     testDataSource= await initializeAppDataSource()
  });
  
//   afterAll(async () => {
//     await testDataSource.close(); 
//   });


    describe('/users',()=>{

        it ('Get call for login 200', async()=>{
            const response= await request(app).get('/users').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE')
            // console.log('response  :',response)
            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBeTruthy()
        })
        it('Get call, Return 401',async()=>{
            const response= await request(app).get('/users').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzE.C2zqPKzZNjyOVY34e2l68zOUgrlF8xBZi5rGRuY9YRc')
            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Not an authenticated action')
        })
        it('Get  call 403',async()=>{
            const response=await request(app).get('/users')
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message','Token authentication is failed');
        })
    })
    describe('/users',()=>{
        it('Update call 200', async()=>{
            const response= await request(app).put('/users/34').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE').send({email:'hello@gmail.com'})
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User updated successfully');
        })
        it('Update call, return 401', async()=>{
            const response= await request(app).put('/users/34').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzE.C2zqPKzZNjyOVY34e2l68zOUgrlF8xBZi5rGRuY9YRc')
            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Not an authenticated action')
        })
        it('Update call 403',async()=>{
            const response=await request(app).put('/users/34')
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message','Token authentication is failed');
        })
        it('Update call, return 404', async()=>{
            const response= await request(app).put('/users/1').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE').send({id:32})
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found')
        })
    })
    describe('/users',()=>{
        it('Delete call 200', async()=>{
            const response= await request(app).delete('/users/44').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE')
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User deleted successfully');
        })
        it('Delete call, return 401', async()=>{
            const response= await request(app).delete('/users/44').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzE.C2zqPKzZNjyOVY34e2l68zOUgrlF8xBZi5rGRuY9YRc')
            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Not an authenticated action')
        })
        it('Delete call 403',async()=>{
            const response=await request(app).delete('/users/44');
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message','Token authentication is failed');
        })
        it('Delete call 404', async()=>{
            const response= await request(app).delete('/users/1').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.Mjk.cHAlaYKwkHK1MmsCe5eZfTf67Q10h0FPBqkLFBlRKNE').send({id:32})
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found')
        })
    })
    describe('Login call',()=>{
        it('For login call 200', async()=>{
            let user={
                email:'ajay@gmail.com', password:'123'
            }
            const response= await request(app).post('/login').send(user)
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User loggedin successfully');
            expect(response.body.token).toBeTruthy();
        })
        it('login call 401', async()=>{
            let user={
                email:'ajay@gmail.com', password:'321'
            }
            const response=await request(app).post('/login').send(user)
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message','Entered Email or Password is wrong' )
        })
        it('login call 404', async()=>{
            let user={
                email:'jay@gmail.com', password:'123'
            }
            const response= await request(app).post('/login').send(user)
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found')
        })
    })
    describe('Signup call', ()=>{
        let user={
            name:'suresh', email:'suresh@gmail.com',password:'123', role:'admin'
        }
        it('For signup call 201',async()=>{
            const response= await request(app).post('/signup').send(user)
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('New user created successfully');
        })
    })
