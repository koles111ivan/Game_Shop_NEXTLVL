// Функция для проверки авторизации
function checkAuth() {
    const token = localStorage.getItem('token');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (token) {
        // Пользователь авторизован
        authButtons.innerHTML = '';
    } else {
        // Пользователь не авторизован
        authButtons.innerHTML = '';
    }
}

// Функция для выхода
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAuth); 