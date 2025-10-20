/* ===== Утилита: анимация клика ===== */
function animateClick(el){
  if(!el) return;
  el.classList.add('click-anim');
  setTimeout(()=> el.classList.remove('click-anim'), 180);
}

/* ===== Утилита: ripple на клике ===== */
function addRipple(e, color = 'gray'){
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  // диаметр волны — чтобы накрыть весь элемент
  const size = Math.max(rect.width, rect.height) * 2;

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const wave = document.createElement('span');
  wave.className = 'ripple ' + (color === 'gold' ? 'golden' : 'gray');
  wave.style.width = wave.style.height = size + 'px';
  wave.style.left = x + 'px';
  wave.style.top  = y + 'px';

  // очищаем предыдущие волны, если накопились
  el.querySelectorAll('.ripple').forEach(r => r.remove());

  el.appendChild(wave);
  wave.addEventListener('animationend', () => wave.remove());
}

/* ===== Переключатель темы (кнопка в хедере) ===== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

function applyThemeIcon(theme){
  // меняем svg в кнопке
  if (theme === 'dark') {
    themeIcon.src = 'icon-moon.svg';
    themeIcon.alt = 'Тёмная тема';
  } else {
    themeIcon.src = 'icon-sun.svg';
    themeIcon.alt = 'Светлая тема';
  }
}

function getInitialTheme(){
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  // если не сохранено — смотрим системную
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// применяем при загрузке
const initialTheme = getInitialTheme();
document.documentElement.setAttribute('data-theme', initialTheme);
applyThemeIcon(initialTheme);

// клик по кнопке
themeToggle?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  applyThemeIcon(next);
});

// Header "Войти": press-эффект (без конфликтов)
(function(){
  const btn = document.getElementById('loginBtnHeader');
  if (!btn) return;
  if (btn.__pressBound) return; btn.__pressBound = true;

  const pressOn  = ()=> btn.classList.add('is-pressing');
  const pressOff = ()=> btn.classList.remove('is-pressing');

  btn.addEventListener('mousedown', pressOn);
  btn.addEventListener('pointerdown', pressOn);
  ['mouseup','mouseleave','pointerup','pointerleave','blur'].forEach(ev=> btn.addEventListener(ev, pressOff));
  btn.addEventListener('click', ()=>{
    pressOn(); setTimeout(pressOff, 120);
  });
})();

/* ===== Профильное меню (список) ===== */
const profileBtn  = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');

function toggleProfileMenu(force){
  if(!profileBtn || !profileMenu) return;
  const willOpen = force ?? !profileMenu.classList.contains('active');
  profileMenu.classList.toggle('active', willOpen);
  profileBtn.setAttribute('aria-expanded', String(willOpen));

  // фокус на первый пункт при открытии
  if (willOpen) {
    const first = profileMenu.querySelector('.profile-list a');
    first?.focus({ preventScroll:true });
  }
}

profileBtn?.addEventListener('click', ()=>{
  animateClick(profileBtn);
});

profileBtn?.addEventListener('click', (e)=>{
  e.stopPropagation();
  addRipple(e, 'gray');        // волна серая
  animateClick(profileBtn);    // лёгкое сжатие
  toggleProfileMenu();         // открыть/закрыть меню
});

// закрытие по клику вне
document.addEventListener('click', (e)=>{
  if (!profileMenu.contains(e.target) && e.target !== profileBtn) {
    toggleProfileMenu(false);
  }
});

// закрытие по Esc и навигация стрелками
document.addEventListener('keydown', (e)=>{
  if (!profileMenu.classList.contains('active')) return;

  const items = Array.from(profileMenu.querySelectorAll('.profile-list a'));
  const idx = items.indexOf(document.activeElement);

  if (e.key === 'Escape') {
    toggleProfileMenu(false);
    profileBtn?.focus();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = items[(idx + 1 + items.length) % items.length] || items[0];
    next.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = items[(idx - 1 + items.length) % items.length] || items.at(-1);
    prev.focus();
  }
});


/* ===== Модалка тарифов Plus ===== */
const plusTitle   = document.getElementById('plusTitle');
const tariffModal = document.getElementById('tariffModal');
const modalClose  = document.getElementById('modalClose');
const payBtn      = document.getElementById('payBtn');

let selectedPlan = null;

function openModal(){
  tariffModal?.classList.add('active');
  document.body.classList.add('modal-open');
  tariffModal?.setAttribute('aria-hidden','false');
}
function closeModal(){
  tariffModal?.classList.remove('active');
  document.body.classList.remove('modal-open');
  tariffModal?.setAttribute('aria-hidden','true');
}
plusTitle?.addEventListener('click', (e)=>{
  addRipple(e, 'gold');        // золотая волна
  animateClick(plusTitle);     // лёгкое сжатие
  openModal();                 // открыть тарифы
});
modalClose?.addEventListener('click', closeModal);
tariffModal?.addEventListener('click', (e)=>{ if(e.target === tariffModal) closeModal(); });
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && tariffModal?.classList.contains('active')) closeModal(); });
plusTitle?.addEventListener('click', ()=>{
  animateClick(plusTitle);
});

/* выбор тарифа */
document.querySelectorAll('.tariff-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    document.querySelectorAll('.tariff-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPlan = card.getAttribute('data-plan');
    payBtn?.removeAttribute('disabled');
  });
});

/* оплата — заглушка */
payBtn?.addEventListener('click', ()=>{
  if(!selectedPlan) return;
  alert('Оплата тарифа: ' + selectedPlan + ' — функция в разработке');
  closeModal();
});

/* ===== Подсказки (тач-клик) ===== */
document.querySelectorAll('.info-icon').forEach(icon=>{
  icon.addEventListener('click',(e)=>{
    e.stopPropagation();
    document.querySelectorAll('.info-icon.active').forEach(el=>{ if(el!==icon) el.classList.remove('active'); });
    icon.classList.toggle('active');
  });
});
document.addEventListener('click',()=> document.querySelectorAll('.info-icon.active').forEach(el=>el.classList.remove('active')));

/* ===== Аниме-тян: моргание + рот при печати (управлялка AvatarTyping) ===== */
(function(){
  const root = document.getElementById('animeAvatar'); // .anime-rect
  if(!root) return;

  const eyesOpen   = root.querySelector('.eyes.open');
  const eyesClosed = root.querySelector('.eyes.closed');
  const mouthOpen  = root.querySelector('.mouth.open');
  const mouthClose = root.querySelector('.mouth.closed');

  const show = el => el && (el.style.opacity = '1');
  const hide = el => el && (el.style.opacity = '0');

  let typingLock = false;
  let blinkTimer = null;

  function setEyes(state){ state==='closed' ? (show(eyesClosed),hide(eyesOpen)) : (show(eyesOpen),hide(eyesClosed)); }
  function setMouth(state){ state==='open'   ? (show(mouthOpen), hide(mouthClose)) : (show(mouthClose), hide(mouthOpen)); }

  function blinkOnce(){ if(typingLock) return; setEyes('closed'); setTimeout(()=>setEyes('open'), 120); }
  function startBlink(){ stopBlink(); blinkTimer = setInterval(blinkOnce, 3000); }
  function stopBlink(){ if(blinkTimer) clearInterval(blinkTimer); blinkTimer = null; }

  function startTyping(){ typingLock = true; root.classList.add('is-typing'); setEyes('open'); setMouth('open'); stopBlink(); }
  function stopTyping(){  typingLock = false; root.classList.remove('is-typing'); setMouth('closed'); setEyes('open'); startBlink(); }

  window.AvatarTyping = { start:startTyping, stop:stopTyping };
  setEyes('open'); setMouth('closed'); startBlink();
})();

