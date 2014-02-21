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
		}
	});
	Streaming.XML = Streaming.XML || {};

	Streaming.XML.NS_SOAP   = "http://www.w3.org/2003/05/soap-envelope";
	Streaming.XML.NS_WSA    = "http://www.w3.org/2005/08/addressing";
	Streaming.XML.NS_STREAM = "https://github.com/autermann/streaming-wps";
	Streaming.XML.NS_XSI    = "http://www.w3.org/2001/XMLSchema-instance";
	Streaming.XML.NS_WPS    = "http://www.opengis.net/wps/1.0.0";
	Streaming.XML.NS_XLINK  = "http://www.w3.org/1999/xlink";
	Streaming.XML.NS_OWS    = "http://www.opengis.net/ows/1.1";

	Document.XPATH_NAMESPACES["soap"]   = Streaming.XML.NS_SOAP,
	Document.XPATH_NAMESPACES["wsa"]    = Streaming.XML.NS_WSA,
	Document.XPATH_NAMESPACES["stream"] = Streaming.XML.NS_STREAM,
	Document.XPATH_NAMESPACES["xsi"]    = Streaming.XML.NS_XSI,
	Document.XPATH_NAMESPACES["wps"]    = Streaming.XML.NS_WPS,
	Document.XPATH_NAMESPACES["xlink"]  = Streaming.XML.NS_XLINK,
	Document.XPATH_NAMESPACES["ows"]    = Streaming.XML.NS_OWS

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
			this.doc = Streaming.Util.string2xml('<wps:Execute xmlns:wps="' + Streaming.XML.NS_WPS + '" />');
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
			this.doc = Streaming.Util.string2xml('<stream:StaticInputs xmlns:stream="' + Streaming.XML.NS_STREAM + '"/>')
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
	 		this.doc = Streaming.Util.string2xml('<soap:Envelope xmlns:soap="' + Streaming.XML.NS_SOAP + '" />');
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
	 			xml = Streaming.Util.string2xml(anything);
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
			return Streaming.Util.xml2string(content);
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
		parseOutputMessage: function(options) {
			var i, id,
				elements = this.xml.querySelectorAll("Envelope>Body>OutputMessage>Outputs>Output");
			options.outputs = {}
			for (i = 0; i < elements.length; ++i) {
				id = this.parseIdentifier(elements[i].querySelector(":scope>Identifier"));
				options.outputs[id] = this.parseOutput(elements[i]);
			}
			return new Streaming.Message.Output(options);
		},
		parseStopMessage: function(options) {
			return new Streaming.Message.Stop(options);
		},
		parseErrorMessage: function(options) {
			//TODO parse
			throw this.xml;
		},
		parseExceptionReport: function() {
			//TODO parse
			throw this.xml;
		},
		parseRelatedMessages: function() {
			var relatesTo = this.xml.querySelectorAll("Envelope>Header>RelatesTo");
			var relatedMessages = [];
			for (var i = 0; i < relatesTo.length; ++i) {
				if (relatesTo[i].getAttribute("RelationshipType")) {
					relatedMessages.push({
						type: relatesTo[i].getAttribute("RelationshipType"),
						value: relatesTo[i].textContent
					});
				} else {
					relatedMessages.push(relatesTo[i].textContent);
				}
			}
			return relatedMessages;
		},
		parseMessageID: function() {
			return this.xml.querySelector("Envelope>Header>MessageID").textContent;
		},
		parseProcessID: function() {
			return this.xml.querySelector("Envelope>Body>*>ProcessID").textContent;
		},
		parseMessage: function() {
			var options = {
				processId: this.parseProcessID(),
				messageId: this.parseMessageID(),
				relatedMessage: this.parseRelatedMessages()
			};
			var root = this.xml.querySelector("Envelope>Body>*");
			if (QNames.Stream.OutputMessage.is(root)) {
				return this.parseOutputMessage(options);
			} else if (QNames.Stream.ErrorMessage.is(root)) {
				return this.parseErrorMessage(options);
			} else if (QNames.Stream.StopMessage.is(root)) {
				return this.parseStopMessage(options);
			} else {
				throw new Error("Can not parse XML");
			}
		},
		parse: function(xml) {
			this.xml = xml; var root = xml.documentElement;
			if (QNames.WPS.ExecuteResponse.is(root)) {
				return this.parseExecuteResponse();
			} else if (QNames.OWS.ExceptionReport.is(root)) {
				return this.parseExceptionReport();
			} else if (QNames.SOAP.Envelope.is(root)) {
				return this.parseMessage();
			} else {
				throw new Error("Can not parse XML");
			}

		}
	});
})(window.Streaming||(window.Streaming = {}));
