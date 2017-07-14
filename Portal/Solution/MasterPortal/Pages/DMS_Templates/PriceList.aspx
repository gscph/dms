<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContent.master" AutoEventWireup="true" CodeBehind="PriceList.aspx.cs" Inherits="Site.Pages.DMS_Templates.PriceList"%>

<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>


<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/handsontable.full.min.css" rel="stylesheet" />
    <link href="~/css/dms/entity-form.css" rel="stylesheet" />
    <link href="~/css/dms/handsontable.bootstrap.css" rel="stylesheet" />
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
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PageHeader" runat="server">
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="MainContent" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="EntityControls" runat="server">
    <script>
        $(".navbar-right.toolbar-right").addClass("hidden");
    </script>
    <div id="loader">
        <span class="fa fa-spinner fa-spin fa-4x loader-color"></span>
    </div>
    <h1 id="EntityListTitle" class="hidden">
        <adx:Property PropertyName="adx_title,adx_name" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
    </h1>
    <script type="text/javascript">
        var oldIsDefault = false;
        var fromConfirm = false;

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


            var newIsDefault = $("#gsc_default").is(':checked');

            if (fromConfirm == false) {
                if ((oldIsDefault != newIsDefault) && newIsDefault == true) {
                    return false;
                }
            }

            return true;
        }

        $(document).ready(function () {
            oldIsDefault = $("#gsc_default").is(':checked');

            var confirmModal = document.createElement("div");
            confirmModal.innerHTML = '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title">Save</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<center><p>Are you sure you want to update the default pricelist?</p>' +
            '</center></div>' +
            '<div class="modal-footer">' +
            '<button id="continueBtn" type="submit" class="btn btn-primary btn-dialogue" data-dismiss="modal">CONTINUE</button>' +
            '<button  type="button" class="btn btn-default" data-dismiss="modal">CANCEL</button>' +
            '</div>' +
            '</div><!-- /.modal-content -->' +
            '</div><!-- /.modal-dialog -->';
            confirmModal.setAttribute("id", "myModal");
            confirmModal.setAttribute("class", "modal fade");
            confirmModal.setAttribute("tabindex", "-1");
            confirmModal.setAttribute("role", "dialog");
            $(".crmEntityFormView").append(confirmModal);

            $("#UpdateButton").click(function (e) {

                if (fromConfirm == false) {
                    if (!entityFormClientValidate()) {
                        $('#myModal').modal('show');
                    }
                }
            });

            $("#continueBtn").click(function () {
                $.blockUI({ message: null, overlayCSS: { opacity: .3 } });
                fromConfirm = true;
                $("#UpdateButton").click();
            });
        });
    </script>

    <div class="content-wrapper">
        <div id="mainContents" class="body-container">
            <div class="notifications"></div>
            <div id="currentPage"></div>
            <crm:CrmEntityDataSource ID="CurrentEntity" DataItem="<%$ CrmSiteMap: Current %>" runat="server" />
            <!-- Render the Title property, falling back to the Name property if Title is null -->
                        <h1 class="hidden" id="webPageId">
                <adx:Property PropertyName="adx_webpageid" Editable="false" DataItem='<%$ CrmSiteMap: Current %>' runat="server" /></h1>
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

    <script src="https://cdnjs.cloudflare.com/ajax/libs/handsontable/0.28.2/handsontable.full.js"></script>
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
<asp:Content ID="Content7" ContentPlaceHolderID="Scripts" runat="server">
    <script src="~/js/dms/jquery.signalR-2.0.0.min.js"></script>
    <script src="~/signalr/hubs"></script>
    <script>
        var userFullName = "<%: Html.AttributeLiteral(Html.PortalUser(), "fullname") ?? "" %>";
        var imgUrl = "<%: Html.AttributeLiteral(Html.PortalUser(), "gsc_userimageurl") ?? "~/css/images/default.png" %>";

        $(document).ready(function () {
            $("div.entity-grid.subgrid").each(function (a, b) {
                $(this).find(".grid-actions").addClass("hidden");
            });

            var webPageId = $("#webPageId span").html();
            var recordOwnerId = $("#gsc_recordownerid").val();
            var OwningBranchId = $("#gsc_branchid").val();
            var guidEmpty = "00000000-0000-0000-0000-000000000000";

            if (recordOwnerId === null || recordOwnerId === undefined)
                recordOwnerId = guidEmpty;

            if (OwningBranchId === null || OwningBranchId === undefined)
                OwningBranchId = guidEmpty;

            var service = DMS.Service("GET", "~/api/Service/GetPrivilages",
               { webPageId: webPageId, recordOwnerId: recordOwnerId, OwningBranchId: OwningBranchId, salesExecutiveId: guidEmpty }, DMS.Helpers.DefaultErrorHandler, null);

            service.then(function (response) {
                DMS.Settings.Permission = response;
                if (response === null) {
                    return;
                }

                if (DMS.Settings.Permission.Update === false) {
                    $(".toolbar-right").find("button, a, input").each(function () {
                        var text = $(this).html();
                        if (text.indexOf("NEW") === -1 && text.indexOf("DELETE") === -1 && text.indexOf("REMOVE") === -1 && text.indexOf("EXPORT") === -1 && text.indexOf("ORDER") === -1) {
                            $(this).remove();
                        }
                    });
                }

                $(".navbar-right.toolbar-right").removeClass("hidden");
            });
        });
    </script>
    <script src="~/js/dms/form-locking.js"></script>
    <script src="~/js/dms/select2-editor.js"></script>
    <script src="~/js/dms/hot-renderers.js"></script>
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
