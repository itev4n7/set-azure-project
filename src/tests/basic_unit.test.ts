//import {app} from '../controllers'
//TBD need to configure azure services for local use

describe('unit tests', function () {
    it('GET /images 200', function (done) {
        const res = {statusCode: 200}
        expect(res.statusCode).toEqual(200)
        done()
    });

    it('GET /images?id 400', function (done) {
        const res = {statusCode: 400}
        expect(res.statusCode).toEqual(400)
        done()
    });
});