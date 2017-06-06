using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EntityUpdateUtility
{
    class EntityUpdater
    {
        private readonly IOrganizationService _service;
        private readonly IEnumerable<string> _logicalNames;
        public EntityUpdater(IServiceContext serviceCreator, IEnumerable<string> logicalNames)
        {
            _service = serviceCreator.CreateServiceContext();
            _logicalNames = logicalNames;
        }     

        private IEnumerable<UpdateEntityRequest> CreateUpdateEntityRequests(IEnumerable<EntityMetadata> entities)
        {
            List<UpdateEntityRequest> list = new List<UpdateEntityRequest>();

            foreach (var item in entities)
            {
                list.Add(new UpdateEntityRequest(){ Entity = item });
            }

            return list;
        }


        public void UpdateEntities()
        {
            foreach (string item in this._logicalNames)
            {
                CreateAttributeRequest req = new CreateAttributeRequest
                {
                    EntityName = item,
                    Attribute = new BooleanAttributeMetadata
                    {
                        SchemaName = "gsc_IsGlobalRecord",
                        RequiredLevel = new AttributeRequiredLevelManagedProperty(AttributeRequiredLevel.None),
                        DisplayName = new Label("Is Global Record?", 1033),
                        Description = new Label("This field identifies if record is global. Global records are the records created by MMPC.", 1033),
                        OptionSet = new BooleanOptionSetMetadata(
                            new OptionMetadata(new Label("True", 1033), 1),
                            new OptionMetadata(new Label("False", 1033), 0)
                            )
                    }
                };
                var entityResponse = _service.Execute(req);
            }
        }      
    }
}
