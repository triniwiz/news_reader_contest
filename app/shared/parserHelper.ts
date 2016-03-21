import xml = require("xml");
import { StackLayout } from "ui/layouts/stack-layout";
import { Label } from "ui/label";
import enums = require("ui/enums");
import { Span } from "text/span";
import { Image } from "ui/image";
import { Color } from "color";
import { FormattedString } from "text/formatted-string";
import http = require('http');
import {Video} from 'nativescript-videoplayer';
import imageCacheModule = require("ui/image-cache");
import imageSource = require("image-source");
import fileSystem = require("file-system");
import {FrescoDrawee} from 'fresco/fresco';
import {WebView} from 'ui/web-view';
export interface NewsUrl {
    start?: number;
    length?: number;
    href?: string;
    platform?: "highweb" | "newsapps" | "enhancedmobile";
}

export class ParserHelper {

	public static structure: Array<any> = [];
	public static relations: any;
	private static captionIn = false;
	private static urls: Array<NewsUrl>;

	private static getImageSource(id: string) {
		for (let index = 0; index < ParserHelper.relations.images.length; index++) {
			let current = ParserHelper.relations.images[index];
			if (current.primaryType === 'bbc.mobile.news.image' && current.content.id === id) {
				return current.content.href;
			}
		}
	}

	private static getVideoSource(id: string) {

		for (let index = 0; index < ParserHelper.relations.videos.length; index++) {
			let current = ParserHelper.relations.videos[index];
			if (current.primaryType === 'bbc.mobile.news.video' && current.content.id === id) {
				return { id: current.content.externalId, image: current.content.relations[0].content.href };
			}
		}

	}

