<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<dynamic>" %>

<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>
<%@ Import Namespace="DevTrends.MvcDonutCaching" %>
<%@ Import Namespace="Site" %>
<% var viewSupportsDonuts = ((bool?)ViewBag.ViewSupportsDonuts).GetValueOrDefault(false); %>
<% var relatedWebsites = Html.RelatedWebsites(linkTitleSiteSettingName: "Site Name"); %>
<% var searchEnabled = Html.BooleanSetting("Search/Enabled").GetValueOrDefault(true); %>
<% var searchUrl = searchEnabled ? Html.SiteMarkerUrl("Search") : null; %>
<% var searchFilterOptions = searchEnabled ? Html.SearchFilterOptions().ToArray() : Enumerable.Empty<KeyValuePair<string, string>>().ToArray(); %>
<% var searchFilterDefaultText = searchEnabled ? Html.SnippetLiteral("Default Search Filter Text", "All") : null; %>
<% var searchFilterLabel = searchEnabled ? Html.SnippetLiteral("Header/Search/Filter/Label", "Search Filter") : null; %>
<% var searchLabel = searchEnabled ? Html.SnippetLiteral("Header/Search/Label", "Search") : null; %>
<% var searchToolTip = searchEnabled ? Html.SnippetLiteral("Header/Search/ToolTip", "Search") : null; %>
<% var shoppingCartUrl = Html.SiteMarkerUrl("Shopping Cart"); %>
<% var shoppingCartEnabled = string.IsNullOrEmpty(shoppingCartUrl); %>
<% var shoppingCartServiceUrl = shoppingCartEnabled ? Url.Action("Status", "ShoppingCart", new { area = "Commerce", __portalScopeId__ = Html.Website().EntityReference.Id }) : null; %>
<% var shoppingCartLinkText = shoppingCartEnabled ? Html.SnippetLiteral("Shopping Cart Status Link Text", "Cart") : null; %>
<% var isAuthenticated = Request.IsAuthenticated; %>
<% var userName = isAuthenticated ? Html.AttributeLiteral(Html.PortalUser(), "fullname") : null; %>
<% var imgUrl = Html.AttributeLiteral(Html.PortalUser(), "gsc_userimageurl") ?? "~/css/images/default.png"; %>
<% var userImgUrl = isAuthenticated ? imgUrl : "~/css/images/default.png"; %>
<% var profileNavEnabled = isAuthenticated && Html.BooleanSetting("Header/ShowAllProfileNavigationLinks").GetValueOrDefault(true); %>
<% var profileNavigation = profileNavEnabled ? Html.WebLinkSet("Profile Navigation") : null; %>
<% var profileNavigationListItems = profileNavEnabled && profileNavigation != null ? profileNavigation.WebLinks.Select(e => Html.WebLinkListItem(e, false, false, maximumWebLinkChildDepth: 1)).ToArray() : Enumerable.Empty<IHtmlString>().ToArray(); %>
<% var profileUrl = profileNavEnabled ? null : Html.SiteMarkerUrl("Profile"); %>
<% var profileLinkText = profileNavEnabled ? null : Html.SnippetLiteral("Profile Link Text", "Profile"); %>
<% var signInUrl = !isAuthenticated ? Html.Action("SignInUrl", "Layout", new { area = "Portal" }, viewSupportsDonuts) : null; %>
<% var signInEnabled = !isAuthenticated && !string.IsNullOrWhiteSpace(Url.SignInUrl()); %>
<% var signInLabel = !isAuthenticated ? Html.SnippetLiteral("links/login", "Sign In") : null; %>
<% var signOutUrl = isAuthenticated ? Html.Action("SignOutUrl", "Layout", new { area = "Portal" }, viewSupportsDonuts) : null; %>
<% var signOutLabel = isAuthenticated ? Html.SnippetLiteral("links/logout", "Sign Out") : null; %>
<% var registrationEnabled = !isAuthenticated && Url.RegistrationEnabled(); %>
<% var registerUrl = registrationEnabled ? Html.Action("RegisterUrl", "Layout", new { area = "Portal" }, viewSupportsDonuts) : null; %>
<% var registerLabel = registrationEnabled ? Html.SnippetLiteral("links/register", "Register") : null; %>
<%--<%: Request.RawUrl %>--%>


<nav class="navbar navbar-default navbar-static-top top-navbar">
    <div class="navbar-header">
       <%-- <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"
            aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>--%>
        <a href="~/">
            <img class="brand-logo" src="~/images/logoformmpc1.png"></a>
    </div>
    <ul class="nav navbar-nav navbar-right">
        <li><a href="#" class="display-name"><%: userName %></a></li>
        <li class="dropdown user-info">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                <img src="<%: userImgUrl %>" onerror="this.onerror=null;this.src='~/images/users/default.jpg'" class="img-square" alt="User Image">
            </a>
            <ul class="dropdown-menu">
                <li class="body-menu">
                    <img src="<%: userImgUrl %>" onerror="this.onerror=null;this.src='~/images/users/default.jpg'" class="user-image" alt="User Image">
                    <p id="userFullname"><%: userName %></p>
                    <p><span class="userPosition"></span></p>
                    <p><span id="userInfo"></span></p>
                </li>
                <li class="divider"></li>
                <li class="footer-menu">
                    <div class="pull-left">
                        <a href="/profile/" class="btn btn-sm btn-default">Profile
                        </a>
                    </div>
                    <div class="pull-right">
                        <a id="logoutBtn" href="<%: signOutUrl %>" class="btn btn-sm btn-default">Logout</a>
                    </div>
                </li>
            </ul>
        </li>
    </ul>
