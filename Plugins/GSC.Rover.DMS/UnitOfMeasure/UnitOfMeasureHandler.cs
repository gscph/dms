using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GSC.Rover.DMS.BusinessLogic.UnitOfMeasure
{
    public class UnitOfMeasureHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public UnitOfMeasureHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Created By: Leslie Baliguat, Created On: 05/22/17
        public Entity UpdateUoMScheduleId(Entity uomEntity)
        {
            QueryExpression retrieveScheduleQuery = new QueryExpression("uomschedule");
            retrieveScheduleQuery.ColumnSet.AddColumns("name");
            retrieveScheduleQuery.Criteria.AddCondition(new ConditionExpression("name", ConditionOperator.Equal, "Default Unit"));

            EntityCollection uomScheduleCollection = _organizationService.RetrieveMultiple(retrieveScheduleQuery);

            if(uomScheduleCollection != null && uomScheduleCollection.Entities.Count > 0)
            {
                uomEntity["uomscheduleid"] = new EntityReference("uomschedule", uomScheduleCollection.Entities[0].Id);
            }

            return uomEntity;
        }
    }
}
