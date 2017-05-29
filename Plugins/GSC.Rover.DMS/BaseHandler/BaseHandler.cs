using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;

namespace GSC.Rover.DMS.BusinessLogic.Base
{
    public abstract class BaseHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;
        private readonly Entity _currentEntity;

        public BaseHandler(IOrganizationService service, ITracingService trace, Entity currentEntity)
        {
            _organizationService = service;
            _tracingService = trace;
            _currentEntity = currentEntity;
        }

        public void SetEntityFieldFromService<T>(string currentEntityReferenceAttribute, string referenceEntityName, string referenceEntityAttribute) {
            //_tracingService.Trace("Started Changing Theme Url");

            //Guid ReferenceId = CommonHandler.GetEntityReferenceIdSafe(_currentEntity, "gsc_themes");
            //if (theme == default(Guid)) return;

            //_tracingService.Trace("Modify Contact Record's theme url and perform Update");

            //_currentEntity["gsc_themeurl"] = _organizationService.Retrieve("adx_webfile", theme, new ColumnSet("adx_partialurl"))["adx_partialurl"].ToString();

            //_organizationService.Update(_currentEntity);
            //_tracingService.Trace("Ended Changing Theme Url");
        }
    }
}
