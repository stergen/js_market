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


  var ProductSlider = function() {
    this.slider = document.getElementById('slider');
    this.leftArrow = document.getElementsByClassName('product-images-btn--left');
    this.rightArrow = document.getElementsByClassName('product-images-btn--right');
    // this.items = document.getElementsByClassName('product-image');

    this.init();
  };
  ProductSlider.prototype.init = function() {
    var items = document.getElementsByClassName('product-image'),
        length = items.length;
    for (var i = 0; i < length; i++) {
      if (items[i].classList.contains('active') && i > 0) {
          items[i].classList.remove('active');
      }
      items[i].setAttribute('slider-item', i);
    }    

    var clickHandlerWraper  = document.querySelector(".product-images-btn");
    clickHandlerWraper.addEventListener('click', this.navigate, false);

  }
  ProductSlider.prototype.navigate = function() {
    var items = document.getElementsByClassName('product-image'),
        current = document.querySelector('.product-image.active'),
        index = parseInt( current.getAttribute('slider-item') );

    items[index].classList.remove('active');
    
    if (event.target.classList.contains('product-images-btn--left')) {
      if (index === 0) {
        items[items.length - 1].classList.add('active');
      } else {
        items[index-1].classList.add('active');
      }
    }

    if (event.target.classList.contains('product-images-btn--right')) {
      if (index >= items.length - 1) {
        items[0].classList.add('active');
      } else {
        items[index+1].classList.add('active');
      }
    }


  }

  window.modules.add('productSlider', ProductSlider);

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