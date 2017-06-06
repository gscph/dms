using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using System.Configuration;
using Microsoft.Xrm.Sdk.Client;
using System.ServiceModel.Description;
using System.IO;
using Microsoft.Xrm.Sdk.Query;
using System.Xml;
using GSC.Rover.DMS.BusinessLogic.Common;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Crm.Sdk.Messages;





namespace DailySalesManagerProspectMonitoringNotification
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
                Console.WriteLine("Authenticated...");
                service = (IOrganizationService)serviceProxy;

                checkProspect();
                checkCustomers();
            }
            catch (Exception ex)
            {
                string filename = "DailySalesManagerProspectMonitoringNotification";
                string datetime = DateTime.Now.ToShortDateString().ToString() + " " + DateTime.Now.ToLongTimeString().ToString() + " ==> ";
                filename += DateTime.Now.ToString("MMddyyyy");
                using (StreamWriter file = new StreamWriter(@"C:\temp\LOGS\" + filename + ".txt", true))
                {
                    file.WriteLine(datetime + ": " + ex.Message);
                    file.WriteLine(datetime + ": " + ex.StackTrace);
                }
                Console.WriteLine("Error");
                Console.ReadLine();
            }
        }

        //Checks for prospects that are yet to be converted to customers
        public static void checkProspect()
        {
            #region Get Corporate/Individual Prospect Records

            QueryExpression prospectAccountQuery = new QueryExpression("account");
            prospectAccountQuery.ColumnSet.AddColumns("createdon", "accountnumber", "gsc_salesexecutiveid", "gsc_firstname", "gsc_lastname");

            QueryExpression prospectContactQuery = new QueryExpression("contact");
            prospectContactQuery.ColumnSet.AddColumns("createdon", "gsc_customerid", "gsc_salesexecutiveid", "firstname", "lastname");


            prospectAccountQuery.Criteria = new FilterExpression();
            prospectAccountQuery.Criteria.AddCondition("account", "gsc_prospectid", ConditionOperator.Null);

            prospectContactQuery.Criteria = new FilterExpression();
            prospectContactQuery.Criteria.AddCondition("contact", "gsc_prospectid", ConditionOperator.Null);

            //Retrieve all prospects that have no equivalent record in account or contact entities
            EntityCollection prospectAccountCollection = service.RetrieveMultiple(prospectAccountQuery);
            EntityCollection prospectContactCollection = service.RetrieveMultiple(prospectContactQuery);


            Console.WriteLine("Corporate Prospect Records Retrieved: " + prospectAccountCollection.Entities.Count);
            Console.WriteLine("Individual Prospect Records Retrieved: " + prospectContactCollection.Entities.Count);

            String CustomerTo = "Prospect";
            String CustomerTrom = "Customer";
            #endregion

            #region Parse through Corporate prospect records retrieved
            foreach (Entity prospectAccount in prospectAccountCollection.Entities)
            {
                var salesExecutiveId = prospectAccount.Contains("gsc_salesexecutiveid") ? prospectAccount.GetAttributeValue<EntityReference>("gsc_salesexecutiveid").Id
                    : Guid.Empty;

                //Retrieve contact record of sales executive 
                EntityCollection SECollection = CommonHandler.RetrieveRecordsByOneValue("contact", "contactid", salesExecutiveId, service, null,
                    OrderType.Ascending, new[] { "gsc_contactbranchid", "fullname", "emailaddress1" });

                Console.WriteLine("Sales Executive Records Retrieved: " + SECollection.Entities.Count);
                if (SECollection.Entities.Count > 0)
                {
                    Entity SEEntity = SECollection.Entities[0];
                    var branchId = SEEntity.Contains("gsc_contactbranchid") ? SEEntity.GetAttributeValue<EntityReference>("gsc_contactbranchid").Id
                        : Guid.Empty;

                    //Retrieve account record of the sales executive's branch
                    EntityCollection BranchCollection = CommonHandler.RetrieveRecordsByOneValue("account", "accountid", branchId, service, null,
                        OrderType.Ascending, new[] { "gsc_prospectmonitoringperse", "name" });

                    Console.WriteLine("Branch Records Retrieved: " + BranchCollection.Entities.Count);
                    if (BranchCollection.Entities.Count > 0)
                    {
                        Entity BranchEntity = BranchCollection.Entities[0];
                        Int32 prospectMonitoringDays = BranchEntity.Contains("gsc_prospectmonitoringperse") ? BranchEntity.GetAttributeValue<Int32>("gsc_prospectmonitoringperse")
                            : 0;
                        DateTime? dateCreated = prospectAccount.Contains("createdon") ? prospectAccount.GetAttributeValue<DateTime?>("createdon")
                            : (DateTime?)null;

                        Console.WriteLine(prospectAccount.GetAttributeValue<string>("accountnumber") + "Created: " + dateCreated.Value.Date + "  Days: " + prospectMonitoringDays + " Computed: " + dateCreated.Value.AddDays(prospectMonitoringDays).Date);

                        // Condition to send email
                        if (dateCreated.Value.AddDays(prospectMonitoringDays).Date == DateTime.UtcNow.Date)
                        {
                            String customerName = prospectAccount.GetAttributeValue<string>("gsc_lastname") + ", " + prospectAccount.GetAttributeValue<string>("gsc_firstname");
                            sendEmail(SEEntity, customerName, prospectAccount.GetAttributeValue<string>("accountnumber"), prospectMonitoringDays, CustomerTo, CustomerTrom);
                        }
                    }
                }
            }
            #endregion

            #region Parse through Individual prospect records retrieved
            foreach (Entity prospectContact in prospectContactCollection.Entities)
            {
                var salesExecutiveId = prospectContact.Contains("gsc_salesexecutiveid") ? prospectContact.GetAttributeValue<EntityReference>("gsc_salesexecutiveid").Id
                    : Guid.Empty;

                //Retrieve contact record of sales executive 
                EntityCollection SECollection = CommonHandler.RetrieveRecordsByOneValue("contact", "contactid", salesExecutiveId, service, null,
                    OrderType.Ascending, new[] { "gsc_contactbranchid", "fullname", "emailaddress1" });

                Console.WriteLine("Sales Executive Records Retrieved: " + SECollection.Entities.Count);
                if (SECollection.Entities.Count > 0)
                {
                    Entity SEEntity = SECollection.Entities[0];
                    var branchId = SEEntity.Contains("gsc_contactbranchid") ? SEEntity.GetAttributeValue<EntityReference>("gsc_contactbranchid").Id
                        : Guid.Empty;

                    //Retrieve account record of the sales executive's branch
                    EntityCollection BranchCollection = CommonHandler.RetrieveRecordsByOneValue("account", "accountid", branchId, service, null,
                        OrderType.Ascending, new[] { "gsc_prospectmonitoringperse", "name" });

                    Console.WriteLine("Branch Records Retrieved: " + BranchCollection.Entities.Count);
                    if (BranchCollection.Entities.Count > 0)
                    {
                        Entity BranchEntity = BranchCollection.Entities[0];
                        Int32 prospectMonitoringDays = BranchEntity.Contains("gsc_prospectmonitoringperse") ? BranchEntity.GetAttributeValue<Int32>("gsc_prospectmonitoringperse")
                            : 0;
                        DateTime? dateCreated = prospectContact.Contains("createdon") ? prospectContact.GetAttributeValue<DateTime?>("createdon")
                            : (DateTime?)null;

                        Console.WriteLine(prospectContact.GetAttributeValue<string>("gsc_customerid") + "Created: " + dateCreated.Value.Date + "  Days: " + prospectMonitoringDays + " Computed: " + dateCreated.Value.AddDays(prospectMonitoringDays).Date);

                        // Condition to send email
                        if (dateCreated.Value.AddDays(prospectMonitoringDays).Date == DateTime.UtcNow.Date)
                        {
                            String customerName = prospectContact.GetAttributeValue<string>("lastname") + ", " + prospectContact.GetAttributeValue<string>("firstname");
                            sendEmail(SEEntity, customerName, prospectContact.GetAttributeValue<string>("gsc_customerid"), prospectMonitoringDays, CustomerTo, CustomerTrom);
                        }
                    }
                }
            }
            #endregion

        }

        //Checks for Sales Orders that don't have invoice records
        public static void checkCustomers()
        {
            #region Get Sales Order records
            QueryExpression salesOrderQuery = new QueryExpression("salesorder");
            salesOrderQuery.ColumnSet.AddColumns("createdon", "name", "gsc_salesexecutiveid", "customerid");

            LinkEntity invoiceLink = salesOrderQuery.AddLink("invoice", "salesorderid", "salesorderid", JoinOperator.LeftOuter);
            invoiceLink.EntityAlias = "i";

            salesOrderQuery.Criteria = new FilterExpression();
            salesOrderQuery.Criteria.AddCondition("i", "salesorderid", ConditionOperator.Null);

            //Retrieve all prospects that have no equivalent record in account or contact entities
            EntityCollection salesOrderCollection = service.RetrieveMultiple(salesOrderQuery);

            Console.WriteLine("Sales Order Records Retrieved: " + salesOrderCollection.Entities.Count);

            String CustomerTo = "Customer";
            String CustomerFrom = "Invoice";
            #endregion

            #region Parse through Sales Order records retrieved
            foreach (Entity salesOrder in salesOrderCollection.Entities)
            {
                var salesExecutiveId = salesOrder.Contains("gsc_salesexecutiveid") ? salesOrder.GetAttributeValue<EntityReference>("gsc_salesexecutiveid").Id
                    : Guid.Empty;

                //Retrieve contact record of sales executive 
                EntityCollection contactCollection = CommonHandler.RetrieveRecordsByOneValue("contact", "contactid", salesExecutiveId, service, null,
                    OrderType.Ascending, new[] { "gsc_contactbranchid", "fullname", "emailaddress1" });

                Console.WriteLine("Contact Records Retrieved: " + contactCollection.Entities.Count);
                if (contactCollection.Entities.Count > 0)
                {
                    Entity contactEntity = contactCollection.Entities[0];
                    var branchId = contactEntity.Contains("gsc_contactbranchid") ? contactEntity.GetAttributeValue<EntityReference>("gsc_contactbranchid").Id
                        : Guid.Empty;

                    //Retrieve account record of the sales executive's branch
                    EntityCollection accountCollection = CommonHandler.RetrieveRecordsByOneValue("account", "accountid", branchId, service, null,
                        OrderType.Ascending, new[] { "gsc_prospectmonitoringperse", "name" });

                    Console.WriteLine("Account Records Retrieved: " + accountCollection.Entities.Count);
                    if (accountCollection.Entities.Count > 0)
                    {
                        Entity accountEntity = accountCollection.Entities[0];
                        Int32 prospectMonitoringDays = accountEntity.Contains("gsc_prospectmonitoringperse") ? accountEntity.GetAttributeValue<Int32>("gsc_prospectmonitoringperse")
                            : 0;
                        DateTime? dateCreated = salesOrder.Contains("createdon") ? salesOrder.GetAttributeValue<DateTime?>("createdon")
                            : (DateTime?)null;

                        Console.WriteLine(salesOrder.GetAttributeValue<string>("name") + "Created: " + dateCreated.Value.Date + "  Days: " + prospectMonitoringDays + " Computed: " + dateCreated.Value.AddDays(prospectMonitoringDays).Date);

                        // Condition to send email
                        if (dateCreated.Value.AddDays(prospectMonitoringDays).Date == DateTime.UtcNow.Date)
                        {
                            sendEmail(contactEntity, salesOrder.GetAttributeValue<EntityReference>("customerid").Name, salesOrder.GetAttributeValue<string>("name"), prospectMonitoringDays, CustomerTo, CustomerFrom);
                        }
                    }
                }
            }
            #endregion
        }

        //Method to send email notifications
        public static void sendEmail(Entity contactEntity, String fullname, String record, Int32 prospectMonitoringDays, String customerto, String customerfrom)
        {
            Console.WriteLine("Will send email notification...");

            QueryExpression exp = new QueryExpression("template");
            exp.ColumnSet = new ColumnSet("subjectpresentationxml", "presentationxml");
            exp.Criteria.AddCondition("templatetypecode", ConditionOperator.Equal, 8);
            exp.Criteria.AddCondition("title", ConditionOperator.Equal, "Prospect Monitoring Notification");
            EntityCollection template = service.RetrieveMultiple(exp);

            XmlDocument subjectXml = new XmlDocument();
            subjectXml.LoadXml(template.Entities[0].GetAttributeValue<string>("subjectpresentationxml"));

            XmlDocument bodyXml = new XmlDocument();
            bodyXml.LoadXml(template.Entities[0].GetAttributeValue<string>("presentationxml"));

            Entity fromParty = new Entity("activityparty");

            //Retrieve System Administrator to be used as sender
            EntityCollection systemUserCollection = CommonHandler.RetrieveRecordsByOneValue("systemuser", "fullname", "System Administrator", service, null,
                OrderType.Ascending, new[] {"fullname"});

                                
            if (systemUserCollection.Entities.Count > 0)
            {
                Console.WriteLine("Constructing Email...");
                Entity systemAdmin = systemUserCollection.Entities[0];
                fromParty["partyid"] = new EntityReference("systemuser", systemAdmin.Id);

                Entity toParty = new Entity("activityparty");
                toParty["addressused"] = contactEntity.GetAttributeValue<string>("emailaddress1");

                Entity email = new Entity("email");
                email["from"] = new Entity[] { fromParty };
                email["to"] = new Entity[] { toParty };


                email["subject"] = subjectXml.DocumentElement.InnerText;

                #region Construct Email body
                int fullnameIndex = bodyXml.DocumentElement.InnerText.IndexOf("{fullname}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Insert(fullnameIndex, contactEntity.GetAttributeValue<string>("fullname"));

                int prospectNameIndex = bodyXml.DocumentElement.InnerText.IndexOf("{prospectname}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Insert(prospectNameIndex, record);

                int daysIndex = bodyXml.DocumentElement.InnerText.IndexOf("{days}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Insert(daysIndex, prospectMonitoringDays.ToString());
       
                int customerNameIndex = bodyXml.DocumentElement.InnerText.IndexOf("{customername}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Insert(customerNameIndex, fullname);
                
                int customerToIndex= bodyXml.DocumentElement.InnerText.IndexOf("{customerto}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Insert(customerToIndex, customerto);

                int customerFromIndex = bodyXml.DocumentElement.InnerText.IndexOf("{customerfrom}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Insert(customerFromIndex, customerfrom);

                fullnameIndex = bodyXml.DocumentElement.InnerText.IndexOf("{fullname}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Remove(fullnameIndex, 10);

                prospectNameIndex = bodyXml.DocumentElement.InnerText.IndexOf("{prospectname}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Remove(prospectNameIndex, 14);

                daysIndex = bodyXml.DocumentElement.InnerText.IndexOf("{days}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Remove(daysIndex, 6);

                customerNameIndex = bodyXml.DocumentElement.InnerText.IndexOf("{customername}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Remove(customerNameIndex, 14);

                customerToIndex = bodyXml.DocumentElement.InnerText.IndexOf("{customerto}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Remove(customerToIndex, 12);

                customerFromIndex = bodyXml.DocumentElement.InnerText.IndexOf("{customerfrom}");
                bodyXml.DocumentElement.InnerText = bodyXml.DocumentElement.InnerText.Remove(customerFromIndex, 14);


                #endregion

                email["description"] = bodyXml.DocumentElement.InnerText;

                email["directioncode"] = true;


                Guid emailId = service.Create(email);
                //Send email
                service.Execute(new SendEmailRequest
                {
                    EmailId = emailId,
                    TrackingToken = "",
                    IssueSend = true
                });
                Console.WriteLine("Email Sent...");
            }
            else
                throw new Exception("No system user named as System Administrator.");
        }

    }
}
