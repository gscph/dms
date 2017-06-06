using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api.Models
{
    public class EntityDataModel
    {
        public Guid Id { get; set; }
        public object Value { get; set; }
        public string Attribute { get; set; }
        public string Type { get; set; }
        public string Entity { get; set; }
        public string DisplayValue { get; set; }
    }
}