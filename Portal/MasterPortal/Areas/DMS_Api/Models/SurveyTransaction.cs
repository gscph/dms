using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class SurveyTransaction
    {
        public Guid Id { get; set; }

        public string YesOrNoAnswer { get; set; }

        public string TextAnswer { get; set; }
    }
}