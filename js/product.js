(function(){
  var ProductView = function(items) {
    this.template = '<div class="product-img-wrap"><img src="./img/%(image)"/></div>' +
      '<div class="product-name" data-event="viewProduct">%(name)</div>' +
      '<button class="minus" data-event="minus">-</button>' +
      '<input type="number" class="itemCount" min="1" value="1" disabled>' +
      '<button class="plus" data-event="plus">+</button>' +
      '<div class="product-price">%(price)</div>' +
      '<button class="add-to-cart" data-event="add-to-cart">add to cart</button>';

    this.renderProduct(items);
  };
  ProductView.prototype.getId = function() {
    var search = window.location.search.substr(1),
    keys = {};

    search.split('&').forEach(function(item) {
      item = item.split('=');
      keys[item[0]] = item[1];
    });
    
    return keys.id;
  };

  ProductView.prototype.renderProduct = function(items) {
    var wrappProduct = document.querySelector("#content"),
        itemElement = document.createElement('div'),
        item = items[this.getId()],
        productBlock;

    productBlock = this.template.replace(/%\((.+?)\)/g, function(expr, paramName) {
      if(paramName in item) {
        return item[paramName];
      }
      return expr;
    });

    itemElement.setAttribute('data-id', item['id']);
    itemElement.classList.add('product-item');
    itemElement.innerHTML = productBlock;
    wrappProduct.appendChild(itemElement);

  };

  window.modules.add('productView', ProductView);
})();