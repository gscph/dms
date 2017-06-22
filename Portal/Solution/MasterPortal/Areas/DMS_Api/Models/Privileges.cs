using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class Privileges
    {
        public bool Read { get; set; }
        public bool Create { get; set; }
        public bool Update { get; set; }
        public bool Delete { get; set; }
        public bool Append { get; set; }
        public bool AppendTo { get; set; }
        public Scope UpdateScope { get; set; }
        public Scope DeleteScope { get; set; }
    }

    public enum Scope
    {
        
        Global = 756150000,
        Contact = 756150001,
        Account = 756150002,
        Parent = 756150003,
        Self = 756150003
    }
}