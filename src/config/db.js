const {
  connect,
} = require('mongoose');

const DB_NAME = 'Cookmaster';
const MONGO_DB_URL = `mongodb://localhost:27017/${DB_NAME}`;

const connectToDB = async () => {
  await connect(MONGO_DB_URL);
  console.log(`Aplicação conectada ao banco ${DB_NAME}`);
};

module.exports = {
  connectToDB,
};