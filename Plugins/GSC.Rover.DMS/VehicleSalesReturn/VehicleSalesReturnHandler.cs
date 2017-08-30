using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.InventoryMovement;
namespace GSC.Rover.DMS.BusinessLogic.VehicleSalesReturn
{
    public class VehicleSalesReturnHandler
    {
        private readonly IOrganizationService _organizationService;
        private readonly ITracingService _tracingService;

        public VehicleSalesReturnHandler(IOrganizationService service, ITracingService trace)
        {
            _organizationService = service;
            _tracingService = trace;
        }

        //Created By : Raphael Herrera, Created On : 5/31/2016
        //Modified By : Jerome Anthony Gerero, Modified On : 1/4/2017
        //Modified By : Artum Ramos, Modified On : 1/23/2017  -- Add field customertype, paymentmode for replicate invoice 
        /*Purpose: Replicate Invoice Details
         * Event/Message:
         *      Pre/Create: Vehicle Sales Invoice No. = gsc_invoiceid
         *      Post/Update:
         * Primary Entity: Vehicle Sales Return
         */
        public Entity ReplicateInvoicedVehicle(Entity vehicleSalesReturnEntity, String message)
        {
            _tracingService.Trace("Starting ReplicateInvoice method...");

            Guid invoiceId = vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_invoiceid") != null
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_invoiceid").Id
                : Guid.Empty;

            EntityCollection invoicedVehicleRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_invoicedvehicle", "gsc_invoiceid", invoiceId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_inventoryid" });

            if (invoicedVehicleRecords != null && invoicedVehicleRecords.Entities.Count > 0)
            {
                Entity invoiceVehicle = invoicedVehicleRecords.Entities[0];

                Guid inventoryId = invoiceVehicle.Contains("gsc_inventoryid")
                    ? invoiceVehicle.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                    : Guid.Empty;

                EntityCollection inventoryRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_modelcode", "gsc_modelyear", "gsc_optioncode", "gsc_productionno", "gsc_csno", "gsc_engineno", "gsc_vin", "gsc_color" });

                if (inventoryRecords != null && inventoryRecords.Entities.Count > 0)
                {
                    Entity inventory = inventoryRecords.Entities[0];

                    vehicleSalesReturnEntity["gsc_modelcode"] = inventory.Contains("gsc_modelcode")
                        ? inventory.GetAttributeValue<String>("gsc_modelcode")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_optioncode"] = inventory.Contains("gsc_optioncode")
                        ? inventory.GetAttributeValue<String>("gsc_optioncode")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_modelyear"] = inventory.Contains("gsc_modelyear")
                        ? inventory.GetAttributeValue<String>("gsc_modelyear")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_color"] = inventory.Contains("gsc_color")
                        ? inventory.GetAttributeValue<String>("gsc_color")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_csno"] = inventory.Contains("gsc_csno")
                        ? inventory.GetAttributeValue<String>("gsc_csno")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_engineno"] = inventory.Contains("gsc_engineno")
                        ? inventory.GetAttributeValue<String>("gsc_engineno")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_vin"] = inventory.Contains("gsc_vin")
                        ? inventory.GetAttributeValue<String>("gsc_vin")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_productionno"] = inventory.Contains("gsc_productionno")
                        ? inventory.GetAttributeValue<String>("gsc_productionno")
                        : String.Empty;
                    vehicleSalesReturnEntity["gsc_returnquantity"] = inventory.Contains("gsc_vin")
                        ? 1
                        : 0;
                    vehicleSalesReturnEntity["gsc_inventoryid"] = new EntityReference(inventory.LogicalName, inventory.Id);
                }
            }

