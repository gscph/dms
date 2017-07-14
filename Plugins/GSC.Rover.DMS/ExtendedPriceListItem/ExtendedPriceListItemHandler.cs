using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GSC.Rover.DMS.BusinessLogic.Common;
using GSC.Rover.DMS.BusinessLogic.PriceListItem;

namespace GSC.Rover.DMS.BusinessLogic.ExtendedPriceListItem
{
    public class ExtendedPriceListItemHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public ExtendedPriceListItemHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        public void OnImportVehiclePriceListItem(Entity extendedPriceListItem)
        {
            _tracingService.Trace("Started OnImportVehiclePriceListItem Method..");

            var productId = CommonHandler.GetEntityReferenceIdSafe(extendedPriceListItem, "gsc_productid");
            Entity productEntity = new Entity();

            if (productId != Guid.Empty)
            {
                _tracingService.Trace("Product not empty.");

                productEntity = GetProductDetails(productId);
                var productType = productEntity.Contains("gsc_producttype")
                    ? productEntity.GetAttributeValue<OptionSetValue>("gsc_producttype").Value
                    : 0;

                //Not Vehicle
                if (productType != 100000000)
                {
                    _tracingService.Trace("Product not vehicle.");
                    return;
                }

                _tracingService.Trace("Product is a vehicle.");
            }
            else
            {
                _tracingService.Trace("Product Id empty.");

                var optionCode = extendedPriceListItem.Contains("gsc_optioncode")
                    ? extendedPriceListItem.GetAttributeValue<String>("gsc_optioncode")
                    : String.Empty;
                var modelCode = extendedPriceListItem.Contains("gsc_modelcode")
                    ? extendedPriceListItem.GetAttributeValue<String>("gsc_modelcode")
                    : String.Empty;

                //Not Vehicle Price List item
                if (optionCode == String.Empty && modelCode == String.Empty)
                {
                    _tracingService.Trace("Product not vehicle.");
                    return;
                }
                else
                {
                    _tracingService.Trace("Product is a vehicle.");
                    PriceListItemHandler priceListItemHandler = new PriceListItemHandler(_organizationService, _tracingService);
                    productEntity = priceListItemHandler.OnImportGetVehicle(extendedPriceListItem);
                }
            }

            UpdateExtendedPriceListItemDetails(extendedPriceListItem, productEntity);
            Guid priceListItemId = CreatePriceLisItem(extendedPriceListItem, productEntity);
            AssociateExtendedtoPriceListItem(extendedPriceListItem.Id, priceListItemId);

            _tracingService.Trace("Ended OnImportVehiclePriceListItem Method..");
        }

        private Entity GetProductDetails(Guid productId)
        {
            _tracingService.Trace("Get Product Details.");

            EntityCollection productCollection = CommonHandler.RetrieveRecordsByOneValue("product", "productid", productId, _organizationService, null, OrderType.Ascending,
                new[] { "name", "gsc_modelyear", "gsc_modelcode", "gsc_optioncode", "gsc_producttype", "productnumber", "gsc_vehiclemodelid" });

            if (productCollection != null && productCollection.Entities.Count > 0)
            {
                _tracingService.Trace("Retrieved Product Details.");
                return productCollection.Entities[0];
            }
            return null;
        }

