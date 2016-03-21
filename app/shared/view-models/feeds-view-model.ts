import http = require('http');
import {Observable} from 'data/observable';
import application = require('application');
import moment = require('moment');
import imageCacheModule = require("ui/image-cache");
import imageSource = require("image-source");
import fs = require("file-system");
export class FeedsViewModel extends Observable {
	constructor() {
		super();
		this.set("feeds", []);
		this.set("isLoading", false);
	}

	public getNews(): Promise<any> {
		this.set("isLoading", true);
		return new Promise((resolve, reject) => {
			http.getJSON('http://trevor-producer-cdn.api.bbci.co.uk/content/cps/news/world')
				.then((response: any) => {
					let items = response.relations.map(item => {
						let feed = {
							id: item.content.id,
							title: item.content.shortName,
							image: null,
							category: null,
							lastUpdated: item.content.lastUpdated
						};
						item.content.relations.forEach((element: any) => {

							if (element.primaryType === "bbc.mobile.news.image" && element.secondaryType === "bbc.mobile.news.placement.index") {
								feed.image = element.content.href;
							}
							else if (element.primaryType === "bbc.mobile.news.collection") {
								feed.category = {
									id: element.content.id,
									name: element.content.name
								};
							}
						})
						return feed;
					});
					resolve();
					this.set("feeds", items);
					this.set("isLoading", false);
				}, (err) => {
					reject(err);
				})
		})


	}
}



application.resources = {
	fromNow: function(date, format) {
		return moment(new Date(date)).fromNow()
	},
	loadImage: function(url) {
		let cache = new imageCacheModule.Cache();
		let defaultImageSource = imageSource.fromFileOrResource('~/app/assets/no_image.png');
		let defaultNotFoundImageSource = imageSource.fromFile('~/app/assets/loading.gif');
		//cache.invalid = defaultNotFoundImageSource;
		cache.placeholder = defaultImageSource;
		cache.maxRequests = 5;
		//	cache.enableDownload();
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
					if (url === key) {
						return imageSource.fromNativeSource(image);
					}
				}
			});
		}
	}
}
