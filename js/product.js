'use strict';
var JSshop = JSshop || {};

// ================ PRODUCTS ================
JSshop.ProductsModel = function(dataBase) {
  this.objectProducts = {};
  this.arrayProducts = [];
  this.init(dataBase)
};
JSshop.ProductsModel.prototype.init = function(product) {
  /*
  * convert to obj where id it`s key
  * it`s need for fast get element
  * */
  this.objectProducts = product.reduce(function(db, currentItem) {
    db[currentItem.id] = currentItem;
    return db;
  }, {});
  /*
  * convert to array because we need
  * sorting and search products
  * */
  for (var itemName in this.objectProducts) {
    this.arrayProducts.push(this.objectProducts[itemName]);
  }
};
//TODO: ужно обединить с фильтрацией
JSshop.ProductsModel.prototype.search = function(strSearch) {
  var items = [],
      find,
      name;
  strSearch = strSearch.toLowerCase();
  for(var index in this.objectProducts) {

    name = this.objectProducts[index].name.toLowerCase();
    find = name.indexOf(strSearch);

    if (find > -1) {
      items[items.length] = this.objectProducts[index];
    }
  }
  return items;
};

JSshop.ProductsView = function() {
  this.template = '<div class="product-img-wrap"><img src="./img/%(image)"/></div>' +
    '<div class="product-name">%(name)</div>' +
    '<button class="plus">+</button>' +
    '<input type="number" class="itemCount" min="1" value="1" disabled>' +
    '<button class="minus">-</button>' +
    '<div class="product-price">%(price)</div>' +
    '<button class="add-to-cart">add to cart</button>';
};
JSshop.ProductsView.prototype.renderProduct = function(item) {

  var productBlock = this.template.replace(/%\((.+?)\)/g, function(expr, paramName) {
    if(paramName in item) {
      return item[paramName];
    }
    return expr;
  });

  var itemElement = document.createElement('div');

  itemElement.setAttribute('data-id', item['id']);
  itemElement.classList.add('product-item');
  itemElement.innerHTML = productBlock;

  return itemElement;
};
JSshop.ProductsView.prototype.render = function(items) {
  var fragProductList = document.createDocumentFragment(),
      objectProducts = document.querySelector(".product-list");

  objectProducts.innerHTML = '';

  for (var count = items.length - 1; count > 0; count--) {
    fragProductList.appendChild( this.renderProduct(items[count]) );
  }

  objectProducts.appendChild( fragProductList );
};

// ================ CART ================
JSshop.CartModel = function(dataBase) {
  this.DB = dataBase;
  this.items = {};
  this.subscribers = [];
};
JSshop.CartModel.prototype.add = function(id, count) {
  if( !this.items[ id ] ) {
    this.items[ id ] = 0;
  }
  this.items[ id ] += count;
  this.publish(this);
};
JSshop.CartModel.prototype.delete = function(id, count) {
  delete this.items[id];
  this.publish(this);
};
JSshop.CartModel.prototype.getTotalSum = function() {
  var sum = 0;
  for (var id in this.items) {
    sum += this.DB[id].price * this.items[id];
  }

  return sum;
};
JSshop.CartModel.prototype.getTotalCount = function() {
  var count = 0;
  for (var id in this.items) {
    count += this.items[id];
  }
  return count;
};
// --- Observer ---
JSshop.CartModel.prototype.subscribe = function(fn) {

  this.subscribers.push(fn);
};
JSshop.CartModel.prototype.unsubscribe = function(fn) {
  var i = 0,
    len = this.subscribers.length;

  for (; i < len; i++) {
    if (this.subscribers[i] === fn) {
      this.subscribers.splice(i, 1);
      return;
    }
  }
};
JSshop.CartModel.prototype.publish = function(data) {
  var i = 0,
    len = this.subscribers.length;

  for (; i < len; i++) {
    this.subscribers[i](data);
  }
};

