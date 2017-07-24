using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.Account.ViewModels
{
    public class BranchSettingsViewModel
    {
        public bool IsBranchConfigured { get; set; }
        public string BranchName { get; set; }
        public Guid BranchId { get; set; }
        public string DealerName { get; set; }
        public Guid DealerId { get; set; }
        public bool AllowDraftPrinting { get; set; }
        public bool AllowUsertoActivate { get; set; }
        public bool AllowSupervisortoActivate { get; set; }
        public bool AllowManagertoActivate { get; set; }
        public Guid ReportsTo { get; set; }
        public UserPosition Position { get; set; }
        public UserWebRole WebRole { get; set; }
        public bool IsVendorUser { get; set; }
        public Guid UserId { get; set; }
        public Guid ParentCustomerId { get; set; }
        public String ParentCustomerType { get; set; }
    }

    public class UserPosition
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    public class UserWebRole
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}