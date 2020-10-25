
//////////////////////////////////////////////// HIT HANDLER
// export const hitHandler = async (event: { target: { dataItem: { dataContext: any; }; }; }) => {
//   //////////////showLoading();

//   let host = '10.2.10.84';
//   let port = '5000';
//   let ip = `${host}:${port}`;

//   let ceh = $('#ceh').val();

//   let idle = event.target.dataItem.dataContext;
//   console.log(idle);

//   let link = `http://${ip}/API/Idles/GetFor?PR_DATE_N=${idle['fromDate']}&WORKSHOP_NAME=${ceh}&PR_MESTO=${idle['name']}`.replace(/\s/g, '%20');
//   //let link = `http://${ip}/API/Idles/GetFor?PR_DATE_N=2020-05-15 05:45&WORKSHOP_NAME=${ceh}&PR_MESTO=${idle['name']}`.replace(/\s/g,'%20');


//   let response = await fetch(link);

//   if (response.status == 401) {
//     setTimeout(function () {
//       alert("Не удалось авторизоваться на сервере разбора простоев..");
//       setTimeout(() => $('#loading').css({ 'opacity': 0 }), 500);
//     }, 2000);

//     return;
//   }

//   let idObj = await response.json();

//   if (idObj.length) {
//     let id = idObj[0]['PR_ID'];

//     link = `http://${ip}/api/idleKeyEvents/GetFor?PR_ID=${id}`;
//     response = await fetch(link);
//     events = await response.json();

//     if (events.length) {
//       link = `http://${ip}/Investigation/${id}`;
//       window.location.replace(link);
//     }
//     else {
//       if (confirm('Этот простой зарегистрирован в системе расследования простоев\nно расследование пока не началось\nЖелаете перейти в систему расследования простоями?'))
//         window.location.replace(`http://${ip}/Idles`);
//     }
//   }
//   else
//     alert('Данный простой не зарегистрирован в системе расследования простоев');

//   setTimeout(() => $('#loading').css({ 'opacity': 0 }), 500);
// }




//////////////////////////////////////////////// ALLOWED CULPRITS
export const allowedCulprits = new Set([
  'НЕ В РАБОТЕ',
  'НЕ В РАБОТЕ.',
  'ППР',
  'ППР.КАПИТАЛЬНЫЙ РЕМОНТ',
  'ППР.ПРОДОЛЖИТЕЛЬНЫЙ РЕМОНТ',
  'ППР.ПРОДОЛЖИТЕЛЬНЫЙ ТЕКУЩИЙ РЕМОНТ',
  'ППР.РЕКОНСТРУКЦИЯ',
  'ППР.ТЕКУЩИЙ РЕМОНТ',
  'ПРОИЗВОДСТВО НЕ ЗАПЛАНИРОВАНО',
  'РЕГЛАМЕНТИР ТЕХНОЛОГ ПРОСТОИ',
  'РЕГЛАМЕНТИР.',
  'РЕГЛАМЕНТИР. ТЕХНОЛОГ. ПРОСТОИ',
  'РЕГЛАМЕНТИРОВАН ТЕХНОЛОГИЧЕСКИЕ ПРОСТОИ',
  'РЕГЛАМЕНТНЫЕ ТЕХНОЛОГ. ПРОСТОИ'
]);


//////////////////////////////////////////////// GET TOOLTIP COLOR
export const getTooltipColor = (culprit: string, proiz: number) => {

  return proiz !== 0.0
    ? 'khaki'
    : allowedCulprits.has(culprit)
      ? '#8fbc8f'
      : 'lightcoral';
}


//////////////////////////////////////////////// GET CULPRIT TEXT
export const getCulpritText = (culprit: string, proiz: number) => {

  return proiz !== 0.0
    ? 'Снижение произв-ти: ' + Math.round(proiz) + '%'
    : culprit
      ? 'Причина: ' + culprit
      : 'Причина не указана'
}