const total=9;let current=0,round=1,touches=[],charAnswers=[],charCurrent='',danceActive=false,danceTimeout=null,countdownInterval=null;
// function go(n){
//   document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
//   document.getElementById('s'+n).classList.add('active');current=n;
//   document.getElementById('progressBar').style.width=(n/(total-1)*100)+'%';
//   window.scrollTo(0,0);
//   if(n===1) showDoorClosing()
// }

function goToFinale() {
  // Сначала открываем финальный экран
  go(6);

  // Затем запускаем анимацию двери
  window.setTimeout(openFinalDoor, 80);
}

function go(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s' + n).classList.add('active');
  current = n;

  document.getElementById('progressBar').style.width =
    (n / (total - 1) * 100) + '%';

  window.scrollTo(0, 0);

  // if (n === 1) {
  //   showDoorClosing();

  //   setTimeout(() => {
  //     playDollLaugh();
  //   }, 7000);
  // }
  if(n===1){
    showDoorClosing();
    startDollAppearances();
  } else {
    stopDollAppearances();
  }
}

function showDoorClosing() {
  const old = document.querySelector('.door-transition');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'door-transition';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML =
    '<div class="door-panel left">' +
    '<span class="door-handle"></span></div>' +
    '<div class="door-panel right">' +
    '<span class="door-handle"></span></div>' +
    '<div class="door-seam"></div>';

  document.body.appendChild(overlay);

  // Воспроизводим звук закрытия, а не открытия двери
  playDoorCloseSound();

  setTimeout(() => overlay.remove(), 4000);
}
function playDoorCloseSound(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  if(!window.doorAudioCtx)window.doorAudioCtx=new AC();const a=window.doorAudioCtx;a.resume();const now=a.currentTime;
  // Длинный деревянный скрип: шум через медленно меняющийся фильтр.
  const len=Math.floor(a.sampleRate*1.5),buf=a.createBuffer(1,len,a.sampleRate),data=buf.getChannelData(0);
  for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len*.65);
  const src=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();src.buffer=buf;filter.type='bandpass';filter.frequency.setValueAtTime(420,now);filter.frequency.exponentialRampToValueAtTime(115,now+1.05);filter.Q.value=3;
  gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(.22,now+.18);gain.gain.setValueAtTime(.16,now+.55);gain.gain.exponentialRampToValueAtTime(.001,now+1.2);src.connect(filter);filter.connect(gain);gain.connect(a.destination);src.start(now);src.stop(now+1.25);
  // Низкий резонансный хлопок в момент встречи створок.
  const osc=a.createOscillator(),og=a.createGain();osc.type='triangle';osc.frequency.setValueAtTime(105,now+.88);osc.frequency.exponentialRampToValueAtTime(38,now+1.25);og.gain.setValueAtTime(.001,now+.86);og.gain.linearRampToValueAtTime(.75,now+.91);og.gain.exponentialRampToValueAtTime(.001,now+1.55);osc.connect(og);og.connect(a.destination);osc.start(now+.86);osc.stop(now+1.56);
  const nb=a.createBuffer(1,Math.floor(a.sampleRate*.24),a.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*(1-i/nd.length);
  const ns=a.createBufferSource(),nf=a.createBiquadFilter(),ng=a.createGain();ns.buffer=nb;nf.type='lowpass';nf.frequency.value=850;ng.gain.setValueAtTime(.001,now+.88);ng.gain.linearRampToValueAtTime(.5,now+.9);ng.gain.exponentialRampToValueAtTime(.001,now+1.17);ns.connect(nf);nf.connect(ng);ng.connect(a.destination);ns.start(now+.88);
 }catch(e){}
}
function makeHintsClickToOpen(){document.querySelectorAll('.notice').forEach((box,i)=>{if(box.querySelector('details'))return;const content=box.innerHTML;box.innerHTML='';const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Показать подсказку';const body=document.createElement('div');body.className='notice-content';body.innerHTML=content;details.append(summary,body);box.appendChild(details)})}
makeHintsClickToOpen();
const introText='Давным-давно, в этом самом месте, где мы сейчас находимся, стоял старый особняк. Его владелец, безумный изобретатель, проводил странные эксперименты. Однажды ночью раздался грохот, вспышка света… и особняк исчез. Говорят, что дух изобретателя до сих пор бродит здесь, охраняя свои секреты. Он оставляет загадки для смельчаков… Сегодня вы оказались в его ловушке. Сможете ли вы разгадать все тайны и выбраться?';
function draculaSpeak(text, opts={}){
 if(!('speechSynthesis' in window)){alert('Озвучка не поддерживается этим браузером');return}
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 u.lang='ru-RU';
 u.rate=opts.rate ?? 0.76;
 u.pitch=opts.pitch ?? 0.48;
 u.volume=1;
 const voices=speechSynthesis.getVoices();
 const v=voices.find(x=>x.lang&&x.lang.toLowerCase().startsWith('ru')&&/male|муж/i.test(x.name))
   ||voices.find(x=>x.lang&&x.lang.toLowerCase().startsWith('ru'));
 if(v)u.voice=v;
 speechSynthesis.speak(u);
}
function readIntro(){
 if(!('speechSynthesis' in window))return;
 if(speechSynthesis.speaking || speechSynthesis.pending){speechSynthesis.cancel();return;}
 draculaSpeak(introText,{rate:0.74,pitch:0.45});
}
document.getElementById('full').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(e){}};
// Atmospheric music synthesizer. Starts only after an explicit click.
let ctx=null,master=null,musicOn=false,musicNodes=[];
function audioSetup(){
 if(ctx)return;
 let AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)return;
 ctx=new AC();
 master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);

 // Шорохи ветра и протяжный призрачный вой, синтезируемые в браузере.
 // Медленные изменения фильтра создают ощущение порывов ветра.
 let buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),d=buffer.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.8;
 let wind=ctx.createBufferSource(),windFilter=ctx.createBiquadFilter(),windGain=ctx.createGain();
 wind.buffer=buffer;wind.loop=true;windFilter.type='lowpass';windFilter.frequency.value=650;windFilter.Q.value=.7;
 windGain.gain.value=.0;wind.connect(windFilter);windFilter.connect(windGain);windGain.connect(master);wind.start();
 let windLfo=ctx.createOscillator(),windLfoGain=ctx.createGain();
 windLfo.type='sine';windLfo.frequency.value=.11;windLfoGain.gain.value=420;
 windLfo.connect(windLfoGain);windLfoGain.connect(windFilter.frequency);windLfo.start();

 // Высокочастотный шорох веток/листьев.
 let hiss=ctx.createBufferSource(),hissFilter=ctx.createBiquadFilter(),hissGain=ctx.createGain();
 hiss.buffer=buffer;hiss.loop=true;hissFilter.type='bandpass';hissFilter.frequency.value=1700;hissFilter.Q.value=.45;
 hissGain.gain.value=0;hiss.connect(hissFilter);hissFilter.connect(hissGain);hissGain.connect(master);hiss.start();
 let hissLfo=ctx.createOscillator(),hissLfoGain=ctx.createGain();
 hissLfo.frequency.value=.07;hissLfoGain.gain.value=950;hissLfo.connect(hissLfoGain);hissLfoGain.connect(hissFilter.frequency);hissLfo.start();

 // Низкий, плавно меняющий высоту вой.
 let howl=ctx.createOscillator(),howlGain=ctx.createGain(),howlLfo=ctx.createOscillator(),howlLfoGain=ctx.createGain();
 howl.type='sine';howl.frequency.value=180;howlGain.gain.value=0;
 howlLfo.type='sine';howlLfo.frequency.value=.09;howlLfoGain.gain.value=85;
 howlLfo.connect(howlLfoGain);howlLfoGain.connect(howl.frequency);howl.connect(howlGain);howlGain.connect(master);
 howl.start();howlLfo.start();

 // Вой появляется волнами, а шорох остаётся на фоне.
 let now=ctx.currentTime;
 windGain.gain.setValueAtTime(0,now);windGain.gain.linearRampToValueAtTime(.22,now+2);
 hissGain.gain.setValueAtTime(0,now);hissGain.gain.linearRampToValueAtTime(.13,now+3);
 howlGain.gain.setValueAtTime(0,now);howlGain.gain.linearRampToValueAtTime(.07,now+4);
 const howlPulse=ctx.createOscillator(),pulseGain=ctx.createGain();
 howlPulse.frequency.value=.045;pulseGain.gain.value=.035;
 howlPulse.connect(pulseGain);pulseGain.connect(howlGain.gain);howlPulse.start();

 musicNodes.push(wind,hiss,howl,windLfo,hissLfo,howlLfo,howlPulse);
} 


