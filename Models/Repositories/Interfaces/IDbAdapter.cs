using System.Collections.Generic;
using Prostoi.Models.DTOs;


namespace Prostoi.Models.Repositories.Interfaces
{
  /// <summary>
  /// Is used to adapt db data for Application needs
  /// </summary>
  public interface IDbAdapter
  {
    /// <summary>
    /// Rearranges shop list provided by db
    /// </summary>
    /// <param name="shops">The raw shop list</param>
    /// <returns>Stripped shop list with integrated shop names</returns>
    IEnumerable<string> AdaptShops(IEnumerable<string> shops);

    /// <summary>
    /// Combines idles of the same shop in a dictionary
    /// </summary>
    /// <param name="idles">The raw idles</param>
    /// <returns>Integrated shop list</returns>
    dynamic AdaptIdles(Dictionary<string, Dictionary<string, List<Idle>>> idles);
  }
}