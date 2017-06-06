using Microsoft.Xrm.Client;
using Microsoft.Xrm.Client.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EntityUpdateUtility
{
    abstract class ServiceContext : IServiceContext
    {
        private string _connectionString;
        public ServiceContext(string connectionString)
        {
            _connectionString = connectionString;
        }

        public virtual OrganizationService CreateServiceContext()
        {
            return new OrganizationService(CrmConnection.Parse(this._connectionString));
        }
    }

    class CrmOrganizationService : ServiceContext
    {
        private string _connectionString;
        public CrmOrganizationService(string connectionString)
            : base(connectionString)
        {
            _connectionString = connectionString;
        }
    }

    static class Configuration
    {
        public static string GetConnectionStringFromConfig()
        {            
            return ConfigurationManager.AppSettings["Xrm"];
        }
    }

    interface IServiceContext
    {
        OrganizationService CreateServiceContext();
    }
}