const danceMusic = new Audio('sounds/skeleton-dance.mp3');
danceMusic.loop = true;
danceMusic.volume = 0.8;

async function musicStart() {
  try {
    await danceMusic.play();
    musicOn = true;
    document.getElementById('musicToggle').textContent = '♫ Музыка: вкл.';
  } catch (error) {
    console.error('Не удалось запустить музыку:', error);
    document.getElementById('danceStatus').textContent =
      'Не удалось запустить музыку. Проверь файл sounds/skeleton-dance.mp3';
  }
}

function musicStop() {
  danceMusic.pause();
  danceMusic.currentTime = 0;
  musicOn = false;
  document.getElementById('musicToggle').textContent = '♫ Музыка: выкл.';
}

document.getElementById('musicToggle').onclick = () =>
  musicOn ? musicStop() : musicStart();

function stopDance() {
  danceActive = false;
  clearTimeout(danceTimeout);
  clearInterval(countdownInterval);

  document.getElementById('danceTimer').textContent = '';
  document.getElementById('danceStart').disabled = false;
  document.getElementById('danceNext').disabled = true;
  document.getElementById('danceStatus').textContent =
    'Ведущий читает позу.';
}

const prompts = [
  'Вампир увидел на столе чеснок — замри от ужаса!',
  'Скелет понял, что потерял важную кость — ищи её взглядом!',
  'Изобретатель увидел, что его машина зависла — застынь в отчаянии!',
  'Зомби услышал шаги за дверью — замри и прислушайся!',
  'Привидение застряло в старой двери — покажи, как пытаешься выбраться!',
  'Ведьма летит на метле сквозь бурю — замри на вираже!',
  'Мумия обнаружила, что бинты развязались — застынь в удивлении!',
  'Оборотень услышал вой полной луны — замри, подняв голову!',
  'Монстр увидел себя в зеркале — покажи испуг!',
  'Скелет услышал музыку призрачного бала — застынь в самой странной танцевальной позе!'
];

