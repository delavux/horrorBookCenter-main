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
    try {
        console.log("🔍 [MODEL] Executando query para listar solicitações...");
        
        const [rows] = await db.query(
            `SELECT s.*, u.nome AS usuario, l.titulo AS livro, l.autor
             FROM solicitacoes s
             JOIN usuarios u ON s.id_usuario = u.id
             JOIN livros l ON s.id_livro = l.id`
             // REMOVA o WHERE se existir: WHERE s.status = 'pendente'
        );
        
        console.log(`✅ [MODEL] Query executada: ${rows.length} linhas retornadas`);
        
        // Log das primeiras linhas para debug
        if (rows.length > 0) {
            console.log("📊 [MODEL] Primeiras solicitações:", rows.slice(0, 3));
        }
        
        return rows;
    } catch (error) {
        console.error("❌ [MODEL] Erro na query:", error);
        console.error("❌ [MODEL] Mensagem:", error.message);
        throw error;
    }
},

    async atualizarStatus(id, status) {
        await db.query("UPDATE solicitacoes SET status = ? WHERE id = ?", [
            status,
            id,
        ]);
    }
};
