using NLog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImportIntegration
{
    class ConfigurationReader
    {
        public string ConnectionString { get; private set; }

        private static Logger _logger;

        public ConfigurationReader() { }

        public ConfigurationReader(string connectionString, Logger logger)
        {
            _logger = logger;

            if (ConfigurationManager.ConnectionStrings[connectionString] != null)
            {
                _logger.Log(LogLevel.Info, "Trying to connect to DMS Dynamics CRM.");
                this.ConnectionString = ConfigurationManager.ConnectionStrings[connectionString].ConnectionString;                
            }
        }       
    }
}
