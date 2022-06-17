using System.Collections.Generic;
using Prostoi.Models.Repositories.Interfaces;
using Prostoi.Models.Repositories.ORACLE;
using Prostoi.Models.Repositories.SQLite;

namespace Prostoi.Models.Repositories
{
  public class RepositoryFactory
  {
    public static ICCMRepository CreateCcmRepo(IDictionary<int, string> ccmConStrings) => new CCMRepository(ccmConStrings);
    public static IIdleRepository CreateIdleRepo(string conString)
    {
      IDbAdapter adapter = new BunkerDbAdapter();
      return new BunkerIdleRepository(conString, adapter);
    }
    public static IUsageLogRepository CreateUsageRepo(string conString) => new UsageLogRepository(conString);
  }
}