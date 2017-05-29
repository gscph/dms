// <copyright file="GetPOApproverInformation.cs" company="">
// Copyright (c) 2016 All Rights Reserved
// </copyright>
// <author></author>
// <date>4/28/2016 4:40:20 PM</date>
// <summary>Implements the GetPOApproverInformation Workflow Activity.</summary>
namespace GSC.Rover.DMS.Platform.Workflow.PurchaseManagement
{
    using System;
    using System.Activities;
    using System.ServiceModel;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Workflow;
    using GSC.Rover.DMS.BusinessLogic.PurchaseOrder;

    public sealed class GetPOApproverInformation : CodeActivity
    {
        /// <summary>
        /// Executes the workflow activity.
        /// </summary>
        /// <param name="executionContext">The execution context.</param>
        protected override void Execute(CodeActivityContext executionContext)
        {
            // Create the tracing service
            ITracingService tracingService = executionContext.GetExtension<ITracingService>();

            if (tracingService == null)
            {
                throw new InvalidPluginExecutionException("Failed to retrieve tracing service.");
            }

            tracingService.Trace("Entered GetPOApproverInformation.Execute(), Activity Instance Id: {0}, Workflow Instance Id: {1}",
                executionContext.ActivityInstanceId,
                executionContext.WorkflowInstanceId);

            // Create the context
            IWorkflowContext context = executionContext.GetExtension<IWorkflowContext>();

            if (context == null)
            {
                throw new InvalidPluginExecutionException("Failed to retrieve workflow context.");
            }

            tracingService.Trace("GetPOApproverInformation.Execute(), Correlation Id: {0}, Initiating User: {1}",
                context.CorrelationId,
                context.InitiatingUserId);

            IOrganizationServiceFactory serviceFactory = executionContext.GetExtension<IOrganizationServiceFactory>();
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            try
            {
                if (!(context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)) { return; }
                Entity purchaseOrderEntity = (Entity)context.InputParameters["Target"];

                PurchaseOrderHandler purchaseOrderHandler = new PurchaseOrderHandler(service, tracingService);
                purchaseOrderHandler.GetLevel1ApproverEmails(purchaseOrderEntity);

                //EntityReference marketingListRef = new EntityReference("list", marketingListId);
                //EntityReference marketingListRef = new EntityReference("list", purchaseOrderEntity.Id);
                //MarketingListRef.Set(executionContext, marketingListId);
            }
            catch (FaultException<OrganizationServiceFault> e)
            {
                tracingService.Trace("Exception: {0}", e.ToString());

                // Handle the exception.
                throw;
            }

            tracingService.Trace("Exiting GetPOApproverInformation.Execute(), Correlation Id: {0}", context.CorrelationId);
        }
        
        //[Output("Level 1 Approvers")]
        //[ReferenceTarget("gsc_svc_purchaseorder")]
        //[AttributeTarget("email", "to")]
        //public OutArgument<Int32> MarketingListRef { get; set; }
    }
}