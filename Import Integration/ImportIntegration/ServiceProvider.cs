using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImportIntegration
{
    public class ServiceProvider
    {
        private readonly IOrganizationService _service;
        private readonly Logger _logger;

        public int RecordsUploaded { get; set; }
        public int RecordsFailedUpload { get; set; }

        public ServiceProvider(IOrganizationService service, Logger logger)
        {
            _service = service;
            _logger = logger;
        }

        public void MassUploadReceiving(IEnumerable<ReceivingTransaction> receivingTransactions)
        {
            int counter = 1;
            foreach (ReceivingTransaction item in receivingTransactions)
            {
                if (IsRowEmpty(item))
                {
                    continue;
                }

                Entity rt = new Entity("gsc_cmn_receivingtransaction");

                Guid dealerId = GetEntityReferenceId("account",
                 GetEntityConditionExpression("accountnumber", item.DealerCode));

                Guid branchId = GetEntityReferenceId("account",
                  GetEntityConditionExpression("accountnumber", item.BranchCode));

                if (dealerId == Guid.Empty)
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}]. Dealer Code:[{2}]  does not exist in the DMS..", counter, item.VehiclePurchaseOrderNumber, item.DealerCode);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (branchId == Guid.Empty)
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}]. Branch Code:[{2}]  does not exist in the DMS..", counter, item.VehiclePurchaseOrderNumber, item.BranchCode);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                List<ConditionExpression> vpoConditionExp = new List<ConditionExpression>();
                vpoConditionExp.Add(new ConditionExpression("gsc_purchaseorderpn", ConditionOperator.Equal, item.VehiclePurchaseOrderNumber));
                vpoConditionExp.Add(new ConditionExpression("gsc_dealerid", ConditionOperator.Equal, dealerId));
                vpoConditionExp.Add(new ConditionExpression("gsc_branchid", ConditionOperator.Equal, branchId));
                // check if vpo status is equal to Ordered
                vpoConditionExp.Add(new ConditionExpression("gsc_vpostatus", ConditionOperator.Equal, 100000002));
                vpoConditionExp.Add(new ConditionExpression("gsc_isreceivedrecordcreated", ConditionOperator.Equal, false));

                Entity vpo = GetEntityRecord("gsc_cmn_purchaseorder", vpoConditionExp,
                         new string[] { "gsc_purchaseorderpn", "gsc_vpostatus", "gsc_recordownerid"});

                Guid vpoId = vpo.Id;

                List<ConditionExpression> vpoDetailConditionExp = new List<ConditionExpression>();
                vpoDetailConditionExp.Add(new ConditionExpression("gsc_purchaseorderid", ConditionOperator.Equal, vpoId));

                Entity vpoDetail = GetEntityRecord("gsc_cmn_purchaseorderitemdetails", vpoDetailConditionExp,
                         new string[] { "gsc_modelcode", "gsc_optioncode", "gsc_modelyear", "gsc_productid" });

                Guid siteId = GetEntityReferenceId("gsc_iv_site",
                  GetEntityConditionExpression("gsc_sitepn", item.InTransitSite));

                Guid vehicleColorId = GetEntityReferenceId("gsc_iv_color",
                  GetEntityConditionExpression("gsc_colorcode", item.ReceivingDetails.ColorCode));

                Guid productId = vpoDetail.GetAttributeValue<EntityReference>("gsc_productid") != null
                    ? vpoDetail.GetAttributeValue<EntityReference>("gsc_productid").Id
                    : Guid.Empty;

                List<ConditionExpression> productColorConditionExp = new List<ConditionExpression>();
                productColorConditionExp.Add(new ConditionExpression("gsc_colorcode", ConditionOperator.Equal, item.ReceivingDetails.ColorCode));
                productColorConditionExp.Add(new ConditionExpression("gsc_productid", ConditionOperator.Equal, productId));

                Guid vehicleProductColorId = GetEntityReferenceId("gsc_cmn_vehiclecolor", productColorConditionExp);

                if (vpoId == Guid.Empty)
                {
                    _logger.Log(LogLevel.Error, "Unable to save row {0} Vehicle Purchase Order Number:[{1}] either does not exist in the DMS or receiving record is already created.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (siteId == Guid.Empty)
                {
                    _logger.Log(LogLevel.Error, "Unable to save row {0} In-Transit Site:[{1}] does not exist in the DMS.", counter, item.InTransitSite);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.InvoiceNumber))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}], Invoice Number cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.MMPCStatus))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] MMPC Status cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.InTransitReceiptDate))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] In-Transit Receipt Date cannot be empty or null and has to be in valid format.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfValidStringDateTime(item.InvoiceDate))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Invoice Date cannot be empty or null and has to be in valid format.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.ModelCode))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Model Code cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.OptionCode))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Option Code cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.ModelYear))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Model Year cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.ColorCode))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Color Code cannot be empty or null.", counter);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (vehicleColorId == Guid.Empty)
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}]. Color Code:[{2}]  does not exist in the DMS..", counter, item.VehiclePurchaseOrderNumber, item.ReceivingDetails.ColorCode);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!IsSameVehicleDetailsWithPO(item, vpoDetail, counter))
                {
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (vehicleProductColorId == Guid.Empty)
                {
                    _logger.Log(LogLevel.Error, @"Unable to save row:[{0}], vpo:[{1}]. Vehicle Id {2} with Color {3} does not exist in the DMS..",
                                        counter, item.VehiclePurchaseOrderNumber, productId, item.ReceivingDetails.ColorCode);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.EngineNumber))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Engine Number cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.CSNumber))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] CS Number cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.ProductionNumber))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] Production Number cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!CheckIfNullOrValidString(item.ReceivingDetails.VIN))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}] VIN cannot be empty or null.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                if (!ValidateInvoiceNo(item))
                {
                    _logger.Log(LogLevel.Error, "Unable to save row:[{0}], VPO:[{1}]. Invoice No. is already used in an exisitng vehicle receiving record.", counter, item.VehiclePurchaseOrderNumber);
                    counter++;
                    this.RecordsFailedUpload++;
                    continue;
                }

                rt.Attributes.Add("gsc_recordtype", new OptionSetValue(100000000));
                rt.Attributes.Add("gsc_purchaseorderid", new EntityReference("gsc_cmn_purchaseorder", vpoId));
                rt.Attributes.Add("gsc_intransitsiteid", new EntityReference("gsc_iv_site", siteId));
                DateTime pullOutDate;
                DateTime.TryParse(item.PullOutDate, out pullOutDate);  
                DateTime intransitReceiptDate;
                DateTime.TryParse(item.InTransitReceiptDate, out intransitReceiptDate);
                rt.Attributes.Add("gsc_intransitreceiptdate", intransitReceiptDate);
                rt.Attributes.Add("gsc_pulloutdate", pullOutDate);
                rt.Attributes.Add("gsc_invoiceno", item.InvoiceNumber);
                DateTime invoiceDate;
                DateTime.TryParse(item.InvoiceDate, out invoiceDate);
                rt.Attributes.Add("gsc_invoicedate", invoiceDate);
                rt.Attributes.Add("gsc_mmpcstatus", item.MMPCStatus);
                rt.Attributes.Add("gsc_branchid", new EntityReference("account", branchId));
                rt.Attributes.Add("gsc_dealerid", new EntityReference("account", dealerId));
                rt.Attributes.Add("gsc_recordownerid", vpo.GetAttributeValue<EntityReference>("gsc_recordownerid"));

                Guid rtId = _service.Create(rt);

                _logger.Log(LogLevel.Info, @"Row {0} with Vehicle Purchase Number {1} was successfully created in Receiving Transaction with record id {2}",
                    counter,
                    item.VehiclePurchaseOrderNumber,
                    rtId);

                Entity rtDetails = new Entity("gsc_cmn_receivingtransactiondetail");

                rtDetails = GetEntityRecord("gsc_cmn_receivingtransactiondetail",
                    GetEntityConditionExpression("gsc_receivingtransactionid", rtId),
                    new string[] { "gsc_receivingtransactionid" });

                rtDetails.Attributes.Add("gsc_modelcode", item.ReceivingDetails.ModelCode);
                rtDetails.Attributes.Add("gsc_optioncode", item.ReceivingDetails.OptionCode);
                rtDetails.Attributes.Add("gsc_modelyear", item.ReceivingDetails.ModelYear);
                rtDetails.Attributes.Add("gsc_colorcode", item.ReceivingDetails.ColorCode);
                rtDetails.Attributes.Add("gsc_engineno", item.ReceivingDetails.EngineNumber);
                rtDetails.Attributes.Add("gsc_csno", item.ReceivingDetails.CSNumber);
                rtDetails.Attributes.Add("gsc_productionno", item.ReceivingDetails.ProductionNumber);
                rtDetails.Attributes.Add("gsc_vin", item.ReceivingDetails.VIN);

                _service.Update(rtDetails);

                _logger.Log(LogLevel.Info, @"Row {0} with Vehicle Purchase Number {1} successfully created a record in Receiving Transaction Detail with Id {2}",
                    counter, item.VehiclePurchaseOrderNumber, rtDetails.Id);
                counter++;
                this.RecordsUploaded++;
            }
        }

        private ConditionExpression GetEntityConditionExpression(string attribute, object value)
        {
            return new ConditionExpression(attribute, ConditionOperator.Equal, value);
        }

        private bool CheckIfValidStringDateTime(string date)
        {
            DateTime dateValue;
            return DateTime.TryParse(date, out dateValue);
        }


        private bool CheckIfNullOrValidString(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || string.IsNullOrEmpty(value)) return false;
            return true;
        }

        private Guid GetEntityReferenceId(string entityName, ConditionExpression condition)
        {
            QueryExpression query = new QueryExpression(entityName);
            query.ColumnSet.AddColumn(condition.AttributeName);
            query.ColumnSet.AddColumn(entityName + "id");
            query.Criteria.AddCondition(condition);

            EntityCollection collection = _service.RetrieveMultiple(query);

            if (collection.Entities.Count > 0)
            {
                return collection[0].Id;
            }

            return Guid.Empty;
        }

        private Guid GetEntityReferenceId(string entityName, List<ConditionExpression> conditions)
        {
            QueryExpression query = new QueryExpression(entityName);

            foreach (ConditionExpression item in conditions)
            {
                query.ColumnSet.AddColumn(item.AttributeName);
            }

            FilterExpression filter = new FilterExpression();
            filter.FilterOperator = LogicalOperator.And;
            filter.Conditions.AddRange(conditions);

            query.Criteria.Filters.Add(filter);
            query.ColumnSet.AddColumn(entityName + "id");

            EntityCollection collection = _service.RetrieveMultiple(query);

            if (collection.Entities.Count > 0)
            {
                return collection[0].Id;
            }

            return Guid.Empty;
        }

        private Entity GetEntityRecord(string entityName, ConditionExpression condition, string[] columns)
        {
            QueryExpression query = new QueryExpression(entityName);
            query.ColumnSet.AddColumns(columns);
            query.Criteria.AddCondition(condition);

            EntityCollection collection = _service.RetrieveMultiple(query);

            if (collection.Entities.Count > 0)
            {
                return collection.Entities[0];
            }

            return new Entity(entityName);
        }

        private Entity GetEntityRecord(string entityName, List<ConditionExpression> conditions, string[] columns)
        {
            QueryExpression query = new QueryExpression(entityName);
            query.ColumnSet.AddColumns(columns);
            FilterExpression filter = new FilterExpression();
            filter.FilterOperator = LogicalOperator.And;
            filter.Conditions.AddRange(conditions);

            query.Criteria.Filters.Add(filter);

            EntityCollection collection = _service.RetrieveMultiple(query);

            if (collection.Entities.Count > 0)
            {
                return collection.Entities[0];
            }

            return new Entity();
        }

        private bool IsRowEmpty(ReceivingTransaction row)
        {
            return row.GetType().GetProperties().Where(pi => pi.GetValue(row) is string)
                    .Select(pi => (string)pi.GetValue(row)).Any(value => String.IsNullOrEmpty(value));
        }

        private bool IsSameVehicleDetailsWithPO(ReceivingTransaction item, Entity vpoDetail, int counter)
        {
            var modelCode = item.ReceivingDetails.ModelCode;
            var optionCode = item.ReceivingDetails.OptionCode;
            var modelYear = item.ReceivingDetails.ModelYear;

            var poModelCode = vpoDetail.Contains("gsc_modelcode")
                ? vpoDetail.GetAttributeValue<String>("gsc_modelcode")
                : String.Empty;
            var poOptionCode = vpoDetail.Contains("gsc_optioncode")
                ? vpoDetail.GetAttributeValue<String>("gsc_optioncode")
                : String.Empty;
            var poModelYear = vpoDetail.Contains("gsc_modelyear")
                ? vpoDetail.GetAttributeValue<String>("gsc_modelyear")
                : String.Empty;

            if (modelCode != poModelCode)
            {
                _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}]. Model Code provided in template must match Model Code of Purchase Order record.", counter, item.VehiclePurchaseOrderNumber);
                return false;
            }

            if (optionCode != poOptionCode)
            {
                _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}]. Option Code provided in template must match Model Code of Purchase Order record.", counter, item.VehiclePurchaseOrderNumber);
                return false;
            }

            if (modelYear != poModelYear)
            {
                _logger.Log(LogLevel.Error, "Unable to save row:[{0}], vpo:[{1}]. Model Year provided in template must match Model Code of Purchase Order record.", counter, item.VehiclePurchaseOrderNumber);
                return false;
            }
            else
            {
                return true;
            }
        }
        private bool ValidateInvoiceNo(ReceivingTransaction item)
        {
            var invoiceNo = item.InvoiceNumber;

            if (invoiceNo != String.Empty && invoiceNo != null)
            {
                QueryExpression query = new QueryExpression("gsc_cmn_receivingtransaction");
                query.ColumnSet.AddColumns("gsc_invoiceno");
                query.Criteria.AddCondition(new ConditionExpression("gsc_invoiceno", ConditionOperator.Equal, invoiceNo));
                query.Criteria.AddCondition(new ConditionExpression("gsc_status", ConditionOperator.Equal, 100000000));

                EntityCollection collection = _service.RetrieveMultiple(query);

                if (collection.Entities.Count > 0)
                {
                    return false;
                }
            }

            return true;
        }

    }
}
