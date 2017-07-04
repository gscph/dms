using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;
using System.IO;
using System.Runtime.Serialization.Json;
using System.Text;
using Adxstudio.Xrm.Web.UI.CrmEntityListView;
using Microsoft.Xrm.Sdk.Client;
using Adxstudio.Xrm.Web.UI;
using Adxstudio.Xrm.Services.Query;
using Microsoft.Xrm.Sdk.Query;
using Site.Areas.DMS_Api;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Portal.Web;
using Site.Areas.DMSApi;
using Site.Pages.DMS_Templates;
using Microsoft.Xrm.Sdk.Metadata;

namespace Site.Areas.Portal.ViewModels
{
    public class CustomFetchXml
    {
        private OrganizationServiceContext _serviceContext = null;
        private readonly IXrmConnection _service;
        public CustomFetchXml(OrganizationServiceContext serviceContext, IXrmConnection service)
        {
            _serviceContext = serviceContext;
            _service = service;
        }

        public ViewConfiguration FilterProspect(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string currentUserBranch = string.Empty;

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;
                HttpCookie branchCookie = null;

                if (cookies != null)
                {
                    branchCookie = cookies["Branch"];

                    if (branchCookie != null)
                    {
                        currentUserBranch = branchCookie["branchId"];
                    }
                }
            }

            Fetch fetch = Fetch.Parse(queryView.FetchXml);

            Filter filter = new Filter { Type = LogicalOperator.And };

            filter.Conditions = new List<Condition>();

            filter.Conditions.Add(new Condition
            {
                Attribute = "gsc_branchid",
                Operator = ConditionOperator.Equal,
                Value = currentUserBranch
            });

            fetch.Entity.Filters.Add(filter);

            _viewConfig.FetchXml = fetch.ToXml().ToString();

            return _viewConfig;
        }

        public IEnumerable<Entity> FilterRootBusinessUnitRecords(ViewConfiguration _viewConfig, string filterEntityName, String filterRelationshipName, Guid? filterValue, string search)
        {
            List<Entity> globalRecordList = new List<Entity>();
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            //Check if entity is a global entity 
            if (!CheckIfGlobalEntity(queryView))
                return globalRecordList;

            Fetch fetch = new Fetch();

            ViewConfiguration customView = CustomFilterViews(_viewConfig);

            if (customView.FetchXml != null)
                fetch = Fetch.Parse(customView.FetchXml);
            else
                fetch = Fetch.Parse(queryView.FetchXml);

            //Add Custom Filter for Global Records
            Filter filter = new Filter { Type = LogicalOperator.And };

            filter.Conditions = new List<Condition>();

            filter.Conditions.Add(new Condition
            {
                Attribute = "gsc_isglobalrecord",
                Operator = ConditionOperator.Equal,
                Value = true
            });

            fetch.Entity.Filters.Add(filter);


            if ((!string.IsNullOrWhiteSpace(filterRelationshipName) && !string.IsNullOrWhiteSpace(filterEntityName) && filterValue != null))
            {
                //Add Link entity Filter
                Link relatedEntity = new Link();
                relatedEntity.Alias = "Related";
                relatedEntity.FromAttribute = filterEntityName + "id";
                relatedEntity.Name = filterEntityName;
                relatedEntity.ToAttribute = GetRelatedAttributeId(filterEntityName, filterRelationshipName);

                //Add Custom Filter for Global Records
                Filter filter2 = new Filter { Type = LogicalOperator.And };

                filter2.Conditions = new List<Condition>();

                filter2.Conditions.Add(new Condition
                {
                    Attribute = filterEntityName + "id",
                    Operator = ConditionOperator.Equal,
                    Value = filterValue,
                    UiName = "",
                    UiType = ""
                });
                List<Filter> filters = new List<Filter>();
                filters.Add(filter2);

                relatedEntity.Filters = filters;

                fetch.Entity.Links.Add(relatedEntity);

            }
            EntityCollection result = _service.ServiceContext.RetrieveMultiple(new FetchExpression(fetch.ToXml().ToString()));

            var count = result.Entities.Count;

            if (result != null && result.Entities.Count > 0)
            {
                foreach (Entity globalRecord in result.Entities)
                {
                    globalRecordList.Add(globalRecord);
                }
            }

            return SearchGlobalRecords(globalRecordList, search);
        }

        private Boolean CheckIfGlobalEntity(SavedQueryView queryView)
        {
            //Check if entity is a global entity
            QueryExpression queryGlobalEntities = new QueryExpression("gsc_globalentities");
            queryGlobalEntities.ColumnSet.AddColumns("gsc_name");
            queryGlobalEntities.Criteria.AddCondition("gsc_name", ConditionOperator.Equal, queryView.EntityLogicalName);

            EntityCollection globalEntitiesCollection = _service.ServiceContext.RetrieveMultiple(queryGlobalEntities);

            if (globalEntitiesCollection != null && globalEntitiesCollection.Entities.Count > 0)
            {
                return true;
            }

            return false;
        }