function freezePrompt() {
  if (!danceActive) return;

  // Сначала выбираем и показываем позу
  danceActive = false;
  clearInterval(countdownInterval);

  const p = prompts[Math.floor(Math.random() * prompts.length)];
  document.getElementById('dancePrompt').textContent = p;
  document.getElementById('danceTimer').textContent = '';
  document.getElementById('danceStatus').textContent =
    'Все замерли! Ведущий проверяет, кто удержал позу.';

  // Музыка остановится через секунду после появления позы
  setTimeout(() => {
    musicStop();
    document.getElementById('danceStart').disabled = false;
    document.getElementById('danceNext').disabled = false;
  }, 7000);
}

function scheduleDanceStop() {
  clearTimeout(danceTimeout);
  clearInterval(countdownInterval);

  // Таймер работает скрыто
  document.getElementById('danceTimer').textContent = '';

  const secs = 7 + Math.floor(Math.random() * 13);
  danceTimeout = setTimeout(freezePrompt, secs * 1000);
}

document.getElementById('danceStart').onclick = async () => {
  await musicStart();
  if (danceMusic.paused) return;

  danceActive = true;
  document.getElementById('dancePrompt').textContent = 'Танцуем! Танцуем!';
  document.getElementById('danceStatus').textContent =
    'Музыка играет. Остановка произойдёт в случайный момент.';
  document.getElementById('danceStart').disabled = true;
  document.getElementById('danceNext').disabled = true;

  scheduleDanceStop();
};

