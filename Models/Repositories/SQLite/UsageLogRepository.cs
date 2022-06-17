using System;
using System.Net;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SQLite;
using System.Threading.Tasks;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories.Interfaces;


namespace Prostoi.Models.Repositories.SQLite
{
  public class UsageLogRepository : IUsageLogRepository
  {
    protected SQLiteConnection _db;
    public UsageLogRepository(string conString) => _db = new SQLiteConnection(conString);



    public async Task<IEnumerable<string>> GetIps()
    {
      string stmt = @"SELECT DISTINCT Ip FROM UsageLogs";
      IList<string> result = new List<string>();

      DbCommand cmd = new SQLiteCommand(stmt, _db);
      try
      {
        await _db.OpenAsync();
        DbDataReader reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
          result.Add(reader["Ip"].ToString());

        return result;
      }
      finally { await _db.CloseAsync(); }
    }
    public async Task<int> Put(UsageLog[] obj)
    {
      string stmt = @"INSERT INTO UsageLogs (UsageDate, Ip, Method, Params)
											VALUES (@date, @ip, @method, @params)";

      SQLiteCommand cmd = new SQLiteCommand(stmt, _db);
      cmd.Parameters.AddWithValue("@date", obj[0].Date.ToString("yyyy-MM-dd HH:mm:ss"));
      cmd.Parameters.AddWithValue("@ip", obj[0].Ip);
      cmd.Parameters.AddWithValue("@method", obj[0].Method);
      cmd.Parameters.AddWithValue("@params", WebUtility.UrlDecode(obj[0].Params.Substring(1)));

      try
      {
        await _db.OpenAsync();
        return await cmd.ExecuteNonQueryAsync();
      }
      finally { await _db.CloseAsync(); }
    }
    public async Task<IEnumerable<UsageLog>> GetFor(string bDate, string eDate, string ip)
    {
      SQLiteCommand cmd = new SQLiteCommand();
      cmd.Connection = _db;

      cmd.CommandText = @"SELECT * 
                          FROM UsageLogs 
                          WHERE 
                            strftime('%Y-%m-%d', UsageDate) BETWEEN strftime('%Y-%m-%d', @bDate) AND strftime('%Y-%m-%d', @eDate)";

      cmd.Parameters.AddWithValue("@bDate", bDate);
      cmd.Parameters.AddWithValue("@eDate", eDate);

      if (ip != "ВСЕ")
      {
        cmd.CommandText += " AND Ip = @ip";
        cmd.Parameters.AddWithValue("@ip", ip);
      }

      return await assembleUsageLog(cmd);
    }


    ///////////////////// PRIVATE SECTION
    private async Task<IList<UsageLog>> assembleUsageLog(DbCommand cmd)
    {
      IList<UsageLog> result = new List<UsageLog>();

      try
      {
        await _db.OpenAsync();
        DbDataReader reader = await cmd.ExecuteReaderAsync();


        while (await reader.ReadAsync())
          result.Add(new UsageLog
          {
            Date = Convert.ToDateTime(reader["UsageDate"]),
            Ip = reader["Ip"].ToString(),
            Method = reader["Method"].ToString(),
            Params = reader["Params"].ToString()
          });

        return result;
      }
      finally { await _db.CloseAsync(); }
    }
  }
}