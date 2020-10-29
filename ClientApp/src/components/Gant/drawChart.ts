import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly"
import am4lang_ru_RU from "@amcharts/amcharts4/lang/ru_RU";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";
import { IdleSet } from '../../store/Gant'
import { getCulpritText, getTooltipColor } from './functions'
import { colors } from './colors'
import moment from 'moment'


am4core.useTheme(am4themes_animated)
am4core.useTheme(am4themes_kelly)


export const drawChart = (idles: IdleSet) => {
  const bDate = moment((document.getElementById("bDate") as HTMLInputElement).value, "DD.MM.YYYY")
  const eDate = moment((document.getElementById("eDate") as HTMLInputElement).value, "DD.MM.YY")

  const chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0.2; // this creates initial fade-in
  chart.language.locale = am4lang_ru_RU;

  chart.paddingRight = 30;
  chart.paddingBottom = 50;
  chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";

  chart.data = [];
  let counter = 0;
  const ceh = Object.keys(idles)[0]

  for (let agreg in idles[ceh]) {
    const idle = idles[ceh][agreg];
    for (let i = 0; i < idle.length; ++i) {
      chart.data.push({
        name: idle[i].agreg,
        fromDate: idle[i].beginDate,
        toDate: idle[i].endDate,
        fromCorrect: idle[i].fullBeginDate,
        toCorrect: idle[i].fullEndDate,
        duration: idle[i].duration,
        culprit: getCulpritText(idle[i].culprit, idle[i].proiz),
        color: getTooltipColor(idle[i].culprit, idle[i].proiz),
      });
    }
    ++counter;
  }

  const height = counter * 45 + 100 + chart.paddingBottom;
  const chartDiv = document.getElementById("chartdiv") as HTMLDivElement
  chartDiv.style.height = `${height}px`
  chartDiv.style.top = '0px'

  // Y axis
  let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.fontSize = 15;
  categoryAxis.dataFields.category = "name";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.inversed = true;

  // X axis
  let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.fontSize = 12;
  dateAxis.startLocation = 0;
  dateAxis.renderer.grid.template.location = 0;
  dateAxis.renderer.labels.template.location = 0.05;
  dateAxis.renderer.minGridDistance = 40;
  dateAxis.baseInterval = { count: 1, timeUnit: "minute" }; // DON'T DITCH THIS STRING. THE CRUCIAL ONE
  dateAxis.gridIntervals.setAll([
    { count: 1, timeUnit: "minute" },
    { count: 5, timeUnit: "minute" },
    { count: 15, timeUnit: "minute" },
    { count: 30, timeUnit: "minute" },
    { count: 1, timeUnit: "hour" },
    { count: 2, timeUnit: "hour" },
    { count: 4, timeUnit: "hour" },
    { count: 8, timeUnit: "hour" },
    { count: 12, timeUnit: "hour" },
    { count: 1, timeUnit: "day" },
    { count: 5, timeUnit: "day" },
    { count: 10, timeUnit: "day" },
    { count: 15, timeUnit: "day" },
    { count: 20, timeUnit: "day" },
    { count: 25, timeUnit: "day" },
    { count: 1, timeUnit: "month" },
  ]);

  let minute = 1 * 1000 * 60;
  let hour = 60 * minute;
  let day = 24 * hour;
  let shiftOffset = ceh === 'Аглопроизводство'
    ? 3 * hour + 30 * minute
    : 4 * hour + 30 * minute

  dateAxis.dateFormats.setKey("hour", "HH:mm");
  dateAxis.periodChangeDateFormats.setKey("hour", "[bold red]dd MMM[/]");

  dateAxis.min = bDate.valueOf() - shiftOffset
  dateAxis.max = eDate.valueOf() - shiftOffset + day

  dateAxis.strictMinMax = true;

  // ranges (days of background)
  let days = Math.ceil((eDate.diff(bDate)) / day);

  let start = dateAxis.min;
  let end = start + day;

  for (let i = 0; i < days; ++i) {
    createRange(dateAxis, start, end, am4core.color(colors[1]), 0.25);
    start += 2 * day;
    end += 2 * day;
  }


  drawTimeLine(dateAxis);

  type ExtraFeatures = {
    dataFields: {
      openCorrect: string,
      closeCorrect: string,
      duration: string,
      culprit: string
    }
  }

  type MySeries = am4charts.ColumnSeries & ExtraFeatures

  // series
  let series1 = chart.series.push(new am4charts.ColumnSeries()) as MySeries
  series1.columns.template.width = am4core.percent(100);
  series1.columns.template.tooltipText = "{name}:\n[bold]{duration} мин.\n{culprit}[/]\nc:\xa0\xa0\xa0\xa0{openCorrect}\nпо: {toCorrect}";
  series1.dataFields.openDateX = "fromDate";
  series1.dataFields.dateX = "toDate";
  series1.dataFields.openCorrect = "fromCorrect";
  series1.dataFields.closeCorrect = "toCorrect";
  series1.dataFields.duration = "duration";
  series1.dataFields.culprit = "culprit";
  series1.dataFields.categoryY = "name";
  series1.columns.template.height = am4core.percent(30);
  series1.columns.template.propertyFields.fill = "color"; // get color from data
  series1.columns.template.stroke = am4core.color("#000000");
  series1.columns.template.strokeOpacity = 1;
  series1.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

  series1.defaultState.transitionDuration = 300

  let seriesEvents = series1.columns.template.events;

  seriesEvents.on('over', (ev: any) => {
    let item = ev.target.dataItem.column;
    item.initialColor = item.fill;

    item.fill = item.initialColor.hex === '#8fbc8f'  // dark green
      ? am4core.color('#648364')
      : item.initialColor.hex === '#f0e68c'       // khaki
        ? am4core.color('gold')
        : am4core.color('#CD5C5C');
  });

  seriesEvents.on('out', (ev: any) => {
    let item = ev.target.dataItem.column;
    item.fill = item.initialColor;
  });

  //seriesEvents.on("hit", hitHandler);

  chart.events.on('ready', function () {
    setTimeout(function () {
      const loading = document.getElementById("loading") as HTMLElement
      loading.style.opacity = "0"
    }, 300);
  });

  //chart.scrollbarX = new am4core.Scrollbar();
}




//////////////////////////////////////////////// DRAW TIMELINE
function drawTimeLine(dateAxis: any) {
  const color = am4core.color("#ff0000");

  let flag = new am4plugins_bullets.FlagBullet();
  flag.label.text = moment().format("HH:mm");
  //flag.label.fontSize = 15;
  flag.tooltipText = "Текущее время";
  //flag.label.fill = "#FFFFFF";
  flag.label.horizontalCenter = "right";

  flag.pole.stroke = color;
  flag.pole.strokeWidth = 1;
  flag.poleHeight = -30;

  flag.background.waveLength = 20;
  flag.background.fill = color;
  flag.background.stroke = color;
  flag.background.strokeWidth = 1;
  flag.background.fillOpacity = 0.2;

  let event = dateAxis.axisRanges.create();
  event.date = new Date();
  event.bullet = flag;
  event.grid.strokeWidth = 1;
  event.grid.strokeDasharray = "8,4";
  event.grid.stroke = color;
  event.grid.strokeOpacity = 1;
}


//////////////////////////////////////////////// CREATE RANGE
function createRange(axis: any, from: number, to: number, color: am4core.Color, opacity: number) {
  var range = axis.axisRanges.create();
  range.value = from;
  range.endValue = to;
  range.axisFill.fill = color;
  range.axisFill.fillOpacity = opacity;
  range.label.disabled = true;
}