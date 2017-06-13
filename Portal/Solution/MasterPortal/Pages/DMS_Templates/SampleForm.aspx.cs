using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Site.Pages.DMS_Templates
{
    public partial class SampleForm : PortalPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            //FormViewDataSource.FetchXml = string.Format("<fetch mapping='logical'><entity name='{0}'><all-attributes /><filter type='and'><condition attribute = '{1}' operator='eq' value='}'/></filter></entity></fetch>", "contact", "contactid", Contact.ContactId);
        }
    }
}