        private Entity UpdateExtendedPriceListItemDetails(Entity extendedPriceListItem, Entity productEntity)
        {
            _tracingService.Trace("Started UpdateExtendedPriceListItemDetails.");

            var priceListId = CommonHandler.GetEntityReferenceIdSafe(extendedPriceListItem, "gsc_pricelistid");
            var priceListName = "";
            var productName = productEntity.Contains("name") 
                ? productEntity.GetAttributeValue<String>("name")
                : "";
            var productType = productEntity.Contains("gsc_producttype")
                ? productEntity.GetAttributeValue<OptionSetValue>("gsc_producttype").Value
                : 0;

            EntityCollection pricelistCollection = CommonHandler.RetrieveRecordsByOneValue("pricelevel", "pricelevelid", priceListId, _organizationService, null, OrderType.Ascending,
                new[] { "name" });

            if (pricelistCollection != null && pricelistCollection.Entities.Count > 0)
            {
                Entity priceList = pricelistCollection.Entities[0];
                priceListName = priceList.GetAttributeValue<String>("name");
            }

            Entity extendedtoUpdate = _organizationService.Retrieve("gsc_cmn_extendedpricelistitem", extendedPriceListItem.Id,
                new ColumnSet( "gsc_productid", "gsc_extendedpricelistitempn", "gsc_modelyear", "gsc_modelcode", "gsc_optioncode",
                    "gsc_basemodelid", "gsc_itemnumber"));

            if (extendedtoUpdate != null)
            {
                extendedtoUpdate["gsc_productid"] = new EntityReference("product", productEntity.Id);
                extendedtoUpdate["gsc_extendedpricelistitempn"] = priceListName + "-" + productName;

                if (productType == 100000000)
                {
                    extendedtoUpdate["gsc_modelyear"] = productEntity.Contains("gsc_modelyear")
                        ? productEntity.GetAttributeValue<String>("gsc_modelyear")
                        : String.Empty;
                    extendedtoUpdate["gsc_modelcode"] = productEntity.Contains("gsc_modelcode")
                        ? productEntity.GetAttributeValue<String>("gsc_modelcode")
                        : String.Empty;
                    extendedtoUpdate["gsc_optioncode"] = productEntity.Contains("gsc_optioncode")
                        ? productEntity.GetAttributeValue<String>("gsc_optioncode")
                        : String.Empty;
                    extendedtoUpdate["gsc_basemodelid"] = productEntity.GetAttributeValue<EntityReference>("gsc_vehiclemodelid") != null
                        ? productEntity.GetAttributeValue<EntityReference>("gsc_vehiclemodelid")
                        : null;
                }
                else if (productType == 100000001)
                {
                    extendedtoUpdate["gsc_itemnumber"] = productEntity.Contains("productnumber")
                        ? productEntity.GetAttributeValue<String>("productnumber")
                        : String.Empty;
                }

                _organizationService.Update(extendedtoUpdate);
            }

            _tracingService.Trace("Ended UpdateExtendedPriceListItem.");

            return extendedPriceListItem;
        }

        //Created By : Artum M. Ramos, Created On : 2/21/2017
        /*Purpose: On Import Extended Price list Item
         * Event/Message:
         *      Pre/Create: Item Id
         *      Post/Update:
         * Primary Entity: Vehicle Sales Return
         */
        public Entity OnImportItemPriceListItem(Entity extendedPriceListItem)
        {
            _tracingService.Trace("Started OnImportExtendedPricelistItem method..");

            var productId = CommonHandler.GetEntityReferenceIdSafe(extendedPriceListItem, "gsc_productid");
            Entity productEntity = new Entity();

            if (productId != Guid.Empty)
            {
                _tracingService.Trace("Product not empty.");

                productEntity = GetProductDetails(productId);
                var productType = productEntity.Contains("gsc_producttype")
                    ? productEntity.GetAttributeValue<OptionSetValue>("gsc_producttype").Value
                    : 0;

                //Not Item
                if (productType != 100000001)
                {
                    _tracingService.Trace("Product not item.");
                    return null;
                }

                _tracingService.Trace("Product is a item.");
            }
            else
            {
                _tracingService.Trace("Product Id empty.");

                var itemNumber = extendedPriceListItem.Contains("gsc_itemnumber")
                    ? extendedPriceListItem.GetAttributeValue<String>("gsc_itemnumber")
                    : String.Empty;

                //Not Item Price List item
                if (itemNumber == String.Empty)
                    return null;
                else
                {
                    productEntity = GetVehicleByItemNo(itemNumber);
                }
            }

            UpdateExtendedPriceListItemDetails(extendedPriceListItem, productEntity);
            Guid priceListItemId = CreatePriceLisItem(extendedPriceListItem, productEntity);
            AssociateExtendedtoPriceListItem(extendedPriceListItem.Id, priceListItemId);

            _tracingService.Trace("Ended OnImportExtendedPricelistItem Method..");

            return extendedPriceListItem;
        }

        private Entity GetVehicleByItemNo(String itemNumber)
        {
            EntityCollection productCollection = CommonHandler.RetrieveRecordsByOneValue("product", "productnumber", itemNumber, _organizationService, null, OrderType.Ascending,
                new[] { "name", "gsc_producttype", "productnumber" });

            _tracingService.Trace("Check if Product Collection is Null");
            if (productCollection != null && productCollection.Entities.Count > 0)
            {
                _tracingService.Trace("Product Retrieved..");
                return productCollection.Entities[0];
            }
            else
            {
                throw new InvalidPluginExecutionException("The Item Number doesn't exist.");
            }
        }

