import db from './db.js';

export default {
    async criar(nome, email, senha, tipo = "aluno") {
        const [result] = await db.query(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
            [nome, email, senha, tipo]
        );
        return result.insertId;
    },

    async buscarPorEmail(email) {
        const [result] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );
        return result[0];
    }
};
