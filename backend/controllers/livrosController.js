import Livro from "../models/Livro.js";
import db from "../models/db.js";

export default {
    async listar(req, res) {
        try {
            console.log("📖 Recebida requisição para listar livros");
            const livros = await Livro.listar();
            console.log(`✅ ${livros.length} livros encontrados`);
            res.json(livros);
        } catch (erro) {
            console.error("❌ Erro no controller livros.listar:", erro);
            res.status(500).json({ 
                erro: "Erro ao buscar livros",
                detalhes: erro.message 
            });
        }
    },

    async criar(req, res) {
        try {
            const { titulo, autor, imagem } = req.body;
            console.log("📝 Recebida requisição para criar livro:", { titulo, autor, imagem });

            if (!titulo || titulo.trim() === '') {
                return res.status(400).json({ erro: "Título é obrigatório" });
            }

            const id = await Livro.criar(titulo.trim(), autor?.trim(), imagem?.trim());
            console.log("✅ Livro criado com ID:", id);
            
            res.status(201).json({ 
                mensagem: "Livro cadastrado com sucesso",
                id: id
            });

        } catch (erro) {
            console.error("❌ Erro no controller livros.criar:", erro);
            res.status(500).json({ 
                erro: "Erro ao cadastrar livro",
                detalhes: erro.message 
            });
        }
    },

    async remover(req, res) {
        try {
            const { id } = req.params;
            console.log("🗑️ Tentando remover livro ID:", id);

        // Verificar se existem solicitações para este livro
        const [solicitacoes] = await db.query(
            "SELECT COUNT(*) as total FROM solicitacoes WHERE id_livro = ?",
            [id]
        );

        if (solicitacoes[0].total > 0) {
            return res.status(400).json({ 
                erro: "Não é possível remover este livro",
                detalhes: `Existem ${solicitacoes[0].total} solicitação(ões) vinculadas a este livro. Remova as solicitações primeiro.`
            });
        }

        await Livro.remover(id);
        console.log("✅ Livro removido com sucesso");
        
        res.json({ mensagem: "Livro removido com sucesso" });

        } catch (erro) {
            console.error("❌ Erro no controller livros.remover:", erro);
            
            if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
                res.status(400).json({ 
                    erro: "Não é possível remover este livro",
                    detalhes: "Existem solicitações de empréstimo vinculadas a este livro. Remova as solicitações primeiro."
                });
            } else {
                res.status(500).json({ 
                    erro: "Erro ao remover livro",
                    detalhes: erro.message 
                });
            }
        }
    }
};