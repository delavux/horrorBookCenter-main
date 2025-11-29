document.addEventListener('DOMContentLoaded', function() {
    const nomeUsuario = document.getElementById('nomeUsuario');
    const livrosDisponiveis = document.getElementById('livros-disponiveis');
    const meusEmprestimos = document.getElementById('meus-emprestimos');
    const minhasSolicitacoes = document.getElementById('minhas-solicitacoes');

    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log("🔧 painelestudante.js carregado");
    console.log("👤 Usuário logado:", usuario);
    
    if (!usuario) {
        console.log("❌ Nenhum usuário logado - redirecionando para login");
        window.location.href = 'login.html';
        return;
    }

    if (usuario.tipo !== 'aluno') {
        console.log("❌ Usuário não é aluno - redirecionando");
        window.location.href = 'painelbibliotecario.html';
        return;
    }

    console.log("✅ Estudante autenticado - inicializando painel");
    nomeUsuario.textContent = usuario.nome;
    
    // Configurar botão de logout
    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    carregarDadosPainel();

    async function carregarDadosPainel() {
        await carregarLivrosDisponiveis();
        await carregarMeusEmprestimos();
        await carregarMinhasSolicitacoes();
    }

    async function carregarLivrosDisponiveis() {
        try {
            console.log("📚 Carregando livros disponíveis...");
            const response = await fetch('http://localhost:3000/api/livros');
            const livros = await response.json();
            
            const disponiveis = livros.filter(livro => livro.disponivel).slice(0, 3);
            console.log(`✅ ${disponiveis.length} livros disponíveis encontrados`);
            
            livrosDisponiveis.innerHTML = disponiveis.map(livro => `
                <div class="item-lista">
                    <strong>${livro.titulo}</strong>
                    <span>${livro.autor || 'Autor desconhecido'}</span>
                    <button onclick="solicitarLivro(${livro.id})" class="btn-pequeno">
                        📖 Solicitar
                    </button>
                </div>
            `).join('') || '<p class="sem-dados">Nenhum livro disponível no momento.</p>';
        } catch (error) {
            console.error("❌ Erro ao carregar livros:", error);
            livrosDisponiveis.innerHTML = '<p class="erro">Erro ao carregar livros.</p>';
        }
    }

    async function carregarMeusEmprestimos() {
        try {
            console.log("📦 Buscando MEUS EMPRÉSTIMOS...");
            const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
            const solicitacoes = await response.json();
            
            console.log("📋 TODAS as solicitações da API:", solicitacoes);
            
            const meusAprovados = solicitacoes.filter(s => {
                const match = s.id_usuario === usuario.id && s.status === 'aprovado';
                console.log(`🔍 Solicitação ${s.id}: usuário ${s.id_usuario} (eu: ${usuario.id}), status ${s.status} -> ${match ? '✅ MEU EMPRÉSTIMO' : 'ignorado'}`);
                return match;
            });
            
            console.log("🎯 MEUS EMPRÉSTIMOS ATIVOS:", meusAprovados);
            
            meusEmprestimos.innerHTML = meusAprovados.map(s => `
                <div class="item-lista emprestimo-ativo">
                    <div class="livro-info">
                        <strong>📖 ${s.livro}</strong>
                        <span>✍️ ${s.autor || 'Autor não informado'}</span>
                        <span>📅 Emprestado em: ${new Date(s.data_solicitacao).toLocaleDateString()}</span>
                    </div>
                    <div class="acao-emprestimo">
                        <button onclick="devolverLivro(${s.id})" class="btn-sucesso">
                            📥 Devolver
                        </button>
                    </div>
                </div>
            `).join('') || '<p class="sem-dados">📚 Nenhum empréstimo ativo no momento.</p>';
            
        } catch (error) {
            console.error("❌ Erro ao carregar empréstimos:", error);
            meusEmprestimos.innerHTML = '<p class="erro">❌ Erro ao carregar empréstimos.</p>';
        }
    }

    async function carregarMinhasSolicitacoes() {
        try {
            console.log("⏳ Buscando MINHAS SOLICITAÇÕES PENDENTES...");
            const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
            const solicitacoes = await response.json();
            
            const minhasPendentes = solicitacoes.filter(s => {
                const match = s.id_usuario === usuario.id && s.status === 'pendente';
                console.log(`🔍 Solicitação ${s.id}: usuário ${s.id_usuario} (eu: ${usuario.id}), status ${s.status} -> ${match ? '⏳ MINHA SOLICITAÇÃO' : 'ignorado'}`);
                return match;
            });
            
            console.log("📝 MINHAS SOLICITAÇÕES PENDENTES:", minhasPendentes);
            
            minhasSolicitacoes.innerHTML = minhasPendentes.map(s => `
                <div class="item-lista solicitacao-pendente">
                    <div class="solicitacao-info">
                        <strong>📖 ${s.livro}</strong>
                        <span>✍️ ${s.autor || 'Autor não informado'}</span>
                        <span>📅 Solicitado em: ${new Date(s.data_solicitacao).toLocaleDateString()}</span>
                        <span class="status-pendente">⏳ Aguardando aprovação</span>
                    </div>
                </div>
            `).join('') || '<p class="sem-dados">✅ Nenhuma solicitação pendente.</p>';
            
        } catch (error) {
            console.error("❌ Erro ao carregar solicitações:", error);
            minhasSolicitacoes.innerHTML = '<p class="erro">❌ Erro ao carregar solicitações.</p>';
        }
    }

    // Funções globais
    window.solicitarLivro = async function(idLivro) {
        if (!confirm('📖 Deseja solicitar este livro?')) return;

        try {
            console.log("📝 Solicitando livro ID:", idLivro);
            const response = await fetch('http://localhost:3000/api/solicitacoes/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_usuario: usuario.id,
                    id_livro: idLivro
                })
            });

            const data = await response.json();
            console.log("📡 Resposta da solicitação:", data);

            if (response.ok) {
                alert('✅ Solicitação enviada com sucesso! Aguarde aprovação.');
                carregarDadosPainel();
            } else {
                alert('❌ ' + (data.erro || 'Erro ao solicitar livro!'));
            }
        } catch (error) {
            console.error("💥 Erro ao solicitar livro:", error);
            alert('💥 Erro de conexão!');
        }
    };

    window.devolverLivro = async function(idSolicitacao) {
        if (!confirm('📥 Confirmar devolução deste livro?')) return;

        try {
            console.log("🔄 Devolvendo solicitação ID:", idSolicitacao);
            const response = await fetch(`http://localhost:3000/api/solicitacoes/devolucao/${idSolicitacao}`, {
                method: 'POST'
            });

            const data = await response.json();
            console.log("📡 Resposta da devolução:", data);

            if (response.ok) {
                alert('✅ Devolução registrada com sucesso!');
                carregarDadosPainel();
            } else {
                alert('❌ ' + (data.erro || 'Erro ao registrar devolução!'));
            }
        } catch (error) {
            console.error("💥 Erro ao devolver livro:", error);
            alert('💥 Erro de conexão!');
        }
    };
});