document.getElementById('danceNext').onclick = async () => {
  await musicStart();
  if (danceMusic.paused) return;

  danceActive = true;
  document.getElementById('dancePrompt').textContent = 'Танцуем дальше!';
  document.getElementById('danceStatus').textContent =
    'Музыка играет. Ждите следующей случайной остановки.';
  document.getElementById('danceStart').disabled = true;
  document.getElementById('danceNext').disabled = true;

  scheduleDanceStop();
};


function nextRound(){if(round<5)round++;else round=1;document.getElementById('roundLabel').textContent='Раунд '+round+' из 5 — '+(round===1?'начните заново':'сделайте снимок');}
function resetRounds(){round=1;document.getElementById('roundLabel').textContent='Раунд 1 из 5 — подготовьте камеру'}
function showUploads(inputId,gridId,max,labels){document.getElementById(inputId).addEventListener('change',e=>{let files=[...e.target.files].filter(f=>f.type.startsWith('image/')).slice(0,max),grid=document.getElementById(gridId);grid.innerHTML='';for(let i=0;i<max;i++){let slot=document.createElement('div');slot.className='photo-slot';if(files[i]){let img=document.createElement('img');img.src=URL.createObjectURL(files[i]);img.alt=labels[i];slot.appendChild(img)}else{let span=document.createElement('span');span.textContent=labels[i];slot.appendChild(span)}grid.appendChild(slot)}})}
showUploads('roundPhotos','roundPhotoGrid',5,['Фото раунда 1','Фото раунда 2','Фото раунда 3','Фото раунда 4','Фото раунда 5']);
showUploads('winnerPhotos','winnerPhotoGrid',2,['Победитель 1','Победитель 2']);

function renderTouches(){let el=document.getElementById('touchAnswers');el.innerHTML='';if(!touches.length){el.innerHTML='<p class="small">Пока ответов нет.</p>';return}touches.forEach((x,i)=>{let p=document.createElement('p');p.textContent=(i+1)+'. Ответ: '+x.guess+(x.item?' · Предмет: '+x.item:'');el.appendChild(p)})}

function saveTouch() {
  const input = document.getElementById('touchGuess');
  const feedback = document.getElementById('touchFeedback');
  const answers = document.getElementById('touchAnswers');

  const guess = input.value.trim();

  if (!guess) {
    feedback.textContent = 'Сначала запиши свою догадку.';
    return;
  }

  const emptyMessage = answers.querySelector('.small');
  if (emptyMessage && emptyMessage.textContent === 'Пока ответов нет.') {
    answers.innerHTML = '';
  }

  const entry = document.createElement('p');
  entry.textContent = '🔎 ' + guess;
  answers.appendChild(entry);

  input.value = '';
  feedback.textContent = 'Догадка добавлена в журнал!';
}

