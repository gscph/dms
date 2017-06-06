using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMSApi
{
    public class ClientEntity
    {
        public Guid Id { get; set; }
        public string Value { get; set; }
        public string attr { get; set; }
        public string type { get; set; }
        public string entity { get; set; }
        public string displayVal { get; set; }
    }
}