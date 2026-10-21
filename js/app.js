(function () {
  'use strict';
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- step text (edit me) ---------- */
  var STEPS = [
    { t: 'The fenced plot', sub: 'What is a VPC?',
      plain: 'Divyapriya buys a big plot of land inside a huge city and fences it. Only her people can enter. Nothing outside can wander in.',
      tech: 'AWS Cloud Region + VPC (Virtual Private Cloud), here 10.0.0.0/16 - your own private network.',
      watch: 'The big dashed box is the city (AWS Cloud). The teal box inside is her fenced plot.' },
    { t: 'Two buildings', sub: 'Availability Zones', 
      plain: 'She builds two identical buildings far apart. If one has a power cut, the other keeps the shop open.',
      tech: 'Availability Zones (AZ) A and B - separate data centres in the same Region.',
      watch: 'Two blue buildings appear side by side inside the plot.' },
    { t: 'Lobby and flats', sub: 'Subnets', 
      plain: 'Each building has a gold lobby that guests may enter, and purple private flats where only staff go.',
      tech: 'Public subnets (reachable from the internet) and private subnets (hidden), one pair per zone.',
      watch: 'Gold = public lobby. Purple = private flats, one of each in both buildings.' },
    { t: 'The main gate', sub: 'Internet Gateway', 
      plain: 'A main gate is built so customers from outside can reach the society. A signboard tells every car which road leads to the gate.',
      tech: 'Internet Gateway (IGW) plus a route table sending 0.0.0.0/0 traffic to it.',
      watch: 'An envelope (a visitor request) travels from Visitors, through The Internet, into the gate.' },
    { t: 'The receptionist', sub: 'Load Balancer + web servers', 
      plain: 'A receptionist greets every visitor and sends them to whichever front desk is free, so nobody waits in a long queue.',
      tech: 'Application Load Balancer spreading requests over web servers in both zones.',
      watch: 'Envelopes go from the receptionist bar down to Zone A, then Zone B, taking turns.' },
    { t: 'Kitchen and vault', sub: 'App servers + database', 
      plain: 'Front desks pass orders to the kitchen (app server), which saves details in a vault (database). A second vault in the other building keeps a live copy.',
      tech: 'App tier, database tier and Multi-AZ replication to a standby database.',
      watch: 'Floppy disks (data) move web, app, database. Repeat arrows copy data between buildings.' },
    { t: 'The delivery counter', sub: 'NAT Gateway', 
      plain: 'Private staff may not walk out the main gate. A delivery counter in the lobby fetches parcels for them, and nobody outside can come in through it.',
      tech: 'NAT Gateway: private servers reach the internet (for updates) but cannot be reached from it.',
      watch: 'A software-update package goes out via the delivery counter, then through the gate.' },
    { t: 'Guards everywhere', sub: 'Security Groups + NACLs', 
      plain: 'Every door has a guard (checks each person) and every lobby has a gate guard (checks everyone entering the area). Strangers are turned away.',
      tech: 'Security Groups (per server, stateful) and Network ACLs (per subnet, stateless).',
      watch: 'A red devil tries to reach the private flats and is stopped: Blocked!' },
    { t: 'Tunnel and private road', sub: 'VPN + Peering', 
      plain: 'Her office reaches the private flats through a secret tunnel. A partner shop next door is joined by a private road, away from public streets.',
      tech: 'Site-to-Site VPN gateway and VPC peering with another VPC (10.1.0.0/16).',
      watch: 'A lock travels the tunnel from the Office. A handshake crosses the private road.' }
  ];
  var LEGEND = [['\u2709\uFE0F','Visitor request'],['\uD83D\uDCBE','Data'],['\uD83D\uDD01','Database replication'],['\uD83D\uDCE6','Software update'],['\uD83D\uDE08','Intruder'],['\uD83D\uDD12','Office VPN'],['\uD83E\uDD1D','Partner peering']];

  /* ---------- SVG helpers ---------- */
  var L = { w: {}, n: {}, p: {} };
  function add(layer, s, h) { L[layer][s] = (L[layer][s] || '') + h; }
  function R(x, y, w, h, c, rx) { return '<rect class="' + c + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 10) + '"/>'; }
  function T(x, y, s, c, a) { return '<text class="' + (c || 't1') + '" x="' + x + '" y="' + y + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>'; }
  function W(id, d, c) { return '<path id="' + id + '" class="wire ' + c + '" d="' + d + '"/>'; }
  function box(x, y, w, h, title, sub, c) { return R(x, y, w, h, 'node ' + c) + T(x + w / 2, y + 18, title, 't1') + (sub ? T(x + w / 2, y + 33, sub, 't2') : ''); }
  function tag(x, y, w, label) { return R(x, y, w, 16, 'tag', 4) + T(x + w / 2, y + 12, label, 'tg'); }
  function pkt(path, emoji, dur, a, b, begin) {
    a = a || 0; if (b === undefined) b = 1; begin = begin || 0;
    var win = !REDUCE && (a > 0 || b < 1), e = 0.03;
    var o = '<g><text class="emo" text-anchor="middle" dominant-baseline="central">' + emoji + '</text>';
    o += '<animateMotion dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1"><mpath href="#' + path + '"/></animateMotion>';
    if (win) o += '<animate attributeName="opacity" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + (a + e) + ';' + (b - e) + ';' + b + ';1"/>';
    return o + '</g>';
  }

  /* ---------- build the diagram ---------- */
  // 1 VPC
  add('n', 1, R(140, 15, 950, 590, 'cloud', 14) + T(156, 36, 'AWS Cloud \u00B7 Region (the city)', 'lbl', 'start').replace('class="lbl"', 'class="lbl" style="fill:#7dbbff"'));
  add('n', 1, R(160, 44, 800, 546, 'vpc', 14) + T(176, 66, 'VPC (fenced plot) \u00B7 10.0.0.0/16', 'lbl big', 'start').replace('class="lbl big"', 'class="lbl big" style="fill:#5eead4"'));
  // 2 AZs
  add('n', 2, R(205, 150, 320, 400, 'zone', 12) + T(217, 170, 'Zone A \u00B7 building', 'lbl', 'start'));
  add('n', 2, R(555, 150, 320, 400, 'zone', 12) + T(567, 170, 'Zone B \u00B7 building', 'lbl', 'start'));
  // 3 subnets
  [[220, 'A'], [570, 'B']].forEach(function (z) {
    add('n', 3, R(z[0], 190, 290, 115, 'pub', 10) + T(z[0] + 12, 208, 'Public subnet', 'lbl', 'start'));
    add('n', 3, R(z[0], 330, 290, 200, 'priv', 10) + T(z[0] + 12, 348, 'Private subnet', 'lbl', 'start'));
  });
  // 4 gate
  add('n', 4, box(8, 50, 100, 44, 'Visitors', 'customers', 'n-blue'));
  add('n', 4, box(8, 150, 100, 66, 'The Internet', 'outside world', 'n-blue'));
  add('n', 4, R(124, 130, 60, 80, 'node n-blue') + T(154, 148, 'Internet', 't1') + T(154, 161, 'Gateway', 't1') + T(154, 174, '(main gate)', 't3'));
  add('n', 4, R(640, 50, 305, 22, 'tag', 6).replace('tag', 'node n-teal') + T(792, 65, 'Route table: 0.0.0.0/0 \u2192 Internet Gateway', 't2'));
  add('w', 4, W('w_vi', 'M60,94 V150', 'w-b') + W('w_ig', 'M108,190 H194', 'w-b'));
  add('p', 4, pkt('w_vi', '\u2709\uFE0F', 3.2) + pkt('w_ig', '\u2709\uFE0F', 3.2, 0, 1, 1.6));
  // 5 load balancer + web
  add('w', 5, W('w_gl', 'M194,190 V99 H225', 'w-b') + W('w_la', 'M380,114 V218 H295 V225', 'w-b') + W('w_lb', 'M700,114 V218 H785 V225', 'w-b'));
  add('n', 5, R(225, 84, 630, 30, 'node n-blue') + T(540, 104, 'Load Balancer (receptionist)', 't1'));
  add('n', 5, box(240, 225, 110, 42, 'Web server', 'serves pages', 'n-gold') + box(730, 225, 110, 42, 'Web server', 'serves pages', 'n-gold'));
  add('p', 5, pkt('w_gl', '\u2709\uFE0F', 3.2) + pkt('w_la', '\u2709\uFE0F', 4, 0, 0.48) + pkt('w_lb', '\u2709\uFE0F', 4, 0.5, 0.98));
  // 6 app + db
  add('w', 6, W('w_wa', 'M325,267 V370', 'w-p') + W('w_wb', 'M755,267 V370', 'w-p') + W('w_ad', 'M350,391 H410', 'w-p') + W('w_bd', 'M730,391 H670', 'w-p') + W('w_rep', 'M500,391 H580', 'w-p'));
  add('n', 6, box(240, 370, 110, 42, 'App server', 'runs the shop', 'n-purple') + box(730, 370, 110, 42, 'App server', 'runs the shop', 'n-purple'));
  add('n', 6, box(410, 370, 90, 42, 'Database', 'the vault', 'n-purple') + box(580, 370, 90, 42, 'Database', 'live copy', 'n-purple'));
  add('p', 6, pkt('w_wa', '\uD83D\uDCBE', 3.2, 0, 0.5) + pkt('w_ad', '\uD83D\uDCBE', 3.2, 0.5, 1) + pkt('w_wb', '\uD83D\uDCBE', 3.2, 0, 0.5, 1.6) + pkt('w_bd', '\uD83D\uDCBE', 3.2, 0.5, 1, 1.6) + pkt('w_rep', '\uD83D\uDD01', 2.4));
  // 7 NAT
  add('w', 7, W('w_up', 'M350,380 H385 V285 H480 V267', 'w-n') + W('w_out', 'M420,267 V296 H154 V204 H112', 'w-n'));
  add('n', 7, box(410, 225, 90, 42, 'NAT', 'delivery counter', 'n-gold'));
  add('p', 7, pkt('w_up', '\uD83D\uDCE6', 7, 0, 0.45) + pkt('w_out', '\uD83D\uDCE6', 7, 0.5, 0.98));
  // 8 security
  add('w', 8, W('w_in', 'M108,190 H176 V450 H214', 'w-r'));
  add('n', 8, tag(240, 271, 64, 'SG guard') + tag(776, 271, 64, 'SG guard') + tag(240, 416, 64, 'SG guard') + tag(776, 416, 64, 'SG guard') + tag(410, 416, 64, 'SG guard') + tag(606, 416, 64, 'SG guard'));
  add('n', 8, tag(424, 196, 78, 'NACL guard') + tag(424, 336, 78, 'NACL guard') + tag(774, 196, 78, 'NACL guard') + tag(774, 336, 78, 'NACL guard'));
  var blink = REDUCE ? '' : '<animate attributeName="opacity" dur="5s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.7;0.75;0.95;1"/>';
  add('p', 8, pkt('w_in', '\uD83D\uDE08', 5, 0, 0.7));
  add('p', 8, '<g>' + T(222, 455, '\u2716', 'red lbl big') + T(236, 454, 'Blocked!', 'red lbl', 'start') + blink + '</g>');
  // 9 VPN + peering
  add('w', 9, W('w_vpn', 'M108,516 H300', 'w-n') + W('w_peer', 'M860,380 H985', 'w-n'));
  add('n', 9, box(8, 486, 100, 60, 'Office', 'head office', 'n-green'));
  add('n', 9, R(124, 462, 60, 68, 'node n-green') + T(154, 480, 'VPN', 't1') + T(154, 493, 'Gateway', 't1') + T(154, 506, '(tunnel end)', 't3'));
  add('n', 9, T(230, 504, 'secret tunnel (VPN)', 't3', 'start') + '<circle cx="300" cy="516" r="4" fill="#4ade80"/>');
  add('n', 9, box(985, 300, 95, 110, 'Partner VPC', '10.1.0.0/16', 'n-green') + T(1032, 350, '(next-door plot)', 't3'));
  add('n', 9, T(880, 366, 'VPC peering', 't3', 'start') + T(880, 404, '(private road)', 't3', 'start'));
  add('p', 9, pkt('w_vpn', '\uD83D\uDD12', 3) + pkt('w_peer', '\uD83E\uDD1D', 3, 0, 1, 1));

  function layer(k) {
    var o = '';
    for (var s = 1; s <= 9; s++) o += '<g class="st" data-s="' + s + '">' + (L[k][s] || '') + '</g>';
    return o;
  }
  var defs = '<defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#3b4a78" opacity=".45"/></pattern>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset="1" stop-color="#101d45"/></linearGradient></defs>';
  var stage = document.getElementById('stage');
  stage.innerHTML = defs + '<rect width="1100" height="620" fill="url(#sky)"/><rect width="1100" height="620" fill="url(#dots)"/>' + layer('w') + layer('n') + layer('p');
  if (REDUCE && stage.pauseAnimations) stage.pauseAnimations();

  /* ---------- UI ---------- */
  var nav = document.getElementById('steps'), btns = [], cur = 0, timer = null;
  STEPS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'step-btn';
    b.innerHTML = '<span class="num">' + (i + 1) + '</span><span><b>' + s.t + '</b><small>' + s.sub + '</small></span>';
    b.addEventListener('click', function () { stopAuto(); go(i + 1); });
    nav.appendChild(b); btns.push(b);
  });
  document.getElementById('legend').innerHTML = LEGEND.map(function (l) { return '<span><i>' + l[0] + '</i>' + l[1] + '</span>'; }).join('');

  function go(n) {
    var prev = cur; cur = n;
    stage.querySelectorAll('.st').forEach(function (g) {
      var s = +g.getAttribute('data-s');
      g.classList.toggle('on', s <= n);
      g.classList.remove('new');
      if (s === n && n > prev) { void g.getBoundingClientRect(); g.classList.add('new'); }
    });
    btns.forEach(function (b, i) { b.classList.toggle('active', i === n - 1); if (i === n - 1) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    var s = STEPS[n - 1];
    document.getElementById('c-title').textContent = n + '. ' + s.t;
    document.getElementById('c-plain').textContent = s.plain;
    document.getElementById('c-tech').textContent = s.tech;
    document.getElementById('c-watch').textContent = s.watch;
  }
  var autoBtn = document.getElementById('auto');
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } autoBtn.textContent = 'Auto-play'; }
  autoBtn.addEventListener('click', function () {
    if (timer) { stopAuto(); return; }
    autoBtn.textContent = 'Pause';
    if (cur >= 9) go(1);
    timer = setInterval(function () { if (cur >= 9) stopAuto(); else go(cur + 1); }, 5000);
  });
  document.getElementById('reset').addEventListener('click', function () { stopAuto(); go(1); });
  go(1);
})();
