using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Mvc;
using System.Web.Security;
using Adxstudio.Xrm.Cms;
using Adxstudio.Xrm.Configuration;
using Adxstudio.Xrm.Json.JsonConverter;
using Adxstudio.Xrm.Metadata;
using Adxstudio.Xrm.Security;
using Adxstudio.Xrm.Web.Mvc;
using Adxstudio.Xrm.Web.UI;
using Adxstudio.Xrm.Services.Query;
using Microsoft.Xrm.Sdk.Query;
using Adxstudio.Xrm.Web.UI.CrmEntityListView;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Client;
using Microsoft.Xrm.Client.Diagnostics;
using Microsoft.Xrm.Portal.Configuration;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Newtonsoft.Json;
using Site.Areas.Portal.ViewModels;
using System.Web.Script.Serialization;
using System.Runtime.Serialization.Json;
using Site.Areas.DMS_Api;
using System.Web;

namespace Site.Areas.Portal.Controllers
{
    public class EntityGridController : Controller
    {
        private const int DefaultPageSize = 10;
        private const int DefaultMaxPageSize = 50;
        [HttpPost]
        [JsonHandlerError]
        public ActionResult GetSubgridData(string base64SecureConfiguration, string sortExpression, string search, int page,
            int pageSize = DefaultPageSize)
        {
            return GetData(ConvertSecureStringToViewConfiguration(base64SecureConfiguration), sortExpression, search, null, null, page, pageSize);
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult GetGridData(string base64SecureConfiguration, string sortExpression, string search, string filter,
            string metaFilter, int page, int pageSize = DefaultPageSize, string createdOnFilter = null)
        {
            return GetData(ConvertSecureStringToViewConfiguration(base64SecureConfiguration), sortExpression, search, filter, metaFilter, page, pageSize);
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult GetLookupGridData(string base64SecureConfiguration, string sortExpression, string search, string filter,
            string metaFilter, int page, int pageSize = DefaultPageSize, bool applyRelatedRecordFilter = false,
            string filterRelationshipName = null, string filterEntityName = null, string filterAttributeName = null, string filterValue = null)
        {
            Guid? filterGuidValue = null;

            if (!string.IsNullOrWhiteSpace(filterValue))
            {
                Guid guidValue;
                if (Guid.TryParse(filterValue, out guidValue))
                {
                    filterGuidValue = guidValue;
                }
            }

            return GetData(ConvertSecureStringToViewConfiguration(base64SecureConfiguration), sortExpression, search, filter, metaFilter, page, pageSize, true, applyRelatedRecordFilter,
                filterRelationshipName, filterEntityName, filterAttributeName, filterGuidValue);
        }

        private ViewConfiguration ConvertSecureStringToViewConfiguration(string base64SecureConfiguration)
        {
            var secureConfigurationByteArray = Convert.FromBase64String(base64SecureConfiguration);
            var unprotectedByteArray = MachineKey.Unprotect(secureConfigurationByteArray, "Secure View Configuration");
            if (unprotectedByteArray == null)
            {
                return null;
            }
            var configurationJson = Encoding.UTF8.GetString(unprotectedByteArray);
            var viewConfiguration = JsonConvert.DeserializeObject<ViewConfiguration>(configurationJson, new JsonSerializerSettings { Converters = new List<JsonConverter> { new UrlBuilderConverter() } });
            return viewConfiguration;
        }

        private ActionResult GetData(ViewConfiguration viewConfiguration, string sortExpression, string search, string filter,
            string metaFilter, int page, int pageSize = DefaultPageSize, bool applyRecordLevelFilters = true,
            bool applyRelatedRecordFilter = false, string filterRelationshipName = null, string filterEntityName = null,
            string filterAttributeName = null, Guid? filterValue = null, bool overrideMaxPageSize = false, string createdOnFilter = null)
        {
            if (viewConfiguration == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Invalid Request.");
            }

            if (pageSize < 0)
            {
                pageSize = DefaultPageSize;
            }
       
            viewConfiguration = EnableSearchForPriceList(viewConfiguration);

            if (pageSize > DefaultMaxPageSize && !overrideMaxPageSize)
            {
                Tracing.FrameworkInformation(GetType().FullName, "GetData",
                    "pageSize={0} is greater than the allowed maximum page size of {1}. Page size has been constrained to {1}.",
                    pageSize, DefaultMaxPageSize);
                pageSize = DefaultMaxPageSize;
            }

            var dataAdapterDependencies = new PortalConfigurationDataAdapterDependencies(requestContext: Request.RequestContext, portalName: viewConfiguration.PortalName);

            #region - DMS Custom Filtering -
            CustomFetchXml converter = new CustomFetchXml(dataAdapterDependencies.GetServiceContext(), new XrmConnection());

            if (metaFilter != null)
            {
                if (metaFilter.IndexOf(",date") > 0)
                {
                    string dateFilterString = metaFilter.Substring(metaFilter.IndexOf("date=") + 5);
                    string[] dateFilters = dateFilterString.Split(new string[] {",date="}, StringSplitOptions.None);
                    /*int dateFromIndexStart = metaFilter.LastIndexOf("DateFrom=") + 9;
                    int dateFromIndexEnd = metaFilter.LastIndexOf("&DateTo=") + 8;
                    dateFilter = metaFilter.Substring(metaFilter.IndexOf("date=") + 5);
                    int fieldNameIndex = metaFilter.LastIndexOf("&field=") + 7;
                    string dateFromValue = metaFilter.Substring(dateFromIndexStart, 10);
                    string dateToValue = metaFilter.Substring(dateFromIndexEnd, 10);
                    string entityFieldName = metaFilter.Substring(fieldNameIndex, (metaFilter.Length - fieldNameIndex));*/

                    foreach(string dateFilter in dateFilters)
                    {
                        string[] dateFilterValues = dateFilter.Split('&');
                        DateTime? dateFromValue = dateFilterValues[0].Split('=')[1] != "" ? (DateTime?)Convert.ToDateTime(dateFilterValues[0].Split('=')[1]) : null;
                        DateTime? dateToValue = dateFilterValues[1].Split('=')[1] != "" ? (DateTime?)Convert.ToDateTime(dateFilterValues[1].Split('=')[1]) : null;
                        string entityFieldName = dateFilterValues[2].Split('=')[1];

                        viewConfiguration = converter.SetCustomFetchXml(viewConfiguration, dateFromValue, dateToValue, entityFieldName);
                        int start = metaFilter.LastIndexOf(",date");
                        metaFilter = metaFilter.Substring(0, start);
                    }
                }

                if (metaFilter.IndexOf(",prospect") > 0)
                {
                    int start = metaFilter.LastIndexOf(",prospect");

                    viewConfiguration = converter.FilterProspect(viewConfiguration);

                    metaFilter = metaFilter.Substring(0, start);
                }

                if (metaFilter.IndexOf(",statecode") > 0)
                {
                    int start = metaFilter.LastIndexOf(",statecode");
                    string statecode = metaFilter.Substring(metaFilter.IndexOf("statecode=") + 10);

                    viewConfiguration = converter.FilterRecordsbyStateCode(viewConfiguration, statecode);
                    metaFilter = metaFilter.Substring(0, start);
                }

                if (metaFilter.IndexOf(",vehiclecolor") > 0)
                {
                    int start = metaFilter.LastIndexOf(",vehiclecolor");
                    string vehicleColor = metaFilter.Substring(metaFilter.IndexOf("vehiclecolor=") + 10);

                    viewConfiguration = converter.FilterRecordsbyVehicleColor(viewConfiguration, vehicleColor);
                    metaFilter = metaFilter.Substring(0, start);
                }
            }


            viewConfiguration = converter.CustomFilterViews(viewConfiguration);
            //  viewConfiguration = converter.FilterRootBusinessUnitRecords(viewConfiguration);
            #endregion

            //disable related record filtering for Vehicle Lookup in PO
            var serviceContext2 = dataAdapterDependencies.GetServiceContext();
            SavedQueryView queryView = viewConfiguration.GetSavedQueryView(serviceContext2);
            if (queryView.Name == "Vehicle Lookup - PO Portal View")
                applyRecordLevelFilters = false;

            var viewDataAdapter = applyRelatedRecordFilter &&
                                     (!string.IsNullOrWhiteSpace(filterRelationshipName) &&
                                     !string.IsNullOrWhiteSpace(filterEntityName))
                 ? new CustomViewAdapter(viewConfiguration, dataAdapterDependencies, filterRelationshipName, filterEntityName,
                     filterAttributeName, filterValue ?? Guid.Empty, page, search, sortExpression, filter, metaFilter, applyRecordLevelFilters)
                 : new CustomViewAdapter(viewConfiguration, dataAdapterDependencies, page, search, sortExpression, filter, metaFilter,
                     applyRecordLevelFilters);

            var result = viewDataAdapter.CustomFetchEntities(viewConfiguration);
            var resultRecords = result.Records;

         //   var filteredRecords = converter.FilterSharedEntityScope(viewConfiguration, result.Records);
           // var globalRecords = converter.FilterRootBusinessUnitRecords(viewConfiguration, filterEntityName, filterRelationshipName, filterValue, search);

            //var combinedResults = filteredRecords.Union(globalRecords);

           // combinedResults = combinedResults.GroupBy(x => x.Id).Select(y => y.First());

            //Custom Order By
          /*  string[] order = sortExpression.Split(' ');
            var count = 0;

            foreach (var combinedResult in resultRecords)
            {
                foreach (var attributes in combinedResult.Attributes)
                {
                    var name = attributes.Key;
                    if (name.Equals(order[0]))
                    {
                        count++;

                        var value = attributes.Value;
                        var valueType = value.GetType().Name;
                        if (valueType == "String")
                        {
                            if (order[1] == "DESC")
                                resultRecords = resultRecords.OrderByDescending(x => x.Contains(order[0]) ? x.Attributes[order[0]] : "");
                            else
                                resultRecords = resultRecords.OrderBy(x => x.Contains(order[0]) ? x.Attributes[order[0]] : "");
                        }
                        else if (valueType == "Money")
                        {
                            if (order[1] == "DESC")
                                resultRecords = resultRecords.OrderByDescending(x => x.Contains(order[0]) ? x.GetAttributeValue<Money>(order[0]).ToString() : "");
                            else
                                resultRecords = resultRecords.OrderBy(x => x.Contains(order[0]) ? x.GetAttributeValue<Money>(order[0]).ToString() : "");
                        }
                        else if (valueType == "OptionSetValue")
                        {
                            if (order[1] == "DESC")
                                resultRecords = resultRecords.OrderByDescending(x => x.Contains(order[0]) ? x.FormattedValues[order[0]] : "");
                            else
                                resultRecords = resultRecords.OrderBy(x => x.Contains(order[0]) ? x.FormattedValues[order[0]] : "");
                        }
                        else if (valueType == "EntityReference")
                        {
                            if (order[1] == "DESC")
                                resultRecords = resultRecords.OrderByDescending(x => x.GetAttributeValue<EntityReference>(order[0]) != null ? x.GetAttributeValue<EntityReference>(order[0]).Name : "");
                            else
                                resultRecords = resultRecords.OrderBy(x => x.GetAttributeValue<EntityReference>(order[0]) != null ? x.GetAttributeValue<EntityReference>(order[0]).Name : "");
                        }
                        break;
                    }
                }

                if (count > 0)
                    break;
            }
            //Custom Order By Ends Here*/

            if (result.EntityPermissionDenied)
            {
                var permissionResult = new EntityPermissionResult(true);

                return Json(permissionResult);
            }

            IEnumerable<EntityRecord> records;
            if (viewConfiguration.EnableEntityPermissions && AdxstudioCrmConfigurationManager.GetCrmSection().ContentMap.Enabled)
            {
                var serviceContext = dataAdapterDependencies.GetServiceContext();
                var crmEntityPermissionProvider = new CrmEntityPermissionProvider();

                records = resultRecords.Select(e => new EntityRecord(e, serviceContext, crmEntityPermissionProvider, viewDataAdapter.EntityMetadata, true));
            }
            else
            {
                records = resultRecords.Select(e => new EntityRecord(e, viewDataAdapter.EntityMetadata));
            }

            var totalRecordCount = result.TotalRecordCount;

            var data = new PaginatedGridData(records, totalRecordCount, page, pageSize);

            var json = Json(data);
            json.MaxJsonLength = int.MaxValue;

            //

            return json;
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult Delete(EntityReference entityReference)
        {
            string portalName = null;
            var portalContext = PortalCrmConfigurationManager.CreatePortalContext();
            var languageCodeSetting = portalContext.ServiceContext.GetSiteSettingValueByName(portalContext.Website, "Language Code");

            if (!string.IsNullOrWhiteSpace(languageCodeSetting))
            {
                int languageCode;
                if (int.TryParse(languageCodeSetting, out languageCode))
                {
                    portalName = languageCode.ToString(CultureInfo.InvariantCulture);
                }
            }

            var dataAdapterDependencies = new PortalConfigurationDataAdapterDependencies(requestContext: Request.RequestContext, portalName: portalName);
            var serviceContext = dataAdapterDependencies.GetServiceContext();
            var entityPermissionProvider = new CrmEntityPermissionProvider();

            if (!entityPermissionProvider.PermissionsExist)
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Entity Permissions have not been defined. Your request could not be completed.");
            }

            var entityMetadata = serviceContext.GetEntityMetadata(entityReference.LogicalName, EntityFilters.All);
            var primaryKeyName = entityMetadata.PrimaryIdAttribute;
            var entity =
                serviceContext.CreateQuery(entityReference.LogicalName)
                    .First(e => e.GetAttributeValue<Guid>(primaryKeyName) == entityReference.Id);
            var test = entityPermissionProvider.TryAssert(serviceContext, CrmEntityPermissionRight.Delete, entity);
         
                if (test)
                {
                   try
                    {
                        serviceContext.DeleteObject(entity);
                        serviceContext.SaveChanges();

                        SalesHub hub = new SalesHub();
                        string url = Request.Url.OriginalString;
                    }   

                  catch (Exception ex)
                    {
                        if (ex.InnerException.Message.Contains("The object you tried to delete is associated with another object and cannot be deleted."))
                            throw new InvalidOperationException("Record cannot be deleted. It is already used in transactions.");
                        else
                            throw new InvalidOperationException(ex.InnerException.Message.ToString());
                    }
                    //string userId = Portal.User.Id.ToString();
                    //string fullName = Portal.User.Attributes["fullname"].ToString();
                    //hub.UserHasSaved(url, userId, fullName);              
                }
                else
                {
                    return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Permission Denied. You do not have the appropriate Entity Permissions to delete this record.");
                }
            

            return new HttpStatusCodeResult(HttpStatusCode.NoContent);
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult Associate(AssociateRequest request)
        {
            string portalName = null;
            var portalContext = PortalCrmConfigurationManager.CreatePortalContext();
            var languageCodeSetting = portalContext.ServiceContext.GetSiteSettingValueByName(portalContext.Website, "Language Code");

            if (!string.IsNullOrWhiteSpace(languageCodeSetting))
            {
                int languageCode;
                if (int.TryParse(languageCodeSetting, out languageCode))
                {
                    portalName = languageCode.ToString(CultureInfo.InvariantCulture);
                }
            }

            var dataAdapterDependencies = new PortalConfigurationDataAdapterDependencies(requestContext: Request.RequestContext, portalName: portalName);
            var serviceContext = dataAdapterDependencies.GetServiceContext();
            var entityPermissionProvider = new CrmEntityPermissionProvider();

            if (!entityPermissionProvider.PermissionsExist)
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Entity Permissions have not been defined. Your request could not be completed.");
            }

            var relatedEntities = request.RelatedEntities.Where(
                related => entityPermissionProvider.TryAssertAssociation(serviceContext, request.Target, request.Relationship, related)
            ).ToList();

            if (relatedEntities.Any())
            {
                var filtered = new AssociateRequest { Target = request.Target, Relationship = request.Relationship, RelatedEntities = new EntityReferenceCollection(relatedEntities) };

                serviceContext.Execute(filtered);
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Permission Denied. You do not have the appropriate Entity Permissions to associate these records.");
            }

            return new HttpStatusCodeResult(HttpStatusCode.NoContent);
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult Disassociate(DisassociateRequest request)
        {
            string portalName = null;
            var portalContext = PortalCrmConfigurationManager.CreatePortalContext();
            var languageCodeSetting = portalContext.ServiceContext.GetSiteSettingValueByName(portalContext.Website, "Language Code");

            if (!string.IsNullOrWhiteSpace(languageCodeSetting))
            {
                int languageCode;
                if (int.TryParse(languageCodeSetting, out languageCode))
                {
                    portalName = languageCode.ToString(CultureInfo.InvariantCulture);
                }
            }

            var dataAdapterDependencies = new PortalConfigurationDataAdapterDependencies(requestContext: Request.RequestContext, portalName: portalName);
            var serviceContext = dataAdapterDependencies.GetServiceContext();
            var entityPermissionProvider = new CrmEntityPermissionProvider();

            if (!entityPermissionProvider.PermissionsExist)
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Entity Permissions have not been defined. Your request could not be completed.");
            }

            var relatedEntities =
                request.RelatedEntities.Where(
                    related => entityPermissionProvider.TryAssertAssociation(serviceContext, request.Target, request.Relationship, related)).ToList();

            if (relatedEntities.Any())
            {
                var filtered = new DisassociateRequest { Target = request.Target, Relationship = request.Relationship, RelatedEntities = new EntityReferenceCollection(relatedEntities) };

                serviceContext.Execute(filtered);
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Permission Denied. You do not have the appropriate Entity Permissions to disassociate the records.");
            }

            return new HttpStatusCodeResult(HttpStatusCode.NoContent);
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult DownloadAsCsv(string viewName, IEnumerable<LayoutColumn> columns, string base64SecureConfiguration, string sortExpression, string search, string filter,
            string metaFilter, int page = 1, int pageSize = DefaultPageSize)
        {
            var viewConfiguration = ConvertSecureStringToViewConfiguration(base64SecureConfiguration);

            if (viewConfiguration == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Invalid Request.");
            }

            // override the page parameters to get up to 5000 records.
            page = 1;
            pageSize = 5000;
            viewConfiguration.PageSize = 5000;

            var json = GetData(viewConfiguration, sortExpression, search, filter, metaFilter, page, pageSize, true, false, null, null, null, null, true) as JsonResult;

            if (json == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.NoContent);
            }

            if (json.Data is EntityPermissionResult)
            {
                return json;
            }

            var data = json.Data as PaginatedGridData;

            if (data == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.NoContent);
            }

            var csv = new StringBuilder();

            var dataColumns = columns.Where(col => col.LogicalName != "col-action").ToArray();

            foreach (var column in dataColumns)
            {
                csv.Append(EncodeCommaSeperatedValue(column.Name));
            }

            csv.AppendLine();

            foreach (var record in data.Records)
            {
                foreach (var column in dataColumns)
                {
                    var attribute = record.Attributes.FirstOrDefault(a => a.Name == column.LogicalName);

                    if (attribute == null) continue;

                    csv.Append(EncodeCommaSeperatedValue(attribute.DisplayValue as string));
                }

                csv.AppendLine();
            }

            var filename = new string(viewName.Where(c => !Path.GetInvalidFileNameChars().Contains(c)).ToArray());

            var sessionKey = "{0:s}|{1}.csv".FormatWith(DateTime.UtcNow, filename);

            Session[sessionKey] = csv.ToString();

            return Json(new { success = true, sessionKey }, JsonRequestBehavior.AllowGet);
        }

        [ActionName("DownloadAsCsv")]
        [HttpGet]
        public ActionResult GetCsvFile(string key)
        {
            var csv = Session[key] as string;

            if (string.IsNullOrEmpty(csv))
            {
                return new HttpStatusCodeResult(HttpStatusCode.NoContent);
            }

            Session[key] = null;

            return File(new UTF8Encoding().GetBytes(csv), "text/csv", key.Substring(key.IndexOf('|') + 1));
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult DownloadAsExcel(string viewName, IEnumerable<LayoutColumn> columns, string base64SecureConfiguration, string sortExpression, string search, string filter,
            string metaFilter, int page = 1, int pageSize = DefaultPageSize)
        {
            var viewConfiguration = ConvertSecureStringToViewConfiguration(base64SecureConfiguration);

            if (viewConfiguration == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden, "Invalid Request.");
            }

            // override the page parameters to get up to 5000 records.
            page = 1;
            pageSize = 5000;
            viewConfiguration.PageSize = 5000;

            var json = GetData(viewConfiguration, sortExpression, search, filter, metaFilter, page, pageSize, true, false, null, null, null, null, true) as JsonResult;

            if (json == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.NoContent);
            }

            if (json.Data is EntityPermissionResult)
            {
                return json;
            }

            var data = json.Data as PaginatedGridData;

            if (data == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.NoContent);
            }

