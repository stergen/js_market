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
    this.template = '<div class="product-img-wrap"></div>' +
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
    this.publish(this);
};
CartModal.prototype.delete = function(id, count) {
    delete this.items[id];
    this.publish(this);
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
    this.popupWrapEL = document.createElement('div');
    this.popupWrapEL.classList.add('popup-wrap');
    this.cartOpen = false;

    this.template = '<div class="header-popup">Cart' +
        '<div class="close-popup"></div></div>' +
        '<div class="body-popup">%(content)</div>' +
        '<div class="footer-popup"></div>';

    this.item = '<div class="item-name">%(name)</div>'+
                '<div class="item-price">%(price)</div>'+
                '<div class="item-count">%(count)</div>'+
                '<div class="item-total-price">%(total)</div>'+
                '<div class="item-delate"><span class="del" data-id="%(id)">x</span></div>';
};
CartView.prototype.renderCartInHeader = function(data) {
    var countEl = document.querySelector(".cart-count"),
        totalPrice = document.querySelector(".cart-price"),
        count = data.getTotalCount(),
        sum = data.getTotalSum();

    countEl.innerText = count;
    totalPrice.innerText = sum;
};
CartView.prototype.renderPopupWrap = function(content) {
    var popupEL = document.createElement('div');
    popupEL.classList.add('popup');
    popupEL.innerHTML = this.template.replace("%(content)", content);
    this.popupWrapEL.appendChild(popupEL);
    
    document.querySelector('body').appendChild(this.popupWrapEL);
};
CartView.prototype.renderPopupContent = function(data) {
    var content = '',
        item = '';

    for(item in data.items) {
        productBlock = this.item.replace(/%\((.+?)\)/g, function(expr, paramName) {
            if(paramName in data.DB[item]) {
                return data.DB[item][paramName];
            }
            if(paramName === "count") {
                return data.items[item];
            }
            if(paramName === "total") {
                return data.items[item] * data.DB[item]["price"];
            }
            return expr;
        });
        content += '<div class="item-popup">' + productBlock + '</div>';
    }

    if (content === '') {
        return '<center>Cart is empty</center>';
    }

    return content;
};
CartView.prototype.renderPopup = function(data) {
    var content;
    content = this.renderPopupContent(data);
    
    if (!this.cartOpen) {
        this.renderPopupWrap(content);
        this.cartOpen = !this.cartOpen;
        return;
    }
    document.querySelector('.body-popup').innerHTML = content;
};
CartView.prototype.destroy = function() {
    document.querySelector('body').removeChild(this.popupWrapEL);
    this.popupWrapEL.innerHTML = "";
    this.cartOpen = !this.cartOpen;
};


// ================ APP ================ 
function App() {
    this.DB = ProductsModal.get();
    this.cart = new CartModal(this.DB);
    this.cartView = new CartView();
    this.products = new ProductsView(this.DB);
    this.cart.subscribe(this.cartView.renderCartInHeader);
    this.renderPopup = this.cartView.renderPopup.bind(this.cartView);
    this.init();
};
App.prototype.init = function() {   
    this.products.render();
    var productsWrapEl = document.querySelector("body");
    productsWrapEl.addEventListener('click', this.route.bind(this), false);
};
App.prototype.route = function(event) {
    if (event.target.parentNode.classList.contains('product-item')) {

        var countItemEl = event.target.parentNode.querySelector(".itemCount"),
            countItem = event.target.parentNode.querySelector(".itemCount").value,
            idItem  = event.target.parentNode.getAttribute('data-id');
    }

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
    }
    if ( hasClass('header-shop-cart') ) {    
        this.cart.subscribe(this.renderPopup);  
        this.cartView.renderPopup(this.cart);
    }
    if ( hasClass('close-popup') ) {
        this.cart.unsubscribe(this.renderPopup);
        this.cartView.destroy();
    }
    if ( hasClass('del') ) {
        this.cart.delete(event.target.getAttribute('data-id'));
    }
};

var app = new App();