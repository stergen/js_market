(function(){
  var ProductView = function(items) {
    this.template = '<div class="slider" id="slider">'+
        '<div class="product-images">%(images)</div>'+
        '<div class="product-images-btn">' +
          '<div class="product-images-btn--left"></div>' +
          '<div class="product-images-btn--right"></div>' +
        '</div>' +
      '</div>' +
      '<div class="single-info">' +
        '<div class="single-product-name">%(name)</div>' +
        '<div class="characteristic">%(characteristic)</div>' +
        '<div class="single-product-buy">' +
          '<div class="char-row">' +
            '<div class="char-col">' +
              '<button class="minus" data-event="minus">-</button>' +
              '<input type="number" class="itemCount" min="1" value="1" disabled>' +
              '<button class="plus" data-event="plus">+</button>' +
            '</div>' +
            '<div class="char-col">' +
              '<button class="add-to-cart" data-event="add-to-cart">add to cart</button>' +
            '</div>' +
          '</div>' +  
        '</div>' +
      '</div>';

    this.render(items);
  };
  ProductView.prototype.renderProduct = function(item) {
    var getImages = function(array) {
      var noImage = '<img class="product-image" src="./img/no-img.png">';
      if(!Array.isArray(array)) {
        return noImage
      }

      var length = array.length,
          stringImages = '', i;
      if(length == 0) {
        return noImage;
      }
      for (i=0; i < length; i++) {
        stringImages += '<img class="product-image" src="./img/'+ array[i] +'">';
      }
      return stringImages;
    };
    var getCharacters = function(character) {
      if(!(character instanceof Object)) {
        console.log('Error: we can`t took characters');
      }
      var characterName,
          stringCharacters = '<div class="characteristic">';
      for(characterName in character) {
        stringCharacters += '<div class="char-row">';
        stringCharacters += '<div class="char-col">'+ characterName +'</div>';
        stringCharacters += '<div class="char-col">'+ character[characterName] +'</div>';
        stringCharacters += '</div>';
      }
      stringCharacters += '</div>';

      return stringCharacters;
    };

    var productBlock = this.template.replace(/%\((.+?)\)/g, function(expr, paramName) {
      if(paramName in item) {
        if (paramName == 'images') {
          return getImages(item[paramName]);
        }
        if (paramName == 'characteristic') {
          return getCharacters(item[paramName]);
        }

        return item[paramName];
      }
      return expr;
    });

    var itemElement = document.createElement('div');

    itemElement.setAttribute('data-id', item['id']);
    itemElement.setAttribute('type', 'product');
    itemElement.classList.add('single-product');
    itemElement.innerHTML = productBlock;

    return itemElement;
  };
  ProductView.prototype.render = function(items) {
    var fragProductList = document.createDocumentFragment(),
        objectProduct   = document.querySelector("#content");
    objectProduct.innerHTML = '';

    var search = window.location.search.substr(1),
        keys = {};
    search.split('&').forEach(function(item) {
      item = item.split('=');
      keys[item[0]] = item[1];
    });

    fragProductList.appendChild( this.renderProduct(items[keys.id]) );
    objectProduct.appendChild(fragProductList);
  };

  // ================ SLIDER ================
  var ProductSlider = function() {
    this.slider = document.getElementById('slider');
    this.leftArrow = document.getElementsByClassName('product-images-btn--left')[0];
    this.rightArrow = document.getElementsByClassName('product-images-btn--right')[0];

    this.init();
  };
  ProductSlider.prototype.init = function() {
    var items = document.getElementsByClassName('product-image'),
        length = items.length;

    items[0].classList.add('active');
    for (var i = 0; i < length; i++) {
      if (items[i].classList.contains('active') && i > 0) {
          items[i].classList.remove('active');
      }
      items[i].setAttribute('slider-item', i);
    }
    if(length <= 1) {
      this.leftArrow.classList.add('hidden');
      this.rightArrow.classList.add('hidden');
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
        items[items.length-1].classList.add('active');
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

  window.modules.add('productView', ProductView);
  window.modules.add('productSlider', ProductSlider);
})();

window.app.prototype.init = function() {
  this.cart.subscribe(this.cartView.renderCartInHeader);
  this.renderPopup = this.cartView.renderPopup.bind(this.cartView);

  var clickHandlerWraper  = document.querySelector("body");

  clickHandlerWraper.addEventListener('click', this.clickHandler.bind(this), false);
}; 
