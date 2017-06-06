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

namespace ComputeEndingInventory
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

                var dateToday = DateTime.Now;
                var year = dateToday.Year;
                var month = dateToday.Month;
                var lastDayLastMonth = DateTime.DaysInMonth(year, month);

                Console.WriteLine(dateToday);

                QueryExpression orderPlanningQuery = new QueryExpression("gsc_sls_orderplanning");
                orderPlanningQuery.ColumnSet.AddColumns("gsc_orderplanningpn");

                EntityCollection orderPlanningRecords = service.RetrieveMultiple(orderPlanningQuery);

                if (orderPlanningRecords != null && orderPlanningRecords.Entities.Count > 0)
                {
                    foreach (Entity orderPlanning in orderPlanningRecords.Entities)
                    {
                        Console.WriteLine("Retrieve Order Planning Records");

                        QueryExpression orderPlanningDetailQuery = new QueryExpression("gsc_sls_orderplanningdetail");
                        orderPlanningDetailQuery.ColumnSet.AddColumns("gsc_beginninginventory", "gsc_cfoallocation", "gsc_retailaveragesales", "gsc_endinginventory");
                        orderPlanningDetailQuery.Criteria.AddCondition("gsc_orderplanningid", ConditionOperator.Equal, orderPlanning.Id);
                        orderPlanningDetailQuery.Orders.Add(new OrderExpression("createdon", OrderType.Descending));

                        EntityCollection orderPlanningDetailRecords = service.RetrieveMultiple(orderPlanningDetailQuery);

                        if (orderPlanningDetailRecords != null && orderPlanningDetailRecords.Entities.Count > 0)
                        {
                            Entity orderPlanningDetail = orderPlanningDetailRecords.Entities[0];

                            var beginning = orderPlanningDetail.Contains("gsc_beginninginventory")
                                ? orderPlanningDetail.GetAttributeValue<Double>("gsc_beginninginventory")
                                : 0.0;
                            var cfo = orderPlanningDetail.Contains("gsc_cfoallocation")
                                ? orderPlanningDetail.GetAttributeValue<Int32>("gsc_cfoallocation")
                                : 0.0;
                            var average = orderPlanningDetail.Contains("gsc_retailaveragesales")
                                ? orderPlanningDetail.GetAttributeValue<Double>("gsc_retailaveragesales")
                                : 0.0; 

                            var ending = (beginning + cfo) - average;

                            orderPlanningDetail["gsc_endinginventory"] = ending;

                            service.Update(orderPlanningDetail);

                            Console.WriteLine(cfo);
                            Console.WriteLine(ending);
                            Console.WriteLine("Ending Inventory Updated");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Authenticate();
                service = (IOrganizationService)serviceProxy;
                string filename = "ComputeEndingInventory";
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
