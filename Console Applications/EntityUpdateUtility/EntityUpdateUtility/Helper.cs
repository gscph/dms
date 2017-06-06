using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EntityUpdateUtility
{
    static class Helper
    {
        public static ExecuteMultipleRequest CreateExecuteMultipleRequest(bool continueOnError = true, bool returnResponses = false)
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

        public static ExecuteMultipleRequest CreateRetrieveEntityRequests(IEnumerable<string> entityLogicalNames)
        {
            ExecuteMultipleRequest requestWithtResults = CreateExecuteMultipleRequest(true, true);
            foreach (string logicalName in entityLogicalNames)
            {
                RetrieveEntityRequest request = new RetrieveEntityRequest
                {
                    EntityFilters = EntityFilters.All,
                    LogicalName = logicalName,
                    RetrieveAsIfPublished = false
                };
                requestWithtResults.Requests.Add(request);
            }

            return requestWithtResults;
        }
    }
}
