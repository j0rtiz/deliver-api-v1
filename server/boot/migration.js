'use strict';

module.exports = (app, cb) => {
  const tables = ['Conta'];

  console.log('\x1b[35m\n%s\n\x1b[0m', 'Atualizando o banco de dados...');

  app.dataSources.db.autoupdate(tables, (err) => {
    if (err) {
      throw err;
    }
  });

  process.nextTick(cb);
};