</nav>



<div class="navbar navbar-static-top toolbar">
    <ul class="nav navbar-nav navbar-left toolbar-left">
        <li class="dropdown" onclick="CloseDropDownFromToggle(this);">
           <a href="#" class="dropdown-toggle btn-sm nav-toggle" data-toggle="dropdown">          
               <span class="fa fa-bars"></span>
            </a>
            <% var webLinkSet = Html.WebLinkSet("Primary Navigation"); int counter = 0; %>
            <% var webLinkSetDashboard = Html.WebLinkSet("Dashboard"); %>
            <% if (webLinkSet != null && webLinkSet.WebLinks != null && webLinkSet.WebLinks.Any())
               { %>
            <ul class="dropdown-menu primary-nav">
                <% foreach (var webLink in webLinkSet.WebLinks)
                   { %>

                <div class="col-lg-2 col-md-2 col-sm-2 col-xs-6">
                    <li class="dropdown menu-header" onmouseover="OpenDropDown(this, event);" onclick="CloseDropDown(this, event);">                        
                        <div class ="menu-icons">
                            <img class="main-icons" src="<%: webLink.ImageUrl %>" alt="Alternate Text">
                            <span class="menu-name"><%: webLink.Name.ToString() %></span>
                        </div>
                       
                        <%--<ul class="dropdown-menu">
                            <li><a href="#">Hello World</a></li>
                        </ul>--%>
                        <%-- Dashboards --%>
                        <% if (webLinkSetDashboard != null && webLinkSetDashboard.WebLinks != null && webLinkSetDashboard.WebLinks.Any() && counter == 0)
                           { %>
                        <ul class="dropdown-menu">
                            <% foreach (var webLinkDashboard in webLinkSetDashboard.WebLinks)
                               { %>
                            <% if (webLinkDashboard.WebLinks.Any())
                               { %>
                            <%  var LinksChuncked = webLinkDashboard.WebLinks.ChunkBy<Adxstudio.Xrm.Cms.IWebLink>(6); %>
                            <% foreach (var items in LinksChuncked)
                               { %>
                         <%--   <div class="<%:LinksChuncked.Count() > 2 ? "col-md-6 col-sm-6" : "col-md-12 col-sm-12" %>">--%>
                            <div class="col-md-2 col-sm-2">
                                <li class="<%: webLinkDashboard.Url == null ? "link-disabled sub-menu" : "" %>">
                                    <a href="<%: webLinkDashboard.Url ?? "#" %>"><%: webLinkDashboard.Name %>
                                    </a>
                                </li>
                                <% foreach (var item in items)
                                   { %>
                                <li class="<%: item.Url == null ? "link-disabled" : "" %>">
                                    <a href="<%: item.Url ?? "#" %>" title="<%: item.Name %>"><%: item.Name %></a>
                                </li>
                                <%  } %>
                            </div>
                            <% } %>

                            <% } %>
                            <% } %>
                        </ul>
                        <% } %>

                        <%-- End Dashboards --%>
                        <% if (webLink.WebLinks.Any() && counter != 0)
                           { %>
                        <ul class="dropdown-menu" style="<%: webLink.WebLinks.Count() > 1 ? "min-width:600px;" : "max-width:200px;" %>">
                            <% foreach (var childLinks in webLink.WebLinks)
                               {                                 
                            %>
                            <% if (childLinks.WebLinks.Any())
                               { %>
                            <%  var LinksChuncked = childLinks.WebLinks.ChunkBy<Adxstudio.Xrm.Cms.IWebLink>(10); %>
                            <% foreach (var items in LinksChuncked)
                               {  %>
                       <%--     <div class="<%: webLink.WebLinks.Count() >= 2 ? "col-md-6 col-sm-6" : "col-md-12 col-sm-12" %>"> --%>
                                <div class="col-md-2 col-sm-3">
                                    <li class="<%: childLinks.Url == null ? "link-disabled sub-menu" : "" %>">
                                        <a href="<%: childLinks.Url ?? "#" %>"><%: childLinks.Name %></a>
                                    </li>
                                    <% foreach (var item in items)
                                       { %>
                                    <li>
                                        <a href="<%: item.Url ?? "#" %>" onclick="<%: item.OpenInNewWindow == true ? "OpenReport('" + item.ImageUrl + "');" : "" %>" title="<%: item.Name %>"><%: item.Name %></a>
                                    </li>
                                    <%  } %>
                                </div>
                            <% } %>

                            <% } %>
                            <% } %>
                        </ul>


                        <% } %>
                        <% counter++; %>                            
                    </li>

                </div>
                <% } %>
            </ul>
            <% } %>         
        </li>
        <adx:Snippet SnippetName="Breadcrumbs" Editable="false" EditType="text" runat="server" LiquidEnabled="true" />
    </ul>
    <ul class="nav navbar-nav navbar-right toolbar-right">
    </ul>
</div>

