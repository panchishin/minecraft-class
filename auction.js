

var store = { 
	basePrice : 10.0,
	minUniqueItemsForCalculation : 10,
	inventory : { },

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

	buy : function( item  ) {
		this.verify(item)
		var tradePrice = this.inventory[item].price
		this.inventory[item].count++
		if ( tradePrice >= 1 ) {
			this.changeAllPricesExcept(item,1.0)
		}
		this.inventory[item].price = Math.max( tradePrice - 1 , 0 )
		return tradePrice
	},

	sell : function( item , price ) {
		this.verify(item)
		if ( this.inventory[item].count <= 0 || price < this.inventory[item].price + 2 ) { return false }
		this.inventory[item].count-- 
		this.changeAllPricesExcept(item,-1.0)
		this.inventory[item].price++
		return true
	},

	list : function( search ) {
		var list = Object.keys(this.inventory).sort()
		var result = []
		for ( var index in list ) {
			if ( list[index].match(search) ) {
				result.push( { name : list[index] , data : this.inventory[list[index]] } )
			}
		}
		result.push( { name : "Anything else" , data : { price : this.basePrice , count : 0 } } )
		return result

	},

	trade : function( itemBuying , itemSelling ) {
		this.verify(itemBuying)
		this.verify(itemSelling)
		var remainder = this.inventory[itemBuying].price
		this.buy( itemBuying )
		var count = 0
		while ( this.inventory[itemSelling].count > 0 && remainder >= this.inventory[itemSelling].price + 2 ) {
			count++
		        remainder -= this.inventory[itemSelling].price + 2
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
buyvalue == 10.1 || process.stderr.write("Failure, expecting " + buyvalue + "\n")
store.sell("grass",12)
store.basePrice == 10.1 || process.stderr.write("The base price should be 10.1 but is " + store.basePrice + "\n")
store.inventory["stick"].count == 1 || process.stderr.write("incorrect stick inventory 1 != " +store.inventory["stick"].count + "\n")
store.inventory["stick"].price == 9 || process.stderr.write("incorrect stick price 9 != " +store.inventory["stick"].price + "\n")
store.sell("stick",11.0) || process.stderr.write("should be able to sell a stick for 11\n")
!store.sell("stick",11.0) || process.stderr.write("should be able to sell a second stick for 11\n")
!store.sell("stick",10) || process.stderr.write("should not be able to sell a stick for 10\n")

var dirtvalue = store.buy("dirt")
dirtvalue == 10 || process.stderr.write("bad price for dirt, expecting 10 and was " + dirtvalue + "\n")
store.inventory["stick"].price == 10.1 || process.stderr.write("incorrect stick price 10.1 != " +store.inventory["stick"].price + "\n")

store.inventory["diamond"] = { price : 100 }
store.inventory["stick"].count = 10
var traderesult = store.trade("diamond","stick")
traderesult.trades == 6.0 || process.stderr.write("Incorrect number of trades, 6 != " + JSON.stringify(traderesult) + "\n")
Math.round(10*traderesult.coin) == 118 || process.stderr.write("Incorrect amount of remainder coin, 11.8 != " + JSON.stringify(traderesult) + "\n")

store.inventory["dirt"] = { price : 0 , count : 100 }
var traderesult = store.trade("diamond","dirt")
traderesult.trades == 12 || process.stderr.write("Incorrect number of trades\n")
Math.round(10*traderesult.coin) == 72 || process.stderr.write("Incorrect amount of remainder \n")



store.inventory = {}
store.basePrice = 10
module.exports = store


