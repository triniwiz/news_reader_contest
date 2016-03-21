"use strict";
var http = require('http');
var observable_1 = require('data/observable');
var application = require('application');
var moment = require('moment');
var imageCacheModule = require("ui/image-cache");
var imageSource = require("image-source");
var FeedsViewModel = (function (_super) {
    __extends(FeedsViewModel, _super);
    function FeedsViewModel() {
        _super.call(this);
        this.set("feeds", []);
        this.set("isLoading", false);
    }
    FeedsViewModel.prototype.getNews = function () {
        var _this = this;
        this.set("isLoading", true);
        return new Promise(function (resolve, reject) {
            http.getJSON('http://trevor-producer-cdn.api.bbci.co.uk/content/cps/news/world')
                .then(function (response) {
                var items = response.relations.map(function (item) {
                    var feed = {
                        id: item.content.id,
                        title: item.content.shortName,
                        image: null,
                        category: null,
                        lastUpdated: item.content.lastUpdated
                    };
                    item.content.relations.forEach(function (element) {
                        if (element.primaryType === "bbc.mobile.news.image" && element.secondaryType === "bbc.mobile.news.placement.index") {
                            feed.image = element.content.href;
                        }
                        else if (element.primaryType === "bbc.mobile.news.collection") {
                            feed.category = {
                                id: element.content.id,
                                name: element.content.name
                            };
                        }
                    });
                    return feed;
                });
                resolve();
                _this.set("feeds", items);
                _this.set("isLoading", false);
            }, function (err) {
                reject(err);
            });
        });
    };
    return FeedsViewModel;
}(observable_1.Observable));
exports.FeedsViewModel = FeedsViewModel;
application.resources = {
    fromNow: function (date, format) {
        return moment(new Date(date)).fromNow();
    },
    loadImage: function (url) {
        var cache = new imageCacheModule.Cache();
        var defaultImageSource = imageSource.fromFileOrResource('~/app/assets/no_image.png');
        var defaultNotFoundImageSource = imageSource.fromFile('~/app/assets/loading.gif');
        //cache.invalid = defaultNotFoundImageSource;
        cache.placeholder = defaultImageSource;
        cache.maxRequests = 5;
        //	cache.enableDownload();
        var imgSource;
        // Try to read the image from the cache
        var image = cache.get(url);
        if (image) {
            // If present -- use it.
            return imageSource.fromNativeSource(image);
        }
        else {
            // If not present -- request its download.
            cache.push({
                key: url,
                url: url,
                completed: function (image, key) {
                    if (url === key) {
                        return imageSource.fromNativeSource(image);
                    }
                }
            });
        }
    }
};
