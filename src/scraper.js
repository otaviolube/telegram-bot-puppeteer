const puppeteer = require("puppeteer");

async function doScrap() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://demo.easyappointments.org/");

    await page.screenshot({ path: "./src/screens/sample.png" });

    let modalApareceu = await page.$("body > div.modal.fade.in.show");
    await page.waitForTimeout(1000);
    if (modalApareceu) {
      await page.click(
        "body > div.modal.fade.in.show > div > div > div.modal-footer > button"
      );
    }

    await page.screenshot({ path: "./src/screens/sample2.png" });

    await page.waitForSelector("#select-service");
    
    const service = await page.$("#select-service");
    await page.waitForSelector("#select-service > option");

    const listaServices = await page.$$eval("#select-service > option", (options) => options.map((op) => {
        return {
            indice: op.value,
            servico: op.textContent
        }
    }));

    for(serv of listaServices){
        if(serv.servico === "Test Service 01"){
            service.select(serv.indice);
        }
    }

    const fornecedores = await page.$("#select-provider");

    const listaFornecedores = await page.$$eval("#select-provider > option", (options) => options.map((op) => {
        return {
            indice: op.value,
            fornecedor: op.textContent
        }
    }));

    for(forn of listaFornecedores){
        if(forn.fornecedor === 'Jane Doe'){
            fornecedores.select(forn.indice);
        }
    }

    await page.click("#button-next-1");
    await page.waitForTimeout(3000);


    await page.screenshot({ path: "./src/screens/sample3.png" });

    let horariosDisponiveis = await page.$$eval("#available-hours > button.btn.btn-outline-secondary.btn-block.shadow-none.available-hour", (options) => options.map((op) => {
        return {
            horarioDisponivel: op.textContent,
            indice: op.value
        }
    }))

    await page.click("#available-hours > button.btn.btn-outline-secondary.btn-block.shadow-none.available-hour.selected-hour");

    await page.click("#button-next-2");
    await page.waitForTimeout(3000);

    await page.type("#first-name", "John Doe", {delay: 100});
    await page.type("#last-name", "dos Santos");
    await page.type("#email", "johndoe@gmail.com", {delay: 200});
    await page.type("#phone-number", "11-1111-1111", {delay: 50});

    await page.click("#button-next-3");

    await page.waitForTimeout(2000);

    await page.click("#book-appointment-submit");

    await browser.close();

    return({
        service: listaServices,
        fornecedores: listaFornecedores,
        horariosDisponiveis: horariosDisponiveis
    })

  } catch (erro) {
    console.log(erro);
  }
}

// (async () => {
//     let resultado = await doScrap();
//     console.log(resultado);
// })()

module.exports = doScrap;