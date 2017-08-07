using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;
using System.IO;
using System.Xml;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using System.Configuration;
using NLog;
using System.Runtime.InteropServices;
using Microsoft.Xrm.Client.Services;
using Microsoft.Xrm.Client;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Text.RegularExpressions;
using System.Data;

namespace ImportIntegration
{
    class Program
    {
        private static Logger logger = LogManager.GetCurrentClassLogger();
        static void Main(string[] args)
        {
            logger.Log(LogLevel.Info, "******** Import Integration Tool ********");
            logger.Log(LogLevel.Info, "******** Started : {0} ********", DateTime.Now.ToString("yyyyMMdd hh:mm tt"));

            ConfigurationReader reader = new ConfigurationReader("Xrm", logger);

            IOrganizationService service = new OrganizationService(CrmConnection.Parse(reader.ConnectionString));

            logger.Log(LogLevel.Info, "Successfully connected to DMS Dynamics CRM!");

            logger.Log(LogLevel.Info, "Checking configuration for file name..");

            if (ConfigurationManager.AppSettings["FileName"] == null)
            {
                logger.Log(LogLevel.Error, "File Name key does not exist in the configuration file.");
                Environment.Exit(0);
            }

            string fileName = ConfigurationManager.AppSettings["FileName"].ToString();
            string currentPath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            string excelPath = currentPath + "\\" + fileName;
            logger.Log(LogLevel.Info, "Trying to open {0}..", fileName);

            if (!System.IO.File.Exists(excelPath))
            {
                logger.Log(LogLevel.Info, "There are no more files to be processed.. Exiting Application", excelPath);
                Environment.Exit(0);
            }

            try
            {
                DataReader _reader = new DataReader(excelPath);
                ServiceProvider _provider = new ServiceProvider(service, logger);
                logger.Log(LogLevel.Info, "Starting to read the data..");
                List<ReceivingTransaction> rtList = _reader.Read();               
                _provider.MassUploadReceiving(rtList);
                EmailSender emailSender = new EmailSender(service);
                logger.Log(LogLevel.Info, "Trying to send email..");
                emailSender.Send(_provider.RecordsUploaded, _provider.RecordsFailedUpload);
                logger.Log(LogLevel.Info, "Import request has been processed. There were {0} record(s) uploaded to the DMS Application", _provider.RecordsUploaded);
            }
            catch (Exception ex)
            {
                logger.Log(LogLevel.Error, "An unexpected error occured during the execution of import: Message : \"{0}\" ", ex.Message);
                logger.Log(LogLevel.Fatal, " Message:{0} Stack Trace: {1}", ex.Message, ex.StackTrace);
            }
            finally
            {
                if (System.IO.File.Exists(excelPath))
                {
                    System.IO.File.Copy(excelPath, currentPath + "\\history\\Vehicle Receiving " + DateTime.Now.ToString("yyyy-MM-dd hh-mm-tt") + ".xlsx");
                    System.IO.File.Delete(excelPath);
                    logger.Log(LogLevel.Info, "Import file {0} has been deleted in the directory", excelPath);
                }
                Environment.Exit(0);
            }
        }


    }

}
