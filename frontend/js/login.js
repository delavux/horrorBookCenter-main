document.addEventListener('DOMContentLoaded', function() {
    const formLogin = document.getElementById('formLogin');
    const mensagem = document.getElementById('mensagem');

    formLogin.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch('http://localhost:3000/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Salvar usuário no localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                localStorage.setItem('logado', 'true');

                mostrarMensagem('Login realizado com sucesso!', 'sucesso');

                // Redirecionar baseado no tipo de usuário
                setTimeout(() => {
                    if (data.usuario.tipo === 'bibliotecario') {
                        window.location.href = 'bibliotecario.html';
                    } else {
                        window.location.href = 'painelestudante.html';
                    }
                }, 1500);
            } else {
                mostrarMensagem(data.erro || 'Erro ao fazer login!', 'erro');
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

    // Verificar se já está logado
    if (localStorage.getItem('logado') === 'true') {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario.tipo === 'bibliotecario') {
            window.location.href = 'bibliotecario.html';
        } else {
            window.location.href = 'painelestudante.html';
        }
    }
});