using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMSApi
{
    public class CurrentlyUsedWebPage
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public Guid User { get; set; }
        public int Queue { get; set; }
        public Guid ConnectionId { get; set; }

        public string UserFullName { get; set; }
        public string UserImageUrl { get; set; }

        public DateTime CreatedOn { get; set; }
    }

    public class UserPageDefinition
    {
        public string Url { get; set; }
        public DateTime ClientDateTime { get; set; }
    }
}