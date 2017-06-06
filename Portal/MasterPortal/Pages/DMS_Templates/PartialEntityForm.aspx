<%@ Page Title="" Language="C#" ViewStateMode="Enabled" MasterPageFile="~/MasterPages/DMS-Parital-Forms.Master" AutoEventWireup="true" CodeBehind="PartialEntityForm.aspx.cs" Inherits="Site.Pages.DMS_Templates.PartialEntityForm" %>


<asp:Content ID="Content8" ContentPlaceHolderID="MainContent" runat="server">
    <div id="partial_form">
        <form method="post" action="/quickedit/?id=ec96e480-ffce-e511-80ce-00155d010e2c" id="content_form" runat="server">
            <asp:ScriptManager runat="server">
                <Scripts>
                    <asp:ScriptReference Path="~/js/jquery.blockUI.js" />
                </Scripts>
            </asp:ScriptManager>
            <div class="notifications"></div>
            <adx:EntityForm ID="EntityForm1" runat="server" FormCssClass="crmEntityFormView" PreviousButtonCssClass="btn btn-default" NextButtonCssClass="btn btn-primary" SubmitButtonCssClass="btn btn-primary" ClientIDMode="Static" LanguageCode="<%$ SiteSetting: Language Code, 0 %>" PortalName="<%$ SiteSetting: Language Code %>" />
        </form>
    </div>   
</asp:Content>

