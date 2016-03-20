"use strict";
var http = require('http');
var observable_1 = require('data/observable');
var xml = require("xml");
var parserHelper_1 = require('../parserHelper');
var ItemViewModel = (function (_super) {
    __extends(ItemViewModel, _super);
    function ItemViewModel(id, title) {
        _super.call(this);
        this.set("isLoading", false);
        this.set("item", {});
        this.set("id", id);
        this.set("title", title);
    }
    ItemViewModel.prototype.load = function () {
        var _this = this;
        this.set("isLoading", true);
        return new Promise(function (resolve, reject) {
            http.getJSON("http://trevor-producer-cdn.api.bbci.co.uk/content" + _this.get("id"))
                .then(function (response) {
                var parser = new xml.XmlParser((parserHelper_1.ParserHelper.startParsing), function (error) { console.log(error); });
                parserHelper_1.ParserHelper.relations = response.relations;
                parser.parse(response.body);
                _this.set("title", response.shortName);
                _this.set("isLoading", false);
                resolve(parserHelper_1.ParserHelper.structure[0]);
            }, function (error) {
                reject(error);
            });
        });
    };
    return ItemViewModel;
}(observable_1.Observable));
exports.ItemViewModel = ItemViewModel;
