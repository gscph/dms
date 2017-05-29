using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace ContactUnitTests
{
    [TestClass]
    public class ContactThemeTests
    {
        [TestMethod]
        public void ChangeThemeUrlOnSave()
        {
            // setup
            var orgServiceMock = new Mock<IOrganizationService>();
            var orgService = orgServiceMock.Object;

            Guid themeId = Guid.NewGuid();

            EntityCollection contactCollection = new EntityCollection()
            {
                EntityName = "contact",
                Entities =
                {
                    new Entity 
                    {
                        Id = Guid.NewGuid(),
                        LogicalName = "contact",
                        Attributes =
                        {
                            {"gsc_theme", themeId.ToString()},                          
                            {"gsc_themeurl", string.Empty }
                        }
                    }
                }
            };

            EntityCollection themeCollection = new EntityCollection()
            {
                EntityName = "adx_webfile",
                Entities =
                {
                    new Entity 
                    {
                        Id = themeId,
                        LogicalName = "adx_webfile"                     
                    }
                }
            };

            orgServiceMock.Setup((svc =>
             svc.RetrieveMultiple(It.Is<QueryExpression>(e => e.EntityName == contactCollection.EntityName))))
        .Returns(contactCollection);

            orgServiceMock.Setup((svc => svc.Update(It.Is<Entity>(entity => entity.LogicalName == contactCollection.EntityName)))).Callback<Entity>(s => contactCollection.Entities[0] = s);

            // act 
                      


           

        }
    }
}
