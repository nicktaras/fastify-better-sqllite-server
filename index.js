import fastify from 'fastify';

import Database from 'better-sqlite3';

const app = fastify();

// SQLite database
const db = new Database('ensnames.db', { verbose: console.log });

// Create a table only if it doesn't exist
const createTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS ensnames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);
createTable.run();

app.get('/', async (request, reply) => {
  return 'health ok';
});

app.get('/offchain-names', async (request, reply) => {
  const ensnames = db.prepare('SELECT * FROM ensnames').all();
  return ensnames;
});

app.get('/offchain-name/:id', async (request, reply) => {
  const { id } = request.params;
  const item = db.prepare('SELECT * FROM subnames WHERE id = ?').get(id);
  if (!item) {
    return reply.code(404).send({ error: 'ENS Name not found' });
  }
  return item;
});

app.put('/offchain-name', async (request, reply) => {
  const { name } = request.body;

  if (typeof (name) !== "string") return reply.code(400).send({ error: 'Expected name to be a string' });
  if (!name) return reply.code(400).send({ error: 'Name is required' });

  const insertItem = db.prepare('INSERT INTO ensnames (name) VALUES (?)');
  const result = insertItem.run(name);

  return { id: result.lastInsertRowid, name };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    app.log.info(`Server is listening on ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();