using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Site.Pages.DMS_Templates
{
    public partial class EntityForm : PortalPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            RedirectToLoginIfAnonymous();
            // EntityForm1.Attributes.
        }

    }
}