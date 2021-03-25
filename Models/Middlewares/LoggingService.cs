using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories;

namespace Prostoi.Models.Middlewares
{
  /// <summary>
  /// The service to score user's requests
  /// </summary>
  public class LoggingService
  {
    private readonly IUsageLogRepository _repo;
    private Dictionary<string, Dictionary<string, string>> _cache;  // ip - method - time



    public LoggingService(IUsageLogRepository repo)
    {
      _repo = repo;
      _cache = new Dictionary<string, Dictionary<string, string>>();
    }


    /// <summary>
    /// Appends data to the database
    /// </summary>
    public async Task Log(HttpContext context)
    {
      if (context.Request.QueryString.Value.Length > 0)
      {
        var ip = context.Connection.RemoteIpAddress.ToString();
        var method = context.Request.Path.Value;
        var time = DateTime.Now.ToString("yyyy-MM-dd HH:mm");

        // checking if the ip has used the method within last minute
        // and if it's the same method - return
        if (!_cache.ContainsKey(ip))
          _cache.Add(ip, new Dictionary<string, string>() { { method, time } });
        else if (!_cache[ip].ContainsKey(method))
          _cache[ip].Add(method, time);
        else if (_cache[ip][method] == time)
          return; /////// return if user jerks the same method within one minute
        else
          _cache[ip][method] = time;

        try
        {
          UsageLog[] obj = new UsageLog[1] { new UsageLog { Date = DateTime.Now, Ip = ip, Method = method, Params = context.Request.QueryString.Value } };
          await _repo.Put(obj);
        }
        catch (Exception ex) { Console.WriteLine($"MIDDLEWARE EXCEPTION: {ex.Message}"); }
      }
    }
  }
}