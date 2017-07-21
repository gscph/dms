using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class EntityForm
    {
        public List<string> PrimaryField { get; set; }
        public string PrimaryFieldVal { get; set; }
        public string EntityDisplayName { get; set; }
    }
}