using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Prostoi.Models.DTOs
{
  [Table("PROSTOI")]
  public class Idle
  {
    [Column("NAM_CEH")]
    public string Ceh { get; set; }

    [Column("PLTXT")]
    public string Agreg { get; set; }

    [Column("sPoint")]
    public DateTime BeginDate { get; set; }

    [Column("ePoint")]
    public DateTime EndDate { get; set; }

    [Column("EAUSZT")]
    public double Duration { get; set; }

    [Column("OPERTEXT")]
    public string Culprit { get; set; }

    [Column("sPointCorrect")]
    public string FullBeginDate { get; set; }

    [Column("ePointCorrect")]
    public string FullEndDate { get; set; }

    [Column("PROIZ")]
    public double Proiz { get; set; }
  }
}