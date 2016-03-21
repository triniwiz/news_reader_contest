"use strict";
var item_view_model_1 = require('../../shared/view-models/item-view-model');
var frame = require('ui/frame');
var utils = require("utils/utils");
var label_1 = require('ui/label');
var viewModule = require('ui/core/view');
var gestures = require('ui/gestures');
var gesterHelper = require('../../shared/gestureHelper');
var itemVM;
var page;
var context;
var scrollView;
function navigatingTo(args) {
    page = args.object;
    context = page.navigationContext;
    scrollView = page.getViewById("scrollView");
    itemVM = new item_view_model_1.ItemViewModel(context.id, context.title);
    itemVM.load().then(function (view) {
        scrollView.content = view;
        viewModule.eachDescendant(view, function (child) {
            if (child instanceof label_1.Label) {
                child.on(gestures.GestureTypes.tap, linkTap);
            }
            return true;
        });
    });
}
exports.navigatingTo = navigatingTo;
function navigatedTo() {
    page.bindingContext = itemVM;
}
exports.navigatedTo = navigatedTo;
function goBack() {
    frame.topmost().goBack();
}
exports.goBack = goBack;
function linkTap(args) {
    var urls = args.object.bindingContext;
    var charIndex = gesterHelper.getCharIndexAtTouchPoint(args);
    if (Boolean(urls)) {
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            if (charIndex >= url.start && charIndex < url.start + url.length) {
                console.log(url);
                switch (url.platform) {
                    case "newsapps":
                        frame.topmost().navigate({
                            moduleName: "views/item/item",
                            context: {
                                id: url.href
                            }
                        });
                        break;
                    case "highweb":
                    case "enhancedmobile":
                        utils.openUrl(url.href);
                        break;
                    default:
                        console.log("Unknown URL Platform " + url.platform);
                        break;
                }
                return;
            }
        }
    }
}
exports.linkTap = linkTap;
