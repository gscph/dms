using System;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using Adxstudio.Xrm.Web.Mvc;

namespace Site
{
    public static class CustomWebLinks
    {
        public static IHtmlString SidebarNavigation(this HtmlHelper html, string webLinkName)
        {
            var webLinkSet = Adxstudio.Xrm.Web.Mvc.Html.WebLinkExtensions.WebLinkSet(html, webLinkName);

            string parentLinks = "";
            //string childrenLinks = "";
            //string grandChildrenLinks = "";

            if (webLinkSet != null && webLinkSet.WebLinks != null)
            {
                foreach (var parent in webLinkSet.WebLinks)
                {                  
                    parentLinks += String.Format(@"<li class='treeview'>
                            <a href='{0}' title='{1}'>
                            <i class='{2}'></i>
                            <span>{3}</span>", parent.Url ?? "#", parent.Name, parent.ImageUrl, parent.Name);

                    if (parent.WebLinks != null)
                    {
                        foreach (var children in parent.WebLinks)
                        {
                            if (children.WebLinks != null)
                            {
                                foreach (var grandchildren in children.WebLinks)
                                {
                                    
                                }
                            }
                        }
                    }
                }
            }

            string sidebarMenu = String.Format("<ul class='sidebar-menu'>{0}</ul>", parentLinks);

            return new HtmlString(sidebarMenu);
            //string htmlString = String.Format("<span class='fa fa-flag fa-fw text-success'></span>");

            //if (!value)
            //{
            //    htmlString = String.Format("<span class='fa fa-flag fa-fw text-danger'></span>");
            //}
            //return new HtmlString(htmlString);
        }
    }
}