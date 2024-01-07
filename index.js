const fastify = require('fastify')({ logger: true });
const Database = require('better-sqlite3');

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

fastify.get('/', async (request, reply) => {
  return 'health ok';
});

fastify.get('/offchain-names', async (request, reply) => {
  const ensnames = db.prepare('SELECT * FROM ensnames').all();
  return ensnames;
});

fastify.get('/offchain-name/:id', async (request, reply) => {
  const { id } = request.params;
  const item = db.prepare('SELECT * FROM subnames WHERE id = ?').get(id);
  if (!item) {
    return reply.code(404).send({ error: 'ENS Name not found' });
  }
  return item;
});

fastify.put('/offchain-name', async (request, reply) => {
  const { name } = request.body;

  if (typeof (name) !== "string") return reply.code(400).send({ error: 'Expected name to be a string' });
  if (!name) return reply.code(400).send({ error: 'Name is required' });

  const insertItem = db.prepare('INSERT INTO ensnames (name) VALUES (?)');
  const result = insertItem.run(name);

  return { id: result.lastInsertRowid, name };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info(`Server is listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();