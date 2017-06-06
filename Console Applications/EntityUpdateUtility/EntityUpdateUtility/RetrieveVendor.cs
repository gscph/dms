using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EntityUpdateUtility
{
    class RetrieveVendor
    {
        private readonly IOrganizationService _service;
        public RetrieveVendor(IServiceContext serviceCreator)
        {
            _service = serviceCreator.CreateServiceContext();
        } 
   
        public List<string> RetrieveVendorEntities()
        {
            QueryExpression query = new QueryExpression("gsc_vendorentity");
            query.ColumnSet.AddColumn("gsc_name");
            EntityCollection collection = _service.RetrieveMultiple(query);

            List<string> entities = new List<string>();

            if (collection != null && collection.Entities.Count > 0)
            {
                foreach (var entity in collection.Entities)
                {
                    entities.Add(entity.GetAttributeValue<String>("gsc_name"));
                }
            }

            return entities;
        }
    }
}
