using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.InventoryMovement;

namespace GSC.Rover.DMS.BusinessLogic.VehicleInTransitTransferReceiving
{
    public class VehicleInTransitTransferReceivingHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public VehicleInTransitTransferReceivingHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Refactored By: Joseph F. Cadiao, Created On: 8/1/2017
        /*Purpose: Create Receiving Entity
         * Registration Details:
         * Event/Message: 
         *      Post/Update: gsc_intransittransferstatus
         * Primary Entity: Vehicle In-Transit Transfer Receiving
         */
        public Guid CreateRecevingEntity(Entity vehicleInTransitTransfer)
        {
            Entity inTransitReceivingEntity = new Entity("gsc_iv_vehicleintransittransferreceiving");           
            //Guid receivingDestinationSiteId = vehicleInTransitTransfer.GetEntityReferenceGuid("gsc_destinationsiteid");          
            Guid receivingRecordOwnerId = vehicleInTransitTransfer.GetEntityReferenceGuid("gsc_recordownerid");
            Guid receivingBranchId = vehicleInTransitTransfer.GetEntityReferenceGuid("gsc_branchid");
            Guid receivingDealerId = vehicleInTransitTransfer.GetEntityReferenceGuid("gsc_dealerid");

            inTransitReceivingEntity["gsc_actualreceiptdate"] = DateTime.UtcNow;          
            inTransitReceivingEntity["gsc_description"] = vehicleInTransitTransfer.GetEntityAttributeValueSafely<string>("gsc_description");
            //inTransitReceivingEntity["gsc_destinationsiteid"] = new EntityReference("gsc_iv_site", receivingDestinationSiteId);          
            //Status = Shipped
            inTransitReceivingEntity["gsc_intransitstatus"] = new OptionSetValue(100000000);
            inTransitReceivingEntity["gsc_intransitstatuscopy"] = new OptionSetValue(100000000);
            inTransitReceivingEntity["gsc_intransittransferid"] = new EntityReference(vehicleInTransitTransfer.LogicalName, vehicleInTransitTransfer.Id);
            _tracingService.Trace(" gsc_intransittransferremarks ");
            inTransitReceivingEntity["gsc_intransittransferremarks"] = vehicleInTransitTransfer.Contains("gsc_remarks") ? vehicleInTransitTransfer.GetAttributeValue<string>("gsc_remarks")
                : string.Empty;
            inTransitReceivingEntity["gsc_recordownerid"] = new EntityReference("contact", receivingRecordOwnerId);
            inTransitReceivingEntity["gsc_branchid"] = new EntityReference("account", receivingBranchId);
            inTransitReceivingEntity["gsc_dealerid"] = new EntityReference("account", receivingDealerId);

            Guid Id = _organizationService.Create(inTransitReceivingEntity);
            _tracingService.Trace("Created Vehicle In-Transit Transfer Receiving record...");

            return Id;
        }

