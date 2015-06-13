

var store = { 
	basePrice : 100.0,
	minUniqueItemsForCalculation : 10,
	inventory : { },
	changeFactor : .1,
	minChange : 1,

	numberOfUniqueItems : function () {
		var count = 0;
		var keys = Object.keys(this.inventory)
		for ( var index in keys ) {
			if ( this.inventory[keys[index]].count > 0 ) { count++ }
                        if ( this.inventory[keys[index]].count == 0 ) { this.inventory[keys[index]].price = this.basePrice }
		}
		return Math.max( this.minUniqueItemsForCalculation , count )
	},

	changeAllPricesExcept : function( item , amount ) {
		amount = amount / this.numberOfUniqueItems()
		this.basePrice += amount
		var keys = Object.keys(this.inventory)
		for ( var index in keys ) {
			var key = keys[index]
			if ( key != item ) {
				this.inventory[key].price = Math.max( this.inventory[key].price + amount , 0 )
				this.basePrice = Math.max( this.basePrice , this.inventory[key].price )
			}
		}
	},

	verify : function( item ) {
		if ( ! this.inventory[item] ) { this.inventory[item] = { count : 0 , price : this.basePrice } }
	},

	calculatePriceChange : function( price ) {
		return Math.max( price * this.changeFactor , this.minChange )
	},

	buyPrice : function( item ) {
		this.verify(item)
		return Math.floor( this.inventory[item].price )
	},

	buy : function( item  ) {
		var tradePrice = this.buyPrice(item)
		var amount = this.calculatePriceChange( tradePrice )
		this.inventory[item].count++
		this.inventory[item].exists = true
		if ( tradePrice >= amount ) {
			this.changeAllPricesExcept(item,amount)
		}
		this.inventory[item].price = Math.max( tradePrice - amount , 0 )
		return tradePrice
	},
	
	sellPrice : function( item ) {
		this.verify(item)
		var amount = this.calculatePriceChange( this.inventory[item].price )
		return Math.floor( this.inventory[item].price + 2 * amount )
	},

	sell : function( item , price ) {
		var sellprice = this.sellPrice(item)
		price = price ? price : sellprice
		this.verify(item)
		var amount = this.calculatePriceChange( this.inventory[item].price )
		if ( this.inventory[item].count <= 0 || price < sellprice  ) { return false }
		this.inventory[item].count-- 
		this.inventory[item].exists = true
		this.changeAllPricesExcept( item , -1.0 * amount )
		this.inventory[item].price += amount 
		return true
	},
	formatPrice : function( price ) {
		price = price + ""
		while ( price.length < 4 ) { price = "_" + price }
		return price
	},

	list : function( search ) {

		var list = Object.keys(this.inventory).sort()
		var result = []
		for ( var index in list ) {
			if ( list[index].match(search) ) {
				if ( this.inventory[list[index]].count > 0 ) {
					result.push( "buy " + this.formatPrice(this.buyPrice(list[index])) + " , sell " + this.formatPrice(this.sellPrice(list[index])) + " _____ " + list[index] )
				} else if ( this.inventory[list[index]].exists ) {
					result.push( "buy " + this.formatPrice(this.buyPrice(list[index])) + " , out of stock \\ \\ _ " + list[index] )
				}
			}
		}
		if ( search == "" ) { result.push( "Anything else i'll buy at " + Math.floor(this.basePrice) ) }
		return result

	}

}


store.inventory = {}
store.basePrice = 100.0
module.exports = store


