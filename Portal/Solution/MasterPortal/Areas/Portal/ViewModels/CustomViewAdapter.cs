using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Adxstudio.Xrm.Web.UI;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk;
using Adxstudio.Xrm.Services.Query;
using Microsoft.Xrm.Sdk.Client;
using Adxstudio.Xrm.Web.UI.EntityList.OData;
using Adxstudio.Xrm.Web.UI.CrmEntityListView;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Messages;
using Site.Areas.DMS_Api;
using Site.Areas.DMSApi;
using Microsoft.Xrm.Client.Services;
using Adxstudio.Xrm.Security;
using Site.Areas.Portal.ViewModels;

namespace Site
{
    public class CustomViewAdapter : ViewDataAdapter
    {
        private OrganizationServiceContext _serviceContext = null;
        private IXrmConnection _service = new XrmConnection();
        private readonly ViewConfiguration _configuration;
        private readonly Adxstudio.Xrm.Cms.IDataAdapterDependencies _dependencies;
        private bool ApplyRecordLevelFilters { get; set; }
        private bool ApplyRelatedRecordFilter { get; set; }
        private string FilterRelationshipName { get; set; }
        private string FilterEntityName { get; set; }
        private string FilterAttributeName { get; set; }
        private Guid FilterValue { get; set; }

        public CustomViewAdapter(ViewConfiguration configuration, Adxstudio.Xrm.Cms.IDataAdapterDependencies dependencies, int page = 1, string search = null, string order = null, string filter = null, string metaFilter = null, bool applyRecordLevelFilters = true, EntityMetadata entityMetadata = null)
            : base(configuration, dependencies, page, search, order, filter, metaFilter, applyRecordLevelFilters, entityMetadata)
        {
            _configuration = configuration;
            _dependencies = dependencies;
            _serviceContext = dependencies.GetServiceContext();
            this.ApplyRecordLevelFilters = applyRecordLevelFilters;
        }

        public CustomViewAdapter(ViewConfiguration configuration, Adxstudio.Xrm.Cms.IDataAdapterDependencies dependencies, string filterRelationshipName, string filterEntityName, string filterAttributeName, Guid filterValue, int page = 1, string search = null, string order = null, string filter = null, string metaFilter = null, bool applyRecordLevelFilters = true, EntityMetadata entityMetadata = null)
            : base(configuration, dependencies, filterRelationshipName, filterEntityName, filterAttributeName, filterValue, page, search, order, filter, metaFilter, applyRecordLevelFilters, entityMetadata)
        {
            _configuration = configuration;
            _serviceContext = dependencies.GetServiceContext();
            _dependencies = dependencies;

            this.ApplyRecordLevelFilters = applyRecordLevelFilters;
            this.ApplyRelatedRecordFilter = !string.IsNullOrWhiteSpace(filterRelationshipName) && !string.IsNullOrWhiteSpace(filterEntityName) && filterValue != Guid.Empty;
            this.FilterRelationshipName = filterRelationshipName;
            this.FilterEntityName = filterEntityName;
            this.FilterAttributeName = filterAttributeName;
            this.FilterValue = filterValue;
        }

