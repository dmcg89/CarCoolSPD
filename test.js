const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./app');
const should = chai.should();
const Ride = require('./models/ride');

const sampleRide =     {
    "route": "route",
    "description": "description",
    "time": "time"
}

chai.use(chaiHttp);

describe('Ride', ()  => {

    after(() => {
        Ride.deleteMany({route: 'route'}).exec((err, rides) => {
            console.log(rides)
            rides.remove();
        })
    });

    // TEST INDEX
    it('should index ALL rides on / GET', (done) => {
        chai.request(server)
        .get('/')
        .end((err, res) => {
            res.should.have.status(200);
            res.should.be.html;
            done();
        });
    });

    // TEST NEW
    it('should display new form on /rides/new GET', (done) => {
        chai.request(server)
        .get(`/rides/new`)
        .end((err, res) => {
            res.should.have.status(200);
            res.should.be.html
            done();
        });
    });
    // TEST SHOW
    it('should show a SINGLE ride on /rides/<id> GET', (done) => {
        var ride = new Ride(sampleRide);
        ride.save((err, data) => {
            chai.request(server)
            .get(`/rides/view/${ride._id}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html
                done();
            });
        });
    });
    // TEST EDIT
    it('should edit a SINGLE ride on /rides/<id>/edit GET', (done) => {
        var ride = new Ride(sampleRide);
        ride.save((err, data) => {
            chai.request(server)
            .get(`/rides/view/${ride._id}/edit`)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html
                done();
            });
        });
    });
    // TEST CREATE
    it('should create a SINGLE ride on /rides POST', (done) => {
        chai.request(server)
        .post('/rides/view')
        .send(sampleRide)
        .end((err, res) => {
            res.should.have.status(200);
            res.should.be.html
            done();
        });
    });

    // TEST UPDATE
    it('should update a SINGLE ride on /rides/<id> PUT', (done) => {
        var ride = new Ride(sampleRide);
        ride.save((err, data)  => {
            chai.request(server)
            .put(`/rides/view/${ride._id}?_method=PUT`)
            .send({'title': 'Updating the title'})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html
                done();
            });
        });
    });

    // TEST DELETE
    it('should delete a SINGLE ride on /rides/<id> DELETE', (done) => {
        var ride = new Ride(sampleRide);
        ride.save((err, data)  => {
            chai.request(server)
            .delete(`/rides/view/${ride._id}?_method=DELETE`)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.html
                done();
            });
        });
    });
});
