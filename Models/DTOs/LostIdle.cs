using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace rest_ts_react_template.Models.DTOs
{
  public class LostIdle
  {
    [Column("DAY")]
    public DateTime Day { get; set; }

    [Column("MARK")]
    public string Mark { get; set; }

    [Column("PID")]
    public string PId { get; set; }

    [Column("DENSITY")]
    public int Density { get; set; }

    [Column("WIDTH")]
    public int Width { get; set; }

    [Column("THICKNESS")]
    public int Thickness { get; set; }

    [Column("COUNT")]
    public ulong Count { get; set; }


    public double UndercastLength { get; set; }
    public int UndercastWidth { get; set; }
    public int UndercastThickness { get; set; }
    public int UndercastDensity { get; set; }
  }
}