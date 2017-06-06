using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Site.Areas.DMSApi;
using Site.Areas.DMS_Api;
using System.Threading.Tasks;
using System.Configuration;

namespace Site
{
    public class SalesHub : Hub
    {
        private readonly CurrentlyUsedWebPageRepository _repo = new CurrentlyUsedWebPageRepository();
        private readonly int _userIdleTime = Convert.ToInt32(ConfigurationManager.AppSettings["UserIdleTime"]);
        private readonly int _userTimeToLive = Convert.ToInt32(ConfigurationManager.AppSettings["UserTimeToLive"]);
        private readonly IHubContext context = GlobalHost.ConnectionManager.GetHubContext<SalesHub>();

        public void Update(CurrentlyUsedWebPage data, int type)
        {
            IHubContext context = GlobalHost.ConnectionManager.GetHubContext<SalesHub>();          
            context.Clients.All.updatePages(data, type);
        }

        public void UserHasSaved(string url, string userId, string fullName)
        {
            context.Clients.All.pendingChanges(url, userId, fullName);
        }

        public override Task OnConnected()
        {
            // try to delete if user is idle
            Task mytask = Task.Run(() =>
            {
                IsUserIdle(_repo, Context.ConnectionId);
            });

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            CurrentlyUsedWebPage userTrace = _repo.GetAllWebPages().SingleOrDefault(x => x.ConnectionId == new Guid(Context.ConnectionId));
            // try to delete if user has not reconnected
            Task mytask = Task.Run(() =>
            {
                UserDisconnected(userTrace, _repo, Context.ConnectionId);
            });

            return base.OnDisconnected(stopCalled);
        }

        private async void IsUserIdle(CurrentlyUsedWebPageRepository repo, string connectionId)
        {
            await Task.Delay(_userIdleTime);
            CurrentlyUsedWebPage userTrace = _repo.GetAllWebPages().SingleOrDefault(x => x.ConnectionId == new Guid(connectionId));
             
            if (userTrace != null)
            {
                _repo.DeletePage(connectionId);
                // blast the inactivity notif
                Update(userTrace, 3);                       
            }
        }

        private async void UserDisconnected(CurrentlyUsedWebPage userTrace, CurrentlyUsedWebPageRepository repo, string connectionId)
        {
            // copy userTrace to local var, this gets disposed by CLR after some time.
            var localUserTrace = userTrace;
            await Task.Delay(_userTimeToLive);

            // make sure localtrace isn't null
            if (localUserTrace == null) return;

            // check db if a connection still exist
            bool hasUserReconnected = repo.GetAllWebPages().Any(x => x.User == localUserTrace.User &&
                            x.Url == localUserTrace.Url && x.ConnectionId != new Guid(connectionId));


            // delete if disconnected
            if (!hasUserReconnected)
            {
                repo.DeletePage(connectionId);
                Update(userTrace, 4);               
            }
        }

    }
}