using Microsoft.Xrm.Client;
using Microsoft.Xrm.Client.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class XrmConnection : IXrmConnection
    {
        public virtual string ConnectionString
        {
            get
            {
                string connectionStringName = "Xrm"; 
                var context = HttpContext.Current;

                if (context != null)
                {
                    var request = context.Request.RequestContext;
                    var cookies = request.HttpContext.Request.Cookies;
                    HttpCookie branchCookie = null;

                    if (cookies != null)
                    {
                        branchCookie = cookies["Branch"];

                        if (branchCookie != null)
                        {
                            connectionStringName = branchCookie["branch"];
                        }
                    }
                }

                return ConfigurationManager.ConnectionStrings[connectionStringName].ConnectionString.ToString();
            }
        }

        public virtual OrganizationService ServiceContext
        {
            get
            {

                return new OrganizationService(CrmConnection.Parse(this.ConnectionString));
            }
        }
    }
}