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
	Streaming.WPS = Streaming.WPS || {};

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

	Streaming.WPS.Exception = Class.extend({
		init: function(code, locator, messages) {
			this.code = code;
			this.locator = locator;
			this.messages = messages || [];
		},
		getCode: function() {
			return this.code;
		},
		getLocator: function() {
			return this.locator;
		},
		getMessages: function() {
			return this.messages;
		}
	});

	Streaming.WPS.ExceptionReport = Class.extend({

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

	Streaming.WPS.ResponseForm = Class.extend({});

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
})(window.Streaming||(window.Streaming = {}));