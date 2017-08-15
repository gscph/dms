<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContentShared.master" AutoEventWireup="true" CodeBehind="SharedNewForm.aspx.cs" Inherits="Site.Pages.DMS_Templates.SharedNewForm" %>



<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>

<%--<%@ OutputCache CacheProfile="EntityListDMS" %>--%>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">  
    <link href="~/css/dms/entity-form.css" rel="stylesheet" />  
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

        function DupeDetectedNotification(callback) {
            DMS.Notification.Error('Unable to save, the system detected a duplicate of this record.', true, 10000, false);
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
    <script>
        DMS.Settings.User.Id = "<%: Html.AttributeLiteral(Html.PortalUser(), "contactid") %>";     
    </script>             
    <script src="~/js/dms/edit-on-doubleclick.js"></script>   
    <script src="~/js/dms/currency-fields.js"></script>
    <script src="~/js/dms/datepicker-reinit.js"></script>
    <script src="~/js/dms/entity-form.js"></script>   
    <script src="~/js/dms/primary-field.js"></script>
    <script src="~/js/dms/modal-customization.js"></script> 
    <script>
        $(function () {
            $(document).on('hideLoader', function () {
                var webPageId = $('#webPageId span').html();
                var recordOwnerId = $("#gsc_recordownerid").val();
                var OwningBranchId = $("#gsc_branchid").val();
                var guidEmpty = "00000000-0000-0000-0000-000000000000";
                var service = DMS.Service('GET', '~/api/Service/GetPrivilages',
                   { webPageId: webPageId, recordOwnerId: recordOwnerId, OwningBranchId: OwningBranchId, salesExecutiveId: guidEmpty}, DMS.Helpers.DefaultErrorHandler, null);

                service.then(function (response) {
                    DMS.Settings.Permission = response;

                    if (response == null) return;
                    if (DMS.Settings.Permission.Read == null) return;

                    if (DMS.Settings.Permission.Create == false) {                  
                        var entityForm = $('#EntityForm1');
                        entityForm.html('');
                        var template = '<div class="alert alert-block alert-danger"><span class="fa fa-lock" aria-hidden="true"></span> Access denied. You do not have the appropriate permissions.</div>';
                        $(template).appendTo(entityForm);
                        $('.toolbar-right').html('');
                        return;
                    }                  

                });

            });
        });
    </script>
</asp:Content>