/* ===== Встроенный чат + история + реалистичный рот при печати ===== */
document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput    = document.getElementById('chatInput');
  const chatSend     = document.getElementById('chatSend');
  const chatClear    = document.getElementById('chatClear');

  const avatarRoot   = document.getElementById('animeAvatar');
  const mouthOpenEl  = avatarRoot?.querySelector('.mouth.open');
  const mouthCloseEl = avatarRoot?.querySelector('.mouth.closed');

  const show = el => el && (el.style.opacity = '1');
  const hide = el => el && (el.style.opacity = '0');

  const VOWELS   = new Set('аеёиоуыэюяАЕЁИОУЫЭЮЯ'.split(''));
  const LABIALS  = new Set('пбмПБМ'.split(''));
  const PLOSIVES = new Set('пбтдкгПБТДКГ'.split(''));
  const PUNCT    = new Set([',',';','.',':','!','?','…']);
  const SPACE    = ' ';

  function varyOpenShape() {
    if (!mouthOpenEl) return;
    mouthOpenEl.style.transform = `scaleY(${0.92 + Math.random() * 0.16})`;
  }
  function resetShape() {
    if (!mouthOpenEl) return;
    mouthOpenEl.style.transform = 'none';
  }

  let history = JSON.parse(localStorage.getItem('chatHistory')) || [];

  function renderHistory() {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    if (!history.length) {
      chatMessages.innerHTML = '<div class="empty">Пока пусто. Напишите первое сообщение →</div>';
    } else {
      history.forEach(m => {
        const d = document.createElement('div');
        d.className = 'msg ' + m.sender;
        d.textContent = m.text;
        chatMessages.appendChild(d);
      });
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addMessage(text, sender = 'user') {
    history.push({ sender, text });
    localStorage.setItem('chatHistory', JSON.stringify(history));
    renderHistory();
  }

  async function typewriteBot(fullText, { wpm = 140 } = {}) {
    if (!chatMessages) return;
    const bubble = document.createElement('div');
    bubble.className = 'msg bot';
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const cps = (wpm * 5) / 60;
    const baseDelay = 1000 / Math.max(1, cps);
    const PUNCT_PAUSE = { ',':120, ';':140, ':':160, '.':260, '!':300, '?':300, '…':320 };

    window.AvatarTyping?.start();

    let mouthT1 = null, mouthT2 = null;
    const clearMouthTimers = () => { if (mouthT1) clearTimeout(mouthT1); if (mouthT2) clearTimeout(mouthT2); mouthT1 = mouthT2 = null; };
    const setOpen   = () => { show(mouthOpenEl); hide(mouthCloseEl); varyOpenShape(); };
    const setClosed = () => { hide(mouthOpenEl); show(mouthCloseEl); resetShape();   };

    for (let i = 0; i < fullText.length; i++) {
      const ch = fullText[i];

      bubble.textContent += ch;

      let delay = baseDelay;
      if (PUNCT.has(ch)) delay += PUNCT_PAUSE[ch];
      if (ch === SPACE)  delay += Math.random() < 0.15 ? 40 : 0;

      clearMouthTimers();

      if (VOWELS.has(ch)) {
        setOpen();
      } else if (LABIALS.has(ch)) {
        setClosed();
        mouthT1 = setTimeout(setOpen, Math.min(110, delay * 0.45));
      } else if (PLOSIVES.has(ch)) {
        setOpen();
        mouthT1 = setTimeout(setClosed, Math.min(60, delay * 0.35));
        mouthT2 = setTimeout(setOpen,   Math.min(140, delay * 0.75));
      } else if (PUNCT.has(ch) || ch === SPACE) {
        setClosed();
      } else {
        setOpen();
        mouthT1 = setTimeout(setClosed, Math.min(70, delay * 0.4));
        mouthT2 = setTimeout(setOpen,   Math.min(130, delay * 0.8));
      }

      await new Promise(r => setTimeout(r, delay));
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    history.push({ sender: 'bot', text: fullText });
    localStorage.setItem('chatHistory', JSON.stringify(history));

    clearMouthTimers();
    setClosed();
    window.AvatarTyping?.stop();
  }

  function handleSend() {
    const text = chatInput?.value?.trim();
    if (!text) return;
    addMessage(text, 'user');
    if (chatInput) chatInput.value = '';

    const reply = `Это автоответ: "${text}". Анимация рта синхронизирована с текстом.`;
    typewriteBot(reply, { wpm: 140 });
  }

  document.getElementById('chatSend')?.addEventListener('click', handleSend);
  document.getElementById('chatInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

  document.getElementById('chatClear')?.addEventListener('click', () => {
    if (confirm('Очистить историю чата?')) {
      history = [];
      localStorage.removeItem('chatHistory');
      renderHistory();
    }
  });

  renderHistory();

  if (!history.length && chatMessages) {
    setTimeout(() => {
      typewriteBot('Привет! Я помогу с правилами и ситуациями на дороге.', { wpm: 135 });
    }, 400);
  }
});

/* ========= Страница: Профиль ========= */
(function(){
  const scope = document.querySelector('.profile-grid');
  if (!scope) return; // не на странице профиля

  // Поля профиля
  const fldName   = document.getElementById('fldName');
  const fldEmail  = document.getElementById('fldEmail');
  const fldPhone  = document.getElementById('fldPhone');
  const fldRegion = document.getElementById('fldRegion');
  const fldLic    = document.getElementById('fldLicense');
  const fldGoal   = document.getElementById('fldGoal');

  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const saveHint       = document.getElementById('saveHint');

  // Безопасность / сессии / подписка
  const btnChangePass  = document.getElementById('btnChangePass');
  const chk2fa         = document.getElementById('chk2fa');
  const btnSignOutAll  = document.getElementById('btnSignOutAll');

  const btnManageSub   = document.getElementById('btnManageSub');
  const subState       = document.getElementById('subState');
  const subPlan        = document.getElementById('subPlan');

  const STORAGE_PROFILE = 'ap_profile_v1';
  const STORAGE_ACCOUNT = 'ap_account_v1'; // 2FA, подписка

  const get = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch(e){ return {}; } };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // Инициализация из storage
  (function init(){
    const p = get(STORAGE_PROFILE);
    if (p.name)   fldName.value   = p.name;
    if (p.email)  fldEmail.value  = p.email;       // у тебя readonly, но подхватим если когда-то будет
    if (p.phone)  fldPhone.value  = p.phone;
    if (p.region) fldRegion.value = p.region;
    if (p.lic)    fldLic.value    = p.lic;
    if (p.goal)   fldGoal.value   = p.goal;

    const a = get(STORAGE_ACCOUNT);
    if (typeof a.twofa === 'boolean') chk2fa.checked = a.twofa;

    // подписка (простая симуляция состояния)
    if (a.sub && a.sub.active){
      subState.textContent = 'Активна';
      subPlan.textContent  = a.sub.plan || '—';
      btnManageSub.textContent = 'Управлять';
    } else {
      subState.textContent = 'Не активна';
      subPlan.textContent  = '—';
      btnManageSub.textContent = 'Оформить';
    }
  })();

  // Сохранение профиля
  btnSaveProfile?.addEventListener('click', ()=>{
    const next = {
      name:   fldName?.value?.trim() || '',
      email:  fldEmail?.value?.trim() || '',
      phone:  fldPhone?.value?.trim() || '',
      region: fldRegion?.value?.trim() || '',
      lic:    fldLic?.value || '',
      goal:   fldGoal?.value || ''
    };
    set(STORAGE_PROFILE, next);
    if (saveHint){ saveHint.textContent = 'Сохранено'; setTimeout(()=> saveHint.textContent='', 2000); }
  });

  // Сменить пароль (заглушка)
  btnChangePass?.addEventListener('click', ()=>{
    const p1 = prompt('Введите новый пароль');
    if (!p1) return;
    if (p1.length < 6) { alert('Пароль слишком короткий (минимум 6 символов)'); return; }
    alert('Пароль обновлён (демо). В реальном приложении здесь будет серверный запрос.');
  });

  // Включение/выключение 2FA (локально)
  chk2fa?.addEventListener('change', ()=>{
    const a = get(STORAGE_ACCOUNT);
    a.twofa = chk2fa.checked;
    set(STORAGE_ACCOUNT, a);
  });

  // Завершить все сессии (заглушка)
  btnSignOutAll?.addEventListener('click', ()=>{
    if (!confirm('Завершить все активные сессии на устройствах?')) return;
    alert('Все сессии завершены (демо). В реальном приложении — запрос на сервер.');
  });

  // Подписка Plus — открыть общую модалку тарифов
  btnManageSub?.addEventListener('click', ()=>{
    // функция openModal() уже объявлена выше в скрипте (секция тарифов)
    if (typeof openModal === 'function') {
      openModal();
    } else {
      // на случай, если кто-то переименовал хелпер
      document.getElementById('tariffModal')?.classList.add('active');
      document.body.classList.add('modal-open');
    }
  });

  // (Опционально) реакция на оплату в модалке — просто сохраняем выбранный план
  const payBtn = document.getElementById('payBtn');
  payBtn?.addEventListener('click', ()=>{
    // selectedPlan объявлен выше — если вдруг изменится, подхватим из кнопки
    const selected = document.querySelector('.tariff-card.selected')?.getAttribute('data-plan');
    if (!selected) return;
    const a = get(STORAGE_ACCOUNT);
    a.sub = { active: true, plan: selected };
    set(STORAGE_ACCOUNT, a);

    // обновим вид на карточке
    subState.textContent = 'Активна';
    subPlan.textContent  = selected;
    btnManageSub.textContent = 'Управлять';
  });
})();


/* ========= Страница: Настройки ========= */
(function(){
  const scope = document.querySelector('.settings-grid');
  if (!scope) return; // не на странице настроек

  // Селекторы
  const themeRadios = scope.querySelectorAll('input[name="themeMode"]');

  const ntfReminders = scope.querySelector('#ntfReminders');
  const ntfNews = scope.querySelector('#ntfNews');
  const ntfTime = scope.querySelector('#ntfTime');

  const privacyChatLocal = scope.querySelector('#privacyChatLocal');
  const privacyAnon = scope.querySelector('#privacyAnon');
  const btnClearLocal = scope.querySelector('#btnClearLocal');

  const trainMode = scope.querySelector('#trainMode');
  const rndOrder = scope.querySelector('#rndOrder');
  const skipLearned = scope.querySelector('#skipLearned');

  const langUI = scope.querySelector('#langUI');

  const btnReset = scope.querySelector('#btnReset');
  const btnSave = scope.querySelector('#btnSaveSettings');
  const saveHint = scope.querySelector('#saveHint');

  const STORAGE_KEY = 'ap_settings_v1';
  function loadSettings(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ return {}; }
  }
  function saveSettings(obj){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function applyThemeMode(mode){
    if (mode === 'light' || mode === 'dark') {
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
    } else {
      const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
      const mode2 = sysDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', mode2);
      localStorage.setItem('theme', mode2);
    }
  }

  // Инициализация из localStorage
  const s = loadSettings();
  (function init(){
    // theme
    const m = s.themeMode || 'system';
    themeRadios.forEach(r => r.checked = (r.value === m));
    applyThemeMode(m);

    // notifications (оставлены на будущее, если вернёшь эту секцию)
    if (ntfReminders) ntfReminders.checked = !!s.ntfReminders;
    if (ntfNews) ntfNews.checked = s.ntfNews !== false;
    if (ntfTime) ntfTime.value = s.ntfTime || '19:00';

    // privacy
    privacyChatLocal.checked = s.privacyChatLocal !== false;
    privacyAnon.checked = s.privacyAnon !== false;

    // exam
    trainMode.value = s.trainMode || 'assist';
    rndOrder.checked = s.rndOrder !== false;
    skipLearned.checked = !!s.skipLearned;

    // lang
    langUI.value = s.langUI || 'ru';

    // instructor (если уже сохранён)
    const instructorSel = scope.querySelector('#instructorStyle');
    if (instructorSel){
      instructorSel.value = s.instructorStyle || instructorSel.value;
    }
  })();

  // Слушатели
  themeRadios.forEach(r => r.addEventListener('change', () => applyThemeMode(r.value)));

  btnClearLocal?.addEventListener('click', () => {
    if (confirm('Очистить локальные данные (история чата, кэш интерфейса)?')) {
      localStorage.removeItem('chatHistory');
      alert('Локальные данные очищены.');
    }
  });

  // Сброс и сохранение
  btnReset?.addEventListener('click', ()=>{
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  btnSave?.addEventListener('click', ()=>{
    const next = loadSettings();
    next.themeMode = [...themeRadios].find(r=>r.checked)?.value || 'system';

    if (ntfReminders) next.ntfReminders = ntfReminders.checked;
    if (ntfNews)      next.ntfNews      = ntfNews.checked;
    if (ntfTime)      next.ntfTime      = ntfTime.value;

    next.privacyChatLocal = privacyChatLocal.checked;
    next.privacyAnon      = privacyAnon.checked;

    next.trainMode   = trainMode.value;
    next.rndOrder    = rndOrder.checked;
    next.skipLearned = skipLearned.checked;

    next.langUI = langUI.value;

    // instructor
    const instructorSel = scope.querySelector('#instructorStyle');
    if (instructorSel) next.instructorStyle = instructorSel.value;

    saveSettings(next);
    if (saveHint){ saveHint.textContent = 'Сохранено'; setTimeout(()=> saveHint.textContent = '', 2000); }
  });
})();

/* ========= Глобально: применить выбор инструктора к документу ========= */
(function(){
  try{
    const s = JSON.parse(localStorage.getItem('ap_settings_v1')) || {};
    if (s.instructorStyle) {
      document.documentElement.setAttribute('data-instructor', s.instructorStyle);
    }
  }catch(e){}
})();


/* ========= Страница: Вход (с иконкой глаза) ========= */
(function(){
  const form = document.getElementById('loginForm');
  if (!form) return;

  const email = document.getElementById('loginEmail');
  const pwd   = document.getElementById('loginPassword');
  const errEmail = document.getElementById('errEmail');
  const errPwd   = document.getElementById('errPwd');
  const togglePwd = document.getElementById('togglePwd');
  const remember  = document.getElementById('rememberMe');
  const forgot    = document.getElementById('forgotLink');

  // показать/скрыть пароль (меняем иконку + aria-label)
  togglePwd?.addEventListener('click', ()=>{
    const isPass = pwd.type === 'password';
    pwd.type = isPass ? 'text' : 'password';
    togglePwd.setAttribute('aria-label', isPass ? 'Скрыть пароль' : 'Показать пароль');
    const icon = togglePwd.querySelector('img');
    if (icon) icon.src = isPass ? 'eye-off.svg' : 'eye.svg';
    pwd.focus();
  });

  // «Забыли пароль?» — демо
  forgot?.addEventListener('click', (e)=>{
    e.preventDefault();
    alert('Сброс пароля: на реальном проекте тут будет форма отправки письма.');
  });

  function validate(){
    let valid = true;
    errEmail.textContent = '';
    errPwd.textContent = '';

    const v = (email.value || '').trim();
    if (!v){
      errEmail.textContent = 'Введите email';
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){
      errEmail.textContent = 'Похоже, это не email';
      valid = false;
    }

    if (!pwd.value){
      errPwd.textContent = 'Введите пароль';
      valid = false;
    } else if (pwd.value.length < 6){
      errPwd.textContent = 'Минимум 6 символов';
      valid = false;
    }
    return valid;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!validate()) return;

    // DEMO: «авторизация» локально
    const account = {
      email: (email.value || '').trim(),
      remember: !!remember.checked,
      lastLoginAt: new Date().toISOString()
    };
    try{
      localStorage.setItem('ap_auth_v1', JSON.stringify(account));
      alert('Вход выполнен (демо). Переходим в профиль.');
      window.location.href = 'profile.html';
    }catch(err){
      alert('Не удалось сохранить сессию в localStorage.');
    }
  });
})();


/* ========= Страница: Регистрация ========= */
(function(){
  const form = document.getElementById('registerForm');
  if (!form) return;

  const name  = document.getElementById('regName');
  const email = document.getElementById('regEmail');
  const pwd1  = document.getElementById('regPassword');
  const pwd2  = document.getElementById('regPassword2');
  const agree = document.getElementById('regAgree');

  const errEmail = document.getElementById('errRegEmail');
  const errPwd   = document.getElementById('errRegPwd');
  const errPwd2  = document.getElementById('errRegPwd2');
  const errAgree = document.getElementById('errRegAgree');

  function bindEye(btnId, input){
    const btn = document.getElementById(btnId);
    btn?.addEventListener('click', ()=>{
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.setAttribute('aria-label', isPass ? 'Скрыть пароль' : 'Показать пароль');
      const icon = btn.querySelector('img');
      if (icon) icon.src = isPass ? 'eye-off.svg' : 'eye.svg';
      input.focus();
    });
  }
  bindEye('togglePwdReg1', pwd1);
  bindEye('togglePwdReg2', pwd2);

  function validate(){
    let ok = true;
    errEmail.textContent = '';
    errPwd.textContent   = '';
    errPwd2.textContent  = '';
    errAgree.textContent = '';

    const vEmail = (email.value || '').trim();
    if (!vEmail){
      errEmail.textContent = 'Введите email';
      ok = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(vEmail)){
      errEmail.textContent = 'Похоже, это не email';
      ok = false;
    }

    if (!pwd1.value || pwd1.value.length < 6){
      errPwd.textContent = 'Пароль минимум 6 символов';
      ok = false;
    }
    if (pwd2.value !== pwd1.value){
      errPwd2.textContent = 'Пароли не совпадают';
      ok = false;
    }

    if (!agree.checked){
      errAgree.textContent = 'Нужно принять условия';
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!validate()) return;

    const profile = {
      name: (name.value || '').trim(),
      email: (email.value || '').trim()
    };
    const auth = {
      email: profile.email,
      lastLoginAt: new Date().toISOString()
    };
    try{
      localStorage.setItem('ap_profile_v1', JSON.stringify(profile));
      localStorage.setItem('ap_auth_v1', JSON.stringify(auth));
      alert('Регистрация выполнена (демо). Переходим в профиль.');
      window.location.href = 'profile.html';
    }catch(err){
      alert('Не удалось сохранить данные в localStorage.');
    }
  });
})();

