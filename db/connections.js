const writeDb = {
  host: "localhost",
  port: 3307,
  user: "rootuser",
  password: "grupof.pass",
  database: "aula-db",
};

const readDb = {
  host: "localhost",
  port: 3308,
  user: "replicuser",
  password: "grupof.pass",
  database: "aula-db",
};

module.exports = { writeDb, readDb };
