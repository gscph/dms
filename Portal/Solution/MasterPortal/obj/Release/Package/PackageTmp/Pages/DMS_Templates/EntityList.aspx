﻿<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContent.master" AutoEventWireup="true" CodeBehind="EntityList.aspx.cs" Inherits="Site.Pages.DMS_Templates.EntiyList" %>

<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>
<%--<%@ OutputCache CacheProfile="EntityListDMS" %>--%>

<asp:Content ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/entity-list.css" rel="stylesheet" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="Breadcrumbs" runat="server">
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PageHeader" runat="server">
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="MainContent" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="EntityControls" runat="server">
    <script>
        DMS.Settings.User.Id = "<%: Html.AttributeLiteral(Html.PortalUser(), "contactid") %>";
        $(".navbar-right.toolbar-right").addClass("hidden");
    </script>
    <div id="loader">
        <span class="fa fa-spinner fa-spin fa-4x loader-color"></span>
    </div>
    <div id="mainContents" class="body-container">
        <h1 id="EntityListTitle" class="hidden">
            <adx:Property PropertyName="adx_title,adx_name" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
        </h1>
        <h1 class="hidden" id="webPageId">
            <adx:Property PropertyName="adx_webpageid" Editable="false" DataItem='<%$ CrmSiteMap: Current %>' runat="server" /></h1>
        <div class="notifications "></div>
        <div class="box box-primary">
            <div class="box-body">
                <div class="chart">
                    <adx:EntityList ID="EntityListControl"
                        runat="server"
                        ListCssClass="table table-hover table-striped table-condensed"
                        DefaultEmptyListText="There are no items to display."
                        ClientIDMode="Static"
                        LanguageCode="<%$ SiteSetting: Language Code, 0 %>"
                        PortalName="<%$ SiteSetting: Language Code %>" />
                </div>
            </div>
        </div>
    </div>
    <script src="~/js/bootstrap-datetimepicker.min.js"></script>
    <script src="~/js/dms/multi-select.js"></script>
    <script src="~/js/dms/custom-filter.js"></script>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="ContentBottom" runat="server">
    <!--<img src="dist/img/user2-160x160.jpg" class="img-circle" alt="User Image">-->
    <div class="footer">
        <div class="pull-left footer-left">
            <%--<div class="userlist">--%>
        </div>
        <div class="pull-right footer-right">
        </div>
    </div>
</asp:Content>
<asp:Content ID="Content10" ContentPlaceHolderID="Scripts" runat="server">
    <script src="~/js/dms/entity-list.js"></script>
    <script src="~/js/dms/edit-on-doubleclick.js"></script>
    <script src="~/js/dms/bulk-delete.js"></script>
    <script src="~/js/dms/update-statuscode.js"></script>
    <script src="~/js/dms/custom-button.js"></script>
    <script>
        $(document).on("loaded", function () {
            if ($("table th:last-child").html().indexOf("Global") > 0)
                $("table th:last-child, td:last-child").hide();

            var webPageId = $("#webPageId span").html();
            var guidEmpty = "00000000-0000-0000-0000-000000000000";

            var service = DMS.Service("GET", "~/api/Service/GetPrivilages",
               { webPageId: webPageId, recordOwnerId: guidEmpty, OwningBranchId: guidEmpty, salesExecutiveId: guidEmpty }, DMS.Helpers.DefaultErrorHandler, null);

            service.then(function (response) {
                DMS.Settings.Permission = response;

                if (response === null) return;
                if (DMS.Settings.Permission.Read === null) return;

                if (DMS.Settings.Permission.Read === false) return;

                if (DMS.Settings.Permission.Create === false) {
                    $(".toolbar-right").find("button, a").each(function () {
                        var text = $(this).html();
                        if (text.indexOf("NEW") >= 0) {
                            $(this).remove();
                        }
                    });
                }

                if (DMS.Settings.Permission.Update == false) {
                    $(".toolbar-right").find("button, a").each(function () {
                        var text = $(this).html();
                        if (text.indexOf("NEW") === -1 && text.indexOf("DELETE") === -1 && text.indexOf("REMOVE") === -1 && text.indexOf("EXPORT") === -1) {
                            $(this).remove();
                        }
                    });
                }

                if (DMS.Settings.Permission.Delete === false) {
                    $(".btn.delete").remove();
                }

                $(".navbar-right.toolbar-right").removeClass("hidden");
            });
        });

    </script>
</asp:Content>