/* ========= Страница: Тренировка ========= */
(function(){
  const page = document.querySelector('.training-page');
  if (!page) return;

  // ====== ДЕМО-данные (можешь заменить на API)
  const DEMO_QUESTIONS = [
    {
      id: 1,
      theme: 'Дорожные знаки',
      text: 'Какой знак запрещает движение всех без исключения транспортных средств?',
      img: '', // 'images/q1.jpg'
      answers: [
        { id:'a', text:'«Движение запрещено»', correct:true },
        { id:'b', text:'«Въезд запрещён»',    correct:false },
        { id:'c', text:'«Движение механических ТС запрещено»', correct:false }
      ]
    },
    {
      id: 2,
      theme: 'Остановка и стоянка',
      text: 'Разрешена ли остановка за знаком «Остановка запрещена»?',
      img: '',
      answers: [
        { id:'a', text:'Разрешена до 5 минут', correct:false },
        { id:'b', text:'Разрешена только для посадки/высадки или погрузки/разгрузки', correct:true },
        { id:'c', text:'Полностью запрещена', correct:false }
      ]
    },
    {
      id: 3,
      theme: 'Проезд перекрестков',
      text: 'Кому обязан уступить водитель на нерегулируемом перекрестке равнозначных дорог?',
      img: '',
      answers: [
        { id:'a', text:'Тому, кто справа', correct:true },
        { id:'b', text:'Тому, кто слева',  correct:false },
        { id:'c', text:'Никому',           correct:false }
      ]
    }
  ];

  // ====== ЭЛЕМЕНТЫ
  const clockEl = document.getElementById('trainClock');

  const statIndex   = document.getElementById('statIndex');
  const statTotal   = document.getElementById('statTotal');
  const statCorrect = document.getElementById('statCorrect');
  const statRate    = document.getElementById('statRate');

  const qMedia   = document.getElementById('qMedia');
  const qText    = document.getElementById('qText');
  const qAnswers = document.getElementById('qAnswers');

  const btnFinish = document.getElementById('btnFinish');

  // Настройки
  const settingsBtn    = document.getElementById('trainSettingsBtn');
  const settingsModal  = document.getElementById('trainSettingsModal');
  const settingsClose  = document.getElementById('trainSettingsClose');
  const useAiToggle    = document.getElementById('useAiToggle');
  const themesBtn      = document.getElementById('themesBtn');
  const themesDropdown = document.getElementById('themesDropdown');
  const themesSummary  = document.getElementById('themesSummary');
  const settingsSave   = document.getElementById('trainSettingsSave');

  // Результаты
  const resultModal  = document.getElementById('trainResultModal');
  const resultClose  = document.getElementById('trainResultClose');
  const resTotal     = document.getElementById('resTotal');
  const resCorrect   = document.getElementById('resCorrect');
  const resRate      = document.getElementById('resRate');
  const resTime      = document.getElementById('resTime');
  const resAgain     = document.getElementById('resAgain');

  // ====== СОСТОЯНИЕ СЕССИИ
  const state = {
    startedAt: Date.now(),
    idx: 0,
    correct: 0,
    order: [],     // массив индексов вопросов
    useAI: true,
    themes: ['all']
  };

  // таймер
  let clockTimer = null;
  function startClock(){
    stopClock();
    clockTimer = setInterval(()=>{
      const sec = Math.floor((Date.now() - state.startedAt)/1000);
      clockEl.textContent = fmtTime(sec);
    }, 500);
  }
  function stopClock(){ if (clockTimer) clearInterval(clockTimer); clockTimer = null; }
  function fmtTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,'0');
    const s = (sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
    // если нужно часы: const h=Math.floor(sec/3600).toString().padStart(2,'0'); return `${h}:${m}:${s}`;
  }

  // инициализация набора вопросов — по умолчанию случайные из всей базы
  function shuffle(arr){ return arr.map(v=>[v,Math.random()]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]); }
  function filteredQuestions(){
    if (state.themes.includes('all')) return DEMO_QUESTIONS;
    return DEMO_QUESTIONS.filter(q => state.themes.includes(q.theme));
  }

  function resetSession(){
    const qs = filteredQuestions();
    const order = shuffle([...qs.keys()]);
    state.idx = 0;
    state.correct = 0;
    state.order = order;
    statTotal.textContent = String(order.length);
    statIndex.textContent = '1';
    statCorrect.textContent = '0';
    statRate.textContent = '0/0';
    state.startedAt = Date.now();
    startClock();
    renderCurrent();
  }

  function getCurrent(){
    const qs = filteredQuestions();
    if (!state.order.length) return null;
    const realIndex = state.order[state.idx];
    return qs[realIndex];
  }

  function renderCurrent(){
    const q = getCurrent();
    if (!q){
      // если вдруг нет вопросов
      qText.textContent = 'Нет вопросов для выбранных тем.';
      qAnswers.innerHTML = '';
      qMedia.hidden = true;
      return;
    }

    // медиа
    if (q.img){
      qMedia.hidden = false;
      qMedia.innerHTML = `<img src="${q.img}" alt="">`;
    } else {
      qMedia.hidden = true;
      qMedia.innerHTML = '';
    }

    // текст + ответы
    qText.textContent = q.text;
    qAnswers.innerHTML = '';
    q.answers.forEach((a, i)=>{
      const btn = document.createElement('button');
      btn.className = 'answer';
      btn.type = 'button';
      btn.textContent = a.text;
      btn.dataset.correct = a.correct ? '1' : '0';
      btn.addEventListener('click', onAnswerClick, { once:true });
      qAnswers.appendChild(btn);
    });

    statIndex.textContent = String(state.idx + 1);
    statTotal.textContent = String(state.order.length);
    statCorrect.textContent = String(state.correct);
    const total = Math.max(1, state.idx); // коэффициент «прав/всего отвеченных» — можно заменить на бэке
    const rate = `${state.correct}/${state.idx}`;
    statRate.textContent = rate;
  }

  function onAnswerClick(e){
    const isCorrect = e.currentTarget?.dataset?.correct === '1';
    if (isCorrect) state.correct++;

    // переход к следующему моментально
    if (state.idx < state.order.length - 1){
      state.idx++;
      renderCurrent();
    } else {
      // конец набора
      showResults();
    }
  }

  // ====== Настройки
  function openSettings(){
    settingsModal.classList.add('active');
    document.body.classList.add('modal-open');
    settingsModal.setAttribute('aria-hidden','false');
  }
  function closeSettings(){
    settingsModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    settingsModal.setAttribute('aria-hidden','true');
    themesDropdown.classList.remove('open');
    themesBtn.setAttribute('aria-expanded','false');
  }
  settingsBtn?.addEventListener('click', openSettings);
  settingsClose?.addEventListener('click', closeSettings);
  settingsSave?.addEventListener('click', closeSettings);
  settingsModal?.addEventListener('click', (e)=>{ if (e.target === settingsModal) closeSettings(); });

  useAiToggle?.addEventListener('change', ()=>{
    state.useAI = !!useAiToggle.checked;
    // здесь можно включать/выключать подсказки при показе ответа
  });

  themesBtn?.addEventListener('click', ()=>{
    const willOpen = !themesDropdown.classList.contains('open');
    themesDropdown.classList.toggle('open', willOpen);
    themesBtn.setAttribute('aria-expanded', String(willOpen));
  });

  // выбор тем
  themesDropdown?.addEventListener('change', (e)=>{
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;

    const all = themesDropdown.querySelector('input[data-theme="all"]');
    const topicChecks = Array.from(themesDropdown.querySelectorAll('input[data-theme]:not([data-theme="all"])'));

    if (t.dataset.theme === 'all'){
	  if (all.checked){
		// включаем все темы
		topicChecks.forEach(c => c.checked = true);
		state.themes = ['all', ...topicChecks.map(c=>c.dataset.theme)];
	  } else {
		// сняли «Все темы» — очищаем всё
		topicChecks.forEach(c => c.checked = false);
		state.themes = [];
	  }
	} else {
	  // если выбрали/сняли конкретные темы
	  const chosen = topicChecks.filter(c=>c.checked).map(c=>c.dataset.theme);

	  if (chosen.length === topicChecks.length){
		// если вручную выбраны все — включаем «Все темы» тоже
		all.checked = true;
		state.themes = ['all', ...chosen];
	  } else {
		all.checked = false;
		state.themes = chosen;
	  }
	}


    // обновить summary
    if (state.themes.includes('all') || state.themes.length === 0){
      themesSummary.textContent = 'Все темы';
    } else {
      themesSummary.textContent = `${state.themes[0]}${state.themes.length>1 ? ` +${state.themes.length-1}` : ''}`;
    }
  });

  // ====== Завершение
  btnFinish?.addEventListener('click', ()=>{
    if (!confirm('Завершить тренировку?')){
      return;
    }
    showResults();
  });

  function openResult(){
    resultModal.classList.add('active');
    document.body.classList.add('modal-open');
    resultModal.setAttribute('aria-hidden','false');
  }
  function closeResult(){
	  if (!resModal) return;
	  if (detWrap) detWrap.hidden = true;   // <— сбрасываем раскрытый отчёт
	  resModal.classList.remove('active');
	  document.body.classList.remove('modal-open');
	  resModal.setAttribute('aria-hidden','true');
	}

  resultClose?.addEventListener('click', closeResult);
  resultModal?.addEventListener('click', (e)=>{ if (e.target === resultModal) closeResult(); });
  resAgain?.addEventListener('click', ()=>{
    closeResult();
    resetSession();
  });

  function showResults(){
    stopClock();
    const totalAnswered = state.order.length;
    resTotal.textContent   = String(totalAnswered);
    resCorrect.textContent = String(state.correct);
    resRate.textContent    = `${state.correct}/${totalAnswered}`;
    const sec = Math.floor((Date.now() - state.startedAt)/1000);
    resTime.textContent    = fmtTime(sec);
    openResult();
  }

  // ====== СТАРТ
  resetSession();
})();



	
/* ========= EXAM: intro + exam (с доп. блоками как в ГИБДД) ========= */
(function(){
  const root = document.querySelector('.exam-one-page');
  if (!root) return;

  const $ = id => document.getElementById(id);

  // Узлы
  const intro       = $('examIntro');
  const startBtn    = $('startExamBtn');
  const candidateEl = $('candidateName');

  const ui          = $('examUI');
  const remainEl    = $('examRemain');
  const fioEl       = $('examFio');
  const dobEl       = $('examDob');
  const progress    = $('examProgress');

  const examGrid    = $('examGrid');
  const examView    = $('examView');
  const badge       = $('qBadge');
  const media       = $('examMedia');
  const qText       = $('examText');
  const qAnswers    = $('examAnswers');
  const backBtn     = $('backToGrid');
  const prevQ       = $('prevQ');
  const nextQ       = $('nextQ');

  const resModal  = $('examResultModal');
  const resClose  = $('examResultClose');
  const resVerdict= $('resVerdict');
  const resOk     = $('resOk');
  const resTime   = $('resTime');
  const resSpeed  = $('resSpeed');
  const resAgain  = $('examAgain');
  const openDet   = $('openDetailed');
  const detWrap   = $('examDetailed');
  const detList   = $('detailList');

  // Без ключевых узлов — выходим мягко
  if (!intro || !ui || !examGrid || !examView) return;

  // Кандидат из профиля
  try{
    const raw = localStorage.getItem('ap_profile_v1');
    if (raw){
      const { name, dob } = JSON.parse(raw);
      if (name){
        candidateEl && (candidateEl.textContent = name.toUpperCase());
        fioEl && (fioEl.textContent = name.toUpperCase());
      }
      if (dob) { dobEl && (dobEl.textContent = dob); }
    }
  }catch(e){}

  // ==== ДЕМО-БАНК ВОПРОСОВ ==== 
  // Поменяй на свой источник. Важно: у каждого вопроса должна быть тема: { topic: "Дорожные знаки" } и т.п.
  // ==== ПАРАМЕТРЫ ИЗ URL (для кастомного экзамена) ====
const __qs = new URLSearchParams(location.search);
const __customTopics = (__qs.get('topics') || '').split(',').filter(Boolean);
const __questionCount = Math.max(1, Number(__qs.get('count') || 20));
const __timeMin = Math.max(1, Number(__qs.get('time') || 20));
const __hl = __qs.get('hl') === '1';
const __title = __qs.get('title') || '';

if (__title) {
  try { document.title = __title + ' — Автоправила'; } catch(e){}
  const h1 = document.querySelector('.exam-intro h2, .page-title, h1');
  if (h1 && h1.textContent.trim() === 'Экзамен') { h1.textContent = __title; }
}

const DEFAULT_TOPICS = [
  'Дорожные знаки',
  'Проезд перекрестков',
  'Остановка и стоянка',
  'Светофоры и регулировщик',
  'Маневрирование'
];
const TOPICS = __customTopics.length ? __customTopics : DEFAULT_TOPICS;

(function(){
  const intro = document.querySelector('.exam-intro-text');
  if (!intro) return;
  const strongs = intro.querySelectorAll('p strong');
  if (strongs[0]) strongs[0].textContent = __questionCount + ' вопросов';
  if (strongs[1]) strongs[1].textContent = __timeMin + ' минут';
})();


  function makeQuestion(id, topic){
    return {
      id,
      topic,
      text: `(${topic}) Вопрос №${id}. Здесь будет текст вопроса.`,
      img: id % 3 === 0 ? `https://via.placeholder.com/800x450?text=${encodeURIComponent(topic)}+Q${id}` : '',
      answers: [
        { id:'a', text:'Вариант A', correct: id % 3 === 0 },
        { id:'b', text:'Вариант B', correct: id % 3 === 1 },
        { id:'c', text:'Вариант C', correct: id % 3 === 2 },
      ]
    };
  }

  // 20 основных (миксуем темы)
  const MAIN_QUESTIONS = Array.from({length: __questionCount}, (_,i)=> makeQuestion(i+1, TOPICS[i % TOPICS.length]));

  // Банк доп.вопросов по темам (минимум 5+ на тему). В реальном приложении — попроси API «дать 5 по теме X».
  const EXTRA_BANK = {};
  TOPICS.forEach(t=>{
    EXTRA_BANK[t] = Array.from({length:12}, (_,k)=> makeQuestion(1000 + k + 1, t));
  });

  // ==== СОСТОЯНИЕ ====
  const PHASE_MAIN = 'main';
  const PHASE_BLOCK = 'block';

  const state = {
    startedAt: null,
    durationSec: __timeMin * 60, // 20:00 для основной части; далее +5:00 за каждый блок
    timer: null,

    // Основная часть
    phase: PHASE_MAIN,
    main: {
      cur: 0,
      answers: Array(MAIN_QUESTIONS.length).fill(null), // {user, correct, correctId, q}
      errors: 0,           // только ошибки основной части
      wrongTopics: []      // темы ошибок, чтобы сформировать блоки
    },

    // Очередь доп.блоков (каждый: {topic, list[5], curIndex, answers[5]})
    blocks: [],
    currentBlockIndex: -1   // -1 => нет активного блока
  };

  // ==== УТИЛЫ ВРЕМЕНИ ====
  const fmt = s => {
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const ss = (s%60).toString().padStart(2,'0');
    return `${m}:${ss}`;
  };
  const startTimer = () => {
    stopTimer();
    state.startedAt = Date.now();
    state.timer = setInterval(()=>{
      const elapsed = Math.floor((Date.now() - state.startedAt)/1000);
      const remain = Math.max(0, state.durationSec - elapsed);
      remainEl && (remainEl.textContent = fmt(remain));
      if (remain === 0){
        // Время блока или основной части вышло — это провал
        finishExam(false, 'Время вышло');
      }
    }, 500);
  };
  const stopTimer = () => { if (state.timer) clearInterval(state.timer); state.timer = null; };

  // ==== ЭКРАНЫ ====
  const showIntro = () => { intro.hidden = false; ui.hidden = true; };
  const showUI    = () => { intro.hidden = true;  ui.hidden = false; };

  // ==== РЕНДЕР ПЕРЕЧНЯ ДЛЯ ОСНОВНОЙ ЧАСТИ ====
  function renderGrid(){
    if (!examGrid) return;
    examGrid.innerHTML = '';
    MAIN_QUESTIONS.forEach((q, i)=>{
      const wrap = document.createElement('div');
      wrap.className = 'exam-card-wrap';

      const card = document.createElement('div');
      card.className = 'exam-card';
      const ans = state.main.answers[i];
      if (ans){
        card.classList.add(ans.correct ? 'ok' : 'fail');
      }

      const num = document.createElement('div');
      num.className = 'num'; num.textContent = String(i+1);

      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.innerHTML = q.img ? `<img src="${q.img}" alt="">` : '<span class="muted">без изображения</span>';

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = (q.text.length > 100 ? q.text.slice(0,100)+'…' : q.text);

      card.appendChild(thumb);
      card.appendChild(title);
      wrap.appendChild(card);
      wrap.appendChild(num);

      wrap.addEventListener('click', ()=> openQuestionMain(i));
      examGrid.appendChild(wrap);
    });
  }

  // ==== ПРОГРЕСС-КВАДРАТЫ: 20 для основной части, 5 для активного блока ====
	function renderProgress(){
	  if (!progress) return;
	  progress.innerHTML = '';

	  // (необязательно) показывать числа внутри квадратиков
	  // progress.classList.add('progress--num'); // <-- раскомментируй, если хочешь видеть номера

	  if (state.phase === PHASE_MAIN){
		MAIN_QUESTIONS.forEach((_, i)=>{
		  const sq = document.createElement('button');
		  sq.type = 'button';
		  sq.className = 'progress-item';
		  // номера (если включён progress--num)
		  if (progress.classList.contains('progress--num')) sq.textContent = i+1;

		  const a = state.main.answers[i];
		  if (a) sq.classList.add(a.correct ? 'ok' : 'fail');
		  if (!examView.hidden && i === state.main.cur) sq.classList.add('current');
		  sq.addEventListener('click', ()=> openQuestionMain(i));
		  progress.appendChild(sq);
		});
	  } else {
		const blk = state.blocks[state.currentBlockIndex];
		if (!blk) return;
		for (let i=0;i<blk.list.length;i++){
		  const sq = document.createElement('button');
		  sq.type = 'button';
		  sq.className = 'progress-item';
		  if (progress.classList.contains('progress--num')) sq.textContent = i+1;

		  const a = blk.answers[i];
		  if (a) sq.classList.add(a.correct ? 'ok' : 'fail');
		  if (!examView.hidden && i === blk.curIndex) sq.classList.add('current');
		  sq.addEventListener('click', ()=> openQuestionBlock(i));
		  progress.appendChild(sq);
		}
	  }
	}

  // ==== ПОКАЗ ВОПРОСОВ ОСНОВНОЙ ЧАСТИ ====
  function openQuestionMain(i){
    state.phase = PHASE_MAIN;
    state.main.cur = i;
    const q = MAIN_QUESTIONS[i];

    renderQuestionView(q, i+1, `(Основная часть)`);
    // скрываем перечень
    if (examGrid) examGrid.style.display = 'none';
    examView.hidden = false;
    progress.style.display = '';
    renderProgress();
  }

  // ==== ПОКАЗ ВОПРОСОВ ДОП.БЛОКА ====
  function openQuestionBlock(i){
    state.phase = PHASE_BLOCK;
    const blk = state.blocks[state.currentBlockIndex];
    if (!blk) return;
    blk.curIndex = i;
    const q = blk.list[i];

    renderQuestionView(q, i+1, blockLabel());
    // перечня нет в блоке
    if (examGrid) examGrid.style.display = 'none';
    examView.hidden = false;
    progress.style.display = '';
    renderProgress();
  }

  // Общий рендер карточки вопроса
  function renderQuestionView(q, numberForBadge, phaseText){
	  if (badge) badge.textContent = String(numberForBadge);
	  if (qText) qText.textContent = q.text;

	  // пилюля фазы с иконками
	  if (!qText.previousElementSibling || !qText.previousElementSibling.classList.contains('phase-pill')){
		const pill = document.createElement('div');
		pill.className = 'phase-pill';
		pill.innerHTML = `
		  <span class="ico ico-term" aria-hidden="true"></span>
		  <span class="small">${phaseText}</span>
		  <span class="ico ico-cat" aria-hidden="true"></span>
		  <span>Тема:&nbsp;<strong>${q.topic}</strong></span>
		`;
		qText.parentNode.insertBefore(pill, qText);
	  } else {
		const pill = qText.previousElementSibling;
		pill.querySelector('.small').textContent = phaseText;
		const strong = pill.querySelector('strong');
		if (strong) strong.textContent = q.topic;
	  }

	  if (q.img){
		media.hidden = false;
		media.innerHTML = `<img src="${q.img}" alt="">`;
	  } else {
		media.hidden = true;
		media.innerHTML = '';
	  }

	  qAnswers.innerHTML = '';
	  q.answers.forEach(a=>{
		const btn = document.createElement('button');
		btn.className = 'answer'; btn.type = 'button';
		btn.textContent = a.text; btn.dataset.id = a.id;
		btn.addEventListener('click', onAnswer, { once:true });
		qAnswers.appendChild(btn);
	  });
	}


  // Название блока (1/2)
  function blockLabel(){
    return `Доп. блок ${state.currentBlockIndex+1}/${state.blocks.length}`;
  }

  // Назад к перечню (только для основной части)
  function backToList(){
    if (state.phase !== PHASE_MAIN){
      // в доп.блоке возвращаться некуда — игнор
      return;
    }
    examView.hidden = true;
    examGrid.style.display = 'grid';
    progress.style.display = 'none';
    renderGrid();
    renderProgress();
  }

  backBtn && backBtn.addEventListener('click', backToList);
  prevQ  && prevQ.addEventListener('click', ()=>{
    if (state.phase === PHASE_MAIN){
      openQuestionMain(Math.max(0, state.main.cur-1));
    } else {
      const blk = state.blocks[state.currentBlockIndex];
      openQuestionBlock(Math.max(0, blk.curIndex-1));
    }
  });
  nextQ  && nextQ.addEventListener('click', ()=>{
    if (state.phase === PHASE_MAIN){
      openQuestionMain(Math.min(MAIN_QUESTIONS.length-1, state.main.cur+1));
    } else {
      const blk = state.blocks[state.currentBlockIndex];
      openQuestionBlock(Math.min(blk.list.length-1, blk.curIndex+1));
    }
  });

  // ==== ОБРАБОТКА ОТВЕТА ====
  function onAnswer(e){
	  const btn = e.currentTarget;
	  const user = btn?.dataset?.id;

	  // небольшая утилита для флеша и отложенного перехода
	  const flashAndGo = (isCorrect, nextFn) => {
		btn.classList.add(isCorrect ? 'flash-correct' : 'flash-wrong');
		// обновим прогресс немедленно, чтобы квадрат окрасился, а переход — спустя 280мс
		renderProgress();
		setTimeout(nextFn, 280);
	  };

	  if (state.phase === PHASE_MAIN){
		const idx = state.main.cur;
		const q = MAIN_QUESTIONS[idx];
		const correctId = q.answers.find(a=>a.correct)?.id;
		const isCorrect = user === correctId;

		state.main.answers[idx] = { user, correct: isCorrect, correctId, q };

		if (!isCorrect){
		  state.main.errors++;
		  if (state.main.wrongTopics.length < 2){
			state.main.wrongTopics.push(q.topic);
		  }
		  if (state.main.errors > 2){
			return flashAndGo(false, ()=> finishExam(false, 'Более двух ошибок в основной части'));
		  }
		}

		const goNext = ()=>{
		  // следующий неотвеченный из основной части
		  const nextIdx = state.main.answers.findIndex(a => a === null);
		  if (nextIdx !== -1){
			openQuestionMain(nextIdx);
		  } else {
			// сформировать блоки и продолжить/завершить
			buildBlocks();
			if (state.blocks.length){
			  startNextBlock();
			} else {
			  finishExam(true);
			}
		  }
		};

		return flashAndGo(isCorrect, goNext);

	  } else {
		// ДОП.БЛОК
		const blk = state.blocks[state.currentBlockIndex];
		const i = blk.curIndex;
		const q = blk.list[i];
		const correctId = q.answers.find(a=>a.correct)?.id;
		const isCorrect = user === correctId;

		blk.answers[i] = { user, correct: isCorrect, correctId, q };

		if (!isCorrect){
		  return flashAndGo(false, ()=> finishExam(false, 'Ошибка в дополнительном блоке'));
		}

		const goNextBlockQ = ()=>{
		  const nextI = blk.answers.findIndex(a => a === null);
		  if (nextI !== -1){
			openQuestionBlock(nextI);
		  } else {
			// блок пройден
			if (state.currentBlockIndex < state.blocks.length - 1){
			  state.currentBlockIndex++;
			  startBlockTimer();
			  openQuestionBlock(0);
			} else {
			  finishExam(true);
			}
		  }
		};

		return flashAndGo(true, goNextBlockQ);
	  }
	}

  // ==== ФОРМИРОВАНИЕ ДОП.БЛОКОВ ====
  function buildBlocks(){
    state.blocks = [];
    state.currentBlockIndex = -1;

    state.main.wrongTopics.slice(0,2).forEach(topic=>{
      // взять любые 5 из EXTRA_BANK по теме (можно заменить на случайную выборку)
      const pool = (EXTRA_BANK[topic] || []).slice();
      // простая выборка первых 5; при интеграции возьми случайные и уникальные
      const list = pool.slice(0,5).map((q, idx)=> ({ ...q, id: q.id + idx }));
      state.blocks.push({
        topic,
        list,
        curIndex: 0,
        answers: Array(5).fill(null)
      });
    });
  }

  // Старт первого/следующего блока
  function startNextBlock(){
    state.phase = PHASE_BLOCK;
    state.currentBlockIndex = 0;
    startBlockTimer();
    openQuestionBlock(0);
  }

  // Для каждого блока свой 5-минутный таймер (перезапуск)
  function startBlockTimer(){
    stopTimer();
    state.startedAt = Date.now();
    state.durationSec = 5 * 60; // 5:00 на блок
    startTimer();
  }

  // ==== МОДАЛКА РЕЗУЛЬТАТОВ ====
  function openResult(){
    if (!resModal) return;
    resModal.classList.add('active');
    document.body.classList.add('modal-open');
    resModal.setAttribute('aria-hidden','false');
  }
  function closeResult(){
    if (!resModal) return;
    if (detWrap) detWrap.hidden = true;
    resModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    resModal.setAttribute('aria-hidden','true');
  }
  resClose && resClose.addEventListener('click', closeResult);
  resModal && resModal.addEventListener('click', (e)=>{ if (e.target === resModal) closeResult(); });
  resAgain && resAgain.addEventListener('click', ()=>{
    closeResult();
    startExam();
  });
  openDet && openDet.addEventListener('click', ()=> detWrap && (detWrap.hidden = !detWrap.hidden) );

  function fillDetailed(allAnswers){
    if (!detList) return;
    detList.innerHTML = '';
    allAnswers.forEach((entry, idx)=>{
      const { q, user, correct, correctId } = entry;
      const item = document.createElement('div');
      item.className = 'detail-item';

      const head = document.createElement('div'); head.className = 'head';
      const pill = document.createElement('span'); pill.className = 'pill ' + (correct ? 'ok' : 'fail');
      pill.textContent = correct ? '✅ Верно' : '❌ Ошибка';
      const title = document.createElement('div'); title.textContent = `Вопрос ${idx+1} — ${q.topic}`;
      head.appendChild(pill); head.appendChild(title);

      const text = document.createElement('div');
      text.style.fontWeight = '700'; text.style.margin = '6px 0';
      text.textContent = q.text;

      const answers = document.createElement('div'); answers.className = 'answers';
      q.answers.forEach(opt=>{
        const el = document.createElement('div'); el.className = 'ans';
        if (opt.correct) el.classList.add('correct');
        if (!correct && user === opt.id) el.classList.add('user-wrong');
        el.textContent = opt.text; answers.appendChild(el);
      });

      item.appendChild(head);
      if (q.img){
        const m = document.createElement('div');
        m.style.margin = '6px 0';
        m.innerHTML = `<img src="${q.img}" alt="" style="max-width:100%; border-radius:10px; border:1px solid var(--border)">`;
        item.appendChild(m);
      }
      item.appendChild(text);
      item.appendChild(answers);
      detList.appendChild(item);
    });
  }

  // Итог: success=true/false
  function finishExam(success, reason=''){
    stopTimer();

    // Собрать все ответы в один список для отчёта (основная 20ка в порядке, затем блоки)
    const all = [];
    state.main.answers.forEach(a => all.push(a || { q:{ text:'(без ответа)', topic:'—', answers:[] }, user: null, correct: false, correctId: null }));
    state.blocks.forEach(blk => blk.answers.forEach(a => all.push(a || { q:{ text:'(без ответа)', topic: blk.topic, answers:[] }, user: null, correct: false, correctId: null })));

    const total = all.length;
    const ok = all.filter(a=>a && a.correct).length;
    // общее затраченное время не знаем напрямую; возьмём прошедшее со старта текущей фазы + 20мин + 5мин*кол-во завершённых блоков — опционально
    // проще: не мудрим и не считаем точно — покажем время с текущего таймера как «≈»
    const elapsedApprox = Math.floor((Date.now()-state.startedAt)/1000);
    const speed = total / Math.max(1, elapsedApprox/60);

    resVerdict && (resVerdict.textContent = success ? 'Сдано ✅' : `Не сдано ❌${reason ? ' — ' + reason : ''}`);
    resOk && (resOk.textContent = String(ok));
    resTime && (resTime.textContent = fmt(elapsedApprox));
    resSpeed && (resSpeed.textContent = speed.toFixed(1));

    fillDetailed(all);
    openResult();
  }

  // ==== СТАРТ ЭКЗАМЕНА ====
  function startExam(){
    // сброс
    state.phase = PHASE_MAIN;
    state.durationSec = __timeMin * 60; // снова 20:00
    state.main.cur = 0;
    state.main.answers = Array(MAIN_QUESTIONS.length).fill(null);
    state.main.errors = 0;
    state.main.wrongTopics = [];
    state.blocks = [];
    state.currentBlockIndex = -1;

    remainEl && (remainEl.textContent = fmt(state.durationSec));

    renderGrid();
    renderProgress();
    // в основной части сперва — перечень
    examView.hidden = true;
    examGrid.style.display = 'grid';
    progress.style.display = 'none';

    showUI();
    startTimer();
  }

  // Интро — управление
  startBtn && startBtn.addEventListener('click', startExam);
  document.addEventListener('keydown', (e)=>{
    if (intro.hidden) return;
    if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); startExam(); }
    if (e.key === 'Escape'){ window.location.href = 'index.html'; }
  });

  // Хоткеи в режиме вопроса
  document.addEventListener('keydown', (e)=>{
    if (ui.hidden || examView.hidden) return;
    if (e.key === 'ArrowLeft')  prevQ && prevQ.click();
    if (e.key === 'ArrowRight') nextQ && nextQ.click();
    if (e.key === 'Escape' && state.phase === PHASE_MAIN) backBtn && backBtn.click();
  });

  // Показ интро при загрузке
  showIntro();
})();


