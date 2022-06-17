using System;


namespace Prostoi.Models.DTOs
{
  public class Idle
  {
    public string Ceh { get; set; }
    public string Agreg { get; set; }
    public DateTime BeginDate { get; set; }
    public DateTime EndDate { get; set; }
    public double Duration { get; set; }
    public string Culprit { get; set; }
    public string FullBeginDate { get; set; }
    public string FullEndDate { get; set; }
    public double Proiz { get; set; }
  }
}