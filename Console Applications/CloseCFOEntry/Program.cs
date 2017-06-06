using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.ServiceModel.Description;
using System.Text;
using System.Threading.Tasks;

namespace CloseCFOEntry
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

                var dateToday = DateTime.Now;
                var year = dateToday.Year.ToString();
                var month = dateToday.Month.ToString("D2");

                var monthOptionSetValue = GetOptionSetValue(service, "gsc_sls_committedfirmorderquantity", "gsc_cfomonth", month);
                var yearOptionSetValue = GetOptionSetValue(service, "gsc_sls_committedfirmorderquantity", "gsc_year", year);

                QueryExpression cfoQuery = new QueryExpression("gsc_sls_committedfirmorderquantity");
                cfoQuery.ColumnSet.AddColumns("gsc_cfomonth", "gsc_year", "gsc_cfostatus");
                cfoQuery.Criteria.AddCondition("gsc_cfomonth", ConditionOperator.Equal, monthOptionSetValue);
                cfoQuery.Criteria.AddCondition("gsc_year", ConditionOperator.Equal, yearOptionSetValue);
                cfoQuery.Orders.Add(new OrderExpression("createdon", OrderType.Descending));

                EntityCollection cfoRecords = service.RetrieveMultiple(cfoQuery);

                if (cfoRecords != null && cfoRecords.Entities.Count > 0)
                {
                    foreach (Entity cfoEntity in cfoRecords.Entities)
                    {
                        if (cfoEntity.FormattedValues["gsc_cfomonth"] == month && cfoEntity.FormattedValues["gsc_year"] == year)
                        {
                            cfoEntity["gsc_cfostatus"] = new OptionSetValue(100000003);

                            service.Update(cfoEntity);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                Authenticate();
                service = (IOrganizationService)serviceProxy;
                string filename = "CloseCFOEntry";
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

        public static int GetOptionSetValue(IOrganizationService service, string entityName, string attributeName, string selectedLabel)
        {

            RetrieveAttributeRequest retrieveAttributeRequest = new
            RetrieveAttributeRequest
            {
                EntityLogicalName = entityName,
                LogicalName = attributeName,
                RetrieveAsIfPublished = true
            };
            // Execute the request.
            RetrieveAttributeResponse retrieveAttributeResponse = (RetrieveAttributeResponse)service.Execute(retrieveAttributeRequest);
            // Access the retrieved attribute.
            Microsoft.Xrm.Sdk.Metadata.PicklistAttributeMetadata retrievedPicklistAttributeMetadata = (Microsoft.Xrm.Sdk.Metadata.PicklistAttributeMetadata)
            retrieveAttributeResponse.AttributeMetadata;// Get the current options list for the retrieved attribute.
            OptionMetadata[] optionList = retrievedPicklistAttributeMetadata.OptionSet.Options.ToArray();
            int selectedOptionValue = 0;
            foreach (OptionMetadata oMD in optionList)
            {
                if (oMD.Label.LocalizedLabels[0].Label.ToString().ToLower() == selectedLabel.ToLower())
                {
                    selectedOptionValue = oMD.Value.Value;
                    break;
                }
            }
            return selectedOptionValue;
        }

    }
}
