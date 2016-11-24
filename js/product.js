(function(){
  var ProductView = function() {
    this.template = '<div class="product-img-wrap"><img src="./img/%(image)"/></div>' +
      '<div class="product-name" data-event="viewProduct">%(name)</div>' +
      '<button class="minus" data-event="minus">-</button>' +
      '<input type="number" class="itemCount" min="1" value="1" disabled>' +
      '<button class="plus" data-event="plus">+</button>' +
      '<div class="product-price">%(price)</div>' +
      '<button class="add-to-cart" data-event="add-to-cart">add to cart</button>';
  };
  ProductView.prototype.renderProduct = function(item) {

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
  ProductView.prototype.render = function(item) {
    var fragProductList = document.createDocumentFragment(),
        objectProduct   = document.querySelector("#content");

    objectProduct.innerHTML = '';

    fragProductList.appendChild( this.renderProduct(item) );

    objectProduct.appendChild( fragProductList );
  };

  window.modules.add('productView', ProductView);
})();

window.app.prototype.init = function() {
  this.cart.subscribe(this.cartView.renderCartInHeader);
  this.renderPopup = this.cartView.renderPopup.bind(this.cartView);



  var search = window.location.search.substr(1),
  keys = {};

  search.split('&').forEach(function(item) {
    item = item.split('=');
    keys[item[0]] = item[1];
  });



  this.productView.render(this.products.objectProducts[ keys['id'] ]);

  var clickHandlerWraper  = document.querySelector("body");

  clickHandlerWraper.addEventListener('click', this.clickHandler.bind(this), false);
}; 