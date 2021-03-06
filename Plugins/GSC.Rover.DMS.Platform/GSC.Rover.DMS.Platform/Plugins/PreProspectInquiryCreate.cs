// <copyright file="PreProspectInquiryCreate.cs" company="">
// Copyright (c) 2016 All Rights Reserved
// </copyright>
// <author></author>
// <date>2/1/2016 10:17:59 AM</date>
// <summary>Implements the PreProspectInquiryCreate Plugin.</summary>
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
// </auto-generated>
namespace GSC.Rover.DMS.Platform.Plugins
{
    using System;
    using System.ServiceModel;
    using Microsoft.Xrm.Sdk;
    using GSC.Rover.DMS.BusinessLogic.ProspectInquiry;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;
using System.Collections.Generic;
    /// <summary>
    /// PreProspectInquiryCreate Plugin.
    /// </summary>    
    public class PreProspectInquiryCreate: Plugin
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PreProspectInquiryCreate"/> class.
        /// </summary>
        public PreProspectInquiryCreate()
            : base(typeof(PreProspectInquiryCreate))
        {
            base.RegisteredEvents.Add(new Tuple<int, string, string, Action<LocalPluginContext>>(20, "Create", "lead", new Action<LocalPluginContext>(ExecutePreProspectInquiryCreate)));

            // Note : you can register for more events here if this plugin is not specific to an individual entity and message combination.
            // You may also need to update your RegisterFile.crmregister plug-in registration file to reflect any change.
        }

        /// <summary>
        /// Executes the plug-in.
        /// </summary>
        /// <param name="localContext">The <see cref="LocalPluginContext"/> which contains the
        /// <see cref="IPluginExecutionContext"/>,
        /// <see cref="IOrganizationService"/>
        /// and <see cref="ITracingService"/>
        /// </param>
        /// <remarks>
        /// For improved performance, Microsoft Dynamics CRM caches plug-in instances.
        /// The plug-in's Execute method should be written to be stateless as the constructor
        /// is not called for every invocation of the plug-in. Also, multiple system threads
        /// could execute the plug-in at the same time. All per invocation state information
        /// is stored in the context. This means that you should not use global variables in plug-ins.
        /// </remarks>
        protected void ExecutePreProspectInquiryCreate(LocalPluginContext localContext)
        {
            if (localContext == null)
            {
                throw new ArgumentNullException("localContext");
            }

            IPluginExecutionContext context = localContext.PluginExecutionContext;
            IOrganizationService service = localContext.OrganizationService;
            ITracingService trace = localContext.TracingService;
            Entity prospectInquiry = (Entity)context.InputParameters["Target"];

            if (!(context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)) { return; }

            if (prospectInquiry.LogicalName != "lead") { return; }

            string message = context.MessageName;

            if (context.Mode == 0) //synchronous plugin
            {
                try
                {
                    ProspectInquiryHandler prospectInquiryHandler = new ProspectInquiryHandler(service, trace);
                    prospectInquiryHandler.GetDefaultTax();
                    prospectInquiryHandler.ReplicateProspectInfo(prospectInquiry);
                    prospectInquiryHandler.ConcatenateVehicleInfo(prospectInquiry, message);
                    //set Portal User Id
                    prospectInquiry["gsc_portaluserid"] = prospectInquiry.GetAttributeValue<EntityReference>("gsc_recordownerid") != null
                        ? prospectInquiry.GetAttributeValue<EntityReference>("gsc_recordownerid").Id.ToString()
                        : String.Empty;
                    //Set Name for corporate
                    var prospectType = prospectInquiry.Contains("gsc_prospecttype") ? prospectInquiry.GetAttributeValue<OptionSetValue>("gsc_prospecttype").Value : 0;
                    if (prospectType != 100000000)
                    {
                        prospectInquiry["gsc_prospectname"] = prospectInquiry.GetAttributeValue<String>("companyname") != null
                        ? prospectInquiry.GetAttributeValue<String>("companyname")
                        : String.Empty;
                    }
                    else
                    {
                        prospectInquiry["gsc_prospectname"] = prospectInquiry.GetAttributeValue<String>("fullname") != null
                        ? prospectInquiry.GetAttributeValue<String>("fullname")
                        : String.Empty;
                    }

                    if (prospectInquiryHandler.CheckForExistingRecords(prospectInquiry) == true)
                    {
                        throw new InvalidPluginExecutionException("This record has been identified as a fraud account. Please ask the customer to provide further information.");
                    }

                }
                catch (Exception ex)
                {
                    if (ex.Message.Contains("This record has been identified as a fraud account. Please ask the customer to provide further information."))
                    {
                        throw new InvalidPluginExecutionException("This record has been identified as a fraud account. Please ask the customer to provide further information.");
                    }
                    else
                    {
                        throw new InvalidPluginExecutionException(ex.Message);
                    }
                }
            }
        }
    }
}
