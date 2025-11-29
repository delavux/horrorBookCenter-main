document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação e permissões
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.tipo !== 'bibliotecario') {
        window.location.href = 'login.html';
        return;
    }

    inicializarAbas();
    carregarSolicitacoesPendentes();

    function inicializarAbas() {
        const botoesAbas = document.querySelectorAll('.aba-btn');
        const conteudosAbas = document.querySelectorAll('.aba-conteudo');

        botoesAbas.forEach(botao => {
            botao.addEventListener('click', function() {
                const abaAlvo = this.getAttribute('data-aba');

                // Atualizar botões
                botoesAbas.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Atualizar conteúdos
                conteudosAbas.forEach(conteudo => {
                    conteudo.classList.remove('active');
                    if (conteudo.id === abaAlvo) {
                        conteudo.classList.add('active');
                    }
                });

                // Carregar dados específicos da aba
                switch(abaAlvo) {
                    case 'solicitacoes':
                        carregarSolicitacoesPendentes();
                        break;
                    case 'livros':
                        carregarLivrosAdmin();
                        break;
                    case 'devolucoes':
                        carregarDevolucoes();
                        break;
                }
            });
        });

        // Form de adicionar livro
        const formAdicionarLivro = document.getElementById('formAdicionarLivro');
        formAdicionarLivro.addEventListener('submit', adicionarLivro);
    }

    async function carregarSolicitacoesPendentes() {
        try {
            const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
            const solicitacoes = await response.json();

            const listaSolicitacoes = document.getElementById('lista-solicitacoes');
            
            listaSolicitacoes.innerHTML = solicitacoes.map(s => `
                <div class="solicitacao-item">
                    <div class="solicitacao-info">
                        <strong>Livro:</strong> ${s.livro}<br>
                        <strong>Aluno:</strong> ${s.usuario}<br>
                        <strong>Data:</strong> ${new Date(s.data_solicitacao).toLocaleString()}
                    </div>
                    <div class="solicitacao-acoes">
                        <button onclick="aprovarSolicitacao(${s.id})" class="btn-sucesso">
                            ✅ Aprovar
                        </button>
                        <button onclick="negarSolicitacao(${s.id})" class="btn-perigo">
                            ❌ Negar
                        </button>
                    </div>
                </div>
            `).join('') || '<p class="sem-dados">Nenhuma solicitação pendente.</p>';
        } catch (error) {
            document.getElementById('lista-solicitacoes').innerHTML = '<p class="erro">Erro ao carregar solicitações.</p>';
        }
    }

    async function carregarLivrosAdmin() {
        try {
            const response = await fetch('http://localhost:3000/api/livros');
            const livros = await response.json();

            const listaLivrosAdmin = document.getElementById('lista-livros-admin');
            
            listaLivrosAdmin.innerHTML = livros.map(livro => `
                <div class="livro-admin-item">
                    <div class="livro-info">
                        <strong>${livro.titulo}</strong><br>
                        <span>Autor: ${livro.autor || 'Não informado'}</span><br>
                        <span class="status ${livro.disponivel ? 'disponivel' : 'indisponivel'}">
                            ${livro.disponivel ? 'Disponível' : 'Indisponível'}
                        </span>
                    </div>
                    <div class="livro-acoes">
                        <button onclick="removerLivro(${livro.id})" class="btn-perigo">
                            🗑️ Remover
                        </button>
                    </div>
                </div>
            `).join('') || '<p class="sem-dados">Nenhum livro cadastrado.</p>';
        } catch (error) {
            document.getElementById('lista-livros-admin').innerHTML = '<p class="erro">Erro ao carregar livros.</p>';
        }
    }

    async function carregarDevolucoes() {
        try {
            const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
            const solicitacoes = await response.json();

            const aprovados = solicitacoes.filter(s => s.status === 'aprovado');
            const listaDevolucoes = document.getElementById('lista-devolucoes');
            
            listaDevolucoes.innerHTML = aprovados.map(s => `
                <div class="devolucao-item">
                    <div class="devolucao-info">
                        <strong>Livro:</strong> ${s.livro}<br>
                        <strong>Aluno:</strong> ${s.usuario}<br>
                        <strong>Data do empréstimo:</strong> ${new Date(s.data_solicitacao).toLocaleDateString()}
                    </div>
                    <div class="devolucao-acoes">
                        <button onclick="registrarDevolucao(${s.id})" class="btn-sucesso">
                            📥 Registrar Devolução
                        </button>
                    </div>
                </div>
            `).join('') || '<p class="sem-dados">Nenhum empréstimo ativo para devolução.</p>';
        } catch (error) {
            document.getElementById('lista-devolucoes').innerHTML = '<p class="erro">Erro ao carregar devoluções.</p>';
        }
    }

    async function adicionarLivro(e) {
        e.preventDefault();

        const titulo = document.getElementById('tituloLivro').value;
        const autor = document.getElementById('autorLivro').value;
        const imagem = document.getElementById('imagemLivro').value;

        try {
            const response = await fetch('http://localhost:3000/api/livros/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    titulo,
                    autor,
                    imagem
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Livro adicionado com sucesso!');
                document.getElementById('formAdicionarLivro').reset();
                carregarLivrosAdmin();
            } else {
                alert(data.erro || 'Erro ao adicionar livro!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    }

    // Funções globais para o bibliotecário
    window.aprovarSolicitacao = async function(id) {
        await atualizarStatusSolicitacao(id, 'aprovado');
    };

    window.negarSolicitacao = async function(id) {
        await atualizarStatusSolicitacao(id, 'negado');
    };

    async function atualizarStatusSolicitacao(id, status) {
        try {
            const response = await fetch(`http://localhost:3000/api/solicitacoes/status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Solicitação ${status} com sucesso!`);
                carregarSolicitacoesPendentes();
                if (document.getElementById('livros').classList.contains('active')) {
                    carregarLivrosAdmin();
                }
            } else {
                alert(data.erro || 'Erro ao atualizar solicitação!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    }

    window.removerLivro = async function(id) {
        if (!confirm('Tem certeza que deseja remover este livro?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/livros/remover/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Livro removido com sucesso!');
                carregarLivrosAdmin();
            } else {
                alert(data.erro || 'Erro ao remover livro!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    };

    window.registrarDevolucao = async function(idSolicitacao) {
        try {
            const response = await fetch(`http://localhost:3000/api/solicitacoes/devolucao/${idSolicitacao}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Devolução registrada com sucesso!');
                carregarDevolucoes();
                carregarLivrosAdmin();
            } else {
                alert(data.erro || 'Erro ao registrar devolução!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    };
});