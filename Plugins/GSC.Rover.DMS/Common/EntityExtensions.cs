using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GSC.Rover.DMS.BusinessLogic.Common
{
    public static class EntityExtensions
    {
        /// <summary>
        /// Checks if entity attribute exists gets its value of an entity. returns default value if attribute does not exist
        /// </summary>
        /// <param name="name"></param>
        /// <param name="service"></param>
        /// <returns></returns>
        public static Guid GetEntityReferenceGuid(this Entity entity, string attribute)
        {
            if (entity.Attributes.Contains(attribute))
            {
                return entity.GetAttributeValue<EntityReference>(attribute).Id;
            }

            return default(Guid);
        }
    }
}