        private List<Entity> SearchGlobalRecords(List<Entity> globalRecords, String search)
        {
            List<Entity> searchResult = new List<Entity>();

            if (search != null && search != String.Empty)
            {
                var stringOperator = 0; // 0 = StartsWith
                if (search.StartsWith("*"))
                    stringOperator = 1; // 1 = Contains

                search = search.Trim('*'); //Remove asterisk

                foreach (var globalRecord in globalRecords)
                {
                    foreach (var attributes in globalRecord.Attributes)
                    {
                        var value = attributes.Value;
                        var valueType = value.GetType().Name;
                        if (valueType == "String")
                        {
                            if (stringOperator == 0)
                            {
                                if (value.ToString().StartsWith(search, StringComparison.CurrentCultureIgnoreCase))
                                {
                                    searchResult.Add(globalRecord);
                                    break;
                                }
                            }
                            else
                            {
                                var a = value.ToString().IndexOf(search, StringComparison.InvariantCultureIgnoreCase);
                                if (value.ToString().IndexOf(search, StringComparison.InvariantCultureIgnoreCase) != -1)
                                {
                                    searchResult.Add(globalRecord);
                                    break;
                                }
                            }
                        }
                        else if (valueType == "DateTime")
                        {
                            DateTime dateSearch = new DateTime();
                            if (DateTime.TryParse(search, out dateSearch))
                            {
                                var moneyValue = globalRecord.Contains(attributes.Key)
                                    ? globalRecord.GetAttributeValue<DateTime?>(attributes.Key)
                                    : null;

                                if (moneyValue != null)
                                {
                                    if (moneyValue.Value.ToShortDateString().Equals(dateSearch.ToShortDateString()))
                                    {
                                        searchResult.Add(globalRecord);
                                        break;
                                    }
                                }
                            }
                        }
                        else if (valueType == "Money")
                        {
                            decimal moneySearch = 0;
                            if (Decimal.TryParse(search, out moneySearch))
                            {
                                var moneyValue = globalRecord.Contains(attributes.Key)
                                    ? globalRecord.GetAttributeValue<Money>(attributes.Key).Value
                                    : 0;

                                if (moneyValue.Equals(moneySearch))
                                {
                                    searchResult.Add(globalRecord);
                                    break;
                                }
                            }
                        }
                        else if (valueType == "OptionSetValue")
                        {
                            var moneyValue = globalRecord.Contains(attributes.Key)
                                ? globalRecord.FormattedValues[attributes.Key]
                                : "";

                            if (moneyValue.Equals(search))
                            {
                                searchResult.Add(globalRecord);
                                break;
                            }

                        }
                        else if (valueType == "EntityReference")
                        {
                            var name = globalRecord.GetAttributeValue<EntityReference>(attributes.Key) != null
                                ? globalRecord.GetAttributeValue<EntityReference>(attributes.Key).Name
                                : String.Empty;

                            if (stringOperator == 0)
                            {
                                if (name.StartsWith(search, StringComparison.CurrentCultureIgnoreCase))
                                {
                                    searchResult.Add(globalRecord);
                                    break;
                                }
                            }
                            else
                            {
                                var a = name.IndexOf(search, StringComparison.InvariantCultureIgnoreCase);
                                if (name.IndexOf(search, StringComparison.InvariantCultureIgnoreCase) != -1)
                                {
                                    searchResult.Add(globalRecord);
                                    break;
                                }
                            }
                        }
                    }
                }
                return searchResult;
            }

            return globalRecords;
        }

        private Entity GetSharedEntityScope(IEnumerable<Entity> result)
        {
            if (result.Count() == 0)
                return null;

            Entity entity = result.First();
            var typeField = "";

            if (entity.LogicalName == "account" || entity.LogicalName == "contact")
                typeField = "gsc_recordtype";
            else if (entity.LogicalName == "product")
                typeField = "gsc_producttype";
            else
                return null;

            int recordType = 0;
            Guid webRoleId = Guid.Empty;
            var context = HttpContext.Current;
            var request = context.Request.RequestContext;
            var cookies = request.HttpContext.Request.Cookies;
            if (cookies != null)
            {
                if (cookies["Branch"] != null)
                {
                    webRoleId = new Guid(cookies["Branch"]["webRoleId"]);
                }
            }

            QueryExpression queryRecordType = new QueryExpression(result.First().LogicalName);
            queryRecordType.ColumnSet = new ColumnSet(typeField);
            queryRecordType.Criteria.AddCondition(result.First().LogicalName + "id", ConditionOperator.Equal, result.First().Id);
            EntityCollection recordTypeCollection = _service.ServiceContext.RetrieveMultiple(queryRecordType);

            if (recordTypeCollection != null && recordTypeCollection.Entities.Count > 0)
            {
                if (recordTypeCollection.Entities[0].Contains(typeField))
                {
                    recordType = GetOptionSetId("adx_entitypermission", "gsc_recordtype", recordTypeCollection.Entities[0].FormattedValues[typeField]);
                }
                else
                    return null;
            }

            QueryExpression queryEntityPermission = new QueryExpression("adx_entitypermission");
            queryEntityPermission.ColumnSet = new ColumnSet("adx_scope", "adx_contactrelationship");
            queryEntityPermission.Criteria.AddCondition("gsc_recordtype", ConditionOperator.Equal, recordType);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "adx_entitypermission_webrole", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[0].LinkCriteria.AddCondition("adx_webroleid", ConditionOperator.Equal, webRoleId);
            EntityCollection entityPermissionCollection = _service.ServiceContext.RetrieveMultiple(queryEntityPermission);

            if (entityPermissionCollection != null && entityPermissionCollection.Entities.Count > 0)
            {
                return entityPermissionCollection.Entities[0];
            }

            return null;
        }

