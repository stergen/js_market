'use strict';

(function(){

  var ProductsView = function() {
    this.template = '<div class="product-img-wrap"><img src="./img/%(image)"/></div>' +
      '<div class="product-name" data-event="viewProduct">%(name)</div>' +
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

    for (var count = items.length - 1; count >= 0; count--) {
      fragProductList.appendChild( this.renderProduct(items[count]) );
    }

    objectProducts.appendChild( fragProductList );
  };

  // // ================ CART ================
  // var CartModel = function(dataBase) {
  //   this.DB = dataBase;
  //   this.items = {};
  //   this.subscribers = [];
  // };
  // CartModel.prototype.add = function(id, count) {
  //   if( !this.items[ id ] ) {
  //     this.items[ id ] = 0;
  //   }
  //   this.items[ id ] += count;
  //   this.publish(this);
  // };
  // CartModel.prototype.delete = function(id, count) {
  //   delete this.items[id];
  //   this.publish(this);
  // };
  // CartModel.prototype.getTotalSum = function() {
  //   var sum = 0;
  //   for (var id in this.items) {
  //     sum += this.DB[id].price * this.items[id];
  //   }

  //   return sum;
  // };
  // CartModel.prototype.getTotalCount = function() {
  //   var count = 0;
  //   for (var id in this.items) {
  //     count += this.items[id];
  //   }
  //   return count;
  // };
  // // --- Observer ---
  // CartModel.prototype.subscribe = function(fn) {

  //   this.subscribers.push(fn);
  // };
  // CartModel.prototype.unsubscribe = function(fn) {
  //   var i = 0,
  //     len = this.subscribers.length;

  //   for (; i < len; i++) {
  //     if (this.subscribers[i] === fn) {
  //       this.subscribers.splice(i, 1);
  //       return;
  //     }
  //   }
  // };
  // CartModel.prototype.publish = function(data) {
  //   var i = 0,
  //     len = this.subscribers.length;

  //   for (; i < len; i++) {
  //     this.subscribers[i](data);
  //   }
  // };

  // var CartView = function() {
  //   this.popupWrapEL = document.createElement('div');
  //   this.popupWrapEL.classList.add('popup-wrap');
  //   this.cartOpen = false;

  //   this.template = '<div class="header-popup">Cart' +
  //     '<div class="close-popup" data-event="close-popup"></div></div>' +
  //     '<div class="body-popup">%(content)</div>' +
  //     '<div class="footer-popup">%(footer)</div>';

  //   this.item = '<div class="item-name">%(name)</div>'+
  //     '<div class="item-price">%(price)</div>'+
  //     '<div class="item-count">%(count)</div>'+
  //     '<div class="item-total-price">%(total)</div>'+
  //     '<div class="item-delate"><span class="del" data-id="%(id)" data-event="remove-product">x</span></div>';
  // };
  // CartView.prototype.renderCartInHeader = function(data) {
  //   var countEl = document.querySelector(".cart-count"),
  //     count = data.getTotalCount(),
  //     sum = data.getTotalSum();

  //   countEl.innerText = count;
  // };
  // CartView.prototype.renderPopupContent = function(CartModel) {
  //   var productBlock,
  //       template = '',
  //       content = '',
  //       footer = '',
  //       item = '';

  //   for(item in CartModel.items) {
  //     productBlock = this.item.replace(/%\((.+?)\)/g, function(expr, paramName) {
  //       if(paramName in CartModel.DB[item]) {
  //         return CartModel.DB[item][paramName];
  //       }
  //       if(paramName === "count") {
  //         return CartModel.items[item];
  //       }
  //       if(paramName === "total") {
  //         return CartModel.items[item] * CartModel.DB[item]["price"];
  //       }
  //       return expr;
  //     });
  //     content += '<div class="item-popup">' + productBlock + '</div>';
  //   }

  //   if (content === '') {
  //     content = '<center>Cart is empty</center>';
  //   }

  //   footer =  'Total Count: ' + CartModel.getTotalCount() + '  ' +
  //             'Total Sum: ' + CartModel.getTotalSum(); 

  //   template = this.template.replace("%(content)", content);
  //   template = template.replace("%(footer)", footer);

  //   return template;
  // };

  // CartView.prototype.renderPopup = function(CartModel) {
  //   var content = this.renderPopupContent(CartModel),
  //       popupEL = document.createElement('div');
  //       popupEL.classList.add('popup');

  //   if ( this.cartOpen ) {
  //     document.getElementsByClassName('popup')[0].innerHTML = content;
  //     return;
  //   }

  //   popupEL.innerHTML = content;
  //   document.querySelector('body').appendChild(this.popupWrapEL);
  //   this.popupWrapEL.appendChild(popupEL);
  //   this.cartOpen = !this.cartOpen;
  // };

  // CartView.prototype.destroy = function() {
  //   document.querySelector('body').removeChild(this.popupWrapEL);
  //   this.popupWrapEL.innerHTML = "";
  //   this.cartOpen = !this.cartOpen;
  // };

  // ================ SORT ================
  // TODO: new create constructor?
  var sort = function(items, type) {
    var sortFunction,
        sortable = items;

    switch (type) {
      case 'priceHighestFirst':
        sortFunction = function(a, b) { return a['price'] - b['price']; };
        break;
      case 'priceLowestFirst':
        sortFunction = function(a, b) { return b['price'] - a['price']; };
        break;
      default:
        sortFunction = function () { return 0 };
    }

    sortable.sort(function(a, b) {
      return sortFunction(a, b);
    });
    return sortable;
  };

  var Filter = function(array) {
    this.baseArray = array;
    this.filtered = array;
    this.decoratorsList = [];
  };
  Filter.prototype.decorate = function(decorator, value) {
    if ( value === "" || value === undefined ) return;
    this.decoratorsList.push([decorator, value]);
  };
  Filter.prototype.get = function() {
    // save filtered chang for sorter 
    this.filtered = this.baseArray.filter(function(item) {
      return this.decoratorsList.every(function(decorator) {
        return Filter.decorators[decorator[0]](item, decorator[1]);
      });
    }, this);
    // clear decorators for new event
    this.decoratorsList = [];
    return this.filtered;
  };
  Filter.prototype.default = function() {
    this.filtered = this.baseArray;
    this.decoratorsList = [];
    return this.filtered;
  };
  Filter.decorators = {};
  Filter.decorators.maxPrice = function(obj, value) {
    return obj.price <= value;
  };
  Filter.decorators.minPrice = function(obj, value){
    return obj.price >= value;
  };  
  Filter.decorators.search = function(obj, value) {
    var lowerName = obj.name.toLowerCase(), 
        seek = value.toLowerCase();
    
    if (lowerName.indexOf(seek) > -1) { 
      return true; 
    } else { 
      return false; 
    }
  }; 

  var self = window.app.prototype;
  // self.cart = new CartModel(self.products.objectProducts);
  // self.cartView = new CartView();
  self.productsView = new ProductsView(self.products.objectProducts);
  self.filter = new Filter(self.products.arrayProducts);

  self.sort = sort;

  // self.cart.subscribe(self.cartView.renderCartInHeader);
  // self.renderPopup = self.cartView.renderPopup.bind(self.cartView);
})();



// ================ APP ================
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
}

var application = new window.app();
