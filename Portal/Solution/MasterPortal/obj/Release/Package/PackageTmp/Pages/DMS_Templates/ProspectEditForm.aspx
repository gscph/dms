﻿<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContent.master" AutoEventWireup="true" CodeBehind="ProspectEditForm.aspx.cs" Inherits="Site.Pages.DMS_Templates.ProspectEditForm" %>


<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>


<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/handsontable.full.min.css" rel="stylesheet" />
    <link href="~/css/dms/entity-form.css" rel="stylesheet" />
    <link href="~/css/dms/handsontable.bootstrap.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.css" rel="stylesheet" />
    <style>
        .no-border {
            border: none;
            margin-left: 0px;
            padding-left: 0px;
        }
    </style>
    <script>
        var userId = "<%: Html.AttributeLiteral(Html.PortalUser(), "contactid") %>";          
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Breadcrumbs" runat="server">
    <script>
        $('ul.breadcrumb li:nth-child(4)').html('..');
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PageHeader" runat="server">
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="MainContent" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="EntityControls" runat="server">
      <script>
          $(".navbar-right.toolbar-right").addClass("hidden");
    </script>
    <h1 class="hidden" id="webPageId">
        <adx:Property PropertyName="adx_webpageid" Editable="false" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
    </h1>

    <div id="loader">
        <span class="fa fa-spinner fa-spin fa-4x loader-color"></span>
    </div>
    <h1 id="EntityListTitle" class="hidden">
        <adx:Property PropertyName="adx_title,adx_name" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
    </h1>
    <script type="text/javascript">


        function entityFormClientValidate() {
            // Custom client side validation. Method is called by the submit button's onclick event.
            // Must return true or false. Returning false will prevent the form from submitting.   
            var button = $('<button type="button" class="close">&times;</button>');

            $(button).on('click', function () {
                $('#ValidationSummaryEntityFormView').hide();
            });

            setTimeout(function () {
                $('#ValidationSummaryEntityFormView').prepend(button);
            }, 500);

            setTimeout(function () {
                $('#ValidationSummaryEntityFormView').hide();
            }, 10000);

            return true;
        }
    </script>

    <div class="content-wrapper">
        <div id="mainContents" class="body-container">
            <div class="notifications"></div>
            <div id="currentPage"></div>
            <crm:CrmEntityDataSource ID="CurrentEntity" DataItem="<%$ CrmSiteMap: Current %>" runat="server" />
            <!-- Render the Title property, falling back to the Name property if Title is null -->

            <adx:EntityForm ID="EntityForm1"
                runat="server"
                FormCssClass="crmEntityFormView"
                PreviousButtonCssClass="btn btn-primary"
                NextButtonCssClass="btn btn-primary"
                SubmitButtonCssClass="btn btn-primary"
                ClientIDMode="Static"
                OnItemSaved="OnItemSaved"
                LanguageCode="<%$ SiteSetting: Language Code, 0 %>"
                PortalName="<%$ SiteSetting: Language Code %>" />
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handsontable/0.27.0/handsontable.full.js"></script>
    <script>
        numbro.language('fil-PH', {
            delimiters: {
                thousands: ',',
                decimal: '.'
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            ordinal: function (number) {
                var b = number % 10;
                return (~~(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
            },
            currency: {
                symbol: '₱'
            }
        });
    </script>
    <script src="~/js/dms/accordion.js"></script>
    <script src="~/js/dms/multi-select.js"></script>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="ContentBottom" runat="server">
    <div class="footer">
        <div class="pull-left footer-left">
            <div class="userlist">
            </div>
        </div>
        <div class="pull-right footer-right">
            <div class="record-status">
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="Content10" ContentPlaceHolderID="Scripts" runat="server">
    <script src="~/js/dms/jquery.signalR-2.0.0.min.js"></script>
    <script src="~/signalr/hubs"></script>
    <script>
        var userFullName = "<%: Html.AttributeLiteral(Html.PortalUser(), "fullname") ?? "" %>";
        var imgUrl = "<%: Html.AttributeLiteral(Html.PortalUser(), "gsc_userimageurl") ?? "~/css/images/default.png" %>";
    </script>
    <script src="~/js/dms/form-locking.js"></script>
    <script>
        $(function () {
            $(document).ready(function () {
                $("div.entity-grid.subgrid").each(function (a, b) {
                    $(this).find(".grid-actions").addClass("hidden");
                });

                if (DMS.Settings.User.webRole == "Sales Supervisor" || DMS.Settings.User.webRole == "Sales Executive") {
                    //Edit Prospect scripts
                    // var reportsTo = $("#gsc_recordownerreportsto").val();
                    var owner = $("#gsc_recordownerid").val();
                    var salesExecutive = $("#gsc_salesexecutiveid").val();

                    var oDataUrl = '/_odata/employee?$filter=contactid%20eq%20(Guid%27' + salesExecutive + '%27)&';
                    $.ajax({
                        type: 'get',
                        async: true,
                        url: oDataUrl,
                        success: function (data) {
                            if (data.value.length !== 0) {
                                var reportsTo = data.value[0].gsc_reportsto;
                                if (reportsTo !== null && reportsTo !== undefined)
                                    var reportsToId = reportsTo.Id;

                                if (DMS.Settings.Permission.Scope === 756150000 && DMS.Settings.Permission.Read === true) {
                                    return;
                                }

                                if (reportsToId == userId || salesExecutive == userId) {
                                    return;
                                }

                                if (entityName != "contact" && entityName != "account") {
                                    if (owner === userId) {
                                        window.location.href = editUrl;
                                        return;
                                    }
                                }

                                $("section.content").hide();
                                var entityForm = $("#EntityForm1");
                                entityForm.html("");
                                var template = "<div class=\"alert alert-block alert-danger\"><span class=\"fa fa-lock\" aria-hidden=\"true\"></span> Access denied. You do not have the appropriate permissions.</div>";
                                $(template).appendTo(entityForm);
                            }
                        },
                        error: function (xhr, textStatus, errorMessage) {
                            console.error(errorMessage);
                        }
                    });
                }

                var webPageId = $("#webPageId span").html();
                var recordOwnerId = $("#gsc_recordownerid").val();
                var OwningBranchId = $("#gsc_branchid").val();
                var salesExecutiveId = $("#gsc_salesexecutiveid").val();
                var guidEmpty = "00000000-0000-0000-0000-000000000000";

                if (recordOwnerId == null || recordOwnerId == undefined || recordOwnerId == "")
                    recordOwnerId = guidEmpty;

                if (OwningBranchId == null || OwningBranchId == undefined || OwningBranchId == "")
                    OwningBranchId = guidEmpty;

                if (salesExecutiveId == null || salesExecutiveId == undefined || salesExecutiveId == "")
                    salesExecutiveId = guidEmpty;

                var service = DMS.Service("GET", "~/api/Service/GetPrivilages",
                   { webPageId: webPageId, recordOwnerId: recordOwnerId, OwningBranchId: OwningBranchId, salesExecutiveId: salesExecutiveId }, DMS.Helpers.DefaultErrorHandler, null);

                service.then(function (response) {
                    DMS.Settings.Permission = response;

                    if (response === null) return;
                    if (DMS.Settings.Permission.Read === null) return;


                    if (DMS.Settings.Permission.Read === false) {
                        //window.location.href = "~/Pages/AccessDenied.aspx";
                        var entityForm = $("#EntityForm1");
                        entityForm.html("");
                        var template = "<div class=\"alert alert-block alert-danger\"><span class=\"fa fa-lock\" aria-hidden=\"true\"></span> Access denied. You do not have the appropriate permissions.</div>";
                        $(template).appendTo(entityForm);
                        return;
                    }

                    if (DMS.Settings.Permission.Update === false) {
                        DisableFormByPermission();
                        $(".toolbar-right").find("button, a, input").each(function () {
                            var text = $(this).html();
                            if (text.indexOf("NEW") === -1 && text.indexOf("DELETE") === -1 && text.indexOf("REMOVE") === -1 && text.indexOf("EXPORT") === -1) {
                                $(this).remove();
                            }
                        });

                        $(".view-toolbar.grid-actions").remove();
                    }

                    if (DMS.Settings.Permission.Delete === false) {
                        $(".delete-link").remove();
                    }

                    $(".navbar-right.toolbar-right").removeClass("hidden");

                });

                function DisableFormByPermission() {
                    $("#EntityFormView").find("input, select").each(function () {
                        $(this).attr("readonly", true);
                        $(this).attr("disabled", true);
                        $(this).addClass("permanent-disabled");
                    });

                    $("#EntityFormView").find(".input-group-btn").each(function () {
                        $(this).addClass("hidden");
                    });
                }
            });
        });
    </script>
    <script src="~/js/dms/hot-renderers.js"></script>
    <script src="~/js/dms/select2-editor.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js"></script>
    <script src="~/js/dms/edit-on-doubleclick.js"></script>
    <script src="~/js/dms/generic-grid.js"></script>
    <script src="~/js/dms/currency-fields.js"></script>
    <script src="~/js/dms/datepicker-reinit.js"></script>
    <script src="~/js/dms/entity-form.js"></script>
    <script src="~/js/dms/computation-total.js"></script>
    <script src="~/js/dms/primary-field.js"></script>
    <script src="~/js/dms/modal-customization.js"></script>
    <script src="~/js/dms/subgrid-counter.js"></script>
   <script src="~/js/dms/subgrid-button-permission.js"></script>

</asp:Content>


