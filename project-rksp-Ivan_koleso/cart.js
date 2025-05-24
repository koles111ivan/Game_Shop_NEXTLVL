// Функция форматирования цены
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Получаем товары из localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Обновляем корзину на странице
function renderCart() {
    const cartItems = getCartItems();
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.total-price');
    cartItemsContainer.innerHTML = ''; // Очищаем контейнер

    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
        cartSummary.textContent = '0 ₽';
        return;
    }

    cartItems.forEach(item => {
        total += item.price * item.quantity;

        // Создаем элемент товара
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // Кнопка удаления
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.onclick = () => removeFromCart(item.name);
        cartItem.appendChild(removeBtn);

        // Картинка
        const img = document.createElement('img');
        img.className = 'cart-item-image';
        img.src = item.image;
        img.alt = item.name;

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
        price.textContent = `${formatPrice(item.price)} ₽`;

        // Количество
        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'cart-item-quantity';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => changeQuantity('minus', item.name);

        const quantityInput = document.createElement('input');
        quantityInput.className = 'quantity-input';
        quantityInput.type = 'text';
        quantityInput.value = item.quantity;
        quantityInput.readOnly = true;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => changeQuantity('plus', item.name);

        quantityDiv.appendChild(minusBtn);
        quantityDiv.appendChild(quantityInput);
        quantityDiv.appendChild(plusBtn);

        details.appendChild(name);
        details.appendChild(price);
        details.appendChild(quantityDiv);

        cartItem.appendChild(img);
        cartItem.appendChild(details);

        cartItemsContainer.appendChild(cartItem);
    });

    cartSummary.textContent = `${formatPrice(total)} ₽`;
}

// Функция изменения количества
function changeQuantity(type, name) {
    let cart = getCartItems();
    const item = cart.find(i => i.name === name);
    if (!item) return;

    if (type === 'plus') {
        item.quantity += 1;
    } else if (type === 'minus') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Функция удаления товара из корзины
function removeFromCart(name) {
    let cart = getCartItems();
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', renderCart);