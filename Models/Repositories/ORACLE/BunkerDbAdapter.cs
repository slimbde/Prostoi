using System.Collections.Generic;
using System.Linq;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories.Interfaces;

namespace Prostoi.Models.Repositories.ORACLE
{
  /// <summary>
  /// Bunker shops comprise different names for the same shops
  /// </summary>
  public class BunkerDbAdapter : IDbAdapter
  {
    public dynamic AdaptIdles(Dictionary<string, Dictionary<string, List<Idle>>> idles)
    {
      var result = new Dictionary<string, Dictionary<string, List<Idle>>>();

      var idlesKeys = new List<string>(idles.Keys);
      var shortestKey = idlesKeys.OrderBy(key => key.Length).First();

      result[shortestKey] = new Dictionary<string, List<Idle>>(idles[shortestKey]);

      for (int keyIdx = 0; keyIdx < idlesKeys.Count; ++keyIdx)
      {
        if (idlesKeys[keyIdx] == shortestKey)
          continue;

        foreach (KeyValuePair<string, List<Idle>> innerDict in idles[idlesKeys[keyIdx]])
          result[shortestKey].Add(innerDict.Key, innerDict.Value);
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