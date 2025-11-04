const { createPools } = require("./db/pool");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async function main() {
  const GRUPO = "Grupo F";
  let contador = 1;
  let conexoes = await createPools();

  process.on("SIGINT", async () => {
    await conexoes.writePool.end();
    await conexoes.readPool.end();
    process.exit(0);
  });

  console.log("-------------- CONEXÃO ESTABELECIDA --------------");
  console.log();

  while (true) {
    try {
      const descricao = `Produto ${contador} ${Date.now()}`;
      const categorias = ["eletro", "alimento", "higiene", "outros"];
      const categoria = categorias[contador % categorias.length];
      const valor = (Math.random() * 1000 + 1).toFixed(2);

      const [resultado] = await conexoes.writePool.execute(
        "INSERT INTO produto (descricao, categoria, valor, criado_por) VALUES (?, ?, ?, ?)",
        [descricao, categoria, valor, GRUPO]
      );

      const novoId = resultado.insertId;
      console.log(
        `[INSERT][write] id=${novoId} | ${descricao} | ${categoria} | R$${valor}`
      );

      const limiteInferior = Math.max(1, novoId - 10);
      for (let id = novoId - 1; id >= limiteInferior; id--) {
        const [rows] = await conexoes.readPool.execute(
          "SELECT id, descricao, categoria, valor, criado_em, criado_por FROM produto WHERE id = ?",
          [id]
        );

        if (rows.length > 0) {
          const produto = rows[0];
          console.log(
            `[SELECT][read] id=${produto.id} | ${produto.descricao} | ${produto.categoria} | R$${produto.valor}`
          );
        }
      }

      contador++;
      await wait(1000);
    } catch (erro) {
      const precisaReconectar = [
        "PROTOCOL_CONNECTION_LOST",
        "ECONNREFUSED",
      ].includes(erro.code);
      if (precisaReconectar) {
        console.log();

        conexoes = await createPools();
      }

      await wait(2000);
    }
  }
})();
