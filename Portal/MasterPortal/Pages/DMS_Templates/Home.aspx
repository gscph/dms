<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/Default.master" AutoEventWireup="true" CodeBehind="Home.aspx.cs" Inherits="Site.Pages.DMS_Templates.Home" %>

<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>

<asp:Content ContentPlaceHolderID="Head" runat="server">
    <style>
        .breadcrumb li.active {
            padding-top: 3px;
        }
    </style>
</asp:Content>

<asp:Content ContentPlaceHolderID="ContentHeader" runat="server">
    <script src="~/js/jquery.cookie.js"></script>
    <script src="~/js/dms/service.js"></script>
    <script src="~/js/dms/notification.js"></script>
    <script src="~/js/dms/helpers.js"></script>
    <script src="~/js/dms/site-settings.js"></script>
    <script src="~/js/dms/dms-app.js"></script>
</asp:Content>

<asp:Content ID="MyContent" ContentPlaceHolderID="MainContent" runat="server">
    <style>
        .body-container {
            padding: 100px 15px 25px 25px;
        }

            .body-container .dropdown {
                margin-left: 15px;
                margin-bottom: 10px;
            }
    </style>
    <%-- <div class="callout callout-info">
            <h3>Welcome to DMS Portal.</h3>
            <p><%: Html.HtmlAttribute("adx_copy", cssClass: "page-copy") %> </p>         
        </div>--%>
    <!-- Info boxes -->


    <%--  <adx:Snippet SnippetName="Name" EditType="html" runat="server"  />--%>
    <div id="dashboardContainer" class="body-container">

        <div class="dropdown">
            <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                Dashboard
    <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                <% var webLinkSet = Html.WebLinkSet("Dashboard"); %>
                <% if (webLinkSet != null && webLinkSet.WebLinks != null && webLinkSet.WebLinks.Any())
                   { %>
                <% foreach (var webLink in webLinkSet.WebLinks)
                   { %>
                <% if (webLink.WebLinks.Any())
                   { %>
                <% foreach (var childLinks in webLink.WebLinks)
                   { %>
                <li>
                    <a href="<%: childLinks.Url ?? "#" %>"><%: childLinks.Name.ToString() %></a>
                </li>
                <% } %>
                <% } %>
           <%--     <li><a href="<%: webLink.Url ?? "#" %>" title="<%: webLink.Name %>"><%: webLink.Name %></a></li>--%>
                <% } %>
                <% } %>
            </ul>
        </div>
    </div>

    <!-- jvectormap -->

    <script src="~/dms-plugins/chartjs/Chart.min.js"></script>
    <script src="~/dms-plugins/morris/morris.min.js"></script>
    <script src="~/dms-plugins/flot/jquery.flot.min.js"></script>
    <script src="~/dms-plugins/flot/jquery.flot.resize.min.js"></script>
    <script src="~/dms-plugins/flot/jquery.flot.pie.min.js"></script>
    <script src="~/dms-plugins/flot/jquery.flot.categories.min.js"></script>
    <script src="~/js/dms/home.js"></script>
    <script src="~/js/dms/chart.js"></script>
    <script src="~/js/dms/dashboard-engine.js"></script>

</asp:Content>

