function ViewProductList (dataBase) {
    this.DB = dataBase;
    this.template =    '<div class="product-img-wrap"></div>' +
                                '<div class="product-name">%(name)</div>' +
                                '<div class="product-price">%(price)</div><hr>' +
                                '<button class="plus">+</button>' +
                                '<input type="number" class="itemCount" min="1" value="1">' +
                                '<button class="minus">-</button><hr>' +
                                '<button class="add-to-cart">add to cart</button>';
};
ViewProductList.prototype.renderProduct = function(item) {

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
ViewProductList.prototype.render = function() {
    var fragProductList = document.createDocumentFragment(),
        productList = document.querySelector(".product-list");

    for(var item in this.DB) {
        fragProductList.appendChild( this.renderProduct(this.DB[item]) )
    }

    productList.appendChild( fragProductList );
};

// ================ CART ================ 
function Cart (dataBase) {
    this.DB = dataBase;
    this.items = {};
}
Cart.prototype.add = function(id, count) {
    if( !this.items[ id ] ) {
        this.items[ id ] = 0;
    }
    this.items[ id ] += count;
    cartView(this.getTotalCount(), this.getTotalSum());
};
Cart.prototype.delete = function(id, count) {
};
Cart.prototype.getTotalSum = function() {
    var sum = 0;
    for (id in this.items) {
        sum += this.DB[id].price * this.items[id];
    }

    return sum;
};
Cart.prototype.getTotalCount = function() {
    var count = 0;
    for (id in this.items) {
        count += this.items[id];
    }
    return count;
};


// ================ CART VIEW ================ 
function cartView(count, sum) {
    var countEl = document.querySelector(".cart-count"),
        totalPrice = document.querySelector(".cart-price");
    
    countEl.innerText = count;
    totalPrice.innerText = sum;
}

function cartViewPopup(cartDB) {
    var popupEl = document.createElement('div');
    popupEl.classList.add('popup');
    
}


function convertArrToObject(arr) {
    return  arr.reduce(function(db, currentItem) {
                db[currentItem.id] = currentItem;
                return db;
            }, {});
};

// ================ APP ================ 
function App() {
    this.DB = Object.freeze( convertArrToObject(window.products) );
    this.cart = new Cart(this.DB);
    this.products = new ViewProductList(this.DB);
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
    }
};

var app = new App();
app.init();