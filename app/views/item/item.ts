import {ItemViewModel} from '../../shared/view-models/item-view-model';
import {Page, NavigatedData} from 'ui/page';
import {EventData} from 'data/observable';
import frame = require('ui/frame');
import { ScrollView } from "ui/scroll-view";
import utils = require("utils/utils");
import {Label} from 'ui/label';
import viewModule = require('ui/core/view');
import gestures = require('ui/gestures');
import gesterHelper = require('../../shared/gestureHelper');
let itemVM: ItemViewModel;
let page;
let context;
let scrollView
export function navigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    context = page.navigationContext;
    scrollView = page.getViewById<ScrollView>("scrollView");
    itemVM = new ItemViewModel(context.id, context.title);
    itemVM.load().then((view) => {
        scrollView.content = view;
        viewModule.eachDescendant(view, function(child) {
            if (child instanceof Label) {
                child.on(gestures.GestureTypes.tap, linkTap)
            }
            return true;
        })

    })
}

export function navigatedTo() {
     page.bindingContext = itemVM;
}
export function goBack() {
    frame.topmost().goBack();
}

export function linkTap(args) {
    let urls = args.object.bindingContext;
    let charIndex = gesterHelper.getCharIndexAtTouchPoint(args);
    if (Boolean(urls)) {
        for (let i = 0; i < urls.length; i++) {
            var url = urls[i];
            if (charIndex >= url.start && charIndex < url.start + url.length) {
                console.log(url)
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