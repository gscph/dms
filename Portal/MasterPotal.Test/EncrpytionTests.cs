using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Site;
namespace MasterPotal.Test
{
    [TestClass]
    public class EncrpytionTests
    {
        public string Role { get; set; }
        [TestMethod]
        public void EncryptSalesManagerWebRole()
        {
            Role = "Sales Manager";
            Role = Role.Encrypt(); 

            Assert.AreNotEqual("Sales Manager", Role);
            Assert.AreNotEqual(string.Empty, Role);
            Assert.IsNotNull(Role);
            Assert.AreEqual("+62ppcNzGO7zAryVkixhBHa2elr9pCA8zJk9fgi5HZ8=", Role);
        }

        [TestMethod]
        public void DecrpytSalesManagerWebRole()
        {
            Role = "Sales Manager";
            Role = Role.Encrypt();

            Assert.AreEqual("Sales Manager", Role.Decrypt());
        }
    }
}
