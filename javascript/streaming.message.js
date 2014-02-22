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
	Streaming.Message = Class.extend({
		processId: null,
		messageId: null,
		action: null,
		xmlBuilder: null,
		relatedMessages: null,
		init: function(options) {
			options = options || {};
			this.action = options.action;
			this.messageId = options.messageId || "uuid:" + Streaming.Util.uuid();
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
		setProcessID: function(processId) {
			this.processId = processId;
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
			options = options || {};
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
			options = options || {};
			options.action = "https://github.com/autermann/streaming-wps/request-output";
			this._super(options);
		},
		toXML: function() {
			return this.xmlBuilder.encodeOutputRequestMessage(this);
		}
	});

	Streaming.Message.Error = Streaming.Message.extend({
		init: function(options) {
			options = options || {};
			options.action = "https://github.com/autermann/streaming-wps/error";
			this._super(options);
			this.exceptions = options.exceptions;
		},
		toXML: function() {
			return this.xmlBuilder.encodeErrorMessage(this);
		},
		getExceptions: function() {
			return this.exceptions;
		}
	});

	Streaming.Message.Output = Streaming.Message.extend({
		init: function(options) {
			options = options || {};
			options.action = "https://github.com/autermann/streaming-wps/output";
			this._super(options);
			this.outputs = options.outputs;
		},
		getOutputs: function() {
			return this.outputs;
		}
	});

	Streaming.Message.Stop = Streaming.Message.extend({
		init: function(options) {
			options = options || {};
			options.action = "https://github.com/autermann/streaming-wps/stop";
			this._super(options);
		},
		toXML: function() {
			return this.xmlBuilder.encodeStopMessage(this);
		}
	});
})(window.Streaming||(window.Streaming = {}));
