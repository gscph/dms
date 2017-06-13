using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Xrm.Sdk;

namespace Site.Areas.DMSApi
{
    public class SalesDocument
    {
        public Guid Id { get; set; }
        public bool Apply { get; set; }
        public string AppliedAmount  { get; set; }
    }
}