            var stream = new MemoryStream();

            var spreadsheet = SpreadsheetDocument.Create(stream, SpreadsheetDocumentType.Workbook);

            var workbookPart = spreadsheet.AddWorkbookPart();
            workbookPart.Workbook = new Workbook();

            var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
            var sheet = new Sheet { Id = spreadsheet.WorkbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = viewName };

            var sheets = new Sheets();
            sheets.Append(sheet);

            var sheetData = new SheetData();

            var rowIndex = 1;
            var columnIndex = 1;

            var firstRow = new Row { RowIndex = (uint)rowIndex };

            var dataColumns = columns.Where(col => col.LogicalName != "col-action").ToArray();

            foreach (var column in dataColumns)
            {
                var cell = new Cell { CellReference = CreateCellReference(columnIndex) + rowIndex, DataType = CellValues.InlineString };

                var inlineString = new InlineString { Text = new Text { Text = column.Name } };

                cell.AppendChild(inlineString);

                firstRow.AppendChild(cell);

                columnIndex++;
            }

            sheetData.Append(firstRow);

            foreach (var record in data.Records)
            {
                var row = new Row { RowIndex = (uint)++rowIndex };

                columnIndex = 0;

                foreach (var column in dataColumns)
                {
                    columnIndex++;

                    var attribute = record.Attributes.FirstOrDefault(a => a.Name == column.LogicalName);

                    if (attribute == null) continue;

                    var cell = new Cell { CellReference = CreateCellReference(columnIndex) + rowIndex, DataType = CellValues.InlineString };

                    var inlineString = new InlineString { Text = new Text { Text = attribute.DisplayValue as string } };

                    cell.AppendChild(inlineString);

                    row.AppendChild(cell);
                }

                sheetData.Append(row);
            }

