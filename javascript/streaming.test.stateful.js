window.Stateful = Class.extend({
	options: {
		url:"http://localhost:12121/WebProcessingService",
		id: "com.github.autermann.wps.streaming.example.StatefulSummingProcess"
	},
	init: function(initialValue, messages, appender) {
		this.initialValue = parseFloat(initialValue);
		this.messages = parseInt(messages);
		this.appender = appender;
	},
	start: function() {
		var self = this;
		self.appender.reset();
		var execute = function(callback) {
			var request = new Streaming.WPS.ExecuteRequest({
				processId: self.options.id,
				inputs: [
					new Streaming.WPS.Input("initialValue",
						new Streaming.Data.Literal("xs:double", self.initialValue)),
				],
				outputs: new Streaming.WPS.ResponseDocument({
					definitons: [
						new Streaming.WPS.OutputDefinition({id: "process-id"}),
						new Streaming.WPS.OutputDefinition({id: "socket-uri"}),
					]
				})
			});
			var requestxml = request.toXML();
			self.appender.outgoing({ message: request, xml: requestxml });

			$.ajax(self.options.url, {
				type: "POST",
				contentType:"application/xml",
				dataType: "xml",
				mimeType: "application/xml",
				data: Streaming.Util.xml2string(requestxml)
			}).done(function(e) {
				var parser = new Streaming.XML.Parser();
				var response = parser.parse(e);
				self.appender.incoming({ message: response, xml: e });
				callback({
					processId: response.getOutputs()["process-id"].getValue(),
					socketURI: response.getOutputs()["socket-uri"].getValue(),
				});
			});
		}

		execute(function(processInfo) {
			self.client = new Streaming.Client(processInfo)
				.on("error", function(cause) {
					console.debug("Client failed", cause);
				})
				.on("incoming-message", function(e) {
					self.appender.incoming(e);
				})
				.on("outgoing-message", function(e) {
					self.appender.outgoing(e);
				});
			self.send();
		});
	},
	_createMessages: function() {
		var i, messages = new Array(this.messages);
		for (i = 0; i <= this.messages; ++i) {
			messages[i] = new Streaming.Message.Input({
				inputs: [ new Streaming.Input.Data("summand",
					new Streaming.Data.Literal("xs:decimal", Math.random())) ]
			});
		}
		return messages;
	},
	send: function() {
		var self = this, i = 0, interval = 500, len = self.messages,
			timer, messages = self._createMessages();

		self.client.listen();
		timer = function () {
			if (i < len) {
				self.client.send(messages[i]);
				window.setTimeout(timer, interval);
			} else {
				self.client.stop();
			}
			i++;
		};
		timer();
	}
});