function clearTouches(){touches=[];renderTouches()}
const monsters = [
  {emoji:'🦷', hint:'Два длинных острых клыка', answer:'Вампир'},
  {emoji:'🦴', hint:'Костлявая рука, найденная у лестницы', answer:'Скелет'},
  {emoji:'🖐️', hint:'Зелёная рука с длинными пальцами', answer:'Зомби'},
  {emoji:'👁️', hint:'Один бледный светящийся глаз в темноте', answer:'Привидение'},
  {emoji:'🐾', hint:'Когтистый след и клочок серой шерсти', answer:'Оборотень'},
  {emoji:'🧙', hint:'Остроконечная шляпа и странные колбы', answer:'Ведьма'},
  {emoji:'🧟', hint:'Медленно бредёт и стонет по ночам', answer:'Зомби'},
  {emoji:'🪦', hint:'Выходит из могилы ровно в полночь', answer:'Умертвие'},
  {emoji:'🕸️', hint:'Плетёт липкие сети в тёмных углах', answer:'Паучий монстр'},
  {emoji:'🐺', hint:'Воет на луну и боится серебра', answer:'Оборотень'},
  {emoji:'🧛', hint:'Не отражается в зеркале и спит в гробу', answer:'Вампир'},
  {emoji:'👻', hint:'Проходит сквозь стены и гасит свечи', answer:'Призрак'},
  {emoji:'🩹', hint:'Всё тело обмотано древними бинтами', answer:'Мумия'},
  {emoji:'🎃', hint:'Светится изнутри и улыбается страшной улыбкой', answer:'Тыквенный монстр'},
  {emoji:'🐈‍⬛', hint:'Чёрный кот сопровождает колдунью', answer:'Ведьмин кот'},
  {emoji:'🐍', hint:'Холодный взгляд и змеи вместо волос', answer:'Медуза Горгона'},
  {emoji:'🦇', hint:'Летает вверх ногами и прячется в пещере', answer:'Летучая мышь'},
  {emoji:'🪞', hint:'Появляется в зеркале, хотя за спиной никого нет', answer:'Зеркальный призрак'},
  {emoji:'🪱', hint:'Огромное существо ползёт под землёй', answer:'Подземный червь'},
  {emoji:'👹', hint:'Рога, клыки и огромная дубина', answer:'Огр'},
  {emoji:'🦑', hint:'Щупальца появляются из чёрной воды', answer:'Морской монстр'}
];


function renderMonsters(){let el=document.getElementById('monsterCards');el.innerHTML='';monsters.forEach((m,i)=>{let c=document.createElement('div');c.className='card';c.innerHTML='<div class="monster-image">'+m.emoji+'</div><span class="pill">Загадка '+(i+1)+'</span><p>'+m.hint+'</p><label>Ваш ответ</label><input type="text" id="monsterGuess'+i+'" placeholder="Кто это?"><button class="secondary" style="margin-top:8px" onclick="checkMonster('+i+')">Проверить</button><p id="monsterResult'+i+'" class="small" aria-live="polite"></p>';el.appendChild(c)})}
function checkMonster(i){let val=document.getElementById('monsterGuess'+i).value.trim();document.getElementById('monsterResult'+i).textContent=val?'Ответ записан: '+val+'. '+(val.toLowerCase()===monsters[i].answer.toLowerCase()?'Верно!':'Ведущий может открыть правильный ответ.'):'Впишите ответ.'}
function revealAllMonsters(){monsters.forEach((m,i)=>document.getElementById('monsterResult'+i).textContent='Правильный ответ: '+m.answer)}
function resetMonsters(){monsters.forEach((m,i)=>{document.getElementById('monsterGuess'+i).value='';document.getElementById('monsterResult'+i).textContent=''})}
renderMonsters();
function openEnvelope(){
 const button=document.getElementById('envelopeButton');
 const isOpen=button.classList.toggle('open');
//  document.getElementById('envelopeHint').textContent=isOpen?'Записка раскрыта. Прочитайте послание изобретателя вслух.':'Конверт снова запечатан. Нажмите, чтобы открыть.';
 if(isOpen && 'speechSynthesis' in window){
   speechSynthesis.cancel();
   draculaSpeak('Вы на верном пути… Чтобы открыть выход, докажите, что знаете всех обитателей моего дома.',{rate:0.7,pitch:0.42});
 }
}

let isDoorOpening = false;
let activeDoorSound = null;

