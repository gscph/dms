using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api.XrmWebService
{
    public static class XrmMultipleRequestHelper
    {
        public static ExecuteMultipleRequest CreateRequest(bool continueOnError = true, bool returnResponses = false)
        {
            ExecuteMultipleRequest requestWithoutResults = null;

            requestWithoutResults = new ExecuteMultipleRequest()
            {
                // Assign settings that define execution behavior: continue on error, return responses. 
                Settings = new ExecuteMultipleSettings()
                {
                    ContinueOnError = continueOnError,
                    ReturnResponses = returnResponses
                },
                // Create an empty organization request collection.
                Requests = new OrganizationRequestCollection()
            };

            return requestWithoutResults;
        }
    }
}