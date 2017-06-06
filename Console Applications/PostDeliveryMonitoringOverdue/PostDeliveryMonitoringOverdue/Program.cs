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

namespace PostDeliveryMonitoringOverdue
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

                String dateToday = DateTime.UtcNow.ToShortDateString();
                String dateTomorrow = DateTime.UtcNow.AddDays(1).ToShortDateString();

                QueryExpression vehiclePostDeliveryMonitoringQuery = new QueryExpression("gsc_sls_vehiclepostdeliverymonitoring");
                vehiclePostDeliveryMonitoringQuery.ColumnSet.AddColumns("gsc_postdeliverystatus", "gsc_expectedcalldate");
                vehiclePostDeliveryMonitoringQuery.Criteria.AddCondition("gsc_postdeliverystatus", ConditionOperator.Equal, 100000000);
                vehiclePostDeliveryMonitoringQuery.Criteria.AddCondition("gsc_expectedcalldate", ConditionOperator.GreaterEqual, dateToday);
                vehiclePostDeliveryMonitoringQuery.Criteria.AddCondition("gsc_expectedcalldate", ConditionOperator.LessEqual, dateTomorrow);
                EntityCollection vehiclePostDeliveryMonitoringRecords = service.RetrieveMultiple(vehiclePostDeliveryMonitoringQuery);

                if (vehiclePostDeliveryMonitoringRecords != null && vehiclePostDeliveryMonitoringRecords.Entities.Count > 0)
                {
                    foreach (Entity vehiclePostDeliveryMonitoring in vehiclePostDeliveryMonitoringRecords.Entities)
                    {
                        vehiclePostDeliveryMonitoring["gsc_postdeliverystatus"] = new OptionSetValue(100000002);
                        service.Update(vehiclePostDeliveryMonitoring);
                    }
                    Console.WriteLine(vehiclePostDeliveryMonitoringRecords.Entities.Count + " Vehicle Post-Delivery Monitoring records have been updated.");
                }
            }
            catch (Exception ex)
            {
                Authenticate();
                service = (IOrganizationService)serviceProxy;
                string filename = "PostDeliveryMonitoringOverdue";
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
