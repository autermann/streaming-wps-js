(function(){
	window.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.floor(Math.random() * 16);
			return ((c == 'x') ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}
})();