$(document).ready(function () {
    var webRoleId = DMS.Settings.User.webRoleId;

    $("div.entity-grid.subgrid").each(function (a, b) {
        var entityName = $(this).data("view-layouts")[0].Configuration.EntityName;
        var toolBar = $(this).find(".grid-actions");

        var service = DMS.Service("GET", "~/api/Service/GetEntityGridPrivilages",
      { webRoleId: webRoleId, entityName: entityName }, DMS.Helpers.DefaultErrorHandler, null);

        service.then(function (response) {
            if (response === null) return;
            if (response.Read === null) return;

            if (response.Read === false) {
                return;
            }

            if (response.Update === false) {
                toolBar.find("button, a").each(function () {
                    var text = $(this).html();
                    if (text.indexOf("ADD") === -1 && text.indexOf("DELETE") === -1 && text.indexOf("REMOVE") === -1 && text.indexOf("EXPORT") == -1) {
                        $(this).remove();
                    }
                });
            }

            if (response.Delete === false) {
                toolBar.find("button, a").each(function () {
                    var text = $(this).html();
                    if (text.indexOf("DELETE") > -1 || text.indexOf("REMOVE") > -1) {
                        $(this).remove();
                    }
                });
            }

            toolBar.removeClass("hidden");
        });
    });
});