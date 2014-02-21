(function() {
	Class.prototype.on = function(event, fun, ctx){
		this._events = this._events || {};
		this._events[event] = this._events[event] || [];
		this._events[event].push(fun);
		return this;
	};
	Class.prototype.off = function(event, fun) {
		this._events = this._events || {};
		if( event in this._events === false) return;
		this._events[event].splice(this._events[event].indexOf(fun), 1);
		return this;
	};
	Class.prototype.fire = function(event /* ,args */) {
		this._events = this._events || {};
		if (event in this._events === false) return;
		for (var i = 0; i < this._events[event].length; i++){
		this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		return this;
	};
})();
