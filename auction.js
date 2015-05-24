

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
		this.changeAllPricesExcept( item , -1.0 * amount )
		this.inventory[item].price += amount 
		return true
	},

	list : function( search ) {
		var list = Object.keys(this.inventory).sort()
		var result = []
		for ( var index in list ) {
			if ( list[index].match(search) ) {
				if ( this.inventory[list[index]].count > 0 ) {
					result.push( list[index] + " ... buy " + this.buyPrice(list[index]) + " , sell " + this.sellPrice(list[index]) )
				} else {
					delete this.inventory[list[index]]
				}
			}
		}
		if ( search == "" ) { result.push( "Anything else i'll buy at " + Math.floor(this.basePrice) ) }
		return result

	},

	trade : function( itemBuying , itemSelling ) {
		this.verify(itemBuying)
		this.verify(itemSelling)
		var remainder = this.inventory[itemBuying].price
		this.buy( itemBuying )
		var count = 0
		while ( this.inventory[itemSelling].count > 0 && remainder >= this.inventory[itemSelling].price + 2 * this.calculatePriceChange(this.inventory[itemSelling].price) ) {
			count++
		        remainder -= this.inventory[itemSelling].price + 2 * this.calculatePriceChange(this.inventory[itemSelling].price)
			this.sell( itemSelling )
		}
		return { trades : count , coin : remainder }
	}

}

store.basePrice = 10

store.basePrice == 10.0 || process.stderr.write("The base price should be 10.0\n")
!store.sell("stick",10.0) || process.stderr.write("Should not be able to sell a stick\n")
store.inventory["stick"].count == 0 || process.stderr.write("incorrect stick inventory of 0\n")
store.buy("stick") == 10.0 || process.stderr.write("Failure\n")
var buyvalue = store.buy("grass")
Math.round(10 * buyvalue) == 100 || process.stderr.write("Failure, expecting " + buyvalue + "\n")
store.sell("grass",12)
Math.round(100 * store.basePrice) == 1010 || process.stderr.write("The base price should be 10.1 but is " + store.basePrice + "\n")
store.inventory["stick"].count == 1 || process.stderr.write("incorrect stick inventory 1 != " +store.inventory["stick"].count + "\n")
Math.round(100 * store.inventory["stick"].price) == 900 || process.stderr.write("incorrect stick price 9 != " +store.inventory["stick"].price + "\n")
store.sell("stick",11.01) || process.stderr.write("should be able to sell a stick for 11.01 but was " + store.inventory["stick"].price + "\n")
!store.sell("stick",11.0) || process.stderr.write("should not be able to sell a second stick for 11\n")
!store.sell("stick",10) || process.stderr.write("should not be able to sell a stick for 10\n")

var dirtvalue = store.buy("dirt")
Math.round( 100 * dirtvalue) == 1000 || process.stderr.write("bad price for dirt, expecting 10 and was " + dirtvalue + "\n")
Math.round( 100 * store.inventory["stick"].price) == 1010 || process.stderr.write("incorrect stick price 10.1 != " +store.inventory["stick"].price + "\n")

store.inventory["diamond"] = { price : 100 }
store.inventory["stick"].count = 10
var traderesult = store.trade("diamond","stick")
traderesult.trades == 5.0 || process.stderr.write("Incorrect number of trades, 5 != " + JSON.stringify(traderesult) + "\n")
Math.round(10*traderesult.coin) == 187 || process.stderr.write("Incorrect amount of remainder coin, 18.7 != " + JSON.stringify(traderesult) + "\n")

store.inventory["dirt"] = { price : 0 , count : 100 }
var traderesult = store.trade("diamond","dirt")
traderesult.trades == 11 || process.stderr.write("Incorrect number of trades, "+ traderesult.trades +"\n")
Math.round(10*traderesult.coin) == 24 || process.stderr.write("Incorrect amount of remainder " + traderesult.coin + "\n")


store.inventory = {}
store.basePrice = 100.0
module.exports = store


