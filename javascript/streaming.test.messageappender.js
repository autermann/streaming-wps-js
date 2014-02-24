(function() {

	var entities = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};

	function escapeXML(string) {
		return string.replace(/[&<>"'\/]/g, function (s) {
			return entities[s];
		});
	}
	window.MessageAppender = Class.extend({
		init: function(incoming, outgoing) {
			this.$incoming = $(incoming);
			this.$outgoing = $(outgoing);
			if (!this.$incoming.attr("id")){
				this.$incoming.attr("id", "container" + this.containerId++);
			}
			if (!this.$outgoing.attr("id")){
				this.$outgoing.attr("id", "container" + this.containerId++);
			}
			this.reset();
		},
		reset: function() {
			this.$incoming.children().remove();
			this.$outgoing.children().remove();
			this.panelId = 0;
		},
		outgoing: function(e) {
			this._append(this.$outgoing, this._options(e));
		},
		incoming: function(e) {
			this._append(this.$incoming, this._options(e));
		},
		_options: function(e) {
			var i, title, type, reply, relatedMessages;
			if (e.message instanceof Streaming.Message.Output) {
				relatedMessages = e.message.getRelatedMessages();
				reply = null;
				for (i = 0; i < relatedMessages.length; ++i) {
					if (typeof relatedMessages[i] === "string") {
						reply = relatedMessages[i];
					} else if (relatedMessages[i].type === "http://www.w3.org/2005/08/addressing/reply") {
						reply = relatedMessages[i].value;
					}
				}
				title = "Output Message";
				if (reply) {
					title += " in response to <code>" + reply + "</code>";
				}
				type = "success";
			} else if (e.message instanceof Streaming.Message.Input) {
				title = "Input Message <code>" + e.message.getID() + "</code>";
				type = "info";
			} else if (e.message instanceof Streaming.Message.Stop) {
				title = "Stop Message for <code>" + e.message.getProcessID() + "</code>";
				type = "warning";
			} else if (e.message instanceof Streaming.Message.Error) {
				title = "Error Message";
				type = "danger";
			} else if (e.message instanceof Streaming.Message.OutputRequest) {
				title = "Output Request Message for <code>" + e.message.getProcessID() + "</code>";
				type = "warning";
			} else if (e.message instanceof Streaming.WPS.ExecuteRequest) {
				title = "WPS Execute Request";
				type = "primary";
			} else if (e.message instanceof Streaming.WPS.ExecuteResponse) {
				title = "WPS Execute Response";
				type = "primary";
			} else {
				title = "Message";
				type = "default";
			}
			title += " (" + moment().format("HH:mm:ss.SSS") + ")";

			return { title: title, type: type, xml: e.xml };
		},



		_append: function(container, options) {


			var pid = "panel" + this.panelId++;
			var string = escapeXML(Streaming.Util.xml2string(options.xml));
			var content = prettyPrintOne(string, "xml", false);
			container
				.addClass("panel-group")
				.append($("<div>")
					.addClass("panel panel-" + options.type)
					.append($("<div>")
						.addClass("panel-heading")
						.append($("<h5>")
							.addClass("panel-title")
							.append($("<a>")
								.attr("href", "#" + pid)
								.attr("data-toggle", "collapse")
								.attr("data-parent", "#" + container.attr("id"))
								.html(options.title)
							)
						)
					)
					.append($("<div>")
						.attr("id", pid)
						.addClass("panel-collapse collapse")
						.append($("<pre>")
							.addClass("panel-body prettyprint lang-xml")
							.html(content)
						)
					)
				);
		}
	});
})();