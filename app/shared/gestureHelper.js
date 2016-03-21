"use strict";
function getCharIndexAtTouchPoint(args) {
    var motionEvent = args.android;
    var label = args.object;
    var layout = label.android.getLayout();
    var x = motionEvent.getX();
    var y = motionEvent.getY();
    if (layout) {
        var line = layout.getLineForVertical(y);
        var index = layout.getOffsetForHorizontal(line, x);
        return index;
    }
    return -1;
}
exports.getCharIndexAtTouchPoint = getCharIndexAtTouchPoint;
