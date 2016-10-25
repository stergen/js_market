'use strict';

(function(){

  // ================ PRODUCTS ================
  var ProductsModel = function(dataBase) {
    this.objectProducts = {};
    this.arrayProducts = [];
    this.init(dataBase)
  };
  ProductsModel.prototype.init = function(product) {
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

  var ProductsView = function() {
    this.template = '<div class="product-img-wrap"><img src="./img/%(image)"/></div>' +
      '<div class="product-name">%(name)</div>' +
      '<button class="minus" data-event="minus">-</button>' +
      '<input type="number" class="itemCount" min="1" value="1" disabled>' +
      '<button class="plus" data-event="plus">+</button>' +
      '<div class="product-price">%(price)</div>' +
      '<button class="add-to-cart" data-event="add-to-cart">add to cart</button>';
  };
  ProductsView.prototype.renderProduct = function(item) {

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
  ProductsView.prototype.render = function(items) {
    var fragProductList = document.createDocumentFragment(),
        objectProducts = document.querySelector(".product-list");

    objectProducts.innerHTML = '';

    for (var count = items.length - 1; count > 0; count--) {
      fragProductList.appendChild( this.renderProduct(items[count]) );
    }

    objectProducts.appendChild( fragProductList );
  };

  // ================ CART ================
  var CartModel = function(dataBase) {
    this.DB = dataBase;
    this.items = {};
    this.subscribers = [];
  };
  CartModel.prototype.add = function(id, count) {
    if( !this.items[ id ] ) {
      this.items[ id ] = 0;
    }
    this.items[ id ] += count;
    this.publish(this);
  };
  CartModel.prototype.delete = function(id, count) {
    delete this.items[id];
    this.publish(this);
  };
  CartModel.prototype.getTotalSum = function() {
    var sum = 0;
    for (var id in this.items) {
      sum += this.DB[id].price * this.items[id];
    }

    return sum;
  };
  CartModel.prototype.getTotalCount = function() {
    var count = 0;
    for (var id in this.items) {
      count += this.items[id];
    }
    return count;
  };
  // --- Observer ---
  CartModel.prototype.subscribe = function(fn) {

    this.subscribers.push(fn);
  };
  CartModel.prototype.unsubscribe = function(fn) {
    var i = 0,
      len = this.subscribers.length;

    for (; i < len; i++) {
      if (this.subscribers[i] === fn) {
        this.subscribers.splice(i, 1);
        return;
      }
    }
  };
  CartModel.prototype.publish = function(data) {
    var i = 0,
      len = this.subscribers.length;

    for (; i < len; i++) {
      this.subscribers[i](data);
    }
  };

  var CartView = function() {
    this.popupWrapEL = document.createElement('div');
    this.popupWrapEL.classList.add('popup-wrap');
    this.cartOpen = false;

    this.template = '<div class="header-popup">Cart' +
      '<div class="close-popup" data-event="close-popup"></div></div>' +
      '<div class="body-popup">%(content)</div>' +
      '<div class="footer-popup">%(totalPrice)</div>';

    this.item = '<div class="item-name">%(name)</div>'+
      '<div class="item-price">%(price)</div>'+
      '<div class="item-count">%(count)</div>'+
      '<div class="item-total-price">%(total)</div>'+
      '<div class="item-delate"><span class="del" data-id="%(id)" data-event="remove-product">x</span></div>';
  };
  CartView.prototype.renderCartInHeader = function(data) {
    var countEl = document.querySelector(".cart-count"),
    // totalPrice = document.querySelector(".cart-price"),
      count = data.getTotalCount(),
      sum = data.getTotalSum();

    countEl.innerText = count;
    // totalPrice.innerText = sum;
  };
  CartView.prototype.renderPopupWrap = function(content) {
    var popupEL = document.createElement('div');
    popupEL.innerHTML = this.template.replace("%(content)", content);
    //popupEL.innerHTML = this.template.replace("%(totalPrice)", 50);
    popupEL.classList.add('popup');
    this.popupWrapEL.appendChild(popupEL);

    document.querySelector('body').appendChild(this.popupWrapEL);
  };
  CartView.prototype.renderPopupContent = function(data) {
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
  CartView.prototype.renderPopup = function(data) {
    var content;
    content = this.renderPopupContent(data);

    if (!this.cartOpen) {
      this.renderPopupWrap(content);
      this.cartOpen = !this.cartOpen;
    }
    document.querySelector('.body-popup').innerHTML = content;
  };
  CartView.prototype.destroy = function() {
    document.querySelector('body').removeChild(this.popupWrapEL);
    this.popupWrapEL.innerHTML = "";
    this.cartOpen = !this.cartOpen;
  };

  // ================ SORT ================
  var sort = function(items, type) {
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

  var Filter = function(array) {
    this.baseArray = array;
    this.decoratorsList = [];
  }
  Filter.prototype.getFiltered = function() {

    return this.baseArray;
  }
  Filter.prototype.decorate = function(decorator, value) {
    this.decoratorsList.push([decorator, value]);
  }
  Filter.prototype.getFiltered = function() {
    var arr = this.baseArray,
        length = this.decoratorsList.length,
        i, name, value;
    for (i = 0; i < length; i++) {
      name = this.decoratorsList[i][0];
      value = this.decoratorsList[i][1];
      arr = Filter.decorators[name].getFiltered(arr, value);
    }
    return arr;
  };
  Filter.decorators = {};
  Filter.decorators.maxPrice = {
    getFiltered: function(arr, value) {
      return arr.filter(function(obj){
        return obj.price <= value;
      });
    },
  };
  Filter.decorators.minPrice = {
    getFiltered: function(arr, value) {
      return arr.filter(function(obj){
        return obj.price >= value;
      });
    },
  };  
  Filter.decorators.search = {
    getFiltered: function(arr, value) {
      return arr.filter(function(obj){
        var lowerName = obj.name.toLowerCase(),
            seek = value.toLowerCase();

        if (lowerName.indexOf(seek) > -1) { 
          return true; 
        } else { 
          return false; 
        }
      });
    },
  }; 

  window.app = function() {
    this.products = new ProductsModel(window.products);
    this.cart = new CartModel(this.products.objectProducts);
    this.cartView = new CartView();
    this.productsView = new ProductsView(this.products.objectProducts);
    this.filter = new Filter(this.products.arrayProducts);

    this.sort = sort;

    this.cart.subscribe(this.cartView.renderCartInHeader);
    this.renderPopup = this.cartView.renderPopup.bind(this.cartView);

    this.init();

    // this.filter.decorate('maxPrice', 15000);
    // this.filter.decorate('minPrice', 6000);
    // this.filter.decorate('search', 'asus');

    // var lol = this.filter.getFiltered();
    // debugger;

  };
})();



// ================ APP ================
window.app.prototype.init = function() {
  this.productsView.render(this.products.arrayProducts);
  var productsWrapEl = document.querySelector("body");
  productsWrapEl.addEventListener('click', this.clickHandler.bind(this), false);
};
window.app.prototype.routes = function(event) {
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
    'open-cart-popup': function() {
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
    'search': function() {
      debugger;
      var searchText = document.getElementById('search'),
          items = self.filter.add('find', searchText.value);

      self.productsView.render(items);
    },
    'сlear-search': function() {
      self.productsView.render(self.products.arrayProducts);
    },
    'filter-item': function() {
      var items = self.sort( self.products.arrayProducts, event.target.value );
      self.productsView.render(items);
    },
  };
};
window.app.prototype.clickHandler = function() {
  var eventName = event.target.getAttribute('data-event'),
      eventsObj = this.routes.call(this, event),
      eventFunction = eventsObj[eventName];

  if(eventFunction != undefined) {
    eventFunction();
  }
};

var application = new window.app();
