<%@ Page Language="C#" MasterPageFile="Login.Master" Inherits="System.Web.Mvc.ViewPage" %>


<asp:Content ContentPlaceHolderID="MainContent" runat="server">   
    <p class="login-box-msg">
        <%: Html.TextSnippet("Account/SignIn/SignInLocalFormHeading", defaultValue: "Dealer Management System", tagName: "span") %>
    </p>

    <% Html.RenderPartial("LoginLocal", ViewData["local"]); %>
</asp:Content>
