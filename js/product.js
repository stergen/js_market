var tmpString       = '',
    shopCartCount   = document.querySelector(".cart-count"),
    shopCartPrice   = document.querySelector(".cart-price"),
    itemsInCart     = new Array();

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
        addToCart(event);
    }
};

function addToCart (event) {
    var _       = event.target.parentNode,
        sum     = 0,
        count   = 0;
    itemsInCart.push(   [parseInt( _.getAttribute('data-id') ),             //id product
                         parseInt( _.querySelector(".itemCount").value ),  //count items
                         parseInt( _.querySelector(".product-price").innerText ) ]);

    for (var i = 0, l = itemsInCart.length; i < l; i++) {
        sum += itemsInCart[i][1] * itemsInCart[i][2];
        count += itemsInCart[i][1];
    }
    shopCartCount.innerText = count;
    shopCartPrice.innerText = sum;
}

function getProduct (obj) {
    var productBlock =  '<div class="product-item" data-id="%(id)">' +
                        '<div class="product-img-wrap"></div>' +
                        '<div class="product-name">%(name)</div>' +
                        '<div class="product-price">%(price)</div><hr>' +
                        '<button class="plus">+</button>' +
                        '<input type="number" class="itemCount" min="1" value="1">' +
                        '<button class="minus">-</button><hr>' +
                        '<button class="add-to-cart">add to cart</button></div>';

    var productNode = document.createElement('div');

    while (productBlock.match(/%\((.+?)\)/) != null) {
        productBlock = productBlock.replace(/%\((.+?)\)/, function(expr, paramName) {
            if (obj[paramName.toString()] == undefined) {
                return '';
            }
            return obj[paramName.toString()];
        });
    }
    productNode.innerHTML = productBlock;

    return productNode;
}

function renderProductList(products) {
    var fragProductList = document.createDocumentFragment(),
        productList = document.querySelector(".product-list");

    for ( var item in products ) {
        fragProductList.appendChild( getProduct( products[item] ) );
    }

    productList.appendChild( fragProductList );
    productList.addEventListener( 'click', productOperation, false );
}

function initApp() {
    var DB = new Object();
    window.products.forEach(function( item ) {
       DB[ item.id ] = new Object({
           id: item.id,
           name: item.name,
           price: item.price,
           characteristic: item.characteristic
       });
    });

    renderProductList(DB);
}

initApp();
