import {ItemViewModel} from '../../shared/view-models/item-view-model';
import {Page, NavigatedData} from 'ui/page';
import {EventData} from 'data/observable';
import frame = require('ui/frame');
import { ScrollView } from "ui/scroll-view";
let itemVM: ItemViewModel;
let page;
let context;
let scrollView
export function navigatingTo(args: NavigatedData) {
	page = <Page>args.object;
	context = page.navigationContext;
	scrollView = page.getViewById<ScrollView>("scrollView");
	itemVM = new ItemViewModel(context.id, context.title);
	page.bindingContent = itemVM;
	itemVM.load().then((view) => {
		scrollView.content = view;
	})
}

export function goBack() {
	frame.topmost().goBack();
}