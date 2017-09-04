using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Crm.Sdk;
using Microsoft.Crm.Sdk.Messages;

namespace GSC.Rover.DMS.BusinessLogic.ApproverSetup
{
    public class ApproverSetupHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public ApproverSetupHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Created By: Leslie G. Baliguat, Created On: 01/25/2017
        public void RestrictMultipleSetup(Entity approver)
        {
            _tracingService.Trace("Started RestrictDuplicateSetup method...");

            Int32 recordtype = approver.Contains("gsc_transactiontype")
                ? approver.GetAttributeValue<OptionSetValue>("gsc_transactiontype").Value
                : 0;

            var setupConditionList = new List<ConditionExpression>
                {
                    new ConditionExpression("gsc_branchid", ConditionOperator.Equal, CommonHandler.GetEntityReferenceIdSafe(approver, "gsc_branchid")),
                    new ConditionExpression("statecode", ConditionOperator.Equal, 0),
                    new ConditionExpression("gsc_cmn_approversetupid", ConditionOperator.NotEqual, approver.Id),
                    new ConditionExpression("gsc_transactiontype", ConditionOperator.Equal, recordtype)
                };

            EntityCollection approverSetupCollection = CommonHandler.RetrieveRecordsByConditions("gsc_cmn_approversetup", setupConditionList, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_cmn_approversetupid" });

            _tracingService.Trace("Branch: " + CommonHandler.GetEntityReferenceIdSafe(approver, "gsc_branchid").ToString());
            _tracingService.Trace("Retrieve Records: " + approverSetupCollection.Entities.Count.ToString());

            if (approverSetupCollection != null && approverSetupCollection.Entities.Count > 0)
            {
                throw new InvalidPluginExecutionException("There is already an existing approver setup for this branch.");
            }

            _tracingService.Trace("Ended RestrictDuplicateSetup method...");
        }

        //Created By: Leslie Baliguat, Created On: 9/4/2017
        /* Purpose: Associate Department of a specific branch to employee
         * Registration Details:
         * Event/Message: 
         *      Pre/Create: 
         * Primary Entity: Contact
         */
        public Entity GetApproverSetup(Entity approverDetails)
        {
            var approverSetupId = approverDetails.GetAttributeValue<EntityReference>("gsc_approversetupid") != null
                ? approverDetails.GetAttributeValue<EntityReference>("gsc_approversetupid").Id
                : Guid.Empty;

            if (approverSetupId == Guid.Empty)
            {
                var approverSetup = approverDetails.Contains("gsc_approversetup")
                    ? approverDetails.GetAttributeValue<String>("gsc_approversetup")
                    : String.Empty;

                var approverConditionList = new List<ConditionExpression>
                                {
                                    new ConditionExpression("gsc_approversetuppn", ConditionOperator.Equal, approverDetails),
                                    new ConditionExpression("gsc_branchid", ConditionOperator.Equal, CommonHandler.GetEntityReferenceIdSafe(approverDetails, "gsc_branchid"))
                                };

                EntityCollection approverCollection = CommonHandler.RetrieveRecordsByConditions("gsc_cmn_approversetup", approverConditionList, _organizationService, null, OrderType.Ascending,
                     new[] { "gsc_approversetuppn" });

                if (approverCollection != null && approverCollection.Entities.Count > 0)
                {
                    approverDetails["gsc_approversetupid"] = new EntityReference("gsc_cmn_approversetup", approverCollection.Entities[0].Id);
                }
                else
                {
                    throw new InvalidPluginExecutionException("Approver Setup does not exists in the system.");
                }
            }
            return approverDetails;
        }
    }
}
