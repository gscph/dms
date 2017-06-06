using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ServiceModel.Description;
using System.Configuration;
using System.IO;

using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;

namespace PurchaseOrderAgeCounter
{
    class Program
    {
        public static Uri orgUri = new Uri(ConfigurationSettings.AppSettings["OrgUri"].ToString());
        public static Uri homeUri = null;
        public static ClientCredentials credential = new ClientCredentials();
        public static OrganizationServiceProxy serviceProxy;
        public static IOrganizationService service;

        public static void Authenticate()
        {
            credential.UserName.UserName = @"" + ConfigurationSettings.AppSettings["username"].ToString();
            credential.UserName.Password = ConfigurationSettings.AppSettings["password"].ToString();

            IServiceConfiguration<IOrganizationService> config = ServiceConfigurationFactory.CreateConfiguration<IOrganizationService>(orgUri);

            using (serviceProxy = new OrganizationServiceProxy(config, credential))
            {
                serviceProxy.ServiceConfiguration.CurrentServiceEndpoint.Behaviors.Add(new ProxyTypesBehavior());
                service = (IOrganizationService)serviceProxy;
            }

        }

        static void Main(string[] args)
        {
            try
            {
                Authenticate();
                Console.WriteLine("Authenticated");
                service = (IOrganizationService)serviceProxy;

                String dateToday = DateTime.UtcNow.ToShortDateString();

                QueryExpression purchaseOrderQuery = new QueryExpression("gsc_cmn_purchaseorder");
                purchaseOrderQuery.ColumnSet.AddColumns("gsc_cmn_purchaseorderid", "gsc_mmpcreceiptdate");
                purchaseOrderQuery.Criteria.AddCondition("gsc_mmpcreceiptdate", ConditionOperator.NotNull);
                EntityCollection purchaseOrderRecords = service.RetrieveMultiple(purchaseOrderQuery);

                Console.WriteLine("Retrieved {0} purchase order records", purchaseOrderRecords.Entities.Count);

                if (purchaseOrderRecords != null && purchaseOrderRecords.Entities.Count > 0)
                {
                    foreach (Entity purchaseOrder in purchaseOrderRecords.Entities)
                    {
                        DateTime receiptDate = purchaseOrder.GetAttributeValue<DateTime>("gsc_mmpcreceiptdate");
                        Console.WriteLine("Receipt Date: " + receiptDate);
                        QueryExpression purchaseOrderDetailQuery = new QueryExpression("gsc_cmn_purchaseorderitemdetails");
                        purchaseOrderDetailQuery.ColumnSet.AddColumn("gsc_poage");
                        purchaseOrderDetailQuery.Criteria.AddCondition("gsc_purchaseorderid", ConditionOperator.Equal, purchaseOrder.Id);
                        EntityCollection purchaseOrderDetailRecords = service.RetrieveMultiple(purchaseOrderDetailQuery);

                        if (purchaseOrderDetailRecords != null && purchaseOrderDetailRecords.Entities.Count > 0)
                        {
                            foreach (Entity purchaseOrderDetail in purchaseOrderDetailRecords.Entities)
                            {
                                Int32 poAge = (Int32)Math.Floor((DateTime.UtcNow - receiptDate).TotalDays);
                                purchaseOrderDetail["gsc_poage"] = String.Concat(poAge);
                                service.Update(purchaseOrderDetail);
                            }
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                Authenticate();
                service = (IOrganizationService)serviceProxy;
                string filename = "PurchaseOrderAgeCounter";
                string datetime = DateTime.Now.ToShortDateString().ToString() + " " + DateTime.Now.ToLongTimeString().ToString() + " ==> ";
                filename += DateTime.Now.ToString("MMddyyyy");
                using (StreamWriter file = new StreamWriter(@"C:\temp\LOGS\" + filename + ".txt", true))
                {
                    file.WriteLine(datetime + ": " + ex.Message);
                    file.WriteLine(datetime + ": " + ex.StackTrace);
                }
                Console.WriteLine("Error");
            }
        }
    }
}
