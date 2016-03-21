import http = require('http');
import {Observable} from 'data/observable';
import xml = require("xml");
import {ParserHelper} from '../parserHelper';
import {View} from 'ui/core/view'
export class ItemViewModel extends Observable {
	constructor(id: string, title: string) {
		super();
		this.set("isLoading", false);
		this.set("item", {});
		this.set("id", id);
		this.set("title", title | "");
	}

	load(): Promise<View> {
		this.set("isLoading", true);
		return new Promise((resolve, reject) => {
			http.getJSON(`http://trevor-producer-cdn.api.bbci.co.uk/content${this.get("id") }`)
				.then((response: any) => {
					let parser = new xml.XmlParser((ParserHelper.startParsing), (error) => { console.log(error) })
					const images = response.relations.filter(item=>{
						return item.primaryType === 'bbc.mobile.news.image';
					});
					const videos = response.relations.filter(item=>{
						return item.primaryType === 'bbc.mobile.news.video';
					});
					
					ParserHelper.relations = {images,videos};
					parser.parse(response.body);
					this.set("title", response.shortName);
					this.set("isLoading", false);
					resolve(ParserHelper.structure[0]);
				}, (error) => {
					reject(error);
				})
		})
	}
}
