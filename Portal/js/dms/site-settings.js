if (typeof jQuery === "undefined") {
    throw new Error("DMS Site Settings requires jQuery");
}

var Settings = function (Helpers) {
    var settings = {}
    var forceLoad;
    if (typeof Helpers === "undefined") {
        throw new Error("site-settings.js requires Helper class");
    }

    settings.Branch = {
        allowDraftPrinting: Helpers.ReadCookie("allowDraftPrinting"),
        usertoActivate: Helpers.ReadCookie("usertoActivate"),
        managertoActivate: Helpers.ReadCookie("managertoActivate"),
        branchtoActivate: Helpers.ReadCookie("branchtoActivate")
    }

    settings.User = {
        Id : null,
        branch: Helpers.ReadCookie("branch"),
        branchId: Helpers.ReadCookie("branchId"),
        dealer: Helpers.ReadCookie("dealer"),
        dealerId: Helpers.ReadCookie("dealerId"),
        reportsTo: Helpers.ReadCookie("userReportsTo"),
        positionId: Helpers.ReadCookie("positionId"),
        positionName: Helpers.ReadCookie("positionName"),
        webRole: Helpers.ReadCookie("webRoleName"),
        webRoleId: Helpers.ReadCookie("webRoleId"),
        dealerId: Helpers.ReadCookie("dealerid"),
        dealer: Helpers.ReadCookie("dealer"),
    }

    settings.Prospect = {
        getForceLoad : function () {
            return forceLoad;
        },
        setForceLoad: function (_forceLoad) {
            forceLoad = _forceLoad;
            return forceLoad;
        },
    }

    settings.Permission = {
        Read: null,
        Create: null,
        Update: null,
        Delete: null,
        Append: null,
        AppendTo: null
    }

    return settings;
}
