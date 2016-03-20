import application = require("application");
import {Navigation} from "./shared/navigation";
let navigation = new Navigation();
if (application.android) {
    application.onLaunch = function(intent) {
        com.facebook.drawee.backends.pipeline.Fresco.initialize(application.android.context);
    };
}
application.start({ moduleName: navigation.startPage() });
