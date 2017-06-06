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

namespace ResetIdSequenceYearly
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

                QueryExpression query = new QueryExpression("gsc_cmn_idsequence");
                query.ColumnSet.AddColumns("gsc_sequencenumber", "gsc_lastresetdate");
                query.Criteria.AddCondition("gsc_resetsequenceno", ConditionOperator.Equal, "100000003");

                EntityCollection sequenceRecords = service.RetrieveMultiple(query);

                if (sequenceRecords != null && sequenceRecords.Entities.Count > 0)
                {
                    Console.WriteLine("Retrieve ID Sequence Record(s).");

                    var sequenceEntity = sequenceRecords.Entities[0];

                    sequenceEntity["gsc_sequencenumber"] = 0;
                    sequenceEntity["gsc_lastresetdate"] = DateTime.Now;

                    service.Update(sequenceEntity);

                    Console.WriteLine("Sequence Number has been reset.");
                }
                else
                {
                    Console.WriteLine("No ID Sequence Retrieved.");
                }
            }
            catch (Exception ex)
            {
                string filename = "ResetIdSequenceYearly";
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
