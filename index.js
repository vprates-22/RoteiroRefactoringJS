const { readFileSync } = require("fs");

function getPeca(apresentacao) {
  return pecas[apresentacao.id];
}

function calcularCredito(apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(apre).tipo === "comedia")
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor / 100);
}

function gerarFaturaStr(fatura, pecas) {
  
  function calcularTotalApresentacao(apre) {
    let total = 0;
    switch (getPeca(apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
        throw new Error(`Peça desconhecia: ${getPeca(apre).tipo}`);
    }
    return total;
  }

  function calcularTotalFatura(apresentacoes){
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      let total = calcularTotalApresentacao(apre);
      totalFatura += total;
    }
    return totalFatura;
  }

  function calcularTotalCreditos(apresentacoes){
    let creditos = 0;
    for (let apre of apresentacoes) {
      creditos += calcularCredito(apre);
    }
    return creditos;
  }
  
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${calcularTotalFatura(fatura.apresentacoes)}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(fatura.apresentacoes)} \n`;
  return faturaStr;
}

const faturas = JSON.parse(readFileSync("./faturas.json"));
const pecas = JSON.parse(readFileSync("./pecas.json"));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);