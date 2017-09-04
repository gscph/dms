using Microsoft.Xrm.Client;
using Microsoft.Xrm.Client.Services;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System.Xml;
using Site.Areas.DMS_Api;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.IO;
using Microsoft.Crm.Sdk.Messages;
using Site.Areas.DMS_Api.XrmWebService;
using Microsoft.Xrm.Portal.Configuration;

namespace Site.Areas.DMSApi
{
    public class XrmServiceContext
    {
        private readonly IXrmConnection _service;

        public XrmServiceContext(IXrmConnection service)
        {
            _service = service;
        }

        public string GetEntityDisplayName(string logicalName)
        {
            EntityMetadata entityData = XrmCommonHelper.GetEntityMetaData(_service, logicalName);

            return entityData.DisplayName.UserLocalizedLabel.Label ?? "empty";
        }

        public string GetEntityPluralName(string logicalName)
        {
            EntityMetadata entityData = XrmCommonHelper.GetEntityMetaData(_service, logicalName);

            return entityData.DisplayCollectionName.UserLocalizedLabel.Label ?? "empty";
        }

        public EntityForm GetEntityPrimaryFieldValue(string logicalName, Guid Id)
        {
            List<string> fields = new List<string>();
            EntityForm result = new EntityForm();
            result.EntityDisplayName = this.GetEntityDisplayName(logicalName);
            result.PrimaryFieldVal = "New ";

            if (Id != Guid.Empty)
            {
                Entity currentEntity = _service.ServiceContext.Retrieve(logicalName, Id, new ColumnSet(true));
                fields = this.PushFieldAttributes(currentEntity);
                result.PrimaryField = fields;
                result.PrimaryFieldVal = this.TryGetFieldAttributes(currentEntity, fields) ?? String.Empty;
            }
            return result;
        }

        public List<EditableGridSaveResponse> UpdateRecords(IEnumerable<EditableGridModel> records)
        {
            // Execute Multiple Request is suggested in this context. - Rex
            List<EditableGridSaveResponse> recordsCreated = new List<EditableGridSaveResponse>();
            foreach (var item in records)
            {
                if (item.Id != Guid.Empty)
                {
                    Entity entity = _service.ServiceContext.Retrieve(item.Entity, item.Id, new ColumnSet(item.Entity + "id"));

                    //entity.GetAttributeValue
                    foreach (var list in item.Records)
                    {
                        entity[list.Attr] = XrmCommonHelper.ConvertField(new ClientEntity
                        {
                            type = list.Type,
                            Value = list.Value,
                            attr = list.Attr,
                            entity = list.Reference
                        });
                    }

                    _service.ServiceContext.Update(entity);
                    continue;
                }
                Entity newEntity = new Entity(item.Entity);

                foreach (var list in item.Records)
                {
                    newEntity[list.Attr] = XrmCommonHelper.ConvertField(new ClientEntity
                    {
                        type = list.Type,
                        Value = list.Value,
                        attr = list.Attr
                    });
                }
                Guid newRecord = _service.ServiceContext.Create(newEntity);
                recordsCreated.Add(new EditableGridSaveResponse
                {
                    Id = newRecord,
                    RowIndex = item.HotRowIndex
                });

                //_service.ServiceContext.Associate
            }

            return recordsCreated;
        }

