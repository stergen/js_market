var tmpString       = '',
    shopCartCount   = document.querySelector(".cart-count"), //del
    shopCartPrice   = document.querySelector(".cart-price"), //del
    DB = new Object(),
    itemsInCart = new Object(); //del

//rename
var productOperation = function(event) {
    var inputCount = event.target.parentNode.querySelector(".itemCount"),
        hasClass = function(className) {
            return event.target.classList.contains(className);
        };

    if ( hasClass('plus') ) {
        inputCount.value = parseInt(inputCount.value) + 1;
        return;
    }
    if ( hasClass('minus') && inputCount.value != 1) {
        inputCount.value = parseInt(inputCount.value) - 1;
        return;
    }
    if ( hasClass('add-to-cart') ) {
        productCard(event.target);
    }
};

//function addToCart (event) {
//    var _           = event.target.parentNode,
//        idProduct   = _.getAttribute('data-id'),
//        sum         = 0,
//        count       = 0;
//
//    if( !itemsInCart[ idProduct ] ) {
//        itemsInCart[ idProduct ] = 0;
//    }
//
//    itemsInCart[ idProduct ] += parseInt( _.querySelector(".itemCount").value );
//
//    for (var itemId in itemsInCart) {
//        sum += itemsInCart[itemId] * DB[itemId].price;
//        count += itemsInCart[itemId];
//    }
//    shopCartCount.innerText = count;
//    shopCartPrice.innerText = sum;
//}

//дублюється, чи можна це змінити? (1)
function ViewProductList (dataBase) {
    this.DB = dataBase;
}

ViewProductList.prototype.renderProduct = function(objectProduct) {

    var productBlock =  '<div class="product-img-wrap"></div>' +
        '<div class="product-name">%(name)</div>' +
        '<div class="product-price">%(price)</div><hr>' +
        '<button class="plus">+</button>' +
        '<input type="number" class="itemCount" min="1" value="1">' +
        '<button class="minus">-</button><hr>' +
        '<button class="add-to-cart">add to cart</button>';

    while (productBlock.match(/%\((.+?)\)/) != null) {
        productBlock = productBlock.replace(/%\((.+?)\)/, function(expr, paramName) {

            if (objectProduct[paramName.toString()] == undefined) {
                return '';
            }
            return objectProduct[paramName.toString()];
        });
    }

    var productNode = document.createElement('div');
    productNode.classList.add('product-item');
    productNode.setAttribute('data-id', objectProduct['id']);

    productNode.innerHTML = productBlock;

    return productNode;
};

ViewProductList.prototype.render = function() {
    var fragProductList = document.createDocumentFragment(),
        productList = document.querySelector(".product-list");

    for(var item in this.DB) {
        fragProductList.appendChild( this.renderProduct(this.DB[item]) )
    }

    productList.appendChild( fragProductList );
    productList.addEventListener( 'click', productOperation, false );
};

//дублюється, чи можна це змінити? (2)
function Card (dataBase) {
    this.DB = dataBase;
    this.itemsInCart = new Object();
    this.summ = 0;
    this.count = 0;
}

Card.prototype.add = function(eventTarget) {
    var parentElement = eventTarget.parentNode,
        idProduct = parentElement.getAttribute('data-id');

    if( !this.itemsInCart[ idProduct ] ) {
        this.itemsInCart[ idProduct ] = 0;
    }

    this.itemsInCart[ idProduct ] += parseInt( parentElement.querySelector(".itemCount").value );

    for (var itemId in this.itemsInCart) {
        this.sum += itemsInCart[itemId] * this.DB[itemId].price;
        this.count += itemsInCart[itemId];
    }
};
Card.prototype.getSumm = function() {
  return this.summ;
};
Card.prototype.getCount = function() {
    return this.count;
};



function initApp() {
    window.products.forEach(function( item ) {
       DB[ item.id ] = {
           id: item.id,
           name: item.name,
           price: item.price,
           characteristic: item.characteristic
       };
    });
    var productList = new ViewProductList(DB),
        productCard = new Card(DB);
    productList.render();

    //renderProductList(DB);
}

initApp();

