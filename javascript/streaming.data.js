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
})(window.Streaming||(window.Streaming = {}));