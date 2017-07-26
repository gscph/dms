using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using NLog;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace ImportIntegration
{
    public class EmailSender
    {
        private readonly IOrganizationService _service;
        public EmailTemplate EmailTemplate { get; private set; }

        public EmailSender() { }

        public EmailSender(IOrganizationService service)
        {
            _service = service;
        }

        public void SetEmailTemplate()
        {
            QueryExpression exp = new QueryExpression("template");
            exp.ColumnSet = new ColumnSet("subjectpresentationxml", "presentationxml");
            exp.Criteria.AddCondition("templatetypecode", ConditionOperator.Equal, 8);
            exp.Criteria.AddCondition("title", ConditionOperator.Equal, "Import Migration");
            EntityCollection template = _service.RetrieveMultiple(exp);

            XmlDocument subjectXml = new XmlDocument();
            subjectXml.LoadXml(template.Entities[0].GetAttributeValue<string>("subjectpresentationxml"));

            XmlDocument bodyXml = new XmlDocument();
            bodyXml.LoadXml(template.Entities[0].GetAttributeValue<string>("presentationxml"));

            this.EmailTemplate = new EmailTemplate
            {
                Subject = subjectXml.DocumentElement.InnerText,
                Body = bodyXml.DocumentElement.InnerText,
            };
        }

        private Entity[] CreateMultipleDestination(string addresses)
        {
            string[] destinationAddresses = addresses.Split(';');

            Entity[] toParties = new Entity[destinationAddresses.Length];

            for (int i = 0; i < destinationAddresses.Length; i++)
            {
                toParties[i] = new Entity("activityparty");
                toParties[i]["addressused"] = destinationAddresses[i];
            }

            return toParties;
        }

        public void Send(int successRecordCount, int failedRecordCount)
        {
            string subject = "Import Integration - No Reply";
            string receipients = LogManager.Configuration.Variables["email"].Text;

            string body = string.Format(@"Dear User, <br/><br/>
                            An Import request has been sent in the DMS Application. <br/>
                            A total of <b>{0}</b> records has been successfully imported in the application. <br/>
                            Please see attached file for the records (<b>{1}</b>) that were not included. <br/><br/><br/>
                            If you believe you received this email in error, please contact your System Administrator for Support.<br/>
                            Please do not reply to this message. This email address is not monitored so we are unable to respond to any messages sent to this address.<br/>", successRecordCount, failedRecordCount);

            var client = new SmtpClient("smtp.gmail.com", 587);
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential("mmpc.mitsubishi@gmail.com", "mitsubishimotors");
            client.EnableSsl = true;
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress("mmpc.mitsubishi@gmail.com");

            string[] destinationAddresses = LogManager.Configuration.Variables["email"].Text.Split(';');

            foreach (string item in destinationAddresses)
            {
                mail.To.Add(item);
            }

            mail.Subject = subject;
            mail.Body = body;
            mail.IsBodyHtml = true;
            mail.Priority = MailPriority.Low;
            mail.Attachments.Add(CreateAttachment());

            client.Send(mail);
        }

        public Attachment CreateAttachment()
        {
            string path = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            string environment = LogManager.Configuration.Variables["environment"].Text;
            string currentDate = DateTime.Now.ToString("yyyy-MM-dd");

            path += string.Format("\\importlogs\\trace\\{0}-{1}.log", currentDate, environment);

            Attachment attachment = new Attachment(path);
            attachment.ContentDisposition.FileName = string.Format("{0}-{1}.log", currentDate, environment);

            return attachment;
        }
    }

    public class EmailTemplate
    {
        public string Body { get; set; }
        public string Subject { get; set; }
        public string Destination { get; set; }
    }

}



