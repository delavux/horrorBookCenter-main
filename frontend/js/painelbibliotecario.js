document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 painelbibliotecario.js carregado");

    // VERIFICAÇÃO EXTRA - Limpar se não for bibliotecário
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log("👤 Usuário no localStorage:", usuario);
    
    if (!usuario) {
        console.log("❌ Nenhum usuário logado - redirecionando para login");
        window.location.href = 'login.html';
        return;
    }

    // VERIFICAÇÃO CRÍTICA - Se não for bibliotecário, limpar e redirecionar
    if (usuario.tipo !== 'bibliotecario') {
        console.log("🚨 ALERTA: Usuário NÃO é bibliotecário! Tipo:", usuario.tipo);
        console.log("🚨 Limpando localStorage e redirecionando...");
        
        localStorage.clear();
        alert('Acesso restrito ao bibliotecário! Redirecionando...');
        window.location.href = 'login.html';
        return;
    }

    console.log("✅ Bibliotecário autenticado - inicializando painel");
    
    // Resto do código...
    document.getElementById('nome-bibliotecario').textContent = usuario.nome;
    
    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    inicializarAbas();
    carregarEstatisticas();
    carregarSolicitacoesPendentes();
});
window.removerLivro = async function(id) {
    if (!confirm('🗑️ Tem certeza que deseja remover este livro permanentemente?\n\n⚠️  Esta ação falhará se existirem solicitações vinculadas a este livro.')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/livros/remover/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Livro removido com sucesso!');
            carregarLivrosAdmin();
            carregarEstatisticas();
        } else {
            // Mostrar mensagem de erro específica
            if (data.detalhes) {
                alert('❌ ' + data.detalhes);
            } else {
                alert('❌ ' + (data.erro || 'Erro ao remover livro!'));
            }
            console.log("Erro detalhado:", data);
        }
    } catch (error) {
        alert('💥 Erro de conexão!');
    }
};







document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 painelbibliotecario.js carregado");

    // Verificar autenticação e permissões
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log("👤 Usuário logado:", usuario);
    
    if (!usuario) {
        console.log("❌ Nenhum usuário logado - redirecionando para login");
        window.location.href = 'login.html';
        return;
    }

    if (usuario.tipo !== 'bibliotecario') {
        console.log("❌ Acesso negado - usuário não é bibliotecário");
        alert('Acesso restrito ao bibliotecário!');
        window.location.href = 'painelestudante.html';
        return;
    }

    console.log("✅ Bibliotecário autenticado - inicializando painel");
    
    // Mostrar nome do bibliotecário
    document.getElementById('nome-bibliotecario').textContent = usuario.nome;
    
    // Configurar botão de logout
    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    inicializarAbas();
    carregarEstatisticas();
    carregarSolicitacoesPendentes();
});

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
                case 'usuarios':
                    carregarUsuarios();
                    break;
            }
        });
    });

    // Form de adicionar livro
    const formAdicionarLivro = document.getElementById('formAdicionarLivro');
    formAdicionarLivro.addEventListener('submit', adicionarLivro);
}

