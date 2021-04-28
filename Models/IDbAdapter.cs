using System.Collections.Generic;
using System.Linq;
using Prostoi.Models.DTOs;

namespace Prostoi.Models
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
    Dictionary<string, SortedDictionary<string, List<Idle>>> AdaptIdles(Dictionary<string, SortedDictionary<string, List<Idle>>> idles);
  }




  /// <summary>
  /// Bunker shops comprise different names for the same shops
  /// </summary>
  public class BunkerAdapter : IDbAdapter
  {
    public Dictionary<string, SortedDictionary<string, List<Idle>>> AdaptIdles(Dictionary<string, SortedDictionary<string, List<Idle>>> idles)
    {
      var result = new Dictionary<string, SortedDictionary<string, List<Idle>>>();

      var idlesKeys = new List<string>(idles.Keys);
      var shortestKey = idlesKeys.OrderBy(key => key.Length).First();

      result[shortestKey] = new SortedDictionary<string, List<Idle>>(idles[shortestKey]);

      for (int keyIdx = 0; keyIdx < idlesKeys.Count; ++keyIdx)
      {
        if (idlesKeys[keyIdx] == shortestKey)
          continue;

        foreach (KeyValuePair<string, List<Idle>> sortedDict in idles[idlesKeys[keyIdx]])
          result[shortestKey].Add(sortedDict.Key, sortedDict.Value);
      }

      return result;
    }

    public IEnumerable<string> AdaptShops(IEnumerable<string> shops)
    {
      string[] itemsToRemove = {
        "Аглопроизводство1",
        "ККЦ(СПО)",
        "Прокатный цех №1(СТ250-1,250-2)",
        "Прокатный цех №4(Станы холодн. прокатки)"
      };

      return shops.Where(sh => !itemsToRemove.Any(one => one == sh));
    }
  }
}