JSshop.CartView = function() {
  this.popupWrapEL = document.createElement('div');
  this.popupWrapEL.classList.add('popup-wrap');
  this.cartOpen = false;

  this.template = '<div class="header-popup">Cart' +
    '<div class="close-popup"></div></div>' +
    '<div class="body-popup">%(content)</div>' +
    '<div class="footer-popup">%(totalPrice)</div>';

  this.item = '<div class="item-name">%(name)</div>'+
    '<div class="item-price">%(price)</div>'+
    '<div class="item-count">%(count)</div>'+
    '<div class="item-total-price">%(total)</div>'+
    '<div class="item-delate"><span class="del" data-id="%(id)">x</span></div>';
};
JSshop.CartView.prototype.renderCartInHeader = function(data) {
  var countEl = document.querySelector(".cart-count"),
  // totalPrice = document.querySelector(".cart-price"),
    count = data.getTotalCount(),
    sum = data.getTotalSum();

  countEl.innerText = count;
  // totalPrice.innerText = sum;
};
JSshop.CartView.prototype.renderPopupWrap = function(content) {
  var popupEL = document.createElement('div');
  popupEL.innerHTML = this.template.replace("%(content)", content);
  //popupEL.innerHTML = this.template.replace("%(totalPrice)", 50);
  popupEL.classList.add('popup');
  this.popupWrapEL.appendChild(popupEL);

  document.querySelector('body').appendChild(this.popupWrapEL);
};
JSshop.CartView.prototype.renderPopupContent = function(data) {
  var content = '',
    productBlock,
    item = '';

  for(item in data.items) {
    productBlock = this.item.replace(/%\((.+?)\)/g, function(expr, paramName) {
      if(paramName in data.DB[item]) {
        return data.DB[item][paramName];
      }
      if(paramName === "count") {
        return data.items[item];
      }
      if(paramName === "total") {
        return data.items[item] * data.DB[item]["price"];
      }
      return expr;
    });
    content += '<div class="item-popup">' + productBlock + '</div>';
  }

  if (content === '') {
    return '<center>Cart is empty</center>';
  }

  return content;
};
JSshop.CartView.prototype.renderPopup = function(data) {
  var content;
  content = this.renderPopupContent(data);

  if (!this.cartOpen) {
    this.renderPopupWrap(content);
    this.cartOpen = !this.cartOpen;
  }
  document.querySelector('.body-popup').innerHTML = content;
};
JSshop.CartView.prototype.destroy = function() {
  document.querySelector('body').removeChild(this.popupWrapEL);
  this.popupWrapEL.innerHTML = "";
  this.cartOpen = !this.cartOpen;
};

// ================ SORT ================
JSshop.sort = function(items, type) {
  var sortFunction,
      sortable = [];

  switch (type) {
    case 'priceLowestFirst':
      sortFunction = function(a, b) { return a[1]['price'] - b[1]['price']; };
      break;
    case 'priceHighestFirst':
      sortFunction = function(a, b) { return b[1]['price'] - a[1]['price']; };
      break;
    default:
      sortFunction = function () { return 0 };
  }

  if ( Array.isArray(items) ) {
    sortable = items;
  } else  {
    for (var itemName in items) {
      sortable.push([itemName, items[itemName]]);
    }
  }

  sortable.sort(function(a, b) {
    return sortFunction(a, b);
  });
  return sortable;
};


// ================ APP ================
JSshop.app = function() {
  this.products = new JSshop.ProductsModel(window.products);
  this.cart = new JSshop.CartModel(this.products.objectProducts);
  this.cartView = new JSshop.CartView();
  this.productsView = new JSshop.ProductsView(this.products.objectProducts);

  this.sort = JSshop.sort;

  this.cart.subscribe(this.cartView.renderCartInHeader);
  this.renderPopup = this.cartView.renderPopup.bind(this.cartView);

  this.init();
};
JSshop.app.prototype.init = function() {
  this.productsView.render(this.products.arrayProducts);
  var productsWrapEl = document.querySelector("body");
  productsWrapEl.addEventListener('click', this.redirected.bind(this), false);
};
JSshop.app.prototype.routes = function(event) {
  var self = this;

  if (event.target.parentNode.classList.contains('product-item')) {
    var countItemEl = event.target.parentNode.querySelector(".itemCount"),
      countItem = event.target.parentNode.querySelector(".itemCount").value,
      idItem  = event.target.parentNode.getAttribute('data-id');
    countItem = parseInt( countItem );
    idItem = parseInt( idItem );
  }

  return {
    'plus': function() {
      countItemEl.value = countItem + 1;
    },
    'minus': function() {
      if ( countItem != 1 ) {
        countItemEl.value = countItem - 1;
      }
    },
    'add-to-cart': function() {
      self.cart.add(idItem, countItem);
    },
    'header-shop-cart': function() {
      self.cart.subscribe(self.renderPopup);
      self.cartView.renderPopup(self.cart);
    },
    'close-popup': function() {
      self.cart.unsubscribe(self.renderPopup);
      self.cartView.destroy();
    },
    'del': function() {
      self.cart.delete(event.target.getAttribute('data-id'));
    },
    'btn-search': function() {
      var searchText = document.getElementById('search'),
        items = self.products.search(searchText.value);
      self.productsView.render(items);
    },
    'btn-crear': function() {
      self.productsView.render(self.products.arrayProducts  );
    },
    'filter-item': function() {
      var items = self.sort( self.products.arrayProducts, event.target.value );
      self.productsView.render(items);
    },
  };
};
JSshop.app.prototype.redirected = function() {
  var hasClass = function(className) {
    return event.target.classList.contains(className);
  };
  //TODO: не ясно що потрібно зробити
  var route = this.routes.call(this, event)
  for(var className in route) {
    if ( route.hasOwnProperty(className) && hasClass(className) ) {
      route[className]();
      break;
    }
  }
};

var application = new JSshop.app();
