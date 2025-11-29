import db from "./db.js";

export default {
    async criar(id_usuario, id_livro) {
        const [result] = await db.query(
            "INSERT INTO solicitacoes (id_usuario, id_livro) VALUES (?, ?)",
            [id_usuario, id_livro]
        );
        return result.insertId;
    },

    async listarPendentes() {
        const [result] = await db.query(
            `SELECT s.*, u.nome AS usuario, l.titulo AS livro
             FROM solicitacoes s
             JOIN usuarios u ON s.id_usuario = u.id
             JOIN livros l ON s.id_livro = l.id
             WHERE s.status = 'pendente'`
        );
        return result;
    },

    async atualizarStatus(id, status) {
        await db.query("UPDATE solicitacoes SET status = ? WHERE id = ?", [
            status,
            id,
        ]);
    }
};