        public Entity PopulateSites(Entity vehicleInTransitReceiving, Entity vehicleInTransitTransfer)
        {
            _tracingService.Trace("Started PopulateSites Method...");

            vehicleInTransitReceiving["gsc_sourcebranch"] = vehicleInTransitTransfer.Contains("gsc_sourcebranchid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_sourcebranchid").Name
                : string.Empty;
            vehicleInTransitReceiving["gsc_sourcesite"] = vehicleInTransitTransfer.Contains("gsc_sourcesiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Name
                : string.Empty;
            vehicleInTransitReceiving["gsc_viasite"] = vehicleInTransitTransfer.Contains("gsc_viasiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_viasiteid").Name
                : string.Empty;
            vehicleInTransitReceiving["gsc_destinationbranch"] =  vehicleInTransitTransfer.Contains("gsc_viasiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_destinationbranchid").Name
                : string.Empty;
            vehicleInTransitReceiving["gsc_destinationbranchid"] = vehicleInTransitTransfer["gsc_destinationbranchid"];

            _tracingService.Trace("Ending PopulateSites Method...");

            return vehicleInTransitReceiving;
        }
        /*Purpose: Create Receiving Entity Details
          * Registration Details:
          * Event/Message: 
          *      Post/Update: gsc_intransittransferstatus
          * Primary Entity: Vehicle In-Transit Transfer Receiving Details
          */
        public void CreateReceivingDetails(Entity vehicleInTransitTransfer, EntityCollection vehicleInTransitTransferDetails, Guid receivingId)
        {
            foreach (Entity vehicleInTransitTransferDetail in vehicleInTransitTransferDetails.Entities)
            {
                string modelString = vehicleInTransitTransferDetail.GetEntityAttributeValueSafely<string>("gsc_basemodel");
                string modelDescriptionString = vehicleInTransitTransferDetail.GetEntityAttributeValueSafely<string>("gsc_modeldescription");

                Entity inTransitReceivingEntity = new Entity("gsc_iv_vehicleintransitreceivingdetail");
                vehicleInTransitTransferDetail.Attributes.Remove("gsc_vehicleintransittransferid");
                vehicleInTransitTransferDetail.Attributes.Remove("gsc_iv_vehicleintransittransferdetailid");
                vehicleInTransitTransferDetail.Attributes.Remove("gsc_basemodel");
                vehicleInTransitTransferDetail.Attributes.Remove("gsc_modeldescription");
                inTransitReceivingEntity.Attributes = vehicleInTransitTransferDetail.Attributes;

                inTransitReceivingEntity.Attributes.Add("gsc_intransitreceivingid", new EntityReference("gsc_iv_vehicleintransittransferreceiving", receivingId));



                inTransitReceivingEntity.Attributes.Add("gsc_modelid", CommonHandler.GetEntityReferenceFromPrimaryName(_organizationService, "gsc_iv_vehiclebasemodel", "gsc_basemodelpn", modelString));
                inTransitReceivingEntity.Attributes.Add("gsc_productid", CommonHandler.GetEntityReferenceFromPrimaryName(_organizationService, "product", "name", modelDescriptionString));

                _organizationService.Create(inTransitReceivingEntity);
                _tracingService.Trace("Created Vehicle In-Transit Transfer Receiving Details record...");
            }           
        }


        public EntityCollection GetIntransitTransferDetails(Guid inTransitTransferId)
        {

            QueryExpression query = new QueryExpression("gsc_iv_vehicleintransittransferdetail");
            query.ColumnSet.AddColumn("gsc_vehicleintransittransferid");

            query.ColumnSet.AddColumns("gsc_modelcode", "gsc_optioncode", "gsc_productionno",
                                       "gsc_modelyear", "gsc_color", "gsc_destinationsiteid",
                                       "gsc_engineno", "gsc_csno", "gsc_inventoryid",
                                       "gsc_productionno", "gsc_vin", "gsc_basemodel", "gsc_modeldescription",
                                       "gsc_viasiteid");

            query.Criteria.AddCondition(new ConditionExpression("gsc_vehicleintransittransferid", ConditionOperator.Equal, inTransitTransferId));

            return _organizationService.RetrieveMultiple(query);           
        }


        //Created By: Raphael Herrera, Created On: 8/31/2016
        /*Purpose: Perform BL for receiving Vehicle In-Transit Transfer records 
         * Registration Details:
         * Event/Message: 
         *      Post/Update: gsc_intransitstatus
         * Primary Entity: gsc_iv_vehicleintransittransferreceiving
         */
        public void ReceiveTransfer(Entity vehicleTransferReceiving)
        {
            _tracingService.Trace("Started ReceiveTransfer Method...");
            var inTransitTransferId = vehicleTransferReceiving.Contains("gsc_intransittransferid") ? vehicleTransferReceiving.GetAttributeValue<EntityReference>("gsc_intransittransferid").Id
                : Guid.Empty;

            //Retrieve Vehicle In-Transit Transfer
            EntityCollection inTransitCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransfer", "gsc_iv_vehicleintransittransferid", inTransitTransferId, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_intransittransferstatus" });