        public void DeleteRecords(IEnumerable<EditableGridModel> records)
        {
            //foreach (var item in records)
            //{
            //     _service.ServiceContext.Delete(item.Entity, item.Id);
            //}

            ExecuteMultipleRequest requestWithoutResults = XrmMultipleRequestHelper.CreateRequest(false, true);




            foreach (var item in records)
            {
                DeleteRequest deleteRequest = new DeleteRequest();
                deleteRequest.Target = new EntityReference(item.Entity, item.Id);
                requestWithoutResults.Requests.Add(deleteRequest);
            }

            try
            {
                ExecuteMultipleResponse responseWithResults = (ExecuteMultipleResponse)_service.ServiceContext.Execute(requestWithoutResults);
                foreach (var responseItem in responseWithResults.Responses)
                {
                    // A valid response.
                    //if (responseItem.Response != null)
                    //    throw new Exception(responseItem.Response.ToString());

                    // An error has occurred.
                    if (responseItem.Fault != null)
                        throw new Exception(responseItem.Fault.Message);
                }
            }

            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public void UpdateEntityState(IEnumerable<EditableGridModel> records)
        {
            ExecuteMultipleRequest requestWithoutResults = XrmMultipleRequestHelper.CreateRequest();


            foreach (EditableGridModel item in records)
            {
                SetStateRequest request = new SetStateRequest
                {
                    EntityMoniker = new EntityReference(item.Entity, item.Id),
                    // Sets the record to disabled.
                    State = new OptionSetValue(0),
                    // Required by request but always valued at -1 in this context.
                    Status = new OptionSetValue(-1)
                };

                if (item.Records.FirstOrDefault().Value == "disable")
                {
                    request.State = new OptionSetValue(1);
                }


                request.Status = new OptionSetValue(-1);

                _service.ServiceContext.Execute(request);
            }
        }

        private List<string> PushFieldAttributes(Entity entity)
        {
            List<string> result = new List<string>();
            // checks all these fields if it exists
            // gsc_entityname + pn
            result.Add(entity.LogicalName + "pn");
            // gsc_entityname + _id
            result.Add(entity.LogicalName + "_id");
            result.Add("gsc_name");
            // crm standards
            result.Add("name");
            result.Add("fullname");

            if (entity.LogicalName == "gsc_iv_vehiclebasemodel")
                result.Add("gsc_basemodelpn");

            if (entity.LogicalName.Length > 9)
            {
                result.Add(entity.LogicalName.Remove(4, 3) + "pn");
                result.Add(entity.LogicalName.Remove(3, 4));
                result.Add(entity.LogicalName.Remove(3, 4) + "pn");
            }

            return result;
        }
        private string TryGetFieldAttributes(Entity entity, List<string> attributes)
        {
            string value = "";

            foreach (string item in attributes)
            {
                value = entity.GetAttributeValue<string>(item);

                if (value != null)
                {
                    return value;
                }
            }

            return value;
        }

        internal void UpdateAccountImage(Guid Id, byte[] data)
        {
            Entity account = _service.ServiceContext.Retrieve("account", Id, new ColumnSet("accountid"));
            account["entityimage"] = data;

            _service.ServiceContext.Update(account);
        }

        //Created By: Raphael Herrera, Created On: 10-13-2016
        //Checks if Business unit of record owner is root
        public bool isRootBusinessUnit(Entity entity)
        {
            bool isRoot = false;
            var ownerId = entity.Contains("ownerid") ? entity.GetAttributeValue<EntityReference>("ownerid").Id : Guid.Empty;

            Entity systemUserEntity = _service.ServiceContext.Retrieve("systemuser", ownerId, new ColumnSet("businessunitid"));

            var businessUnitId = systemUserEntity.Contains("businessunitid") ? systemUserEntity.GetAttributeValue<EntityReference>("businessunitid").Id
                : Guid.Empty;

            if (businessUnitId != Guid.Empty)
            {
                Entity businessUnitEntity = _service.ServiceContext.Retrieve("businessunit", businessUnitId, new ColumnSet("parentbusinessunitid"));

                isRoot = businessUnitEntity.Contains("parentbusinessunitid") ? false : true;
            }

            return isRoot;
        }

        public Privileges GetEntityPermission(Guid webRoleId, Guid webPageId, Guid recordOwnerId, Guid OwningBranchId, Guid salesExecutiveId)
        {
            //Retrieve Entity Permission
            QueryExpression queryEntityPermission = new QueryExpression("adx_entitypermission");
            queryEntityPermission.ColumnSet = new ColumnSet(true);
            queryEntityPermission.AddOrder("adx_scope", OrderType.Descending);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "adx_entitypermission_webrole", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[0].LinkCriteria.AddCondition("adx_webroleid", ConditionOperator.Equal, webRoleId);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "gsc_adx_entitypermission_adx_webpage", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[1].LinkCriteria.AddCondition("adx_webpageid", ConditionOperator.Equal, webPageId);
            EntityCollection entityPermissionCollection = _service.ServiceContext.RetrieveMultiple(queryEntityPermission);

            Privileges privileges = new Privileges();
            privileges.Read = false;
            privileges.Create = false;
            privileges.Update = false;
            privileges.Delete = false;
            privileges.Append = false;
            privileges.AppendTo = false;

            if (entityPermissionCollection != null && entityPermissionCollection.Entities.Count > 0)
            {
                if (recordOwnerId == Guid.Empty && OwningBranchId == Guid.Empty)
                {
                    foreach (Entity entityPermission in entityPermissionCollection.Entities)
                    {
                        privileges = MultipleEntityPermission(entityPermission, privileges);
                    }
                    return privileges;
                }

                else
                {
                    foreach (Entity entityPermission in entityPermissionCollection.Entities)
                    {
                        Guid userId = Guid.Empty;
                        Guid branchId = Guid.Empty;
                        var context = HttpContext.Current;
                        var request = context.Request.RequestContext;
                        var cookies = request.HttpContext.Request.Cookies;
                        if (cookies != null)
                        {
                            if (cookies["Branch"] != null)
                            {
                                userId = new Guid(cookies["Branch"]["userId"]);
                                branchId = new Guid(cookies["Branch"]["branchId"]);
                            }
                        }

                        var scope = entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
                        //global
                        if (scope == 756150000)
                        {
                            privileges = AssignPrivilegesValue(entityPermission);
                        }
                        //contact
                        if (scope == 756150001 && (userId == recordOwnerId || userId == salesExecutiveId))
                        {
                            return AssignPrivilegesValue(entityPermission);
                        }
                        //account
                        else if (scope == 756150002 && branchId == OwningBranchId)
                        {
                            return AssignPrivilegesValue(entityPermission);
                        }

                    }
                    return privileges;
                }
            }

            return null;
        }

        private Privileges MultipleEntityPermission(Entity entityPermission, Privileges privileges)
        {
            if (entityPermission.GetAttributeValue<bool>("adx_read") == true)
                privileges.Read = true;

            if (entityPermission.GetAttributeValue<bool>("adx_create") == true)
                privileges.Create = true;

            if (entityPermission.GetAttributeValue<bool>("adx_write") == true)
            {
                if (privileges.DeleteScope != (Scope)756150000)
                {
                    privileges.UpdateScope = (Scope)entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
                    privileges.Update = true;
                }
            }

            if (entityPermission.GetAttributeValue<bool>("adx_delete") == true)
            {
                if (privileges.DeleteScope != (Scope)756150000)
                {
                    privileges.DeleteScope = (Scope)entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
                    privileges.Delete = true;
                }
            }

            if (entityPermission.GetAttributeValue<bool>("adx_append") == true)
                privileges.Append = true;

            if (entityPermission.GetAttributeValue<bool>("adx_appendto") == true)
                privileges.AppendTo = true;

            return privileges;
        }

        private Privileges AssignPrivilegesValue(Entity entityPermission)
        {
            Privileges privileges = new Privileges();

            privileges.Read = entityPermission.GetAttributeValue<bool>("adx_read");
            privileges.Create = entityPermission.GetAttributeValue<bool>("adx_create");
            privileges.Update = entityPermission.GetAttributeValue<bool>("adx_write");
            privileges.Delete = entityPermission.GetAttributeValue<bool>("adx_delete");
            privileges.Append = entityPermission.GetAttributeValue<bool>("adx_append");
            privileges.AppendTo = entityPermission.GetAttributeValue<bool>("adx_appendto");
            privileges.UpdateScope = (Scope)entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
            privileges.DeleteScope = (Scope)entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
            return privileges;
        }

        public bool HasDuplicate(string entityName, IDictionary<string, object> valuesSaved, Guid entityId)
        {
            bool duplicateFound = false;
            Entity duplicateSetupEntity = GetDuplicateSetup(entityName);

            if (duplicateSetupEntity != null)
            {
                //Additional validation only: Return false if parent product
                if (entityName == "product")
                {
                    foreach (var entry in valuesSaved)
                    {
                        string key = entry.Key;
                        object values = entry.Value;
                        if (key == "gsc_producttype" && values.ToString() == "100000002")
                        {
                            return false;
                        }
                    }
                }

                //Additional validation only: Return false if account is Corporate Customer/Prospect
                if (entityName == "account")
                {
                    object a = valuesSaved.Where(x => x.Key == "gsc_recordtype").Select(y => y.Value);
                    foreach (var entry in valuesSaved)
                    {        
                        if (entry.Key == "gsc_recordtype")
                        {
                            object values = entry.Value;
                          //  var value = values.GetType().GetProperty("Value").GetValue(values, null);

                            if (values.ToString() == "100000002" || values.ToString() == "100000003")
                                return false;
                        }


                    }
                }

                //Query if there is existing setup
                QueryExpression queryDuplicateDetectSetup = new QueryExpression("gsc_cmn_duplicatedetectsetup");
                queryDuplicateDetectSetup.ColumnSet = new ColumnSet("gsc_cmn_duplicatedetectsetupid", "gsc_logicaloperator");

                FilterExpression entityNameFilter = new FilterExpression();
                entityNameFilter.Conditions.Add((new ConditionExpression("gsc_entityname", ConditionOperator.Equal, entityName)));
                queryDuplicateDetectSetup.Criteria.AddFilter(entityNameFilter);

                EntityCollection duplicateCollection = _service.ServiceContext.RetrieveMultiple(queryDuplicateDetectSetup);

                if (duplicateCollection != null && duplicateCollection.Entities.Count > 0)//duplicate setup exists
                {
                    //Entity duplicateSetupEntity = duplicateCollection.Entities[0];

                    //Query for the target fields fields of existing setup
                    QueryExpression queryDuplicateFields = new QueryExpression("gsc_cmn_duplicatedetectfield");
                    queryDuplicateFields.ColumnSet = new ColumnSet("gsc_targetfield", "gsc_islookup");

                    FilterExpression duplicateSetupFilter = new FilterExpression();
                    duplicateSetupFilter.Conditions.Add(new ConditionExpression("gsc_duplicatedetectsetupid", ConditionOperator.Equal, duplicateSetupEntity.Id));
                    queryDuplicateFields.Criteria.AddFilter(duplicateSetupFilter);

                    EntityCollection filterFieldsCollection = _service.ServiceContext.RetrieveMultiple(queryDuplicateFields);

                    if (filterFieldsCollection != null && filterFieldsCollection.Entities.Count > 0)
                    {
                        var logicalOperator = duplicateSetupEntity.Contains("gsc_logicaloperator") ? duplicateSetupEntity.GetAttributeValue<OptionSetValue>("gsc_logicaloperator").Value
                              : 0;

                        FilterExpression fieldFilter = new FilterExpression(LogicalOperator.Or);
                        if (logicalOperator == 100000001)
                            fieldFilter.FilterOperator = LogicalOperator.And;

                        String field = "";

                        foreach (Entity filterFieldsEntity in filterFieldsCollection.Entities)//construct conditions of filtered expression for existing duplicates
                        {
                            field = filterFieldsEntity.GetAttributeValue<string>("gsc_targetfield");
                            if (filterFieldsEntity.GetAttributeValue<bool>("gsc_islookup"))//adding condition if targer field is tagged as a lookup field
                            {
                                var lookupEntity = (EntityReference)valuesSaved[field];
                                fieldFilter.Conditions.Add(new ConditionExpression(field, ConditionOperator.Equal, lookupEntity.Id));
                            }
                            else//condition for standard string fields
                                fieldFilter.Conditions.Add(new ConditionExpression(field, ConditionOperator.Equal, valuesSaved[field]));
                        }

                        FilterExpression duplicateDetectFilter = new FilterExpression(LogicalOperator.And);
                        duplicateDetectFilter.AddFilter(fieldFilter);

                        var isBranchScope = duplicateSetupEntity.Contains("gsc_isbranchscope") ? duplicateSetupEntity.GetAttributeValue<bool>("gsc_isbranchscope")
                            : false;

                        if (isBranchScope)
                        {
                            var branchId = Guid.Empty;
                            if (entityId != Guid.Empty)//Triggered by update
                            {
                                QueryExpression queryCurrentRecord = new QueryExpression(entityName);
                                queryCurrentRecord.ColumnSet = new ColumnSet("gsc_branchid");
                                FilterExpression currentRecordFilter = new FilterExpression();
                                currentRecordFilter.Conditions.Add(new ConditionExpression(entityName + "id", ConditionOperator.Equal, entityId));
                                queryCurrentRecord.Criteria.AddFilter(currentRecordFilter);
                                EntityCollection currentRecordCollection = _service.ServiceContext.RetrieveMultiple(queryCurrentRecord);

                                branchId = currentRecordCollection.Entities[0].GetAttributeValue<EntityReference>("gsc_branchid").Id;
                            }
                            else // Triggered by new record
                            {
                                branchId = ((EntityReference)valuesSaved["gsc_branchid"]).Id;
                            }

                            FilterExpression scopeFilter = new FilterExpression();
                            scopeFilter.Conditions.Add(new ConditionExpression("gsc_branchid", ConditionOperator.Equal, branchId));
                            duplicateDetectFilter.AddFilter(scopeFilter);//add condition for branch scope
                        }


                        //Query to check for existing duplicate fields values
                        QueryExpression queryExistingFields = new QueryExpression(entityName);
                        queryExistingFields.ColumnSet = new ColumnSet(field);

                        queryExistingFields.Criteria.AddFilter(duplicateDetectFilter);

                        EntityCollection duplicateRecordsCollection = _service.ServiceContext.RetrieveMultiple(queryExistingFields);
                        if (duplicateRecordsCollection != null && duplicateRecordsCollection.Entities.Count > 0)
                        {
                            if (entityId != Guid.Empty)//Triggered by update, may have just retrieved itself
                            {
                                foreach (Entity duplicateEntity in duplicateRecordsCollection.Entities)
                                {
                                    if (duplicateEntity.Id != entityId)//Duplicate record != to itself
                                        duplicateFound = true;
                                }
                            }
                            else//Triggered by create, retrieved records means duplicate found.
                                return true;
                        }
                    }
                }
            }
            return duplicateFound;
        }

        private Entity GetDuplicateSetup(string entityName)
        {
            QueryExpression queryDuplicateDetectSetup = new QueryExpression("gsc_cmn_duplicatedetectsetup");
            queryDuplicateDetectSetup.ColumnSet = new ColumnSet("gsc_cmn_duplicatedetectsetupid", "gsc_logicaloperator", "gsc_isbranchscope");

            FilterExpression entityNameFilter = new FilterExpression();
            entityNameFilter.Conditions.Add((new ConditionExpression("gsc_entityname", ConditionOperator.Equal, entityName)));
            queryDuplicateDetectSetup.Criteria.AddFilter(entityNameFilter);

            //Query duplicate setups
            EntityCollection duplicateCollection = _service.ServiceContext.RetrieveMultiple(queryDuplicateDetectSetup);

            if (duplicateCollection != null && duplicateCollection.Entities.Count > 0)
            {
                return duplicateCollection.Entities[0];
            }

            return null;
        }

        public Privileges GetEditableGridEntityPermission(Guid webRoleId, String entityName, Guid recordOwnerId, Guid OwningBranchId)
        {
            //Retrieve Entity Permission
            QueryExpression queryEntityPermission = new QueryExpression("adx_entitypermission");
            queryEntityPermission.ColumnSet = new ColumnSet(true);
            queryEntityPermission.AddOrder("adx_scope", OrderType.Descending);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "adx_entitypermission_webrole", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[0].LinkCriteria.AddCondition("adx_webroleid", ConditionOperator.Equal, webRoleId);
            queryEntityPermission.Criteria.AddCondition(new ConditionExpression("adx_entitylogicalname", ConditionOperator.Equal, entityName));
            EntityCollection entityPermissionCollection = _service.ServiceContext.RetrieveMultiple(queryEntityPermission);

            if (entityPermissionCollection != null && entityPermissionCollection.Entities.Count > 0)
            {
                Privileges privileges = new Privileges();

                if (entityPermissionCollection.Entities.Count > 1)
                {
                    var isParent = false;
                    Guid userId = Guid.Empty;
                    Guid branchId = Guid.Empty;
                    var context = HttpContext.Current;
                    var request = context.Request.RequestContext;
                    var cookies = request.HttpContext.Request.Cookies;
                    if (cookies != null)
                    {
                        if (cookies["Branch"] != null)
                        {
                            userId = new Guid(cookies["Branch"]["userId"]);
                            branchId = new Guid(cookies["Branch"]["branchId"]);
                        }
                    }

                    foreach (Entity entityPermission in entityPermissionCollection.Entities)
                    {
                        if (entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value == 756150003)
                        {
                            var scope = GetParentEntityPermission(entityPermission, recordOwnerId, OwningBranchId);

                            if (scope == 756150000)
                            {
                                isParent = true;
                                privileges = AssignPrivilegesValue(entityPermission);
                            }
                            if (scope == 756150001 && userId == recordOwnerId)
                            {
                                isParent = true;
                                return AssignPrivilegesValue(entityPermission);
                            }
                            else if (scope == 756150002 && branchId == OwningBranchId)
                            {
                                isParent = true;
                                return AssignPrivilegesValue(entityPermission);
                            }
                        }
                    }

                    if (isParent == true)
                        return privileges;
                    else
                    {
                        privileges = new Privileges();
                        return MultipleEntityPermission(entityPermissionCollection.Entities[0], privileges);
                    }
                }
                else
                {
                    return AssignPrivilegesValue(entityPermissionCollection.Entities[0]);
                }
            }

            return null;
        }

        private int GetParentEntityPermission(Entity entityPermission, Guid recordOwnerId, Guid OwningBranchId)
        {
            var parentEntityPermissionId = entityPermission.GetAttributeValue<EntityReference>("adx_parententitypermission") != null
                ? entityPermission.GetAttributeValue<EntityReference>("adx_parententitypermission").Id
                : Guid.Empty;

            QueryExpression queryEntityPermission = new QueryExpression("adx_entitypermission");
            queryEntityPermission.ColumnSet = new ColumnSet(true);
            queryEntityPermission.Criteria.AddCondition(new ConditionExpression("adx_entitypermissionid", ConditionOperator.Equal, parentEntityPermissionId));
            EntityCollection entityPermissionCollection = _service.ServiceContext.RetrieveMultiple(queryEntityPermission);

            if (entityPermissionCollection != null && entityPermissionCollection.Entities.Count > 0)
            {
                Entity parentEntityPermission = entityPermissionCollection.Entities[0];
                return parentEntityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
            }

            return 0;
        }
    }
}