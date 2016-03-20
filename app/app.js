"use strict";
var application = require("application");
var navigation_1 = require("./shared/navigation");
var navigation = new navigation_1.Navigation();
if (application.android) {
    application.onLaunch = function (intent) {
        com.facebook.drawee.backends.pipeline.Fresco.initialize(application.android.context);
    };
}
application.start({ moduleName: navigation.startPage() });