/* === Modal accessibility enhancements (added) === */
(function(){
  const active = { el: null, opener: null };
  const selectors = '[role="dialog"], .modal, .dialog';
  const getFocusable = (root) => root ? root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])') : [];
  function trap(e){
    if (!active.el) return;
    if (e.key !== 'Tab') return;
    const items = Array.from(getFocusable(active.el)).filter(el=>!el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length-1];
    if (e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
  }
  function onKey(e){
    if (e.key === 'Escape' && active.el){
      closeModal();
    } else if (e.key === 'Tab'){
      trap(e);
    }
  }
  function openModal(modal, opener){
    active.el = modal;
    active.opener = opener || document.activeElement;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-modal','true');
    const items = getFocusable(modal);
    if (items.length) items[0].focus(); else modal.setAttribute('tabindex','-1'), modal.focus();
    document.addEventListener('keydown', onKey, true);
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if (!active.el) return;
    active.el.setAttribute('hidden','');
    active.el.removeAttribute('aria-modal');
    document.removeEventListener('keydown', onKey, true);
    document.body.style.overflow = '';
    const opener = active.opener;
    active.el = null; active.opener = null;
    if (opener && typeof opener.focus === 'function') opener.focus();
  }
  // Wire: any [data-open] opens #id; any [data-close] closes within
  document.addEventListener('click', (e)=>{
    const openBtn = e.target.closest('[data-open]');
    const closeBtn = e.target.closest('[data-close]');
    if (openBtn){
      const sel = openBtn.getAttribute('data-open');
      const modal = document.querySelector(sel);
      if (modal){ e.preventDefault(); openModal(modal, openBtn); }
    } else if (closeBtn){
      const dialog = closeBtn.closest(selectors);
      if (dialog){ e.preventDefault(); closeModal(); }
    } else if (active.el && e.target === active.el){
      // click on overlay closes
      e.preventDefault(); closeModal();
    }
  }, true);
  // Expose minimal API if needed elsewhere
  window.__modal = { open: openModal, close: closeModal };
})();


