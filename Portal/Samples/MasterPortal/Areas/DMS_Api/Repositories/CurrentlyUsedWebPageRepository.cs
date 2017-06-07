using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Globalization;

namespace Site.Areas.DMSApi
{
    public class CurrentlyUsedWebPageRepository
    {
        private readonly string _connString = ConfigurationManager.ConnectionStrings["SignalR"].ConnectionString;
        private readonly string _timeOut = ConfigurationManager.AppSettings["SignalRTimeout"];        

        public IEnumerable<CurrentlyUsedWebPage> GetAllWebPages()
        {
            var pages = new List<CurrentlyUsedWebPage>();
            using (SqlConnection connection = new SqlConnection(_connString))
            {
                string query = String.Format(@"SELECT [Id],[User],[Url],[Queue],
                                        [ConnectionId],[UserFullName],[UserImageUrl] 
                                 FROM [dbo].[CurrentlyUsedWebPage]
                                 WHERE CreatedOn >= DATEADD(mi, {0}, GETUTCDATE())", _timeOut);

                using (SqlCommand command = new SqlCommand(query, connection))
                {                  
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();                  

                    var reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        pages.Add(new CurrentlyUsedWebPage
                        {
                            Id = (int)reader["Id"],
                            Url = (string)reader["Url"],
                            Queue = (int)reader["Queue"],
                            User = (Guid)reader["User"],
                            ConnectionId = (Guid)reader["ConnectionId"],
                            UserFullName = (string)reader["UserFullName"],
                            UserImageUrl = (string)reader["UserImageUrl"]
                        });
                    }
                }
            }
            return pages;
        }

        public IEnumerable<CurrentlyUsedWebPage> GetWebPagesWithTimeAndUrlFilter(string url)
        {
            var pages = new List<CurrentlyUsedWebPage>();
            using (SqlConnection connection = new SqlConnection(_connString))
           {
               string query = String.Format(@"SELECT [Id],[User],[Url],[Queue],[CreatedOn],
                                        [ConnectionId],[UserFullName],[UserImageUrl] 
                                FROM [dbo].[CurrentlyUsedWebPage]
                                WHERE [Url] = @Url AND
                                      CreatedOn >= DATEADD(mi, {0}, GETUTCDATE())", _timeOut);

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                   
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();

                    command.Parameters.AddWithValue("@Url", url);                

                    var reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        pages.Add(new CurrentlyUsedWebPage
                        {
                            Id = (int)reader["Id"],
                            Url = (string)reader["Url"],
                            Queue = (int)reader["Queue"],
                            User = (Guid)reader["User"],
                            ConnectionId = (Guid)reader["ConnectionId"],
                            UserFullName = (string)reader["UserFullName"],
                            UserImageUrl = (string)reader["UserImageUrl"],
                           CreatedOn = Convert.ToDateTime(reader["CreatedOn"].ToString())
                        });
                    }
                }
            }
              
            return pages;
        }
        public List<string> GetConnectionIdsFromUrl(string url)
        {
            var ids = new List<string>();
            using (SqlConnection connection = new SqlConnection(_connString))
            {
                string query = String.Format(@"SELECT [ConnectionId]
                                FROM [dbo].[CurrentlyUsedWebPage]
                                WHERE [Url] = @Url AND
                                      CreatedOn >= DATEADD(mi, {0}, GETUTCDATE())", _timeOut);

                using (SqlCommand command = new SqlCommand(query, connection))
                {

                    if (connection.State == ConnectionState.Closed)
                        connection.Open();

                    command.Parameters.AddWithValue("@Url", url);

                    var reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        ids.Add(((Guid)reader["ConnectionId"]).ToString());
                    }
                }
            }

            return ids;
        }

        public void InsertPage(CurrentlyUsedWebPage data)
        {

            bool recordExists = GetWebPagesWithTimeAndUrlFilter(data.Url).Any(x => x.User == data.User);

            if (recordExists)
            {
                return;
            }

            string query = String.Format(@" INSERT INTO [dbo].[CurrentlyUsedWebPage](Url,[User],Queue,ConnectionId, UserFullName, UserImageUrl) 
                                            VALUES(@Url, '{0}', @Queue, '{1}', @Fullname, @ImageUrl)", data.User.ToString(), data.ConnectionId.ToString());           

           
            using (SqlConnection connection = new SqlConnection(_connString))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Connection = connection;                  
                    command.Parameters.AddWithValue("Url", data.Url);                  
                    command.Parameters.AddWithValue("Queue", data.Queue);
                    command.Parameters.AddWithValue("Fullname", data.UserFullName);
                    command.Parameters.AddWithValue("ImageUrl", data.UserImageUrl);

                    if (connection.State == ConnectionState.Closed)
                        connection.Open();

                    command.ExecuteNonQuery();
                }
            }
        }

        public void UpdatePage(int id, string connId)
        {
            string query = String.Format(@" UPDATE [dbo].[CurrentlyUsedWebPage] 
                                            SET ConnectionId = '{0}'
                                            WHERE Id = {1}
                                          ", connId, id);

            using (SqlConnection connection = new SqlConnection(_connString))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();

                    command.ExecuteNonQuery();
                }
            }
        }

        public void DeletePage(string connId)
        {       
            var disconnectedUser = GetAllWebPages().SingleOrDefault(x => x.ConnectionId == new Guid(connId));

            if (disconnectedUser == null)
            {
                return;
            }

            string query = String.Format(@" DELETE FROM [dbo].[CurrentlyUsedWebPage]
                                            WHERE ConnectionId = '{0}'

                                            UPDATE [dbo].[CurrentlyUsedWebPage] 
                                            SET Queue = Queue - 1, CreatedOn = GETUTCDATE()
                                            WHERE (Url = '{1}' AND Queue > {2}) AND (CreatedOn >= DATEADD(mi, {3}, GETUTCDATE()))
                                          ", connId, disconnectedUser.Url, disconnectedUser.Queue, _timeOut);
            using (SqlConnection connection = new SqlConnection(_connString))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {                   
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();

                    command.ExecuteNonQuery();
                }
            }
        }      
    }
}