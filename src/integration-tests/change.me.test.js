const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../api/app');
const should = chai.should();

chai.use(chaiHttp);

describe('Testes de integração de receitas', () => {

  it('Deve retornar todas as receitas cadastradas', done => {
    chai.request(app)
      .get('/recipes')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });
});