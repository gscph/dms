using Microsoft.Xrm.Sdk.Query;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImportIntegration
{
    public class ReceivingTransaction
    {
        public ReceivingTransaction() 
        {
            this.ReceivingDetails = new ReceivingTransactionDetails();
        }

        private string _vehiclePurchaseOrderNumber;

        public string VehiclePurchaseOrderNumber
        {
            get { return _vehiclePurchaseOrderNumber; }
            set { _vehiclePurchaseOrderNumber = value.Trim(); }
        }

        private string _inTransitSite;

        public string InTransitSite
        {
            get { return _inTransitSite; }
            set { _inTransitSite = value.Trim(); }
        }

        private string _inTransitReceiptDate;

        public string InTransitReceiptDate
        {
            get { return _inTransitReceiptDate; }
            set { _inTransitReceiptDate = value.Trim(); }
        }

        private string _pullOutDate;

        public string PullOutDate
        {
            get { return _pullOutDate; }
            set { _pullOutDate = value.Trim(); }
        }

        private string _invoiceNumber;

        public string InvoiceNumber
        {
            get { return _invoiceNumber; }
            set { _invoiceNumber = value.Trim(); }
        }

        private string _invoiceDate;

        public string InvoiceDate
        {
            get { return _invoiceDate; }
            set { _invoiceDate = value.Trim(); }
        }


        private string _MMPCStatus;

        public string MMPCStatus
        {
            get { return _MMPCStatus; }
            set { _MMPCStatus = value.Trim(); }
        }          

        public ReceivingTransactionDetails ReceivingDetails { get; set; }
      
    }



    public class ReceivingTransactionDetails
    {
        private string _modelCode;

        public string ModelCode
        {
            get { return _modelCode; }
            set { _modelCode = value.Trim(); }

        }
        private string _optionCode;
        public string OptionCode
        {
            get { return _optionCode; }
            set { _optionCode = value.Trim(); }
        }
        private string _modelYear;
        public string ModelYear
        {
            get { return _modelYear; }
            set { _modelYear = value.Trim(); }
        }
        private string _colorCode;
        public string ColorCode
        {
            get { return _colorCode; }
            set { _colorCode = value.Trim(); }
        }
        private string _engineNumber;
        public string EngineNumber
        {
            get { return _engineNumber; }
            set { _engineNumber = value.Trim(); }
        }
        private string _CSNumber;
        public string CSNumber
        {
            get { return _CSNumber; }
            set { _CSNumber = value.Trim(); }
        }
        private string _productionNumber;
        public string ProductionNumber
        {
            get { return _productionNumber; }
            set { _productionNumber = value.Trim(); }
        }
        private string _VIN;
        public string VIN
        {
            get { return _VIN; }
            set { _VIN = value.Trim(); }
        }        
    }
}
