// Получаем товары из localStorage
function getCartItems() {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Items in cart:', items);
    return items;
}

// Обновляем корзину на странице
function renderCart() {
    const cartItems = getCartItems();
    console.log('Rendering cart items:', cartItems);
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.total-price');
    cartItemsContainer.innerHTML = '';

    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
        cartSummary.textContent = '0 ₽';
        return;
    }

    cartItems.forEach(item => {
        total += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // Кнопка удаления
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.onclick = () => removeFromCart(item.id);
        cartItem.appendChild(removeBtn);

        // Картинка
        const imgContainer = document.createElement('div');
        imgContainer.className = 'cart-item-image';
        
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        
        img.onerror = function() {
            console.error('Ошибка загрузки изображения:', item.image);
            this.style.display = 'none';
        };
        
        imgContainer.appendChild(img);
        cartItem.appendChild(imgContainer);

        // Детали
        const details = document.createElement('div');
        details.className = 'cart-item-details';

        // Название
        const name = document.createElement('h3');
        name.className = 'cart-item-name';
        name.textContent = item.name;

        // Цена
        const price = document.createElement('p');
        price.className = 'cart-item-price';
        price.textContent = `${item.price} ₽`;

        // Количество
        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'cart-item-quantity';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => changeQuantity('minus', item.id);

        const quantityInput = document.createElement('input');
        quantityInput.className = 'quantity-input';
        quantityInput.type = 'text';
        quantityInput.value = item.quantity;
        quantityInput.readOnly = true;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => changeQuantity('plus', item.id);

        quantityDiv.appendChild(minusBtn);
        quantityDiv.appendChild(quantityInput);
        quantityDiv.appendChild(plusBtn);

        details.appendChild(name);
        details.appendChild(price);
        details.appendChild(quantityDiv);

        cartItem.appendChild(details);
        cartItemsContainer.appendChild(cartItem);
    });

    cartSummary.textContent = `${total} ₽`;
}

// Функция изменения количества
function changeQuantity(type, itemId) {
    let cart = getCartItems();
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    if (type === 'plus') {
        item.quantity += 1;
    } else if (type === 'minus') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== itemId);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Функция удаления товара из корзины
function removeFromCart(itemId) {
    let cart = getCartItems();
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Функция для показа уведомления
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

// Функция проверки авторизации
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Пожалуйста, войдите в систему для оформления заказа', 'error');
        return false;
    }
    return true;
}

// Функция для определения правильного названия товара
function getCorrectProductName(productId, productName) {
    // Если название уже правильное (не содержит ????), возвращаем его как есть
    if (!productName.includes('????')) {
        return productName;
    }

    // Определяем правильное название на основе ID товара
    switch (productId) {
        case 1:
            return 'Logitech G502 X';
        case 2:
            return 'Xbox Elite Controller';
        case 3:
            return 'Razer BlackWidow V3';
        case 4:
            return 'SteelSeries Arctis Pro';
        case 5:
            return 'Razer Viper Ultimate';
        case 6:
            return 'HyperX Alloy Origins';
        case 7:
            return 'Logitech G Pro X';
        case 8:
            return 'Corsair K100 RGB';
        case 9:
        case 10:
            return 'Logitech G502 X LIGHTSPEED';
        case 11:
            return 'Геймпад Xbox Elite';
        case 12:
            return 'Клавиатура Logitech G915';
        default:
            // Если ID не найден, пытаемся определить тип товара по названию
            if (productName.toLowerCase().includes('mouse')) {
                return 'Logitech G502 X';
            } else if (productName.toLowerCase().includes('gamepad')) {
                return 'Xbox Elite Controller';
            } else if (productName.toLowerCase().includes('keyboard')) {
                return 'Razer BlackWidow V3';
            } else if (productName.toLowerCase().includes('headset')) {
                return 'SteelSeries Arctis Pro';
            }
            return productName.replace(/\?\?\?\?/g, 'Logitech');
    }
}

