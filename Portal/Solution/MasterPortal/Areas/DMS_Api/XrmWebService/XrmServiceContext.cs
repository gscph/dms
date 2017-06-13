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
            EntityForm result = new EntityForm();
            result.EntityDisplayName = this.GetEntityDisplayName(logicalName);
            result.PrimaryFieldVal = "New ";

            if (Id != Guid.Empty)
            {
                Entity currentEntity = _service.ServiceContext.Retrieve(logicalName, Id, new ColumnSet(true));
                result.PrimaryFieldVal = this.TryGetFieldAttributes(currentEntity, this.PushFieldAttributes(currentEntity)) ?? string.Empty;              
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
                recordsCreated.Add(new EditableGridSaveResponse {
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
            string value = null;
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

            if(businessUnitId != Guid.Empty)
            {
                Entity businessUnitEntity = _service.ServiceContext.Retrieve("businessunit", businessUnitId, new ColumnSet("parentbusinessunitid"));

                isRoot = businessUnitEntity.Contains("parentbusinessunitid") ? false : true;
            }
            
            return isRoot;
        }

        public Privileges GetEntityPermission(Guid webRoleId, Guid webPageId)
        {
            //Retrieve Entity Permission
            QueryExpression queryEntityPermission = new QueryExpression("adx_entitypermission");
            queryEntityPermission.ColumnSet = new ColumnSet(true);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "adx_entitypermission_webrole", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[0].LinkCriteria.AddCondition("adx_webroleid", ConditionOperator.Equal, webRoleId);
            queryEntityPermission.LinkEntities.Add(new LinkEntity("adx_entitypermission", "gsc_adx_entitypermission_adx_webpage", "adx_entitypermissionid", "adx_entitypermissionid", JoinOperator.Inner));
            queryEntityPermission.LinkEntities[1].LinkCriteria.AddCondition("adx_webpageid", ConditionOperator.Equal, webPageId);
            EntityCollection entityPermissionCollection = _service.ServiceContext.RetrieveMultiple(queryEntityPermission);

            if (entityPermissionCollection != null && entityPermissionCollection.Entities.Count > 0)
            {
                Entity entityPermission = entityPermissionCollection.Entities[0];

                Privileges privileges = new Privileges();

                privileges.Read = entityPermission.GetAttributeValue<bool>("adx_read");
                privileges.Create = entityPermission.GetAttributeValue<bool>("adx_create");
                privileges.Update = entityPermission.GetAttributeValue<bool>("adx_write");
                privileges.Delete = entityPermission.GetAttributeValue<bool>("adx_delete");
                privileges.Append = entityPermission.GetAttributeValue<bool>("adx_append");
                privileges.AppendTo = entityPermission.GetAttributeValue<bool>("adx_appendto");
                privileges.Scope = (Scope)entityPermission.GetAttributeValue<OptionSetValue>("adx_scope").Value;
                return privileges;
            }

            return null;
        }

        public bool HasDuplicate(string entityName, IDictionary <string, object> valuesSaved, Guid entityId)
        {
            bool duplicateFound = false;

            //Query if there is existing setup
            QueryExpression queryDuplicateDetectSetup = new QueryExpression("gsc_cmn_duplicatedetectsetup");
            queryDuplicateDetectSetup.ColumnSet = new ColumnSet("gsc_cmn_duplicatedetectsetupid", "gsc_logicaloperator");

            FilterExpression entityNameFilter = new FilterExpression();
            entityNameFilter.Conditions.Add((new ConditionExpression("gsc_entityname", ConditionOperator.Equal, entityName)));
            queryDuplicateDetectSetup.Criteria.AddFilter(entityNameFilter);

            EntityCollection duplicateCollection = _service.ServiceContext.RetrieveMultiple(queryDuplicateDetectSetup);

            if (duplicateCollection != null && duplicateCollection.Entities.Count > 0)//duplicate setup exists
            {
                Entity duplicateSetupEntity = duplicateCollection.Entities[0];
                
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

                    FilterExpression duplicateDetectFilter = new FilterExpression(LogicalOperator.Or);
                    if (logicalOperator == 100000001)
                        duplicateDetectFilter.FilterOperator = LogicalOperator.And;

                    String field = "";

                    foreach (Entity filterFieldsEntity in filterFieldsCollection.Entities)//construct conditions of filtered expression for existing duplicates
                    {
                        field = filterFieldsEntity.GetAttributeValue<string>("gsc_targetfield");
                        if(filterFieldsEntity.GetAttributeValue<bool>("gsc_islookup"))//adding condition if targer field is tagged as a lookup field
                        {
                            var lookupEntity = (EntityReference)valuesSaved[field];
                            duplicateDetectFilter.Conditions.Add(new ConditionExpression(field, ConditionOperator.Equal, lookupEntity.Id));
                        }
                        else//condition for standard string fields
                            duplicateDetectFilter.Conditions.Add(new ConditionExpression(field, ConditionOperator.Equal, valuesSaved[field]));
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
            return duplicateFound;
        }
    }
}