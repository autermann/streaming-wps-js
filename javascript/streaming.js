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
})(window.Streaming||(window.Streaming = {}));