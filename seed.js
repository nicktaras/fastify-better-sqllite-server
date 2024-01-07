const Database = require('better-sqlite3');

const db = new Database('ensnames.db', { verbose: console.log });

const createTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS ensnames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

createTable.run();

const seedData = () => {
  const insertName = db.prepare('INSERT INTO ensnames (name) VALUES (?)');

  const data = [
    { name: 'Bob' },
    { name: 'Felix' },
    { name: 'Tabby' },
    { name: 'Smithers' },
    { name: 'Ruby' },
    { name: 'Frankel' },
    { name: 'Oscar' },
    { name: 'Soot' }
  ];

  data.forEach((ensnames) => {
    insertName.run(ensnames.name);
  });

  console.log('Seed data inserted successfully');
};

seedData();

db.close();