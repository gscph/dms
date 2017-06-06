using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Site.Pages.DMS_Templates
{
    public partial class Home : PortalPage 
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