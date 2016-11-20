'use strict';

window.app = function(products, modules) {
  // this.products = new ProductsModel( products );
  this.modules = [
    ["cart", function(){
      this;
      debugger;
    }]
  ];
  this.modules[0][1]();
  //   window.app.prototype.cart = new CartModel( window.app.prototype.products.objectProducts );
  // window.app.prototype.cartView = new CartView();
  // window.app.prototype.cart.subscribe(window.app.prototype.cartView.renderCartInHeader);
  // window.app.prototype.renderPopup = window.app.prototype.cartView.renderPopup.bind(window.app.prototype.cartView);
};
window.app.prototype.init = function() {
  this.productsView.render(this.products.arrayProducts);
  var clickHandlerWraper  = document.querySelector("body"),
      changSortSelect     = document.getElementById("sort");

  clickHandlerWraper.addEventListener('click', this.clickHandler.bind(this), false);
  changSortSelect.addEventListener('change', this.changeEvent.bind(this), false);
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
})();

window.app(window.products);