using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.Common;

namespace GSC.Rover.DMS.BusinessLogic.City
{
    public class CityHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;



        public CityHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Created By: Raphael Herrera
        /* Purpose:  Common function used to handle duplicate detection when importing entities with city field
         * Registration Details:
         * Event/Message: 
         *      Post/Create: account, contact
         * Primary Entity: Account, Contact
         */
        public Entity SetCity(Entity parentEntity)
        {
            _tracingService.Trace("Started SetCity Method...");
            //EntityCollection parentEntityCollection = CommonHandler.RetrieveRecordsByOneValue(parentEntity.LogicalName, parentEntity.LogicalName + "id",
            //    parentEntity.Id, _organizationService, null, OrderType.Ascending, new[] { "gsc_provinceid", "gsc_cityname", "gsc_cityid", "gsc_provincebillingid", "gsc_billingcityname", "gsc_citybillingid" });
            Entity parentEntityToUpdate = new Entity();
            if(parentEntity.LogicalName == "contact" || parentEntity.LogicalName == "account")
                parentEntityToUpdate = _organizationService.Retrieve(parentEntity.LogicalName, parentEntity.Id, new ColumnSet("gsc_provinceid", "gsc_cityname", "gsc_cityid", "gsc_provincebillingid", "gsc_billingcityname", "gsc_citybillingid"));
            else
                parentEntityToUpdate = _organizationService.Retrieve(parentEntity.LogicalName, parentEntity.Id, new ColumnSet("gsc_provinceid", "gsc_cityname", "gsc_cityid"));
            //Entity parentEntityToUpdate = _organizationService.Retrieve(parentEntity.LogicalName, parentEntity.Id, new ColumnSet(true));
            //Entity parentEntityToUpdate = parentEntityCollection.Entities[0];
            var provinceId = parentEntityToUpdate.Contains("gsc_provinceid") ? parentEntityToUpdate.GetAttributeValue<EntityReference>("gsc_provinceid").Id : Guid.Empty;
            var cityName = parentEntityToUpdate.Contains("gsc_cityname") ? parentEntityToUpdate.GetAttributeValue<String>("gsc_cityname") : String.Empty;

            var cityConditionList = new List<ConditionExpression>
                            {
                                new ConditionExpression("gsc_provinceid", ConditionOperator.Equal, provinceId),
                                new ConditionExpression("gsc_citypn", ConditionOperator.Equal, cityName)
                            };
            EntityCollection cityCollection = CommonHandler.RetrieveRecordsByConditions("gsc_cmn_city", cityConditionList, _organizationService, null, OrderType.Ascending, new[] { "gsc_citypn" });

            _tracingService.Trace("City records retrieved: " + cityCollection.Entities.Count);
            if (cityCollection != null && cityCollection.Entities.Count > 0)
            {
                Entity cityEntity = cityCollection.Entities[0];

                parentEntityToUpdate["gsc_cityid"] = new EntityReference("gsc_cmn_city", cityEntity.Id);
                _tracingService.Trace("City Id set...");
            }

            if (parentEntity.LogicalName == "contact" || parentEntity.LogicalName == "account")
            {
                var provinceBillingId = parentEntityToUpdate.Contains("gsc_provincebillingid") ? parentEntityToUpdate.GetAttributeValue<EntityReference>("gsc_provincebillingid").Id : Guid.Empty;
                var cityBillingName = parentEntityToUpdate.Contains("gsc_billingcityname") ? parentEntityToUpdate.GetAttributeValue<String>("gsc_billingcityname") : String.Empty;
                var billingCityConditionList = new List<ConditionExpression>
                            {
                                new ConditionExpression("gsc_provinceid", ConditionOperator.Equal, provinceBillingId),
                                new ConditionExpression("gsc_citypn", ConditionOperator.Equal, cityBillingName)
                            };
                EntityCollection billingCityCollection = CommonHandler.RetrieveRecordsByConditions("gsc_cmn_city", billingCityConditionList, _organizationService, null, OrderType.Ascending, new[] { "gsc_citypn" });

                //throw new InvalidPluginExecutionException("Ret: " + billingCityCollection.Entities.Count + " " + cityBillingName + " " + provinceBillingId);
                _tracingService.Trace("Billiing City records retrieved: " + cityCollection.Entities.Count);
                if (billingCityCollection != null && billingCityCollection.Entities.Count > 0)
                {
                    Entity cityEntity = billingCityCollection.Entities[0];

                    parentEntityToUpdate["gsc_citybillingid"] = new EntityReference("gsc_cmn_city", cityEntity.Id);
                    _tracingService.Trace("Billing City Id set...");
                    //throw new InvalidPluginExecutionException(cityEntity.LogicalName + "  " + cityBillingName + " " + provinceBillingId);
                }         
            }
            _organizationService.Update(parentEntityToUpdate);
            _tracingService.Trace("Updated contact entity...");

            _tracingService.Trace("Ending SetCity Method...");
            return parentEntityToUpdate;
        }
    }
}
