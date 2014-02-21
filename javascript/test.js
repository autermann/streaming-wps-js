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
var message = new Streaming.Message.Input({
	processId: "uuid:" + Streaming.Util.uuid(),
	relatedMessages: [
		"uuid:" + Streaming.Util.uuid(),
		{
			type: "myRelationShipType",
			value: "uuid:" + Streaming.Util.uuid()
		}
	],
	inputs: [
		new Streaming.Input.Reference("id1", "message1", "outid1"),
		new Streaming.Input.Reference("id2", "message1", "outid2"),
		new Streaming.Input.Data("id3", new Streaming.Data.Literal("xs:int", 42, "m")),
		new Streaming.Input.Data("id4", new Streaming.Data.Complex({mimeType:"text/xml"},"<a>b</a>")),
		new Streaming.Input.Data("id5", new Streaming.Data.Complex({mimeType:"text/bla"},"a<asd1239>76n4p7 asvs</01239>>")),
		new Streaming.Input.Data("id6", new Streaming.Data.Reference({href:"http://example.com",headers:{"Accept":"text/bla"},format:{mimeType:"text/bla"}})),
		new Streaming.Input.Data("id7", new Streaming.Data.BoundingBox([1,2],[3,4], "EPSG:4326", 2))
	]
});


var executeRequest = new Streaming.WPS.ExecuteRequest({
	processId: "processId",
	inputs: [],
	outputs: new Streaming.WPS.ResponseDocument({
		definitons: [
			new Streaming.WPS.OutputDefinition({
				id: "output1",
				format: {mimeType: "text/xml"},
				asReference: true
			}),
			new Streaming.WPS.OutputDefinition({
				id: "output1",
				uom: "m"
			})
		]
	})
});
var executeRequest2 = new Streaming.WPS.ExecuteRequest({
	processId: "processId",
	inputs: [
		new Streaming.WPS.Input("id3", new Streaming.Data.Literal("xs:int", 42, "m")),
		new Streaming.WPS.Input("id4", new Streaming.Data.Complex({mimeType:"text/xml"},"<a>b</a>")),
		new Streaming.WPS.Input("id5", new Streaming.Data.Complex({mimeType:"text/bla"},"a<asd1239>76n4p7 asvs</01239>>")),
		new Streaming.WPS.Input("id6", new Streaming.Data.Reference({href:"http://example.com",headers:{"Accept":"text/bla"},format:{mimeType:"text/bla"}})),
		new Streaming.WPS.Input("id7", new Streaming.Data.BoundingBox([1,2],[3,4], "EPSG:4326", 2))
	],
	outputs: new Streaming.WPS.RawDataOutput({
		id: "output1",
		format: {mimeType: "text/xml"}
	})
});


var messageString = vkbeautify.xml(Streaming.Util.xml2string(message.toXML()))
var executeRequestString1 = vkbeautify.xml(Streaming.Util.xml2string(message.toXML()))
var executeRequestString2 = vkbeautify.xml(Streaming.Util.xml2string(message.toXML()))
console.log(messageString);
console.log(executeRequestString1);
console.log(executeRequestString2);

var executeResponseString = "<wps:ExecuteResponse xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_response.xsd\" serviceInstance=\"http://localhost:12121/WebProcessingService?REQUEST=GetCapabilities&amp;SERVICE=WPS\" xml:lang=\"en-US\" service=\"WPS\" version=\"1.0.0\"><wps:Process wps:processVersion=\"1.0.0\"><ows:Identifier>com.github.autermann.wps.streaming.delegate.DelegatingStreamingAlgorithm</ows:Identifier><ows:Title>Delegating Streaming Algorithm</ows:Title></wps:Process><wps:Status creationTime=\"2014-02-20T14:51:12.380+01:00\"><wps:ProcessSucceeded>Process successful</wps:ProcessSucceeded></wps:Status><wps:ProcessOutputs><wps:Output><ows:Identifier>process-id</ows:Identifier><ows:Title>The Process ID</ows:Title><wps:Data><wps:LiteralData dataType=\"xs:anyURI\">uuid:12b0f626-6328-488d-8c69-a567bcaa863a</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>input-socket-uri</ows:Identifier><ows:Title>The Input WebSocket URI</ows:Title><wps:Data><wps:LiteralData dataType=\"xs:anyURI\">ws://localhost:12121/streaming</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>output-socket-uri</ows:Identifier><ows:Title>The Output WebSocket URI</ows:Title><wps:Data><wps:LiteralData dataType=\"xs:anyURI\">ws://localhost:12121/streaming</wps:LiteralData></wps:Data></wps:Output></wps:ProcessOutputs></wps:ExecuteResponse>";
var xml = Streaming.Util.string2xml(executeResponseString)

console.log(vkbeautify.xml(Streaming.Util.xml2string(xml)));

var parser = new Streaming.XML.Parser();
console.log(parser.parse(xml));