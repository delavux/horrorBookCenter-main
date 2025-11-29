import db from "./db.js";

export default {
    async registrar(id_solicitacao) {
        const [result] = await db.query(
            "INSERT INTO devolucoes (id_solicitacao) VALUES (?)",
            [id_solicitacao]
        );
        return result.insertId;
    }
};
