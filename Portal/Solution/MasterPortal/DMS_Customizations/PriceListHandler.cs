using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml;

namespace Site
{
    public class PriceListHandler
    {
        private readonly IOrganizationService _organizationService;
      

        public PriceListHandler(IOrganizationService service)
        {
            _organizationService = service;          
        }

        public int itemType { get; set; }
        public string productFieldName { get; set; }

      

        //Created By : Jerome Anthony Gerero, Created On : 01/06/2017
        /*Purpose: Send e-mail notification to branches that the default price list has been changed
         * Event/Message:
         *      Post/Update: Default Price List = gsc_default
         *      Post/Create: Default Price List = gsc_default
         * Primary Entity: Sales Return Detail
         */
    

   

     

    
      
        //Created By: Leslie Baliguat
        public void CheckIfThereIsExistingDefaultPriceList(Entity priceList)
        {
            if (!priceList.GetAttributeValue<Boolean>("gsc_default")) { return; }
            var transactionType = priceList.Contains("gsc_transactiontype") ? priceList.GetAttributeValue<OptionSetValue>("gsc_transactiontype").Value : 0;

            var productConditionList = new List<ConditionExpression>
                    {
                        new ConditionExpression("gsc_default", ConditionOperator.Equal, true),
                        new ConditionExpression("gsc_transactiontype", ConditionOperator.Equal,transactionType)
                    };

            EntityCollection priceListCollection = CommonHandler.RetrieveRecordsByConditions("pricelevel", productConditionList, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_default" });

            if (priceListCollection != null && priceListCollection.Entities.Count > 0)
            {
                throw new InvalidPluginExecutionException("Cannot create default price list because there is already an existing default price list.");
            }
        }

        public List<Entity> RetrievePriceList(Entity entity, Int32 transactionType, Int32 priceListType)
        {
           

            List<Entity> effectivePriceList = new List<Entity>();

            QueryExpression retrievePriceList = new QueryExpression("pricelevel");
            retrievePriceList.ColumnSet.AddColumns("gsc_transactiontype", "begindate", "enddate", "gsc_taxstatus");
            retrievePriceList.AddOrder("createdon", OrderType.Descending);
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_promo", ConditionOperator.Equal, false));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_transactiontype", ConditionOperator.Equal, transactionType));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("statecode", ConditionOperator.Equal, 0));

            if (transactionType == 100000000)
            {
                if (priceListType == 100000003)
                    retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_default", ConditionOperator.Equal, true));
                else if (priceListType == 100000002)
                    retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_publish", ConditionOperator.Equal, true));

                retrievePriceList.LinkEntities.Add(new LinkEntity("pricelevel", "gsc_cmn_classmaintenance", "gsc_pricelisttype", "gsc_cmn_classmaintenanceid", JoinOperator.Inner));
                retrievePriceList.LinkEntities[0].LinkCriteria.AddCondition(new ConditionExpression("gsc_type", ConditionOperator.Equal, priceListType));

                if (itemType == 1)
                    retrievePriceList.LinkEntities[0].LinkCriteria.AddCondition(new ConditionExpression("gsc_classmaintenancepn", ConditionOperator.Like, "%Accessory"));
                else if (itemType == 2)
                    retrievePriceList.LinkEntities[0].LinkCriteria.AddCondition(new ConditionExpression("gsc_classmaintenancepn", ConditionOperator.Like, "%Chassis"));
            }
            else
                retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_default", ConditionOperator.Equal, true));

            EntityCollection defaultPriceListCollection = _organizationService.RetrieveMultiple(retrievePriceList);

            if (defaultPriceListCollection != null && defaultPriceListCollection.Entities.Count > 0)
            {
               

                Entity defaultPriceList = defaultPriceListCollection.Entities[0];

                effectivePriceList = GetPriceListitem(entity, defaultPriceList, effectivePriceList);

                if (effectivePriceList.Count != 0)
                {
                    if (CheckifDefaultPriceListIsLatest(defaultPriceList))
                        effectivePriceList.Add(defaultPriceList);
                    else
                        throw new InvalidPluginExecutionException("Default Price List effectivity date is out of date.");
                }

                else
                    RetrieveLatestPriceList(entity, transactionType, effectivePriceList, priceListType);
            }

