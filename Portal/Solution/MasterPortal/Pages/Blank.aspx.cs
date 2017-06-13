using System;
using System.Web.Mvc;

namespace Site.Pages
{
	public partial class Blank : PortalPage
	{
		protected void Page_Load(object sender, EventArgs e) 
        {
            RedirectToLoginIfAnonymous();
        }
        protected void Pre_Render(object sender, EventArgs e)
        {
            RedirectToLoginIfAnonymous();
        }
	}
}