	private static handleStartElement(elementName: string, attr: any) {
		let structureTop = ParserHelper.structure[ParserHelper.structure.length - 1];
		switch (elementName) {
			case "body":
				ParserHelper.structure = [];
				let body = new StackLayout();
				body.orientation = enums.Orientation.vertical;
				body.cssClass = "Container";
				ParserHelper.structure.push(body);
				break;
			case "paragraph":
				let paragraph = new Label();
				paragraph.textWrap = true;
				if (attr && attr.role === "introduction") {
                    paragraph.cssClass = "Header";
                }
                else {
                    paragraph.cssClass = "Paragraph";
                }
				paragraph.formattedText = new FormattedString();
				ParserHelper.structure.push(paragraph);
				break;
			case "caption":
				ParserHelper.captionIn = false;
				break;
			case "url":
				let url = ParserHelper.urls[ParserHelper.urls.length - 1];
				url.platform = attr.platform;
				url.href = attr.href;
				url.length = attr.href.length;
				break;
			case "image":
				let image = new FrescoDrawee();
				if (ParserHelper.getImageSource(attr.id).indexOf('line') > -1) {
					//image.height = 150;
					image.imageUri = ParserHelper.getImageSource(attr.id);
					image.stretch = enums.Stretch.aspectFill;
					//image.cssClass = "Image";
					ParserHelper.structure.push(image);
				} else {
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

				let videoData = ParserHelper.getVideoSource(attr.id);


				// VideoPlayer
				let video = new Video();
				video.cssClass = "Video";
				video.height = 300;


				//WebView
				let webview = new WebView();
				webview.cssClass = "Video";
				webview.height = 300;
					
					
					
				http.getJSON(`http://open.live.bbc.co.uk/mediaselector/5/select/version/2.0/format/json/mediaset/journalism-http-tablet/vpid/${videoData.id}/proto/http/transferformat/hls/`)
					.then((res: any) => {
						video.src = res.media[0].connection[0].href;
						webview.src = `<video width='100%' poster="${videoData.image}" controls>
					<source src='${res.media[0].connection[0].href}' >
					</video>`
				
					ParserHelper.structure.push(webview); // not working 
					//	ParserHelper.structure.push(video);
					})


				break;
			case "link":

				if (!ParserHelper.urls) {
					ParserHelper.urls = [];
				}
				let link = new Span();
				link.underline = 1;
				link.foregroundColor = new Color("#2196F3");
				ParserHelper.structure.push(link);
				ParserHelper.urls.push({ start: (<Label>structureTop).formattedText.toString().length });
				break;
			case "list":
				let list = new StackLayout();
				list.cssClass = "List";
				list.orientation = enums.Orientation.vertical;
				ParserHelper.structure.push(list);
				break;
			case "listItem":
				let bullet = new Span();
				bullet.text = "●  ";

				let label = new Label();
				label.textWrap = true;
				label.cssClass = "ListItem";
				label.formattedText = new FormattedString();
				label.formattedText.spans.push(bullet);

				ParserHelper.structure.push(label);
				break;
			case "bold":
				let bold: Span;
				if (structureTop instanceof Span) {
					bold = structureTop;
				} else {
					bold = new Span();
				}
				bold.fontAttributes = bold.fontAttributes | enums.FontAttributes.Bold;
				ParserHelper.structure.push(bold);
				break;
			case "italic":
				let italic: Span;
				if (structureTop instanceof Span) {
					italic = structureTop;
				} else {
					italic = new Span();
				}
				italic.fontAttributes = italic.fontAttributes | enums.FontAttributes.Italic;
				ParserHelper.structure.push(italic);
				break;
			case "crosshead":
				let crosshead = new Label();
				crosshead.textWrap = true;
				crosshead.cssClass = "CrossHead";
				crosshead.formattedText = new FormattedString();
				ParserHelper.structure.push(crosshead);
				break;
			default:
				console.log(`UNKNOWN TAG ${elementName}`)
				break;

		}
	}
	private static handleText(text: string) {
		if (text.trim() === "") return;
		let structureTop = ParserHelper.structure[ParserHelper.structure.length - 1];
		if (structureTop instanceof Label) {
			let span = new Span();
			span.text = text;
			(<Label>structureTop).formattedText.spans.push(span);
		} else if (structureTop instanceof Span) {
			(<Span>structureTop).text = text;
			if (ParserHelper.captionIn) {

			}
		} else {
            console.log("UNKNOWN TOP", structureTop);
        }
	}
	private static handleEndElement(elementName: string) {
		switch (elementName) {
			case "body":
				break;
			case "paragraph":
			case "listItem":
			case "crosshead":
				let label: Label = ParserHelper.structure.pop();
				(<StackLayout>ParserHelper.structure[ParserHelper.structure.length - 1]).addChild(label);
				break;
			case "image":
				let image: FrescoDrawee = ParserHelper.structure.pop();
				(<StackLayout>ParserHelper.structure[ParserHelper.structure.length - 1]).addChild(image);
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
                if (ParserHelper.structure[ParserHelper.structure.length - 1] instanceof Span) {
                    let link: Span = ParserHelper.structure.pop();
                    (<Label>ParserHelper.structure[ParserHelper.structure.length - 1]).formattedText.spans.push(link);
                    if (ParserHelper.urls) {
                        (<Label>ParserHelper.structure[ParserHelper.structure.length - 1]).bindingContext = ParserHelper.urls.slice();
                        ParserHelper.urls = null;
                    }
                }
                break;

            case "caption":
                ParserHelper.captionIn = false;
                break;

            case "list":
                let list: StackLayout = ParserHelper.structure.pop();
                (<StackLayout>ParserHelper.structure[ParserHelper.structure.length - 1]).addChild(list);
                break;

		}
	}


	public static startParsing(event: xml.ParserEvent) {
		switch (event.eventType) {
			case xml.ParserEventType.StartElement:
				ParserHelper.handleStartElement(event.elementName, event.attributes)
				break;
			case xml.ParserEventType.Text:
				ParserHelper.handleText(event.data);
				break;
			case xml.ParserEventType.EndElement:
				ParserHelper.handleEndElement(event.elementName);
				break;
		}
	}
}
