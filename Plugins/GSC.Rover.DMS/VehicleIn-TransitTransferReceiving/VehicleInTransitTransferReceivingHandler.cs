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
                EntityCollection transferDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransferdetail", "gsc_vehicleintransittransferid", vehicleInTransit.Id, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_inventoryid", "gsc_modelyear", "gsc_modelcode", "gsc_optioncode", "gsc_color", "gsc_csno", "gsc_vin", "gsc_productionno", 
                    "gsc_engineno", "gsc_destinationsiteid"});

                _tracingService.Trace("In Transit Transfer Details records retrieved: " + transferDetailsCollection.Entities.Count);
                if (transferDetailsCollection.Entities.Count > 0)
                {
                    foreach (Entity transferDetailsEntity in transferDetailsCollection.Entities)
                    {
                        var inventoryId = transferDetailsEntity.Contains("gsc_inventoryid") ? transferDetailsEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
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
                                null, OrderType.Ascending, new[] { "gsc_available", "gsc_onhand", "gsc_productid", "gsc_vehiclemodelid" });

                            _tracingService.Trace("ProductQuantity records retrieved: " + viaQuantityCollection.Entities.Count);
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
                                    OrderType.Ascending, new[] { "gsc_onhand", "gsc_available" });

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

                                    _organizationService.Create(destinationQuantityEntity);
                                }
                                else
                                    destinationQuantityEntity = destinationQuantityCollection.Entities[0];

                                InventoryMovementHandler inventoryHandler = new InventoryMovementHandler(_organizationService, _tracingService);
                                #region BL for Receiving Vehicle In-Transit Transfer Record
                                    
                                Int32 viaAvailable = viaProdQuantity.GetAttributeValue<Int32>("gsc_available");
                                Int32 viaOnHand = viaProdQuantity.GetAttributeValue<Int32>("gsc_onhand");
                                Int32 destinationAvailable = destinationQuantityEntity.GetAttributeValue<Int32>("gsc_available");
                                Int32 destinationOnHand = destinationQuantityEntity.GetAttributeValue<Int32>("gsc_onhand");

                                //Update Product Quantity of Via Site
                                inventoryHandler.UpdateProductQuantityDirectly(viaProdQuantity, -1, -1, 0, 0, 0, 0, 0, 0);
                                _tracingService.Trace("Updated Via Site Product Quantity...");

                                //Update Product Quantity of Destination Site
                                inventoryHandler.UpdateProductQuantityDirectly(destinationQuantityEntity, 1, 1, 0, 0, 0, 0, 0, 0);
                                _tracingService.Trace("Updated Destination Site Product Quantity...");

                                //Update Inventory Status = Available
                                inventory["gsc_status"] = new OptionSetValue(100000000);
                                inventory["gsc_productquantityid"] = new EntityReference(destinationQuantityEntity.LogicalName, destinationQuantityEntity.Id);
                                inventoryHandler.UpdateInventoryFields(inventory, "Update");
                                _tracingService.Trace("Updated Inventory Status...");

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
                    throw new InvalidPluginExecutionException("No Transfer Details Found...");
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
            var inTransitTransferId = vehicleTransferReceiving.Contains("gsc_intransittransferid") ? vehicleTransferReceiving.GetAttributeValue<EntityReference>("gsc_intransittransferid").Id
                : Guid.Empty;

            //Retrieve In-Transit Transfer of In-Transit Transfer Receiving
            EntityCollection inTransitTransferCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_vehicleintransittransfer", "gsc_iv_vehicleintransittransferid", inTransitTransferId, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_sourcesiteid", "gsc_viasiteid" });

            _tracingService.Trace("In-Transit Transfer Records Retrieved: " + inTransitTransferCollection.Entities.Count);
                if(inTransitTransferCollection.Entities.Count > 0)
                {
                    Entity inTransitTransferEntity = inTransitTransferCollection.Entities[0];

                    //Retrieve Allocated Vehicles of In-Transit Transfer
                    EntityCollection allocatedVehicleCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_allocatedvehicle", "gsc_vehicleintransittransferid", inTransitTransferEntity.Id, _organizationService,
                    null, OrderType.Ascending, new[] { "gsc_sourcesiteid", "gsc_viasiteid", "gsc_inventoryid" });

                    _tracingService.Trace("Allocated Vehicle Records Retrieved: " + allocatedVehicleCollection.Entities.Count);
                    if (allocatedVehicleCollection.Entities.Count > 0)
                    {
                        foreach (Entity allocatedVehicle in allocatedVehicleCollection.Entities)
                        {
                            var sourceSiteId = allocatedVehicle.Contains("gsc_sourcesiteid") ? allocatedVehicle.GetAttributeValue<EntityReference>("gsc_sourcesiteid").Id
                                : Guid.Empty;
                            var inventoryId = allocatedVehicle.Contains("gsc_inventoryid") ? allocatedVehicle.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
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

                                //Retrieve Product Quantity of Via Site
                                EntityCollection viaQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", viaProdQuantityId, _organizationService,
                                 null, OrderType.Ascending, new[] { "gsc_available", "gsc_onhand", "gsc_productid" });

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
                                     OrderType.Ascending, new[] { "gsc_onhand", "gsc_available" });

                                    _tracingService.Trace("Source Site Product Quantity Records Retrieved: " + sourceQuantityCollection.Entities.Count);
                                    if (sourceQuantityCollection.Entities.Count > 0)
                                    {
                                        #region BL for Cancellation of Vehicle In-Transit Transfer Receiving
                                        Entity sourceQuantityEntity = sourceQuantityCollection.Entities[0];
                                        Int32 viaAvailable = viaQuantityEntity.GetAttributeValue<Int32>("gsc_available");
                                        Int32 viaOnHand = viaQuantityEntity.GetAttributeValue<Int32>("gsc_onhand");
                                        Int32 sourceAvailable = sourceQuantityEntity.GetAttributeValue<Int32>("gsc_available");
                                        Int32 sourceOnHand = sourceQuantityEntity.GetAttributeValue<Int32>("gsc_onhand");


                                        // Update Inventory. Status = Available
                                        inventoryEntity["gsc_productquantityid"] = new EntityReference(sourceQuantityEntity.LogicalName, sourceQuantityEntity.Id);
                                        inventoryEntity["gsc_status"] = new OptionSetValue(100000000);
                                        _organizationService.Update(inventoryEntity);
                                        _tracingService.Trace("Updated Inventory Status...");

                                        // Update Product Quantity of Via Site
                                        viaQuantityEntity["gsc_available"] = viaAvailable - 1;
                                        viaQuantityEntity["gsc_onhand"] = viaOnHand - 1;
                                        _organizationService.Update(viaQuantityEntity);
                                        _tracingService.Trace("Updated Via Site Product Quantity...");

                                        //Update Product Quantity of Source Site
                                        sourceQuantityEntity["gsc_available"] = sourceAvailable + 1;
                                        sourceQuantityEntity["gsc_onhand"] = sourceOnHand + 1;
                                        _organizationService.Update(sourceQuantityEntity);
                                        _tracingService.Trace("Updated Source Site Product Quantity...");

                                        // Delete Allocated Vehicle record
                                        _organizationService.Delete(allocatedVehicle.LogicalName, allocatedVehicle.Id);
                                        _tracingService.Trace("Deleted Allocated Vehicle...");
                                    }
                                }
                            }
                        }
                        // Update Vehicle In-Transit Transfer Status to Cancelled
                        inTransitTransferEntity["gsc_intransittransferstatus"] = new OptionSetValue(100000003);
                        _organizationService.Update(inTransitTransferEntity);
                        _tracingService.Trace("Updated Vehicle In-Transit Transfer status to cancelled...");
                                        #endregion
                    }
                
                }
                _tracingService.Trace("Ending CancelTransfer Method...");
        }
    }
}
