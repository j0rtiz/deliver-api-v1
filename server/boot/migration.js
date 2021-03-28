'use strict';

const atrasos = require('./atrasos.json');

module.exports = async (app) => {
  const { Atraso } = app.models;
  const tables = ['Atraso', 'Conta'];

  console.log('\x1b[35m\n%s\n\x1b[0m', 'Atualizando o banco de dados...');

  await app.dataSources.db.autoupdate(tables, (err) => {
    if (err) {
      throw err;
    }
  });

  await Atraso.findOrCreate({}, atrasos);
};
