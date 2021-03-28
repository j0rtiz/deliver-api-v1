'use strict';

module.exports = (Conta) => {
  Conta.observe('before save', async (ctx) => verificarAtraso(ctx));
  Conta.valorCorrigido = async (conta) => conta.ValorCorrigido;
  Conta.diasAtraso = async (conta) => conta.DiasAtraso;
};

async function verificarAtraso(ctx) {
  const conta = ctx.instance || ctx.data;
  const { valorOriginal, dataVencimento, dataPagamento } = conta;

  const dia = 24 * 60 * 60 * 1000;
  const diasAtraso = Math.ceil(Math.abs((dataVencimento - dataPagamento) / dia));

  if (diasAtraso > 0) {
    conta.ValorCorrigido = await calcularValor(diasAtraso, valorOriginal);
    conta.DiasAtraso = diasAtraso;
  }
}

async function calcularValor(diasAtraso, valorOriginal) {
  if (diasAtraso <= 3) {
    const multa = calcularMulta(valorOriginal, 2);
    const juros = calcularJuros(valorOriginal, 0.1, diasAtraso);
    const valorCorrigido = valorOriginal + multa + juros;

    return valorCorrigido;
  } else if (diasAtraso > 3 && diasAtraso <= 5) {
    const multa = calcularMulta(valorOriginal, 3);
    const juros = calcularJuros(valorOriginal, 0.2, diasAtraso);
    const valorCorrigido = valorOriginal + multa + juros;

    return valorCorrigido;
  } else if (diasAtraso > 5) {
    const multa = calcularMulta(valorOriginal, 5);
    const juros = calcularJuros(valorOriginal, 0.3, diasAtraso);
    const valorCorrigido = valorOriginal + multa + juros;

    return valorCorrigido;
  }
}

function calcularMulta(valorOriginal, porcentagem) {
  const multa = (valorOriginal * porcentagem) / 100;

  return multa;
}

function calcularJuros(valorOriginal, porcentagem, diasAtraso) {
  const juros = ((valorOriginal * porcentagem) / 100) * diasAtraso;

  return juros;
}
