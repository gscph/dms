using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.Common;

namespace GSC.Rover.DMS.BusinessLogic.VehicleTransferDetails
{
    public class VehicleTransferDetailsHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public VehicleTransferDetailsHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        public Boolean isValidDestinationSite(Entity transferDetails)
        {
            Guid destinationSite = transferDetails.Contains("gsc_destinationsiteid") ? transferDetails.GetAttributeValue<EntityReference>("gsc_destinationsiteid").Id : Guid.Empty;
            Guid sourceSite = transferDetails.Contains("gsc_sourcesiteid") ? transferDetails.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Id : Guid.Empty;

            return !(destinationSite == sourceSite);
        }
    }
}

