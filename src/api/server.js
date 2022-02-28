const {
  connection,
} = require('mongoose');

const {
  connectToDB,
} = require('../config/db');
const app = require('./app');

const PORT = 3000;

const startServer = async () => {
  await connectToDB();

  const server = app.listen(PORT, () => console.log(`conectado na porta ${PORT}`));

  process.on('SIGINT', async () => {
    await connection.close();
    console.log('Conexão ao MongoDB encerrada');
    server.close();
    console.log('Servidor do app finalizado');
  });
};

startServer();