            EntityCollection invoiceRecords = CommonHandler.RetrieveRecordsByOneValue("invoice", "invoiceid", invoiceId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_productid", "gsc_unitprice", "customerid", "gsc_customer", "gsc_recordownerid", "gsc_dealerid", "gsc_branchid", "gsc_invoicedate", "name", "gsc_customertype", "gsc_paymentmode" });

            if (invoiceRecords != null && invoiceRecords.Entities.Count > 0)
            {
                Entity invoice = invoiceRecords.Entities[0];

                vehicleSalesReturnEntity["gsc_modeldescription"] = invoice.Contains("gsc_productid")
                    ? invoice.GetAttributeValue<EntityReference>("gsc_productid").Name
                    : String.Empty;
                vehicleSalesReturnEntity["gsc_returnedamount"] = invoice.Contains("gsc_unitprice")
                    ? new Money(invoice.GetAttributeValue<Money>("gsc_unitprice").Value)
                    : new Money(Decimal.Zero);
                vehicleSalesReturnEntity["gsc_customername"] = invoice.Contains("customerid")
                    ? invoice.GetAttributeValue<EntityReference>("customerid").Name
                    : String.Empty;
                vehicleSalesReturnEntity["gsc_customerid"] = invoice.Contains("gsc_customer")
                    ? invoice.GetAttributeValue<String>("gsc_customer")
                    : String.Empty;
                /*vehicleSalesReturnEntity["gsc_recordownerid"] = invoice.Contains("gsc_recordownerid")
                    ? invoice.GetAttributeValue<EntityReference>("gsc_recordownerid")
                    : null;
                vehicleSalesReturnEntity["gsc_dealerid"] = invoice.Contains("gsc_dealerid")
                    ? invoice.GetAttributeValue<EntityReference>("gsc_dealerid")
                    : null;
                vehicleSalesReturnEntity["gsc_branchid"] = invoice.Contains("gsc_branchid")
                    ? invoice.GetAttributeValue<EntityReference>("gsc_branchid")
                    : null;*/
                vehicleSalesReturnEntity["gsc_vehiclesalesinvoicedate"] = invoice.Contains("gsc_invoicedate")
                    ? invoice.GetAttributeValue<DateTime>("gsc_invoicedate")
                    : (DateTime?)null;
                vehicleSalesReturnEntity["gsc_releaseddate"] = invoice.Contains("gsc_invoicedate")
                    ? invoice.GetAttributeValue<DateTime>("gsc_invoicedate")
                    : (DateTime?)null;
                vehicleSalesReturnEntity["gsc_vehiclesalesreturnpn"] = "VSR - " + invoice.GetAttributeValue<String>("name");
                vehicleSalesReturnEntity["gsc_customertype"] = invoice.Contains("gsc_customertype")
                    ? invoice.GetAttributeValue<OptionSetValue>("gsc_customertype")
                    : null;
                vehicleSalesReturnEntity["gsc_paymentmode"] = invoice.Contains("gsc_paymentmode")
                    ? invoice.GetAttributeValue<OptionSetValue>("gsc_paymentmode")
                    : null;
            }

            _tracingService.Trace("Field assignment complete... Updating Entity...");

            if (message == "Update")
            {
                _organizationService.Update(vehicleSalesReturnEntity);    
            }           

            _tracingService.Trace("Exiting ReplicateInvoice method...");
            return vehicleSalesReturnEntity;
        }
        
