<%@ Page Language="C#" MasterPageFile="~/MasterPages/Default.master" AutoEventWireup="true" CodeBehind="Blank.aspx.cs" Inherits="Site.Pages.Blank" %>

<%@ OutputCache CacheProfile="User" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <%: Html.HtmlAttribute("adx_copy", cssClass: "page-copy") %>
    <% var webLinkSetDashboard = Html.WebLinkSet("Dashboard"); %>
    <% if (webLinkSetDashboard != null && webLinkSetDashboard.WebLinks != null && webLinkSetDashboard.WebLinks.Any())
       { %>
    <% foreach (var webLinkDashboard in webLinkSetDashboard.WebLinks)
       {        
           if (webLinkDashboard.WebLinks.Any())
           {
               foreach (var childLinks in webLinkDashboard.WebLinks)
               {
                   if (childLinks.DisplayImageOnly)
                   {
                       Response.Redirect(childLinks.Url, true);
                   }
               }
           }
       } %>

    <%   } %>
</asp:Content>
<asp:Content ID="Content10" ContentPlaceHolderID="Scripts" runat="server">
    <script>

    </script>
</asp:Content>
