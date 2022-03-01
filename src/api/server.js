const {
  connection,
} = require('mongoose');

const app = require('./app');

const PORT = 3000;

const startServer = async () => {
  const server = app.listen(PORT, () => console.log(`conectado na porta ${PORT}`));

  process.on('SIGINT', async () => {
    await connection.close();
    console.log('Conexão ao MongoDB encerrada');
    server.close();
    console.log('Servidor do app finalizado');
  });
};

startServer();