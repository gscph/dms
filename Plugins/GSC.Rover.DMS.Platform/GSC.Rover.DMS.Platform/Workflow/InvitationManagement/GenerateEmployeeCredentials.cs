// <copyright file="GenerateEmployeeCredentials.cs" company="">
// Copyright (c) 2016 All Rights Reserved
// </copyright>
// <author></author>
// <date>10/18/2016 10:06:29 AM</date>
// <summary>Implements the GenerateEmployeeCredentials Workflow Activity.</summary>
namespace GSC.Rover.DMS.Platform.Workflow.InvitationManagement
{
    using System;
    using System.Activities;
    using System.ServiceModel;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Workflow;
    using GSC.Rover.DMS.BusinessLogic.Invitation;

    public sealed class GenerateEmployeeCredentials : CodeActivity
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

            tracingService.Trace("Entered GenerateEmployeeCredentials.Execute(), Activity Instance Id: {0}, Workflow Instance Id: {1}",
                executionContext.ActivityInstanceId,
                executionContext.WorkflowInstanceId);

            // Create the context
            IWorkflowContext context = executionContext.GetExtension<IWorkflowContext>();

            if (context == null)
            {
                throw new InvalidPluginExecutionException("Failed to retrieve workflow context.");
            }

            tracingService.Trace("GenerateEmployeeCredentials.Execute(), Correlation Id: {0}, Initiating User: {1}",
                context.CorrelationId,
                context.InitiatingUserId);

            IOrganizationServiceFactory serviceFactory = executionContext.GetExtension<IOrganizationServiceFactory>();
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            try
            {
                //Retrieving entity
                Entity invitationEntity = service.Retrieve(context.PrimaryEntityName, context.PrimaryEntityId, new Microsoft.Xrm.Sdk.Query.ColumnSet(true));

                InvitationHandler invitationHandler = new InvitationHandler(service, tracingService);
                invitationHandler.SendEmployeeCredentials(invitationEntity);
            }
            catch (FaultException<OrganizationServiceFault> e)
            {
                // Handle the exception.
                throw new InvalidPluginExecutionException("Exception: " + e.ToString());
            }

            tracingService.Trace("Exiting GenerateEmployeeCredentials.Execute(), Correlation Id: {0}", context.CorrelationId);
        }
    }
}