using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Adxstudio.Xrm.Web.UI.CrmEntityListView;

namespace Site.Pages.DMS_Templates
{
    public partial class EntiyList : PortalPage
    {      

        protected void Page_PreRender(object sender, EventArgs e)
        {
            RedirectToLoginIfAnonymous(); 
        }
    }
}