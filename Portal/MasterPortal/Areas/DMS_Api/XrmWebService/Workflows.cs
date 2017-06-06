using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Site.Areas.DMS_Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMSApi
{
    public class WorkFlowTrigger
    {
        private readonly IXrmConnection _service;

        public WorkFlowTrigger(IXrmConnection service)
        {           
            _service = service;           
        }

        public void RunWorkFlow(string workFlowName, Guid recordId)
        {
            QueryExpression objQueryExpression = new QueryExpression("workflow");
            objQueryExpression.ColumnSet = new ColumnSet(true);
            objQueryExpression.Criteria.AddCondition(new ConditionExpression("name", ConditionOperator.Equal, workFlowName));
            EntityCollection entColWorkflows = _service.ServiceContext.RetrieveMultiple(objQueryExpression);
            
            if (entColWorkflows != null && entColWorkflows.Entities.Count > 0)
            {
                // Create an ExecuteWorkflow request.
                ExecuteWorkflowRequest request = new ExecuteWorkflowRequest()
                {
                    WorkflowId = entColWorkflows.Entities[0].GetAttributeValue<EntityReference>("parentworkflowid").Id,
                    EntityId = recordId
                };

                // Execute the workflow.
                ExecuteWorkflowResponse response =
                    (ExecuteWorkflowResponse)_service.ServiceContext.Execute(request);
            }
        }

        public void RunMultipleWorkFlows(string workFlowName, IEnumerable<Guid> recordIds)
        {
            foreach (Guid id in recordIds)
            {
                RunWorkFlow(workFlowName, id);
            }
        }
    }
}