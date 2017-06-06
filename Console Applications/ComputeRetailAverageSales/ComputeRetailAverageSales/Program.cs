using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.ServiceModel.Description;
using System.Text;
using System.Threading.Tasks;

namespace ComputeRetailAverageSales
{
    static class Program
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

                QueryExpression orderPlanningQuery = new QueryExpression("gsc_sls_orderplanning");
                orderPlanningQuery.ColumnSet.AddColumns("gsc_orderplanningpn", "gsc_retailperiodcoverage", "gsc_productid", "gsc_siteid", "gsc_branchid", "gsc_dealerid");

                EntityCollection orderPlanningRecords = service.RetrieveMultiple(orderPlanningQuery);

                if (orderPlanningRecords != null && orderPlanningRecords.Entities.Count > 0)
                {
                    List<string> errorList = new List<string>();

                    foreach (Entity orderPlanning in orderPlanningRecords.Entities)
                    {
                        Console.WriteLine("Retrieve Order Planning Records");

                        QueryExpression orderPlanningDetailQuery = new QueryExpression("gsc_sls_orderplanningdetail");
                        orderPlanningDetailQuery.ColumnSet.AddColumns("gsc_retailaveragesales");
                        orderPlanningDetailQuery.Criteria.AddCondition("gsc_orderplanningid", ConditionOperator.Equal, orderPlanning.Id);
                        orderPlanningDetailQuery.Criteria.AddCondition("gsc_year", ConditionOperator.Equal, DateTime.Now.Year.ToString());
                        orderPlanningDetailQuery.Criteria.AddCondition("gsc_month", ConditionOperator.Equal, DateTime.Now.Month.ToString("d2"));

                        EntityCollection orderPlanningDetailRecords = service.RetrieveMultiple(orderPlanningDetailQuery);

                        if (orderPlanningDetailRecords != null && orderPlanningDetailRecords.Entities.Count > 0)
                        {
                            Entity orderPlanningDetail = orderPlanningDetailRecords.Entities[0];

                            orderPlanningDetail["gsc_retailaveragesales"] = ComputeRetailAverageSales(orderPlanning);

                            service.Update(orderPlanningDetail);

                            Console.WriteLine("Retail Average Sales Updated");
                        }
                        else
                        {
                            errorList.Add(String.Concat("Order Planning Id - " + orderPlanning.Id + ". Name - "+ orderPlanning.GetAttributeValue<string>("gsc_orderplanningpn") +".",
                                Environment.NewLine, " No Order Planning Detail created for this month of " + DateTime.Now.ToString("MMM") +"."));
                        }
                    }

                    CreateErrorList(errorList);
                }
            }
            catch (Exception ex)
            {
                Authenticate();
                service = (IOrganizationService)serviceProxy;
                string filename = "RetailAverageSalesComputation";
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

        public static Double ComputeRetailAverageSales(Entity orderPlanning)
        {
            Console.WriteLine("Compute Retail Average Sales");

            var average = 0.0;

            var coverage = orderPlanning.Contains("gsc_retailperiodcoverage")
                ? orderPlanning.FormattedValues["gsc_retailperiodcoverage"]
                : null;

            if (coverage != null)
            {
                var totalNetSales = ComputeTotalNetSales(orderPlanning);
                average = Convert.ToDouble(totalNetSales) / Convert.ToDouble(coverage);

                Console.WriteLine("Retail Average Sales: " + average);
            }

            return average;
        }

        public static Int32 ComputeTotalNetSales(Entity orderPlanning)
        {
            Console.WriteLine("Compute Total Net Sales");

            var totalNetSales = 0;

            var dealerId = orderPlanning.GetAttributeValue<EntityReference>("gsc_dealerid") != null
                ? orderPlanning.GetAttributeValue<EntityReference>("gsc_dealerid").Id
                : Guid.Empty;
            var branchId = orderPlanning.GetAttributeValue<EntityReference>("gsc_branchid") != null
                ? orderPlanning.GetAttributeValue<EntityReference>("gsc_branchid").Id
                : Guid.Empty;
            var productId = orderPlanning.GetAttributeValue<EntityReference>("gsc_productid") != null
                ? orderPlanning.GetAttributeValue<EntityReference>("gsc_productid").Id
                : Guid.Empty;

            QueryExpression invoiceQuery = new QueryExpression("invoice");
            invoiceQuery.ColumnSet.AddColumns("invoiceid");
            invoiceQuery.Criteria.AddCondition("gsc_dealerid", ConditionOperator.Equal, dealerId);
            invoiceQuery.Criteria.AddCondition("gsc_branchsiteid", ConditionOperator.Equal, branchId);
            invoiceQuery.Criteria.AddCondition("gsc_productid", ConditionOperator.Equal, productId);
            invoiceQuery.Criteria.AddCondition("gsc_salesinvoicestatus", ConditionOperator.Equal, 100000004);

            EntityCollection invoiceRecords = service.RetrieveMultiple(invoiceQuery);

            var postedVSR = 0;
            var postedVSI = invoiceRecords != null ? invoiceRecords.Entities.Count : 0;
            Console.WriteLine("Posted VSI: " + postedVSI);

            if (invoiceRecords != null && invoiceRecords.Entities.Count > 0)
            {
                foreach (var invoice in invoiceRecords.Entities)
                {
                    QueryExpression returnQuery = new QueryExpression("gsc_sls_vehiclesalesreturn");
                    returnQuery.ColumnSet.AddColumns("gsc_sls_vehiclesalesreturnid");
                    returnQuery.Criteria.AddCondition("gsc_dealerid", ConditionOperator.Equal, dealerId);
                    returnQuery.Criteria.AddCondition("gsc_branchsiteid", ConditionOperator.Equal, branchId);
                    returnQuery.Criteria.AddCondition("gsc_invoiceid", ConditionOperator.Equal, invoice.Id);
                    returnQuery.Criteria.AddCondition("gsc_vehiclesalesreturnstatus", ConditionOperator.Equal, 100000001);

                    EntityCollection returnRecords = service.RetrieveMultiple(returnQuery);

                    postedVSR += returnRecords != null ? returnRecords.Entities.Count : 0;
                }
            }

            Console.WriteLine("Posted VSR: " + postedVSR);

            totalNetSales = postedVSI - postedVSR;

            Console.WriteLine("Total Net Sales: " + totalNetSales);

            return totalNetSales;
        }

        public static void CreateErrorList(List<string> errorList)
        {
            Console.WriteLine(errorList.Count);
            if (errorList != null && errorList.Count > 0)
            {
                Authenticate();
                service = (IOrganizationService)serviceProxy;
                string filename = "RetailAverageSalesComputation";
                string datetime = DateTime.Now.ToShortDateString().ToString() + " " + DateTime.Now.ToLongTimeString().ToString() + " ==> ";
                filename += DateTime.Now.ToString("MMddyyyy");
                using (StreamWriter file = new StreamWriter(@"C:\temp\LOGS\" + filename + ".txt", true))
                {
                    foreach (var error in errorList)
                    {
                        file.WriteLine(datetime + ": " + error);
                    }
                }
            }
        }
    }
}
