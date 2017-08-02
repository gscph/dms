using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.InventoryMovement;

namespace GSC.Rover.DMS.BusinessLogic.VehicleInTransitTransfer
{
    public class VehicleInTransitTransferHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public VehicleInTransitTransferHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Created By: Raphael Herrera, Created On: 8/22/2016
        /*Purpose: Set created records to gsc_intransitttransferstatus = picked
         * Registration Details:
         * Event/Message: 
         *      Pre/Create: Vehicle In-Transit Transfer
         * Primary Entity: gsc_iv_vehicleintransittransfer
         */
        public void PopulateFields(Entity vehicleInTransitTransfer)
        {
            _tracingService.Trace("Started Populate Fields method...");
            //Set status to Picked
            vehicleInTransitTransfer["gsc_intransittransferstatus"] = new OptionSetValue(100000000);
            vehicleInTransitTransfer["gsc_siteid"] = new EntityReference("gsc_iv_site", vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Id);
            _tracingService.Trace("Ending Populate Fields method...");
        }

        //Created By: Raphael Herrera, Created On: 8/23/2016
        /*Purpose: Create new allocated vehicle record. 
         * Registration Details:
         * Event/Message: 
         *      Post/Update: gsc_inventoryidtoallocate
         * Primary Entity: gsc_iv_vehicleintransittransfer
         */
        public Entity AllocateVehicle(Entity vehicleInTransitTransfer)
        {
            _tracingService.Trace("Started AllocateVehicle method...");

            Guid inventoryId = vehicleInTransitTransfer.Contains("gsc_inventoryidtoallocate")
                ? new Guid(vehicleInTransitTransfer.GetAttributeValue<String>("gsc_inventoryidtoallocate"))
                : Guid.Empty;

            if (inventoryId == Guid.Empty) { return null; }

            EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_status", "gsc_color", "gsc_csno", "gsc_engineno", "gsc_modelcode", "gsc_optioncode", "gsc_productionno", "gsc_vin", "gsc_productquantityid", "gsc_modelyear" });

            _tracingService.Trace("Inventory records retrieved: " + inventoryCollection.Entities.Count);

            if (inventoryCollection.Entities.Count > 0)
            {
                Entity inventoryEntity = inventoryCollection.Entities[0];

                if (inventoryEntity.GetAttributeValue<OptionSetValue>("gsc_status").Value == 100000000)
                {
                    _tracingService.Trace("Status of inventory is available...");
                    #region Update Inventory and product quantity

                    //set status to allocated
                    InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);
                    inventoryMovement.UpdateInventoryStatus(inventoryEntity, 100000001);

                    _tracingService.Trace("Updated inventory status to allocated...");

                    Guid productQuantityId = inventoryEntity.Contains("gsc_productquantityid")
                        ? inventoryEntity.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                        : Guid.Empty;

                    EntityCollection productQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService,
                        null, OrderType.Ascending, new[] { "gsc_allocated", "gsc_available", "gsc_siteid", "gsc_vehiclemodelid", "gsc_productid" });

                    _tracingService.Trace("ProductQuantity records retrieved: " + productQuantityCollection.Entities.Count);
                    if (productQuantityCollection != null && productQuantityCollection.Entities.Count > 0)
                    {
                        Entity productQuantityEntity = productQuantityCollection.Entities[0];

                        inventoryMovement.UpdateProductQuantityDirectly(productQuantityEntity, 0, -1, 1, 0, 0, 0, 0, 0);
                        _tracingService.Trace("Updated productquantity count...");

                        #region Create VehicleAllocation Record

                        Entity allocatedVehicle = new Entity("gsc_iv_vehicleintransittransferdetail");
                        var destinationSiteId = vehicleInTransitTransfer.Contains("gsc_destinationsiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_destinationsiteid").Id
                            : Guid.Empty;
                        var sourceSiteId = productQuantityEntity.Contains("gsc_siteid") ? productQuantityEntity.GetAttributeValue<EntityReference>("gsc_siteid").Id
                            : Guid.Empty;
                        var viaSiteId = vehicleInTransitTransfer.Contains("gsc_viasiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_viasiteid").Id
                            : Guid.Empty;
                        var baseModelName = productQuantityEntity.Contains("gsc_vehiclemodelid") ? productQuantityEntity.GetAttributeValue<EntityReference>("gsc_vehiclemodelid").Name
                            : String.Empty;
                        var productName = productQuantityEntity.Contains("gsc_productid") ? productQuantityEntity.GetAttributeValue<EntityReference>("gsc_productid").Name
                            : String.Empty;

                        allocatedVehicle["gsc_color"] = inventoryEntity.GetAttributeValue<String>("gsc_color");
                        allocatedVehicle["gsc_csno"] = inventoryEntity.GetAttributeValue<String>("gsc_csno");
                        allocatedVehicle["gsc_engineno"] = inventoryEntity.GetAttributeValue<String>("gsc_engineno");
                        allocatedVehicle["gsc_modelcode"] = inventoryEntity.GetAttributeValue<String>("gsc_modelcode");
                        allocatedVehicle["gsc_optioncode"] = inventoryEntity.GetAttributeValue<String>("gsc_optioncode");
                        allocatedVehicle["gsc_productionno"] = inventoryEntity.GetAttributeValue<String>("gsc_productionno");
                        allocatedVehicle["gsc_vin"] = inventoryEntity.GetAttributeValue<String>("gsc_vin");
                        allocatedVehicle["gsc_basemodel"] = baseModelName;
                        allocatedVehicle["gsc_modeldescription"] = productName;
                        allocatedVehicle["gsc_modelyear"] = inventoryEntity.GetAttributeValue<String>("gsc_modelyear");
                        allocatedVehicle["gsc_inventoryid"] = new EntityReference(inventoryEntity.LogicalName, inventoryEntity.Id);
                        allocatedVehicle["gsc_vehicleintransittransferid"] = new EntityReference(vehicleInTransitTransfer.LogicalName, vehicleInTransitTransfer.Id);
                        allocatedVehicle["gsc_destinationsiteid"] = new EntityReference("gsc_iv_site", destinationSiteId);
                        allocatedVehicle["gsc_sourcesiteid"] = new EntityReference("gsc_iv_site", sourceSiteId);
                        allocatedVehicle["gsc_viasiteid"] = new EntityReference("gsc_iv_site", viaSiteId);
                        
                        _organizationService.Create(allocatedVehicle);
                        _tracingService.Trace("Created vehicle allocation record...");
                        #endregion
                    }
                    #endregion
                }
            }

            vehicleInTransitTransfer["gsc_inventoryidtoallocate"] = String.Empty;
            _organizationService.Update(vehicleInTransitTransfer);

            _tracingService.Trace("Ending AllocateVehicle method...");
            return vehicleInTransitTransfer;
        }

        //Created By: Raphael Herrera, Created On: 8/24/2016
        //Modified By: Artum Ramos, Modified On: 8/2/2017
        /*Purpose: Handle Delete AND Cancel BL for Vehicle In-Transit Transfer record
         * Registration Details:
         * Event/Message: 
         *      Pre/Delete: VehicleInTransitTransfer
         *      Post/Update: gsc_intransittransferstatus
         * Primary Entity: gsc_iv_vehicleintransittransfer
         */
        public void ValidateTransaction(Entity vehicleInTransitTransfer, string message)
        {
            _tracingService.Trace("Started ValidateDelete method...");
            //Status == Picked
            if (vehicleInTransitTransfer.GetAttributeValue<OptionSetValue>("gsc_intransittransferstatus").Value == 100000000)
            {
                _tracingService.Trace("Status is Picked...");
                EntityCollection allocatedVehicleCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransferdetail", "gsc_vehicleintransittransferid", vehicleInTransitTransfer.Id, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_inventoryid" });

                _tracingService.Trace("AllocatedVehicle records retrieved: " + allocatedVehicleCollection.Entities.Count);
                if (allocatedVehicleCollection.Entities.Count > 0)
                {
                    foreach (Entity allocatedVehicleEntity in allocatedVehicleCollection.Entities)
                    {
                        var inventoryId = allocatedVehicleEntity.Contains("gsc_inventoryid") ? allocatedVehicleEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                           : Guid.Empty;

                        //Retrieve and update inventory
                        EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                            null, OrderType.Ascending, new[] { "gsc_status", "gsc_productquantityid" });

                        _tracingService.Trace("Inventory records retrieved: " + inventoryCollection.Entities.Count);
                        if (inventoryCollection.Entities.Count > 0)
                        {
                            Entity inventory = inventoryCollection.Entities[0];

                            InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);
                            inventoryMovement.UpdateInventoryStatus(inventory, 100000000);

                            _tracingService.Trace("Updated inventory record...");

                            var productQuantityId = inventory.Contains("gsc_productquantityid") ? inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                                : Guid.Empty;

                            //Retrieve and update product quantity
                            EntityCollection productQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService,
                                null, OrderType.Ascending, new[] { "gsc_available", "gsc_allocated" });

                            _tracingService.Trace("ProductQuantity records retrieved: " + productQuantityCollection.Entities.Count);
                            if (productQuantityCollection.Entities.Count > 0)
                            {
                                Entity productQuantity = productQuantityCollection.Entities[0];
                                inventoryMovement.UpdateProductQuantityDirectly(productQuantity, 0, 1, -1, 0, 0, 0, 0, 0);
                                _tracingService.Trace("Product Quantity updated...");

                                //Delete Vehicle Allocation
                                _organizationService.Delete(allocatedVehicleEntity.LogicalName, allocatedVehicleEntity.Id);
                                _tracingService.Trace("Deleted associated Allocated Vehicle record...");

                                //Clear inventoryidtoallocate field
                                vehicleInTransitTransfer["gsc_inventoryidtoallocate"] = "";
                                vehicleInTransitTransfer["gsc_intransittransferstatus"] = new OptionSetValue(100000003);
                                _organizationService.Update(vehicleInTransitTransfer);
                                _tracingService.Trace("Updated Vehicle In-Transit Transfer record...");
                            }
                        }
                    }
                }
            }

            //Status != Picked
            else
            {
                _tracingService.Trace("Status is not Picked...");
                if (message == "Delete")
                    throw new InvalidPluginExecutionException("Unable to delete Shipped/Received Vehicle In-Transit Transfer record.");
                else if (message == "Update")
                {
                    throw new InvalidPluginExecutionException("Unable to cancel Shipped/Received Vehicle In-Transit Transfer record.");
                }
            }
            _tracingService.Trace("Ending ValidateDelete method...");
        }

        //Created By: Raphael Herrera, Created On: 8/26/2016
        /*Purpose: Handle BL for setting Vehicle In-Transit Transfer status to 'Shipped'
         * Registration Details:
         * Event/Message: 
         *      Post/Update: gsc_intransittransferstatus
         * Primary Entity: gsc_iv_vehicleintransittransfer
         */
        public void ShipVehicle(Entity vehicleInTransitTransfer)
        {
            _tracingService.Trace("Started ShipVehicle method...");

            //Status == Picked
            if (vehicleInTransitTransfer.GetAttributeValue<OptionSetValue>("gsc_intransittransferstatus").Value == 100000000)
            {
                _tracingService.Trace("Status is Picked...");

                EntityCollection allocatedVehicleCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransferdetail", "gsc_vehicleintransittransferid", vehicleInTransitTransfer.Id, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_inventoryid" });

                _tracingService.Trace("AllocatedVehicle records retrieved: " + allocatedVehicleCollection.Entities.Count);
                if (allocatedVehicleCollection.Entities.Count > 0)
                {
                    #region Create Vehicle In-Transit Transfer Receiving Entity
                    Entity inTransitReceivingEntity = new Entity("gsc_iv_vehicleintransittransferreceiving");

                    var receivingDestinationSiteId = vehicleInTransitTransfer.Contains("gsc_destinationsiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_destinationsiteid").Id
                       : Guid.Empty;
                    var receivingRecordOwnerId = vehicleInTransitTransfer.Contains("gsc_recordownerid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_recordownerid").Id
                        : Guid.Empty;
                    var receivingBranchId = vehicleInTransitTransfer.Contains("gsc_branchid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_branchid").Id
                        : Guid.Empty;
                    var receivingDealerId = vehicleInTransitTransfer.Contains("gsc_dealerid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_dealerid").Id
                        : Guid.Empty;

                    inTransitReceivingEntity["gsc_actualreceiptdate"] = DateTime.UtcNow;
                    inTransitReceivingEntity["gsc_description"] = vehicleInTransitTransfer.Contains("gsc_description") ? vehicleInTransitTransfer.GetAttributeValue<string>("gsc_description")
                        : String.Empty;
                    inTransitReceivingEntity["gsc_destinationsiteid"] = new EntityReference("gsc_iv_site", receivingDestinationSiteId);
                    inTransitReceivingEntity["gsc_destinationbranch"] = vehicleInTransitTransfer.Contains("gsc_destinationbranchid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_destinationbranchid").Name
                        : string.Empty;
                    //Status = Shipped
                    inTransitReceivingEntity["gsc_intransitstatus"] = new OptionSetValue(100000000);
                    inTransitReceivingEntity["gsc_intransittransferid"] = new EntityReference(vehicleInTransitTransfer.LogicalName, vehicleInTransitTransfer.Id);
                    inTransitReceivingEntity["gsc_intransittransferremarks"] = vehicleInTransitTransfer.Contains("gsc_remarks") ? vehicleInTransitTransfer.GetAttributeValue<string>("gsc_remarks")
                        : string.Empty;
                    inTransitReceivingEntity["gsc_sourcebranch"] = vehicleInTransitTransfer.Contains("gsc_sourcebranchid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_sourcebranchid").Name
                        : string.Empty;
                    inTransitReceivingEntity["gsc_sourcesite"] = vehicleInTransitTransfer.Contains("gsc_sourcesiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Name
                        : string.Empty;
                    inTransitReceivingEntity["gsc_viasite"] = vehicleInTransitTransfer.Contains("gsc_viasiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_viasiteid").Name
                        : string.Empty;
                    inTransitReceivingEntity["gsc_recordownerid"] = new EntityReference("contact", receivingRecordOwnerId);
                    inTransitReceivingEntity["gsc_branchid"] = new EntityReference("account", receivingBranchId);
                    inTransitReceivingEntity["gsc_dealerid"] = new EntityReference("account", receivingDealerId);

                    _organizationService.Create(inTransitReceivingEntity);
                    _tracingService.Trace("Created Vehicle In-Transit Transfer Receiving record...");
                    #endregion

                    foreach (Entity allocatedVehicleEntity in allocatedVehicleCollection.Entities)
                    {
                        var inventoryId = allocatedVehicleEntity.Contains("gsc_inventoryid") ? allocatedVehicleEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                           : Guid.Empty;

                        //Retrieve inventory
                        EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                            null, OrderType.Ascending, new[] { "gsc_status", "gsc_productquantityid" });

                        _tracingService.Trace("Inventory records retrieved: " + inventoryCollection.Entities.Count);

                        if (inventoryCollection.Entities.Count > 0)
                        {
                            Entity inventory = inventoryCollection.Entities[0];

                            var sourceProdQuantityId = inventory.Contains("gsc_productquantityid") ? inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                                : Guid.Empty;

                            //Retrieve  source site product quantity
                            EntityCollection sourceProdQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", sourceProdQuantityId, _organizationService,
                                null, OrderType.Ascending, new[] { "gsc_onhand", "gsc_allocated", "gsc_productid" });

                            _tracingService.Trace("Source ProductQuantity records retrieved: " + sourceProdQuantityCollection.Entities.Count);

                            if (sourceProdQuantityCollection.Entities.Count > 0)
                            {
                                Entity sourceProdQuantity = sourceProdQuantityCollection.Entities[0];

                                //Retrieve destination site product quantity
                                var viaSiteId = vehicleInTransitTransfer.Contains("gsc_viasiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_viasiteid").Id
                                    : Guid.Empty;
                                var productId = sourceProdQuantity.Contains("gsc_productid") ? sourceProdQuantity.GetAttributeValue<EntityReference>("gsc_productid").Id
                                    : Guid.Empty;

                                var destinationConditionList = new List<ConditionExpression>
                                {
                                    new ConditionExpression("gsc_siteid", ConditionOperator.Equal, viaSiteId),
                                    new ConditionExpression("gsc_productid", ConditionOperator.Equal, productId)
                                };

                                EntityCollection destinationProdQuantityCollection = CommonHandler.RetrieveRecordsByConditions("gsc_iv_productquantity", destinationConditionList, _organizationService, null,
                                    OrderType.Ascending, new[] { "gsc_onhand", "gsc_available" });

                                _tracingService.Trace("Destination ProductQuantity records retrieved: " + destinationProdQuantityCollection.Entities.Count);
                                if (destinationProdQuantityCollection.Entities.Count > 0)
                                {
                                    #region BL execution of method
                                    Entity viaProdQuantity = destinationProdQuantityCollection.Entities[0];

                                    Int32 sourceOnHand = sourceProdQuantity.GetAttributeValue<Int32>("gsc_onhand");
                                    Int32 sourceAllocated = sourceProdQuantity.GetAttributeValue<Int32>("gsc_allocated");
                                    Int32 viaOnHand = viaProdQuantity.GetAttributeValue<Int32>("gsc_onhand");
                                    Int32 viaAvailable = viaProdQuantity.GetAttributeValue<Int32>("gsc_available");

                                    //Adjust source product quantity
                                    sourceProdQuantity["gsc_onhand"] = sourceOnHand - 1;
                                    sourceProdQuantity["gsc_allocated"] = sourceAllocated - 1;

                                    _organizationService.Update(sourceProdQuantity);
                                    _tracingService.Trace("Source Product Quantity updated...");

                                    //Adjust destination product quantity
                                    viaProdQuantity["gsc_onhand"] = viaOnHand + 1;
                                    viaProdQuantity["gsc_available"] = viaAvailable + 1;

                                    _organizationService.Update(viaProdQuantity);
                                    _tracingService.Trace("Destination Product Quantity updated...");

                                    //Update Inventory Status = Available
                                    inventory["gsc_status"] = new OptionSetValue(100000000);
                                    inventory["gsc_productquantityid"] = new EntityReference(viaProdQuantity.LogicalName, viaProdQuantity.Id);

                                    _organizationService.Update(inventory);
                                    _tracingService.Trace("Updated inventory record...");

                                    //Clear inventoryidtoallocate field
                                    vehicleInTransitTransfer["gsc_inventoryidtoallocate"] = "";
                                    _organizationService.Update(vehicleInTransitTransfer);
                                    _tracingService.Trace("Updated Vehicle In-Transit Transfer record...");

                                    #endregion
                                }
                            }
                        }
                    }
                }
                else
                    throw new InvalidPluginExecutionException("No Allocated Vehicle to Ship.");
            }

            //Status != Picked
            else
            {
                _tracingService.Trace("Status is not Picked...");
                throw new InvalidPluginExecutionException("Unable to Ship Vehicle In-Transit Transfer record with this status.");
            }
            _tracingService.Trace("Ending ShipVehicle method...");
        }

        //Created By: Jerome Anthony Gerero, Created On: 7/19/2017
        /*Purpose: Delete transferred vehicles
         * Registration Details:
         * Event/Message: 
         *      Pre/Delete: Allocated Items to Delete
         * Primary Entity: Vehicle In-Transit Transfer
         */
        public Entity DeleteInTransitTransferVehicle(Entity vehicleInTransitTransferEntity)
        {
            _tracingService.Trace("Started DeleteInTransitTransferVehicle method...");

            if (vehicleInTransitTransferEntity.GetAttributeValue<OptionSetValue>("gsc_intransittransferstatus").Value != 100000000) { return null; }

            Guid vehicleInTransitTransferDetailId = vehicleInTransitTransferEntity.Contains("gsc_allocateditemstodelete")
                ? new Guid(vehicleInTransitTransferEntity.GetAttributeValue<String>("gsc_allocateditemstodelete"))
                : Guid.Empty;

            EntityCollection vehicleInTransitTransferDetailRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransferdetail", "gsc_iv_vehicleintransittransferdetailid", vehicleInTransitTransferDetailId, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_inventoryid" });

            if (vehicleInTransitTransferDetailRecords.Entities.Count > 0)
            {
                Entity vehicleInTransitTransferDetail = vehicleInTransitTransferDetailRecords.Entities[0];
                
                Guid inventoryId = vehicleInTransitTransferDetail.Contains("gsc_inventoryid")
                    ? vehicleInTransitTransferDetail.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                    : Guid.Empty;                

                //Retrieve and update inventory
                EntityCollection inventoryRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_status", "gsc_productquantityid", "gsc_modelcode", "gsc_optioncode", "gsc_color", "gsc_csno", "gsc_engineno", "gsc_modelyear", "gsc_productionno", "gsc_vin", "gsc_siteid", "gsc_productid", "gsc_basemodelid" });

                if (inventoryRecords.Entities.Count > 0)
                {
                    Entity inventory = inventoryRecords.Entities[0];

                    InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);
                    inventoryMovement.UpdateInventoryStatus(inventory, 100000000);

                    Guid productQuantityId = inventory.Contains("gsc_productquantityid")
                        ? inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                        : Guid.Empty;

                    EntityCollection productQuantityRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService,
                        null, OrderType.Ascending, new[] { "gsc_available", "gsc_allocated", "gsc_vehiclemodelid", "gsc_vehiclecolorid" });

                    if (productQuantityRecords.Entities.Count > 0)
                    {
                        Entity productQuantity = productQuantityRecords.Entities[0];
                        
                        inventoryMovement.UpdateProductQuantityDirectly(productQuantity, 0, 1, -1, 0, 0, 0, 0, 0);

                        _organizationService.Delete(vehicleInTransitTransferDetail.LogicalName, vehicleInTransitTransferDetail.Id);
                    }
                }
            }

            vehicleInTransitTransferEntity["gsc_allocateditemstodelete"] = String.Empty;
            _organizationService.Update(vehicleInTransitTransferEntity);

            _tracingService.Trace("Ending DeleteInTransitTransferVehicle method...");
            return vehicleInTransitTransferEntity;
        }
    }
}
