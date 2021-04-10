const TelegramBot = require("node-telegram-bot-api");
const emoji = require("node-emoji").emoji;

const token = require("./environment").token;
const bot = new TelegramBot(token, { polling: true });

const Mongo = require("./infra/Mongo");

const Scraper = require("./scraper");

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "/echo") {
    bot.sendMessage(
      chatId,
      "Pensamento do dia: quem nasceu primeiro, o ovo ou a galinha?"
    );
  } else if (msg.text === "/subscribe") {
    try {
      let client = await Mongo.conectarMongoDB();
      let db = client.db("projetoBot");
      let collection = db.collection("users");
      let usuarios = await collection.find({}).toArray();
      for (usuario of usuarios) {
        if (chatId == usuario.telegramId) {
          bot.sendMessage(chatId, "Você já está inscrito para atualizações!");
          await Mongo.desconectaMongoDB(client);
          return;
        }
      }
      let camarada = {
        telegramId: chatId,
        nome: msg.chat.first_name,
        sobrenome: msg.chat.last_name,
        dataCadastro: new Date(),
      };
      collection.insertOne(camarada, async (err, resultado) => {
        if (err) {
          console.log(err);
          return;
        }
        bot.sendMessage(chatId, "Inscrição realizada com sucesso!");
        await Mongo.desconectaMongoDB(client);
      });
    } catch (erro) {
      bot.sendMessage(chatId, "Não foi possível realizar a inscrição!");
      console.log(erro);
    }
  } else if (msg.text === "/unsubscribe") {
    try {
      let client = await Mongo.conectarMongoDB();
      let db = client.db("projetoBot");
      let collection = db.collection("users");
      await collection.deleteOne(
        { telegramId: chatId },
        async (err, resultado) => {
          if (err) {
            console.log(err);
            bot.sendMessage(chatId, "Erro ao desinscrever você ...");
          } else {
            bot.sendMessage(chatId, "Desinscrição realizada com sucesso!");
          }
          await Mongo.desconectaMongoDB(client);
        }
      );
    } catch (erro) {
      bot.sendMessage(chatId, "Erro ao desinscrever você ...");
      console.log(erro);
    }
  } else {
    bot.sendMessage(
      chatId,
      `Olá, eu sou o projetoBot ${emoji.robot_face}. Estou aqui para auxiliá-lo com seu agendamento \nAs opções possíveis são:\n\/echo -> Interagir comigo\n/subscribe -> Você se inscreve para receber atualizações de agendamentos\n/unsubscribe -> Você para de receber minhas mensagens chatas\nEstou ansioso para interagir com você!`
    );
  }
});

async function analisaSubscricoesAtualizaDados() {
  //Antes de mandar mensagens para quem esta inscrito, faz o scrap
  
  let dados = await Scraper();
  await Scraper();
  await Scraper();

  console.log(dados);

  //Analisar quem subscreveu no bot e mandar um alo para esse caboclo
  try {
    let client = await Mongo.conectarMongoDB();
    let db = client.db("projetoBot");
    let collection = db.collection("users");
    let usuarios = await collection.find({}).toArray();
    for (usuario of usuarios) {
      bot.sendMessage(usuario.telegramId, JSON.stringify(dados));
    }
    await Mongo.desconectaMongoDB(client);
  } catch (erro) {
    console.log(erro);
  }
}

const interval = setInterval(analisaSubscricoesAtualizaDados, 60000);
