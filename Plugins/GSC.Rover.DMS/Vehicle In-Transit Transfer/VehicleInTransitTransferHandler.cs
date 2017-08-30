using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.InventoryMovement;
using GSC.Rover.DMS.BusinessLogic.VehicleInTransitTransferReceiving;

namespace GSC.Rover.DMS.BusinessLogic.VehicleInTransitTransfer
{
    public class VehicleInTransitTransferHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;
        private readonly VehicleInTransitTransferReceivingHandler _receivingHandler;
        public VehicleInTransitTransferHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        public VehicleInTransitTransferHandler(IOrganizationService service, ITracingService trace, VehicleInTransitTransferReceivingHandler receivingHandler)
        {
            _organizationService = service;
            _tracingService = trace;
            _receivingHandler = receivingHandler;
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
                        //allocatedVehicle["gsc_destinationsiteid"] = new EntityReference("gsc_iv_site", destinationSiteId);
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
        public void ShipVehicle(Entity vehicleInTransitTransfer, bool isShipping)
        {
            _tracingService.Trace("Started ShipVehicle method...");           

            //Status == Picked
            if (vehicleInTransitTransfer.GetAttributeValue<OptionSetValue>("gsc_intransittransferstatus").Value == 100000000)
            {
                _tracingService.Trace("Status is Picked...");

                EntityCollection allocatedVehicleCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransferdetail", "gsc_vehicleintransittransferid", vehicleInTransitTransfer.Id, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_inventoryid", "gsc_sourcesiteid", "gsc_viasiteid" });

                _tracingService.Trace("AllocatedVehicle records retrieved: " + allocatedVehicleCollection.Entities.Count);
                if (allocatedVehicleCollection.Entities.Count > 0)
                {                    
                    // Check if request is from shipping button
                    if (isShipping)
                    {
                        // Create Vehicle In-Transit Transfer Receiving Entity
                        _receivingHandler.CreateRecevingEntity(vehicleInTransitTransfer);
                    }                         

                    foreach (Entity allocatedVehicleEntity in allocatedVehicleCollection.Entities)
                    {
                        Guid inventoryId = allocatedVehicleEntity.Contains("gsc_inventoryid")
                            ? allocatedVehicleEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                            : Guid.Empty;

                        Guid viaSiteId = allocatedVehicleEntity.Contains("gsc_viasiteid")
                            ? allocatedVehicleEntity.GetAttributeValue<EntityReference>("gsc_viasiteid").Id
                            : Guid.Empty;

                        //Retrieve inventory
                        EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                            null, OrderType.Ascending, new[] { "gsc_status", "gsc_productquantityid", "gsc_modelcode", "gsc_optioncode", "gsc_color", "gsc_productid" });

                        _tracingService.Trace("Inventory records retrieved: " + inventoryCollection.Entities.Count);

                        if (inventoryCollection != null && inventoryCollection.Entities.Count > 0)
                        {
                            Entity inventory = inventoryCollection.Entities[0];

                            var sourceProdQuantityId = inventory.Contains("gsc_productquantityid") ? inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                                : Guid.Empty;

                            //Retrieve source site product quantity
                            EntityCollection sourceProdQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", sourceProdQuantityId, _organizationService,
                                null, OrderType.Ascending, new[] { "gsc_onhand", "gsc_allocated", "gsc_productid", "gsc_vehiclecolorid", "gsc_vehiclemodelid" });

                            _tracingService.Trace("Source ProductQuantity records retrieved: " + sourceProdQuantityCollection.Entities.Count);

                            if (sourceProdQuantityCollection.Entities.Count > 0)
                            {
                                Entity sourceProdQuantity = sourceProdQuantityCollection.Entities[0];
                                InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);

                                //Retrieve destination site product quantity
                                //var viaSiteId = vehicleInTransitTransfer.Contains("gsc_viasiteid") ? vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_viasiteid").Id
                                    //: Guid.Empty;
                                var productId = sourceProdQuantity.Contains("gsc_productid") ? sourceProdQuantity.GetAttributeValue<EntityReference>("gsc_productid").Id
                                    : Guid.Empty;
                                Entity vehicleColor = inventoryMovement.GetVehicleColorReference(inventory);

                                var viaSiteConditionList = new List<ConditionExpression>
                                {
                                    new ConditionExpression("gsc_siteid", ConditionOperator.Equal, viaSiteId),
                                    new ConditionExpression("gsc_productid", ConditionOperator.Equal, productId),
                                    new ConditionExpression("gsc_vehiclecolorid", ConditionOperator.Equal, vehicleColor.Id)
                                };

                                EntityCollection viaSiteProductQuantityRecords = CommonHandler.RetrieveRecordsByConditions("gsc_iv_productquantity", viaSiteConditionList, _organizationService, null,
                                    OrderType.Ascending, new[] { "gsc_onhand", "gsc_available", "gsc_productid", "gsc_vehiclecolorid", "gsc_vehiclemodelid" });

                                _tracingService.Trace("Destination ProductQuantity records retrieved: " + viaSiteProductQuantityRecords.Entities.Count);

                                Entity viaSiteProductQuantity = new Entity("gsc_iv_productquantity");
                                if (viaSiteProductQuantityRecords.Entities == null || viaSiteProductQuantityRecords.Entities.Count == 0)
                                {
                                    Guid viaQuantityId = inventoryMovement.CreateProductQuantity(allocatedVehicleEntity.GetAttributeValue<EntityReference>("gsc_viasiteid"), productId, new EntityReference("gsc_cmn_vehiclecolor", vehicleColor.Id));
                                    EntityCollection viaQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", viaQuantityId, _organizationService, null, OrderType.Ascending,
                                        new[] { "gsc_onhand", "gsc_available", "gsc_productid", "gsc_vehiclecolorid", "gsc_vehiclemodelid" });
                                    viaSiteProductQuantity = viaQuantityCollection.Entities[0];
                                }

                                else
                                    viaSiteProductQuantity = viaSiteProductQuantityRecords.Entities[0];
                                #region BL execution of method

                                //Update Inventory Status = Available
                                
                                inventory["gsc_productquantityid"] = new EntityReference(viaSiteProductQuantity.LogicalName, viaSiteProductQuantity.Id);
                                inventoryMovement.UpdateInventoryStatus(inventory, 100000000);
                                _tracingService.Trace("Updated inventory record...");

                                //Adjust source product quantity
                                Entity sourceQuantityEntity = inventoryMovement.UpdateProductQuantityDirectly(sourceProdQuantity, -1, 0, -1, 0, 0, 0, 0, 0);
                                Entity branchEntity = GetBranchEntity(vehicleInTransitTransfer, true);
                                var fromSiteId = vehicleInTransitTransfer.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Id;

                                inventoryMovement.CreateInventoryHistory("Vehicle In Transit Transfer", branchEntity.GetAttributeValue<string>("accountnumber"), branchEntity.GetAttributeValue<string>("name"), vehicleInTransitTransfer.GetAttributeValue<string>("gsc_vehicleintransittransferpn"),
                                    DateTime.UtcNow, 1, 1, sourceQuantityEntity.GetAttributeValue<Int32>("gsc_onhand"), viaSiteId, fromSiteId, fromSiteId, inventory, sourceQuantityEntity, true, false);
                                _tracingService.Trace("Source Product Quantity updated...");

                                //Adjust site product quantity
                                inventoryMovement.UpdateProductQuantityDirectly(viaSiteProductQuantity, 1, 1, 0, 0, 0, 0, 0, 0);
                                branchEntity = GetBranchEntity(vehicleInTransitTransfer, false);

                                inventoryMovement.CreateInventoryHistory("Vehicle In Transit Transfer", branchEntity.GetAttributeValue<string>("accountnumber"), branchEntity.GetAttributeValue<string>("name"), vehicleInTransitTransfer.GetAttributeValue<string>("gsc_vehicleintransittransferpn"),
                                   DateTime.UtcNow, 1, 1, viaSiteProductQuantity.GetAttributeValue<Int32>("gsc_onhand"), viaSiteId, fromSiteId, viaSiteId, inventory, viaSiteProductQuantity, true, true);
                                _tracingService.Trace("Destination Product Quantity updated...");

                                //Clear inventoryidtoallocate field
                                vehicleInTransitTransfer["gsc_inventoryidtoallocate"] = "";
                                _organizationService.Update(vehicleInTransitTransfer);
                                _tracingService.Trace("Updated Vehicle In-Transit Transfer record...");
                                #endregion
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

        //Created By: Jerome Anthony Gerero, Created On: 8/14/2017
        /*Purpose: Copy source site value to site filter field
         * Registration Details:
         * Event/Message: 
         *      Post/Update, Create: Source Site
         * Primary Entity: Vehicle In-Transit Transfer
         */
        public Entity ReplicateSourceField(Entity vehicleInTransitTransferEntity)
        {
            _tracingService.Trace("Started ReplicateSourceField method...");

            EntityReference sourceSite = vehicleInTransitTransferEntity.GetAttributeValue<EntityReference>("gsc_sourcesiteid") != null
                ? vehicleInTransitTransferEntity.GetAttributeValue<EntityReference>("gsc_sourcesiteid")
                : null;

            vehicleInTransitTransferEntity["gsc_siteid"] = sourceSite;

            _organizationService.Update(vehicleInTransitTransferEntity);

            _tracingService.Trace("Ended ReplicateSourceField method...");
            return vehicleInTransitTransferEntity;
        }

        //Created By: Jerome Anthony Gerero, Created On: 8/14/2017
        /*Purpose: Replicate vehicle in-transit transfer status to copy status field
         * Registration Details:
         * Event/Message: 
         *      Post/Update: Vehicle In-Transit Transfer Status
         * Primary Entity: Vehicle In-Transit Transfer
         */
        public Entity ReplicateVehicleInTransitTransferStatus(Entity vehicleInTransitTransferEntity)
        {
            _tracingService.Trace("Started ReplicateVehicleInTransitTransferStatus method...");

            Int32 vehicleInTransitStatus = vehicleInTransitTransferEntity.Contains("gsc_intransittransferstatus")
                ? vehicleInTransitTransferEntity.GetAttributeValue<OptionSetValue>("gsc_intransittransferstatus").Value
                : 100000000;

            vehicleInTransitTransferEntity["gsc_intransittransferstatuscopy"] = new OptionSetValue(vehicleInTransitStatus);

            _organizationService.Update(vehicleInTransitTransferEntity);

            _tracingService.Trace("Ended ReplicateVehicleInTransitTransferStatus method...");
            return vehicleInTransitTransferEntity;
        }


        //Created By: Raphael Herrera, Created On: 8/29/2017
        /*Purpose: Retrieve Branch Name ID to be used for creating inventory history records.
         *Return: Returns account entity
         *Parameters: isSource = true if retrieving Source Branch, false if Destination branch
         *            vehicleInTransitTransferEntity = Current in transit transfer entity
         */
        private Entity GetBranchEntity(Entity vehicleInTransitTransferEntity, bool isSource)
        {
            _tracingService.Trace("Started GetBranchEntity method...");

            Guid branchId = new Guid();
            if (isSource)
                branchId = vehicleInTransitTransferEntity.Contains("gsc_sourcebranchid") ? vehicleInTransitTransferEntity.GetAttributeValue<EntityReference>("gsc_sourcebranchid").Id 
                    : Guid.Empty;
            else
                branchId = vehicleInTransitTransferEntity.Contains("gsc_destinationbranchid") ? vehicleInTransitTransferEntity.GetAttributeValue<EntityReference>("gsc_destinationbranchid").Id
                    : Guid.Empty;

            EntityCollection branchCollection = CommonHandler.RetrieveRecordsByOneValue("account", "accountid", branchId, _organizationService, null,
                OrderType.Ascending, new[]{"name", "accountnumber"});

            if (branchCollection.Entities == null || branchCollection.Entities.Count == 0)
                throw new InvalidPluginExecutionException("No branch record retrieved.");

            _tracingService.Trace("Ending GetBranchEntity method...");
            return branchCollection.Entities[0];
        }

       
    }
}
