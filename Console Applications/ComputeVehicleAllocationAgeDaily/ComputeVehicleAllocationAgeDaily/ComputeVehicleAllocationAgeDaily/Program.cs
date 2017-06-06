using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using System.Configuration;
using Microsoft.Xrm.Sdk.Client;
using System.ServiceModel.Description;
using Microsoft.Xrm.Sdk.Query;
using System.IO;

namespace ComputeVehicleAllocationAgeDaily
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

        //Update Allocation Age field of allocated vehicle until invoice becomes released or cancelled
        static void Main(string[] args)
        {
            try
            {
                Authenticate();
                Console.WriteLine("Authenticated...");
                service = (IOrganizationService)serviceProxy;

                QueryExpression allocatedVehiclequery = new QueryExpression("gsc_iv_allocatedvehicle");
                allocatedVehiclequery.ColumnSet.AddColumns("gsc_vehicleallocationage", "gsc_vehicleallocateddate", "gsc_orderid", "gsc_allocatedvehiclepn");
                allocatedVehiclequery.Criteria.AddCondition("gsc_orderid", ConditionOperator.NotNull);
                
                //Retrieve Allocated Vehicles with associated order
                EntityCollection allocatedVehicleCollection = service.RetrieveMultiple(allocatedVehiclequery);

                Console.WriteLine("Allocated Vehicle Records Retrieved: " + allocatedVehicleCollection.Entities.Count);

                foreach (Entity allocatedVehicle in allocatedVehicleCollection.Entities)
                {
                    var orderId = allocatedVehicle.Contains("gsc_orderid") ? allocatedVehicle.GetAttributeValue<EntityReference>("gsc_orderid").Id
                        : Guid.Empty;

                    QueryExpression invoiceQuery = new QueryExpression("invoice");
                    //Status not equal to Released or Cancelled
                    invoiceQuery.Criteria.AddCondition("gsc_salesinvoicestatus", ConditionOperator.NotIn, 100000004, 100000005);
                    invoiceQuery.Criteria.AddCondition("salesorderid", ConditionOperator.Equal, orderId);

                    //Retrieve invoice with status not Release or Cancelled and orderid == to that of allocated vehicle
                    EntityCollection invoiceCollection = service.RetrieveMultiple(invoiceQuery);

                    Console.WriteLine("Invoice Records Retrieved: " + invoiceCollection.Entities.Count);
                    if (invoiceCollection.Entities.Count > 0)
                    {
                        Console.WriteLine(allocatedVehicle.GetAttributeValue<string>("gsc_allocatedvehiclepn"));
                        DateTime allocatedDate = allocatedVehicle.Contains("gsc_vehicleallocateddate") ? allocatedVehicle.GetAttributeValue<DateTime>("gsc_vehicleallocateddate")
                            : DateTime.UtcNow;

                        int allocationAge = (int)Math.Floor((DateTime.UtcNow - allocatedDate).TotalDays);
                        allocatedVehicle["gsc_vehicleallocationage"] = allocationAge;

                        service.Update(allocatedVehicle);
                        Console.WriteLine("Allocation Age updated to " + allocationAge);
                    }
                        else
                        Console.WriteLine("No Invoice Records Retrieved...");

                }
            }
            catch (Exception ex)
            {
                string filename = "ComputeVehicleAllocationAgeDaily";
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
