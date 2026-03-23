const state = {
  role: 'supplier',
  tab: 'overview',
  search: '',
  syncFilter: 'all',
  marketFilter: 'all',
};

const integrations = {
  supplier: [
    { name: 'МойСклад', status: 'Подключён', description: 'Каталог и остатки обновляются автоматически каждые 5 минут.' },
    { name: 'Wildberries', status: 'Синхронизация остатков', description: '97 карточек передают остатки для 6 продавцов.' },
    { name: 'Ozon', status: 'Синхронизация заказов', description: 'Заказы подтягиваются в общую ленту поставщика.' },
  ],
  seller: [
    { name: 'Wildberries API', status: 'Ключ активен', description: 'Доступен импорт заказов и публикация остатков.' },
    { name: 'Ozon API', status: 'Ключ активен', description: 'Синхронизация доступна по Client ID и API ключу.' },
    { name: 'Каталог поставщика', status: 'Подключён', description: 'Продавец видит актуальный ассортимент и остатки.' },
  ],
};

const products = [
  { id: 1, name: 'Постельное бельё Velvet Gray', sku: 'RS-10024', price: 1250, stock: 87, marketplaces: ['WB', 'Ozon'], sellerVisible: true },
  { id: 2, name: 'Плед Nordic Sand', sku: 'RS-10057', price: 1640, stock: 42, marketplaces: ['WB'], sellerVisible: true },
  { id: 3, name: 'Набор полотенец Pure Cotton', sku: 'RS-10103', price: 790, stock: 130, marketplaces: ['Ozon'], sellerVisible: true },
  { id: 4, name: 'Декоративная подушка Loft', sku: 'RS-10188', price: 560, stock: 18, marketplaces: [], sellerVisible: true },
  { id: 5, name: 'Покрывало Soft Cloud', sku: 'RS-10211', price: 2190, stock: 24, marketplaces: ['WB', 'Ozon'], sellerVisible: true },
  { id: 6, name: 'Шторы Blackout Graphite', sku: 'RS-10340', price: 1490, stock: 63, marketplaces: ['WB'], sellerVisible: false },
];

const orders = [
  { product: 'Постельное бельё Velvet Gray', sku: 'RS-10024', purchasePrice: 1250, salePrice: 2190, market: 'WB', seller: 'Home Textile Store' },
  { product: 'Покрывало Soft Cloud', sku: 'RS-10211', purchasePrice: 2190, salePrice: 3290, market: 'Ozon', seller: 'Nordic Dreams' },
  { product: 'Плед Nordic Sand', sku: 'RS-10057', purchasePrice: 1640, salePrice: 2490, market: 'WB', seller: 'Home Textile Store' },
  { product: 'Набор полотенец Pure Cotton', sku: 'RS-10103', purchasePrice: 790, salePrice: 1390, market: 'Ozon', seller: 'Bedding Market' },
  { product: 'Постельное бельё Velvet Gray', sku: 'RS-10024', purchasePrice: 1250, salePrice: 2250, market: 'Ozon', seller: 'Bedding Market' },
  { product: 'Декоративная подушка Loft', sku: 'RS-10188', purchasePrice: 560, salePrice: 1190, market: 'WB', seller: 'Home Textile Store' },
];

const formatPrice = (value) => `${value.toLocaleString('ru-RU')} ₽`;

const roleButtons = document.querySelectorAll('.role-btn');
const navButtons = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.tab-panel');
const searchInput = document.getElementById('search-input');
const syncFilter = document.getElementById('sync-filter');
const marketFilter = document.getElementById('market-filter');
const catalogGrid = document.getElementById('catalog-grid');
const ordersBody = document.getElementById('orders-body');
const overviewIntegrations = document.getElementById('overview-integrations');

