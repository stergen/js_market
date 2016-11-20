'use strict';

(function(){
  var ProductsModel = function(dataBase) {
    this.objectProducts = {};
    this.arrayProducts = [];
    this.init(dataBase)
  };
  ProductsModel.prototype.init = function(product) {
    /*
    * convert to obj where id it`s key
    * it`s need for fast get element
    * */
    this.objectProducts = product.reduce(function(db, currentItem) {
      db[currentItem.id] = currentItem;
      return db;
    }, {});
    /*
    * convert to array because we need
    * sorting and search products
    * */
    for (var itemName in this.objectProducts) {
      this.arrayProducts.push(this.objectProducts[itemName]);
    }
  };
  window.app.prototype.products = new ProductsModel( window.products );
})();