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

        it ('Get call for login', async()=>{
            const response= await request(app).get('/users').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzA.TU9DqsSKSizrmVLhW8c3ETfOS4sHoa4cmDctoz2j6WA')
            // console.log('response  :',response)
            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBeTruthy()
        })
    })
    // describe('/users',()=>{
    //     it('Post call ', async()=>{
    //         const response= await request(app).post('/users').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzI.Gf3NcHpgkKcLZaWc0c1NpIV5gCoPWKY-0HAvZKZfEaw')
    //         expect(response.status).toBe(201);
    //         expect(response.body.message).toBe('User created successfully')
    //     })
    // })
    describe('/users',()=>{
        it('Update call', async()=>{
            const response= await request(app).put('/users/33').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzA.TU9DqsSKSizrmVLhW8c3ETfOS4sHoa4cmDctoz2j6WA').send({email:'hello@gmail.com'})
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User updated successfully');
        })
    })
    describe('/users',()=>{
        it('Delete call', async()=>{
            const response= await request(app).delete('/users/32').set('Authorization', 'eyJhbGciOiJIUzI1NiJ9.MzA.TU9DqsSKSizrmVLhW8c3ETfOS4sHoa4cmDctoz2j6WA')
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User deleted successfully');
        })
    })
    describe('Login call',()=>{
        it('For login call', async()=>{
            let user={
                email:'ajay@gmail.com', password:'123'
            }
            const response= await request(app).post('/login').send(user)
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User loggedin successfully');
            expect(response.body.token).toBeTruthy();
        })
    })
    describe('Signup call', ()=>{
        it('For signup call',async()=>{
            let user={
                name:'hari1', email:'hari1@gmail.com',password:'123', role:'admin'
            }
            const response= await request(app).post('/signup').send(user)
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('New user created successfully');
        })
    })