function renderOverview() {
  const supplierMode = state.role === 'supplier';
  document.getElementById('overview-title').textContent = supplierMode ? 'Кабинет поставщика' : 'Кабинет продавца';
  document.getElementById('overview-description').textContent = supplierMode
    ? 'Подключение МойСклад, контроль остатков и все заказы продавцов.'
    : 'Подключение API-ключей WB/Ozon, доступ к каталогу поставщика и собственные заказы.';
  document.getElementById('orders-description').textContent = supplierMode
    ? 'Поставщик видит заказы всех продавцов, продавец — только свои.'
    : 'Продавец видит только свои заказы по подключённым магазинам.';
  document.getElementById('sync-status').textContent = supplierMode ? 'WB + Ozon + МойСклад' : 'WB / Ozon API подключены';
  document.getElementById('hero-products').textContent = supplierMode ? '128' : '97';
  document.getElementById('hero-orders').textContent = supplierMode ? '36' : '8';

  overviewIntegrations.innerHTML = integrations[state.role]
    .map(
      (item) => `
        <div class="integration-state">
          <strong>${item.name}</strong>
          <small>${item.status}</small>
          <p>${item.description}</p>
        </div>
      `,
    )
    .join('');

  document.getElementById('supplier-form-card').style.opacity = supplierMode ? '1' : '.72';
  document.getElementById('seller-form-card').style.opacity = supplierMode ? '.72' : '1';
}

function getVisibleProducts() {
  return products
    .filter((product) => state.role === 'supplier' || product.sellerVisible)
    .filter((product) => {
      if (!state.search) return true;
      const query = state.search.toLowerCase();
      return product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    })
    .filter((product) => {
      if (state.syncFilter === 'synced') return product.marketplaces.length > 0;
      if (state.syncFilter === 'wb') return product.marketplaces.includes('WB');
      if (state.syncFilter === 'ozon') return product.marketplaces.includes('Ozon');
      return true;
    });
}

function renderCatalog() {
  const visibleProducts = getVisibleProducts();

  catalogGrid.innerHTML = visibleProducts
    .map((product) => {
      const syncBadges = product.marketplaces.length
        ? product.marketplaces
            .map((market) => `<span class="sync-icon sync-icon--${market.toLowerCase()}">${market === 'WB' ? '🟠' : '🔵'} ${market}</span>`)
            .join('')
        : '<span class="market-chip">Без синхронизации</span>';

      return `
        <article class="product-card">
          <div class="product-image">${product.sku}</div>
          <div class="catalog-meta">
            <span class="market-chip">Остаток: ${product.stock} шт.</span>
            <div class="market-tags">${syncBadges}</div>
          </div>
          <h3>${product.name}</h3>
          <p>Артикул: ${product.sku}</p>
          <div class="product-footer">
            <div class="product-price">
              <span>Закупка</span>
              <strong>${formatPrice(product.price)}</strong>
            </div>
            <button class="primary-btn" type="button">Синхронизировать</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function getVisibleOrders() {
  return orders
    .filter((order) => state.role === 'supplier' || order.seller === 'Home Textile Store')
    .filter((order) => (state.marketFilter === 'all' ? true : order.market === state.marketFilter));
}

function renderOrders() {
  const visibleOrders = getVisibleOrders();

  ordersBody.innerHTML = visibleOrders
    .map(
      (order) => `
        <tr>
          <td>${order.product}</td>
          <td>${order.sku}</td>
          <td>${formatPrice(order.purchasePrice)}</td>
          <td>${formatPrice(order.salePrice)}</td>
          <td><span class="sync-icon sync-icon--${order.market.toLowerCase()}">${order.market === 'WB' ? '🟠' : '🔵'} ${order.market}</span></td>
          <td>${order.seller}</td>
        </tr>
      `,
    )
    .join('');
}

function setRole(role) {
  state.role = role;
  roleButtons.forEach((button) => button.classList.toggle('active', button.dataset.role === role));
  renderOverview();
  renderCatalog();
  renderOrders();
}

function setTab(tab) {
  state.tab = tab;
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tab));
}

roleButtons.forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));
navButtons.forEach((button) => button.addEventListener('click', () => setTab(button.dataset.tab)));
searchInput.addEventListener('input', (event) => {
  state.search = event.target.value.trim();
  renderCatalog();
});
syncFilter.addEventListener('change', (event) => {
  state.syncFilter = event.target.value;
  renderCatalog();
});
marketFilter.addEventListener('change', (event) => {
  state.marketFilter = event.target.value;
  renderOrders();
});

renderOverview();
renderCatalog();
renderOrders();
setTab('overview');
