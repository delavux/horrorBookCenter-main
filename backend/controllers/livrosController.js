import Livro from "../models/Livro.js";

export default {
    async listar(req, res) {
        try {
            const livros = await Livro.listar();
            res.json(livros);
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao buscar livros" });
        }
    },

    async criar(req, res) {
        try {
            const { titulo, autor, imagem } = req.body;

            if (!titulo) {
                return res.status(400).json({ erro: "Título é obrigatório" });
            }

            const id = await Livro.criar(titulo, autor, imagem);
            res.status(201).json({ 
                mensagem: "Livro cadastrado com sucesso",
                id: id
            });

        } catch (erro) {
            res.status(500).json({ erro: "Erro ao cadastrar livro" });
        }
    },

    async remover(req, res) {
        try {
            const { id } = req.params;
            await Livro.remover(id);
            res.json({ mensagem: "Livro removido com sucesso" });
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao remover livro" });
        }
    }
};