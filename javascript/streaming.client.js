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
	var ProcessDescriptionReference = Streaming.Data.Reference.extend({
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

	var StaticInputsData = Streaming.Data.Complex.extend({
		init: function(inputs) {
			var format = {
				mimeType: "text/xml",
				encoding: "UTF-8",
				schema: "https://autermann.github.com/streaming-wps/staticInputs.xsd"
			};
			var builder = new Streaming.XML.Builder();
			var xml = builder.encodeStaticInputs(inputs);
			var data = Streaming.Util.xml2string(xml);
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
				var xml = Streaming.Util.string2xml(e.data);
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
				string = Streaming.Util.xml2string(xml);
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
				new ProcessDescriptionReference(options.remoteWPS,
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

		var	requestString = Streaming.Util.xml2string(request.toXML());
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
})(window.Streaming||(window.Streaming = {}));