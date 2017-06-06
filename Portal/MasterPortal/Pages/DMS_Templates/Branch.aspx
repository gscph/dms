<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContent.master" AutoEventWireup="true" CodeBehind="Branch.aspx.cs" Inherits="Site.Pages.DMS_Templates.Branch" %>

<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>


<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/handsontable.full.min.css" rel="stylesheet" />
    <link href="~/css/dms/entity-form.css" rel="stylesheet" />
    <link href="~/css/dms/handsontable.bootstrap.css" rel="stylesheet" />
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
    <h1 class="hidden" id="webPageId">
        <adx:Property PropertyName="adx_webpageid" Editable="false" DataItem='<%$ CrmSiteMap: Current %>' runat="server" /></h1>
    <style>
        .body-container {
            padding: 100px 15px 25px 15px;
        }

        .entity-title {
            padding-left: 57px;
        }
    </style>
    <div id="loader">
        <span class="fa fa-spinner fa-spin fa-4x loader-color"></span>
    </div>
    <h1 id="EntityListTitle" class="hidden">
        <adx:Property ID="Property1" PropertyName="adx_title,adx_name" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
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
    <script src="~/js/dms/edit-on-doubleclick.js"></script>
    <script src="~/js/dms/currency-fields.js"></script>
    <script src="~/js/dms/datepicker-reinit.js"></script>
    <script src="~/js/dms/entity-form.js"></script>
    <script src="~/js/dms/computation-total.js"></script>
    <script src="~/js/dms/primary-field.js"></script>
    <script src="~/js/dms/modal-customization.js"></script>
    <script src="~/js/dms/subgrid-counter.js"></script>
    <script src="~/dms-plugins/bootstrap-fileinput/js/plugins/canvas-to-blob.min.js"></script>
    <script src="~/dms-plugins/bootstrap-fileinput/js/plugins/purify.min.js"></script>
    <script src="~/dms-plugins/bootstrap-fileinput/js/fileinput.min.js"></script>
    <script>
        $(function () {
            $(document).on('hideLoader', function () {
                var webPageId = $('#webPageId span').html();

                var service = DMS.Service('GET', '~/api/Service/GetPrivilages',
                   { webPageId: webPageId }, DMS.Helpers.DefaultErrorHandler, null);

                service.then(function (response) {
                    DMS.Settings.Permission = response;

                    if (response == null) return;
                    if (DMS.Settings.Permission.Read == null) return;


                    if (DMS.Settings.Permission.Read == false) {                     
                        var entityForm = $('#EntityForm1');
                        entityForm.html('');
                        var template = '<div class="alert alert-block alert-danger"><span class="fa fa-lock" aria-hidden="true"></span> Access denied. You do not have the appropriate permissions.</div>';
                        $(template).appendTo(entityForm);
                        $('.toolbar-right').html('');
                        return;
                    }

                    if (DMS.Settings.Permission.Update == false) {
                        $('.submit-btn').remove();
                        $('.deactivate-link').remove();
                        $('.activate-link').remove();
                    }

                    if (DMS.Settings.Permission.Delete == false) {
                        $('.delete-link').remove();
                    }

                });

            });
        });

    </script>
</asp:Content>




