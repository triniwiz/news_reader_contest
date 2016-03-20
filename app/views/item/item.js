"use strict";
var item_view_model_1 = require('../../shared/view-models/item-view-model');
var frame = require('ui/frame');
var itemVM;
var page;
var context;
var scrollView;
function navigatingTo(args) {
    page = args.object;
    context = page.navigationContext;
    scrollView = page.getViewById("scrollView");
    itemVM = new item_view_model_1.ItemViewModel(context.id, context.title);
    page.bindingContent = itemVM;
    itemVM.load().then(function (view) {
        scrollView.content = view;
    });
}
exports.navigatingTo = navigatingTo;
function goBack() {
    frame.topmost().goBack();
}
exports.goBack = goBack;
