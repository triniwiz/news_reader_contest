"use strict";
var feeds_view_model_1 = require('../../shared/view-models/feeds-view-model');
var navigation_1 = require('../../shared/navigation');
var nav = new navigation_1.Navigation();
var feedsVM;
var page;
function navigatingTo(args) {
    page = args.object;
    if (!feedsVM) {
        feedsVM = new feeds_view_model_1.FeedsViewModel();
        page.bindingContext = feedsVM;
    }
}
exports.navigatingTo = navigatingTo;
function navigatedTo() {
    var repeater = page.getViewById("repeater");
    repeater.animate({
        opacity: 0
    });
    feedsVM.getNews().then(function () {
        repeater.animate({
            opacity: 1,
            duration: 1000
        });
    });
}
exports.navigatedTo = navigatedTo;
function goToItem(args) {
    var item = args.view.bindingContext;
    nav.goToItem({ id: item.id, title: item.title });
}
exports.goToItem = goToItem;
