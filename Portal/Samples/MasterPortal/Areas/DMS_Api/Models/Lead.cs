using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class Lead
    {
        public Guid Id { get; set; }
        public string InquiryNo { get; set; }
        public DateTime InquiryDate { get; set; }
        public string ProspectName { get; set; }
        public VehicleBaseModel VehicleBaseModel { get; set; }
    }

    public class VehicleBaseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}