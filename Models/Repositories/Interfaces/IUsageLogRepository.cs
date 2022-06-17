using System.Collections.Generic;
using System.Threading.Tasks;
using Prostoi.Models.DTOs;

namespace Prostoi.Models.Repositories.Interfaces
{
  /// <summary>
  /// The basic interface for usage logging
  /// </summary>
  public interface IUsageLogRepository
  {
    /// <summary>
    /// Retrieves unique ip from the database
    /// </summary>
    /// <returns>Unique ip list</returns>
    Task<IEnumerable<string>> GetIps();

    /// <summary>
    /// Retrieves Usage records for requested type
    /// </summary>
    /// <param name="what">the type of request</param>
    /// <returns>UsageLogs set</returns>
    Task<IEnumerable<UsageLog>> GetFor(string bDate, string eDate, string ip);

    /// <summary>
    /// Appends new record to the db
    /// </summary>
    /// <param name="obj">set of usageLog objs</param>
    /// <returns>num rows affected</returns>
    Task<int> Put(UsageLog[] obj);
  }
}