        public IEnumerable<Entity> FilterSharedEntityScope(IEnumerable<Entity> result)
        {
            Entity entityPermission = GetSharedEntityScope(result);

            if (entityPermission == null)
                return result;

            String scope = entityPermission.FormattedValues["adx_scope"];

            if (scope == "Global")
                return result;

            else if (scope == "Account")
            {
                Guid branchId = Guid.Empty;
                var context = HttpContext.Current;
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;
                if (cookies != null)
                {
                    if (cookies["Branch"] != null)
                    {
                        branchId = new Guid(cookies["Branch"]["branchId"]);
                    }
                }

                foreach (Entity item in result)
                {
                    foreach (var attribute in item.Attributes)
                    {
                        if (attribute.Key == item.LogicalName + "id")
                        {
                            //Check record's BranchId  = user's BranchId
                            QueryExpression accountEntities = new QueryExpression(item.LogicalName);
                            accountEntities.ColumnSet.AddColumns(attribute.Key);
                            accountEntities.Criteria.AddCondition("gsc_branchid", ConditionOperator.Equal, branchId);
                            accountEntities.Criteria.AddCondition(attribute.Key, ConditionOperator.Equal, attribute.Value);

                            EntityCollection accountEntitiesCollection = _service.ServiceContext.RetrieveMultiple(accountEntities);

                            if (accountEntitiesCollection == null || accountEntitiesCollection.Entities.Count == 0)
                            {
                                result = result.Where(d => d.Attributes[attribute.Key].ToString() != attribute.Value.ToString());
                            }
                            break;
                        }
                    }
                }
            }
            else if (scope == "Contact")
            {
                Guid userId = Guid.Empty;
                var context = HttpContext.Current;
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;
                if (cookies != null)
                {
                    if (cookies["Branch"] != null)
                    {
                        userId = new Guid(cookies["Branch"]["userId"]);
                    }
                }

                String contactRelationship = entityPermission.GetAttributeValue<String>("adx_contactrelationship");
               
                foreach (Entity item in result)
                {
                    foreach (var attribute in item.Attributes)
                    {
                        if (attribute.Key == item.LogicalName + "id")
                        {
                            //Check record's BranchId  = user's BranchId
                            QueryExpression accountEntities = new QueryExpression(item.LogicalName);
                            accountEntities.ColumnSet.AddColumns(attribute.Key);
                            accountEntities.Criteria.AddCondition("gsc_recordownerid", ConditionOperator.Equal, userId);
                            accountEntities.Criteria.AddCondition(attribute.Key, ConditionOperator.Equal, attribute.Value);

                            EntityCollection accountEntitiesCollection = _service.ServiceContext.RetrieveMultiple(accountEntities);

                            if (accountEntitiesCollection == null || accountEntitiesCollection.Entities.Count == 0)
                            {
                                result = result.Where(d => d.Attributes[attribute.Key].ToString() != attribute.Value.ToString());
                            }
                            break;
                        }
                    }
                }
            }
            return result;
        }

        private int GetOptionSetId(String entityName, String fieldname, String optionSetName)
        {
            RetrieveAttributeRequest raRequest = new RetrieveAttributeRequest
            {
                EntityLogicalName = entityName,
                LogicalName = fieldname,
                RetrieveAsIfPublished = true
            };
            RetrieveAttributeResponse raResponse = (RetrieveAttributeResponse)_serviceContext.Execute(raRequest);
            PicklistAttributeMetadata paMetadata = (PicklistAttributeMetadata)raResponse.AttributeMetadata;
            OptionMetadata[] optionList = paMetadata.OptionSet.Options.ToArray();
            foreach (OptionMetadata oMD in optionList)
            {
                var a = oMD.Label.LocalizedLabels[0].Label;
                var b = optionSetName;
                if (oMD.Label.LocalizedLabels[0].Label == optionSetName)
                    return oMD.Value.Value;
            }

            return 0;
        }

        private ViewConfiguration GetCustomFetchXml(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            var objectName = queryView.Name;

            if (objectName == "Promo Lookup Portal View")
            {
                _viewConfig = FilterPromo(_viewConfig);
            }

            return _viewConfig;
        }

        private String GetRelatedAttributeId(string filterEntityName, String filterRelationshipName)
        {
            RetrieveRelationshipRequest retrieveOneToManyRequest =
                       new RetrieveRelationshipRequest { Name = filterRelationshipName };
            RetrieveRelationshipResponse retrieveOneToManyResponse =
                (RetrieveRelationshipResponse)_service.ServiceContext.Execute(retrieveOneToManyRequest);

            if (retrieveOneToManyResponse != null)
            {
                return ((Microsoft.Xrm.Sdk.Metadata.OneToManyRelationshipMetadata)(retrieveOneToManyResponse.RelationshipMetadata)).ReferencingAttribute;
            }
            return null;
        }

        public ViewConfiguration SetCustomFetchXml(ViewConfiguration _viewConfig, DateTime? from, DateTime? to, string fieldName)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            Fetch fetch = null;

            if (_viewConfig.FetchXml != null)
                fetch = Fetch.Parse(_viewConfig.FetchXml);
            else
                fetch = Fetch.Parse(queryView.FetchXml);


            Filter filter = new Filter { Type = LogicalOperator.And };

            filter.Conditions = new List<Condition>();

            if (from != null)
            {
                filter.Conditions.Add(new Condition
                {
                    Attribute = fieldName,
                    Operator = ConditionOperator.GreaterEqual,
                    Value = from
                });
            }

            if (to != null)
            {
                filter.Conditions.Add(new Condition
                {
                    Attribute = fieldName,
                    Operator = ConditionOperator.LessThan,
                    Value = to.Value.AddDays(1)
                });
            }

            fetch.Entity.Filters.Add(filter);

            _viewConfig.FetchXml = fetch.ToXml().ToString();