function openEscapeDoor() {
  const scene = document.getElementById('escapeScene');

  if (scene) {
    scene.classList.add('opened');
  }

  if (isDoorOpening) return;
  isDoorOpening = true;

  if (activeDoorSound) {
    activeDoorSound.pause();
    activeDoorSound.currentTime = 0;
  }

  const doorSound = new Audio('sounds/open-door.mp3');
  activeDoorSound = doorSound;
  doorSound.volume = 0.8;

  const resetDoorSound = () => {
    isDoorOpening = false;

    if (activeDoorSound === doorSound) {
      activeDoorSound = null;
    }
  };

  const stopTimer = setTimeout(() => {
    doorSound.pause();
    doorSound.currentTime = 0;
    resetDoorSound();
  }, 4000);

  doorSound.addEventListener('ended', () => {
    clearTimeout(stopTimer);
    resetDoorSound();
  }, { once: true });

  doorSound.play().catch(error => {
    clearTimeout(stopTimer);
    console.warn('Не удалось воспроизвести звук двери:', error);
    resetDoorSound();
  });
}
let luckyParticipants=[];
let prizeWinners={subscription:null,headphones:null};

function buildLuckyBoard(){const raw=document.getElementById('participantNames').value;const names=[...new Set(raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean))];if(!names.length){document.getElementById('raffleResult').textContent='Сначала впишите хотя бы одно имя участника.';return}luckyParticipants=names.map((name,i)=>({id:i,name,won:false,photo:''}));prizeWinners={subscription:null,headphones:null};renderLuckyBoard();document.getElementById('drawSubscription').disabled=false;document.getElementById('drawHeadphones').disabled=false;document.getElementById('raffleResult').textContent='Доска готова! Можно разыгрывать абонемент и наушники. Каждый участник может выиграть только один приз.'}
function renderLuckyBoard(){const board=document.getElementById('luckyBoard');board.innerHTML='';luckyParticipants.forEach(p=>{const card=document.createElement('div');card.className='participant-card'+(p.won?' won':'');card.innerHTML='<span class="pin"></span><div class="participant-photo">'+(p.photo?'<img alt="Фото '+escapeHtml(p.name)+'" src="'+p.photo+'">':escapeHtml(p.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()))+'</div><div class="participant-name">'+escapeHtml(p.name)+'</div><label class="participant-upload-label">Добавить фото<input class="participant-upload" type="file" accept="image/*"></label><div class="won-cross">✕</div>';const input=card.querySelector('input[type=file]');input.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(!f.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{p.photo=reader.result;renderLuckyBoard()};reader.readAsDataURL(f)});board.appendChild(card)});}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function drawPrize(type){const eligible=luckyParticipants.filter(p=>!p.won);const result=document.getElementById('raffleResult');if(!luckyParticipants.length){result.textContent='Сначала создайте доску участников.';return}if(prizeWinners[type]){result.textContent='Этот приз уже разыгран: '+prizeWinners[type].name+'.';return}if(!eligible.length){result.textContent='Все участники уже выиграли или закончились участники. Новых победителей нет.';document.getElementById('drawSubscription').disabled=true;document.getElementById('drawHeadphones').disabled=true;return}const winner=eligible[Math.floor(Math.random()*eligible.length)];winner.won=true;prizeWinners[type]=winner;renderLuckyBoard();const prize=type==='subscription'?'абонемент на месяц бесплатного посещения':'наушники';result.textContent='🎉 Поздравляем, '+winner.name+'! Вы выиграли: '+prize+'! На карточке победителя появился крест — повторно он не участвует.';if(prizeWinners.subscription)document.getElementById('drawSubscription').disabled=true;if(prizeWinners.headphones)document.getElementById('drawHeadphones').disabled=true}
function resetLuckyBoard(){luckyParticipants=[];prizeWinners={subscription:null,headphones:null};document.getElementById('luckyBoard').innerHTML='<p class="small">Здесь появятся карточки участников — словно приколотые к доске.</p>';document.getElementById('drawSubscription').disabled=true;document.getElementById('drawHeadphones').disabled=true;document.getElementById('raffleResult').textContent='Розыгрыш сброшен. Введите имена и создайте доску заново.'}


