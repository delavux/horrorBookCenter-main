import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

export default {
    async cadastrar(req, res) {
        try {
            const { nome, email, senha, tipo } = req.body;

            // Verificar se usuário já existe
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ erro: "E-mail já cadastrado" });
            }

            // Criptografar senha
            const senhaHash = await bcrypt.hash(senha, 10);

            // Criar usuário
            const id = await Usuario.criar(nome, email, senhaHash, tipo);

            res.status(201).json({ 
                mensagem: "Usuário criado com sucesso",
                id: id
            });

        } catch (erro) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    },

    async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Buscar usuário
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: "E-mail ou senha inválidos" });
            }

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: "E-mail ou senha inválidos" });
            }

            // Retornar dados do usuário (sem senha)
            const { senha: _, ...usuarioSemSenha } = usuario;
            res.json({ 
                mensagem: "Login realizado com sucesso",
                usuario: usuarioSemSenha
            });

        } catch (erro) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }
};