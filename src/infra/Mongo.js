const mongoUri = require("../environment").mongoUri;
const { MongoClient } = require("mongodb");

async function conectarMongoDB() {
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Conexão estabelecida com sucesso!");
    return client;
  } catch (e) {
    console.log(e);
  }
}

async function desconectaMongoDB(client) {
  if (client) {
    try {
      await client.close();
      console.log("Conexão fechada com sucesso!");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = { conectarMongoDB, desconectaMongoDB };