let groupPhotoObjectUrl=null;
function loadGroupPhoto(event){
 const file=event.target.files&&event.target.files[0];if(!file)return;
 if(!file.type.startsWith('image/')){document.getElementById('photoStatus').textContent='Пожалуйста, выберите файл изображения.';return;}
 if(groupPhotoObjectUrl)URL.revokeObjectURL(groupPhotoObjectUrl);
 groupPhotoObjectUrl=URL.createObjectURL(file);
 const img=document.getElementById('groupPhotoPreview');img.src=groupPhotoObjectUrl;img.hidden=false;
 document.getElementById('photoPlaceholder').hidden=true;
 document.getElementById('groupPhotoFrame').classList.remove('sent');
 document.getElementById('sendGroupPhoto').disabled=false;
 document.getElementById('photoStatus').textContent='Фото добавлено. Нажмите «Отправить фото», чтобы добавить призрака изобретателя.';
}

async function sendGroupPhoto() {
  const img = document.getElementById('groupPhotoPreview');
  if (!img.src || img.hidden) return;

  try {
    await img.decode();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const max = 2400;
    const scale = Math.min(
      1,
      max / Math.max(img.naturalWidth, img.naturalHeight)
    );

    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pad = Math.round(
      Math.min(canvas.width, canvas.height) * 0.03
    );

    // Загружаем фотографию призрака.
    const ghost = new Image();
    ghost.src = 'images/ghost.png';

    await ghost.decode();

    // Размещаем призрака в правом верхнем углу.
    const maxSize = Math.min(canvas.width, canvas.height) * 0.22;
    const ratio = Math.min(
      maxSize / ghost.naturalWidth,
      maxSize / ghost.naturalHeight
    );

    const width = ghost.naturalWidth * ratio;
    const height = ghost.naturalHeight * ratio;

    ctx.drawImage(
      ghost,
      canvas.width - width - pad,
      pad,
      width,
      height
    );

    canvas.toBlob(blob => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'obshchee-foto-s-prizrakom.png';
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 2000);

    document.getElementById('photoGhost').hidden = false;
    document.getElementById('groupPhotoFrame').classList.add('sent')
      // document.getElementById('photoStatus').textContent =
      //   'Призрак появился на фото! Готовое изображение скачано.';
    }, 'image/png');

  } catch (error) {
    console.error('Ошибка обработки фотографии:', error);

    document.getElementById('photoStatus').textContent =
      'Не удалось загрузить фото призрака. Проверь файл images/ghost.png';
  }
}

function clearGroupPhoto(){
 const input=document.getElementById('groupPhotoInput'),img=document.getElementById('groupPhotoPreview');
 input.value='';img.removeAttribute('src');img.hidden=true;document.getElementById('photoPlaceholder').hidden=false;
 document.getElementById('groupPhotoFrame').classList.remove('sent');document.getElementById('sendGroupPhoto').disabled=true;
 document.getElementById('photoStatus').textContent='Выберите фотографию с устройства.';
 if(groupPhotoObjectUrl){URL.revokeObjectURL(groupPhotoObjectUrl);groupPhotoObjectUrl=null;}
}


let dollLaughAudio = null;

function playDollLaugh() {
  if (dollLaughAudio && !dollLaughAudio.paused) return;

  if (!dollLaughAudio) {
    dollLaughAudio = new Audio('sounds/doll-laugh.mp3');
    dollLaughAudio.volume = 0.7;
  }

  dollLaughAudio.currentTime = 0;
  dollLaughAudio.loop = false;

  let plays = 0;

  dollLaughAudio.onended = () => {
    plays++;

    if (plays < 1) {
      dollLaughAudio.currentTime = 0;
      dollLaughAudio.play().catch(console.error);
    }
  };

  dollLaughAudio.play().catch(error => {
    console.log('Не удалось воспроизвести смех куклы:', error);
  });
}

// Кукла внезапно выглядывает из случайных углов и с боков экрана
let dollAppearanceTimer = null;
let dollHideTimer = null;

