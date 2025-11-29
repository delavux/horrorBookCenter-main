document.addEventListener('DOMContentLoaded', function() {
    const formCadastro = document.getElementById('formCadastro');
    const mensagem = document.getElementById('mensagem');

    formCadastro.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const tipo = document.getElementById('tipo').value;

        // Validações
        if (senha !== confirmarSenha) {
            mostrarMensagem('As senhas não coincidem!', 'erro');
            return;
        }

        if (senha.length < 6) {
            mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'erro');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/usuarios/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    tipo
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarMensagem('Cadastro realizado com sucesso! Redirecionando...', 'sucesso');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                mostrarMensagem(data.erro || 'Erro ao cadastrar!', 'erro');
            }
        } catch (error) {
            mostrarMensagem('Erro de conexão! Verifique o servidor.', 'erro');
        }
    });

    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = `mensagem ${tipo}`;
        mensagem.style.display = 'block';

        setTimeout(() => {
            mensagem.style.display = 'none';
        }, 5000);
    }
});