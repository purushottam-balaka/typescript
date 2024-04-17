import request  from 'supertest';
import app from './src/app'

describe('/users',()=>{

    it ('Get call for login', async()=>{
        const response= await request(app).get('/users');
        console.log(response)
        // expect(response.status).toBe(200)
        // expect(response.body.message).toBe('User loggedin successfully')
    })
})