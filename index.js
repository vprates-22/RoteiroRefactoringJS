const { readFileSync } = require("fs");

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor / 100);
}

function getPeca(apresentacao, pecas) {
  return pecas[apresentacao.id];
}

function calcularCredito(apre, pecas) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(apre, pecas).tipo === "comedia")
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;
}

function calcularTotalCreditos(apresentacoes, pecas) {
  let creditos = 0;
  for (let apre of apresentacoes) {
    creditos += calcularCredito(apre, pecas);
  }
  return creditos;
}

function calcularTotalApresentacao(apre, pecas) {
  let total = 0;
  switch (getPeca(apre, pecas).tipo) {
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
      throw new Error(`Peça desconhecia: ${getPeca(apre, pecas).tipo}`);
  }
  return total;
}

function calcularTotalFatura(apresentacoes, pecas) {
  let totalFatura = 0;
  for (let apre of apresentacoes) {
    let total = calcularTotalApresentacao(apre, pecas);
    totalFatura += total;
  }
  return totalFatura;
}

function gerarFaturaStr(fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre, pecas).nome}: ${formatarMoeda(
      calcularTotalApresentacao(apre, pecas)
    )} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${calcularTotalFatura(
    fatura.apresentacoes,
    pecas
  )}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(
    fatura.apresentacoes,
    pecas
  )} \n`;
  return faturaStr;
}

const faturas = JSON.parse(readFileSync("./faturas.json"));
const pecas = JSON.parse(readFileSync("./pecas.json"));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);