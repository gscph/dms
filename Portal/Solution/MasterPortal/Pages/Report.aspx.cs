using Microsoft.Reporting.WebForms;
using System;
using System.Net;
using System.Security.Principal;
using System.Web;
using System.Collections.Generic;
using System.Web.UI.WebControls;
using System.Data.SqlClient;
using System.Configuration;

namespace Site.Reports
{
    public partial class RequirementChecklist : System.Web.UI.Page
    {

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                string connectionStringCrmOrg = string.Empty;
                string connectionStringReportServer = string.Empty;

                //string serviceUri = string.Empty;
                if (ConfigurationManager.ConnectionStrings["CRMOrg"] != null && ConfigurationManager.ConnectionStrings["DBServer"] != null)
                {
                    connectionStringCrmOrg = ConfigurationManager.ConnectionStrings["CRMOrg"].ConnectionString;
                    connectionStringReportServer = ConfigurationManager.ConnectionStrings["DBServer"].ConnectionString;

                    string crmOrg = connectionStringCrmOrg;
                    string dbServer = connectionStringReportServer;

                    //serviceUri = ConfigurationManager.ConnectionStrings["ReportServer"].toString();
                    //string database = serviceUri;
                    string url = HttpContext.Current.Request.Url.AbsoluteUri;
                    Uri myUri = new Uri(url);
                    string reportname = HttpUtility.ParseQueryString(myUri.Query).Get("reportname");
                    string reportpath = "/" + crmOrg + "_MSCRM/CustomReports/" + reportname;

                    ReportViewer1.SizeToReportContent = true;
                    ReportViewer1.Width = Unit.Percentage(100);
                    ReportViewer1.Height = Unit.Percentage(100);
                    ReportViewer1.ServerReport.ReportServerCredentials = new ReportServerCredentials();

                    string urlReportServer = "http://" + dbServer + "/ReportServer";

                    ReportViewer1.ServerReport.ReportServerUrl = new Uri(urlReportServer); //Set the ReportServer Url
                    ReportViewer1.ServerReport.ReportPath = reportpath; //Passing the Report Path 

                    string parameters = url.Split('?')[1];
                    string[] parametersArray = parameters.Split('&');
                    string recordId = string.Empty;
                    string exportToWord = string.Empty;

                    List<ReportParameter> paramList = new List<ReportParameter>();

                    foreach (string param in parametersArray)
                    {
                        string column = param.Split('=')[0];
                        string value = param.Split('=')[1];

                        if (column == "reportname")
                            continue;

                        if (column == "reportid" && value == "null")
                            continue;

                        if (column == "recordId")
                        {
                            recordId = value;
                            continue;
                        }

                        if (column == "exportToWord")
                        {
                            exportToWord = value;
                            continue;
                        }
                        if (value == "")
                            paramList.Add(new ReportParameter(column, new string[] { null }, false));
                        else
                            paramList.Add(new ReportParameter(column, value, false));

                    }

                    ReportViewer1.ServerReport.SetParameters(paramList);

                    if (exportToWord == "1")
                    {
                        byte[] wordData = ReportViewer1.ServerReport.Render("WORDOPENXML");//, devinfo, out mimeType, out encoding, out extension, out streamIds, out warnings);

                        Response.Clear();
                        Response.ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        Response.AddHeader("content-disposition", "inline; filename=report_" + recordId + ".docx");

                        Response.BinaryWrite(wordData);
                        Response.End();
                    }
                    else
                    {
                        if (reportname == "{fce6b184-5265-e711-80f5-00155d010e2c}")
                        {
                            string val = dssr.Value = "DSSR";
                            ReportViewer1.ShowParameterPrompts = true;
                            ReportViewer1.PromptAreaCollapsed = false;
                        }
                        else
                        {
                            byte[] data = ReportViewer1.ServerReport.Render("PDF");//, devinfo, out mimeType, out encoding, out extension, out streamIds, out warnings);

                            Response.Clear();
                            Response.ContentType = "application/pdf";
                            Response.AddHeader("content-disposition", "inline; filename=report_" + reportname + ".pdf");

                            Response.BinaryWrite(data);
                            Response.Flush();
                        }
                    }
                    ReportViewer1.ServerReport.Refresh();
                }
            }
        }



        public class ReportServerCredentials : IReportServerCredentials
        {
            public bool GetFormsCredentials(out Cookie authCookie, out string userName, out string password, out string authority)
            {
                authCookie = null;
                userName = null;
                password = null;
                authority = null;
                return false;
            }

            public WindowsIdentity ImpersonationUser
            {
                get { return null; }
            }

            public ICredentials NetworkCredentials
            {
                get
                {
                    string userName = "administrator";
                    string password = "*StopUsingWeakPasswords!";
                    string domain = "xrm";

                    return new NetworkCredential(userName, password, domain);
                }
            }
        }
    }
}