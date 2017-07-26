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
        public string VehiclePurchaseOrderNumber { get; set; }    
        public string InTransitSite { get; set; }
        public string InTransitReceiptDate { get; set; }
        public string PullOutDate { get; set; }
        public string InvoiceNumber { get; set; }
        public string InvoiceDate { get; set; }
        public string MMPCStatus { get; set; }

        public ReceivingTransactionDetails ReceivingDetails { get; set; }
      
    }

    public class ReceivingTransactionDetails
    {
        public string ModelCode { get; set; }
        public string OptionCode { get; set; }
        public string ModelYear { get; set; }
        public string ColorCode { get; set; }
        public string EngineNumber { get; set; }
        public string CSNumber { get; set; }
        public string ProductionNumber { get; set; }
        public string VIN { get; set; }
    }
}
