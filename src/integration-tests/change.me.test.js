const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const {
  readFileSync
} = require('fs');

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const app = require('../api/app');
const user = require('./data/user.json');
const invalidUser = require('./data/invaliduser.json');
const invalidEmailUser = require('./data/invalidemailuser.json');
const admin = require('./data/admin.json');
const recipe = require('./data/recipe.json');

chai.use(chaiHttp);

describe('Testes de integracao de usuarios', () => {
  beforeEach(done => {
    User.remove({}, err => done());
  });

  it('Deve cadastrar um usuario valido', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      });
  });

  it('Nao deve cadastrar um usuario com campos invalidos', done => {
    chai.request(app)
      .post('/users')
      .send(invalidUser)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('Nao deve cadastrar um usuario com e-mail invalido', done => {
    chai.request(app)
      .post('/users')
      .send(invalidEmailUser)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('Nao deve cadastrar um usuario com e-mail ja existente', done => {
    User.create(user, (err, result) => {
      chai.request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
  });

  it('Deve permitir o cadastro de um admin feito por um admin', done => {
    User.create(admin, (err, result) => {
      chai.request(app)
        .post('/login')
        .send({
          email: admin.email,
          password: admin.password
        })
        .end((err, res) => {
          const {
            token
          } = res.body;

          chai.request(app)
            .post('/users/admin')
            .set('Authorization', token)
            .send(user)
            .end((err, res) => {
              res.should.have.status(201);
              done();
            });
        });
    });
  });

  it('Nao deve permitir o cadastro de um admin feito por um usuario nao admin', done => {
    User.create(user, (err, result) => {
      chai.request(app)
        .post('/login')
        .send({
          email: user.email,
          password: user.password
        })
        .end((err, res) => {
          const {
            token
          } = res.body;

          chai.request(app)
            .post('/users/admin')
            .set('Authorization', token)
            .send(admin)
            .end((err, res) => {
              res.should.have.status(403);
              done();
            });
        });
    });
  });

  it('Nao deve permitir o cadastro de um admin sem passar o token', done => {
    User.create(admin, (err, result) => {
      chai.request(app)
        .post('/login')
        .send({
          email: admin.email,
          password: admin.password
        })
        .end((err, res) => {
          const {
            token
          } = res.body;

          chai.request(app)
            .post('/users/admin')
            .send(user)
            .end((err, res) => {
              res.should.have.status(403);
              done();
            });
        });
    });
  });
});

describe('Testes de integracao de login', () => {
  beforeEach(done => {
    User.remove({}, err => done());
  });

  it('Deve realizar o login com credenciais validas', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
  });

  it('Nao deve realizar o login com credenciais invalidas', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: 'banana'
          })
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
  });

  it('Nao deve realizar o login com credenciais incompletas', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email
          })
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
  });
});

describe('Testes de integracao de receitas', () => {

  beforeEach(done => {
    Recipe.remove({}, err => done());
  });

  it('Deve retornar todas as receitas cadastradas', done => {
    chai.request(app)
      .get('/recipes')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });

  it('Deve cadastrar uma receita com campos e usuario valido', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                res.should.have.status(201);
                done();
              });
          });
      });
  });

  it('Nao deve cadastrar uma receita com um token invalido', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            chai.request(app)
              .post('/recipes')
              .set('Authorization', 'banana')
              .send(recipe)
              .end((err, res) => {
                res.should.have.status(401);
                done();
              });
          });
      });
  });

  it('Nao deve cadastrar uma receita com dados ausentes', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send({
                name: 'Frango'
              })
              .end((err, res) => {
                res.should.have.status(400);
                done();
              });
          });
      });
  });

  it('Deve listar uma receita previamente cadastrada', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .get(`/recipes/${_id}`)
                  .end((err, res) => {
                    res.should.have.status(200);
                    done();
                  });
              });
          });
      });
  });

  it('Nao deve listar uma receita nao previamente cadastrada', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .get(`/recipes/900`)
                  .end((err, res) => {
                    res.should.have.status(404);
                    done();
                  });
              });
          });
      });
  });

  it('Deve permitir a edicao de uma receita pelo seu usuario dono previamente autenticado', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .put(`/recipes/${_id}`)
                  .set('Authorization', token)
                  .send({
                    name: 'Torta de frango',
                    ingredients: 'farinha de trigo, frango e temperos',
                    preparation: 'misture tudo e asse'
                  })
                  .end((err, res) => {
                    res.should.have.status(200);
                    done();
                  });
              });
          });
      });
  });

  it('Nao deve permitir a edicao de uma receita sem o token do usuario dono autenticado', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .put(`/recipes/${_id}`)
                  .send({
                    name: 'Torta de frango',
                    ingredients: 'farinha de trigo, frango e temperos',
                    preparation: 'misture tudo e asse'
                  })
                  .end((err, res) => {
                    res.should.have.status(401);
                    done();
                  });
              });
          });
      });
  });

  it('Nao deve permitir a edicao de uma receita com um token invalido', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .put(`/recipes/${_id}`)
                  .set('Authorization', 'banana')
                  .send({
                    name: 'Torta de frango',
                    ingredients: 'farinha de trigo, frango e temperos',
                    preparation: 'misture tudo e asse'
                  })
                  .end((err, res) => {
                    res.should.have.status(401);
                    done();
                  });
              });
          });
      });
  });

  it('Deve permitir a exclusao de uma receita pelo seu usuario dono previamente autenticado', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .delete(`/recipes/${_id}`)
                  .set('Authorization', token)
                  .end((err, res) => {
                    res.should.have.status(204);
                    done();
                  });
              });
          });
      });
  });

  it('Nao deve permitir a exclusao de uma receita sem o token do usuario dono autenticado', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .delete(`/recipes/${_id}`)
                  .end((err, res) => {
                    res.should.have.status(401);
                    done();
                  });
              });
          });
      });
  });

  it('Deve adicionar uma imagem a uma receita previamente cadastrada', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .put(`/recipes/${_id}/image`)
                  .attach('image', readFileSync(`${__dirname}/data/ratinho.jpg`))
                  .set('Authorization', token)
                  .set('Content-Type', 'image/jpeg')
                  .end((err, res) => {
                    res.should.have.status(200);
                    done();
                  });
              });
          });
      });
  });

  it('Nao deve adicionar uma imagem a uma receita previamente cadastrada sem o token do usuario autenticado', done => {
    chai.request(app)
      .post('/users')
      .send(user)
      .end((err, res) => {
        chai.request(app)
          .post('/login')
          .send({
            email: user.email,
            password: user.password
          })
          .end((err, res) => {
            const {
              token
            } = res.body;

            chai.request(app)
              .post('/recipes')
              .set('Authorization', token)
              .send(recipe)
              .end((err, res) => {
                const {
                  _id
                } = res.body.recipe;

                chai.request(app)
                  .put(`/recipes/${_id}/image`)
                  .attach('image', readFileSync(`${__dirname}/data/ratinho.jpg`))
                  .set('Content-Type', 'image/jpeg')
                  .end((err, res) => {
                    res.should.have.status(401);
                    done();
                  });
              });
          });
      });
  });
});