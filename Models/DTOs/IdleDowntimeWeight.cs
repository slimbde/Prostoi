using System;

namespace Prostoi.Models.DTOs
{
  public class IdleDowntimeWeight
  {
    public DateTime SHIFT { get; set; }
    public double IDLE_WEIGHT { get; set; }
    public double DOWNTIME_WEIGHT { get; set; }
  }
}