import Solicitacao from "../models/Solicitacao.js";
import Livro from "../models/Livro.js";
import Devolucao from "../models/Devolucao.js";

export default {
    async criarSolicitacao(req, res) {
        try {
            const { id_usuario, id_livro } = req.body;

            // Verificar se livro está disponível
            const livros = await Livro.listar();
            const livro = livros.find(l => l.id === parseInt(id_livro));
            
            if (!livro || !livro.disponivel) {
                return res.status(400).json({ erro: "Livro não disponível" });
            }

            const id = await Solicitacao.criar(id_usuario, id_livro);
            
            // Marcar livro como indisponível
            await Livro.atualizarDisponibilidade(id_livro, false);

            res.status(201).json({ 
                mensagem: "Solicitação criada com sucesso",
                id: id
            });

        } catch (erro) {
            res.status(500).json({ erro: "Erro ao criar solicitação" });
        }
    },

    async listarPendentes(req, res) {
    try {
        console.log("📋 [CONTROLLER] Listando solicitações pendentes");
        
        const solicitacoes = await Solicitacao.listarPendentes();
        console.log(`✅ [CONTROLLER] ${solicitacoes.length} solicitações encontradas`);
        
        // Log detalhado de cada solicitação
        solicitacoes.forEach((s, index) => {
            console.log(`   ${index + 1}. ID: ${s.id} | Usuário: ${s.usuario} | Livro: ${s.livro} | Status: ${s.status}`);
        });
        
        res.json(solicitacoes);
    } catch (erro) {
        console.error("❌ [CONTROLLER] Erro ao listar solicitações:", erro);
        res.status(500).json({ erro: "Erro ao buscar solicitações" });
    }
},

    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['aprovado', 'negado'].includes(status)) {
                return res.status(400).json({ erro: "Status inválido" });
            }

            await Solicitacao.atualizarStatus(id, status);

            // Se foi negado, marcar livro como disponível novamente
            if (status === 'negado') {
                // Buscar a solicitação para pegar o id_livro
                const solicitacoes = await Solicitacao.listarPendentes();
                const solicitacao = solicitacoes.find(s => s.id === parseInt(id));
                
                if (solicitacao) {
                    await Livro.atualizarDisponibilidade(solicitacao.id_livro, true);
                }
            }

            res.json({ mensagem: `Solicitação ${status} com sucesso` });

        } catch (erro) {
            res.status(500).json({ erro: "Erro ao atualizar status" });
        }
    },

    async devolver(req, res) {
        try {
            const { id_solicitacao } = req.params;

            // Registrar devolução
            await Devolucao.registrar(id_solicitacao);

            // Buscar a solicitação para pegar o id_livro
            const solicitacoes = await Solicitacao.listarPendentes();
            const solicitacao = solicitacoes.find(s => s.id === parseInt(id_solicitacao));
            
            if (solicitacao) {
                // Marcar livro como disponível
                await Livro.atualizarDisponibilidade(solicitacao.id_livro, true);
            }

            res.json({ mensagem: "Devolução registrada com sucesso" });

        } catch (erro) {
            res.status(500).json({ erro: "Erro ao registrar devolução" });
        }
    }
};