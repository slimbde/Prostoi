using System.Collections.Generic;
using System.Threading.Tasks;


namespace Prostoi.Models.Repositories.Interfaces
{
  public interface IIdleRepository
  {
    Task<IEnumerable<string>> GetMinMaxDates();
    Task<IEnumerable<string>> GetShops();
    Task<dynamic> GetIdles(string begin, string end, string ceh);
  }
}