            _tracingService.Trace("Vehicle In-Transit Transfer records retrieved: " + inTransitCollection.Entities.Count);
            if (inTransitCollection.Entities.Count > 0)
            {
                Entity vehicleInTransit = inTransitCollection.Entities[0];
                EntityCollection receivingDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransitreceivingdetail", "gsc_intransitreceivingid", vehicleTransferReceiving.Id, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_inventoryid" });

                _tracingService.Trace("In Transit Transfer Details records retrieved: " + receivingDetailsCollection.Entities.Count);
                if (receivingDetailsCollection.Entities.Count > 0)
                {
                    foreach (Entity receivingDetailsEntity in receivingDetailsCollection.Entities)
                    {
                        var inventoryId = receivingDetailsEntity.Contains("gsc_inventoryid") ? receivingDetailsEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                           : Guid.Empty;

                        //Retrieve inventory
                        EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                            null, OrderType.Ascending, new[] { "gsc_status", "gsc_productquantityid" });

                        _tracingService.Trace("Inventory records retrieved: " + inventoryCollection.Entities.Count);
                        if (inventoryCollection.Entities.Count > 0)
                        {
                            Entity inventory = inventoryCollection.Entities[0];

                            var productQuantityId = inventory.Contains("gsc_productquantityid") ? inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                               : Guid.Empty;

                            //Retrieve product quantity of Via Site
                            EntityCollection viaQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService,
                                null, OrderType.Ascending, new[] { "gsc_available", "gsc_onhand", "gsc_allocated", "gsc_productid", "gsc_vehiclemodelid" });

                            _tracingService.Trace("Via Site ProductQuantity records retrieved: " + viaQuantityCollection.Entities.Count);
                            if (viaQuantityCollection.Entities.Count > 0)
                            {
                                Entity viaProdQuantity = viaQuantityCollection.Entities[0];

                                //Retrieve Product Quantity of Destination Site
                                var destinationSite = vehicleTransferReceiving.Contains("gsc_destinationsiteid") ? vehicleTransferReceiving.GetAttributeValue<EntityReference>("gsc_destinationsiteid").Id
                                    : Guid.Empty;
                                var productId = viaProdQuantity.Contains("gsc_productid") ? viaProdQuantity.GetAttributeValue<EntityReference>("gsc_productid").Id
                                  : Guid.Empty;

                                var destinationConditionList = new List<ConditionExpression>
                                {
                                    new ConditionExpression("gsc_siteid", ConditionOperator.Equal, destinationSite),
                                    new ConditionExpression("gsc_productid", ConditionOperator.Equal, productId)
                                };

                                EntityCollection destinationQuantityCollection = CommonHandler.RetrieveRecordsByConditions("gsc_iv_productquantity", destinationConditionList, _organizationService, null,
                                    OrderType.Ascending, new[] { "gsc_onhand", "gsc_available", "gsc_allocated" });

                                Entity destinationQuantityEntity = new Entity("gsc_iv_productquantity");
                                _tracingService.Trace("Destination ProductQuantity records retrieved: " + destinationQuantityCollection.Entities.Count);

                                if (destinationQuantityCollection.Entities.Count == 0)
                                {
                                    String siteName = vehicleTransferReceiving.Contains("gsc_destinationsiteid") ? vehicleTransferReceiving.GetAttributeValue<EntityReference>("gsc_destinationsiteid").Name
                                    : String.Empty;
                                    String productName = viaProdQuantity.Contains("gsc_productid") ? viaProdQuantity.GetAttributeValue<EntityReference>("gsc_productid").Name
                                      : String.Empty;

                                    destinationQuantityEntity["gsc_siteid"] = new EntityReference("gsc_iv_site", destinationSite);
                                    destinationQuantityEntity["gsc_productid"] = new EntityReference("product", productId);
                                    destinationQuantityEntity["gsc_productquantitypn"] = productName + "-" + siteName;
                                    destinationQuantityEntity["gsc_allocated"] = 0;
                                    destinationQuantityEntity["gsc_sold"] = 0;

                                    destinationQuantityEntity.Id = _organizationService.Create(destinationQuantityEntity);
                                    _tracingService.Trace("Created Product Quantity...");
                                }
                                else
                                    destinationQuantityEntity = destinationQuantityCollection.Entities[0];

                                InventoryMovementHandler inventoryHandler = new InventoryMovementHandler(_organizationService, _tracingService);
                                #region BL for Receiving Vehicle In-Transit Transfer Record

                                Int32 viaAvailable = viaProdQuantity.GetAttributeValue<Int32>("gsc_available");
                                Int32 viaOnHand = viaProdQuantity.GetAttributeValue<Int32>("gsc_onhand");
                                Int32 destinationAvailable = destinationQuantityEntity.GetAttributeValue<Int32>("gsc_available");
                                Int32 destinationOnHand = destinationQuantityEntity.GetAttributeValue<Int32>("gsc_onhand");

                                //Update Inventory Product Quantity
                                inventory["gsc_productquantityid"] = new EntityReference(destinationQuantityEntity.LogicalName, destinationQuantityEntity.Id);
                                inventoryHandler.UpdateInventoryFields(inventory, "Update");
                                _tracingService.Trace("Updated Inventory Status...");

                                //Update Product Quantity of Via Site
                                inventoryHandler.UpdateProductQuantityDirectly(viaProdQuantity, -1, -1, -1, 0, 0, 0, 0, 0);//Included value in allocated for recount
                                _tracingService.Trace("Updated Via Site Product Quantity...");

                                //Update Product Quantity of Destination Site
                                inventoryHandler.UpdateProductQuantityDirectly(destinationQuantityEntity, 1, 1, 1, 0, 0, 0, 0, 0);//Included value in allocated for recount
                                _tracingService.Trace("Updated Destination Site Product Quantity...");

                                //Update Vehicle In-Transit Transfer. Status = Received
                                vehicleInTransit["gsc_intransittransferstatus"] = new OptionSetValue(100000002);
                                _organizationService.Update(vehicleInTransit);
                                _tracingService.Trace("Updated Vehicle In-Transit Transfer...");
                                #endregion
                            }
                            else
                                throw new InvalidPluginExecutionException("No Via Site Found...");
                        }
                        else
                            throw new InvalidPluginExecutionException("No Inventory Record Found...");
                    }
                }
                else
                    throw new InvalidPluginExecutionException("No Receiving Details Found...");
            }
            _tracingService.Trace("Ending ReceiveTransfer Method...");
        }

        //Created By: Raphael Herrera, Created On: 8/31/2016
        /*Purpose: Perform BL for receiving Vehicle In-Transit Transfer records 
         * Registration Details:
         * Event/Message: 
         *      Post/Update: gsc_intransitstatus
         * Primary Entity: gsc_iv_vehicleintransittransferreceiving
         */
        public void CancelTransfer(Entity vehicleTransferReceiving)
        {
            _tracingService.Trace("Started Cancel Transfer Method...");
            if (vehicleTransferReceiving.GetAttributeValue<OptionSetValue>("gsc_intransitstatus").Value != 100000000)
            {
                throw new InvalidPluginExecutionException("Only records with Shipped status can be canceled.");
            }
            var inTransitTransferId = vehicleTransferReceiving.Contains("gsc_intransittransferid") ? vehicleTransferReceiving.GetAttributeValue<EntityReference>("gsc_intransittransferid").Id
                : Guid.Empty;

            //Retrieve In-Transit Transfer of In-Transit Transfer Receiving
            EntityCollection inTransitTransferCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransfer", "gsc_iv_vehicleintransittransferid", inTransitTransferId, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_sourcesiteid", "gsc_viasiteid" });

            _tracingService.Trace("In-Transit Transfer Records Retrieved: " + inTransitTransferCollection.Entities.Count);
            if (inTransitTransferCollection.Entities.Count > 0)
            {
                Entity inTransitTransferEntity = inTransitTransferCollection.Entities[0];

                //Retrieve Allocated Vehicles of In-Transit Transfer
                EntityCollection transferDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransferdetail", "gsc_vehicleintransittransferid", inTransitTransferEntity.Id, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_sourcesiteid", "gsc_viasiteid", "gsc_inventoryid" });

                _tracingService.Trace("In Transit Transfer Detail Records Retrieved: " + transferDetailsCollection.Entities.Count);
                if (transferDetailsCollection.Entities.Count > 0)
                {
                    foreach (Entity transferDetailsEntity in transferDetailsCollection.Entities)
                    {
                        var sourceSiteId = inTransitTransferEntity.Contains("gsc_sourcesiteid") ? inTransitTransferEntity.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Id
                            : Guid.Empty;
                        var inventoryId = transferDetailsEntity.Contains("gsc_inventoryid") ? transferDetailsEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                            : Guid.Empty;

                        //Retrieve Inventory of Allocated Vehicle
                        EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                         null, OrderType.Ascending, new[] { "gsc_status", "gsc_productquantityid" });

                        _tracingService.Trace("Inventory Records Retrieved: " + inventoryCollection.Entities.Count);
                        if (inventoryCollection.Entities.Count > 0)
                        {
                            Entity inventoryEntity = inventoryCollection.Entities[0];
                            var viaProdQuantityId = inventoryEntity.Contains("gsc_productquantityid") ? inventoryEntity.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                                : Guid.Empty;
                            if (inventoryEntity.GetAttributeValue<OptionSetValue>("gsc_status").Value == 100000001)//status == allocated
                            {
                                throw new InvalidPluginExecutionException("Vehicle in this transaction is still allocated. Please remove allocation in Sales Order before cancelling.");
                            }
                            //Retrieve Product Quantity of Via Site
                            EntityCollection viaQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", viaProdQuantityId, _organizationService,
                                null, OrderType.Ascending, new[] { "gsc_available", "gsc_onhand", "gsc_productid", "gsc_allocated" });

                            _tracingService.Trace("Via Site Product Quantity Records Retrieved: " + viaQuantityCollection.Entities.Count);
                            if (viaQuantityCollection.Entities.Count > 0)
                            {
                                Entity viaQuantityEntity = viaQuantityCollection.Entities[0];
                                var productId = viaQuantityEntity.Contains("gsc_productid") ? viaQuantityEntity.GetAttributeValue<EntityReference>("gsc_productid").Id
                                    : Guid.Empty;

                                //Retrieve Product Quantity of Source Site
                                var sourceConditionList = new List<ConditionExpression>
                                {
                                    new ConditionExpression("gsc_siteid", ConditionOperator.Equal, sourceSiteId),
                                    new ConditionExpression("gsc_productid", ConditionOperator.Equal, productId)
                                };

                                EntityCollection sourceQuantityCollection = CommonHandler.RetrieveRecordsByConditions("gsc_iv_productquantity", sourceConditionList, _organizationService, null,
                                    OrderType.Ascending, new[] { "gsc_onhand", "gsc_available", "gsc_allocated" });

                                _tracingService.Trace("Source Site Product Quantity Records Retrieved: " + sourceQuantityCollection.Entities.Count);
                                if (sourceQuantityCollection.Entities.Count > 0)
                                {
                                    #region BL for Cancellation of Vehicle In-Transit Transfer Receiving
                                    Entity sourceQuantityEntity = sourceQuantityCollection.Entities[0];
                                    InventoryMovementHandler inventoryHandler = new InventoryMovementHandler(_organizationService, _tracingService);

                                    // Update Inventory. Status = Available
                                    inventoryEntity["gsc_productquantityid"] = new EntityReference(sourceQuantityEntity.LogicalName, sourceQuantityEntity.Id);
                                    inventoryEntity["gsc_status"] = new OptionSetValue(100000000);
                                    inventoryHandler.UpdateInventoryFields(inventoryEntity, "Update");
                                    _tracingService.Trace("Updated Inventory Status...");

                                    // Update Product Quantity of Via Site
                                    inventoryHandler.UpdateProductQuantityDirectly(viaQuantityEntity, -1, -1, -1, 0, 0, 0, 0, 0);//Included value in allocated for recount
                                    _tracingService.Trace("Updated Via Site Product Quantity...");

                                    //Update Product Quantity of Source Site
                                    inventoryHandler.UpdateProductQuantityDirectly(sourceQuantityEntity, 1, 1, 1, 0, 0, 0, 0, 0);//Included value in allocated for recount
                                    _tracingService.Trace("Updated Source Site Product Quantity...");

                                    // Delete Allocated Vehicle record
                                    _organizationService.Delete(transferDetailsEntity.LogicalName, transferDetailsEntity.Id);
                                    _tracingService.Trace("Deleted Transfer Details...");
                                }
                                else
                                    throw new InvalidPluginExecutionException("Product Quantity of source site not found...");
                            }
                            else
                                throw new InvalidPluginExecutionException("Product Quantity of via site not found...");
                        }
                        else
                            throw new InvalidPluginExecutionException("No Inventory Records Found...");

                    }
                    // Update Vehicle In-Transit Transfer Status to Picked
                    inTransitTransferEntity["gsc_intransittransferstatus"] = new OptionSetValue(100000000);
                    _organizationService.Update(inTransitTransferEntity);
                    _tracingService.Trace("Updated Vehicle In-Transit Transfer status to cancelled...");
                    #endregion
                }
            }
            else
                throw new InvalidPluginExecutionException("No In Transit Transfer Records Found...");
            _tracingService.Trace("Ending CancelTransfer Method...");
        }

        // Created By: Joseph F. Cadiao, Created On: 8/1/2017
        /*Purpose: Check if record's In-Transit Transfer already exist
         * Registration Details:
         * Event/Message: 
         *      Post/Create: gsc_intransittransfer
         * Primary Entity: Vehicle In-Transit Transfer Receiving
         */
        public bool DetectDuplicate(Entity vehicleReceivingTransfer)
        {
            QueryExpression query = new QueryExpression("gsc_iv_vehicleintransittransferreceiving");
            query.ColumnSet.AddColumn("gsc_intransittransferid");

            Guid transferId = CommonHandler.GetEntityReferenceValueSafe(vehicleReceivingTransfer, "gsc_intransittransferid");

            query.Criteria.AddCondition(new ConditionExpression("gsc_intransittransferid", ConditionOperator.Equal, transferId));

            int count = _organizationService.RetrieveMultiple(query).Entities.Count;

            if (count > 0)
            {
                return true;
            }

            return false;
        }

        public Entity CopyStatus(Entity vehicleInTransitReceiving)
        {
            vehicleInTransitReceiving["gsc_intransitstatuscopy"] = vehicleInTransitReceiving.GetAttributeValue<OptionSetValue>("gsc_intransitstatus");
            _organizationService.Update(vehicleInTransitReceiving);
            _tracingService.Trace("Updated In Transit Receiving status copy...");
            return vehicleInTransitReceiving;
        }

        public Entity GenerateComponents(Entity vehicleInTransitReceiving)
        {
            _tracingService.Trace("Started GenerateComponents method...");

            EntityCollection receivingDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransitreceivingdetail", "gsc_intransitreceivingid", vehicleInTransitReceiving.Id, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_inventoryid" });
            if (receivingDetailsCollection.Entities == null || receivingDetailsCollection.Entities.Count == 0)
                throw new InvalidPluginExecutionException("No receiving detail found.");

            foreach(Entity receivingDetailsEntity in receivingDetailsCollection.Entities)
            {
                _tracingService.Trace("Retrieving components...");
                Guid inventoryId = receivingDetailsEntity.Contains("gsc_inventoryid") ? receivingDetailsEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                    : Guid.Empty;
                EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_basemodelid" });
                if (inventoryCollection.Entities == null || inventoryCollection.Entities.Count == 0)
                    throw new InvalidPluginExecutionException("No inventory record found.");

                Entity inventoryEntity = inventoryCollection.Entities[0];
                var baseModelId = inventoryEntity.Contains("gsc_basemodelid") ? inventoryEntity.GetAttributeValue<EntityReference>("gsc_basemodelid").Id
                    : Guid.Empty;
                EntityCollection componentChecklistCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_sls_vehiclecomponentchecklist", "gsc_vehiclebasemodelid", baseModelId, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_vehiclecomponentchecklistpn" });

                if (componentChecklistCollection.Entities != null && componentChecklistCollection.Entities.Count > 0)
                {
                    _tracingService.Trace("Retrieved vehicle components...");
                    Entity receivingComponent = new Entity("gsc_iv_vehicleintransitreceivingchecklist");
                    foreach (Entity componentEntity in componentChecklistCollection.Entities)
                    {
                        receivingComponent["gsc_vehicleintransitreceivingchecklistpn"] = componentEntity.Contains("gsc_vehiclecomponentchecklistpn") ?
                            componentEntity.GetAttributeValue<String>("gsc_vehiclecomponentchecklistpn") : String.Empty;
                        receivingComponent["gsc_vehicleintransitreceivingdetailid"] = new EntityReference("gsc_iv_vehicleintransitreceivingdetail", receivingDetailsEntity.Id);
                        _organizationService.Create(receivingComponent);
                        _tracingService.Trace("Created vehicle checklist component record...");
                    }
                }
            }
            _tracingService.Trace("Ending GenerateComponents method...");
            return vehicleInTransitReceiving;
        }

        public Entity CopyDestinationSite(Entity vehicleIntransitReceiving)
        {
            _tracingService.Trace("Started CopyDestinationSite Method...");
            var destinationSiteId = vehicleIntransitReceiving.Contains("gsc_destinationsiteid") ? vehicleIntransitReceiving.GetAttributeValue<EntityReference>("gsc_destinationsiteid").Id
                : Guid.Empty;

            EntityCollection siteCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_site", "gsc_iv_siteid", destinationSiteId, _organizationService, null,
                OrderType.Ascending, new[] { "gsc_iv_siteid" });

            if (siteCollection.Entities == null || siteCollection.Entities.Count == 0)
            {
                throw new InvalidPluginExecutionException("Destination site not found...");
            }

            Entity siteEntity = siteCollection.Entities[0];
            EntityCollection receivingDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransitreceivingdetail", "gsc_intransitreceivingid", vehicleIntransitReceiving.Id,
                _organizationService, null, OrderType.Ascending, new[]{"gsc_destinationsiteid"});
            if (receivingDetailsCollection.Entities == null || receivingDetailsCollection.Entities.Count == 0)
            {
                throw new InvalidPluginExecutionException("No receiving details found...");
            }

            foreach (Entity receivingDetails in receivingDetailsCollection.Entities)
            {
                receivingDetails["gsc_destinationsiteid"] = new EntityReference("gsc_iv_site", destinationSiteId);
                _organizationService.Update(receivingDetails);
            }
            _tracingService.Trace("Ending CopyDestinationSite Method...");
            return vehicleIntransitReceiving;
        }
    }
}