        private Guid CreatePriceLisItem(Entity entity, Entity productEntity)
        {
            _tracingService.Trace("Started CreatePriceLisItem Method..");

            _tracingService.Trace("Entity Price List Item..");
            Entity priceListItem = new Entity("productpricelevel");
            priceListItem["pricelevelid"] = entity.GetAttributeValue<EntityReference>("gsc_pricelistid") != null
                ? entity.GetAttributeValue<EntityReference>("gsc_pricelistid")
                : null;
            priceListItem["productid"] = new EntityReference("product", productEntity.Id);
            priceListItem["uomid"] = entity.GetAttributeValue<EntityReference>("gsc_uomid") != null
                ? entity.GetAttributeValue<EntityReference>("gsc_uomid")
                : null;
            priceListItem["amount"] = entity.Contains("gsc_amount")
                ? entity.GetAttributeValue<Money>("gsc_amount")
                : new Money(0);
            Guid priceListItemId = _organizationService.Create(priceListItem);

            _tracingService.Trace("Price List Created.." + priceListItemId.ToString());

            _tracingService.Trace("Ended CreatePriceLisItem Method..");

            return priceListItemId;
        }

        private void AssociateExtendedtoPriceListItem(Guid extendedId, Guid priceListItemId)
        {
            _tracingService.Trace("Associate Price List.");

            //Collection of entities to be associated to Price List Item
            EntityReferenceCollection priceListItemCollection = new EntityReferenceCollection();
            priceListItemCollection.Add(new EntityReference("productpricelevel", priceListItemId));

            //Associate Extended Price List Item with Price List Item
            _organizationService.Associate("gsc_cmn_extendedpricelistitem", extendedId, new Relationship("gsc_gsc_cmn_extendedpricelistitem_productpric"), priceListItemCollection);

            _tracingService.Trace("Price List Associated..");
        }

        public void DeleteAssociatedPriceListItem(Guid extendedPriceListId)
        {
            Entity priceListItem = GetAssociatedPriceListItem(extendedPriceListId);

            if(priceListItem != null)
            {
                _organizationService.Delete("productpricelevel", priceListItem.Id);
            }
        }

        public Entity UpdatePriceListItem(Entity extendedEntity)
        {
            Entity priceListItem = GetAssociatedPriceListItem(extendedEntity.Id);

            if(priceListItem != null)
            {
                priceListItem["amount"] = extendedEntity.Contains("gsc_amount")
                    ? extendedEntity.GetAttributeValue<Money>("gsc_amount")
                    : new Money(0);
                priceListItem["uomscheduleid"] = extendedEntity.GetAttributeValue<EntityReference>("gsc_uomid") != null
                    ? extendedEntity.GetAttributeValue<EntityReference>("gsc_uomid")
                    : null;

                _organizationService.Update(priceListItem);
            }

            return extendedEntity;
        }

        private Entity GetAssociatedPriceListItem(Guid extendedPriceListId)
        {
            string entity1 = "productpricelevel";
            string entity2 = "gsc_cmn_extendedpricelistitem";

            string relationshipEntityName = "gsc_gsc_cmn_extendedpricelistitem_productpr";

            QueryExpression query = new QueryExpression(entity1);
            query.ColumnSet = new ColumnSet("productpricelevelid", "amount", "uomscheduleid");
            LinkEntity linkEntity1 = new LinkEntity(entity1, relationshipEntityName, "productpricelevelid", "productpricelevelid", JoinOperator.Inner);
            LinkEntity linkEntity2 = new LinkEntity(relationshipEntityName, entity2, "gsc_cmn_extendedpricelistitemid", "gsc_cmn_extendedpricelistitemid", JoinOperator.Inner);
            linkEntity1.LinkEntities.Add(linkEntity2);
            query.LinkEntities.Add(linkEntity1);
            linkEntity2.LinkCriteria = new FilterExpression();
            linkEntity2.LinkCriteria.AddCondition(new ConditionExpression("gsc_cmn_extendedpricelistitemid", ConditionOperator.Equal, extendedPriceListId));

            EntityCollection priceListItemCollection = _organizationService.RetrieveMultiple(query);

            if (priceListItemCollection != null && priceListItemCollection.Entities.Count > 0)
            {
                return priceListItemCollection.Entities[0];
            }

            return null;
        }
    }
}
