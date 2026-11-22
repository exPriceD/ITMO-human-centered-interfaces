(() => {
  const allowed = new Set(['catalog_open','search_submit','filter_apply','course_open','program_view','enroll_start','form_error','enroll_success','catalog_return']);
  const get = (s,k,f) => {try {return s.getItem(k)||f;} catch {return f;}};
  const put = (s,k,v) => {try{s.setItem(k,v);}catch{}};
  const id = () => crypto.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
  const userId = get(localStorage,'pp_user',id()); put(localStorage,'pp_user',userId);
  const now = Date.now();
  const previous = Number(get(sessionStorage,'pp_last','0'));
  const sessionId = previous && now-previous < 30*60*1000 ? get(sessionStorage,'pp_session',id()) : id();
  put(sessionStorage,'pp_session',sessionId);put(sessionStorage,'pp_last',String(now));
  const test = new URLSearchParams(location.search).get('test') === '1';
  const counter = Number(window.LAB_CONFIG?.metrikaId)||0;
  if (counter && !test) {
    window.ym = window.ym || function(){(window.ym.a=window.ym.a||[]).push(arguments);};
    window.ym.l = Date.now();
    const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js';document.head.append(script);
    window.ym(counter,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  }
  function track(event, data={}) {
    if (!allowed.has(event)) throw new Error('Unknown event: '+event);
    // Strict allow-list: no search text, names or form values are sent.
    const properties={};
    for (const key of ['course_id','level','free_only','weekly_hours','results_count','query_kind','error_field','error_type','source','eligible','eligible_results','search_id']) {
      if (['string','number','boolean'].includes(typeof data[key])) properties[key]=data[key];
    }
    const row={event,time:new Date().toISOString(),user_id:userId,session_id:sessionId,test_session:test,version:window.LAB_CONFIG?.version||'1',...properties};
    let rows=[];try{rows=JSON.parse(get(localStorage,'pp_events','[]'));}catch{}
    rows.push(row);put(localStorage,'pp_events',JSON.stringify(rows.slice(-1500)));
    put(sessionStorage,'pp_last',String(Date.now()));
    if(counter && !test) window.ym(counter,'reachGoal',event,{...properties,lab_version:row.version});
    window.dispatchEvent(new CustomEvent('lab:event',{detail:row}));
    return row;
  }
  window.labAnalytics={track,test,sessionId,connected:!!counter&&!test};
})();
