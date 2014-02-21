(function() {
	/* Copyright (c) 2014, Lawrence Davis
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are met:
	 *
	 * 1. Redistributions of source code must retain the above copyright notice,
	 * this list of conditions and the following disclaimer.
	 * 2. Redistributions in binary form must reproduce the above copyright
	 * notice, this list of conditions and the following disclaimer in the
	 * documentation and/or other materials provided with the distribution.
 	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
	 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
	 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
	 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
  if (!HTMLElement.prototype.querySelectorAll) {
    throw new Error('rootedQuerySelectorAll: This polyfill can only be used with browsers that support querySelectorAll');
  }
  var container = document.createElement('div');
  try {
    container.querySelectorAll(':scope *');
  } catch (e) {
    var scopeRE = /^\s*:scope/gi;
    function overrideNodeMethod(prototype, methodName) {
      var oldMethod = prototype[methodName];
      prototype[methodName] = function(query) {
        var nodeList, gaveId = false, gaveContainer = false;
        if (query.match(scopeRE)) {
          query = query.replace(scopeRE, '');
          if (!this.parentNode) {
            container.appendChild(this);
            gaveContainer = true;
          }
          parentNode = this.parentNode;
          if (!this.id) {
            this.id = 'rootedQuerySelector_id_'+(new Date()).getTime();
            gaveId = true;
          }
          nodeList = oldMethod.call(parentNode, '#'+this.id+' '+query);
          if (gaveId) { this.id = ''; }
          if (gaveContainer) { container.removeChild(this); }
          return nodeList;
        }
        else {
          return oldMethod.call(this, query);
        }
      };
    }
    overrideNodeMethod(HTMLElement.prototype, 'querySelector');
    overrideNodeMethod(HTMLElement.prototype, 'querySelectorAll');
  }
}());
(function() {
	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 */
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	this.Class = function(){};
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
	Class.extend = function(prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prop) {
			prototype[name] = typeof prop[name] == "function" &&
			typeof _super[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn){
				return function() {
					var tmp = this._super;
					this._super = _super[name];
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(name, prop[name]) : prop[name];
		}
		function Class() {
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
})();
(function() {
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
(function(){
	window.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.floor(Math.random() * 16);
			return ((c == 'x') ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}
})();

(function(){

var QName = Class.extend({
	init: function(namespace, name){
		this.namespace = namespace;
		this.name = name;
	},
	getNamespace: function() {
		return this.namespace;
	},
	getName: function() {
		return this.name;
	},
	is: function(e) {
		if (e instanceof QName) {
			return this.name === e.name && this.namespace === e.namespace;
		} else if (e.constructor === Element) {
			return this.name === e.localName && this.namespace === e.namespaceURI;
		} else {
			return false;
		}
	},
	findIn: function(e) {
		return e.getElementsByTagNameNS(this.getNamespace(), this.getName());
	},
	findOneIn: function(e) {
		return this.findIn(e)[0];
	}

});

var Streaming = {};

Streaming.OwsCodeType = Class.extend({
	init: function() {
		if (arguments.length === 1) {
			this.value = arguments[0];
		} else {
			this.codeSpace = arguments[0];
			this.value = arguments[1];
		}
	},
	getCodeSpace: function() {
		return this.codeSpace;
	},
	getValue: function() {
		return this.value;
	},
	toString: function() {
		if (this.codeSpace) {
			return this.codeSpace + ":" + this.value
		} else {
			return this.value
		}
	}
});

Streaming.Message = Class.extend({
	processId: null,
	messageId: null,
	action: null,
	xmlBuilder: null,
	relatedMessages: null,
	init: function(options) {
		this.action = options.action;
		this.messageId = options.messageId || "uuid:" + uuid();
		this.processId = options.processId;
		this.xmlBuilder = new Streaming.XML.Builder();
		this.relatedMessages = options.relatedMessages || [];
	},
	getID: function() {
		return this.messageId;
	},
	getProcessID: function() {
		return this.processId;
	},
	getAction: function() {
		return this.action;
	},
	getRelatedMessages: function() {
		return this.relatedMessages;
	},
	toXML: function() {
		throw new Error("Serializations is not supported!");
	}
});

Streaming.Message.Input = Streaming.Message.extend({
	init: function(options) {
		options.action = "https://github.com/autermann/streaming-wps/input";
		this._super(options);
		this.inputs = options.inputs;
	},
	getInputs: function() {
		return this.inputs;
	},
	toXML: function() {
		return this.xmlBuilder.encodeInputMessage(this);
	}
});

Streaming.Message.OutputRequest = Streaming.Message.extend({
	init: function(options) {
		options.action = "https://github.com/autermann/streaming-wps/request-output";
		this._super(options);
	},
	toXML: function() {
		return this.xmlBuilder.encodeOutputRequestMessage(this);
	}
});

Streaming.Message.Error = Streaming.Message.extend({
	init: function(options) {
		options.action = "https://github.com/autermann/streaming-wps/error";
		this._super(options);
	},
	toXML: function() {
		return this.xmlBuilder.encodeErrorMessage(this);
	}
});

Streaming.Message.Output = Streaming.Message.extend({
	init: function(options) {
		options.action = "https://github.com/autermann/streaming-wps/output";
		this._super(options);
	},
	fromXML: function() {

	}
});

Streaming.Message.Stop = Streaming.Message.extend({
	init: function(options) {
		options.action = "https://github.com/autermann/streaming-wps/stop";
		this._super(options);
	},
	toXML: function() {
		return this.xmlBuilder.encodeStopMessage(this);
	}
});

Streaming.Input = Class.extend({
	init: function(id) {
		if (!(id instanceof Streaming.OwsCodeType)) {
			id = new Streaming.OwsCodeType(id);
		}
		this.id = id;
	},
	getID: function() {
		return this.id;
	}
});

Streaming.Input.Data = Streaming.Input.extend({
	init: function(id, data) {
		this._super(id);
		this.data = data;
	},
	getData: function() {
		return this.data;
	}
});

Streaming.Input.Reference = Streaming.Input.extend({
	init: function(id, message, output) {
		this._super(id);
		this.message = message;
		if (!(output instanceof Streaming.OwsCodeType)) {
			output = new Streaming.OwsCodeType(output);
		}
		this.output = output;
	},
	getReferencedMessage: function() {
		return this.message;
	},
	getReferencedOutput: function() {
		return this.output;
	}
});

Streaming.Data = Class.extend({});

Streaming.Data.Literal = Streaming.Data.extend({
	init: function(dataType, value, uom) {
		this.dataType = dataType;
		this.value = value;
		this.uom = uom;
	},
	getDataType: function() {
		return this.dataType;
	},
	getValue: function() {
		return this.value;
	},
	getUOM: function() {
		return this.uom;
	}
});

Streaming.Data.Complex = Streaming.Data.extend({
	init: function(format, data) {
		this.format = format;
		this.data = data;
	},
	getFormat: function() {
		return this.format;
	},
	getData: function() {
		return this.data;
	}
});

Streaming.Data.BoundingBox = Streaming.Data.extend({
	init: function(lowerCorner, upperCorner, crs, dim) {
		this.lowerCorner = lowerCorner;
		this.upperCorner = upperCorner;
		this.crs = crs;
		this.dim = dim;
	},
	getLowerCorner: function() {
		return this.lowerCorner;
	},
	getUpperCorner: function() {
		return this.upperCorner;
	},
	getDimension: function() {
		return this.dim;
	},
	getCRS: function() {
		return this.crs;
	}
});

Streaming.Data.Reference = Streaming.Data.extend({
	init: function(options) {
		this.method = options.method || "GET";
		this.href = options.href
		this.format = options.format || {};
		this.body = options.body;
		this.bodyReference = options.bodyReference;
		this.headers = options.headers || {};
	},
	getMethod: function() {
		return this.method;
	},
	getHref: function() {
		return this.href;
	},
	getFormat: function() {
		return this.format;
	},
	getBody: function() {
		return this.body;
	},
	getBodyReference: function() {
		return this.bodyReference;
	},
	getHeaders: function() {
		return this.headers;
	}
});

Streaming.ProcessDescriptionReference = Streaming.Data.Reference.extend({
	init: function(url, processId) {
		this.processId = processId;
		var href = this._processDescriptionURL(url, processId);
		var format = this._processDescriptionFormat();
		this._super({ href: href, format: format });
	},
	getProcessID: function() {
		return this.processId;
	},
	_processDescriptionURL: function(url, id) {
		return url + "?service=WPS&version=1.0.0&request=DescribeProcess&identifier=" + id;
	},
	_processDescriptionFormat: function() {
		return {
			mimeType: "text/xml",
			encoding: "UTF-8",
			schema: "http://schemas.opengis.net/wps/1.0.0/wpsDescribeProcess_response.xsd"
		};
	}
});

Streaming.WPS = {
};

Streaming.WPS.ExecuteResponse = Class.extend({
	init: function(options) {
		this.outputs = options.outputs || {};
		this.processId = options.processId;
	},
	getOutputs: function() {
		return this.outputs;
	},
	getProcessID: function() {
		return this.processId;
	}
});

Streaming.WPS.ExecuteRequest = Class.extend({
	init: function(options) {
		if (!(options.processId instanceof Streaming.OwsCodeType)) {
			options.processId = new Streaming.OwsCodeType(options.processId);
		}
		this.processId = options.processId;
		this.inputs = options.inputs || [];
		this.outputs = options.outputs;
	},
	getID: function() {
		return this.processId;
	},
	getInputs: function() {
		return this.inputs;
	},
	getOutputs: function() {
		return this.outputs;
	},
	getServiceType: function() {
		return "WPS";
	},
	getServiceVersion: function() {
		return "1.0.0";
	},
	toXML: function() {
		return new Streaming.XML.Builder().encodeExecuteRequest(this);
	}
});

Streaming.WPS.Input = Class.extend({
	init: function(id, data) {
		if (!(id instanceof Streaming.OwsCodeType)) {
			id = new Streaming.OwsCodeType(id);
		}
		this.id = id;
		this.data = data;
	},
	getID: function() {
		return this.id;
	},
	getData: function() {
		return this.data;
	}
})

Streaming.WPS.ResponseForm = Class.extend({
});

Streaming.WPS.ResponseDocument = Streaming.WPS.ResponseForm.extend({
	init: function(options) {
		this.definitons = options.definitons || [];
	},
	getDefinitions: function() {
		return this.definitons;
	}
});

Streaming.WPS.OutputDefinition = Class.extend({
	init: function(options) {
		if (!(options.id instanceof Streaming.OwsCodeType)) {
			options.id = new Streaming.OwsCodeType(options.id);
		}
		this.id = options.id;
		this.asReference=options.asReference;
		this.format = options.format || {};
		this.uom = options.uom;
	},
	getID: function() {
		return this.id;
	},
	getFormat: function() {
		return this.format;
	},
	getUOM: function() {
		return this.uom;
	},
	isAsReference: function() {
		return this.asReference;
	}
});

Streaming.WPS.RawDataOutput = Streaming.WPS.ResponseForm.extend({
	init: function(options) {
		if (!(options.id instanceof Streaming.OwsCodeType)) {
			options.id = new Streaming.OwsCodeType(options.id);
		}
		this.id = options.id;
		this.format = options.format || {};
		this.uom = options.uom;
	},
	getUOM: function() {
		return this.uom;
	},
	getID: function() {
		return this.id;
	},
	getFormat: function() {
		return this.format;
	}
});
Streaming.XML = {
	NS_SOAP: "http://www.w3.org/2003/05/soap-envelope",
	NS_WSA: "http://www.w3.org/2005/08/addressing",
	NS_STREAM: "https://github.com/autermann/streaming-wps",
	NS_XSI: "http://www.w3.org/2001/XMLSchema-instance",
	NS_WPS: "http://www.opengis.net/wps/1.0.0",
	NS_XLINK: "http://www.w3.org/1999/xlink",
	NS_OWS: "http://www.opengis.net/ows/1.1",
}

QNames = {
	OWS: {
		ExceptionReport: new QName(Streaming.XML.NS_OWS, "ExceptionReport"),
	},
	SOAP: {
		Envelope : new QName(Streaming.XML.NS_SOAP, "Envelope"),
	},
	Stream: {
		InputMessage : new QName(Streaming.XML.NS_STREAM, "InputMessage"),
		OutputMessage : new QName(Streaming.XML.NS_STREAM, "OutputMessage"),
		OutputRequestMessage : new QName(Streaming.XML.NS_STREAM, "OutputRequestMessage"),
		StopMessage : new QName(Streaming.XML.NS_STREAM, "StopMessage"),
		ErrorMessage : new QName(Streaming.XML.NS_STREAM, "ErrorMessage"),
	},
	WPS: {
		ExecuteResponse : new QName(Streaming.XML.NS_WPS, "ExecuteResponse"),
	}
};

Streaming.XML.Builder = Class.extend({
 	encodeExecuteRequest: function(request) {
		this.doc = string2xml('<wps:Execute xmlns:wps="' + Streaming.XML.NS_WPS + '" />');
 		this.execute = this.doc.documentElement;
		this.execute.setAttribute("xmlns:xsi", Streaming.XML.NS_XSI);
		this.execute.setAttribute("xmlns:xlink", Streaming.XML.NS_XLINK);
		this.execute.setAttribute("xmlns:ows", Streaming.XML.NS_OWS);
		this.execute.setAttribute("service", request.getServiceType());
		this.execute.setAttribute("version", request.getServiceVersion());

		var id = this.doc.createElement("ows:Identifier");
		this.encodeIdentifier(request.getID(), id);
		this.execute.appendChild(id);

		this.encodeInputs(request.getInputs());
		this.encodeOutputs(request.getOutputs());
		return this.doc;
 	},
 	encodeStaticInputs: function(inputs) {
		this.doc = string2xml('<stream:StaticInputs xmlns:stream="' + Streaming.XML.NS_STREAM + '"/>')
		var dataInputs = this.doc.documentElement;
		this.execute.appendChild(dataInputs);
 		for (var i = 0; i < inputs.length; ++i) {
 			var input = this.doc.createElement("wps:Input");
 			dataInputs.appendChild(input);
 			var inputId = this.doc.createElement("ows:Identifier");
 			this.encodeIdentifier(inputs[i].getID(), inputId);
 			input.appendChild(inputId);
 			input.appendChild(this.createData(inputs[i].getData()));
	 	}
 	},
 	encodeInputs: function(inputs) {
 		if (inputs.length) {
 			var dataInputs = this.doc.createElement("wps:DataInputs");
 			this.execute.appendChild(dataInputs);
	 		for (var i = 0; i < inputs.length; ++i) {
	 			var input = this.doc.createElement("wps:Input");
	 			dataInputs.appendChild(input);
	 			var inputId = this.doc.createElement("ows:Identifier");
	 			this.encodeIdentifier(inputs[i].getID(), inputId);
	 			input.appendChild(inputId);
	 			input.appendChild(this.createData(inputs[i].getData()));
		 	}
	 	}
	},
 	encodeOutputs: function(outputs) {
 		if (outputs instanceof Streaming.WPS.ResponseDocument) {
 			var responseForm = this.doc.createElement("wps:ResponseForm");
 			var responseDoc = this.doc.createElement("wps:ResponseDocument");
 			this.execute.appendChild(responseForm);
 			responseForm.appendChild(responseDoc);
 			var outputDefs = outputs.getDefinitions();
 			for (var i = 0; i < outputDefs.length; ++i) {
 				var output = this.doc.createElement("wps:Output");
 				responseDoc.appendChild(output);
 				this.encodeFormat(outputDefs[i].getFormat(), output);
				if (outputDefs[i].getUOM()) {
 					output.setAttribute("uom", outputDefs[i].getUOM());
 				}
 				if (outputDefs[i].isAsReference()) {
 					output.setAttribute("asReference", true);
 				}
 				var outputId = this.doc.createElement("ows:Identifier");
 				this.encodeIdentifier(outputDefs[i].getID(), outputId);
 				output.appendChild(outputId);
 			}
 		} else if (outputs instanceof Streaming.WPS.RawDataOutput) {
    		var responseForm = this.doc.createElement("wps:ResponseForm");
			var rawDataOutput = this.doc.createElement("wps:RawDataOutput");
			this.execute.appendChild(responseForm);
			responseForm.appendChild(rawDataOutput);
			if (outputs.getUOM()) {
				rawDataOutput.setAttribute("uom", output.getUOM());
			}
			this.encodeFormat(outputs.getFormat(), rawDataOutput);
			var outputId = this.doc.createElement("ows:Identifier");
			this.encodeIdentifier(outputs.getID(), outputId);
			rawDataOutput.appendChild(outputId);
 		} else {
 			console.warn("Can not encode response form", outputs);
 		}
 	},
 	createEnvelope: function() {
 		this.doc = string2xml('<soap:Envelope xmlns:soap="' + Streaming.XML.NS_SOAP + '" />');
 		this.envelope = this.doc.documentElement;
		this.envelope.setAttribute("xmlns:wsa", Streaming.XML.NS_WSA);
		this.envelope.setAttribute("xmlns:stream", Streaming.XML.NS_STREAM);
		this.envelope.setAttribute("xmlns:wps", Streaming.XML.NS_WPS);
		this.envelope.setAttribute("xmlns:xsi", Streaming.XML.NS_XSI);
		this.envelope.setAttribute("xmlns:xlink", Streaming.XML.NS_XLINK);
		this.envelope.setAttribute("xmlns:ows", Streaming.XML.NS_OWS);
		this.header = this.envelope.appendChild(this.doc.createElement("soap:Header"));
		this.body = this.envelope.appendChild(this.doc.createElement("soap:Body"));
 	},
 	encodeStopMessage: function(message) {
 		this.createEnvelope();
 		this.encodeHeader(message);
 		this.message = this.doc.createElement("stream:StopMessage");
 		this.message.appendChild(this.createProcessID(message.getProcessID()));
 		this.body.appendChild(this.message);
 		return this.doc;
 	},
 	encodeOutputRequestMessage: function(message) {
 		this.createEnvelope();
 		this.encodeHeader(message);
 		this.message = this.doc.createElement("stream:OutputRequestMessage");
 		this.message.appendChild(this.createProcessID(message.getProcessID()));
 		this.body.appendChild(this.message);
 		return this.doc;
 	},
 	encodeInputMessage: function(message) {
 		this.createEnvelope();
 		this.encodeHeader(message);
 		this.message = this.doc.createElement("stream:InputMessage");
 		this.message.appendChild(this.createProcessID(message.getProcessID()));
 		this.body.appendChild(this.message);
 		var inputs = this.doc.createElement("stream:Inputs");
 		for (var i = 0; i < message.getInputs().length; ++i) {
 			inputs.appendChild(this.createInput(message.getInputs()[i]));
 		}
 		this.message.appendChild(inputs);
 		return this.doc;
 	},
 	createInput: function(input) {
 		if (input instanceof Streaming.Input.Data) {
 			return this.createDataInput(input);
 		} else if (input instanceof Streaming.Input.Reference) {
 			return this.createReferenceInput(input);
 		} else {
 			console.warn("Can not encode input", input);
 		}
 	},
 	createReferenceInput: function(input) {
 		var refInput = this.doc.createElement("stream:ReferenceInput");
 		var inputId = this.doc.createElement("ows:Identifier");
 		this.encodeIdentifier(input.getID(), inputId);
 		refInput.appendChild(inputId);

 		var ref = this.doc.createElement("stream:Reference");
 		ref.appendChild(this.createElementWithValue("wsa:MessageID", input.getReferencedMessage()));
 		var outputId = this.doc.createElement("stream:Output");
 		this.encodeIdentifier(input.getReferencedOutput(), outputId);
 		ref.appendChild(outputId);
 		refInput.appendChild(ref);
 		return refInput;
 	},
 	encodeIdentifier: function(id, target) {
 		if (id.getCodeSpace()) {
 			target.setAttribute("codeSpace", id.getCodeSpace());
 		}
 		var value = this.doc.createTextNode(id.getValue());
 		target.appendChild(value);
 	},
 	createDataInput: function(input) {
 		var streamingInput = this.doc.createElement("stream:StreamingInput");
 		var inputId = this.doc.createElement("ows:Identifier");
 		this.encodeIdentifier(input.getID(), inputId);
 		streamingInput.appendChild(inputId);
 		streamingInput.appendChild(this.createData(input.getData()))
 		return streamingInput;
 	},
 	createData: function(data, target) {
 		if (data instanceof Streaming.Data.Reference) {
 			return this.createReferenceData(data);
 		} else if (data instanceof Streaming.Data.Literal) {
			return this.createLiteralData(data);
 		} else if (data instanceof Streaming.Data.Complex) {
			return this.createComplexData(data);
 		} else if (data instanceof Streaming.Data.BoundingBox) {
			return this.createBoundingBoxData(data);
 		} else {
 			console.warn("Can not encode data input", input.getData());
 		}
 	},
 	createLiteralData: function(data) {
 		var wpsData = this.doc.createElement("wps:Data");
 		var literalData = this.doc.createElement("wps:LiteralData");
 		if (data.getDataType()){
 			literalData.setAttribute("dataType", data.getDataType());
 		}
 		if (data.getUOM()) {
 			literalData.setAttribute("uom", data.getUOM());
 		}
 		literalData.appendChild(this.doc.createTextNode(data.getValue()));
 		wpsData.appendChild(literalData);
 		return wpsData;
 	},
 	createComplexData: function(data) {
 		var wpsData = this.doc.createElement("wps:Data");
 		var complexData = this.doc.createElement("wps:ComplexData");
		complexData.appendChild(this.createNode(data.getData()));
		this.encodeFormat(data.getFormat(), complexData);
		wpsData.appendChild(complexData);
 		return wpsData;
 	},
 	createNode: function(anything) {
 		var xml;
 		try {
 			xml = string2xml(anything);
 			if (xml.getElementsByTagName("parsererror").length > 0) {
 				xml = null;
 			}
 		} catch(e) {}
 		if (xml) {
 			return xml.documentElement;
 		} else {
 			return this.doc.createTextNode(anything);
 		}
 	},
 	createReferenceData: function(data) {
 		var ref = this.doc.createElement("wps:Reference");
 		ref.setAttribute("method", data.getMethod());
 		ref.setAttribute("xlink:href", data.getHref());
 		this.encodeFormat(data.getFormat(), ref);
 		for (var key in data.getHeaders()) {
 			if (data.getHeaders.hasOwnProperty(key)) {
 				var header = this.doc.createElement("wps:Header");
 				header.appendChild(this.createElementWithValue("wps:Key", key));
 				header.appendChild(this.createElementWithValue("wps:Value", data.getHeaders()[key]));
 				ref.appendChild(header);
 			}
 		}
 		if (data.getBody()) {
 			var body = this.doc.createElement("wps:Body");
 			body.appendChild(this.createNode(data.getBody()));
 			ref.appendChild(body);
 		} else if (data.getBodyReference()) {
 			var bodyReference = this.doc.createElement("wps:BodyReference");
 			bodyReference.setAttribute("xlink:href", data.getBodyReference());
 			ref.appendChild(bodyReference);
 		}
 		return ref;
 	},
 	createBoundingBoxData: function(data) {
 		var wpsData = this.doc.createElement("wps:Data");
 		var bboxData = this.doc.createElement("wps:BoundingBoxData");
 		if (data.getCRS()) {
 			bboxData.setAttribute("crs", data.getCRS());
 		}
 		if (data.getDimension()) {
 			bboxData.setAttribute("dimensions", data.getDimension())
 		}
 		bboxData.appendChild(this.createElementWithValue("ows:LowerCorner", data.getLowerCorner().join(" ")));
 		bboxData.appendChild(this.createElementWithValue("ows:UpperCorner", data.getUpperCorner().join(" ")));
		wpsData.appendChild(bboxData);
 		return wpsData;
 	},
 	encodeFormat: function(format, target) {
 		if (format) {
	 		if (format.mimeType) {
	 			target.setAttribute("mimeType", format.mimeType);
	 		}
	 		if (format.encoding) {
	 			target.setAttribute("encoding", format.encoding);
	 		}
	 		if (format.schema) {
	 			target.setAttribute("schema", format.schema);
	 		}
 		}
 	},
 	createFrom: function(value) {
		return this.createAddressHeader("wsa:From", value);
	},
	createFaultTo: function(value) {
		return this.createAddressHeader("wsa:FaultTo", value);
	},
	createReplyTo: function(value) {
		return this.createAddressHeader("wsa:ReplyTo", value);
	},
	createProcessID: function(value) {
		return this.createElementWithValue("stream:ProcessID", value);
	},
	createMessageID: function(value) {
		return this.createElementWithValue("wsa:MessageID", value);
	},
	createAction: function(value) {
		return this.createElementWithValue("wsa:Action", value);
	},
	createElementWithValue: function(name,value) {
		var node = this.doc.createElement(name);
		node.appendChild(this.doc.createTextNode(value));
		return node;
	},
	createAddressHeader: function(name,value) {
		var node = this.doc.createElement(name);
		node.appendChild(this.createElementWithValue("wsa:Address", value));
		return node;
	},
	encodeHeader: function(message) {
		this.header.appendChild(this.createFaultTo("http://www.w3.org/2005/08/addressing/none"));
		this.header.appendChild(this.createReplyTo("http://www.w3.org/2005/08/addressing/none"));
		this.header.appendChild(this.createFrom("http://www.w3.org/2005/08/addressing/anonymous"));
		this.header.appendChild(this.createMessageID(message.getID()));
		this.header.appendChild(this.createAction(message.getAction()));
		var rm = message.getRelatedMessages()
		for (var i = 0; i < rm.length; ++i) {
			this.header.appendChild(this.createRelatesTo(rm[i]));
		}
	},
	createRelatesTo: function(relatedMessage) {
		var relatesTo = this.doc.createElement("wsa:RelatesTo");
		var value;
		if (typeof relatedMessage === "object") {
			if (relatedMessage.type) {
				relatesTo.setAttribute("RelationshipType", relatedMessage.type);
			}
			value = relatedMessage.value;
		} else {
			value = relatedMessage;
		}
		relatesTo.appendChild(this.doc.createTextNode(value));
		return relatesTo;
	}
});

Streaming.XML.Parser = Class.extend({
	parseOutputs: function() {
		var outputs = this.xml.querySelectorAll("ExecuteResponse>ProcessOutputs>Output")
		var i, parsed = {}, id, value;
		for(i = 0; i < outputs.length; ++i) {
			parsed[this.parseIdentifier(outputs[i].querySelector(":scope>Identifier"))]
							= this.parseOutput(outputs[i]);
		}
		return parsed;
	},
	parseOutput: function(output) {
		if (output.querySelector(":scope>Data>LiteralData")) {
			return this.parseLiteralData(output);
		} else if (output.querySelector(":scope>Data>ComplexData")) {
			return this.parseComplexData(output);
		} else if (output.querySelector(":scope>Data>BoundingBoxData")) {
			return this.parseBoundingBoxData(output);
		} else if (output.querySelector(":scope>Reference")) {
			return this.parseReferenceData(output);
		} else {
			console.warn("Can not parse output", output);
		}
	},
	parseLiteralData: function(output) {
		var ldata = output.querySelector(":scope>Data>LiteralData");
		return new Streaming.Data.Literal(
			ldata.getAttribute("dataType"),
			ldata.textContent,
			ldata.getAttribute("uom")
		);
	},
	parseComplexData: function(output){
		var cdata = output.querySelector(":scope>Data>ComplexData");
		return new ComplexData(
			this.parseFormat(cdata),
            this.getNodeContentAsString(cdata)
        );
	},
	getNodeContentAsString: function(node) {
		var content = this.xml.createDocumentFragment();
		var childNodes = cdata.childNodes;
		for (var i = 0; i < childNodes.length; ++i) {
			content.appendChild(childNodes[i]);
		}
		return xml2string(content);
	},
	parseBoundingBoxData: function(output) {
		var bbox = output.querySelector(":scope>Data>BoundingBoxData");
		var dim = bbox.getAttribute("dimensions");
		var crs = bbox.getAttribute("crs");
		var lc = this.string2NumberArray(bbox.querySelector(":scope>LowerCorner").textContent);;
		var uc = this.string2NumberArray(bbox.querySelector(":scope>UpperCorner").textContent);;
		return Streaming.Data.BoundingBox(lc,uc,crs,dim);
	},
	string2NumberArray: function(string) {
		var splitted = string.split(" ");
		var result = new Array(splitted.length);
		for (var i = 0; i < splitted.length; ++i) {
			result[i] = parseFloat(splitted[i]);
		}
		return result;
	},
	parseReferenceData: function(output) {
		var ref = output.querySelector(":scope>Reference");
		var options = {
			href: ref.getAttributeNS(Streaming.XML.NS_XLINK, "href"),
			format: this.parseFormat(ref),
			method: ref.getAttribute("method"),
			headers: {}
		};
		var body = ref.querySelector(":scope>Body");
		if (body) {
			options.body = this.getNodeContentAsString(body);
		}
		var bodyReference = ref.querySelector(":scope>RodyReference");
		if (bodyReference) {
			options.bodyReference = bodyReference.getAttributeNS(Streaming.XML.NS_XLINK, "href")
		}
		var headers = ref.querySelectorAll(":scope>Header");
		for (var i = 0; i < headers.length; ++i) {
			options.headers[headers[i].querySelector(":scope>Key").textContent]
					= headers[i].querySelector(":scope>Value").textContent;
		}
		return new Streaming.Data.Reference(options);
	},
	parseFormat: function (from) {
		return {
			mimeType: cdata.getAttribute("mimeType"),
			encoding: cdata.getAttribute("encoding"),
			schema: cdata.getAttribute("schema")
		};
	},
	parseIdentifier: function(id) {
		return new Streaming.OwsCodeType(id.getAttribute("codeSpace"), id.textContent);
	},
	parseProcessId: function() {
		return this.parseIdentifier(this.xml.querySelector("ExecuteResponse>Process>Identifier"));
	},
	parseExecuteResponse: function() {
		return new Streaming.WPS.ExecuteResponse({
			outputs: this.parseOutputs(),
			processId: this.parseProcessId()
		});
	},
	parseOutputMessage: function() {
		//TODO
	},
	parseStopMessage: function() {
		//TODO
	},
	parseErrorMessage: function() {
		throw this.xml;
	},
	parseExceptionReport: function() {
		throw this.xml;
	},
	parse: function(xml) {
		this.xml = xml; var root = xml.documentElement;
		     if (QNames.WPS.ExecuteResponse.is(root))  return this.parseExecuteResponse();
		else if (QNames.Stream.OutputMessage.is(root)) return this.parseOutputMessage();
		else if (QNames.Stream.ErrorMessage.is(root))  return this.parseErrorMessage();
		else if (QNames.Stream.StopMessage.is(root))   return this.parseStopMessage();
		else if (QNames.OWS.ExceptionReport.is(root))  return this.parseExceptionReport();
		else throw new Error("Can not parse XML");
	}
});

var StaticInputsData = Streaming.Data.Complex.extend({
	init: function(inputs) {
		var format = {
			mimeType: "text/xml",
			encoding: "UTF-8",
			schema: "https://autermann.github.com/streaming-wps/staticInputs.xsd"
		};
		var builder = new Streaming.XML.Builder();
		var xml = builder.encodeStaticInputs(inputs);
		var data = xml2string(xml);
		this._super(format, data);
	}
});

Streaming.Client = Class.extend({

	init: function(options){
		this.uri = options.socketURI;
		this.processId = options.processId;
		this.socket = null;
		this.state = null;
	},
	connect: function() {
		if (this.socket) return;
		var self = this;
		this.socket = new WebSocket(this.uri);
		this.socket.onopen = function() { self.state = "open"; self.fire("open"); };
		this.socket.onclose = function() { self.state = "closed"; self.fire("close"); };
		this.socket.onerror = function(e) { self.fire("error", e); };
		this.socket.onmessage = function(e) {
			var xml = string2xml(e.data);
			var parser = new Streaming.XML.Parser();
			var message = parser.parse(xml);
			console.debug("Received Message", message);
			if (message instanceof Streaming.Message.Input) {
				self.fire("inputmessage", message);
			} else if (message instanceof Streaming.Message.Output) {
				self.fire("outputmessage", message);
			} else if (message instanceof Streaming.Message.Error) {
				self.fire("errormessage", message);
			} else if (message instanceof Streaming.Message.OutputRequest) {
				self.fire("outputrequestmessage", message);
			} else if (message instanceof Streaming.Message.Stop) {
				self.fire("stopmessage", message);
			} else {
				self.fire("error", message);
			}
		};
		return this;
	},
	listen: function() {
		this._doOnOpen(function() {
			this._send(new Streaming.Message.OutputRequest({processId: this.processId}));
		});
		return this;
	},
	_doOnOpen: function(fun) {
		var self = this;
		if (self.state === "open") {
			fun.call(self);
		} else if (self.state === "closed") {
			throw new Error("Client already closed!");
		} else {
			self.connect();
			self.on("open", function() {
				fun.call(self);
			});
		}
	},
	send: function(message) {
		this._doOnOpen(function() {
			this._send(message);
		})
		return this;
	},
	_send: function(message) {
		var xml = message.toXML(),
			string = xml2string(xml);
		console.debug("Sending message", xml);
		this.socket.send(string);
	},
	close: function() {
		if (this.socket) {
			this.sockert.close();
		}
	}
});


Streaming.Client.start = function(options, callback) {
	var inputs= [
		new Streaming.WPS.Input("remote-wps-url",
			new Streaming.Data.Literal("xs:anyURI", options.remoteWPS)),
		new Streaming.WPS.Input("remote-process-description",
			new Streaming.ProcessDescriptionReference(options.remoteWPS,
				                                      options.remoteId)),
	];
	var outputs = [
		new Streaming.WPS.OutputDefinition({id: "process-id"}),
		new Streaming.WPS.OutputDefinition({id: "input-socket-uri"}),
		new Streaming.WPS.OutputDefinition({id: "output-socket-uri"}),
	];

	if (options.commonInputs) {
		inputs.push(new Streaming.WPS.Input("static-inputs",
			new StaticInputsData(options.commonInputs)));
	}

	var request = new Streaming.WPS.ExecuteRequest({
		processId: options.streamingId, inputs: inputs,
		outputs: new Streaming.WPS.ResponseDocument({definitons: outputs})
	});

	var	requestString = xml2string(request.toXML());
	console.debug("Request:", requestString)
	var self = this;
	$.ajax(options.streamingWPS, {
		type: "POST",
		contentType:"application/xml",
		dataType: "xml",
		mimeType: "application/xml",
		data: requestString
	}).done(function(e) {
		console.debug("Response:", e)
		var parser = new Streaming.XML.Parser();
		var response = parser.parse(e);
		processInfo = {
			processId: response.getOutputs()["process-id"].getValue(),
			socketURI: response.getOutputs()["input-socket-uri"].getValue()
		};
		callback(processInfo);
	});
};

window.Streaming = Streaming;

})();