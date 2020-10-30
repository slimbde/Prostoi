import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly"
import am4lang_ru_RU from "@amcharts/amcharts4/lang/ru_RU"
import { LostIdle } from "../../store/CastLost";


am4core.useTheme(am4themes_animated)
am4core.useTheme(am4themes_kelly)



export const drawChart = (data: LostIdle[]) => {
  let chart = am4core.create("chartdiv-loss", am4charts.XYChart);
  chart.data = data

  chart.padding(40, 40, 0, 20)
  const chartDiv = document.getElementById("chartdiv-loss") as HTMLDivElement
  chartDiv.style.width = `${data.length * 50 + 200}px`

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


  // Create series
  function createSeries(field: string, name: string) {
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.dateX = "date";
    series.sequencedInterpolation = true;
    series.hiddenState.transitionDuration = 100
    series.defaultState.transitionDuration = 100

    // Make it stacked
    series.stacked = true;

    // Configure columns
    series.columns.template.width = am4core.percent(80);
    series.columns.template.tooltipPosition = "pointer"
    series.columns.template.tooltipText = "Не долито\nПо простоям:[font-size:14px] [bold]{valueY}[/] т.\n[font-size:12px]{dateX.formatDate('dd.MM.yyyy')}[/]";

    // Add label
    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.fontSize = 11
    labelBullet.fontWeight = "bold"
    labelBullet.dy = -10
    //labelBullet.label.hideOversized = true;

    return series;
  }

  createSeries("lostMetal", "Простои");

  // Legend
  // chart.legend = new am4charts.Legend()
  // chart.legend.fontSize = 12

  chart.language.locale = am4lang_ru_RU

  chart.events.on('ready', function () {
    setTimeout(() => {
      const loading = document.getElementById("loading") as HTMLElement
      loading.style.opacity = "0"
    }, 300)
  })
}