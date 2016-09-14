// ================ PRODUCTS ================ 
var ProductsModal = (function() {
    var instance;

    function setInstance() {
        return  window.products.reduce(function(db, currentItem) {
            db[currentItem.id] = currentItem;
            return db;
        }, {});
    };

    return {
        get: function() {
            if (!instance) {
                instance = setInstance();
            }
            return instance;
        }
    };
})();


function ProductsView (dataBase) {
    this.DB = dataBase;
    this.template =     '<div class="product-img-wrap"></div>' +
                        '<div class="product-name">%(name)</div>' +
                        '<div class="product-price">%(price)</div><hr>' +
                        '<button class="plus">+</button>' +
                        '<input type="number" class="itemCount" min="1" value="1">' +
                        '<button class="minus">-</button><hr>' +
                        '<button class="add-to-cart">add to cart</button>';
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
ProductsView.prototype.render = function() {
    var fragProductList = document.createDocumentFragment(),
        productList = document.querySelector(".product-list");

    for(var item in this.DB) {
        fragProductList.appendChild( this.renderProduct(this.DB[item]) )
    }

    productList.appendChild( fragProductList );
};


// ================ CART ================ 
function CartModal (dataBase) {
    this.DB = dataBase;
    this.items = {};
    this.subscribers = [];
}
CartModal.prototype.add = function(id, count) {
    if( !this.items[ id ] ) {
        this.items[ id ] = 0;
    }
    this.items[ id ] += count;
};
CartModal.prototype.delete = function(id, count) {
};
CartModal.prototype.getTotalSum = function() {
    var sum = 0;
    for (id in this.items) {
        sum += this.DB[id].price * this.items[id];
    }

    return sum;
};
CartModal.prototype.getTotalCount = function() {
    var count = 0;
    for (id in this.items) {
        count += this.items[id];
    }
    return count;
};
//-------
CartModal.prototype.subscribe = function(fn) {

    this.subscribers.push(fn);
};
CartModal.prototype.unsubscribe = function(fn) {
    var i = 0,
        len = this.subscribers.length;
   
    for (; i < len; i++) {
        if (this.subscribers[i] === fn) {
            this.subscribers.splice(i, 1);
            return;
        }
    }
};
CartModal.prototype.publish = function(data) {
    var i = 0,
        len = this.subscribers.length;
   
    for (; i < len; i++) {
        this.subscribers[i](data);
    }        
};




function CartView() {
    //constructor
};
CartView.prototype.renderCartInHeader = function(count, sum) {
    var countEl = document.querySelector(".cart-count"),
    totalPrice = document.querySelector(".cart-price");
    
    countEl.innerText = count;
    totalPrice.innerText = sum;
}
CartView.prototype.renderCartPopup = function(cartList) {
    var popupEl = document.createElement('div');
    popupEl.classList.add('popup');
}


// ================ APP ================ 
function App() {
    this.DB = ProductsModal.get();
    this.cart = new CartModal(this.DB);
    this.cartView = new CartView();
    this.products = new ProductsView(this.DB);
    debugger;
    this.cart.subscribe(this.cart.add);
    this.init();
};
App.prototype.init = function() {   
    this.products.render();
    var productsWrapEl = document.querySelector(".product-list");
    productsWrapEl.addEventListener('click', this.route.bind(this), false);
};
App.prototype.route = function(event) {

    var countItemEl = event.target.parentNode.querySelector(".itemCount"),
        countItem = event.target.parentNode.querySelector(".itemCount").value,
        idItem  = event.target.parentNode.getAttribute('data-id');

    // TODO: додать проверку на валідність
    countItem = parseInt( countItem );
    idItem = parseInt( idItem );

    hasClass = function(className) {
        return event.target.classList.contains(className);
    };

    if ( hasClass('plus') ) {
        countItemEl.value = countItem + 1;
        return;
    }
    if ( hasClass('minus') && countItem != 1) {
        countItemEl.value = countItem - 1;
        return;
    }
    if ( hasClass('add-to-cart') ) {
        this.cart.add(idItem, countItem);
        this.cart.publish(this.cartView.renderCartInHeader);
    }
};

var app = new App();
