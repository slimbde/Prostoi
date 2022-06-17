using System.Threading.Tasks;


namespace Prostoi.Models.Repositories.Interfaces
{
  /// <summary>
  /// The CCM repository interface
  /// </summary>
  public interface ICCMRepository
  {
    /// <summary>
    /// Retrieves CCM Idle weights for the interval
    /// </summary>
    /// <param name="begin">start date</param>
    /// <param name="end">end date</param>
    Task<dynamic> GetCcmIdleDowntimeWeight(string bDate, string eDate, int ccmNo);
  }
}