        public ViewDataAdapter.FetchResult CustomFetchEntities(ViewConfiguration viewConfiguration)
        {
            CustomFetchXml converter = new CustomFetchXml(_serviceContext, new XrmConnection());
            viewConfiguration = converter.CustomFilterViews(viewConfiguration);

            OrganizationServiceContext serviceContext = this.Dependencies.GetServiceContext();
            Fetch fetch = FilterSharedEntityScope(viewConfiguration);
            this.AddSelectableFilterToFetchEntity(fetch.Entity, this.Configuration, this.Filter);
            this.AddWebsiteFilterToFetchEntity(fetch.Entity, this.Configuration);
            this.AddOrderToFetch(fetch.Entity, this.Order);
            Fetch fetch2 = fetch;
            bool? dataPagerEnabled = this.Configuration.DataPagerEnabled;
            int num1 = dataPagerEnabled.HasValue ? (dataPagerEnabled.GetValueOrDefault() ? 1 : 0) : 1;
            string pagingCookie = fetch.PagingCookie;
            int page = this.Page;
            int pageSize = this.Configuration.PageSize;
            int num2 = 1;
            this.AddPaginationToFetch(fetch2, num1 != 0, pagingCookie, page, pageSize, num2 != 0);
            this.AddSearchFilterToFetchEntity(fetch.Entity, this.Configuration, this.Search, (IEnumerable<string>)null);
            this.AddMetadataFilterToFetch(fetch, this.Configuration, base.MetaFilter);
            if (this.ApplyRecordLevelFilters)
                this.AddRecordLevelFiltersToFetch(fetch, this.Configuration, CrmEntityPermissionRight.Read);
            else
                this.TryAssert(fetch, this.Configuration, CrmEntityPermissionRight.Read);
            if (this.ApplyRelatedRecordFilter)
                this.AddRelatedRecordFilterToFetch(fetch, this.FilterRelationshipName, this.FilterEntityName, this.FilterValue);
            if (((IEnumerable<AttributeMetadata>)this.EntityMetadata.Attributes).Any<AttributeMetadata>((Func<AttributeMetadata, bool>)(a => a.LogicalName == "statecode")))
            {
                ViewDataAdapter.AddAttributesToFetchEntity(fetch.Entity, (IEnumerable<string>)new List<string>()
            {
                "statecode"
            });
                if (((IEnumerable<AttributeMetadata>)this.EntityMetadata.Attributes).Any<AttributeMetadata>((Func<AttributeMetadata, bool>)(a => a.LogicalName == "statuscode")))
                    ViewDataAdapter.AddAttributesToFetchEntity(fetch.Entity, (IEnumerable<string>)new List<string>()
                {
                "statuscode"
                });
            }

            ViewDataAdapter.FetchResult hey = base.FetchEntities(_dependencies.GetServiceContext(), fetch);

            return hey;
        }

        private EntityCollection GetSharedEntityScope(Fetch fetch)
        {
            var typeField = "";

            if (_configuration.EntityName == "account" || _configuration.EntityName == "contact")
                typeField = "gsc_recordtype";
            else if (_configuration.EntityName == "product")
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

            EntityCollection recordTypeCollection = _service.ServiceContext.RetrieveMultiple(new FetchExpression(fetch.ToXml().ToString()));

            /*   QueryExpression queryRecordType = new QueryExpression(configuration.EntityName);
               queryRecordType.ColumnSet = new ColumnSet(typeField);
               queryRecordType.Criteria.AddCondition(result.First().LogicalName.ToString() + "id", ConditionOperator.Equal, result.First().Id);
               EntityCollection recordTypeCollection = _service.ServiceContext.RetrieveMultiple(queryRecordType);*/

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
            queryEntityPermission.ColumnSet = new ColumnSet(true);
            queryEntityPermission.Criteria.AddCondition("gsc_recordtype", ConditionOperator.Equal, recordType);
            queryEntityPermission.AddOrder("adx_scope", OrderType.Descending);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "adx_entitypermission_webrole", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[0].LinkCriteria.AddCondition("adx_webroleid", ConditionOperator.Equal, webRoleId);
            EntityCollection entityPermissionCollection = _service.ServiceContext.RetrieveMultiple(queryEntityPermission);

            if (entityPermissionCollection != null && entityPermissionCollection.Entities.Count > 0)
            {
                return entityPermissionCollection;
            }

            return null;
        }

        private String GetReadAppendScope(EntityCollection entityPermissionCollection, String fieldName)
        {
            var scopeString = "";
            foreach (Entity entityPermission in entityPermissionCollection.Entities)
            {
                var scope = entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;

                if (scope == 756150000 && entityPermission.GetAttributeValue<bool>(fieldName) == true)
                {
                    return entityPermission.FormattedValues["adx_scope"];
                }

                if (scope == 756150001 && entityPermission.GetAttributeValue<bool>(fieldName) == true)
                {
                    scopeString = entityPermission.FormattedValues["adx_scope"];
                }

                else if (scope == 756150002 && entityPermission.GetAttributeValue<bool>(fieldName) == true)
                {
                    scopeString = entityPermission.FormattedValues["adx_scope"];
                }
            }

            return scopeString;
        }

