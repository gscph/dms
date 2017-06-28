$(document).ready(function () {
    var webRoleId = DMS.Settings.User.webRoleId;

    $("div.entity-grid.subgrid").each(function (a, b) {
        var entityName = $(this).data("view-layouts")[0].Configuration.EntityName;
        var recordOwnerId = $("#gsc_recordownerid").val();
        var OwningBranchId = $("#gsc_branchid").val();
        if (recordOwnerId == null || recordOwnerId == "undefined")
            recordOwnerId = "00000000-0000-0000-0000-000000000000";

        if (OwningBranchId == null || OwningBranchId == "undefined")
            OwningBranchId = "00000000-0000-0000-0000-000000000000";

        var toolBar = $(this).find(".grid-actions");

        var service = DMS.Service("GET", "~/api/Service/GetEntityGridPrivilages",
      { entityName: entityName, recordOwnerId: recordOwnerId, OwningBranchId: OwningBranchId }, DMS.Helpers.DefaultErrorHandler, null);

        service.then(function (response) {
            if (response === null) return;
            if (response.Read === null) return;

            if (response.Read === false) return;

            if (response.Create === false) {
                toolBar.find("button, a").each(function () {
                    var text = $(this).html();
                    if (text.indexOf("ADD") > -1 || text.indexOf("NEW") > -1) {
                        $(this).remove();
                    }
                });
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