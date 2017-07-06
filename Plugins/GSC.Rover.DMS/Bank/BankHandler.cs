using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GSC.Rover.DMS.BusinessLogic.City;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace GSC.Rover.DMS.BusinessLogic.Bank
{
    public class BankHandler
    {
         private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public BankHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        public Entity SetCity(Entity accountEntity)
        {
            CityHandler cityHandler = new CityHandler(_organizationService, _tracingService);
            return cityHandler.SetCity(accountEntity);
        }
    }
}
