using System;

namespace Prostoi.Models.DTOs
{
  /// <summary>
  /// The basic entity for usage logging
  /// </summary>
  public class UsageLog
  {
    public DateTime Date { get; set; }
    public string Ip { get; set; }
    public string Method { get; set; }
    public string Params { get; set; }
  }
}