// Функция добавления товара в корзину
function addToCart(product) {
    console.log('Adding product to cart:', product);

    // Проверяем наличие всех необходимых полей
    if (!product || !product.id || !product.name || !product.price) {
        console.error('Invalid product data:', product);
        showNotification('Ошибка при добавлении товара в корзину', 'error');
        return;
    }

    // Преобразуем ID в число
    let productId;
    if (typeof product.id === 'string') {
        // Если ID строка вида "mouse1", извлекаем число
        const match = product.id.match(/\d+/);
        if (match) {
            productId = parseInt(match[0]);
            console.log('Извлеченный ID из строки:', productId);
        } else {
            console.error('Invalid product ID format:', product.id);
            showNotification('Ошибка: некорректный формат ID товара', 'error');
            return;
        }
    } else {
        productId = parseInt(product.id);
        console.log('Преобразованный ID:', productId);
    }

    // Проверяем, что ID успешно преобразован в число
    if (isNaN(productId)) {
        console.error('Invalid product ID:', product.id);
        showNotification('Ошибка: некорректный ID товара', 'error');
        return;
    }

    // Используем функцию getCorrectProductName для определения правильного названия
    const productName = getCorrectProductName(productId, product.name);

    // Преобразуем данные в правильный формат
    const formattedProduct = {
        id: productId,
        name: productName.trim(),
        price: Number(product.price),
        image: product.image || product.image_url || '',
        quantity: 1
    };

    console.log('Formatted product:', formattedProduct);

    let cart = getCartItems();
    const existingItem = cart.find(item => item.id === formattedProduct.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(formattedProduct);
    }

    console.log('Updated cart:', cart);
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Товар добавлен в корзину', 'success');
    renderCart();
}

// Функция обновления счетчика товаров в корзине
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return; // Если элемент не найден, просто выходим

    const cart = getCartItems();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Скрываем счетчик, если корзина пуста
    cartCountElement.style.display = totalItems > 0 ? 'block' : 'none';
}

// Функция оформления заказа
async function checkout() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Товары в корзине:', cart);

        if (cart.length === 0) {
            showNotification('Корзина пуста', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Пожалуйста, войдите в систему', 'error');
            return;
        }

        // Получаем ID пользователя из токена
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData.id;

        // Проверяем и преобразуем товары в формат для заказа
        const orderItems = cart.map(item => {
            console.log('Обработка товара:', item);
            
            // Проверяем, что ID является числом
            let productId;
            if (typeof item.id === 'string') {
                // Если ID строка вида "mouse1", извлекаем число
                const match = item.id.match(/\d+/);
                if (match) {
                    productId = parseInt(match[0]);
                } else {
                    throw new Error(`Некорректный формат ID товара: ${item.id}`);
                }
            } else {
                productId = parseInt(item.id);
            }

            if (isNaN(productId)) {
                throw new Error(`Некорректный ID товара: ${item.id}`);
            }

            console.log('Преобразованный ID:', productId);
            
            return {
                product_id: productId,
                quantity: parseInt(item.quantity) || 1,
                price: parseFloat(item.price) || 0,
                product_name: getCorrectProductName(productId, item.name) // Используем функцию для получения правильного названия
            };
        });

        // Проверяем, что все необходимые поля присутствуют
        const validOrderItems = orderItems.filter(item => 
            item.product_id && 
            item.quantity && 
            item.price && 
            !isNaN(item.product_id) && 
            !isNaN(item.quantity) && 
            !isNaN(item.price)
        );

        if (validOrderItems.length === 0) {
            throw new Error('Нет валидных товаров для заказа');
        }

        const orderData = {
            user_id: parseInt(userId),
            items: validOrderItems,
            total_amount: validOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        console.log('Отправка данных заказа:', orderData);

        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        console.log('Ответ сервера:', data);

        if (!response.ok) {
            // Проверяем наличие конкретной ошибки от сервера
            if (data.error) {
                throw new Error(data.error);
            } else if (data.message) {
                throw new Error(data.message);
            } else {
                throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
            }
        }

        // Очищаем корзину после успешного заказа
        localStorage.removeItem('cart');
        updateCartCount(); // Обновляем счетчик корзины
        showNotification('Заказ успешно оформлен!', 'success');
        
        // Перенаправляем на страницу заказов
        window.location.href = 'orders.html';

    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        showNotification(error.message || 'Произошла ошибка при оформлении заказа', 'error');
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount(); // Обновляем счетчик при загрузке страницы
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}); 