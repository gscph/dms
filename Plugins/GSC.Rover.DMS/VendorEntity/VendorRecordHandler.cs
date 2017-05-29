using GSC.Rover.DMS.BusinessLogic.Base;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;

namespace GSC.Rover.DMS.BusinessLogic.VendorRecordHandler
{
    public class VendorRecordHandler : BaseHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;
        private readonly Entity _currentEntity;

        public VendorRecordHandler(IOrganizationService service, ITracingService trace, Entity currentEntity) : base (service, trace, currentEntity) 
        {
            _organizationService = service;
            _tracingService = trace;
            _currentEntity = currentEntity;
        }

        public void SetIsVendorRecordAttribute()
        {
           Guid recordOwnerId = CommonHandler.GetEntityReferenceIdSafe(_currentEntity, "gsc_recordownerid");

           if (recordOwnerId != default(Guid))
           {
              Entity businessUnit = _organizationService.Retrieve("contact", recordOwnerId, new ColumnSet("parentbusinessunitid"));
              EntityReference parentBusinessUnit = CommonHandler.GetEntityAttributeSafe<EntityReference>(businessUnit, "parentbusinessunitid");

              if (parentBusinessUnit == null)
              {
                  _currentEntity["gsc_isglobalrecord"] = true;
              }
           }          
        }
    }
}
