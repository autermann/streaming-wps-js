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
			vkbeautify.xml(fun(xml));
		}
	})();
})(window.Streaming||(window.Streaming = {}));
