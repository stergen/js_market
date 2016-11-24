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

  window.modules.add('productsView', ProductsView);
  window.modules.add('filter', Filter);
  window.modules.add('sort', sort);  
})();

window.app.prototype.changeEvent = function() {
  var sorted = this.sort(this.filter.filtered, event.target.value);
  this.productsView.render(sorted);
};

window.app.prototype.init = function() {
  this.cart.subscribe(this.cartView.renderCartInHeader);
  this.renderPopup = this.cartView.renderPopup.bind(this.cartView);
  this.productsView.render(this.products.arrayProducts);

  var clickHandlerWraper  = document.querySelector("body"),
      changSortSelect     = document.getElementById("sort");

  changSortSelect.addEventListener('change', this.changeEvent.bind(this), false);
  clickHandlerWraper.addEventListener('click', this.clickHandler.bind(this), false);
}; 