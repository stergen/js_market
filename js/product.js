var tmpString       = '',
    shopCartCount   = document.querySelector(".cart-count"),
    shopCartPrice   = document.querySelector(".cart-price"),
    itemsInCart     = new Array();

var productOperation = function(event) {
    var inputCount = event.target.parentNode.querySelector(".itemCount");
    if ( event.target.classList.contains('plus') ) {
        inputCount.value = parsceInt(inputCount.value) + 1;
    }
    if ( event.target.className == 'minus' && inputCount.value != 1) {
        inputCount.value = +inputCount.value - 1;
    }
    if ( event.target.className == 'add-to-cart' ) {
        addToCart(event);
    }
};
function addToCart (event) {
    var _       = event.path[1],
        sum     = 0,
        count   = 0;
    itemsInCart.push(   [_.getAttribute('data-id'),             //id product
                        +_.querySelector(".itemCount").value,  //count items
                        +_.querySelector(".product-price").innerText] );
    console.log(itemsInCart);
    for (var i = 0, l = itemsInCart.length; i < l; i++) {
        sum += itemsInCart[i][1] * itemsInCart[i][2];
        count += itemsInCart[i][1];
    }
    shopCartCount.innerText = count;
    shopCartPrice.innerText = sum;
}

function getProduct (obj) {
    var context = {
        name: 20,
    };
    var kkk = 'asdas %(name)s asd as d'.replace(/%\((.+?)\)s/g, function(expr, paramName) {
        return context[paramName];
    });

    console.log(kkk);
    var productNode = document.createElement('div');
    productNode.innerHTML = '<div class="product-item" data-id="'+ obj.id +'">' +
        '<div class="product-img-wrap"></div>'+
        '<div class="product-name">'+ obj.name +'</div>'+
        '<div class="product-price">'+ obj.price +'</div><hr>' +
        '<button class="plus">+</button><input type="number" class="itemCount" min="1" value="2"><button class="minus">-</button>' +
        '<hr><button class="add-to-cart">add to cart</button></div>';
    return productNode;
}
function renderProductList(products) {
    var fragProductList = document.createDocumentFragment();
    var productList = document.querySelector(".product-list");

    products.forEach(function(item){
        fragProductList.appendChild( getProduct( item ) );
    });
    productList.appendChild( fragProductList );
    productList.addEventListener('click', productOperation, false);
}

renderProductList(window.products);