        //Created By : Raphael Herrera, Created On : 6/3/2016
        //Modified By : Jerome Anthony Gerero, Modified On : 1/5/2017
        //Modified By : Artum Ramos, Modified On : 5/11/2017 
        /*Purpose: Set status to posted then update inventory count
         * Event/Message:
         *      Post/Update: gsc_posttransaction
         * Primary Entity: Vehicle Sales Return
         */
        public Entity PostTransaction(Entity vehicleSalesReturnEntity)
        {
            _tracingService.Trace("Started PostTransaction method...");

            if(IsValidInvoice(vehicleSalesReturnEntity) == false)
                throw new InvalidPluginExecutionException("Sales invoice selected already returned.");

            Entity inventory = RetrieveInventory(vehicleSalesReturnEntity);

            if (inventory != null)
            {
                _tracingService.Trace("Inventory Not Null.");

                Guid siteId = vehicleSalesReturnEntity.Contains("gsc_site")
                    ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_site").Id
                    : Guid.Empty;

                Entity productQuantity = RetrieveOldProductQuantity(inventory, vehicleSalesReturnEntity, siteId);

                String customerId = vehicleSalesReturnEntity.Contains("gsc_customerid") ?
                    vehicleSalesReturnEntity.GetAttributeValue<String>("gsc_customerid") : String.Empty;
                String customerName = vehicleSalesReturnEntity.Contains("gsc_customername") ?
                    vehicleSalesReturnEntity.GetAttributeValue<String>("gsc_customername") : String.Empty;
                String transactionNumber = vehicleSalesReturnEntity.Contains("gsc_vehiclesalesreturnpn") ?
                    vehicleSalesReturnEntity.GetAttributeValue<String>("gsc_vehiclesalesreturnpn") : String.Empty;
                DateTime transactionDate = DateTime.UtcNow;
                Guid fromSite = productQuantity.Contains("gsc_siteid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_siteid").Id : Guid.Empty;
                Guid productId = productQuantity.Contains("gsc_productid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_productid").Id : Guid.Empty;
                Guid colorId = productQuantity.Contains("gsc_vehiclecolorid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_vehiclecolorid").Id : Guid.Empty;
                Guid baseModel = productQuantity.Contains("gsc_vehiclemodelid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_vehiclemodelid").Id : Guid.Empty;
                String productName = productQuantity.Contains("gsc_productid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_productid").Name : String.Empty;

                _tracingService.Trace("Inventory History Created.");

                Entity productQuantityDestination = new Entity();
                if (siteId != fromSite)
                {
                    productQuantityDestination = RetrieveNewProductQuantity(vehicleSalesReturnEntity, productQuantity, siteId);

                    if (productQuantityDestination != null)
                    {
                        TransferInventoryToNewSite(productQuantityDestination, inventory, false);
                    }
                    else
                    {
                        productQuantityDestination = CreateNewProductQuantity(vehicleSalesReturnEntity, productQuantity, siteId);
                        productQuantityDestination = TransferInventoryToNewSite(productQuantityDestination, inventory, true);
                    }
                }
                else
                    productQuantityDestination = TransferInventoryToNewSite(productQuantity, inventory, false);

                InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);
                Int32 onHandDestination = productQuantityDestination.GetAttributeValue<Int32>("gsc_onhand");
                inventoryMovement.CreateInventoryHistory("Vehicle Sales Return", customerId, customerName, transactionNumber, transactionDate, 0, 1, onHandDestination, siteId, fromSite, siteId, inventory, productQuantityDestination, true, true);
               
                /*inventoryMovement.UpdateProductQuantityDirectly(productQuantity, 0, 0, 0, 0, -1, 0, 0, 0);
                Int32 onHandFrom = productQuantity.GetAttributeValue<Int32>("gsc_onhand");
                inventoryMovement.CreateInventoryHistory("Vehicle Sales Return", customerId, customerName, transactionNumber, transactionDate, 1, 0, onHandFrom, siteId, fromSite, fromSite, inventory, productQuantity, true, true);*/

                _tracingService.Trace("Inventory History Created.");
            }

            _tracingService.Trace("Update gsc_vehiclesalesreturnstatus");

            Entity quoteToUpdate = _organizationService.Retrieve(vehicleSalesReturnEntity.LogicalName, vehicleSalesReturnEntity.Id,
                new ColumnSet("gsc_vehiclesalesreturnstatus", "gsc_isinvoicereturned" ));

            vehicleSalesReturnEntity["gsc_vehiclesalesreturnstatus"] = new OptionSetValue(100000001);
            //Added by: JGC_05222017, Description: This will call Sales Return - Update Invoice isSalesReturned Tagging Workflow
            vehicleSalesReturnEntity["gsc_isinvoicereturned"] = true;
            //End
            _organizationService.Update(vehicleSalesReturnEntity);

