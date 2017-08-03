using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;

namespace Microsoft.Crm.Services.Utility
{
    public interface ICodeWriterFilterService
    {
        bool GenerateAttribute(AttributeMetadata attributeMetadata, IServiceProvider services);
        bool GenerateEntity(EntityMetadata entityMetadata, IServiceProvider services);
        bool GenerateOption(OptionMetadata optionMetadata, IServiceProvider services);
        bool GenerateOptionSet(OptionSetMetadataBase optionSetMetadata, IServiceProvider services);
        bool GenerateRelationship(RelationshipMetadataBase relationshipMetadata, EntityMetadata otherEntityMetadata, IServiceProvider services);
        bool GenerateServiceContext(IServiceProvider services);
    }
}