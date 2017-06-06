/*! ADX custom dms-app.js
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
*/

var DMS = {};




if (typeof Helpers === "undefined") {
    throw new Error("dms-app.js requires helpers.js");
}

DMS.Helpers = Helpers;

if (typeof Settings === "undefined") {
    throw new Error("dms-app.js requires site-settings.js");
}

DMS.Settings = Settings(DMS.Helpers);

if (typeof Notification === "undefined") {
    throw new Error("dms-app.js requires notification.js");
}

DMS.Notification = Notification;

if (typeof Service === "undefined") {
    throw new Error("dms-app.js requires service.js");
}

DMS.Service = Service;

