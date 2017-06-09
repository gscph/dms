using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Site.Areas.Account.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api.XrmWebService
{
    public class UserManager
    {    
        private readonly IXrmConnection _service;

        public UserManager(IXrmConnection service)
        {
            _service = service;
        }

        public void UpdateUserImageUrl(Guid userId, string imageUrl)
        {
            Entity entity = _service.ServiceContext.Retrieve("contact", userId, new ColumnSet("contactid"));

            entity["gsc_userimageurl"] = imageUrl;

            _service.ServiceContext.Update(entity);
        }

        public void UpdateAccountImage(Guid recordId, byte[] imageBytes)
        {
            Entity entity = _service.ServiceContext.Retrieve("account", recordId, new ColumnSet("accountid"));

            entity["entityimage"] = imageBytes;

            _service.ServiceContext.Update(entity);
        }

        public BranchSettingsViewModel GetUserBranch(string username)
        {
            BranchSettingsViewModel branchSettings = new BranchSettingsViewModel() {             
             Position = new UserPosition()
            };

            QueryExpression query = new QueryExpression("account");
            query.ColumnSet.AddColumns("gsc_allowdraftprinting", "gsc_owningusertoactivatequote", "gsc_managerstoactivatequote", "gsc_supervisorstoactivatequote");
            query.LinkEntities.Add(new LinkEntity("account", "contact", "accountid", "gsc_contactbranchid", JoinOperator.Inner));
            query.LinkEntities[0].Columns.AddColumns("gsc_contactbranchid", "gsc_contactdealerid", "gsc_reportsto", "gsc_positionid");
            query.LinkEntities[0].LinkCriteria.AddCondition("adx_identity_username", ConditionOperator.Equal, username);
            query.LinkEntities[0].EntityAlias = "Contact";
            Entity entity = _service.ServiceContext.RetrieveMultiple(query).Entities.FirstOrDefault();

            //Retrieve Web Roles Associated to Contact
            QueryExpression queryWebRole = new QueryExpression("adx_webrole_contact");
            queryWebRole.ColumnSet.AddColumns("adx_webroleid");
            queryWebRole.LinkEntities.Add(new LinkEntity("adx_webrole_contact", "contact", "contactid", "contactid", JoinOperator.Inner));
            queryWebRole.LinkEntities[0].LinkCriteria.AddCondition("adx_identity_username", ConditionOperator.Equal, username);
            queryWebRole.LinkEntities[0].EntityAlias = "Contact";
            queryWebRole.LinkEntities.Add(new LinkEntity("adx_webrole_contact", "adx_webrole", "adx_webroleid", "adx_webroleid", JoinOperator.Inner));
            queryWebRole.LinkEntities[1].Columns.AddColumns("adx_name");
            queryWebRole.LinkEntities[1].EntityAlias = "WebRole";
            EntityCollection webRolesCollection = _service.ServiceContext.RetrieveMultiple(queryWebRole);

            if (entity != null)
            {
                
                var branch = entity.GetAttributeValue<AliasedValue>("Contact.gsc_contactbranchid") != null
                    ? (EntityReference)entity.GetAttributeValue<AliasedValue>("Contact.gsc_contactbranchid").Value
                    : null;

                var dealer = entity.GetAttributeValue<AliasedValue>("Contact.gsc_contactdealerid") != null
                    ? (EntityReference)entity.GetAttributeValue<AliasedValue>("Contact.gsc_contactdealerid").Value
                    : null;

                var position = entity.GetAttributeValue<AliasedValue>("Contact.gsc_positionid") != null
                   ? (EntityReference)entity.GetAttributeValue<AliasedValue>("Contact.gsc_positionid").Value
                   : null;

                if (branch != null)
                {
                    branchSettings.WebRole = new UserWebRole() { 
                        Id = webRolesCollection.Entities[0].GetAttributeValue<Guid>("adx_webroleid"),
                        Name = webRolesCollection.Entities[0].GetAttributeValue<AliasedValue>("WebRole.adx_name").Value.ToString()  
                    };

                    branchSettings.BranchName = branch.Name;

                    branchSettings.BranchId = branch.Id;

                    branchSettings.DealerName = dealer.Name;

                    branchSettings.DealerId = dealer.Id;

                    if (position != null)
                    {
                        branchSettings.Position.Id = position.Id;

                        branchSettings.Position.Name = position.Name;
                    }

                    branchSettings.ReportsTo = entity.GetAttributeValue<AliasedValue>("Contact.gsc_reportsto") != null
                        ? ((EntityReference)entity.GetAttributeValue<AliasedValue>("Contact.gsc_reportsto").Value).Id
                        : Guid.Empty;

                    branchSettings.AllowDraftPrinting = entity.Contains("gsc_allowdraftprinting")
                        ? entity.GetAttributeValue<Boolean>("gsc_allowdraftprinting")
                        : false;

                    branchSettings.AllowUsertoActivate = entity.Contains("gsc_owningusertoactivatequote")
                        ? entity.GetAttributeValue<Boolean>("gsc_owningusertoactivatequote")
                        : false;

                    branchSettings.AllowSupervisortoActivate = entity.Contains("gsc_supervisorstoactivatequote")
                        ? entity.GetAttributeValue<Boolean>("gsc_supervisorstoactivatequote")
                        : false;

                    branchSettings.AllowManagertoActivate = entity.Contains("gsc_managerstoactivatequote")
                        ? entity.GetAttributeValue<Boolean>("gsc_managerstoactivatequote")
                        : false;
                }

                // user exists but branch is empty
            }
            return branchSettings;
            
        }

    }
}