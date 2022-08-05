import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly"
import am4lang_ru_RU from "@amcharts/amcharts4/lang/ru_RU"
import { LostSteel } from "models/types/lostSteel";



am4core.useTheme(am4themes_animated)
am4core.useTheme(am4themes_kelly)



export const drawChart = (data: LostSteel[]) => {
  const chartDiv = document.getElementById("chartdiv") as HTMLDivElement

  let chart = am4core.create(chartDiv, am4charts.XYChart);
  chart.data = data

  chart.hiddenState.properties.opacity = 0.6; // this disables initial fade-in

  chart.padding(40, 40, 20, 20)
  chartDiv.style.maxWidth = `${data.length * 50 + 200}px`

  chart.dateFormatter.inputDateFormat = "yyyy-MM-dd"

  // Create axes
  let categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
  categoryAxis.dateFormats.setKey("day", "dd MMM");
  categoryAxis.periodChangeDateFormats.setKey("day", "[bold red]dd MMM[/]")
  categoryAxis.renderer.minGridDistance = 30;
  //categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.grid.template.disabled = true
  categoryAxis.fontSize = 12

  if (data.length > 15) {
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.labels.template.location = 0.2
  }


  let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.renderer.inside = false;
  valueAxis.fontSize = 12
  valueAxis.min = 0;
  valueAxis.max = 105
  valueAxis.strictMinMax = true


  // Create series
  function createSeries(field: string, percent: string, name: string) {
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.categoryY = field
    series.dataFields.valueY = percent;
    series.dataFields.dateX = "SHIFT";
    series.sequencedInterpolation = true;
    series.hiddenState.transitionDuration = 0     // скорость изменения значений на графике
    series.defaultState.transitionDuration = 0
    series.fillOpacity = 0.7

    // Make it stacked
    series.stacked = true;

    // Configure columns
    series.columns.template.width = am4core.percent(80);
    series.columns.template.tooltipPosition = "pointer"
    series.columns.template.tooltipText = name === "Простои"
      ? "Не долито\nИз-за простоев:[font-size:14px] [bold]{categoryY}[/] т.\n[font-size:12px]{dateX.formatDate('dd.MM.yyyy')}[/]"
      : "Не долито\nИз-за снижения производительности:[font-size:14px] [bold]{categoryY}[/] т.\n[font-size:12px]{dateX.formatDate('dd.MM.yyyy')}[/]"

    // Add label
    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}%";
    labelBullet.fontSize = 11
    labelBullet.fontWeight = "bold"
    labelBullet.dy = -10
    //labelBullet.label.hideOversized = true;

    return series;
  }

  chart.colors.next()
  chart.colors.next()
  chart.colors.next()
  chart.colors.next()
  chart.colors.next()

  createSeries("DOWNTIME_WEIGHT", "DOWNTIME_PERCENT", "Снижение производительности");
  createSeries("IDLE_WEIGHT", "IDLE_PERCENT", "Простои");

  // Legend
  chart.legend = new am4charts.Legend()
  chart.legend.fontSize = 12

  chart.language.locale = am4lang_ru_RU
}