using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Adxstudio.Xrm.Cms.Security;
using Microsoft.Xrm.Client.Security;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Site.Areas.DMSApi;
using Site.Areas.DMS_Api;
using Adxstudio.Xrm.Security;
using Microsoft.Xrm.Sdk.Metadata;

namespace Site.Configuration
{
    public class SecurityProvider : CrmEntityPermissionProvider
    {
        public override bool TryAssert(OrganizationServiceContext serviceContext, CrmEntityPermissionRight right, Entity entity, EntityMetadata entityMetadata = null, bool readGranted = false)
        {            
            ////if (entity.LogicalName == "quote")
            ////{
            ////    return false;
            ////}
            ////return base.TryAssert(context, entity, right);
            //return false;
            //if (!entity.LogicalName.Contains("adx"))
            //{
            //    if (entity.LogicalName.Contains("gsc_sls_prospect"))
            //    {
            //        return true;   
            //    }
            //    return false;
            //}
            //return true;

            if (entity.LogicalName == "gsc_sls_prospect")
            {
                return false;
            }
            return base.TryAssert(serviceContext, right, entity);
        }       
    }
}