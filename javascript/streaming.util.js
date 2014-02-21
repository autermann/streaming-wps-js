/*
 * Copyright 2014 Christian Autermann
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(Streaming) {
	Streaming.Util = Streaming.Util || {};

	Streaming.Util.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.floor(Math.random() * 16);
			return ((c == 'x') ? r : (r & 0x3 | 0x8)).toString(16);
		});
	};
	Streaming.Util.string2xml = (function(){
		if (typeof window.DOMParser !== "undefined") {
		    return function(xmlStr) {
		        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
		    };
		} else if (typeof window.ActiveXObject !== "undefined" &&
		       new window.ActiveXObject("Microsoft.XMLDOM")) {
		    return function(xmlStr) {
		        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
		        xmlDoc.async = "false";
		        xmlDoc.loadXML(xmlStr);
		        return xmlDoc;
		    };
		} else {
		    throw new Error("No XML parser found");
		}
	})();
	Streaming.Util.xml2string = (function(){
		var fun;
		if (typeof window.XMLSerializer !== "undefined") {
			fun = function(xml) {
				return new XMLSerializer().serializeToString(xml);
			}
		} else if (typeof window.ActiveXObject !== "undefined") {
			fun = function(xml) {
				return xml.xml;
			};
		} else {
			throw new Error("No XML serializer found");
		}
		return function(xml) {
			return vkbeautify.xml(fun(xml));
		}
	})();
	Document.XPATH_NAMESPACES = Document.XPATH_NAMESPACES || {};
	var nameresolver = function(prefix) {
		return Document.XPATH_NAMESPACES[prefix];
	};
	Document.prototype._xpath = function(node, path, type) {
		if (!node) { node = this.documentElement };
		return this.evaluate(path, node, nameresolver, type, null);
	};
	Document.prototype.findAny = function(path, node) {
		var node, nodes = [], iter;
		iter = this._xpath(node, path, XPathResult.ANY_TYPE);
		while(node = iter.iterateNext()) {
			nodes.push(node);
		}
		return nodes;
	};
	Document.prototype.findNumber = function(path, node) {
		var result = this._xpath(node, path, XPathResult.NUMBER_TYPE);
		return result.numberValue;
	};
	Document.prototype.findString = function(path, node) {
		var result = this._xpath(node, path, XPathResult.STRING_TYPE);
		return result.stringValue;
	};
	Document.prototype.findBoolean = function(path, node) {
		var result = this._xpath(node, path, XPathResult.BOOLEAN_TYPE);
		return result.booleanValue;
	};
	Document.prototype.findNodes = function(path, node) {
		var node, nodes = [], iter;
		iter = this._xpath(node, path, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
		while(node = iter.iterateNext()) { nodes.push(node); }
		return nodes;
	},
	Document.prototype.findNode = function(path, node) {
		var result = this._xpath(node, path, XPathResult.FIRST_ORDERED_NODE_TYPE);
		return result.singleNodeValue;
	};
	Element.prototype.findAny = function(path) {
		return this.ownerDocument.findAny(this, path);
	};
	Element.prototype.findNumber = function(node, path) {
		return this.ownerDocument.findNumber(this, path);
	};
	Element.prototype.findString = function(node, path) {
		return this.ownerDocument.findString(this, path);
	};
	Element.prototype.findBoolean = function(node, path) {
		return this.ownerDocument.findBoolea(this, path);
	};
	Element.prototype.findNodes = function(node, path) {
		return this.ownerDocument.findNodes(this, path);
	};
	Element.prototype.findNode = function(node, path) {
		return this.ownerDocument.findNode(this, path);
	};
})(window.Streaming||(window.Streaming = {}));
