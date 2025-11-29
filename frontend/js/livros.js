document.addEventListener('DOMContentLoaded', function() {
    const listaLivros = document.getElementById('lista-livros');
    const buscarInput = document.getElementById('buscarLivro');
    const filtroSelect = document.getElementById('filtroDisponibilidade');

    carregarLivros();

    // Event listeners para filtros
    buscarInput.addEventListener('input', carregarLivros);
    filtroSelect.addEventListener('change', carregarLivros);

    async function carregarLivros() {
        try {
            const response = await fetch('http://localhost:3000/api/livros');
            const livros = await response.json();

            const termoBusca = buscarInput.value.toLowerCase();
            const filtro = filtroSelect.value;

            const livrosFiltrados = livros.filter(livro => {
                const correspondeBusca = livro.titulo.toLowerCase().includes(termoBusca) ||
                                       livro.autor.toLowerCase().includes(termoBusca);
                
                let correspondeFiltro = true;
                if (filtro === 'disponivel') {
                    correspondeFiltro = livro.disponivel;
                } else if (filtro === 'indisponivel') {
                    correspondeFiltro = !livro.disponivel;
                }

                return correspondeBusca && correspondeFiltro;
            });

            exibirLivros(livrosFiltrados);
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            listaLivros.innerHTML = '<p class="erro">Erro ao carregar livros.</p>';
        }
    }

    function exibirLivros(livros) {
        if (livros.length === 0) {
            listaLivros.innerHTML = '<p class="sem-livros">Nenhum livro encontrado.</p>';
            return;
        }

        listaLivros.innerHTML = livros.map(livro => `
            <div class="livro-card ${!livro.disponivel ? 'indisponivel' : ''}">
                <div class="livro-imagem">
                    ${livro.imagem ? 
                        `<img src="${livro.imagem}" alt="${livro.titulo}">` : 
                        `<div class="sem-imagem">📚</div>`
                    }
                </div>
                <div class="livro-info">
                    <h3>${livro.titulo}</h3>
                    <p class="autor">${livro.autor || 'Autor desconhecido'}</p>
                    <div class="livro-status ${livro.disponivel ? 'disponivel' : 'indisponivel'}">
                        ${livro.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                    </div>
                    ${livro.disponivel ? 
                        `<button class="btn-solicitar" onclick="solicitarLivro(${livro.id})">
                            Solicitar Empréstimo
                        </button>` : 
                        ''
                    }
                </div>
            </div>
        `).join('');
    }

    // Função global para solicitar livro
    window.solicitarLivro = async function(idLivro) {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        if (!usuario) {
            alert('Faça login para solicitar livros!');
            window.location.href = 'login.html';
            return;
        }

        if (!confirm('Deseja solicitar este livro?')) {
            return;
        }

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
                alert('Solicitação enviada com sucesso! Aguarde aprovação.');
                carregarLivros(); // Recarregar lista
            } else {
                alert(data.erro || 'Erro ao solicitar livro!');
            }
        } catch (error) {
            alert('Erro de conexão!');
        }
    };
});