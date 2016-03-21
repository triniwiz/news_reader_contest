import {FeedsViewModel} from '../../shared/view-models/feeds-view-model';
import {Page} from 'ui/page';
import {EventData} from 'data/observable';
import { ItemEventData } from "ui/list-view";
import {Navigation} from '../../shared/navigation';
let nav = new Navigation();
let feedsVM: FeedsViewModel;
let page;
export function navigatingTo(args: EventData) {
    page = <Page>args.object;
 
    if (!feedsVM) {
        feedsVM = new FeedsViewModel();
        page.bindingContext = feedsVM;
    }
   
}
export function navigatedTo(){
     let repeater = page.getViewById("repeater");
      repeater.animate({
            opacity: 0
        });
      feedsVM.getNews().then(()=>{
        repeater.animate({
            opacity: 1,
            duration: 1000
        });
    })
}  
export function goToItem(args: ItemEventData) {
    let item = args.view.bindingContext;
    nav.goToItem({ id: item.id, title: item.title });
}