        private Fetch FilterSharedEntityScope(ViewConfiguration viewConfiguration)
        {
            SavedQueryView queryView = viewConfiguration.GetSavedQueryView(_serviceContext);
            var objectName = queryView.Name;

            Fetch fetch;

            if (viewConfiguration.FetchXml != null)
                fetch = Fetch.Parse(viewConfiguration.FetchXml);
            else
                fetch = Fetch.Parse(queryView.FetchXml);

            EntityCollection entityPermission = GetSharedEntityScope(fetch);

            if (entityPermission == null)
                return fetch;

            String scope = "";
            if (objectName.Equals("Individual") || objectName.Equals("Corporate"))
                scope = GetReadAppendScope(entityPermission, "adx_append");
            else
                scope = GetReadAppendScope(entityPermission, "adx_read");

            if (scope == "Global")
                return fetch;

            else if (scope == "Account")
            {
                Guid branchId = Guid.Empty;
                Guid userId = Guid.Empty;
                String webRole = String.Empty;
                var context = HttpContext.Current;
                var request = context.Request.RequestContext;
                var cookies = request.HttpContext.Request.Cookies;
                if (cookies != null)
                {
                    if (cookies["Branch"] != null)
                    {
                        branchId = new Guid(cookies["Branch"]["branchId"]);
                        userId = new Guid(cookies["Branch"]["userId"]);
                        webRole = cookies["Branch"]["webRoleName"];
                    }
                }

                if (webRole.Contains("Sales Supervisor") && (objectName.Equals("Individual") || objectName.Equals("Corporate")))
                {

                    Link relatedEntity = new Link();
                    relatedEntity.Alias = "Related";
                    relatedEntity.FromAttribute = "contactid";
                    relatedEntity.Name = "contact";
                    relatedEntity.ToAttribute = "gsc_salesexecutiveid";
                    fetch.Entity.Links.Add(relatedEntity);

                    Filter filter = new Filter { Type = LogicalOperator.Or };
                    filter.Conditions = new List<Condition>();

                    filter.Conditions.Add(new Condition
                    {
                        Attribute = "gsc_salesexecutiveid",
                        Operator = ConditionOperator.Equal,
                        Value = userId
                    });

                    filter.Conditions.Add(new Condition
                    {
                        EntityName = "Related",
                        Attribute = "gsc_reportsto",
                        Operator = ConditionOperator.Equal,
                        Value = userId
                    });

                    fetch.Entity.Filters.Add(filter);
                }
                else
                {
                    Filter filter = new Filter { Type = LogicalOperator.And };
                    filter.Conditions = new List<Condition>();
                    filter.Conditions.Add(new Condition
                    {
                        Attribute = "gsc_branchid",
                        Operator = ConditionOperator.Equal,
                        Value = branchId
                    });

                    fetch.Entity.Filters.Add(filter);
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

                Filter filter = new Filter { Type = LogicalOperator.And };

                filter.Conditions = new List<Condition>();

                if (objectName.Equals("Individual") || objectName.Equals("Corporate"))
                {
                    filter.Conditions.Add(new Condition
                    {
                        Attribute = "gsc_salesexecutiveid",
                        Operator = ConditionOperator.Equal,
                        Value = userId
                    });
                }
                else
                {
                    filter.Conditions.Add(new Condition
                    {
                        Attribute = "gsc_recordownerid",
                        Operator = ConditionOperator.Equal,
                        Value = userId
                    });
                }

                fetch.Entity.Filters.Add(filter);

            }
            return fetch;
        }

        private int GetOptionSetId(String entityName, String fieldname, String optionSetName)
        {
            RetrieveAttributeRequest raRequest = new RetrieveAttributeRequest
            {
                EntityLogicalName = entityName,
                LogicalName = fieldname,
                RetrieveAsIfPublished = true
            };
            RetrieveAttributeResponse raResponse = (RetrieveAttributeResponse)_dependencies.GetServiceContext().Execute(raRequest);
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
    }
}