/* === Theme toggle aria-pressed (added) === */
(function(){
  const btn = document.querySelector('[data-theme-toggle]') || document.getElementById('theme-toggle');
  const html = document.documentElement;
  function sync(){
    const dark = html.classList.contains('dark');
    if (btn) btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  if (btn){ btn.addEventListener('click', ()=> setTimeout(sync, 0)); }
  document.addEventListener('DOMContentLoaded', sync);
  sync();
})();


// === LEARNING PAGES (scoped; safe to append) ===
(function(){
  const LS_KEY = 'learnProgress:v1';
  const total = 14;
  const html = document.documentElement;

  function getProgress(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)) || []; }catch(e){ return []; }
  }
  function setProgress(arr){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(Array.from(new Set(arr)).sort((a,b)=>a-b))); }catch(e){}
  }
  function markDone(id){
    const cur = getProgress();
    if (!cur.includes(id)){ cur.push(id); setProgress(cur); }
  }

  function onLearningPage(){
    const container = document.querySelector('.page-learning');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('[data-learn-id]'));
    const done = new Set(getProgress());

    // paint done
    items.forEach(el => {
      const id = Number(el.getAttribute('data-learn-id'));
      if (done.has(id)) el.classList.add('is-done');
      // ripple / click anim if available
      el.addEventListener('click', (e)=>{
        if (typeof addRipple === 'function') addRipple(e, 'blue');
        if (typeof animateClick === 'function') animateClick(el);
        markDone(id);
      }, {capture:false});
    });

    // progress meter
    const bar = container.querySelector('.meter .bar');
    const labelSpan = container.querySelector('[data-progress-label]');
    function sync(){
      const cnt = getProgress().length;
      const pct = Math.round(cnt / total * 100);
      if (bar) bar.style.width = pct + '%';
      if (labelSpan) labelSpan.textContent = pct + '%';
    }
    sync();
    document.addEventListener('visibilitychange', sync);
  }

  function onLessonPage(){
    const root = document.querySelector('.page-lesson');
    if (!root) return;

    const id = Number((root.getAttribute('data-lesson-id') || '0').replace(/[^\d]/g,''));
    if (id) markDone(id);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ onLearningPage(); onLessonPage(); });
  } else {
    onLearningPage(); onLessonPage();
  }
})();

