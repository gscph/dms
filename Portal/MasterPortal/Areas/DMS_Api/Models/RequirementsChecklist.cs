using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class RequirementsChecklist
    {
        public Guid Id { get; set; }
        public bool IsSubmitted { get; set; }
    }
}