            _tracingService.Trace("Ended PostTransaction method...");
            return vehicleSalesReturnEntity;
        }

        private Entity RetrieveInventory(Entity vehicleSalesReturnEntity)
        {
            _tracingService.Trace("Retrieve Inventory.");

            Guid inventoryId = vehicleSalesReturnEntity.Contains("gsc_inventoryid")
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                : Guid.Empty;

            EntityCollection inventoryRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService,
                null, OrderType.Ascending, new[] { "gsc_status", "gsc_productquantityid", "gsc_modelcode", "gsc_optioncode" });
            
            _tracingService.Trace(inventoryRecords.Entities.Count + " Inventory Records Retrieved...");
            
            if (inventoryRecords != null && inventoryRecords.Entities.Count > 0)
            {
                return inventoryRecords.Entities[0];
            }

            return null;
        }

        private Entity RetrieveOldProductQuantity(Entity inventory, Entity vehicleSalesReturnEntity, Guid siteId)
        {
            _tracingService.Trace("Update Sold Quantity From Old Site.");

            InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);
            var productQuantityId = inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id;

            EntityCollection productQuantityRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_sold", "gsc_available", "gsc_onhand", "gsc_siteid", "gsc_vehiclecolorid", "gsc_vehiclemodelid", "gsc_productid" });

            _tracingService.Trace(productQuantityRecords.Entities.Count + " Product Quantity Records Retrieved...");

            if (productQuantityRecords != null && productQuantityRecords.Entities.Count > 0)
            {
                _tracingService.Trace("Product Quantity Retrieved.");

                return  productQuantityRecords.Entities[0];

           /*     var presold = productQuantity.GetAttributeValue<Int32>("gsc_sold");
                var sold = 0;
                if (presold != 0)
                {
                    sold = presold - 1;
                }
                productQuantity["gsc_sold"] = sold;
                _tracingService.Trace("Adjusting Product Quantity...");*/
             //   _organizationService.Update(productQuantity);

                //return productQuantity;
            }

            return null;
        }

        private Entity RetrieveNewProductQuantity(Entity vehicleSalesReturnEntity, Entity productQuantity, Guid siteId)
        {
            _tracingService.Trace("Retrieve New Product Quantity.");

            Guid productId = productQuantity.Contains("gsc_productid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_productid").Id : Guid.Empty;
            Guid colorId = productQuantity.Contains("gsc_vehiclecolorid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_vehiclecolorid").Id : Guid.Empty;

            //Create filter for Sales Return To Site
            var destinationConditionList = new List<ConditionExpression>
                    {
                        new ConditionExpression("gsc_siteid", ConditionOperator.Equal, siteId),
                        new ConditionExpression("gsc_productid", ConditionOperator.Equal, productId),
                        new ConditionExpression("gsc_vehiclecolorid", ConditionOperator.Equal, colorId)
                    };

            EntityCollection productQuantityDestinationCollection = CommonHandler.RetrieveRecordsByConditions("gsc_iv_productquantity", destinationConditionList, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_sold", "gsc_available", "gsc_onhand", "gsc_siteid", "gsc_vehiclecolorid", "gsc_vehiclemodelid", "gsc_productid" });

            //    Int32 onHandCount = 1;
            if (productQuantityDestinationCollection != null && productQuantityDestinationCollection.Entities.Count > 0)
            {
                _tracingService.Trace("New Product Quantity Retrieved.");

                Entity productQuantityDestination = productQuantityDestinationCollection.Entities[0];

                return productQuantityDestination;
                //    onHandCount = onHandDestination + 1;
            }

            return null;
        }

        private Entity  CreateNewProductQuantity(Entity vehicleSalesReturnEntity, Entity productQuantity, Guid siteId)
        {
            _tracingService.Trace("Create New Product Quantity.");

            Guid fromSite = productQuantity.Contains("gsc_siteid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_siteid").Id : Guid.Empty;
            Guid productId = productQuantity.Contains("gsc_productid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_productid").Id : Guid.Empty;
            Guid colorId = productQuantity.Contains("gsc_vehiclecolorid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_vehiclecolorid").Id : Guid.Empty;
            Guid baseModel = productQuantity.Contains("gsc_vehiclemodelid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_vehiclemodelid").Id : Guid.Empty;
            String productName = productQuantity.Contains("gsc_productid") ? productQuantity.GetAttributeValue<EntityReference>("gsc_productid").Name : String.Empty;
            String SiteName = vehicleSalesReturnEntity.Contains("gsc_site")
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_site").Name
                : String.Empty;

            Entity prodQuantity = new Entity("gsc_iv_productquantity");

            _tracingService.Trace("Set product quantity count");

            prodQuantity["gsc_branchid"] = vehicleSalesReturnEntity.Contains("gsc_branchid")
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_branchid")
                : null;
            prodQuantity["gsc_dealerid"] = vehicleSalesReturnEntity.Contains("gsc_dealerid")
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_dealerid")
                : null;
            prodQuantity["gsc_recordownerid"] = vehicleSalesReturnEntity.Contains("gsc_recordownerid")
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_recordownerid")
                : null;
            prodQuantity["gsc_onhand"] = 1;
            prodQuantity["gsc_available"] = 1;
            prodQuantity["gsc_allocated"] = 0;
            prodQuantity["gsc_onorder"] = 0;
            prodQuantity["gsc_sold"] = 0;
            prodQuantity["gsc_siteid"] = siteId != Guid.Empty
                ? new EntityReference("gsc_iv_site", siteId)
                : null;
            prodQuantity["gsc_vehiclemodelid"] = baseModel != Guid.Empty
                ? new EntityReference("gsc_iv_vehiclebasemodel", baseModel)
                : null;
            prodQuantity["gsc_vehiclecolorid"] = colorId != Guid.Empty
                ? new EntityReference("gsc_cmn_vehiclecolor", colorId)
                : null;
            prodQuantity["gsc_productid"] = new EntityReference("product", productId);
            prodQuantity["gsc_productquantitypn"] = productName + "-" + SiteName;

            Guid newProductQuantityId = _organizationService.Create(prodQuantity);
            _tracingService.Trace("New Product Quantity Created.");

            EntityCollection productQuantityEC = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", newProductQuantityId, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_sold", "gsc_available", "gsc_onhand", "gsc_siteid", "gsc_vehiclecolorid", "gsc_vehiclemodelid", "gsc_productid" });

            _tracingService.Trace("Product Quantity Retrieved.");
            return productQuantityEC.Entities[0];
        }

        private Entity TransferInventoryToNewSite(Entity productQuantityDestination, Entity inventory, Boolean newlyCreated)
        {
            //Update of inventory status
            inventory["gsc_status"] = new OptionSetValue(100000000);
            inventory["gsc_productquantityid"] = new EntityReference("gsc_iv_productquantity", productQuantityDestination.Id);
            _organizationService.Update(inventory);
            _tracingService.Trace("Updated inventory status to available...");

            if (!newlyCreated)
            {
                InventoryMovementHandler inventoryMovement = new InventoryMovementHandler(_organizationService, _tracingService);
                return inventoryMovement.UpdateProductQuantityDirectly(productQuantityDestination, 1, 1, 0, 0, 0, 0, 0, 0);
            }

            return productQuantityDestination;
        }


        //Created By : Raphael Herrera, Created On : 6/3/2016
        /*Purpose: Checker if record is already posted
         * Event/Message:
         *      Pre/Create: 
         *      Post/Update:
         *      Post/Create:
         * Primary Entity: Vehicle Sales Return
         */
        public bool isPostedTransaction(Entity vehicleSalesReturn)
        {
            bool isPosted = false;

            isPosted = vehicleSalesReturn.GetAttributeValue<OptionSetValue>("gsc_vehiclesalesreturnstatus").Value == 100000001 ?
                true : false;

            return isPosted;
        }

        //Created By : Artum Ramos, Created On : 12/7/2016
        /*Purpose: Delete Purchase Record Trigger in Posted
         * Event/Message:
         *      Pre/Create: 
         *      Post/Update:
         *      Post/Create:
         * Primary Entity: Vehicle Sales Return
         */
        public void DeleteTransactedVehicle(Entity vehicleSalesReturn)
        {
            _tracingService.Trace("Started DeleteTransactedVehicle Method...");
            
            var invoiceId = vehicleSalesReturn.GetAttributeValue<EntityReference>("gsc_invoiceid") != null
               ? vehicleSalesReturn.GetAttributeValue<EntityReference>("gsc_invoiceid").Id
               : Guid.Empty;

            _tracingService.Trace("Retrieve Invoice Vehicle...");
            //Retrieve Invoiced Vehicle
            EntityCollection InvoicedVehicleItems = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_invoicedvehicle", "gsc_invoiceid", invoiceId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_vin", "gsc_engineno", "gsc_color", "gsc_csno" });

            _tracingService.Trace("Check If InvoiceVehicleItems have a data...");
            if (InvoicedVehicleItems.Entities.Count > 0)
            {
                Entity InvoicedVehicle = InvoicedVehicleItems[0];

                var invoiceVin = InvoicedVehicle.Contains("gsc_vin")
                   ? InvoicedVehicle.GetAttributeValue<String>("gsc_vin")
                   : String.Empty;

                var invoiceEngineNo = InvoicedVehicle.Contains("gsc_engineno")
                   ? InvoicedVehicle.GetAttributeValue<String>("gsc_engineno")
                   : String.Empty;

                var invoiceColor = InvoicedVehicle.Contains("gsc_color")
                   ? InvoicedVehicle.GetAttributeValue<String>("gsc_color")
                   : String.Empty;

                var invoiceCSNo = InvoicedVehicle.Contains("gsc_csno")
                   ? InvoicedVehicle.GetAttributeValue<String>("gsc_csno")
                   : String.Empty;   

                _tracingService.Trace("Create Filter Condition...");
                //Create filter for TransactedVehicle in invoiceVehicle 
                var transactedVehicleConditionList = new List<ConditionExpression>
                {
                    new ConditionExpression("gsc_vin", ConditionOperator.Equal, invoiceVin),
                    new ConditionExpression("gsc_engineserialno", ConditionOperator.Equal, invoiceEngineNo),
                    new ConditionExpression("gsc_color", ConditionOperator.Equal, invoiceColor),
                    new ConditionExpression("gsc_conductionno", ConditionOperator.Equal, invoiceCSNo)
                };

                _tracingService.Trace("Start Retrieve Transated Vehicle Record...");
                EntityCollection transactedVehicleRecord = CommonHandler.RetrieveRecordsByConditions("gsc_cmn_transactedvehicle", transactedVehicleConditionList, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_cmn_transactedvehicleid" });


                if (transactedVehicleRecord != null && transactedVehicleRecord.Entities.Count == 1)
                {
                    Entity transactedVehicleInquiry = transactedVehicleRecord.Entities[0];

                    _tracingService.Trace("Deleting Transactedvehicle Data..");
                    _organizationService.Delete(transactedVehicleInquiry.LogicalName, transactedVehicleInquiry.Id);  
                }
                else if (transactedVehicleRecord != null && transactedVehicleRecord.Entities.Count > 1)        
                {
                     var CustomerName = vehicleSalesReturn.Contains("gsc_customername")
                        ? vehicleSalesReturn.GetAttributeValue<String>("gsc_customername")
                        : String.Empty;

                     _tracingService.Trace("Retrieve Invoice Customer Name...");
                     //Retrieve Invoiced Customer Name
                    EntityCollection InvoicedCustomerNameItems = CommonHandler.RetrieveRecordsByOneValue("invoice", "invoiceid", invoiceId, _organizationService, null, OrderType.Ascending,
                    new[] { "accountid", "contactid" });   

                     _tracingService.Trace("Check If InvoinceCustomerNameItems have a data...");
                    if (InvoicedCustomerNameItems.Entities.Count > 0)   
                    {
                        Entity InvoicedCustomerName = InvoicedVehicleItems[0];

                        var InvoicedCustomer = InvoicedCustomerName.GetAttributeValue<EntityReference>("accountid") != null
                            ? InvoicedCustomerName.GetAttributeValue<EntityReference>("accountid").Name
                            : InvoicedCustomerName.GetAttributeValue<EntityReference>("contactid").Name;

                        if (CustomerName == InvoicedCustomer)
                        {
                            Entity transactedVehicleInquiry = transactedVehicleRecord.Entities[0];

                            _tracingService.Trace("Deleting Transactedvehicle Data..");
                            _organizationService.Delete(transactedVehicleInquiry.LogicalName, transactedVehicleInquiry.Id);  
                        }
                    }
                    
                }
            }
            _tracingService.Trace("Ended DeleteTransactedVehicle method..");
           
        }
    
        //Created By : Jerome Anthony Gerero, Created On : 3/22/2017
        //Modified By : Artum Ramos, Modified On : 5/11/2017 
        /*Purpose: Create inventory history record on posted vehicle sales return
         * Event/Message:
         *      Post/Update: gsc_posttransaction
         * Primary Entity: Vehicle Sales Return
         */
        public Entity CreateReturnedInventoryHistory(Entity vehicleSalesReturnEntity)
        {
            _tracingService.Trace("Started CreateReturnedInventoryHistory Method...");

            Guid inventoryId = vehicleSalesReturnEntity.Contains("gsc_inventoryid")
                ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_inventoryid").Id
                : Guid.Empty;

            Entity inventoryHistory = new Entity("gsc_iv_inventoryhistory");


            inventoryHistory["gsc_transactiontype"] = "Vehicle Sales Return";
            inventoryHistory["gsc_customername"] = vehicleSalesReturnEntity.Contains("gsc_customername")
                ? vehicleSalesReturnEntity.GetAttributeValue<String>("gsc_customername")
                : String.Empty;
            inventoryHistory["gsc_customerid"] = vehicleSalesReturnEntity.Contains("gsc_customerid")
                ? vehicleSalesReturnEntity.GetAttributeValue<String>("gsc_customerid")
                : String.Empty;
            inventoryHistory["gsc_vsidate"] = vehicleSalesReturnEntity.Contains("gsc_vehiclesalesinvoicedate")
                ? vehicleSalesReturnEntity.GetAttributeValue<DateTime?>("gsc_vehiclesalesinvoicedate")
                : (DateTime?)null;
            inventoryHistory["gsc_releaseddate"] = vehicleSalesReturnEntity.Contains("gsc_releaseddate")
                ? vehicleSalesReturnEntity.GetAttributeValue<DateTime?>("gsc_releaseddate")
                : (DateTime?)null;
            inventoryHistory["gsc_quantitytype"] = new OptionSetValue(100000007);
            inventoryHistory["gsc_latest"] = true;
            inventoryHistory["gsc_transactionnumber"] = vehicleSalesReturnEntity.Contains("gsc_vehiclesalesreturnpn")
                ? vehicleSalesReturnEntity.GetAttributeValue<String>("gsc_vehiclesalesreturnpn")
                : String.Empty;
            
            EntityCollection inventoryRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_inventory", "gsc_iv_inventoryid", inventoryId, _organizationService, null, OrderType.Ascending,
                new[] { "gsc_color", "gsc_csno", "gsc_engineno", "gsc_modelcode", "gsc_optioncode", "gsc_productionno", "gsc_vin", "gsc_productid", "gsc_modelyear", "gsc_productquantityid" });
            
            if (inventoryRecords != null && inventoryRecords.Entities.Count > 0)
            {
                Entity inventory = inventoryRecords.Entities[0];
                inventoryHistory["gsc_inventoryid"] = new EntityReference("gsc_iv_inventory", inventory.Id);
                inventoryHistory["gsc_color"] = inventory.Contains("gsc_color")
                    ? inventory.GetAttributeValue<String>("gsc_color")
                    : String.Empty;
                inventoryHistory["gsc_modelcode"] = inventory.Contains("gsc_modelcode")
                    ? inventory.GetAttributeValue<String>("gsc_modelcode")
                    : String.Empty;
                inventoryHistory["gsc_optioncode"] = inventory.Contains("gsc_optioncode")
                    ? inventory.GetAttributeValue<String>("gsc_optioncode")
                    : String.Empty;
                inventoryHistory["gsc_modelyear"] = inventory.Contains("gsc_modelyear")
                    ? inventory.GetAttributeValue<String>("gsc_modelyear")
                    : String.Empty;
                inventoryHistory["gsc_vin"] = inventory.Contains("gsc_vin")
                    ? inventory.GetAttributeValue<String>("gsc_vin")
                    : String.Empty;
                inventoryHistory["gsc_csno"] = inventory.Contains("gsc_csno")
                    ? inventory.GetAttributeValue<String>("gsc_csno")
                    : String.Empty;
                inventoryHistory["gsc_productionno"] = inventory.Contains("gsc_productionno")
                    ? inventory.GetAttributeValue<String>("gsc_productionno")
                    : String.Empty;
                inventoryHistory["gsc_engineno"] = inventory.Contains("gsc_engineno")
                    ? inventory.GetAttributeValue<String>("gsc_engineno")
                    : String.Empty;

                Guid productQuantityId = inventory.Contains("gsc_productquantityid")
                    ? inventory.GetAttributeValue<EntityReference>("gsc_productquantityid").Id
                    : Guid.Empty;

                EntityCollection productQuantityRecords = CommonHandler.RetrieveRecordsByOneValue("gsc_iv_productquantity", "gsc_iv_productquantityid", productQuantityId, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_vehiclecolorid", "gsc_siteid", "gsc_productid" });

                if (productQuantityRecords != null && productQuantityRecords.Entities.Count > 0)
                {
                    Entity productQuantity = productQuantityRecords.Entities[0];
                    inventoryHistory["gsc_productid"] = productQuantity.Contains("gsc_productid")
                        ? productQuantity.GetAttributeValue<EntityReference>("gsc_productid")
                        : null;
                    inventoryHistory["gsc_vehiclecolorid"] = productQuantity.Contains("gsc_vehiclecolorid")
                        ? productQuantity.GetAttributeValue<EntityReference>("gsc_vehiclecolorid")
                        : null;
                    inventoryHistory["gsc_siteid"] = productQuantity.Contains("gsc_siteid")
                        ? productQuantity.GetAttributeValue<EntityReference>("gsc_siteid")
                        : null;
                    inventoryHistory["gsc_productquantityid"] = new EntityReference(productQuantity.LogicalName, productQuantity.Id);
                }
            }
            
            _organizationService.Create(inventoryHistory);

            _tracingService.Trace("Ended CreateReturnedInventoryHistory Method...");
            return vehicleSalesReturnEntity;
        }

        public Boolean IsValidInvoice(Entity vehicleSalesReturnEntity)
        {
            Guid invoiceId = vehicleSalesReturnEntity.Contains("gsc_invoiceid")
               ? vehicleSalesReturnEntity.GetAttributeValue<EntityReference>("gsc_invoiceid").Id
               : Guid.Empty;

            EntityCollection invoiceCollection = CommonHandler.RetrieveRecordsByOneValue("invoice", "invoiceid", invoiceId, _organizationService, null, OrderType.Ascending,
                    new[] { "gsc_issalesreturned" });
            if (invoiceCollection != null && invoiceCollection.Entities.Count > 0)
            {
                Entity invoiceEntity = invoiceCollection.Entities[0];
                if(invoiceEntity.GetAttributeValue<Boolean>("gsc_issalesreturned"))
                return false;
            }
            return true;
        }

    }
}
