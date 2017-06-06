using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;

namespace EntityUpdateUtility
{
    class Program
    {
        static void Main(string[] args)
        {
            ServiceContext _serviceCreator = new CrmOrganizationService(Configuration.GetConnectionStringFromConfig());
 
            try
            {
                RetrieveVendor retrieveVendor = new RetrieveVendor(_serviceCreator);
                var VendorEntities = retrieveVendor.RetrieveVendorEntities();

                EntityUpdater updater = new EntityUpdater(_serviceCreator, VendorEntities);
                updater.UpdateEntities();
                //Console.ReadLine();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Console.ReadLine();
            }
        }
    }
}
