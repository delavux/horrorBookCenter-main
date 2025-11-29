// Script para controlar o estado de login em todas as páginas
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 controleLogin.js carregado");
    
    const btnLogout = document.getElementById('btnLogout');
    const btnBibliotecario = document.querySelector('.btn-bibliotecario');
    
    // Verificar se está logado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const logado = localStorage.getItem('logado') === 'true';
    
    console.log("👤 Estado do login:", { logado, usuario });
    
    if (logado && usuario) {
        // Mostrar botão de logout
        if (btnLogout) {
            btnLogout.style.display = 'block';
            btnLogout.addEventListener('click', function() {
                console.log("🚪 Usuário solicitou logout");
                localStorage.clear();
                alert('Logout realizado com sucesso!');
                window.location.href = 'index.html';
            });
        }
        
        // Esconder link do bibliotecário se não for bibliotecário
        if (btnBibliotecario && usuario.tipo !== 'bibliotecario') {
            btnBibliotecario.style.display = 'none';
        }
        
        // Mostrar indicador de usuário logado
        mostrarUsuarioLogado(usuario);
    } else {
        // Não está logado - garantir que botão de logout está escondido
        if (btnLogout) {
            btnLogout.style.display = 'none';
        }
    }
});

function mostrarUsuarioLogado(usuario) {
    // Adicionar indicador visual de usuário logado
    const navbar = document.querySelector('.navbar');
    if (navbar && !document.getElementById('indicador-usuario')) {
        const indicador = document.createElement('div');
        indicador.id = 'indicador-usuario';
        indicador.innerHTML = `
            <div style="background: rgba(0, 184, 148, 0.2); padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid #00b894; font-size: 0.9rem;">
                👤 Logado como: <strong>${usuario.nome}</strong> (${usuario.tipo})
            </div>
        `;
        
        // Inserir antes do bibliotecario-area
        const bibliotecarioArea = document.querySelector('.bibliotecario-area');
        if (bibliotecarioArea) {
            navbar.insertBefore(indicador, bibliotecarioArea);
        }
    }
}

// Função global para logout
window.fazerLogout = function() {
    localStorage.clear();
    window.location.href = 'index.html';
};