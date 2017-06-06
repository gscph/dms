using Adxstudio.Xrm.Web.UI.WebControls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Site.MasterPages
{
    public partial class DMS_Forms : PortalMasterPage
    {
        public WebForm AdxWebFormControl
        {
            get { return WebFormControl; }
        }

        public EntityForm AdxEntityFormControl
        {
            get { return EntityFormControl; }
        }

        public CrmEntityFormView AdxEntityFormViewControl
        {
            get
            {
                return EntityFormControl == null ? null : GetEntityFormView(EntityFormControl.Controls);
            }
        }

        public EntityList AdxEntityListControl
        {
            get { return EntityListControl; }
        }

        public CrmEntityListView AdxEntityListViewControl
        {
            get
            {
                return EntityListControl == null ? null : GetEntityListView(EntityListControl.Controls);
            }
        }

        protected void Page_Load(object sender, EventArgs e)
        {

        }

        protected void Page_PreRender(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(Page.Form.Action))
            {
                Page.Form.Action = Request.Url.PathAndQuery;
            }
        }

        private CrmEntityFormView GetEntityFormView(ControlCollection controls)
        {
            CrmEntityFormView formView = null;

            foreach (Control control in controls)
            {
                if (control is CrmEntityFormView)
                {
                    formView = (CrmEntityFormView)control;
                    break;
                }
                else
                {
                    formView = GetEntityFormView(control.Controls);
                    if (formView != null) break;
                }
            }

            return formView;
        }

        private CrmEntityListView GetEntityListView(ControlCollection controls)
        {
            CrmEntityListView listView = null;

            foreach (Control control in controls)
            {
                if (control is CrmEntityListView)
                {
                    listView = (CrmEntityListView)control;
                    break;
                }
                else
                {
                    listView = GetEntityListView(control.Controls);
                    if (listView != null) break;
                }
            }

            return listView;
        }

     
    }
      
}