using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class Rows
    {
        public string Attr { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }
        public string Reference { get; set; }
    }

    public class EditableGridModel 
    {
        public Guid Id { get; set; }
        public IEnumerable<Rows> Records { get; set; }
        public string Entity { get; set; }
        // handsontable row 

        public int HotRowIndex { get; set; }
    }

    public class EditableGridSaveResponse
    {
        public Guid Id { get; set; }
        public int RowIndex { get; set; }

    }
}