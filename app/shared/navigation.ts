import frame = require('ui/frame');
export class Navigation {
    startPage() {
        return 'views/feeds/feeds'
    }
    goToItem(data: any) {
        frame.topmost().navigate({
            moduleName: "views/item/item",
            context: {
                id: data.id,
                title: data.title
            }
        });
    }
}