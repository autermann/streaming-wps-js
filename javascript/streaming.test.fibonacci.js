window.Fibonacci = Class.extend({
	options: {
		streamingWPS: "http://localhost:12121/WebProcessingService",
		streamingId: "com.github.autermann.wps.streaming.delegate.DelegatingStreamingAlgorithm",
		remoteWPS: "http://localhost:12121/WebProcessingService",
		remoteId: "com.github.autermann.wps.streaming.TestAlgorithm"
	},
	init: function(idx, appender) {
		if (idx < 2) throw new Error("Boring!");
		this.idx = idx;
		this.appender = appender;
	},
	litA: function(i) {
		return new Streaming.Input.Data("a", new Streaming.Data.Literal("xs:long", i));
	},
	litB: function(i) {
		return new Streaming.Input.Data("b", new Streaming.Data.Literal("xs:long", i));
	},
	refA: function(i) {
		return new Streaming.Input.Reference("a", this.idAt(i), "result");
	},
	refB: function(i) {
		return new Streaming.Input.Reference("b", this.idAt(i), "result");
	},
	idAt: function(i) {
		return "urn:stream:fib:" + i;
	},
	createMessage: function(i, a, b) {
		return new Streaming.Message.Input({
			messageId: this.idAt(i),
			inputs: [ a, b ]
		});
	},
	start: function() {
		var self = this;
		self.appender.reset();
		Streaming.Client.start(self.options, function(processInfo) {
			self.appender.outgoing({
				message: processInfo.executeRequest,
				xml: processInfo.executeRequestXML
			});
			self.appender.incoming({
				message: processInfo.executeResponse,
				xml: processInfo.executeResponseXML
			});
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
	send: function() {
		this.client.listen().stopAfter(this.idx-1);
		for (var i = this.idx; i > 1; i--) {
			this.client.send(this.createMessage(i, this.refA(i-2), this.refB(i-1)));
		}

		this.client.send(this.createMessage(1, this.litA(0), this.litB(1)));
		this.client.send(this.createMessage(0, this.litA(0), this.litB(0)));
	}
});