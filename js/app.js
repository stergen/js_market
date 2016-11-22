'use strict';
window.modules = (function() {
  var modules = {};
  return {
    add: function(name, func) {
      modules[name] = func;
    },
    get: function() {
      return modules;
    }
  }
})();

(function(){
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
      '<div class="footer-popup">%(footer)</div>';

    this.item = '<div class="item-name">%(name)</div>'+
      '<div class="item-price">%(price)</div>'+
      '<div class="item-count">%(count)</div>'+
      '<div class="item-total-price">%(total)</div>'+
      '<div class="item-delate"><span class="del" data-id="%(id)" data-event="remove-product">x</span></div>';
  };
  CartView.prototype.renderCartInHeader = function(data) {
    var countEl = document.querySelector(".cart-count"),
      count = data.getTotalCount(),
      sum = data.getTotalSum();

    countEl.innerText = count;
  };
  CartView.prototype.renderPopupContent = function(CartModel) {
    var productBlock,
        template = '',
        content = '',
        footer = '',
        item = '';

    for(item in CartModel.items) {
      productBlock = this.item.replace(/%\((.+?)\)/g, function(expr, paramName) {
        if(paramName in CartModel.DB[item]) {
          return CartModel.DB[item][paramName];
        }
        if(paramName === "count") {
          return CartModel.items[item];
        }
        if(paramName === "total") {
          return CartModel.items[item] * CartModel.DB[item]["price"];
        }
        return expr;
      });
      content += '<div class="item-popup">' + productBlock + '</div>';
    }

    if (content === '') {
      content = '<center>Cart is empty</center>';
    }

    footer =  'Total Count: ' + CartModel.getTotalCount() + '  ' +
              'Total Sum: ' + CartModel.getTotalSum(); 

    template = this.template.replace("%(content)", content);
    template = template.replace("%(footer)", footer);

    return template;
  };
  CartView.prototype.renderPopup = function(CartModel) {
    var content = this.renderPopupContent(CartModel),
        popupEL = document.createElement('div');
        popupEL.classList.add('popup');

    if ( this.cartOpen ) {
      document.getElementsByClassName('popup')[0].innerHTML = content;
      return;
    }

    popupEL.innerHTML = content;
    document.querySelector('body').appendChild(this.popupWrapEL);
    this.popupWrapEL.appendChild(popupEL);
    this.cartOpen = !this.cartOpen;
  };
  CartView.prototype.destroy = function() {
    document.querySelector('body').removeChild(this.popupWrapEL);
    this.popupWrapEL.innerHTML = "";
    this.cartOpen = !this.cartOpen;
  };

  window.modules.add('products', ProductsModel);
  window.modules.add('cart', CartModel);
  window.modules.add('cartView', CartView);

})();

window.app.prototype.init = function() {
  var clickHandlerWraper  = document.querySelector("body");
  clickHandlerWraper.addEventListener('click', this.clickHandler.bind(this), false);
  this.cart.subscribe(this.cartView.renderCartInHeader);
  this.renderPopup = this.cartView.renderPopup.bind(this.cartView);  
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
    'viewProduct': function() {
      var url = window.location.href.replace(/[^\/]+$/, 'product.html?id='+idItem);
      window.open(url, "_self");
    },
    'open-cart-popup': function() {
      self.cart.subscribe(self.renderPopup);
      self.cartView.renderPopup(self.cart);
    },
    'close-popup': function() {
      self.cart.unsubscribe(self.renderPopup);
      self.cartView.destroy();
    },
    'remove-product': function() {
      self.cart.delete( event.target.getAttribute('data-id') );
    },
    'filtered': function() {
      var el = document.querySelectorAll('.filters input'),
          length = el.length,
          i;

      for(i = 0; i < length; i++) {
          self.filter.decorate(el[i].getAttribute('name'), el[i].value);
      }
      self.productsView.render( self.filter.get() );
    },
    'filtered-clear': function() {
      self.productsView.render( self.filter.default() );
      document.getElementById("sort").value = 'default';
    },
    'search': function() {
      var el = document.getElementsByClassName('input-search');
      self.filter.decorate(el[0].getAttribute('name'), el[0].value);
      self.productsView.render( self.filter.get() );
    }
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
window.app.prototype.changeEvent = function() {
  var sorted = this.sort(this.filter.filtered, event.target.value);
  this.productsView.render(sorted);
};