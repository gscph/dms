using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Site.Areas.DMS_Api.Models;
using Site.Areas.DMSApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api.XrmWebService
{
    public static class XrmCommonHelper
    {     
        public static dynamic ConvertField(ClientEntity clientData)
        {
            if (clientData.type == "System.DateTime")
            {
                return Convert.ToDateTime(clientData.Value);
            }
            else if (clientData.type == "System.Double")
            {
                if (clientData.Value == null)
                {                    
                    return Convert.ToDouble(0);
                }
                return Convert.ToDouble(clientData.Value);
            }
            else if (clientData.type == "System.Int32")
            {
                if (clientData.Value == null)
                {
                    return 0;
                }
                return Convert.ToInt32(clientData.Value);
            }
            else if (clientData.type == "System.Decimal")
            {
                if (clientData.Value == null)
                {
                    return Decimal.Zero;
                }
                return Convert.ToDecimal(clientData.Value);
            }
            else if (clientData.type == "System.Boolean")
            {
                if (clientData.Value == "True")
                {
                    return true;
                }
                return Convert.ToBoolean(clientData.Value);
            }
            else if (clientData.type == "System.Currency")
            {
                decimal value = Convert.ToDecimal(clientData.Value);

                if (clientData.Value == null)
                {
                    return new Money(Decimal.Zero);
                }

                return new Money(Convert.ToDecimal(clientData.Value));
            }
            else if (clientData.type == "Microsoft.Xrm.Sdk.OptionSetValue")
            {
                OptionSetValue optSet = new OptionSetValue();
                optSet.Value = Convert.ToInt32(clientData.Value);
                return optSet;
            }
            else if (clientData.type == "Microsoft.Xrm.Sdk.EntityReference")
            {
                return new EntityReference(clientData.entity, new Guid(clientData.Value));
            }
            return clientData.Value;
        }
        public static EntityMetadata GetEntityMetaData(IXrmConnection service, string logicalName)
        {
            RetrieveEntityRequest mdRequest = new RetrieveEntityRequest()
            {
                EntityFilters = EntityFilters.All,
                LogicalName = logicalName,
                RetrieveAsIfPublished = false
            };

            // Execute the request
            RetrieveEntityResponse entityResponse = (RetrieveEntityResponse)service.ServiceContext.Execute(mdRequest);
          
            return entityResponse.EntityMetadata;
        }
    }
}