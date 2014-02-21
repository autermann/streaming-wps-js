/**
 * vkBeautify - javascript plugin to pretty-print or minify text in XML, JSON, CSS and SQL formats.
 *
 * Version - 0.99.00.beta
 * Copyright (c) 2012 Vadim Kiryukhin
 * vkiryukhin @ gmail.com
 * http://www.eslinstructor.net/vkbeautify/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function() {
	function createShiftArr(step) {
		var space = isNaN(parseInt(step))? step : new Array(step+1).join(" ");
		var shift = ['\n'];
		for(ix=0;ix<100;ix++){
			shift.push(shift[ix]+space);
		}
		return shift;
	}
	function vkbeautify(){
		this.step = '    '; // 4 spaces
		this.shift = createShiftArr(this.step);
	};
	vkbeautify.prototype.xml = function(text,step) {
		var ar = text.replace(/>\s{0,}</g,"><").replace(/</g,"~::~<")
					 .replace(/\s*xmlns\:/g,"~::~xmlns:")
					 .replace(/\s*xmlns\=/g,"~::~xmlns=").split('~::~'),
			len = ar.length, inComment = false, deep = 0, str = '', ix = 0,
			shift = (step && step !== this.step) ? createShiftArr(step) : this.shift;
		for(ix=0;ix<len;ix++) {
			if(ar[ix].search(/<!/) > -1) {
				str += shift[deep]+ar[ix];
				inComment = true;
				if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) {
					inComment = false;
				}
			} else if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
				/^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) {
				str += ar[ix];
				if(!inComment) deep--;
			} else if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
				str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];
			} else if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			} else if(ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
			} else if(ar[ix].search(/\/>/) > -1 ) {
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			} else if(ar[ix].search(/<\?/) > -1) {
				str += shift[deep]+ar[ix];
			} else if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) {
				str += shift[deep]+ar[ix];
			} else {
				str += ar[ix];
			}
		}
		return  (str[0] == '\n') ? str.slice(1) : str;
	}
	vkbeautify.prototype.xmlmin = function(text, preserveComments) {
		var str = preserveComments ? text
								   : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"")
										 .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
		return  str.replace(/>\s{0,}</g,"><");
	}
	window.vkbeautify = new vkbeautify();
})();