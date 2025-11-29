import db from "./db.js";

export default {
    async listar() {
        try {
            const [rows] = await db.query("SELECT * FROM livros");
            return rows;
        } catch (error) {
            console.error("❌ Erro no model Livro.listar:", error);
            throw error;
        }
    },

    async criar(titulo, autor, imagem) {
        try {
            console.log("📝 Executando INSERT no banco:", { titulo, autor, imagem });
            
            const [result] = await db.query(
                "INSERT INTO livros (titulo, autor, imagem) VALUES (?, ?, ?)",
                [titulo, autor || null, imagem || null]
            );
            
            console.log("✅ INSERT executado com sucesso, ID:", result.insertId);
            return result.insertId;
            
        } catch (error) {
            console.error("❌ Erro no model Livro.criar:", error);
            console.error("❌ Código do erro:", error.code);
            console.error("❌ Mensagem:", error.message);
            throw error;
        }
    },

    async remover(id) {
        try {
            await db.query("DELETE FROM livros WHERE id = ?", [id]);
        } catch (error) {
            console.error("❌ Erro no model Livro.remover:", error);
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
            console.error("❌ Erro no model Livro.atualizarDisponibilidade:", error);
            throw error;
        }
    }
};