// === QUIZ renderer (для страниц уроков) ===
(function(){
  const LS_PREFIX = 'quiz:auto:lesson:';

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    return arr;
  }
  function readJSON(scriptEl){
    try{ return JSON.parse(scriptEl.textContent); }catch(e){ return null; }
  }

  function renderQuiz(container){
    const lessonId = container.getAttribute('data-lesson-id');
    const dataEl = document.getElementById('quiz-data-'+lessonId);
    if(!dataEl) return;
    const data = readJSON(dataEl);
    if(!data || !Array.isArray(data.questions)) return;

    const stateKey = LS_PREFIX + lessonId;
    const saved = (function(){
      try{ return JSON.parse(localStorage.getItem(stateKey)) || null; }catch(e){ return null; }
    })();

    const wrap = document.createElement('div');
    wrap.className = 'quiz-card';

    const title = document.createElement('div');
    title.className = 'quiz-title';
    title.textContent = data.title || 'Тест по уроку';
    wrap.appendChild(title);

    const questions = data.shuffle ? shuffle([...data.questions]) : data.questions;
    const blocks = [];

    questions.forEach((q, qi)=>{
      const block = document.createElement('div');
      block.className = 'quiz-q';
      block.dataset.type = q.type || 'single';

      const h3 = document.createElement('h3');
      h3.textContent = (qi+1)+'. '+(q.text || '');
      block.appendChild(h3);

      const answersWrap = document.createElement('div');
      answersWrap.className = 'quiz-answers';

      const name = 'q_'+qi+'_'+lessonId;
      const multiple = (q.type === 'multiple');

      const answers = q.shuffle !== false ? shuffle([...(q.answers || [])]) : (q.answers || []);
      answers.forEach((a, ai)=>{
        const label = document.createElement('label');
        label.className = 'quiz-answer';

        const input = document.createElement('input');
        input.type = multiple ? 'checkbox' : 'radio';
        input.name = name;
        input.value = String(ai);

        const span = document.createElement('span');
        span.textContent = a.text || '';

        label.appendChild(input);
        label.appendChild(span);
        answersWrap.appendChild(label);
      });

      block.appendChild(answersWrap);

      if (q.explain){
        const exp = document.createElement('div');
        exp.className = 'quiz-explain';
        exp.style.display = 'none';
        exp.style.opacity = '.9';
        exp.style.fontSize = '14px';
        exp.style.marginTop = '6px';
        exp.textContent = q.explain;
        block.appendChild(exp);
      }

      wrap.appendChild(block);
      blocks.push({block, question:q});
    });

    const controls = document.createElement('div');
    controls.className = 'quiz-controls';
    const btnCheck = Object.assign(document.createElement('button'), {className:'quiz-btn', type:'button', textContent:'Проверить'});
    const btnReset = Object.assign(document.createElement('button'), {className:'quiz-btn', type:'button', textContent:'Сбросить'});
    controls.append(btnReset, btnCheck);
    wrap.appendChild(controls);

    const result = document.createElement('div');
    result.className = 'quiz-result';
    result.style.display = 'none';
    wrap.appendChild(result);

    container.innerHTML = '';
    container.appendChild(wrap);

    if (saved && saved.answers){
      blocks.forEach((b, i)=>{
        const ansWrap = b.block.querySelector('.quiz-answers');
        const inputs = Array.from(ansWrap.querySelectorAll('input'));
        (saved.answers[i] || []).forEach(function(idx){
          const inp = inputs[idx];
          if (inp) inp.checked = true;
        });
      });
      if (saved.checked) checkNow(true);
    }

    btnCheck.addEventListener('click', function(){ checkNow(false); });
    btnReset.addEventListener('click', resetAll);

    function readUserAnswers(){
      return blocks.map(function(b){
        const inputs = Array.from(b.block.querySelectorAll('input'));
        const picked = inputs.map(function(inp, idx){ return inp.checked ? idx : null; }).filter(function(v){ return v!==null; });
        return picked;
      });
    }

    function checkNow(silent){
      var correctCount = 0;
      blocks.forEach(function(obj){
        var block = obj.block, question = obj.question;
        const inputs = Array.from(block.querySelectorAll('input'));
        const pickedIdx = inputs.map(function(inp, idx){ return inp.checked ? idx : null; }).filter(function(v){ return v!==null; });
        const correctIdx = (question.answers || []).map(function(a, idx){ return a.correct ? idx : null; }).filter(function(v){ return v!==null; });

        Array.from(block.querySelectorAll('.quiz-answer')).forEach(function(el, idx){
          el.classList.remove('is-correct','is-wrong');
          const isPicked = pickedIdx.includes(idx);
          const isCorr = correctIdx.includes(idx);
          if (isPicked && isCorr) el.classList.add('is-correct');
          else if (isPicked && !isCorr) el.classList.add('is-wrong');
        });

        const ok = pickedIdx.length === correctIdx.length && pickedIdx.every(function(v){ return correctIdx.includes(v); });
        if (ok) correctCount++;

        const exp = block.querySelector('.quiz-explain');
        if (exp) exp.style.display = 'block';
      });

      const total = blocks.length;
      result.style.display = 'block';
      result.textContent = 'Результат: ' + correctCount + ' из ' + total;

      try{
        localStorage.setItem(stateKey, JSON.stringify({ checked:true, answers: readUserAnswers() }));
      }catch(e){}

      if (!silent && typeof animateClick === 'function') animateClick(btnCheck);
    }

    function resetAll(){
      blocks.forEach(function(obj){
        var block = obj.block;
        Array.from(block.querySelectorAll('input')).forEach(function(inp){ inp.checked = false; });
        Array.from(block.querySelectorAll('.quiz-answer')).forEach(function(el){ el.classList.remove('is-correct','is-wrong'); });
        const exp = block.querySelector('.quiz-explain');
        if (exp) exp.style.display = 'none';
      });
      result.style.display = 'none';
      try{ localStorage.removeItem(stateKey); }catch(e){}
      if (typeof animateClick === 'function') animateClick(btnReset);
    }
  }

  function init(){
    Array.from(document.querySelectorAll('.quiz[data-lesson-id]')).forEach(renderQuiz);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// ============================
// BUILDER — логика конструктора
// (код запускается только на .page-builder)
// ============================
(function(){
  const page = document.querySelector('.page-builder');
  if (!page) return;

  // --- Elements
  const titleInput = document.getElementById('exam-title');
  const countInput = document.getElementById('exam-count');
  const timeInput  = document.getElementById('exam-time');
  const hlCheckbox = document.getElementById('exam-highlight');

  const btnRun   = document.getElementById('run-now');
  const btnGen   = document.getElementById('gen-link');
  const shareInp = document.getElementById('share-url');
  const btnCopy  = document.getElementById('copy-link');

  const listEl   = document.getElementById('exam-list');
  const emptyEl  = document.getElementById('empty-state');

  const statsTbody = document.getElementById('stats-tbody');

  // Темы (как в training.html)
  const themesBtn = document.getElementById('bldrThemesBtn');
  const themesDD  = document.getElementById('bldrThemesDropdown');
  const themesSum = document.getElementById('bldrThemesSummary');

  // --- Storage keys
  const LS_LIST  = 'builder:exams:v1';
  const LS_STATS = 'builder:stats:v1';
  const LS_THEMES = 'builder:themes:v1';
  const LS_DRAFT  = 'builder:draft:v1';

  // --- Helpers
  function addRippleSafe(e, color){ try{ addRipple?.(e, color); }catch(_){} }
  function animateClickSafe(el){ try{ animateClick?.(el); }catch(_){} }

  function buildQuery(obj){
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k,v])=>{
      if (Array.isArray(v) && v.length) p.set(k, v.join(','));
      else if (typeof v === 'boolean') p.set(k, v ? '1' : '0');
      else if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
    });
    return '?' + p.toString();
  }
  function uid(){ return 'ex' + Date.now(); }

  // --- Themes (dropdown)
  const allCb = themesDD?.querySelector('input[data-theme="all"]');
  const topicCbs = ()=> Array.from(themesDD?.querySelectorAll('input[data-theme]:not([data-theme="all"])') || []);

  function setThemesOpen(open){
    if (!themesDD || !themesBtn) return;
    themesDD.classList.toggle('open', open);
    themesBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  themesBtn?.addEventListener('click', (e)=>{ addRippleSafe(e, 'blue'); setThemesOpen(!themesDD.classList.contains('open')); });
  document.addEventListener('click', (e)=>{
    if (!themesDD || !themesBtn) return;
    if (e.target.closest('#bldrThemesDropdown') || e.target.closest('#bldrThemesBtn')) return;
    setThemesOpen(false);
  });

  function selectedThemes(){
    return topicCbs().filter(c=>c.checked).map(c=>c.getAttribute('data-theme'));
  }
  function updateThemesSummary(){
    const sel = selectedThemes();
    const all = topicCbs();
    if (!themesSum) return;
    if (sel.length === 0){ themesSum.textContent = 'Темы не выбраны'; allCb && (allCb.checked=false); }
    else if (sel.length === all.length){ themesSum.textContent = 'Все темы'; allCb && (allCb.checked=true); }
    else {
      themesSum.textContent = sel.slice(0,3).join(', ') + (sel.length>3 ? ` +${sel.length-3}` : '');
      allCb && (allCb.checked=false);
    }
    try{ localStorage.setItem(LS_THEMES, JSON.stringify(sel)); }catch(_){}
  }
  allCb?.addEventListener('change', ()=>{
    const on = !!allCb.checked;
    topicCbs().forEach(c=> c.checked = on);
    updateThemesSummary();
  });
  themesDD?.addEventListener('change', (e)=>{
    if (e.target.matches('input[data-theme]:not([data-theme="all"])')){
      if (!e.target.checked && allCb) allCb.checked = false;
      if (topicCbs().every(c=>c.checked) && allCb) allCb.checked = true;
      updateThemesSummary();
    }
  });
  // restore themes
  try{
    const saved = JSON.parse(localStorage.getItem(LS_THEMES) || 'null');
    if (Array.isArray(saved) && saved.length){
      topicCbs().forEach(c=> c.checked = saved.includes(c.getAttribute('data-theme')));
      if (allCb) allCb.checked = topicCbs().every(c=> c.checked);
    }
  }catch(_){}
  updateThemesSummary();

  // --- Exams list + stats storage
  function getList(){ try{ return JSON.parse(localStorage.getItem(LS_LIST)) || []; }catch(_){ return []; } }
  function setList(arr){ try{ localStorage.setItem(LS_LIST, JSON.stringify(arr)); }catch(_){} }
  function getStats(){ try{ return JSON.parse(localStorage.getItem(LS_STATS)) || {}; }catch(_){ return {}; } }
  function setStats(obj){ try{ localStorage.setItem(LS_STATS, JSON.stringify(obj)); }catch(_){} }

  // Экспорт «хука» для exam.html (подключим позже в exam.html)
  // Пример записи: builderRecordResult({ id:'ex123', title:'...', user:'Имя', time:'05:13', score:87, source:'link' })
  window.builderRecordResult = function(entry){
    if (!entry || !entry.id) return;
    const stats = getStats();
    stats[entry.id] = stats[entry.id] || [];
    stats[entry.id].push({
      title: entry.title || '',
      user: entry.user || 'Гость',
      datetime: entry.datetime || new Date().toISOString(),
      time: entry.time || '00:00',
      score: Number(entry.score || 0),
      source: entry.source || 'link'
    });
    setStats(stats);
    renderStats(); // обновим таблицу, если открыта
  };

  // --- Build exam object
  function makeExam(){
    return {
      id: uid(),
      title: (titleInput?.value || '').trim() || 'Экзамен',
      topics: selectedThemes(),
      count: Number(countInput?.value || 20),
      time: Number(timeInput?.value || 20),
      hl: !!(hlCheckbox && hlCheckbox.checked)
    };
  }

  // --- Draft save/restore
  function saveDraft(){
    try{
      localStorage.setItem(LS_DRAFT, JSON.stringify({
        title: titleInput?.value || '',
        count: countInput?.value || '',
        time: timeInput?.value || '',
        hl: !!(hlCheckbox && hlCheckbox.checked)
      }));
    }catch(_){}
  }
  function loadDraft(){
    try{
      const d = JSON.parse(localStorage.getItem(LS_DRAFT) || 'null');
      if (!d) return;
      if (titleInput) titleInput.value = d.title || '';
      if (countInput) countInput.value = d.count || '';
      if (timeInput) timeInput.value = d.time || '';
      if (hlCheckbox) hlCheckbox.checked = !!d.hl;
    }catch(_){}
  }
  [titleInput, countInput, timeInput, hlCheckbox].forEach(el => el && el.addEventListener('input', saveDraft));
  loadDraft();

  // --- List render
  function renderList(){
    const list = getList();
    listEl.innerHTML = '';
    if (!list.length){ emptyEl && (emptyEl.style.display='block'); return; }
    if (emptyEl) emptyEl.style.display = 'none';

    list.forEach(ex=>{
      const row = document.createElement('div');
      row.className = 'exam-item';

      const left = document.createElement('div');
      const titleLink = document.createElement('a');
      titleLink.className = 'exam-title';
      titleLink.href = '#stats';
      titleLink.textContent = ex.title;
      titleLink.addEventListener('click', ()=> {
        renderStats(ex.id);
        document.getElementById('stats-tbody')?.scrollIntoView({behavior:'smooth', block:'start'});
      });

      const meta = document.createElement('div');
      meta.className = 'muted';
      meta.style.fontSize = '14px';
      meta.textContent = `Темы: ${ex.topics?.join(', ') || '—'} · Вопросов: ${ex.count} · Время: ${ex.time} мин`;

      left.appendChild(titleLink);
      left.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'exam-actions';

      const bStart = document.createElement('button');
      bStart.className = 'btn'; bStart.type='button'; bStart.textContent='Начать';
      bStart.addEventListener('click', (e)=>{ addRippleSafe(e,'blue'); openExam(ex); });

      const bLink = document.createElement('button');
      bLink.className = 'btn'; bLink.type='button'; bLink.textContent='Ссылка';
      bLink.addEventListener('click', (e)=>{
        addRippleSafe(e);
        const q = buildQuery({ id: ex.id, title: ex.title, topics: ex.topics, count: ex.count, time: ex.time, hl: ex.hl });
        shareInp.value = location.origin + '/exam.html' + q;
        shareInp.focus(); shareInp.select();
        navigator.clipboard?.writeText(shareInp.value).catch(()=> document.execCommand?.('copy'));
      });

      const bDel = document.createElement('button');
      bDel.className = 'btn'; bDel.type='button'; bDel.textContent='Удалить';
      bDel.addEventListener('click', (e)=>{
        addRippleSafe(e);
        const next = getList().filter(i => i.id !== ex.id);
        setList(next); renderList();
      });

      const bEdit = document.createElement('button');
	  bEdit.className = 'btn';
	  bEdit.type = 'button';
	  bEdit.textContent = 'Редактировать';
	  bEdit.addEventListener('click', ()=> window.builderEditExam(ex.id));

	  const bCopy = document.createElement('button');
	  bCopy.className = 'btn';
	  bCopy.type = 'button';
	  bCopy.textContent = 'Дублировать';
	  bCopy.addEventListener('click', ()=> window.builderDuplicateExam(ex.id));

	  actions.append(bStart, bLink, bEdit, bCopy, bDel);

      row.append(left, actions);
      listEl.appendChild(row);
    });
  }

  function openExam(ex){
    const q = buildQuery({ id: ex.id, title: ex.title, topics: ex.topics, count: ex.count, time: ex.time, hl: ex.hl });
    window.location.href = 'exam.html' + q;
  }

  // --- Stats render (optionally filtered by examId)
  function renderStats(filterId){
    const stats = getStats(); // { [examId]: Attempt[] }
    statsTbody.innerHTML = '';
    const ids = Object.keys(stats);
    const rows = [];

    ids.forEach(id=>{
      if (filterId && id !== filterId) return;
      (stats[id] || []).forEach(attempt=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${attempt.title || id}</td>
          <td>${attempt.user || 'Гость'}</td>
          <td>${formatDateTime(attempt.datetime)}</td>
          <td>${attempt.time || '—'}</td>
          <td>${Number(attempt.score||0)}%</td>
          <td>${attempt.source || 'link'}</td>`;
        rows.push(tr);
      });
    });

    if (!rows.length){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" class="muted">Пока нет данных.</td>`;
      statsTbody.appendChild(tr);
    } else {
      rows.sort((a,b)=> a.cells[2].textContent < b.cells[2].textContent ? 1 : -1);
      rows.forEach(r=> statsTbody.appendChild(r));
    }
  }
  function formatDateTime(iso){
    try{
      if (!iso) return '—';
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yyyy = d.getFullYear();
      const HH = String(d.getHours()).padStart(2,'0');
      const MM = String(d.getMinutes()).padStart(2,'0');
      return `${dd}.${mm}.${yyyy} ${HH}:${MM}`;
    }catch(_){ return iso || '—'; }
  }

  // --- Actions (form buttons)
  btnGen?.addEventListener('click', (e)=>{
    e.preventDefault(); animateClickSafe(btnGen);
    const ex = makeExam();
    // добавим/обновим в «Мои экзамены» (по title + topics как простая эвристика)
    const list = getList();
    const idx = list.findIndex(i => i.title === ex.title);
    if (idx >= 0) ex.id = list[idx].id; // сохраняем старый id, если имя совпало
    const q = buildQuery({ id: ex.id, title: ex.title, topics: ex.topics, count: ex.count, time: ex.time, hl: ex.hl });
    shareInp.value = location.origin + '/exam.html' + q;
    if (idx >= 0) list[idx] = ex; else list.unshift(ex);
    setList(list); renderList();
  });

  btnCopy?.addEventListener('click', (e)=>{
    e.preventDefault(); animateClickSafe(btnCopy);
    shareInp.focus(); shareInp.select();
    if (navigator.clipboard) navigator.clipboard.writeText(shareInp.value).catch(()=> document.execCommand?.('copy'));
    else document.execCommand?.('copy');
  });

  btnRun?.addEventListener('click', (e)=>{
    e.preventDefault(); animateClickSafe(btnRun);
    const ex = makeExam();
    // добавим в список, если не было
    const list = getList();
    const has = list.some(i => i.title === ex.title);
    if (!has) { list.unshift(ex); setList(list); renderList(); }
    openExam(ex);
  });

  // Первичная отрисовка
  renderList();
  renderStats();
})();

  // ============================
// BUILDER — расширенный функционал
// ============================
(function(){
  const page = document.querySelector('.page-builder');
  if (!page) return;

  const btnSave = document.getElementById('save-exam');
  const listEl  = document.getElementById('exam-list');
  const emptyEl = document.getElementById('empty-state');

  const titleInput = document.getElementById('exam-title');
  const countInput = document.getElementById('exam-count');
  const timeInput  = document.getElementById('exam-time');
  const hlCheckbox = document.getElementById('exam-highlight');

  const LS_LIST  = 'builder:exams:v1';
  const LS_LAST  = 'builder:last:v1';

  function getList(){ try{ return JSON.parse(localStorage.getItem(LS_LIST)) || []; }catch(_){ return []; } }
  function setList(arr){ try{ localStorage.setItem(LS_LIST, JSON.stringify(arr)); }catch(_){} }

  function makeExam(){
    return {
      id: 'ex' + Date.now(),
      title: (titleInput?.value || '').trim() || 'Экзамен',
      topics: (window.selectedThemes ? window.selectedThemes() : []),
      count: Number(countInput?.value || 20),
      time: Number(timeInput?.value || 20),
      hl: !!(hlCheckbox && hlCheckbox.checked)
    };
  }

  // Кнопка "Сохранить экзамен"
  btnSave?.addEventListener('click', (e)=>{
    e.preventDefault();
    const ex = makeExam();
    const list = getList();
    const exists = list.some(i => i.title === ex.title);
    if (!exists) list.unshift(ex);
    else list[list.findIndex(i=>i.title===ex.title)] = ex;
    setList(list);
    localStorage.setItem(LS_LAST, JSON.stringify(ex)); // сохранить как последний
    alert('Экзамен сохранён');
    if (typeof renderList === 'function') renderList();
  });

  // Дублировать экзамен
  window.builderDuplicateExam = function(id){
    const list = getList();
    const orig = list.find(x=>x.id===id);
    if (!orig) return;
    const copy = { ...orig, id: 'ex' + Date.now(), title: orig.title + ' (копия)' };
    list.unshift(copy);
    setList(list);
    if (typeof renderList === 'function') renderList();
  };

  // Редактировать экзамен
  window.builderEditExam = function(id){
    const list = getList();
    const ex = list.find(x=>x.id===id);
    if (!ex) return;
    titleInput.value = ex.title || '';
    countInput.value = ex.count || '';
    timeInput.value  = ex.time  || '';
    hlCheckbox.checked = !!ex.hl;
    if (Array.isArray(ex.topics) && window.updateThemesSummary){
      // снять все темы
      const topics = document.querySelectorAll('#bldrThemesDropdown input[data-theme]:not([data-theme="all"])');
      topics.forEach(c => c.checked = ex.topics.includes(c.getAttribute('data-theme')));
      window.updateThemesSummary();
    }
    alert('Параметры экзамена подставлены в форму');
  };

  // Автоподстановка последнего экзамена при загрузке
  window.addEventListener('DOMContentLoaded', ()=>{
    try{
      const last = JSON.parse(localStorage.getItem(LS_LAST) || 'null');
      if (!last) return;
      titleInput.value = last.title || '';
      countInput.value = last.count || '';
      timeInput.value  = last.time  || '';
      hlCheckbox.checked = !!last.hl;
      if (Array.isArray(last.topics) && window.updateThemesSummary){
        const topics = document.querySelectorAll('#bldrThemesDropdown input[data-theme]:not([data-theme="all"])');
        topics.forEach(c => c.checked = last.topics.includes(c.getAttribute('data-theme')));
        window.updateThemesSummary();
      }
    }catch(_){}
  });
})();

// =============================================
// EXAM LINK HANDLER — «оживляем» ссылки на exam.html
// =============================================
(function(){
  // Работает только на странице exam.html
  const isExamPage = /(^|\/)exam\.html(\?|$)/i.test(location.pathname) || document.body.id === 'exam-page';
  if (!isExamPage) return;

  // --- Чтение параметров ссылки
  const qs = new URLSearchParams(location.search);
  const cfg = {
    id:    qs.get('id')    || ('ex' + Date.now()),
    title: qs.get('title') || 'Экзамен',
    topics: (qs.get('topics') || '').split(',').filter(Boolean),
    count: Number(qs.get('count') || 20),
    time:  Number(qs.get('time')  || 20),     // минуты
    hl:    qs.get('hl') === '1'               // подсветка ошибок
  };
  // Делаем доступным глобально (вдруг понадобится)
  window.examConfig = cfg;

  // --- Подстановка в UI (только если элементы существуют)
  // Заголовок (ищем по id или по селекторам)
  const titleEl = document.getElementById('examTitle') ||
                  document.querySelector('.page-title, h1') ||
                  null;
  if (titleEl) titleEl.textContent = cfg.title;

  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = String(cfg.count);

  // Подсветка ошибок: если есть чекбокс/индикатор — обновим
  const hlEl = document.getElementById('examHighlight') || document.querySelector('[data-exam-hl]');
  if (hlEl){
    if ('checked' in hlEl) hlEl.checked = !!cfg.hl;
    hlEl.setAttribute('aria-pressed', cfg.hl ? 'true' : 'false');
  }

  // --- Таймер
  const clockEl = document.getElementById('examClock') || document.getElementById('trainClock');
  let startTs = Date.now();
  let timerId = null;

  function fmt(sec){
    sec = Math.max(0, Math.floor(sec));
    const m = String(Math.floor(sec/60)).padStart(2,'0');
    const s = String(sec%60).padStart(2,'0');
    return `${m}:${s}`;
  }
  function updateClock(){
    const elapsed = Math.floor((Date.now() - startTs)/1000);
    const left = cfg.time * 60 - elapsed;
    if (clockEl) clockEl.textContent = fmt(Math.max(left, 0));
    if (left <= 0){ stopTimer(); onTimeUp(); }
  }
  function startTimer(){
    stopTimer();
    // сразу показать стартовое значение
    if (clockEl) clockEl.textContent = fmt(cfg.time * 60);
    timerId = setInterval(updateClock, 1000);
  }
  function stopTimer(){
    if (timerId){ clearInterval(timerId); timerId = null; }
  }
  function onTimeUp(){
    // Если у тебя есть модалка результатов — можешь открыть её здесь
    // document.getElementById('trainResultModal') и т.д.
    // Заодно запишем результат (0% если не реализован подсчёт)
    recordResult();
  }
  startTimer();

  // --- Подготовка «результата» для конструктора
  function getElapsed(){
    const sec = Math.floor((Date.now() - startTs)/1000);
    return fmt(sec);
  }
  function computeScore(){
    // Если у тебя есть функция подсчёта — используй её:
    if (typeof window.examComputeScore === 'function'){
      const s = Number(window.examComputeScore());
      if (!Number.isNaN(s)) return Math.max(0, Math.min(100, s));
    }
    // Заглушка: 0% (пока не подключили реальный движок вопросов)
    return 0;
  }
  function recordResult(){
    const payload = {
      id: cfg.id,
      title: cfg.title,
      user: (localStorage.getItem('profile:name') || 'Гость'),
      datetime: new Date().toISOString(),
      time: getElapsed(),
      score: computeScore(),
      source: 'link'
    };
    if (typeof window.builderRecordResult === 'function'){
      try { window.builderRecordResult(payload); } catch(e){}
    } else {
      // Если конструктор ещё не подключал свою функцию — сохраним в общий ключ, чтобы не потерялось
      try{
        const LS_FALLBACK = 'builder:stats:v1';
        const stats = JSON.parse(localStorage.getItem(LS_FALLBACK) || '{}');
        stats[cfg.id] = stats[cfg.id] || [];
        stats[cfg.id].push(payload);
        localStorage.setItem(LS_FALLBACK, JSON.stringify(stats));
      }catch(e){}
    }
  }

  // --- Кнопка «Завершить» (если есть)
  const finishBtn = document.getElementById('btnFinish') || document.getElementById('examFinish');
  finishBtn?.addEventListener('click', (e)=>{
    e.preventDefault();
    try{ animateClick?.(finishBtn); }catch(_){}
    stopTimer();
    recordResult();
    // тут можно открыть модалку результатов или редиректить — на твоё усмотрение
  });

  // --- Включение/выключение подсветки ошибок на лету (по cfg.hl)
  // Если у тебя в движке есть обработка подсветки — дерни её здесь.
  if (cfg.hl && typeof window.examEnableHighlight === 'function'){
    try { window.examEnableHighlight(true); } catch(_){}
  }
})();

// =============================================
// EXAM LINK ADAPTER v2 — применяет параметры из URL на exam.html
// =============================================
(function(){
  // работаем только на exam.html
  const onExam = /(^|\/)exam\.html(\?|$)/i.test(location.pathname);
  if (!onExam) return;

  const qs = new URLSearchParams(location.search);
  if ([...qs.keys()].length === 0) return; // нет параметров — ничего не делаем

  const cfg = {
    id:    qs.get('id')    || ('ex' + Date.now()),
    title: qs.get('title') || 'Экзамен',
    topics: (qs.get('topics') || '').split(',').filter(Boolean),
    count: Number(qs.get('count') || 20),
    time:  Number(qs.get('time')  || 20),   // минуты
    hl:    qs.get('hl') === '1'
  };
  window.examConfig = cfg; // на всякий случай глобально
  console.log('[ExamAdapter] конфиг из URL:', cfg);

  // --- Мягкая подстановка в UI (если есть такие элементы)
  const titleEl = document.getElementById('examTitle') ||
                  document.querySelector('.page-title, h1');
  if (titleEl) titleEl.textContent = cfg.title;

  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = String(cfg.count);

  // таймер/часы: используем trainClock, если нет examClock
  const clockEl = document.getElementById('examClock') || document.getElementById('trainClock');

  // если у движка есть свои глобальные состояния — подправим их
  if (window.examState){
    examState.total = cfg.count;
    examState.timeLimit = cfg.time * 60;
    examState.topics = cfg.topics;
    examState.highlight = cfg.hl;
  }
  // экспорт флага подсветки (если движок читает глобально)
  window.examHighlightEnabled = cfg.hl;

  // --- Таймер по лимиту (не мешает, если у тебя свой — просто обновляет DOM)
  let startTs = Date.now(), tId = null;
  function fmt(sec){ sec = Math.max(0, sec|0); const m=String((sec/60|0)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}`; }
  function tick(){
    const left = cfg.time*60 - ((Date.now()-startTs)/1000|0);
    if (clockEl) clockEl.textContent = fmt(Math.max(left,0));
    if (left <= 0){ clearInterval(tId); tryFinish('timeup'); }
  }
  if (cfg.time > 0){ if (clockEl) clockEl.textContent = fmt(cfg.time*60); tId = setInterval(tick, 1000); }

  // --- Попытка «встроиться» в твой движок: если есть функция старта — вызываем с конфигом
  // поддерживаем разные возможные имена
  const startFns = ['startExam','examStart','initExam','startTraining'];
  for (const n of startFns){
    if (typeof window[n] === 'function'){
      // оборачиваем оригинал: сначала применяем конфиг, затем вызываем
      const orig = window[n];
      window[n] = function wrappedStart(){
        try {
          // если у тебя старт без аргументов — конфиг уже в window.examConfig / examState
          return orig.apply(this, arguments);
        } finally {
          // после старта убедимся, что счётчики совпадают
          const totalEl2 = document.getElementById('statTotal'); 
          if (totalEl2) totalEl2.textContent = String(cfg.count);
        }
      };
      console.log('[ExamAdapter] найден стартовый метод:', n);
      break;
    }
  }

  // --- Кнопка «Завершить» → записать результат в статистику конструктора
  function getElapsed(){
    const sec = ((Date.now()-startTs)/1000)|0;
    return fmt(sec);
  }
  function computeScore(){
    if (typeof window.examComputeScore === 'function'){
      const s = Number(window.examComputeScore());
      if (!Number.isNaN(s)) return Math.max(0, Math.min(100, s));
    }
    // заглушка пока движок не подключён
    return 0;
  }
  function recordResult(source){
    const payload = {
      id: cfg.id, title: cfg.title,
      user: (localStorage.getItem('profile:name') || 'Гость'),
      datetime: new Date().toISOString(),
      time: getElapsed(),
      score: computeScore(),
      source: source || 'link'
    };
    if (typeof window.builderRecordResult === 'function'){
      try { window.builderRecordResult(payload); } catch(e){ console.warn(e); }
    } else {
      try{
        const key = 'builder:stats:v1';
        const stats = JSON.parse(localStorage.getItem(key) || '{}');
        (stats[cfg.id] = stats[cfg.id] || []).push(payload);
        localStorage.setItem(key, JSON.stringify(stats));
      }catch(e){}
    }
    console.log('[ExamAdapter] запись результата:', payload);
  }
  function tryFinish(reason){
    recordResult(reason || 'finish');
    // здесь можно открыть твою модалку результатов, если есть
    // например: document.getElementById('trainResultModal')?.classList.add('open');
  }

  const finishBtn = document.getElementById('btnFinish') || document.getElementById('examFinish');
  finishBtn?.addEventListener('click', (e)=>{ e.preventDefault(); tryFinish('manual'); });

  // на всякий: если у тебя есть глобальный обработчик окончания — перехватим
  if (typeof window.examFinish === 'function'){
    const origFinish = window.examFinish;
    window.examFinish = function(){
      tryFinish('engine');
      return origFinish.apply(this, arguments);
    };
  }

  // итоговое сообщение в консоль
  console.log('[ExamAdapter] готово. Если параметры не видны — пришли exam.html в ZIP, подгоню селекторы.');
})();
  
  // =============================================
// EXAM LINK ADAPTER — читает параметры из ?... или #...
// =============================================
(function(){
  // работаем на /exam и /exam.html
  const isExam = /(^|\/)exam(\.html)?(\/|$)/i.test(location.pathname);
  if (!isExam) return;

  function getParams() {
    // 1) обычный ?query
    if (location.search && location.search.length > 1) {
      return new URLSearchParams(location.search.slice(1));
    }
    // 2) #?query или #key=val&key=val
    if (location.hash && location.hash.length > 1) {
      const h = location.hash.slice(1);
      return new URLSearchParams(h.startsWith('?') ? h.slice(1) : h);
    }
    return new URLSearchParams();
  }

  const qs = getParams();
  if ([...qs.keys()].length === 0) return; // нет параметров — выходим

  const cfg = {
    id:    qs.get('id')    || ('ex' + Date.now()),
    title: qs.get('title') || 'Экзамен',
    topics: (qs.get('topics') || '').split(',').filter(Boolean),
    count: Math.max(1, Number(qs.get('count') || 20)),
    time:  Math.max(1, Number(qs.get('time')  || 20)),   // минуты
    hl:    qs.get('hl') === '1'
  };
  window.examConfig = cfg;

  // подставим заголовок/счётчики, если есть
  const titleEl = document.querySelector('.exam-intro h2, #examTitle, .page-title, h1');
  if (titleEl) titleEl.textContent = cfg.title;

  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = String(cfg.count);

  // если твой экзамен-модуль зашит на 20 вопросов и 20 минут —
  // убедись, что ты уже сделал те 3 правки (questionCount и __timeMin).
  // ниже — только безопасный таймер для UI
  const clockEl = document.getElementById('examClock') || document.getElementById('trainClock');
  let start = Date.now(), tId;
  const fmt = s => `${String((s/60|0)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  function tick(){
    const left = cfg.time*60 - ((Date.now()-start)/1000|0);
    if (clockEl) clockEl.textContent = fmt(Math.max(left,0));
    if (left<=0){ clearInterval(tId); tryFinish('timeup'); }
  }
  if (clockEl){ clockEl.textContent = fmt(cfg.time*60); tId = setInterval(tick,1000); }

  // запись результата (как раньше)
  function tryFinish(source){
    const payload = {
      id: cfg.id, title: cfg.title,
      user: localStorage.getItem('profile:name') || 'Гость',
      datetime: new Date().toISOString(),
      time: (()=>{
        const sec = ((Date.now()-start)/1000)|0;
        return fmt(sec);
      })(),
      score: (typeof window.examComputeScore === 'function' ? Number(window.examComputeScore()) : 0) || 0,
      source: source || 'link'
    };
    if (typeof window.builderRecordResult === 'function') window.builderRecordResult(payload);
    else {
      const KEY='builder:stats:v1'; const stats = JSON.parse(localStorage.getItem(KEY)||'{}');
      (stats[cfg.id] = stats[cfg.id] || []).push(payload); localStorage.setItem(KEY, JSON.stringify(stats));
    }
  }
  (document.getElementById('btnFinish') || document.getElementById('examFinish'))?.addEventListener('click', e=>{ e.preventDefault(); tryFinish('manual'); });
})();




// === Training page button press animation ===
(function(){
  const onTrainPage = document.querySelector('.page.training-page');
  if (!onTrainPage) return;

  function attachPress(el){
    if (!el) return;
    if (el.__pressBound) return; el.__pressBound = true;
    el.addEventListener('mousedown', ()=> el.classList.add('is-pressing'));
    el.addEventListener('pointerdown', ()=> el.classList.add('is-pressing'));
    ['mouseup','mouseleave','pointerup','pointerleave','blur'].forEach(ev=>{
      el.addEventListener(ev, ()=> el.classList.remove('is-pressing'));
    });
    el.addEventListener('click', ()=> {
      // quick tap feedback
      el.classList.add('is-pressing');
      setTimeout(()=> el.classList.remove('is-pressing'), 120);
    });
  }

  // Target buttons: "Завершить" (id=btnFinish), result modal buttons
  const finishBtn = document.getElementById('btnFinish');
  attachPress(finishBtn);
  document.querySelectorAll('#trainResultModal .btn').forEach(attachPress);

  // If modal opens dynamically later, observe DOM for late buttons
  const mo = new MutationObserver(()=>{
    document.querySelectorAll('#trainResultModal .btn').forEach(attachPress);
  });
  mo.observe(document.documentElement, {subtree:true, childList:true});
})();


// === Exam page button press animation ===
(function(){
  const examPage = document.querySelector('.page.exam-page');
  if (!examPage) return;

  function attachPress(btn){
    if (!btn || btn.__pressBound) return;
    btn.__pressBound = true;
    btn.addEventListener('mousedown', ()=> btn.classList.add('is-pressing'));
    btn.addEventListener('pointerdown', ()=> btn.classList.add('is-pressing'));
    ['mouseup','mouseleave','pointerup','pointerleave','blur'].forEach(ev=>{
      btn.addEventListener(ev, ()=> btn.classList.remove('is-pressing'));
    });
    btn.addEventListener('click', ()=>{
      btn.classList.add('is-pressing');
      setTimeout(()=> btn.classList.remove('is-pressing'), 120);
    });
  }

  // навешиваем на все кнопки .btn на странице экзамена
  examPage.querySelectorAll('.btn').forEach(attachPress);

  // на случай динамической подгрузки кнопок
  const mo = new MutationObserver(()=> examPage.querySelectorAll('.btn').forEach(attachPress));
  mo.observe(examPage, {subtree:true, childList:true});
})();


// === Exam page button press animation (fixed selector for .exam-one-page) ===
(function(){
  const container = document.querySelector('.exam-one-page') || document.querySelector('.page.exam-page');
  if (!container) return;
  function attachPress(btn){
    if (!btn || btn.__pressBound) return;
    btn.__pressBound = true;
    btn.addEventListener('mousedown', ()=> btn.classList.add('is-pressing'));
    btn.addEventListener('pointerdown', ()=> btn.classList.add('is-pressing'));
    ['mouseup','mouseleave','pointerup','pointerleave','blur'].forEach(ev=>{
      btn.addEventListener(ev, ()=> btn.classList.remove('is-pressing'));
    });
    btn.addEventListener('click', ()=> {
      btn.classList.add('is-pressing');
      setTimeout(()=> btn.classList.remove('is-pressing'), 120);
    });
  }
  // initial
  container.querySelectorAll('.btn').forEach(attachPress);
  // observe for dynamically inserted buttons (e.g., Finish/Again in modal)
  const mo = new MutationObserver(()=> container.querySelectorAll('.btn').forEach(attachPress));
  mo.observe(container, {subtree:true, childList:true});
})();

// === TRAINING: fix "Ещё раз" restart ===
(function(){
  const page = document.querySelector('.page.training-page');
  if (!page) return;

  const btnAgain = document.getElementById('resAgain');
  if (!btnAgain) return;

  function softCloseResults(){
    // 1) клик по крестику, если есть логика закрытия
    document.getElementById('trainResultClose')?.click();
    // 2) на всякий: снять open, aria и display
    const modal = document.getElementById('trainResultModal');
    if (modal){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      // если у тебя модалка управляется через inline style:
      if (getComputedStyle(modal).display !== 'none') modal.style.display = 'none';
    }
  }

  function clearTimers(){
    // Попробуем остановить возможные интервалы/таймауты, если они есть
    const ids = ['trainTimer','trainInterval','timerId','trainClockTimer','qTimer'];
    ids.forEach(k=>{
      const v = window[k];
      if (typeof v === 'number'){ try{ clearInterval(v); clearTimeout(v); }catch(_){ } window[k] = null; }
    });
  }

  function resetUI(){
    document.getElementById('trainClock') && (document.getElementById('trainClock').textContent = '00:00');
    const idx = document.getElementById('statIndex');
    const tot = document.getElementById('statTotal'); // тотал не трогаем (если динамический)
    const ok  = document.getElementById('statCorrect');
    const rate= document.getElementById('statRate');
    if (idx) idx.textContent = '1';
    if (ok)  ok.textContent  = '0';
    if (rate) rate.textContent = '0/0';
    // очистить варианты ответов
    const qa = document.getElementById('qAnswers'); if (qa) qa.innerHTML = '';
    const qt = document.getElementById('qText'); if (qt) qt.textContent = 'Загрузка вопроса…';
    const qm = document.getElementById('qMedia'); if (qm) qm.hidden = true, (qm.innerHTML = '');
  }

  function startTrainingAgain(){
    // Поддержим разные имена стартовых функций
    const starters = ['startTraining','trainingStart','initTraining','startExam','startTrainingSession'];
    for (const name of starters){
      if (typeof window[name] === 'function'){
        try { return void window[name](); } catch(e){ /* продолжаем */ }
      }
    }
    // Если у тебя модуль тренировки слушает событие — дёрнем
    try { window.dispatchEvent(new CustomEvent('training:restart')); } catch(_){}
    // Крайний случай — мягкая перезагрузка
    location.reload();
  }

  function handleAgain(e){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    softCloseResults();
    clearTimers();
    resetUI();

    // небольшая пауза, чтобы CSS-анимации и скрытие модалки успели примениться
    setTimeout(startTrainingAgain, 50);
  }

  // Вешаем надёжный обработчик в capture-фазе (чтобы перебить чужие stopPropagation)
  btnAgain.addEventListener('click', handleAgain, { capture: true });
})();


// === GLOBAL PRESS EFFECT — attach handlers for unified click animation ===
(function(){
  if (window.__pressHandlersInstalled) return;
  window.__pressHandlersInstalled = true;

  const SELECTOR = '.btn, button, [role=\"button\"], .pill, .icon-btn, .pay-btn';
  const mark = Symbol('pressBound');

  function attach(el){
    if (!el || el[mark]) return; el[mark] = true;
    const on = ()=> el.classList.add('is-pressing');
    const off = ()=> el.classList.remove('is-pressing');

    el.addEventListener('mousedown', on, {passive:true});
    el.addEventListener('pointerdown', on, {passive:true});
    ['mouseup','mouseleave','pointerup','pointerleave','blur'].forEach(ev=> el.addEventListener(ev, off, {passive:true}));
    el.addEventListener('click', ()=>{ on(); setTimeout(off, 120); }, {passive:true, capture:true});
  }

  function scan(root){
    root.querySelectorAll(SELECTOR).forEach(attach);
  }

  scan(document);

  const mo = new MutationObserver((list)=>{
    for (const m of list){
      if (m.type === 'childList'){
        m.addedNodes.forEach(node=>{
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(SELECTOR)) attach(node);
          if (node.querySelectorAll) scan(node);
        });
      }
      if (m.type === 'attributes'){
        const el = m.target;
        if (el.matches && el.matches(SELECTOR)) attach(el);
      }
    }
  });
  mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
})();