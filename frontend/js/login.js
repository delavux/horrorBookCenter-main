document.addEventListener('DOMContentLoaded', function() {
    const formLogin = document.getElementById('formLogin');
    const mensagem = document.getElementById('mensagem');

    console.log("🔧 login.js carregado");

    formLogin.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        console.log("📝 Tentando login:", email);

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

            console.log("📡 Resposta da API:", response.status);

            const data = await response.json();
            console.log("📦 Dados retornados:", data);

            if (response.ok) {
                // Salvar usuário no localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                localStorage.setItem('logado', 'true');

                console.log("✅ Login bem-sucedido!");
                console.log("👤 Tipo de usuário:", data.usuario.tipo);
                console.log("🔀 Redirecionando em 1.5s...");

                mostrarMensagem('Login realizado com sucesso!', 'sucesso');

                // Redirecionar baseado no tipo de usuário
                setTimeout(() => {
                    console.log("🔄 Executando redirecionamento...");
                    if (data.usuario.tipo === 'bibliotecario') {
                        console.log("🎯 Indo para painelbibliotecario.html");
                        window.location.href = 'painelbibliotecario.html';
                    } else {
                        console.log("🎯 Indo para painelestudante.html");
                        window.location.href = 'painelestudante.html';
                    }
                }, 1500);
            } else {
                console.log("❌ Erro no login:", data.erro);
                mostrarMensagem(data.erro || 'Erro ao fazer login!', 'erro');
            }
        } catch (error) {
            console.log("💥 Erro de conexão:", error);
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
        console.log("🔍 Usuário já logado:", usuario);
        if (usuario.tipo === 'bibliotecario') {
            window.location.href = 'painelbibliotecario.html';
        } else {
            window.location.href = 'painelestudante.html';
        }
    }
});