async function carregarEstatisticas() {
    try {
        // Carregar livros
        const responseLivros = await fetch('http://localhost:3000/api/livros');
        const livros = await responseLivros.json();
        document.getElementById('total-livros').textContent = livros.length;

        // Carregar solicitações
        const responseSolicitacoes = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
        const solicitacoes = await responseSolicitacoes.json();
        document.getElementById('solicitacoes-pendentes').textContent = solicitacoes.length;

        // Contar empréstimos ativos (aprovados)
        const emprestimosAtivos = solicitacoes.filter(s => s.status === 'aprovado').length;
        document.getElementById('emprestimos-ativos').textContent = emprestimosAtivos;

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function carregarSolicitacoesPendentes() {
    try {
        console.log("📋 Carregando solicitações pendentes...");
        const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
        const solicitacoes = await response.json();

        const listaSolicitacoes = document.getElementById('lista-solicitacoes');
        
        if (solicitacoes.length === 0) {
            listaSolicitacoes.innerHTML = '<p class="sem-dados">🎉 Nenhuma solicitação pendente!</p>';
            return;
        }

        listaSolicitacoes.innerHTML = solicitacoes.map(s => `
            <div class="solicitacao-item">
                <div class="solicitacao-info">
                    <strong>📖 Livro:</strong> ${s.livro}<br>
                    <strong>👤 Aluno:</strong> ${s.usuario}<br>
                    <strong>📅 Data:</strong> ${new Date(s.data_solicitacao).toLocaleString()}<br>
                    <strong>📊 Status:</strong> <span class="status-${s.status}">${s.status}</span>
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
        `).join('');

        // Atualizar estatísticas
        carregarEstatisticas();

    } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        document.getElementById('lista-solicitacoes').innerHTML = '<p class="erro">❌ Erro ao carregar solicitações.</p>';
    }
}

async function carregarLivrosAdmin() {
    try {
        console.log("📚 Carregando livros para administração...");
        const response = await fetch('http://localhost:3000/api/livros');
        const livros = await response.json();

        const listaLivrosAdmin = document.getElementById('lista-livros-admin');
        
        if (livros.length === 0) {
            listaLivrosAdmin.innerHTML = '<p class="sem-dados">📝 Nenhum livro cadastrado. Adicione o primeiro livro!</p>';
            return;
        }

        listaLivrosAdmin.innerHTML = livros.map(livro => `
            <div class="livro-admin-item">
                <div class="livro-info">
                    <strong>${livro.titulo}</strong><br>
                    <span>✍️ Autor: ${livro.autor || 'Não informado'}</span><br>
                    <span class="status ${livro.disponivel ? 'disponivel' : 'indisponivel'}">
                        ${livro.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                    </span>
                </div>
                <div class="livro-acoes">
                    <button onclick="removerLivro(${livro.id})" class="btn-perigo">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        document.getElementById('lista-livros-admin').innerHTML = '<p class="erro">❌ Erro ao carregar livros.</p>';
    }
}

async function carregarDevolucoes() {
    try {
        console.log("📥 Carregando devoluções...");
        const response = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
        const solicitacoes = await response.json();

        const aprovados = solicitacoes.filter(s => s.status === 'aprovado');
        const listaDevolucoes = document.getElementById('lista-devolucoes');
        
        if (aprovados.length === 0) {
            listaDevolucoes.innerHTML = '<p class="sem-dados">📚 Nenhum empréstimo ativo no momento.</p>';
            return;
        }

        listaDevolucoes.innerHTML = aprovados.map(s => `
            <div class="devolucao-item">
                <div class="devolucao-info">
                    <strong>📖 Livro:</strong> ${s.livro}<br>
                    <strong>👤 Aluno:</strong> ${s.usuario}<br>
                    <strong>📅 Data do empréstimo:</strong> ${new Date(s.data_solicitacao).toLocaleDateString()}
                </div>
                <div class="devolucao-acoes">
                    <button onclick="registrarDevolucao(${s.id})" class="btn-sucesso">
                        📥 Registrar Devolução
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar devoluções:', error);
        document.getElementById('lista-devolucoes').innerHTML = '<p class="erro">❌ Erro ao carregar devoluções.</p>';
    }
}

async function carregarUsuarios() {
    try {
        console.log("👥 Carregando usuários...");
        // Esta função precisaria de uma rota específica para usuários
        document.getElementById('lista-usuarios').innerHTML = `
            <div class="sem-dados">
                <p>🔧 Funcionalidade em desenvolvimento</p>
                <p>Em breve você poderá gerenciar todos os usuários aqui!</p>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

async function adicionarLivro(e) {
    e.preventDefault();

    const titulo = document.getElementById('tituloLivro').value;
    const autor = document.getElementById('autorLivro').value;
    const imagem = document.getElementById('imagemLivro').value;

    try {
        console.log("➕ Adicionando novo livro:", titulo);
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
            alert('✅ Livro adicionado com sucesso!');
            document.getElementById('formAdicionarLivro').reset();
            carregarLivrosAdmin();
            carregarEstatisticas();
        } else {
            alert('❌ ' + (data.erro || 'Erro ao adicionar livro!'));
        }
    } catch (error) {
        alert('💥 Erro de conexão ao adicionar livro!');
    }
}

// Funções globais para o bibliotecário
window.aprovarSolicitacao = async function(id) {
    if (!confirm('✅ Aprovar esta solicitação de empréstimo?')) return;
    await atualizarStatusSolicitacao(id, 'aprovado');
};

window.negarSolicitacao = async function(id) {
    if (!confirm('❌ Negar esta solicitação de empréstimo?')) return;
    await atualizarStatusSolicitacao(id, 'negado');
};

async function atualizarStatusSolicitacao(id, status) {
    try {
        console.log(`🔄 Atualizando solicitação ${id} para: ${status}`);
        const response = await fetch(`http://localhost:3000/api/solicitacoes/status/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Solicitação ${status} com sucesso!`);
            carregarSolicitacoesPendentes();
            carregarEstatisticas();
        } else {
            alert('❌ ' + (data.erro || 'Erro ao atualizar solicitação!'));
        }
    } catch (error) {
        alert('💥 Erro de conexão!');
    }
}

window.removerLivro = async function(id) {
    if (!confirm('🗑️ Tem certeza que deseja remover este livro permanentemente?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/livros/remover/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Livro removido com sucesso!');
            carregarLivrosAdmin();
            carregarEstatisticas();
        } else {
            alert('❌ ' + (data.erro || 'Erro ao remover livro!'));
        }
    } catch (error) {
        alert('💥 Erro de conexão!');
    }
};

window.registrarDevolucao = async function(idSolicitacao) {
    if (!confirm('📥 Confirmar devolução deste livro?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/solicitacoes/devolucao/${idSolicitacao}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Devolução registrada com sucesso!');
            carregarDevolucoes();
            carregarLivrosAdmin();
            carregarEstatisticas();
        } else {
            alert('❌ ' + (data.erro || 'Erro ao registrar devolução!'));
        }
    } catch (error) {
        alert('💥 Erro de conexão!');
    }
};