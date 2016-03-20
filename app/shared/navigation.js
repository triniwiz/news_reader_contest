"use strict";
var frame = require('ui/frame');
var Navigation = (function () {
    function Navigation() {
    }
    Navigation.prototype.startPage = function () {
        return 'views/feeds/feeds';
    };
    Navigation.prototype.goToItem = function (data) {
        frame.topmost().navigate({
            moduleName: "views/item/item",
            context: {
                id: data.id,
                title: data.title
            }
        });
    };
    return Navigation;
}());
exports.Navigation = Navigation;
