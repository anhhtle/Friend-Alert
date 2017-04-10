const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('Users', function() {

    before(() => {
        return runServer();
    });

    after(() => {
        return closeServer();
    });

    // POST new User
    it('should add item on POST', () => {
        const newUser = {
            email: 'a@gmail.com',
            password: 'a',
            name: 'name',
        };

        return chai.request(app)
            .post('/user/')
            .send(newUser)
            .then((res) => {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('__v','_id', 'email', 'password', 'name', 'community', 'alertOn', 'alarmTime', 'message', 'contacts');
                res.body.contacts.should.be.a('array');
                res.body.email.should.equal(newUser.email);
                res.body.password.should.equal(newUser.password);
                res.body.name.should.equal(newUser.name);
            })
    }); // end POST

    // PUT update user
    it('should update item on PUT', () => {
        const updateUser = {
            name: 'new name',
            alarmTime: 2
        }

        return chai.request(app)
            .put('/user/a@gmail.com')
            .send(updateUser)
            .then((res) => {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.name.should.equal(updateUser.name);
                res.body.alarmTime.should.equal(updateUser.alarmTime);
            })

    }); // end PUT

    // GET all user
    it('should return user on GET', () => {
        return chai.request(app)
            .get('/user/')
            .then((res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.at.least(1);

                const expectedKeys = ['__v','_id','email', 'password', 'name', 'community', 'alertOn', 'alarmTime', 'message', 'contacts'];
                res.body.forEach((item) => {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            })
    }) // end GET

    // DELETE user
    it('should delete a user', () => {
        return chai.request(app)
            .delete('/user/a@gmail.com')
            .then((res) => {
                res.should.have.status(204);
            })
    }); // end DELETE

}); // end describe