            return _viewConfig;
        }

        public ViewConfiguration CustomFilterViews(ViewConfiguration _viewConfig)
        {
            String[] currentUrl = HttpContext.Current.Request.UrlReferrer.Segments;
            String entityName = currentUrl[2].Replace("/", "");

            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            var objectName = queryView.Name;

            if (objectName == "Insurance Lookup View")
            {
                _viewConfig = FilterInsurance(_viewConfig);
            }

            else if (objectName == "Charges Lookup View")
            {
                _viewConfig = FilterCharges(_viewConfig);
            }

            else if (objectName == "Promo Lookup Portal View")
            {
                _viewConfig = FilterPromo(_viewConfig);
            }

            else if (objectName == "Corporate")
            {
                _viewConfig = FilterAccount(_viewConfig, entityName);
            }

            else if (objectName == "Individual")
            {
                _viewConfig = FilterContact(_viewConfig, entityName);
            }

            else if (objectName == "Accessory Lookup View")
            {
                _viewConfig = FilterAccessory(_viewConfig);
            }

            else if (objectName == "Cab Chassis Lookup View")
            {
                _viewConfig = FilterCabChassis(_viewConfig);
            }

            else if (objectName == "Available Items Portal View")
            {
                _viewConfig = FilterAvailableItems(_viewConfig);
            }

            else if (objectName == "Contact Person Portal View")
            {
                SavedQueryView queryView1 = _viewConfig.GetSavedQueryView(_serviceContext);
                Fetch fetch = Fetch.Parse(queryView1.FetchXml);
            }

            else if (objectName == "Vehicle Lookup - PO Portal View")
            {
                _viewConfig = FilterModelDescriptioninPO(_viewConfig);
            }

            else if (objectName == "VIQI Allocated Vehicle View")
            {
                _viewConfig = FilterAllocatedHistory(_viewConfig);
            }

            else if (objectName == "VIQI Unserved PO View")
            {
                _viewConfig = FilterUnservedPOHistory(_viewConfig);
            }

            else if (objectName == "VIQI Sold Vehicle View")
            {
                _viewConfig = FilterSoldHistory(_viewConfig);
            }
            else if(objectName == "Product Lookup View")
            {
                _viewConfig = FilterProducts(_viewConfig);
            }

            return _viewConfig;
        }

        private ViewConfiguration FilterInsurance(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string vehicleType = string.Empty;
            string vehicleUse = string.Empty;
            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["vehicleType"] != null)
                    {
                        vehicleType = cookies["vehicleType"].Value;
                    }

                    if (cookies["vehicleUse"] != null)
                    {
                        vehicleUse = cookies["vehicleUse"].Value;
                    }
                }
            }

            Fetch fetch = Fetch.Parse(queryView.FetchXml);

            Filter filter = new Filter { Type = LogicalOperator.And };

            filter.Conditions = new List<Condition>();

            if (vehicleType != String.Empty)
            {
                filter.Conditions.Add(new Condition
                {
                    Attribute = "gsc_vehicletypeid",
                    Operator = ConditionOperator.Equal,
                    Value = vehicleType
                });
            }

            if (vehicleUse != String.Empty)
            {
                filter.Conditions.Add(new Condition
                {
                    Attribute = "gsc_vehicleuse",
                    Operator = ConditionOperator.Equal,
                    Value = vehicleUse
                });
            }

            fetch.Entity.Filters.Add(filter);

            _viewConfig.FetchXml = fetch.ToXml().ToString();

            return _viewConfig;
        }

        private ViewConfiguration FilterCharges(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string baseModel = string.Empty;
            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["baseModel"] != null)
                    {
                        baseModel = cookies["baseModel"].Value;
                    }
                }
            }

            if (baseModel != String.Empty)
            {
                string fetch2 = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='gsc_cmn_charges'> 
                    <attribute name='gsc_cmn_chargesid'/> 
                    <attribute name='gsc_chargespn'/> 
                    <filter type='and'>
                        <condition attribute='statecode' operator='eq' value='0' />
                    </filter>
                    <link-entity name='gsc_cmn_chargesitem' from='gsc_chargeid' to='gsc_cmn_chargesid'> 
                       <filter type='and'>
                          <condition attribute='gsc_vehiclebasemodelid' operator='eq' value='{" + baseModel + @"}' /> 
                       </filter> 
                    </link-entity> 
                 </entity> 
               </fetch> ";

                _viewConfig.FetchXml = fetch2;
            }

            return _viewConfig;
        }

        private ViewConfiguration FilterPromo(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string productId = string.Empty;
            var currentUserBranch = string.Empty;
            var context = HttpContext.Current;
            var dateToday = DateTime.Now.ToShortDateString();

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;
                HttpCookie branchCookie = null;

                if (cookies != null)
                {
                    branchCookie = cookies["Branch"];

                    if (branchCookie != null)
                    {
                        currentUserBranch = branchCookie["branchId"];
                    }
                    if (cookies["productId"] != null)
                    {
                        productId = cookies["productId"].Value;
                    }
                }
            }

            if (productId != String.Empty)
            {
                string fetch2 = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='pricelevel'> 
                    <attribute name='name'/> 
                    <attribute name='description'/> 
                    <attribute name='pricelevelid'/> 
                    <filter type='and'>
                        <filter type='and'>
                            <condition attribute='statecode' operator='eq' value='0' />
                            <condition attribute='gsc_promo' operator='eq' value='1' />
                            <condition attribute='begindate' operator='le' value='" + dateToday + @"' />
                            <condition attribute='enddate' operator='ge' value='" + dateToday + @"' />
                        </filter>
                        <filter type='or'>
                            <filter type='and'>
                                <condition attribute='gsc_branchid' operator='eq' value='{"+currentUserBranch+@"}' />
                                <condition attribute='gsc_publishenabled' operator='eq' value='0' />
                            </filter>
                            <filter type='and'>
                            <condition attribute='gsc_publishenabled' operator='eq' value='1' />
                            <condition attribute='gsc_publish' operator='eq' value='1' />
                            </filter>
                        </filter>
                    </filter>
                    <link-entity name='productpricelevel' from='pricelevelid' to='pricelevelid'> 
                       <filter type='and'> 
                          <condition attribute='productid' operator='eq' value='{" + productId + @"}' /> 
                       </filter> 
                    </link-entity> 
                 </entity> 
               </fetch> ";

                _viewConfig.FetchXml = fetch2;
            }

            return _viewConfig;
        }

        private ViewConfiguration FilterAccount(ViewConfiguration _viewConfig, String entityName)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string productId = string.Empty;
            var context = HttpContext.Current;

            string fetch2 = @"
            <fetch version='1.0' distinct='true' mapping='logical'>
                <entity name='account'> 
                <attribute name='name'/> 
                <attribute name='accountid'/> 
                <attribute name='accountnumber'/> 
                <attribute name='primarycontactid'/>
                <attribute name='gsc_customertype'/>
                <attribute name='emailaddress1'/>
                <attribute name='telephone1'/>
                <filter type='and'>
                    <condition attribute='statecode' operator='eq' value='0' />
                    <condition attribute='gsc_recordtype' operator='eq' value='100000003' />
                </filter>
                </entity> 
            </fetch> ";

            String salesOrderFilter = @"
            <fetch version='1.0' distinct='true' mapping='logical'>
                <entity name='account'> 
                <attribute name='name'/> 
                <attribute name='accountid'/> 
                <attribute name='accountnumber'/> 
                <attribute name='primarycontactid'/>
                <attribute name='gsc_customertype'/>
                <attribute name='emailaddress1'/>
                <attribute name='telephone1'/>
                <filter type='and'>
                    <condition attribute='statecode' operator='eq' value='0' />
                    <condition attribute='gsc_recordtype' operator='eq' value='100000003' />
                    <condition attribute='gsc_ispotential' operator='eq' value='0' />
                </filter>
                </entity> 
            </fetch> ";

            if (entityName.Equals("salesorder"))
            {
                _viewConfig.FetchXml = salesOrderFilter;
            }
            else
            {
                _viewConfig.FetchXml = fetch2;
            }

            return _viewConfig;
        }

        private ViewConfiguration FilterContact(ViewConfiguration _viewConfig, String entityName)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string productId = string.Empty;
            var context = HttpContext.Current;

            string fetch2 = @"
            <fetch version='1.0' distinct='true' mapping='logical'>
                <entity name='contact'> 
                <attribute name='fullname'/> 
                <attribute name='contactid'/> 
                <attribute name='gsc_tin'/> 
                <attribute name='mobilephone'/>
                <attribute name='emailaddress1'/>
                <attribute name='gsc_customerid'/>
                <filter type='and'>
                    <condition attribute='statecode' operator='eq' value='0' />
                    <condition attribute='gsc_recordtype' operator='eq' value='100000001' />
                </filter>
                </entity> 
            </fetch> ";

            String salesOrderFilter = @"
            <fetch version='1.0' distinct='true' mapping='logical'>
                <entity name='contact'> 
                <attribute name='fullname'/> 
                <attribute name='contactid'/> 
                <attribute name='gsc_tin'/> 
                <attribute name='mobilephone'/>
                <attribute name='emailaddress1'/>
                <attribute name='gsc_customerid'/>
                <filter type='and'>
                    <condition attribute='statecode' operator='eq' value='0' />
                    <condition attribute='gsc_recordtype' operator='eq' value='100000001' />
                    <condition attribute='gsc_ispotential' operator='eq' value='0' />
                </filter>
                </entity> 
            </fetch> ";

            if (entityName.Equals("salesorder"))
            {
                _viewConfig.FetchXml = salesOrderFilter;
            }
            else
            {
                _viewConfig.FetchXml = fetch2;
            }

            return _viewConfig;
        }

        private ViewConfiguration FilterAccessory(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string productId = string.Empty;
            var context = HttpContext.Current;

            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='product'> 
                    <attribute name='name'/> 
                    <attribute name='productnumber'/> 
                    <attribute name='productid'/> 
                    <filter type='and'>
                        <condition attribute='statecode' operator='eq' value='0' />
                        <condition attribute='gsc_producttype' operator='eq' value='100000001' />
                    </filter>
                    <link-entity name='gsc_cmn_classmaintenance' from='gsc_cmn_classmaintenanceid' to='gsc_classmaintenanceid'> 
                       <filter type='and'> 
                          <condition attribute='gsc_classmaintenancepn' operator='like' value='%Accessory%' /> 
                       </filter> 
                    </link-entity> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        private ViewConfiguration FilterCabChassis(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);
            string productId = string.Empty;
            var context = HttpContext.Current;

            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='product'> 
                    <attribute name='name'/> 
                    <attribute name='productnumber'/> 
                    <attribute name='productid'/> 
                    <filter type='and'>
                        <condition attribute='statecode' operator='eq' value='0' />
                        <condition attribute='gsc_producttype' operator='eq' value='100000001' />
                    </filter>
                    <link-entity name='gsc_cmn_classmaintenance' from='gsc_cmn_classmaintenanceid' to='gsc_classmaintenanceid'> 
                       <filter type='and'> 
                          <condition attribute='gsc_classmaintenancepn' operator='like' value='%Cab%' /> 
                          <condition attribute='gsc_classmaintenancepn' operator='like' value='%Chassis%' /> 
                       </filter> 
                    </link-entity> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        private ViewConfiguration FilterAvailableItems(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            var fetchXml = queryView.FetchXml;

            string productId = "";
            string siteId = string.Empty;
            string colorId = string.Empty;
            string csNoCriteria = string.Empty;
            string csNoValue = string.Empty;
            string engineNoCriteria = string.Empty;
            string engineNoValue = string.Empty;
            string VINCriteria = string.Empty;
            string VINValue = string.Empty;
            string productionNoCriteria = string.Empty;
            string productionNoValue = string.Empty;

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["productId"] != null)
                    {
                        productId = cookies["productId"].Value;
                    }
                    if (cookies["siteId"] != null)
                    {
                        siteId = cookies["siteId"].Value;
                    }
                    if (cookies["colorId"] != null)
                    {
                        colorId = cookies["colorId"].Value;
                    }
                    if (cookies["csNoCriteria"] != null)
                    {
                        csNoCriteria = cookies["csNoCriteria"].Value;
                    }
                    if (cookies["csNoValue"] != null)
                    {
                        csNoValue = cookies["csNoValue"].Value;
                    }
                    if (cookies["engineNoCriteria"] != null)
                    {
                        engineNoCriteria = cookies["engineNoCriteria"].Value;
                    }
                    if (cookies["engineNoValue"] != null)
                    {
                        engineNoValue = cookies["engineNoValue"].Value;
                    }
                    if (cookies["VINCriteria"] != null)
                    {
                        VINCriteria = cookies["VINCriteria"].Value;
                    }
                    if (cookies["productionNoCriteria"] != null)
                    {
                        productionNoCriteria = cookies["productionNoCriteria"].Value;
                    }
                    if (cookies["productionNoValue"] != null)
                    {
                        productionNoValue = cookies["productionNoValue"].Value;
                    }
                }
            }

            if (productId != "")
            {
                string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='gsc_iv_inventory'> 
                    <attribute name='gsc_iv_inventoryid'/> 
                    <attribute name='gsc_vin'/> 
                    <attribute name='gsc_productionno'/> 
                    <attribute name='gsc_optioncode'/> 
                    <attribute name='gsc_modelcode'/> 
                    <attribute name='gsc_engineno'/> 
                    <attribute name='gsc_csno'/> 
                    <attribute name='gsc_color'/> 
                    <attribute name='gsc_modelyear'/> 
                    <attribute name='gsc_siteid'/> 
                    <attribute name='gsc_warrantybookletno'/> 
                    <attribute name='gsc_mmpcinvoicedate'/> 
                    <filter type='and'>
                        <condition attribute='statecode' operator='eq' value='0' />
                        <condition attribute='gsc_status' operator='eq' value='100000000' />";

                fetch = FilterAvailableItemsByAttributes(csNoCriteria, csNoValue, "gsc_csno", fetch);
                fetch = FilterAvailableItemsByAttributes(engineNoCriteria, engineNoValue, "gsc_engineno", fetch);
                fetch = FilterAvailableItemsByAttributes(VINCriteria, VINValue, "gsc_vin", fetch);
                fetch = FilterAvailableItemsByAttributes(productionNoCriteria, productionNoValue, "gsc_productionno", fetch);

                fetch = fetch + @" </filter>
                    <link-entity name='gsc_iv_productquantity' from='gsc_iv_productquantityid' to='gsc_productquantityid'> 
                       <filter type='and'>
                          <condition attribute='gsc_productid' operator='eq' value='{" + productId + @"}' /> ";

                if (siteId != String.Empty)
                {
                    fetch = fetch + "<condition attribute='gsc_siteid' operator='eq' value='{" + siteId + @"}' /> ";
                }
                if (colorId != String.Empty)
                {
                    fetch = fetch + " <condition attribute='gsc_vehiclecolorid' operator='eq' value='{" + colorId + @"}' /> ";
                }

                fetch = fetch + @"</filter> 
                    </link-entity> 
                 </entity> 
               </fetch> ";

                _viewConfig.FetchXml = fetch;
            }

            return _viewConfig;

        }

        private string FilterAvailableItemsByAttributes(String criteria, String value, String attribute, String fetch)
        {
            if (criteria == "100000000" && value != String.Empty) //begins with
            {
                fetch = fetch + "<condition attribute='" + attribute + @"' operator='like' value='" + value + @"%' />";
            }
            else if (criteria == "100000001" && value != String.Empty) //ends with
            {
                fetch = fetch + "<condition attribute='" + attribute + @"' operator='like' value='%" + value + @"' />";
            }
            else
            {
                if (value != String.Empty) //exact value
                {
                    fetch = fetch + "<condition attribute='" + attribute + @"' operator='eq' value='" + value + @"' />";
                }
            }
            return fetch;
        }

        private ViewConfiguration FilterInvoices(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            var fetchXml = queryView.FetchXml;

            string dateFrom = "";
            string dateTo = "";

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["dateFrom"] != null)
                    {
                        dateFrom = cookies["dateFrom"].Value;
                    }
                    if (cookies["dateTo"] != null)
                    {
                        dateTo = cookies["dateTo"].Value;
                    }
                }
            }

            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='invoice'> 
                    <attribute name='name'/> 
                    <attribute name='customerid'/> 
                    <attribute name='gsc_salesinvoicestatus'/> 
                    <attribute name='gsc_customer'/> 
                    <attribute name='gsc_invoicedate'/> 
                    <attribute name='salesorderid'/> 
                    <attribute name='gsc_productid'/> 
                    <attribute name='gsc_vehiclecolorid1'/> 
                    <attribute name='invoiceid'/> 
                    <filter type='and'>";

            if (dateFrom != "")
            {
                dateFrom = String.Format("{0:d}", dateFrom);
                dateFrom = dateFrom.Remove(10, 22);
                fetch = fetch + @"<condition attribute='createdon' operator='ge' value='" + dateFrom + @"' />";
            }

            if (dateTo != "")
            {
                dateTo = String.Format("{0:d}", dateTo);
                dateTo = dateTo.Remove(10, 22);
                fetch = fetch + @"<condition attribute='createdon' operator='le' value='" + dateTo + @"' />";
            }

            fetch = fetch + @"</filter> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        private ViewConfiguration FilterModelDescriptioninPO(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            var fetchXml = queryView.FetchXml;

            string parentProductId = "";
            string baseModelId = "";

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["parentProductId"] != null)
                    {
                        parentProductId = cookies["parentProductId"].Value;
                    }

                    if (cookies["baseModelId"] != null)
                    {
                        baseModelId = cookies["baseModelId"].Value;
                    }
                }
            }

            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='product'> 
                    <attribute name='name'/> 
                    <attribute name='gsc_vehicletypeid'/> 
                    <attribute name='gsc_vehiclemakeid'/> 
                    <attribute name='productnumber'/> 
                    <attribute name='productid'/> 
                    <filter type='and'>
                        <condition attribute='gsc_producttype' operator='eq' value='100000000' />
                        <condition attribute='statecode' operator='eq' value='0' />";

                    if (parentProductId != "")
                    {
                        fetch = fetch + @"<condition attribute='parentproductid' operator='eq' value='" + parentProductId + @"' />";
                    } 
                    if (baseModelId != "")
                    {
                        fetch = fetch + @"<condition attribute='gsc_vehiclemodelid' operator='eq' value='" + baseModelId + @"' />";
                    }

            fetch = fetch + @"</filter> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        private ViewConfiguration FilterAllocatedHistory(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            var fetchXml = queryView.FetchXml;

            string dateFrom = "";
            string dateTo = "";
            string productQuantityId = "";

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["AllocatedDateFrom"] != null)
                    {
                        dateFrom = cookies["AllocatedDateFrom"].Value;
                    }
                    if (cookies["AllocatedDateTo"] != null)
                    {
                        dateTo = cookies["AllocatedDateTo"].Value;
                    }
                    if (cookies["ProductQuantityId"] != null)
                    {
                        productQuantityId = cookies["ProductQuantityId"].Value;
                    }
                }
            } 
            
            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='gsc_iv_inventoryhistory'> 
                    <attribute name='gsc_vin'/> 
                    <attribute name='gsc_transactiontype'/> 
                    <attribute name='gsc_transactionstatus'/> 
                    <attribute name='gsc_transactiondate'/> 
                    <attribute name='gsc_siteid'/> 
                    <attribute name='gsc_optioncode'/> 
                    <attribute name='gsc_productid'/> 
                    <attribute name='gsc_modelcode'/> 
                    <attribute name='gsc_engineno'/> 
                    <attribute name='gsc_csno'/> 
                    <attribute name='gsc_vehiclebasemodelid'/> 
                    <attribute name='gsc_allocationage'/> 
                    <attribute name='gsc_productionno'/> 
                    <attribute name='gsc_modelyear'/> 
                    <attribute name='gsc_vehiclecolorid'/> 
                    <attribute name='gsc_transactionnumber'/> 
                    <attribute name='gsc_destinationsiteid'/> 
                    <attribute name='gsc_iv_inventoryhistoryid'/> 
                    <order attribute='gsc_vehiclebasemodelid' descending='false'/> 
                    <filter type='and'>
                        <condition attribute='gsc_latest' operator='eq' value='1'/>
                        <condition attribute='gsc_quantitytype' operator='eq' value='100000001'/>
                        <condition attribute='gsc_productquantityid' operator='eq' value='" + productQuantityId + "'/>";

            if (dateFrom != "")
            {
                dateFrom = String.Format("{0:d}", dateFrom);
                dateFrom = dateFrom.Remove(10);
                fetch = fetch + @"<condition attribute='gsc_transactiondate' operator='on-or-after' value='" + dateFrom + @"' />";
            }

            if (dateTo != "")
            {
                dateTo = String.Format("{0:d}", dateTo);
                dateTo = dateTo.Remove(10);
                fetch = fetch + @"<condition attribute='gsc_transactiondate' operator='on-or-before' value='" + dateTo + @"' />";
            }

            fetch = fetch + @"</filter> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        private ViewConfiguration FilterUnservedPOHistory(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            var fetchXml = queryView.FetchXml;

            string dateFrom = "";
            string dateTo = "";
            string productQuantityId = "";

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["OrderDateFrom"] != null)
                    {
                        dateFrom = cookies["OrderDateFrom"].Value;
                    }
                    if (cookies["OrderDateTo"] != null)
                    {
                        dateTo = cookies["OrderDateTo"].Value;
                    }
                    if (cookies["ProductQuantityId"] != null)
                    {
                        productQuantityId = cookies["ProductQuantityId"].Value;
                    }
                }
            }

            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='gsc_iv_inventoryhistory'> 
                    <attribute name='gsc_transactiontype'/> 
                    <attribute name='gsc_transactionstatus'/> 
                    <attribute name='gsc_transactiondate'/> 
                    <attribute name='gsc_transactionnumber'/> 
                    <attribute name='gsc_optioncode'/> 
                    <attribute name='gsc_modelyear'/> 
                    <attribute name='gsc_modelcode'/> 
                    <attribute name='gsc_siteid'/> 
                    <attribute name='gsc_productid'/> 
                    <attribute name='gsc_vehiclecolorid'/> 
                    <attribute name='gsc_vehiclebasemodelid'/> 
                    <attribute name='gsc_iv_inventoryhistoryid'/> 
                    <order attribute='gsc_modelcode' descending='false'/> 
                    <filter type='and'>
                        <condition attribute='gsc_latest' operator='eq' value='1'/>
                        <condition attribute='gsc_quantitytype' operator='eq' value='100000000'/>
                        <condition attribute='gsc_productquantityid' operator='eq' value='" + productQuantityId + "'/>";

            if (dateFrom != "")
            {
                dateFrom = String.Format("{0:d}", dateFrom);
                dateFrom = dateFrom.Remove(10);
                fetch = fetch + @"<condition attribute='gsc_transactiondate' operator='on-or-after' value='" + dateFrom + @"' />";
            }

            if (dateTo != "")
            {
                dateTo = String.Format("{0:d}", dateTo);
                dateTo = dateTo.Remove(10);
                fetch = fetch + @"<condition attribute='gsc_transactiondate' operator='on-or-before' value='" + dateTo + @"' />";
            }

            fetch = fetch + @"</filter> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        private ViewConfiguration FilterSoldHistory(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            var fetchXml = queryView.FetchXml;

            string dateFrom = "";
            string dateTo = "";
            string productQuantityId = "";

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["SoldDateFrom"] != null)
                    {
                        dateFrom = cookies["SoldDateFrom"].Value;
                    }
                    if (cookies["SoldDateTo"] != null)
                    {
                        dateTo = cookies["SoldDateTo"].Value;
                    }
                    if (cookies["ProductQuantityId"] != null)
                    {
                        productQuantityId = cookies["ProductQuantityId"].Value;
                    }
                }
            }

            string fetch = @"
               <fetch version='1.0' distinct='true' mapping='logical'>
                 <entity name='gsc_iv_inventoryhistory'> 
                    <attribute name='gsc_vsidate'/> 
                    <attribute name='gsc_vin'/> 
                    <attribute name='gsc_siteid'/> 
                    <attribute name='gsc_releaseddate'/> 
                    <attribute name='gsc_productionno'/> 
                    <attribute name='gsc_optioncode'/> 
                    <attribute name='gsc_modelyear'/> 
                    <attribute name='gsc_productid'/> 
                    <attribute name='gsc_modelcode'/> 
                    <attribute name='gsc_engineno'/> 
                    <attribute name='gsc_customername'/> 
                    <attribute name='gsc_csno'/> 
                    <attribute name='gsc_vehiclecolorid'/> 
                    <attribute name='gsc_transactionnumber'/> 
                    <attribute name='gsc_iv_inventoryhistoryid'/> 
                    <order attribute='gsc_customername' descending='false'/> 
                    <filter type='and'>
                        <condition attribute='gsc_latest' operator='eq' value='1'/>
                        <condition attribute='gsc_quantitytype' operator='eq' value='100000002'/>
                        <condition attribute='gsc_productquantityid' operator='eq' value='" + productQuantityId + "'/>";

            if (dateFrom != "")
            {
                dateFrom = String.Format("{0:d}", dateFrom);
                dateFrom = dateFrom.Remove(10);
                fetch = fetch + @"<condition attribute='gsc_vsidate' operator='on-or-after' value='" + dateFrom + @"' />";
            }

            if (dateTo != "")
            {
                dateTo = String.Format("{0:d}", dateTo);
                dateTo = dateTo.Remove(10);
                fetch = fetch + @"<condition attribute='gsc_vsidate' operator='on-or-before' value='" + dateTo + @"' />";
            }

            fetch = fetch + @"</filter> 
                 </entity> 
               </fetch> ";

            _viewConfig.FetchXml = fetch;

            return _viewConfig;
        }

        public ViewConfiguration FilterProducts(ViewConfiguration _viewConfig)
        {
            SavedQueryView queryView = _viewConfig.GetSavedQueryView(_serviceContext);

            string priceListType = "";

            var context = HttpContext.Current;

            if (context != null)
            {
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;

                if (cookies != null)
                {
                    if (cookies["PriceListType"] != null)
                    {
                        priceListType = cookies["PriceListType"].Value;
                    }
                }
            }

            Fetch fetch = Fetch.Parse(queryView.FetchXml);

            Filter filter = new Filter { Type = LogicalOperator.And };

            filter.Conditions = new List<Condition>();

            if (priceListType != "")
            {
                if (priceListType.Contains("Item"))
                    priceListType = "Item";

                var priceListTypeValue = GetOptionSetId(_viewConfig.EntityName, "gsc_producttype", priceListType);
                filter.Conditions.Add(new Condition
                {
                    Attribute = "gsc_producttype",
                    Operator = ConditionOperator.Equal,
                    Value = priceListTypeValue
                });
            }

            fetch.Entity.Filters.Add(filter);

            _viewConfig.FetchXml = fetch.ToXml().ToString();

            return _viewConfig;
        }

    }

}