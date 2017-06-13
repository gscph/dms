using Microsoft.Xrm.Client.Configuration;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Site
{
    public class CustomCrmConfigurationProvider : CrmConfigurationProvider
    {
        public override ConnectionStringSettings CreateConnectionStringSettings(string connectionStringName)
        {
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
            else
            {
                connectionStringName = "Xrm";
            }
           
         
            return base.CreateConnectionStringSettings(connectionStringName);
        } 
    }
}