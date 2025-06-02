// Функция для получения заказов пользователя
async function getUserOrders() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Получаем ID пользователя из токена
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData.id;

        // Получаем заказы пользователя
        const response = await fetch('http://localhost:3000/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении заказов');
        }

        const orders = await response.json();
        
        // Фильтруем заказы только текущего пользователя
        const userOrders = orders.filter(order => Number(order.user_id) === Number(userId));

        // Обрабатываем каждый заказ
        const processedOrders = userOrders.map(order => {
            let items = [];
            
            try {
                // Если items это строка, пытаемся распарсить её
                if (typeof order.items === 'string') {
                    // Используем регулярное выражение для извлечения данных
                    const itemRegex = /"price":\s*(\d+\.?\d*),\s*"quantity":\s*(\d+),\s*"product_id":\s*(\d+),\s*"product_name":\s*"([^"]+)"/g;
                    let match;
                    
                    while ((match = itemRegex.exec(order.items)) !== null) {
                        const [_, price, quantity, productId, productName] = match;
                        items.push({
                            product_id: Number(productId),
                            quantity: Number(quantity),
                            price: Number(price),
                            product_name: productName.includes('????') ? getProductNameById(Number(productId)) : productName
                        });
                    }
                } else if (Array.isArray(order.items)) {
                    items = order.items.map(item => ({
                        product_id: Number(item.product_id),
                        quantity: Number(item.quantity),
                        price: Number(item.price),
                        product_name: item.product_name || getProductNameById(Number(item.product_id))
                    }));
                } else if (typeof order.items === 'object') {
                    items = [{
                        product_id: Number(order.items.product_id),
                        quantity: Number(order.items.quantity),
                        price: Number(order.items.price),
                        product_name: order.items.product_name || getProductNameById(Number(order.items.product_id))
                    }];
                }

                return {
                    ...order,
                    items: items
                };
            } catch (e) {
                console.error('Ошибка при обработке заказа:', e);
                return {
                    ...order,
                    items: []
                };
            }
        });

        renderOrders(processedOrders);
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification(error.message, 'error');
    }
}

// Функция для получения названия товара по ID
function getProductNameById(productId) {
    const productNames = {
        1: 'Logitech G502 X',
        2: 'Xbox Elite Controller',
        3: 'Razer BlackWidow V3',
        4: 'SteelSeries Arctis Pro',
        5: 'Razer Viper Ultimate',
        6: 'HyperX Alloy Origins',
        7: 'Logitech G Pro X',
        8: 'Corsair K100 RGB',
        9: 'Logitech G502 X LIGHTSPEED',
        10: 'Logitech G502 X LIGHTSPEED',
        11: 'Геймпад Xbox Elite',
        12: 'Клавиатура Logitech G915'
    };
    
    return productNames[productId] || 'Неизвестный товар';
}

// Функция для отображения заказов
function renderOrders(orders) {
    const ordersList = document.querySelector('.orders-list');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="no-orders">У вас пока нет заказов</div>';
        return;
    }

    ordersList.innerHTML = orders.map(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        
        // Вычисляем общую сумму
        const total = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-number">Заказ #${order.id}</span>
                    <span class="order-date">${new Date(order.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
                <div class="order-items">
                    ${items.map(item => `
                        <div class="order-item">
                            <div class="item-details">
                                <div class="item-name">${item.product_name}</div>
                                <div class="item-price">${item.price.toLocaleString('ru-RU')} ₽</div>
                                <div class="item-quantity">Количество: ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    Итого: ${total.toLocaleString('ru-RU')} ₽
                </div>
            </div>
        `;
    }).join('');
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Загружаем заказы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    getUserOrders();
}); 