(function() {
	window.string2xml = (function(){
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

	window.xml2string = (function(){
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
})();
