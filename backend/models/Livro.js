import db from "./db.js";

export default {
    async listar() {
        try {
            const [rows] = await db.query("SELECT * FROM livros");
            console.log("Livros encontrados:", rows.length);
            return rows;
        } catch (error) {
            console.error("Erro no model Livro.listar:", error);
            throw error;
        }
    },

    async criar(titulo, autor, imagem) {
        try {
            const [result] = await db.query(
                "INSERT INTO livros (titulo, autor, imagem) VALUES (?, ?, ?)",
                [titulo, autor, imagem]
            );
            return result.insertId;
        } catch (error) {
            console.error("Erro no model Livro.criar:", error);
            throw error;
        }
    },

    async remover(id) {
        try {
            await db.query("DELETE FROM livros WHERE id = ?", [id]);
        } catch (error) {
            console.error("Erro no model Livro.remover:", error);
            throw error;
        }
    },

    async atualizarDisponibilidade(id, disponibilidade) {
        try {
            await db.query(
                "UPDATE livros SET disponivel = ? WHERE id = ?",
                [disponibilidade, id]
            );
        } catch (error) {
            console.error("Erro no model Livro.atualizarDisponibilidade:", error);
            throw error;
        }
    },

    async buscarPorId(id) {
        try {
            const [rows] = await db.query(
                "SELECT * FROM livros WHERE id = ?",
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error("Erro no model Livro.buscarPorId:", error);
            throw error;
        }
    }
};