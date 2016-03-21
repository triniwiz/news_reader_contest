"use strict";
var xml = require("xml");
var stack_layout_1 = require("ui/layouts/stack-layout");
var label_1 = require("ui/label");
var enums = require("ui/enums");
var span_1 = require("text/span");
var color_1 = require("color");
var formatted_string_1 = require("text/formatted-string");
var http = require('http');
var nativescript_videoplayer_1 = require('nativescript-videoplayer');
var fresco_1 = require('fresco/fresco');
var web_view_1 = require('ui/web-view');
var ParserHelper = (function () {
    function ParserHelper() {
    }
    ParserHelper.getImageSource = function (id) {
        for (var index = 0; index < ParserHelper.relations.images.length; index++) {
            var current = ParserHelper.relations.images[index];
            if (current.primaryType === 'bbc.mobile.news.image' && current.content.id === id) {
                return current.content.href;
            }
        }
    };
    ParserHelper.getVideoSource = function (id) {
        for (var index = 0; index < ParserHelper.relations.videos.length; index++) {
            var current = ParserHelper.relations.videos[index];
            if (current.primaryType === 'bbc.mobile.news.video' && current.content.id === id) {
                return { id: current.content.externalId, image: current.content.relations[0].content.href };
            }
        }
    };
    ParserHelper.handleStartElement = function (elementName, attr) {
        var structureTop = ParserHelper.structure[ParserHelper.structure.length - 1];
        switch (elementName) {
            case "body":
                ParserHelper.structure = [];
                var body = new stack_layout_1.StackLayout();
                body.orientation = enums.Orientation.vertical;
                body.cssClass = "Container";
                ParserHelper.structure.push(body);
                break;
            case "paragraph":
                var paragraph = new label_1.Label();
                paragraph.textWrap = true;
                if (attr && attr.role === "introduction") {
                    paragraph.cssClass = "Header";
                }
                else {
                    paragraph.cssClass = "Paragraph";
                }
                paragraph.formattedText = new formatted_string_1.FormattedString();
                ParserHelper.structure.push(paragraph);
                break;
            case "caption":
                ParserHelper.captionIn = false;
                break;
            case "url":
                var url = ParserHelper.urls[ParserHelper.urls.length - 1];
                url.platform = attr.platform;
                url.href = attr.href;
                url.length = attr.href.length;
                break;
            case "image":
                var image = new fresco_1.FrescoDrawee();
                if (ParserHelper.getImageSource(attr.id).indexOf('line') > -1) {
                    //image.height = 150;
                    image.imageUri = ParserHelper.getImageSource(attr.id);
                    image.stretch = enums.Stretch.aspectFill;
                    //image.cssClass = "Image";
                    ParserHelper.structure.push(image);
                }
                else {
                    image.height = 150;
                    image.imageUri = ParserHelper.getImageSource(attr.id);
                    image.stretch = enums.Stretch.aspectFill;
                    image.cssClass = "Image";
                    ParserHelper.structure.push(image);
                }
                /*let image = new Image();
                image.stretch = enums.Stretch.aspectFill;
                image.height = 150;
                image.src = ParserHelper.getContentSource(attr.id, "image");*/
                /*function loadImage(url) {
                    let cache = new imageCacheModule.Cache();
                    let defaultImageSource = imageSource.fromFile('~/app/assets/no_image.png');
                    let defaultNotFoundImageSource =imageSource.fromFile('~/app/assets/loading.gif');
                    cache.invalid = defaultNotFoundImageSource;
                    cache.placeholder = defaultImageSource;
                    
                    cache.maxRequests = 5;
                    //cache.enableDownload();
                    let imgSource;
                    // Try to read the image from the cache
                    let image = cache.get(url);
                    if (image) {
                        // If present -- use it.
                        return imageSource.fromNativeSource(image);
                    }
                    else {
                        // If not present -- request its download.
                        cache.push({
                            key: url,
                            url: url,
                            completed: function(image, key) {
                                console.log(image)
                                if (url === key) {
                                    return imageSource.fromNativeSource(image);
                                }
                            }
                        });
                    }
                }*/
                //ParserHelper.structure.push(image);
                break;
            case "video":
                var videoData_1 = ParserHelper.getVideoSource(attr.id);
                // VideoPlayer
                var video_1 = new nativescript_videoplayer_1.Video();
                video_1.cssClass = "Video";
                video_1.height = 300;
                //WebView
                var webview_1 = new web_view_1.WebView();
                webview_1.cssClass = "Video";
                webview_1.height = 300;
                http.getJSON("http://open.live.bbc.co.uk/mediaselector/5/select/version/2.0/format/json/mediaset/journalism-http-tablet/vpid/" + videoData_1.id + "/proto/http/transferformat/hls/")
                    .then(function (res) {
                    video_1.src = res.media[0].connection[0].href;
                    webview_1.src = "<video width='100%' poster=\"" + videoData_1.image + "\" controls>\n\t\t\t\t\t<source src='" + res.media[0].connection[0].href + "' >\n\t\t\t\t\t</video>";
                    ParserHelper.structure.push(webview_1); // not working 
                    //	ParserHelper.structure.push(video);
                });
                break;
            case "link":
                if (!ParserHelper.urls) {
                    ParserHelper.urls = [];
                }
                var link = new span_1.Span();
                link.underline = 1;
                link.foregroundColor = new color_1.Color("#2196F3");
                ParserHelper.structure.push(link);
                ParserHelper.urls.push({ start: structureTop.formattedText.toString().length });
                break;
            case "list":
                var list = new stack_layout_1.StackLayout();
                list.cssClass = "List";
                list.orientation = enums.Orientation.vertical;
                ParserHelper.structure.push(list);
                break;
            case "listItem":
                var bullet = new span_1.Span();
                bullet.text = "●  ";
                var label = new label_1.Label();
                label.textWrap = true;
                label.cssClass = "ListItem";
                label.formattedText = new formatted_string_1.FormattedString();
                label.formattedText.spans.push(bullet);
                ParserHelper.structure.push(label);
                break;
            case "bold":
                var bold = void 0;
                if (structureTop instanceof span_1.Span) {
                    bold = structureTop;
                }
                else {
                    bold = new span_1.Span();
                }
                bold.fontAttributes = bold.fontAttributes | enums.FontAttributes.Bold;
                ParserHelper.structure.push(bold);
                break;
            case "italic":
                var italic = void 0;
                if (structureTop instanceof span_1.Span) {
                    italic = structureTop;
                }
                else {
                    italic = new span_1.Span();
                }
                italic.fontAttributes = italic.fontAttributes | enums.FontAttributes.Italic;
                ParserHelper.structure.push(italic);
                break;
            case "crosshead":
                var crosshead = new label_1.Label();
                crosshead.textWrap = true;
                crosshead.cssClass = "CrossHead";
                crosshead.formattedText = new formatted_string_1.FormattedString();
                ParserHelper.structure.push(crosshead);
                break;
            default:
                console.log("UNKNOWN TAG " + elementName);
                break;
        }
    };
    ParserHelper.handleText = function (text) {
        if (text.trim() === "")
            return;
        var structureTop = ParserHelper.structure[ParserHelper.structure.length - 1];
        if (structureTop instanceof label_1.Label) {
            var span = new span_1.Span();
            span.text = text;
            structureTop.formattedText.spans.push(span);
        }
        else if (structureTop instanceof span_1.Span) {
            structureTop.text = text;
            if (ParserHelper.captionIn) {
            }
        }
        else {
            console.log("UNKNOWN TOP", structureTop);
        }
    };
    ParserHelper.handleEndElement = function (elementName) {
        switch (elementName) {
            case "body":
                break;
            case "paragraph":
            case "listItem":
            case "crosshead":
                var label = ParserHelper.structure.pop();
                ParserHelper.structure[ParserHelper.structure.length - 1].addChild(label);
                break;
            case "image":
                var image = ParserHelper.structure.pop();
                ParserHelper.structure[ParserHelper.structure.length - 1].addChild(image);
                break;
            /*case "video":
                let webview: WebView = ParserHelper.structure.pop();
                (<StackLayout>ParserHelper.structure[ParserHelper.structure.length - 1]).addChild(webview);
                
                let video: Video = ParserHelper.structure.pop();
                (<StackLayout>ParserHelper.structure[ParserHelper.structure.length - 1]).addChild(video);
                
                break;*/
            case "italic":
            case "bold":
            case "link":
                if (ParserHelper.structure[ParserHelper.structure.length - 1] instanceof span_1.Span) {
                    var link = ParserHelper.structure.pop();
                    ParserHelper.structure[ParserHelper.structure.length - 1].formattedText.spans.push(link);
                    if (ParserHelper.urls) {
                        ParserHelper.structure[ParserHelper.structure.length - 1].bindingContext = ParserHelper.urls.slice();
                        ParserHelper.urls = null;
                    }
                }
                break;
            case "caption":
                ParserHelper.captionIn = false;
                break;
            case "list":
                var list = ParserHelper.structure.pop();
                ParserHelper.structure[ParserHelper.structure.length - 1].addChild(list);
                break;
        }
    };
    ParserHelper.startParsing = function (event) {
        switch (event.eventType) {
            case xml.ParserEventType.StartElement:
                ParserHelper.handleStartElement(event.elementName, event.attributes);
                break;
            case xml.ParserEventType.Text:
                ParserHelper.handleText(event.data);
                break;
            case xml.ParserEventType.EndElement:
                ParserHelper.handleEndElement(event.elementName);
                break;
        }
    };
    ParserHelper.structure = [];
    ParserHelper.captionIn = false;
    return ParserHelper;
}());
exports.ParserHelper = ParserHelper;