            worksheetPart.Worksheet = new Worksheet(sheetData);

            spreadsheet.WorkbookPart.Workbook.AppendChild(sheets);

            workbookPart.Workbook.Save();

            spreadsheet.Close();

            var filename = new string(viewName.Where(c => !Path.GetInvalidFileNameChars().Contains(c)).ToArray());

            //Concatenate primary name in downloaded excel
            string primaryName = string.Empty;
            var context = System.Web.HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;
                if (cookies["primaryName"] != null)
                {
                    primaryName = HttpUtility.UrlDecode(Request.Cookies["primaryName"].Value.ToString());
                    System.Web.HttpCookie primaryNameCookie = new HttpCookie("primaryName");
                    primaryNameCookie.Expires = DateTime.Now.AddDays(-1d);
                    Response.Cookies.Add(primaryNameCookie);
                    filename = filename + " - " + primaryName;
                }
            }

            //End

            var sessionKey = "{0:s}|{1}.xlsx".FormatWith(DateTime.UtcNow, filename);

            stream.Position = 0; // Reset the stream to the beginning and save to session.

            Session[sessionKey] = stream;

            return Json(new { success = true, sessionKey }, JsonRequestBehavior.AllowGet);
        }

        [ActionName("DownloadAsExcel")]
        [HttpGet]
        public ActionResult GetExcelFile(string key)
        {
            using (var stream = Session[key] as MemoryStream)
            {
                if (stream == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.NoContent);
                }

                Session[key] = null;

                return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", key.Substring(key.IndexOf('|') + 1));
            }
        }

        [HttpPost]
        [JsonHandlerError]
        public ActionResult ExecuteWorkflow(EntityReference workflow, EntityReference entity)
        {
            string portalName = null;
            var portalContext = PortalCrmConfigurationManager.CreatePortalContext();
            var languageCodeSetting = portalContext.ServiceContext.GetSiteSettingValueByName(portalContext.Website, "Language Code");

            if (!string.IsNullOrWhiteSpace(languageCodeSetting))
            {
                int languageCode;
                if (int.TryParse(languageCodeSetting, out languageCode))
                {
                    portalName = languageCode.ToString(CultureInfo.InvariantCulture);
                }
            }

            var dataAdapterDependencies = new PortalConfigurationDataAdapterDependencies(requestContext: Request.RequestContext, portalName: portalName);
            var serviceContext = dataAdapterDependencies.GetServiceContext();

            var request = new ExecuteWorkflowRequest
            {
                WorkflowId = workflow.Id,
                EntityId = entity.Id
            };

            serviceContext.Execute(request);

            serviceContext.TryRemoveFromCache(entity);

            return new HttpStatusCodeResult(HttpStatusCode.NoContent);
        }

        private string CreateCellReference(int column)
        {
            // A, B, C...Z, AA, BB...ZZ, AAA, BBB...
            const char firstRef = 'A';
            const uint firstIndex = (uint)firstRef;

            var result = string.Empty;

            while (column > 0)
            {
                var mod = (column - 1) % 26;
                result += (char)(firstIndex + mod);
                column = (column - mod) / 26;
            }

            return result;
        }

        private static string EncodeCommaSeperatedValue(string value)
        {
            return !string.IsNullOrEmpty(value)
                ? string.Format(@"""{0}"",", value.Replace(@"""", @""""""))
                : ",";
        }

        private static ViewConfiguration EnableSearchForPriceList(ViewConfiguration viewConfig)
        {
            if (viewConfig.EntityName == "gsc_cmn_extendedpricelistitem")
            {
                ViewSearch customSearch = viewConfig.Search;
                customSearch.Enabled = true;

                viewConfig.Search = customSearch;
            }
            return viewConfig;
        }

        //private string FilterCreatedOn(ViewConfiguration viewConfig, PortalConfigurationDataAdapterDependencies configAdapter)
        //{

        //    SavedQueryView queryView = viewConfig.GetSavedQueryView(configAdapter.GetServiceContext());

        //    DateTime today = DateTime.Today.ToUniversalTime();

        //    Fetch fetch = Fetch.Parse(queryView.FetchXml);



        //    //Filter filter = new Filter { Type = LogicalOperator.And };

        //    //filter.Conditions = new List<Condition>();

        //    //filter.Conditions.Add(new Condition
        //    //{
        //    //    Attribute = "gsc_validto",
        //    //    Operator = ConditionOperator.GreaterEqual,
        //    //    Value = today
        //    //});

        //    //fetch.Entity.Filters.Add(filter);

        //    //viewConfig.FetchXml = fetch.ToXml().ToString();
        //    //ISerializer jsonSerializer = new DMSJsonSerializer();

        //    //FilterDefinition data = jsonSerializer.Deserialize<FilterDefinition>(definition);

        //    //if (data.entity.filters.Any())
        //    //{
        //    //    var createdOn = data.entity.filters.SingleOrDefault(f => f.adxattribute == "createdon");

        //    //    if (createdOn != null && createdOn.adxfiltertype == "rangeset" && createdOn.filters.Any())
        //    //    {

        //    //        var filter = createdOn.filters.First();

        //    //        var startDate = filter.conditions.Where(f => f._operator == "on-or-after").FirstOrDefault().value = "2016-07-22";
        //    //        var endDate = filter.conditions.Where(f => f._operator == "on-or-before").FirstOrDefault().value = "2016-07-25";

        //    //    }

        //    //}

        //    //return jsonSerializer.Serialize<FilterDefinition>(data);
        //}

        //private IEnumerable<Entity> FilterCreatedOn(IEnumerable<Entity> records, string dateFrom, string dateTo)
        //{
        //    IEnumerable<Entity> result = null;

        //    foreach (Entity item in records)
        //    {
        //        DateTime hey = item.GetAttributeValue<DateTime>("createdon");

        //    }

        //    return result;
        //}
    }
}