            else
                RetrieveLatestPriceList(entity, transactionType, effectivePriceList, priceListType);

        

            return effectivePriceList;
        }

        private List<Entity> GetPriceListitem(Entity entity, Entity priceList, List<Entity> effectivePriceList)
        {
            

            var productId = CommonHandler.GetEntityReferenceIdSafe(entity, productFieldName);

            var priceLevelItemConditionList = new List<ConditionExpression>
                {
                    new ConditionExpression("pricelevelid", ConditionOperator.Equal, priceList.Id),
                    new ConditionExpression("productid", ConditionOperator.Equal, productId)
                };

            EntityCollection priceLevelItemCollection = CommonHandler.RetrieveRecordsByConditions("productpricelevel", priceLevelItemConditionList, _organizationService, null, OrderType.Ascending,
                        new[] { "amount" });

            if (priceLevelItemCollection != null && priceLevelItemCollection.Entities.Count > 0)
            {              
                effectivePriceList.Add(priceLevelItemCollection.Entities[0]);
            }
           
            return effectivePriceList;
        }

        private List<Entity> RetrieveLatestPriceList(Entity entity, Int32 transactionType, List<Entity> effectivePriceList, Int32 priceListType)
        {
          

            var dateToday = DateTime.Now.ToShortDateString();
            var branchId = entity.GetAttributeValue<EntityReference>("gsc_branchid") != null
                ? entity.GetAttributeValue<EntityReference>("gsc_branchid").Id
                : Guid.Empty;
         

            QueryExpression retrievePriceList = new QueryExpression("pricelevel");
            retrievePriceList.ColumnSet.AddColumns("name", "gsc_transactiontype", "begindate", "enddate", "gsc_taxstatus");
            retrievePriceList.AddOrder("createdon", OrderType.Descending);
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_promo", ConditionOperator.Equal, false));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_transactiontype", ConditionOperator.Equal, transactionType));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("statecode", ConditionOperator.Equal, 0));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_branchid", ConditionOperator.Equal, branchId));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("begindate", ConditionOperator.LessEqual, dateToday));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("enddate", ConditionOperator.GreaterEqual, dateToday));
            retrievePriceList.Criteria.Conditions.Add(new ConditionExpression("gsc_default", ConditionOperator.LessEqual, false));

            if (transactionType == 100000000)
            {
                retrievePriceList.LinkEntities.Add(new LinkEntity("pricelevel", "gsc_cmn_classmaintenance", "gsc_pricelisttype", "gsc_cmn_classmaintenanceid", JoinOperator.Inner));
                retrievePriceList.LinkEntities[0].LinkCriteria.AddCondition(new ConditionExpression("gsc_type", ConditionOperator.Equal, priceListType));

                if (itemType == 1)
                    retrievePriceList.LinkEntities[0].LinkCriteria.AddCondition(new ConditionExpression("gsc_classmaintenancepn", ConditionOperator.Like, "%Accessory"));
                else if (itemType == 2)
                    retrievePriceList.LinkEntities[0].LinkCriteria.AddCondition(new ConditionExpression("gsc_classmaintenancepn", ConditionOperator.Like, "%Chassis"));
            }

            EntityCollection priceListCollection = _organizationService.RetrieveMultiple(retrievePriceList);

            

         

            if (priceListCollection != null && priceListCollection.Entities.Count > 0)
            {
                

                Entity priceList = priceListCollection.Entities[0];

             

                effectivePriceList = GetPriceListitem(entity, priceList, effectivePriceList);

                if (effectivePriceList.Count != 0)
                    effectivePriceList.Add(priceList);
            }
            else
                throw new InvalidPluginExecutionException("There is no effecive Price List for the selected Vehicle.");

           

            return effectivePriceList;
        }

        public Boolean CheckifDefaultPriceListIsLatest(Entity priceList)
        {
          

            var dateToday = Convert.ToDateTime(DateTime.Now.ToShortDateString());
            var beginDate = Convert.ToDateTime(priceList.GetAttributeValue<DateTime>("begindate").ToShortDateString());
            var endDate = Convert.ToDateTime(priceList.GetAttributeValue<DateTime>("enddate").ToShortDateString());

            if (beginDate <= dateToday && endDate >= dateToday)
            {
                
                return true;
            }          

            return false;
        }

        //UnTag record as global if not yet published
        public Entity ValidateGlobal(Entity priceList)
        {
            var isGlobal = priceList.GetAttributeValue<Boolean>("gsc_isglobalrecord");
            var isPublish = priceList.GetAttributeValue<Boolean>("gsc_publish");
            var publishEnabled = priceList.GetAttributeValue<Boolean>("gsc_publishenabled");

            if (isPublish == false && isGlobal == true)
            {
                Entity priceListToUpdate = _organizationService.Retrieve(priceList.LogicalName, priceList.Id,
                    new ColumnSet("gsc_isglobalrecord", "gsc_publishenabled"));
                priceListToUpdate["gsc_isglobalrecord"] = false;

                if (isGlobal == true && publishEnabled == false)
                {
                    priceListToUpdate["gsc_publishenabled"] = true;
                }

                _organizationService.Update(priceListToUpdate);

                return priceListToUpdate;
            }
            else if (isPublish == true && isGlobal == false)
            {
                Entity priceListToUpdate = _organizationService.Retrieve(priceList.LogicalName, priceList.Id,
                    new ColumnSet("gsc_isglobalrecord"));
                priceListToUpdate["gsc_isglobalrecord"] = true;
                _organizationService.Update(priceListToUpdate);

                return priceListToUpdate;
            }

            return null;
        }

        //Created By: Jerome Anthony Gerero, Created On: 04/21/17
        /*Purpose: Update accessory sell price if price list has been published.
         * Event/Message:
         *      Post/Update: Published = gsc_publish
         * Primary Entity: Price List
         */
        public Entity UpdateAccessorySellPrice(Entity priceListEntity)
        {
            

            Boolean isPublished = priceListEntity.GetAttributeValue<Boolean>("gsc_publish");

            var classId = priceListEntity.Contains("gsc_pricelisttype")
                ? priceListEntity.GetAttributeValue<EntityReference>("gsc_pricelisttype").Id
                : Guid.Empty;

         

            Boolean isLatest = CheckifDefaultPriceListIsLatest(priceListEntity);
            if (classId != Guid.Empty)
            {
                Entity classEntity = _organizationService.Retrieve("gsc_cmn_classmaintenance", classId, new ColumnSet("gsc_type"));
                if (isPublished == false || !classEntity.FormattedValues["gsc_type"].Equals("Item") || isLatest == false) { return null; }
            }

            EntityCollection productPriceLevelRecords = CommonHandler.RetrieveRecordsByOneValue("productpricelevel", "pricelevelid", priceListEntity.Id, _organizationService, null, OrderType.Ascending,
                new[] { "amount", "productid" });

            if (productPriceLevelRecords != null && productPriceLevelRecords.Entities.Count > 0)
            {
                foreach (Entity productPriceLevel in productPriceLevelRecords.Entities)
                {
                    Decimal amount = productPriceLevel.Contains("amount")
                        ? productPriceLevel.GetAttributeValue<Money>("amount").Value
                        : Decimal.Zero;

                    Guid productId = productPriceLevel.GetAttributeValue<EntityReference>("productid") != null
                        ? productPriceLevel.GetAttributeValue<EntityReference>("productid").Id
                        : Guid.Empty;

                    EntityCollection vehicleAccessoryRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_sls_vehicleaccessory", "gsc_itemid", productId, _organizationService, null, OrderType.Ascending,
                        new[] { "gsc_sellingprice" });

                    if (vehicleAccessoryRecords != null && vehicleAccessoryRecords.Entities.Count > 0)
                    {
                        foreach (Entity vehicleAccessory in vehicleAccessoryRecords.Entities)
                        {
                            if (amount > 0)
                            {
                                vehicleAccessory["gsc_sellingprice"] = new Money(amount);

                                _organizationService.Update(vehicleAccessory);
                            }
                        }
                    }

                }
            }

            
            return priceListEntity;
        }
    }
}