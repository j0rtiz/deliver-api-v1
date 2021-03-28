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
  const diasAtraso = Math.ceil((dataPagamento - dataVencimento) / dia);

  if (diasAtraso > 0) {
    const atraso = await definirAtraso(ctx.Model, diasAtraso, valorOriginal);

    conta.ValorCorrigido = atraso.valorCorrigido;
    conta.DiasAtraso = diasAtraso;
    conta.Regra = atraso.regra;
  } else {
    conta.ValorCorrigido = valorOriginal;
    conta.DiasAtraso = 0;
    conta.Regra = null;
  }
}

async function definirAtraso(model, diasAtraso, valorOriginal) {
  const regras = await model.app.models.Atraso.find();
  const atraso = { valorCorrigido: valorOriginal, regra: null };

  regras.forEach((regra) => {
    const { faixaAtraso, porcentagemMulta, porcentagemJurosDia } = regra;
    const comAtraso = diasAtraso >= faixaAtraso[0] && (faixaAtraso[1] ? diasAtraso <= faixaAtraso[1] : true);

    if (comAtraso) {
      const multa = calcularMulta(valorOriginal, Number(porcentagemMulta));
      const juros = calcularJuros(valorOriginal, Number(porcentagemJurosDia), diasAtraso);

      atraso.valorCorrigido = valorOriginal + multa + juros;
      atraso.regra = regra.id;
    }
  });

  return atraso;
}

function calcularMulta(valorOriginal, porcentagem) {
  const multa = (valorOriginal * porcentagem) / 100;

  return multa;
}

function calcularJuros(valorOriginal, porcentagem, diasAtraso) {
  const juros = ((valorOriginal * porcentagem) / 100) * diasAtraso;

  return juros;
}
