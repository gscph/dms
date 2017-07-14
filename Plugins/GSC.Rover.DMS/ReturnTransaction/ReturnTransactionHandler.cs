using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

using GSC.Rover.DMS.BusinessLogic.Common;
using GSC.Rover.DMS.BusinessLogic.InventoryMovement;

namespace GSC.Rover.DMS.BusinessLogic.ReturnTransaction
{
    public class ReturnTransactionHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public ReturnTransactionHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Created By : Raphael Herrera, Created On : 7/18/2016
        /*Purpose: Adjust Allocated, Available and On-hand product quantity. Handles Post Transactions, Cancel Transaction and Allocate Vehicle
         * Registration Details: 
         * Event/Message:
         *      Pre/Create: 
         *      Post/Update:
         *      Post/Create:
         * Primary Entity: Return Transaction Detail
         */
        public void AdjustProductQuantity(Entity returnTransaction, string caller)
        {
            _tracingService.Trace("Started AdjustProductQuantity Method...");

            String transactionNumber = returnTransaction.Contains("gsc_returntransactionpn") ? returnTransaction.GetAttributeValue<String>("gsc_returntransactionpn") : String.Empty;
            DateTime transactionDate = DateTime.UtcNow;

            EntityCollection returnTransactionDetailCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_cmn_returntransactiondetails", "gsc_returntransactionid", returnTransaction.Id, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_inventoryid" });

            _tracingService.Trace("TransactionDetail count: " + returnTransactionDetailCollection.Entities.Count.ToString());
            if (returnTransactionDetailCollection.Entities.Count > 0)
            {
                var inventoryId = returnTransactionDetailCollection.Entities[0].Contains("gsc_inventoryid") ? returnTransactionDetailCollection.Entities[0].GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                    : Guid.Empty;

                EntityCollection inventoryCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_productquantityid", "gsc_modelcode", "gsc_optioncode", "gsc_color", "gsc_csno", "gsc_engineno", "gsc_modelyear", "gsc_productionno", "gsc_vin", "gsc_siteid", "gsc_productid", "gsc_basemodelid" });
                _tracingService.Trace("Inventory count: " + inventoryCollection.Entities.Count);

                if (inventoryCollection.Entities.Count > 0)
                {
                    Entity inventoryEntity = inventoryCollection.Entities[0];
                    
                    var productQuantityId = inventoryEntity.Contains("gsc_productquantityid") ? inventoryEntity.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                        : Guid.Empty;

                    //retrieve and update product quantity
                    EntityCollection productQuantityCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService, null,
                        OrderType.Ascending, new[] { "gsc_allocated", "gsc_onhand", "gsc_available", "gsc_siteid", "gsc_vehiclecolorid", "gsc_vehiclemodelid", "gsc_productid"});
                    _tracingService.Trace("Product Quantity record count: " + productQuantityCollection.Entities.Count);

                    if (productQuantityCollection.Entities.Count > 0)
                    {
                        Entity productQuantity = productQuantityCollection.Entities[0];

                        Int32 allocated = productQuantity.Contains("gsc_allocated")
                            ? productQuantity.GetAttributeValue<Int32>("gsc_allocated")
                            : 0;
                        Int32 onHand = productQuantity.Contains("gsc_onhand")
                            ? productQuantity.GetAttributeValue<Int32>("gsc_onhand")
                            : 0;
                        Int32 available = productQuantity.Contains("gsc_available")
                            ? productQuantity.GetAttributeValue<Int32>("gsc_available")
                            : 0;

                        _tracingService.Trace("Applying product quantity adjustment for " + caller);

                        InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);

                        //BL when posting return transaction
                        if (caller == "postTransaction")
                        {
                            if (allocated > 0)
                            {
                                productQuantity["gsc_allocated"] = allocated - 1;    
                            }

                            if (onHand > 0)
                            {
                                productQuantity["gsc_onhand"] = onHand - 1;    
                            }                            

                            _tracingService.Trace("Updating product quantity. Allocated = " + (allocated - 1) + "onhand = " + (onHand - 1));

                            // Create inventory log
                            Guid fromSite = productQuantity.Contains("gsc_siteid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_siteid").Id : Guid.Empty;
                            InventoryMovementHandler inventoryMovementHandler = new InventoryMovementHandler(_organizationService, _tracingService);
                            inventoryMovementHandler.CreateInventoryHistory("Vehicle Return", null, null, transactionNumber, transactionDate, 1, 0, onHand - 1, Guid.Empty,fromSite,fromSite, inventoryEntity, productQuantity, true,true);
                            inventoryMovement.CreateInventoryQuantityAllocated(returnTransaction, inventoryEntity, productQuantity, returnTransaction.GetAttributeValue<string>("gsc_returntransactionpn"),
                                DateTime.UtcNow, "Returned", Guid.Empty, 100000007);

                            //delete associated inventory
                            _organizationService.Delete("gsc_iv_inventory", inventoryId);
                            _tracingService.Trace("Deleted inventory record...");
                        }
                        
                        //BL when cancelling return transaction
                        else if (caller == "cancel")
                        {
                            //set inventory status to available
                            inventoryEntity["gsc_status"] = new OptionSetValue(100000000);
                            _organizationService.Update(inventoryEntity);
                            _tracingService.Trace("Updated inventory status to available...");

                            productQuantity["gsc_available"] = available + 1;
                            
                            if (allocated > 0)
                            {
                                productQuantity["gsc_allocated"] = allocated - 1;    
                            }                           

                            UncheckReceivingTransactionBoolean(returnTransaction);
                            //Create Inventory History Log
                            inventoryMovement.CreateInventoryQuantityAllocated(returnTransaction, inventoryEntity, productQuantity, returnTransaction.GetAttributeValue<string>("gsc_returntransactionpn"),
                                DateTime.UtcNow, "Cancelled", Guid.Empty, 100000004);
                        }

                        //BL when allocating return transaction. Triggered on create/update
                        else if (caller == "allocate")
                        {
                            inventoryEntity["gsc_status"] = new OptionSetValue(100000001);
                            _organizationService.Update(inventoryEntity);
                            _tracingService.Trace("Updated inventory status to allocated...");

                            if (available > 0)
                            {
                                productQuantity["gsc_available"] = available - 1;    
                            }
                            
                            productQuantity["gsc_allocated"] = allocated + 1;

                            //Create Inventory History Log
                            inventoryMovement.CreateInventoryQuantityAllocated(returnTransaction, inventoryEntity, productQuantity, returnTransaction.GetAttributeValue<string>("gsc_returntransactionpn"),
                                DateTime.UtcNow, "Open", Guid.Empty, 100000001);
                        }

                        _organizationService.Update(productQuantity);
                        
                    }
                }
            }
            _tracingService.Trace("Ending AdjustProductQuantity Method...");
        }


        //Created By : Raphael Herrera, Created On : 7/19/2016
        /*Purpose: Replicate Receiving Transaction Fields
         * Registration Details: 
         * Event/Message:
         *      Pre/Create: 
         *      Post/Update:
         *      Post/Create: Return Transaction
         * Primary Entity: Return Transaction
         */
        public void PopulateReturnTransactionFields(Entity returnTransaction)
        {
            _tracingService.Trace("Started PopulateReturnTransactionFields Method...");

            var receivingTransactionId = returnTransaction.Contains("gsc_receivingtransactionid") ? returnTransaction.GetAttributeValue<EntityReference>("gsc_receivingtransactionid").Id
                : Guid.Empty;

            EntityCollection receivingTransactionCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_cmn_receivingtransaction", "gsc_cmn_receivingtransactionid", receivingTransactionId, _organizationService,
                null, OrderType.Ascending, new []{ "gsc_invoiceno", "gsc_purchaseorderid", "gsc_siteid", "gsc_isreturnrecordcreated" });

            EntityCollection receivingDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_cmn_receivingtransactiondetail", "gsc_receivingtransactionid", receivingTransactionId, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_productid", "gsc_modelcode", "gsc_optioncode", "gsc_modelyear", "gsc_vehiclecolorid", "gsc_csno", "gsc_vin", "gsc_productionno", "gsc_engineno", "gsc_inventoryid", "gsc_receivingtransactiondetailpn", "gsc_basemodelid" });

            _tracingService.Trace("ReceivingTransaction Records: " + receivingTransactionCollection.Entities.Count + " | ReceivingDetails Records: " + receivingDetailsCollection.Entities.Count);


            //retrieve and delete pre existing return details
            EntityCollection returnDetailsCollection = CommonHandler.RetrieveRecordsByOneValue("gsc_cmn_returntransactiondetails", "gsc_returntransactionid", returnTransaction.Id, _organizationService, null,
                OrderType.Ascending, new[] { "gsc_cmn_returntransactiondetailsid" });

            _tracingService.Trace("Existing return details: " + returnDetailsCollection.Entities.Count);

            foreach (Entity returnDetails in returnDetailsCollection.Entities)
            {
                _organizationService.Delete(returnDetails.LogicalName, returnDetails.Id);
            }

            EntityReference siteid = null;
            InventoryMovementHandler inventoryMovementHandler = new InventoryMovementHandler(_organizationService, _tracingService);

            //create return transaction details
            if (receivingDetailsCollection.Entities.Count > 0)
            {
                foreach (Entity receivingDetailEntity in receivingDetailsCollection.Entities)
                {
                    Guid inventoryid = receivingDetailEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id;
                    siteid = inventoryMovementHandler.getSiteId(inventoryid);
                    
                    Entity returnTransactionDetail = new Entity("gsc_cmn_returntransactiondetails");

                    returnTransactionDetail["gsc_returntransactionid"] = new EntityReference(returnTransaction.LogicalName, returnTransaction.Id);

                    returnTransactionDetail["gsc_productid"] = receivingDetailEntity.Contains("gsc_productid") ? receivingDetailEntity.GetAttributeValue<EntityReference>("gsc_productid")
                       : null ;
                    returnTransactionDetail["gsc_modelcode"] = receivingDetailEntity.Contains("gsc_modelcode") ? receivingDetailEntity.GetAttributeValue<string>("gsc_modelcode")
                       : string.Empty;
                    returnTransactionDetail["gsc_optioncode"] = receivingDetailEntity.Contains("gsc_optioncode") ? receivingDetailEntity.GetAttributeValue<string>("gsc_optioncode")
                       : string.Empty;
                    returnTransactionDetail["gsc_modelyear"] = receivingDetailEntity.Contains("gsc_modelyear") ? receivingDetailEntity.GetAttributeValue<string>("gsc_modelyear")
                        : string.Empty;
                    returnTransactionDetail["gsc_vehiclecolorid"] = receivingDetailEntity.Contains("gsc_vehiclecolorid") ? receivingDetailEntity.GetAttributeValue<EntityReference>("gsc_vehiclecolorid")
                       : null;
                    returnTransactionDetail["gsc_csno"] = receivingDetailEntity.Contains("gsc_csno") ? receivingDetailEntity.GetAttributeValue<string>("gsc_csno")
                       : string.Empty;
                    returnTransactionDetail["gsc_vin"] = receivingDetailEntity.Contains("gsc_vin") ? receivingDetailEntity.GetAttributeValue<string>("gsc_vin")
                        : string.Empty;
                    returnTransactionDetail["gsc_productionno"] = receivingDetailEntity.Contains("gsc_productionno") ? receivingDetailEntity.GetAttributeValue<string>("gsc_productionno")
                       : string.Empty;
                    returnTransactionDetail["gsc_engineno"] = receivingDetailEntity.Contains("gsc_engineno") ? receivingDetailEntity.GetAttributeValue<string>("gsc_engineno")
                        : string.Empty;
                    returnTransactionDetail["gsc_inventoryid"] = new EntityReference("gsc_iv_inventory", inventoryid);
                    
                    returnTransactionDetail["gsc_returntransactionpn"] = receivingDetailEntity.Contains("gsc_receivingtransactiondetailpn") ? receivingDetailEntity.GetAttributeValue<string>("gsc_receivingtransactiondetailpn")
                        : string.Empty;
                    returnTransactionDetail["gsc_basemodelid"] = receivingDetailEntity.Contains("gsc_basemodelid") ? receivingDetailEntity.GetAttributeValue<EntityReference>("gsc_basemodelid")
                       : null;
                  
                    _tracingService.Trace("Creating Return Transaction Detail...");
                    _organizationService.Create(returnTransactionDetail);
                }
               
            }


            //Update return transaction fields
            if (receivingTransactionCollection.Entities.Count > 0)
            {
                Entity receivingTransaction = receivingTransactionCollection.Entities[0];

                returnTransaction["gsc_invoiceno"] = receivingTransaction.Contains("gsc_invoiceno") ?receivingTransaction.GetAttributeValue<string>("gsc_invoiceno")
                    : string.Empty;
                returnTransaction["gsc_vpono"] = receivingTransaction.Contains("gsc_purchaseorderid") ? receivingTransaction.GetAttributeValue<EntityReference>("gsc_purchaseorderid").Name
                    : string.Empty;
                returnTransaction["gsc_site"] = siteid.Name;

                //set returnstatus to Open
                returnTransaction["gsc_returnstatus"] = new OptionSetValue(100000000);
                returnTransaction["gsc_vrstatus"] = new OptionSetValue(100000000);

                _tracingService.Trace("Updating Return Transaction...");
                _organizationService.Update(returnTransaction);

                //Set 'Is Return Record Created' field to true
                receivingTransaction["gsc_isreturnrecordcreated"] = true;

                _tracingService.Trace("Updating Receiving Transaction...");
                _organizationService.Update(receivingTransaction);
            }

            _tracingService.Trace("Ending PopulateReturnTransactionFields Method...");
        }

        //Created By :Artum Ramos, Created On : 2/8/2017
        /*Purpose: Replicate VR Status
         * Registration Details: 
         * Event/Message:
         *      Pre/Create: 
         *      Post/Update: Return Transaction
         *      Post/Create: 
         * Primary Entity: Return Transaction
         */
        public void ReplicateVrStatus(Entity returnTransaction)
        {
            _tracingService.Trace("Started ReplicateVrStatus method..");

            returnTransaction["gsc_returnstatus"] = returnTransaction.Contains("gsc_vrstatus")
                ? returnTransaction.GetAttributeValue<OptionSetValue>("gsc_vrstatus")
                : null;

            _organizationService.Update(returnTransaction);

            _tracingService.Trace("Ended ReplicateVrStatus method..");
        }
    
        //Created By : Jerome Anthony Gerero, Created On : 2/9/2017
        /*Purpose: Uncheck 'Is Return Record Created' field from Receiving Transaction
         * Registration Details: 
         * Event/Message:
         *      Pre/Create: 
         *      Post/Update: Return Status
         *      Pre/Delete: Return Status
         * Primary Entity: Receiving Transaction
         */
        private void UncheckReceivingTransactionBoolean(Entity returnTransaction)
        {
            _tracingService.Trace("Started UncheckReceivingTransactionBoolean method..");

            Guid receivingTransactionId = returnTransaction.Contains("gsc_receivingtransactionid")
                ? returnTransaction.GetAttributeValue<EntityReference>("gsc_receivingtransactionid").Id
                : Guid.Empty;

            EntityCollection receivingTransactionRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_cmn_receivingtransaction", "gsc_cmn_receivingtransactionid", receivingTransactionId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_isreturnrecordcreated" });

            if (receivingTransactionRecords != null && receivingTransactionRecords.Entities.Count > 0)
            {
                Entity receivingTransaction = receivingTransactionRecords.Entities[0];

                receivingTransaction["gsc_isreturnrecordcreated"] = false;

                _tracingService.Trace("Updating Receiving Transaction...");
                _organizationService.Update(receivingTransaction);
            }

            _tracingService.Trace("Ended UncheckReceivingTransactionBoolean method..");
        }

        public Boolean IsValidToDelete(Entity returnTransaction)
        {
            _tracingService.Trace("Started IsValidToDelete method..");
            var returnTransactionStatus = returnTransaction.Contains("gsc_returnstatus") ? returnTransaction.GetAttributeValue<OptionSetValue>("gsc_returnstatus").Value
                 : 0;
            return (returnTransactionStatus == 100000000);          
        }

        //Created By: Leslie G. Baliguat, Created On: 07/11/2017
        /*Purpose: Validate if vehicle is still available before creating receiving record
         * Registration Details: 
         * Event/Message:
         *      Pre/Create: Receiving Transaction
         * Primary Entity: Receiving Transaction
         */
        public Boolean CheckIfInventoryIsAvailable(Entity returnTransaction)
        {
            _tracingService.Trace("Started CheckIfInventoryIsAvailable method..");

            var recevingId = returnTransaction.GetAttributeValue<EntityReference>("gsc_receivingtransactionid") != null
                ? returnTransaction.GetAttributeValue<EntityReference>("gsc_receivingtransactionid").Id
                : Guid.Empty;

            EntityCollection receivingTransactionDetailRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_cmn_receivingtransactiondetail", "gsc_receivingtransactionid", recevingId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_inventoryid" });

            _tracingService.Trace("Receiving Transaction Details: " + receivingTransactionDetailRecords.Entities.Count);

            if (receivingTransactionDetailRecords != null && receivingTransactionDetailRecords.Entities.Count > 0)
            {
                _tracingService.Trace("Retrieve transaction detail.");

                Entity receivingDetail = receivingTransactionDetailRecords.Entities[0];
                Guid entityId = receivingDetail.GetAttributeValue<EntityReference>("gsc_inventoryid") != null
                    ? receivingDetail.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                    : Guid.Empty;

                EntityCollection inventoryRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", entityId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_status" });

                if (inventoryRecords != null && inventoryRecords.Entities.Count > 0)
                {
                    _tracingService.Trace("Retrieve Inventory.");

                    Entity inventory = inventoryRecords.Entities[0];
                    var status = inventory.Contains("gsc_status")
                        ? inventory.GetAttributeValue<OptionSetValue>("gsc_status").Value
                        : 0;
                    _tracingService.Trace("Inventory Stratus." + status);

                    if (status == 100000000)
                    {
                        return true;
                    }
                }
                else
                {
                    throw new InvalidPluginExecutionException("Cannot proceed with your transaction. Vehicle of this receiving record is no longer existing.");
                }
            }

            _tracingService.Trace("Ended CheckIfInventoryIsAvailable method..");

            return false;
        }
    }
}
