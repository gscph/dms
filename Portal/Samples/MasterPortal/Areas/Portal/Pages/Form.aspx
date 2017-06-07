<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/Default.master" AutoEventWireup="true" CodeBehind="Form.aspx.cs" Inherits="Site.Areas.Portal.Pages.Form" %>


<asp:Content ContentPlaceHolderID="Head" runat="server">
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
    <style>
        .content-wrapper {
            margin-left: 0px !important;
            padding-top: 0px !important;
            background-color: #FFF !important;
        }

        .row.form-custom-actions {
            position: relative;
        }
    </style>

</asp:Content>
<asp:Content ContentPlaceHolderID="HeaderNavbar" runat="server" />
<asp:Content ContentPlaceHolderID="MainContent" runat="server" ViewStateMode="Enabled">
    <style>
        #ValidationSummaryEntityFormView {
            position: fixed;
            top: 0;
            right: 0;
            z-index: 750;
            height: 100px;
            max-height: 500px;
            max-width: 300px;
        }
    </style>
    <script src="~/js/jquery.cookie.js"></script>
    <script src="~/js/dms/service.js"></script>
    <script src="~/js/dms/notification.js"></script>
    <script src="~/js/dms/helpers.js"></script>
    <script src="~/js/dms/site-settings.js"></script>
    <script src="~/js/dms/dms-app.js"></script>
    <form id="content_form" runat="server">
        <asp:ScriptManager runat="server">
            <Scripts>
                <asp:ScriptReference Path="~/js/jquery.blockUI.js" />
            </Scripts>
        </asp:ScriptManager>
        <script type="text/javascript">
            function entityFormClientValidate() {
                // Custom client side validation. Method is called by the submit button's onclick event.
                // Must return true or false. Returning false will prevent the form from submitting.
                return true;
            }
        </script>
        <div class="content-wrapper">
            <div class="notifications" style="margin-top: 50px; margin-left: 5px; margin-right: 5px; margin-bottom: 0px; top: 0px;"></div>
            <section class="content">
                <adx:EntityForm ID="EntityFormControl" runat="server" FormCssClass="crmEntityFormView" PreviousButtonCssClass="btn btn-default" NextButtonCssClass="btn btn-primary" SubmitButtonCssClass="btn btn-primary fa-input-submit" OnItemSaved="OnItemSaved" ClientIDMode="Static" LanguageCode="<%$ SiteSetting: Language Code, 0 %>" PortalName="<%$ SiteSetting: Language Code %>" />
            </section>
        </div>
    </form>
    <script src="~/js/dms/jquery.mask.js"></script>
    <script src="~/js/dms/accordion.js"></script>
    <script src="~/js/dms/datepicker-reinit.js"></script>
    <script src="~/js/dms/handsontable.full.js"></script>
    <script src="~/js/dms/hot-renderers.js"></script>
    <script src="~/js/dms/another-grid.js"></script>

    <script>

        $(document).ready(function () {
            // styles
            $('.form-custom-actions .btn.btn-default').addClass('btn-primary');
            $('.form-custom-actions .btn.btn-default').removeClass('btn-default');
            $('.fa-input-submit').val($("<div>").html("&#xf0c7; ").text() + $('.fa-input-submit').val());
            $(".content-wrapper").attr('style', 'margin-left:0px !important;padding-top: 0px !important;');
            $(".row.form-custom-actions").attr('style', 'position: relative;');
            $('.row.form-custom-actions .col-sm-6:first').addClass('col-sm-12');
            $('.row.form-custom-actions .col-sm-6:first').removeClass('col-sm-6');
            $('.row.form-custom-actions .col-sm-12:first .form-action-container-right').attr('style', 'margin-right:0px');



            // remove modal from from toolbar to avoid position: fixed; conflict
            setTimeout(function () {
                var modal = $('.row.form-custom-actions').find('section.modal.modal-delete').detach();
                $('div.actions').append(modal);

            }, 1000)

        });
    </script>
</asp:Content>
<asp:Content ContentPlaceHolderID="Footer" runat="server" />
