using System.Collections.Generic;
using System.Linq;
using react_ts.Models.DTOs;

namespace Prostoi.Models
{
  public interface IDbAdapter
  {
    IEnumerable<string> AdaptShops(IEnumerable<string> shops);
    Dictionary<string, SortedDictionary<string, List<Idle>>> AdaptIdles(Dictionary<string, SortedDictionary<string, List<Idle>>> idles);
  }





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