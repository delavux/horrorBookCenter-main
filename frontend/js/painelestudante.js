document.addEventListener('DOMContentLoaded', function() {
    const nomeUsuario = document.getElementById('nomeUsuario');
    const livrosDisponiveis = document.getElementById('livros-disponiveis');
    const meusEmprestimos = document.getElementById('meus-emprestimos');
    const minhasSolicitacoes = document.getElementById('minhas-solicitacoes');

    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.tipo !== 'aluno') {
        window.location.href = 'login.html';
        return;
    }

    nomeUsuario.textContent = usuario.nome;
    carregarDadosPainel();

    async function carregarDadosPainel() {
        await carregarLivrosDisponiveis();
        await carregarMeusEmprestimos();
        await carregarMinhasSolicitacoes();
    }

    async function carregarLivrosDisponiveis() {
        try {
            const response = await fetch('http://localhost:3000/api/livros');
            const livros = await response.json();
            
            const disponiveis = livros.filter(livro => livro.disponivel).slice(0, 3);
            
            livrosDisponiveis.innerHTML = disponiveis.map(livro => `
                <div class="item-lista">
                    <strong>${livro.titulo}</strong>
                    <span>${livro.autor || 'Autor desconhecido'}</span>
                    <button onclick="solicitarLivro(${livro.id})" class="btn-pequeno">
                        Solicitar
                    </button>
                </div>
            `).join('') || '<p class="sem-dados">Nenhum livro disponível no momento.</p>';
        } catch (error) {
            livrosDisponiveis.innerHTML = '<p class="erro">Erro ao carregar livros.</p>';
        }
    }

    async function carregarMeusEmprestimos() {
        try {
            const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
            const solicitacoes = await response.json();
            
            const meusAprovados = solicitacoes.filter(s => 
                s.id_usuario === usuario.id && s.status === 'aprovado'
            );
            
            meusEmprestimos.innerHTML = meusAprovados.map(s => `
                <div class="item-lista">
                    <strong>${s.livro}</strong>
                    <span>Solicitado em: ${new Date(s.data_solicitacao).toLocaleDateString()}</span>
                    <button onclick="devolverLivro(${s.id})" class="btn-pequeno">
                        Devolver
                    </button>
                </div>
            `).join('') || '<p class="sem-dados">Nenhum empréstimo ativo.</p>';
        } catch (error) {
            meusEmprestimos.innerHTML = '<p class="erro">Erro ao carregar empréstimos.</p>';
        }
    }

    async function carregarMinhasSolicitacoes() {
        try {
            const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
            const solicitacoes = await response.json();
            
            const minhasPendentes = solicitacoes.filter(s => 
                s.id_usuario === usuario.id && s.status === 'pendente'
            );
            
            minhasSolicitacoes.innerHTML = minhasPendentes.map(s => `
                <div class="item-lista status-${s.status}">
                    <strong>${s.livro}</strong>
                    <span>Status: ${s.status}</span>
                    <span>Solicitado em: ${new Date(s.data_solicitacao).toLocaleDateString()}</span>
                </div>
            `).join('') || '<p class="sem-dados">Nenhuma solicitação pendente.</p>';
        } catch (error) {
            minhasSolicitacoes.innerHTML = '<p class="erro">Erro ao carregar solicitações.</p>';
        }
    }

    // Funções globais
    window.solicitarLivro = async function(idLivro) {
        if (!confirm('Deseja solicitar este livro?')) return;

        try {
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

            if (response.ok) {
                alert('Solicitação enviada com sucesso!');
                carregarDadosPainel();
            } else {
                alert(data.erro || 'Erro ao solicitar livro!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    };

    window.devolverLivro = async function(idSolicitacao) {
        if (!confirm('Confirmar devolução deste livro?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/solicitacoes/devolucao/${idSolicitacao}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Devolução registrada com sucesso!');
                carregarDadosPainel();
            } else {
                alert(data.erro || 'Erro ao registrar devolução!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    };
});