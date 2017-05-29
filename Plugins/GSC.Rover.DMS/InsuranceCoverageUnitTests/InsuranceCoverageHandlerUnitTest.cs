using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Xrm.Sdk;
using Moq;

namespace InsuranceCoverageUnitTests
{
    [TestClass]
    public class InsuranceCoverageHandlerUnitTest
    {
        #region ComputeTotalPremium

        #region Scenario 1: Add Insurance Coverage
        [TestMethod]

        public void AddTotalPremium()
        {
            #region 1. Setup / Arrange
            var orgServiceMock = new Mock<IOrganizationService>();
            var orgService = orgServiceMock.Object;
            var orgTracingMock = new Mock<ITracingService>();
            var orgTracing = orgTracingMock.Object;

            #region Insurance Entity
            var InsuranceEntity = new EntityCollection()
            {
                EntityName = "gsc_cmn_insurance",
                Entities =
                {
                    new Entity 
                    {
                        Id = Guid.NewGuid(),
                        LogicalName = "gsc_cmn_insurance",
                        Attributes =
                        {
                            {"gsc_totalpremium", new Money(0)},
                        }
                    }
                }
            };
            #endregion

            #region Coverage Entity Collection
            var CoverageEntity = new EntityCollection()
            {
                EntityName = "gsc_cmn_insurancecoverage",
                Entities =
                {
                    new Entity 
                    {
                        Id = Guid.NewGuid(),
                        LogicalName = "gsc_cmn_insurancecoverage",
                        Attributes = 
                        {
                             {"gsc_premium", new Money(1000)}
                        }
                    }
                }
            };
            #endregion

            orgServiceMock.Setup((service => service.RetrieveMultiple(
           It.Is<QueryExpression>(expression => expression.EntityName == OrderEntity.EntityName)
           ))).Returns(OrderEntity);

            orgServiceMock.Setup((service => service.RetrieveMultiple(
          It.Is<QueryExpression>(expression => expression.EntityName == Inventory.EntityName)
          ))).Returns(Inventory);

            orgServiceMock.Setup((service => service.RetrieveMultiple(
          It.Is<QueryExpression>(expression => expression.EntityName == ProductQuantity.EntityName)
          ))).Returns(ProductQuantity);

            orgServiceMock.Setup((service => service.Update(It.Is<Entity>(entity => entity.LogicalName == OrderEntity.EntityName)))).Callback<Entity>(s => OrderEntity.Entities[0] = s);

            orgServiceMock.Setup((service => service.Update(It.Is<Entity>(entity => entity.LogicalName == Inventory.EntityName)))).Callback<Entity>(s => Inventory.Entities[0] = s);

            orgServiceMock.Setup((service => service.Update(It.Is<Entity>(entity => entity.LogicalName == ProductQuantity.EntityName)))).Callback<Entity>(s => ProductQuantity.Entities[0] = s);

            #endregion

            #region 2. Call / Action
            var AllocateVehicleHandler = new AllocatedVehicleHandler(orgService, orgTracing);
            AllocateVehicleHandler.RemoveAllocation(AllocatedVehicle.Entities[0]);
            #endregion

            #region 3. Verify
            Assert.AreEqual(100000002, OrderEntity.Entities[0].GetAttributeValue<OptionSetValue>("gsc_status").Value);
            Assert.AreEqual(null, OrderEntity.Entities[0].GetAttributeValue<String>("gsc_inventoryidtoallocate"));
            Assert.AreEqual(null, OrderEntity.Entities[0].GetAttributeValue<DateTime>("gsc_vehicleallocateddate"));
            Assert.AreEqual(100000000, Inventory.Entities[0].GetAttributeValue<OptionSetValue>("gsc_status").Value);
            Assert.AreEqual(3, ProductQuantity.Entities[0].GetAttributeValue<Int32>("gsc_available"));
            Assert.AreEqual(0, ProductQuantity.Entities[0].GetAttributeValue<Int32>("gsc_allocated"));
            #endregion
        }

        #endregion

        #endregion
    }
}