function startDollAppearances() {
  stopDollAppearances();
  scheduleDollAppearance(1800 + Math.random() * 1600);
}

function scheduleDollAppearance(delay) {
  clearTimeout(dollAppearanceTimer);

  dollAppearanceTimer = setTimeout(() => {
    if (current !== 1) return;

    let doll = document.getElementById('scaryDoll');
    if (!doll) {
      doll = document.createElement('div');
      doll.id = 'scaryDoll';
      doll.className = 'scary-doll';
      doll.setAttribute('aria-hidden', 'true');

      const img = document.createElement('img');
      img.src = 'images/doll.png'; // имя файла с твоей картинкой
      img.alt = '';
      img.className = 'scary-doll-image';

      doll.appendChild(img);
      document.body.appendChild(doll);
    }

    const spots = [
    {
      left: '-90px',
      top: '20vh',
      origin: 'left center',
      turn: '0deg',
      peekStart: '-100%'
    },
    {
      right: '-90px',
      top: '25vh',
      origin: 'right center',
      turn: '0deg',
      peekStart: '100%'
    },
    {
      left: '-90px',
      bottom: '3vh',
      origin: 'left bottom',
      turn: '0deg',
      peekStart: '-100%'
    },
    {
      right: '-90px',
      bottom: '3vh',
      origin: 'right bottom',
      turn: '0deg',
      peekStart: '100%'
    }
  ];

    const spot = spots[Math.floor(Math.random() * spots.length)];

    doll.style.left = '';
    doll.style.right = '';
    doll.style.top = '';
    doll.style.bottom = '';

    Object.assign(doll.style, spot);
    doll.style.setProperty('--peek-start', spot.peekStart);

    const tilt = spot.peekStart === '-100%' ? '18deg' : '-18deg';
    doll.style.setProperty('--peek-tilt', tilt);

    doll.classList.remove('doll-peek');
    void doll.offsetWidth;
    doll.classList.add('doll-peek');

    // Воспроизводим смех при появлении куклы
    playDollLaugh();

    clearTimeout(dollHideTimer);

    dollHideTimer = setTimeout(() => {
      doll.classList.remove('doll-peek');
    }, 1100 + Math.random() * 700);

    scheduleDollAppearance(6800 + Math.random() * 3400);
  }, delay);
}

function stopDollAppearances() {
  clearTimeout(dollAppearanceTimer);
  clearTimeout(dollHideTimer);

  const doll = document.getElementById('scaryDoll');

  if (doll) {
    doll.classList.remove('doll-peek');
  }
}

function openFinalDoor() {
  if (document.querySelector('.final-door-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'final-door-overlay';

  overlay.innerHTML = `
    <div class="final-door-light"></div>
    <div class="final-door-leaf left">
      <span class="final-door-handle"></span>
    </div>
    <div class="final-door-leaf right">
      <span class="final-door-handle"></span>
    </div>
  `;

  document.body.appendChild(overlay);

  // Используем твой существующий звук открытия двери
  openEscapeDoor();

  // Даём браузеру отрисовать закрытые двери перед анимацией
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('opening');
    });
  });

  setTimeout(() => {
    overlay.remove();

    const scene = document.getElementById('escapeScene');

    if (scene) {
      scene.classList.add('door-opened');
    }
  }, 2600);
  }

function openFinalDoor() {
  if (document.querySelector('.final-door-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'final-door-overlay';

  overlay.innerHTML = `
    <div class="final-door-light"></div>

    <div class="final-door-leaf left">
      <span class="final-door-handle"></span>
    </div>

    <div class="final-door-leaf right">
      <span class="final-door-handle"></span>
    </div>
  `;

  document.body.appendChild(overlay);

  openEscapeDoor();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('opening');
    });
  });

  setTimeout(() => {
    overlay.remove();

    const button = document.getElementById('finalDoorButton');

    if (button) {
      button.disabled = true;
      button.textContent = '✨ Вы выбрались из дома!';
    }
  }, 2600);
}