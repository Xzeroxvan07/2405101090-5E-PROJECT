// index.html = toko, admin.html = admin (satu file js untuk dua halaman)
// struktur data (db): u = users, k = kategori, p = produk, t = transaksi, b = bantuan

// pengaturan dasar
const MODE_HALAMAN = document.body.dataset.app || 'shop',
  KUNCI_SESI = MODE_HALAMAN === 'admin' ? 'ma' : 'me';
// sesi admin hilang saat tab ditutup, sesi pembeli tetap tersimpan
const penyimpanSesi = () => (MODE_HALAMAN === 'admin' ? sessionStorage : localStorage);
const ambilSesi = () => {
    try {
      return +penyimpanSesi().getItem('gv-s-' + KUNCI_SESI) || 0;
    } catch (e) {
      return 0;
    }
  },
  simpanSesi = (v) => {
    try {
      penyimpanSesi().setItem('gv-s-' + KUNCI_SESI, v);
    } catch (e) {}
  };
const $ = (s, e = document) => e.querySelector(s),
  $$ = (s, e = document) => [...e.querySelectorAll(s)];
const amankanTeks = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c],
  );
const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID'),
  hurufBesarAwal = (s) => s[0].toUpperCase() + s.slice(1),
  formatTanggal = (d) =>
    new Date(d).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
const METODE_BAYAR = ['QRIS', 'DANA', 'GoPay', 'OVO', 'Transfer BCA'],
  DAFTAR_STATUS = ['pending', 'diproses', 'sukses', 'batal'];

// harga dan ppn (ppn 11% hanya dari biaya layanan, pulsa tanpa ppn)
const hitungHarga = (d, hp) => {
  const fee = hp ? 1000 : Math.round(d * 0.05),
    ppn = hp ? 0 : Math.round(fee * 0.11);
  return {
    d,
    fee,
    ppn,
    h: d + fee + ppn,
  };
};
const PAKET_GAME = [
  [
    1,
    [
      ['80 Robux', 16000],
      ['400 Robux', 80000],
      ['800 Robux', 160000],
      ['1.700 Robux', 320000],
      ['4.500 Robux', 800000],
      ['10.000 Robux', 1600000],
    ],
  ],
  [
    2,
    [
      ['86 Diamonds', 22000],
      ['172 Diamonds', 44000],
      ['257 Diamonds', 64000],
      ['706 Diamonds', 175000],
      ['2.195 Diamonds', 540000],
      ['3.688 Diamonds', 900000],
      ['5.532 Diamonds', 1350000],
      ['9.288 Diamonds', 2250000],
    ],
  ],
  [
    3,
    [
      ['475 VP', 54100],
      ['1.000 VP', 108200],
      ['2.050 VP', 220000],
      ['3.650 VP', 385000],
      ['5.350 VP', 560000],
      ['11.000 VP', 1126500],
    ],
  ],
];
const NOMINAL_PULSA = [10, 15, 20, 25, 30, 50, 75, 100, 150, 200, 300, 500].map((x) => x * 1000);
const dataAwal = () => {
  const k = [
      {
        id: 1,
        n: 'Roblox',
        ic: '🧱',
        f: 'Username Roblox',
        z: 0,
      },
      {
        id: 2,
        n: 'Mobile Legends',
        ic: '⚔️',
        f: 'User ID',
        z: 1,
      },
      {
        id: 3,
        n: 'Valorant',
        ic: '🎯',
        f: 'Riot ID (nama#tag)',
        z: 0,
      },
      {
        id: 4,
        n: 'Pulsa Telkomsel',
        ic: '📱',
        f: 'Nomor HP',
        hp: 1,
        px: ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'],
      },
      {
        id: 5,
        n: 'Pulsa Indosat',
        ic: '📱',
        f: 'Nomor HP',
        hp: 1,
        px: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
      },
      {
        id: 6,
        n: 'Pulsa XL',
        ic: '📱',
        f: 'Nomor HP',
        hp: 1,
        px: ['0817', '0818', '0819', '0859', '0877', '0878', '0831', '0832', '0833', '0838'],
      },
      {
        id: 7,
        n: 'Pulsa Tri',
        ic: '📱',
        f: 'Nomor HP',
        hp: 1,
        px: ['0895', '0896', '0897', '0898', '0899'],
      },
    ],
    p = [];
  PAKET_GAME.forEach(([kid, l]) =>
    l.forEach(([n, d]) =>
      p.push({
        k: kid,
        n,
        u: parseInt(n.replace(/\./g, '')),
        s: 50,
        ...hitungHarga(d, 0),
      }),
    ),
  );
  [4, 5, 6, 7].forEach((kid) =>
    NOMINAL_PULSA.forEach((d) =>
      p.push({
        k: kid,
        n: 'Pulsa ' + d.toLocaleString('id-ID'),
        u: 0,
        s: 999,
        ...hitungHarga(d, 1),
      }),
    ),
  );
  p.forEach((x, i) => (x.id = i + 1));
  return {
    me: 0,
    ma: 0,
    b: [],
    c: [],
    u: [
      {
        id: 1,
        n: 'admin',
        p: 'admin123',
        r: 'admin',
      },
      {
        id: 2,
        n: 'pembeli',
        p: 'pembeli123',
        r: 'pembeli',
      },
    ],
    k,
    p,
    t: [],
  };
};
let db = dataAwal();

// penyimpanan data
const KUNCI_DATA = 'gv-uts3';
let modeServer = false;
const kirimKeServer = (m, b) => {
  try {
    const x = new XMLHttpRequest();
    x.open(m, '/api/db', false);
    if (b) x.setRequestHeader('Content-Type', 'application/json');
    x.send(b || null);
    return x.status === 200 ? x.responseText : null;
  } catch (e) {
    return null;
  }
};
const muatData = () => {
  let d = db;
  const s = location.protocol.startsWith('http') ? kirimKeServer('GET') : null;
  if (s !== null) {
    modeServer = true;
    try {
      d = JSON.parse(s) || d;
    } catch (e) {}
  } else {
    modeServer = false;
    try {
      d = JSON.parse(localStorage.getItem(KUNCI_DATA)) || d;
    } catch (e) {}
  }
  d.b = d.b || [];
  d.c = d.c || [];
  return d;
};
const simpanData = () => {
  db._v = Date.now();
  const s = JSON.stringify(db);
  if (modeServer) kirimKeServer('POST', s);
  try {
    localStorage.setItem(KUNCI_DATA, s);
  } catch (e) {}
};
db = muatData();
let filterKatalog = {
    g: 0,
    q: '',
  },
  tabAuth = 'login',
  tabAdmin = 'dash',
  metodeBayar = 'QRIS',
  filterStatus = 'all';

// komponen umum
const penggunaAktif = () => db.u.find((u) => u.id === ambilSesi()),
  cariKategori = (id) => db.k.find((k) => k.id === id),
  cariProduk = (id) => db.p.find((p) => p.id === id);
const rincianHarga = (x, hp) =>
  `<div class="cd" style="padding:6px 18px;margin-top:14px">${barisRincian(hp ? 'Nominal pulsa' : 'Harga dasar', rupiah(x.d))}${barisRincian(hp ? 'Biaya admin' : 'Biaya layanan 5%', rupiah(x.fee))}${barisRincian(hp ? 'PPN' : 'PPN 11% atas biaya layanan', x.ppn ? rupiah(x.ppn) : 'tidak dikenakan')}</div><div class="tot"><span>Total bayar</span><b>${rupiah(x.h)}</b></div>`;
const idBaru = (a) => a.reduce((m, x) => Math.max(m, x.id), 0) + 1,
  barisRincian = (a, b) => `<div class="row"><span>${a}</span><span>${b}</span></div>`;
function tampilToast(m) {
  $('#tsw').innerHTML = `<div class="ts">${amankanTeks(m)}</div>`;
  clearTimeout(tampilToast.t);
  tampilToast.t = setTimeout(() => ($('#tsw').innerHTML = ''), 2600);
}
function bukaModal(h) {
  $('#mo').innerHTML = `<div class="ov"><div class="md">${h}</div></div>`;
}
const tutupModal = () => ($('#mo').innerHTML = '');
function tampilError(m) {
  const e = $('#er');
  e.textContent = m;
  const fm = e.closest('.fm');
  fm.classList.remove('shake');
  void fm.offsetWidth;
  fm.classList.add('shake');
}

// halaman pembeli
const buatNavigasi = (u, r) =>
  `<a class="lg" href="#/"><span>🎮 GameVault</span> <small class="uts">UTS-5E</small></a><a class="l ${r === '' ? 'on' : ''}" href="#/">Beranda</a><a class="l ${r === 'katalog' ? 'on' : ''}" href="#/katalog">Katalog</a><a class="l ${r === 'request' ? 'on' : ''}" href="#/request">Request</a>${u ? `<a class="l ${r === 'status' ? 'on' : ''}" href="#/status">Riwayat</a><a class="l ${r === 'chat' ? 'on' : ''}" href="#/chat">Chat${lencana(jumlahBelumDibaca())}</a>` : ''}<a class="l ${r === 'bantuan' ? 'on' : ''}" href="#/bantuan">Bantuan</a>${u ? `<span class="tg">👤 ${amankanTeks(u.n)}</span><button class="bt gh sm" data-a="out">Keluar</button>` : `<a class="bt gh sm" href="#/auth" data-t="login">Masuk</a><a class="bt sm" href="#/auth" data-t="daftar">Daftar</a>`}`;
// gambar layanan (taruh file di folder img/, nama sesuai kolom f)
const GAMBAR_LAYANAN = {
  1: { f: 'roblox', t: 'R', w: '#e2231a' },
  2: { f: 'mobile-legends', t: 'ML', w: '#1b3a8c' },
  3: { f: 'valorant', t: 'V', w: '#ff4655' },
  4: { f: 'telkomsel', t: 'T', w: '#ec1c24' },
  5: { f: 'indosat', t: 'I', w: '#ffd200', c: '#222' },
  6: { f: 'xl', t: 'XL', w: '#0072bc' },
  7: { f: 'tri', t: '3', w: '#7a2a8d' },
};
const urlGambar = {};
function cariGambar() {
  Object.entries(GAMBAR_LAYANAN).forEach(([id, g]) => {
    const coba = (i) => {
      const x = ['png', 'jpg', 'jpeg', 'webp', 'svg'][i];
      if (!x) return;
      const im = new Image();
      im.onload = () => { urlGambar[id] = 'img/' + g.f + '.' + x; tampilkanHalaman(); };
      im.onerror = () => coba(i + 1);
      im.src = 'img/' + g.f + '.' + x;
    };
    coba(0);
  });
}
const ikon = (k, kecil) => {
  const g = GAMBAR_LAYANAN[k.id] || { t: k.n[0], w: '#555' }, u = urlGambar[k.id];
  return `<span class="ik${kecil ? ' sm' : ''}" style="--c:${g.w};color:${g.c || '#fff'}">${u ? `<img src="${u}" alt="">` : ''}${g.t}</span>`;
};

// landing page
const MASALAH = [
  ['Salah catat ID', 'ID dan nomor tujuan mudah tertukar di chat.'],
  ['Stok dan harga tidak jelas', 'Penjual menjawab pertanyaan yang sama berulang kali.'],
  ['Rekap tercecer', 'Riwayat transaksi sulit dihitung.'],
  ['Status tidak terlihat', 'Pembeli tidak tahu pesanan sudah diproses atau belum.'],
];
const FITUR_UTAMA = [
  ['Katalog', 'Cari dan filter item per game atau provider.'],
  ['Form pemesanan', 'ID dicek formatnya lalu dikonfirmasi.'],
  ['Request jumlah', 'Pesan jumlah yang tidak ada di katalog.'],
  ['Pembayaran', 'QRIS, DANA, GoPay, OVO, atau transfer BCA.'],
  ['Riwayat dan chat', 'Pantau status dan chat dengan admin.'],
  ['Pusat bantuan', 'FAQ dan pertanyaan ke admin.'],
];
const LANGKAH_PESAN = [
  ['Daftar atau masuk', 'Buat akun dengan username dan kata sandi.'],
  ['Pilih item', 'Isi ID atau nomor HP tujuan.'],
  ['Bayar', 'Bayar sesuai nota lalu tekan Saya Sudah Bayar.'],
  ['Pantau status', 'Admin memproses sampai Sukses.'],
];
const kartuTeks = (nomor, judul, isi) =>
  `<div class="cd"><div class="ic">${nomor}</div><h3>${judul}</h3><p>${isi}</p></div>`;
const halamanBeranda = () => {
  const game = hitungHarga(16000, 0), pulsa = hitungHarga(10000, 1);
  return `<div class="lp"><section class="hero"><span class="tg">Top up game dan pulsa</span><h1>Top up game dan isi pulsa<br><span class="gr">lebih mudah dan rapi</span></h1><p>Pilih item, isi ID atau nomor tujuan, bayar, lalu pantau statusnya.</p><div class="rw"><a class="bt" href="#/katalog">Mulai Belanja</a>${penggunaAktif() ? '' : '<a class="bt gh" href="#/auth" data-t="daftar">Buat Akun</a>'}</div><div class="fl">${[1, 2, 3, 4].map((i) => `<b>${ikon(cariKategori(i))}</b>`).join('')}</div></section>
<section class="st"><div class="cd"><h2>${db.k.length}</h2><p>Layanan</p></div><div class="cd"><h2>${db.p.length}</h2><p>Pilihan item</p></div><div class="cd"><h2>${METODE_BAYAR.length}</h2><p>Metode bayar</p></div></section>
<h2 class="sh">Tentang GameVault</h2>
<p class="mu ab">GameVault adalah toko digital untuk top up game dan isi pulsa. Pembeli memesan sendiri, admin memproses lewat panel khusus.</p>
<h2 class="sh">Masalah yang diselesaikan</h2>
<div class="gd">${MASALAH.map((x, i) => kartuTeks(i + 1, x[0], x[1])).join('')}</div>
<h2 class="sh">Fitur utama</h2>
<div class="gd">${FITUR_UTAMA.map((x, i) => kartuTeks(i + 1, x[0], x[1])).join('')}</div>
<h2 class="sh">Layanan</h2>
<div class="gd">${db.k.map((k) => `<div class="cd"><div class="ic big">${ikon(k)}</div><h3>${k.n}</h3></div>`).join('')}</div>
<h2 class="sh">Cara pesan</h2>
<div class="gd">${LANGKAH_PESAN.map((x, i) => kartuTeks(i + 1, x[0], x[1])).join('')}</div>
<h2 class="sh">Harga dan pajak</h2>
<p class="mu ab">Biaya layanan 5%, PPN 11% hanya atas biaya layanan. Pulsa tanpa PPN.</p>
<div class="tw"><table><tr><th>Komponen</th><th>80 Robux</th><th>Pulsa 10.000</th></tr>
<tr><td>Harga dasar</td><td>${rupiah(game.d)}</td><td>${rupiah(pulsa.d)}</td></tr>
<tr><td>Biaya layanan</td><td>${rupiah(game.fee)}</td><td>${rupiah(pulsa.fee)}</td></tr>
<tr><td>PPN 11%</td><td>${rupiah(game.ppn)}</td><td>tidak ada</td></tr>
<tr><td><b>Total bayar</b></td><td><b>${rupiah(game.h)}</b></td><td><b>${rupiah(pulsa.h)}</b></td></tr></table></div>
<h2 class="sh">Tentang proyek</h2>
<p class="mu ab">Proyek UTS Pemrograman Web oleh Bhakti Saputra (2405101090, kelas 5E), dibuat dengan HTML, CSS, dan JavaScript.</p>
<div class="cd cta"><h2>Siap top up?</h2><a class="bt" style="margin-top:14px" href="#/katalog">Buka Katalog</a></div></div>`;
};
const kartuProduk = (p, i) => {
  const k = cariKategori(p.k);
  return `<div class="cd pc" style="--i:${i}"><div class="ic">${ikon(k)}</div><small>${k.n}</small><h3>${amankanTeks(p.n)}</h3><b class="pr">${rupiah(p.h)}</b><span class="bd ${p.s ? 'sukses' : 'batal'}">${p.s ? 'Stok ' + p.s : 'Habis'}</span><br><button class="bt sm" data-a="beli" data-id="${p.id}" ${p.s ? '' : 'disabled'}>Beli Sekarang</button></div>`;
};
const halamanKatalog = () =>
  `<h2 class="sh">Katalog Game dan Pulsa</h2><input id="q" placeholder="🔍 Cari item, game, atau provider..." value="${amankanTeks(filterKatalog.q)}"><div class="rw" style="justify-content:flex-start;margin:14px 0"><button class="ch" data-a="filt" data-g="0">Semua</button>${db.k.map((k) => `<button class="ch" data-a="filt" data-g="${k.id}">${ikon(k, 1)}${k.n}</button>`).join('')}</div><div class="gd" id="gr"></div>`;
function isiGridKatalog() {
  const l = db.p.filter(
    (p) =>
      (!filterKatalog.g || p.k === filterKatalog.g) &&
      (p.n + cariKategori(p.k).n).toLowerCase().includes(filterKatalog.q.toLowerCase()),
  );
  $('#gr').innerHTML = l.length ? l.map(kartuProduk).join('') : '<p class="mu">Produk tidak ditemukan 😢</p>';
  $$('.ch[data-g]').forEach((c) => c.classList.toggle('on', +c.dataset.g === filterKatalog.g));
}
function halamanOrder(id) {
  const p = cariProduk(id);
  if (!p) return '<p class="mu">Produk tidak ditemukan.</p>';
  const k = cariKategori(p.k);
  return `<div class="cd fm"><h2>${ikon(k, 1)}Pesan ${k.n}</h2><label>Pilih item</label><select id="sel">${db.p
    .filter((x) => x.k === p.k)
    .map(
      (x) =>
        `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''} ${x.s ? '' : 'disabled'}>${amankanTeks(x.n)} (${rupiah(x.h)})</option>`,
    )
    .join(
      '',
    )}</select><label>${k.f}</label><input id="tg" placeholder="${k.hp ? 'Contoh: 081234567890' : 'Masukkan ' + k.f}" ${k.hp ? 'inputmode="tel"' : ''} autocomplete="off">${k.z ? '<label>Zone ID</label><input id="zn" inputmode="numeric" placeholder="Contoh: 2001">' : ''}<label>Metode pembayaran</label><div class="rw" style="justify-content:flex-start">${METODE_BAYAR.map((m) => `<button class="ch ${m === metodeBayar ? 'on' : ''}" data-a="pay" data-m="${m}">${m}</button>`).join('')}</div><div id="bdn">${rincianHarga(p, k.hp)}</div><p id="er" class="er"></p><button class="bt" style="width:100%" data-a="kon">Lanjut Konfirmasi</button></div>`;
}
const kartuPesanan = (t) => {
  const p = cariProduk(t.p),
    k = cariKategori(p.k),
    u = penggunaAktif();
  return `<div class="cd"><span class="bd ${t.st}">${t.st}</span>${t.paid && t.st === 'pending' ? ' <span class="bd diproses">menunggu verifikasi</span>' : ''}<h3>${ikon(k, 1)}${amankanTeks(t.rq || p.n)}</h3><p>GV-${String(t.id).padStart(4, '0')} · ${formatTanggal(t.d)}</p><p>Tujuan: ${amankanTeks(t.tj)}</p><b class="pr">${rupiah(t.h)}</b><div class="ab2"><button class="bt gh sm" data-a="nota" data-id="${t.id}">Lihat Nota</button><a class="bt gh sm" href="#/chat/${t.id}">Chat</a>${t.st === 'pending' && t.u === u.id ? `<button class="bt rd sm" data-a="batal" data-id="${t.id}">Batalkan</button>` : ''}</div></div>`;
};
function halamanStatus() {
  const u = penggunaAktif(),
    l = db.t
      .filter((t) => (u.r === 'admin' || t.u === u.id) && (filterStatus === 'all' || t.st === filterStatus))
      .sort((a, b) => b.d - a.d);
  return `<h2 class="sh">Riwayat dan Status Pesanan</h2><div class="rw" style="justify-content:flex-start">${['all', ...DAFTAR_STATUS].map((s) => `<button class="ch ${s === filterStatus ? 'on' : ''}" data-a="sf" data-s="${s}">${s === 'all' ? 'Semua' : hurufBesarAwal(s)}</button>`).join('')}</div><div class="gd">${l.map(kartuPesanan).join('') || '<p class="mu">Belum ada pesanan.</p>'}</div>`;
}
const halamanAuth = () =>
  `<div class="cd fm"><div class="rw"><button class="ch ${tabAuth === 'login' ? 'on' : ''}" data-a="tab" data-v="login">Masuk</button><button class="ch ${tabAuth === 'daftar' ? 'on' : ''}" data-a="tab" data-v="daftar">Buat Akun</button></div>${tabAuth === 'login' ? `<label>Username</label><input id="ln" autocomplete="username"><label>Kata sandi</label><input id="lp" type="password" autocomplete="current-password"><p id="er" class="er"></p><button class="bt" style="width:100%" data-a="login">Masuk</button><p class="mu" style="font-size:12.5px;text-align:center">Akun contoh: pembeli / pembeli123</p>` : `<label>Username (4 sampai 20 huruf, angka, atau _)</label><input id="rn" autocomplete="username"><label>Kata sandi (minimal 6 karakter)</label><input id="rp" type="password" autocomplete="new-password"><label>Ulangi kata sandi</label><input id="rc" type="password" autocomplete="new-password"><p id="er" class="er"></p><button class="bt" style="width:100%" data-a="daftar">Buat Akun</button>`}</div>`;

// halaman admin
const halamanAntrean = () => {
  const l = db.t.filter((x) => x.st === 'pending' || x.st === 'diproses').sort((a, b) => a.d - b.d);
  if (!l.length) return '<p class="mu">Tidak ada pesanan yang perlu dilayani. 🎉</p>';
  return `<p class="mu" style="font-size:13px">Urutan dari pesanan paling lama. Alur: pembeli bayar, admin verifikasi dan proses, kirim item atau pulsa ke tujuan, lalu tandai selesai.</p><div class="gd">${l
    .map((t) => {
      const p = cariProduk(t.p),
        k = cariKategori(p.k);
      const aksi =
        t.st === 'pending'
          ? t.paid
            ? `<button class="bt sm" data-a="adm" data-id="${t.id}" data-v="diproses">Verifikasi dan Proses</button>`
            : '<span class="mu" style="font-size:13px">Menunggu pembeli membayar</span>'
          : `<button class="bt sm" data-a="adm" data-id="${t.id}" data-v="sukses">${k.hp ? 'Pulsa sudah masuk' : 'Item sudah dikirim'}</button>`;
      return `<div class="cd"><span class="bd ${t.st}">${t.st}</span> ${t.paid ? '<span class="bd sukses">sudah bayar</span>' : ''}<h3>${ikon(k, 1)}${amankanTeks(t.rq || p.n)} · ${k.n}</h3><p>GV-${String(t.id).padStart(4, '0')} · ${amankanTeks(db.u.find((u) => u.id === t.u)?.n || '-')} · ${formatTanggal(t.d)}</p><p>${t.st === 'diproses' ? 'Kirim ke' : 'Tujuan'}: <b>${amankanTeks(t.tj)}</b></p><p>${t.m} · <b>${rupiah(t.h)}</b></p><div class="ab2" style="margin-top:12px;flex-wrap:wrap">${aksi}<button class="bt gh sm" data-a="salin" data-tj="${amankanTeks(t.tj)}">Salin tujuan</button><button class="bt gh sm" data-a="bukachat" data-id="${t.id}">Chat</button><button class="bt rd sm" data-a="adm" data-id="${t.id}" data-v="batal">Batalkan</button></div></div>`;
    })
    .join('')}</div>`;
};
function halamanAdmin() {
  const t = db.t,
    stat = [
      ['Total pesanan', t.length],
      ['Menunggu', t.filter((x) => x.st === 'pending').length],
      ['Omzet sukses', rupiah(t.filter((x) => x.st === 'sukses').reduce((s, x) => s + x.h, 0))],
      ['Stok menipis (≤5)', db.p.filter((p) => p.s <= 5).length],
      ['Pertanyaan baru', db.b.filter((x) => x.st === 'baru').length],
    ];
  const tb =
    tabAdmin === 'chat'
      ? halamanChatAdmin()
      : tabAdmin === 'bantu'
      ? halamanBantuanAdmin()
      : tabAdmin === 'dash' || tabAdmin === 'antre'
        ? halamanAntrean()
        : tabAdmin === 'produk'
          ? `<p class="mu" style="font-size:13px">Ubah harga dasar atau stok langsung di tabel. Harga jual = harga dasar + biaya layanan 5% + PPN 11% atas biaya layanan (pulsa: biaya admin Rp1.000, tanpa PPN). Pesanan yang sudah dibuat tidak berubah.</p><button class="bt sm" data-a="pform" style="margin-bottom:12px">+ Tambah Produk</button><div class="tw"><table><tr><th>Game</th><th>Item</th><th>Harga dasar</th><th>Harga jual</th><th>Stok</th><th>Aksi</th></tr>${db.p.map((p) => `<tr><td>${cariKategori(p.k).n}</td><td>${amankanTeks(p.n)}</td><td><input class="in" type="number" min="1" data-hg="${p.id}" value="${p.d}"></td><td>${rupiah(p.h)}</td><td><input class="in" style="width:96px" type="number" min="0" data-sk="${p.id}" value="${p.s}"></td><td class="ab2"><button class="bt gh sm" data-a="pform" data-id="${p.id}">Ubah</button><button class="bt rd sm" data-a="pdel" data-id="${p.id}">Hapus</button></td></tr>`).join('')}</table></div>`
          : `<div class="tw"><table><tr><th>ID</th><th>Pembeli</th><th>Item</th><th>Tujuan</th><th>Total</th><th>Status</th></tr>${
              [...t]
                .reverse()
                .map(
                  (x) =>
                    `<tr><td>GV-${String(x.id).padStart(4, '0')}</td><td>${amankanTeks(db.u.find((u) => u.id === x.u)?.n || '-')}</td><td>${amankanTeks(x.rq || cariProduk(x.p)?.n || '-')}</td><td>${amankanTeks(x.tj)}</td><td>${rupiah(x.h)}</td><td><select data-st="${x.id}">${DAFTAR_STATUS.map((s) => `<option ${s === x.st ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`,
                )
                .join('') || '<tr><td colspan="6" class="mu">Belum ada pesanan masuk.</td></tr>'
            }</table></div>`;
  return `<h2 class="sh" style="margin-top:0">${JUDUL_ADMIN[tabAdmin]}</h2>${tabAdmin === 'dash' ? `<div class="gd">${stat.map((s) => `<div class="cd"><small>${s[0]}</small><h2>${s[1]}</h2></div>`).join('')}</div><h3 style="margin:18px 0 6px">Perlu dilayani</h3>` : ''}${tb}`;
}

// cara bayar
const TUJUAN_BAYAR = {
  DANA: '0812-0000-0001',
  GoPay: '0812-0000-0002',
  OVO: '0812-0000-0003',
  'Transfer BCA': '1234 5678 90',
};
const panelCaraBayar = (t) =>
  `<div class="cd" style="padding:16px;margin:12px 0"><b>Cara bayar (${t.m})</b><p style="margin:6px 0">Bayar tepat <b>${rupiah(t.h)}</b> sebelum ${formatTanggal(t.d + 864e5)}.</p>${t.m === 'QRIS' ? '<div id="qr" style="background:#fff;padding:10px;border-radius:18px;width:fit-content;margin:10px auto"></div><p class="mu" style="font-size:12.5px;text-align:center">Scan memakai aplikasi e-wallet atau m-banking.</p>' : `<div class="row"><span>${t.m === 'Transfer BCA' ? 'No. rekening BCA' : 'Nomor ' + t.m}</span><span><b>${TUJUAN_BAYAR[t.m]}</b></span></div><div class="row"><span>Atas nama</span><span>GameVault</span></div><button class="bt gh sm" style="margin-top:10px" data-a="salin" data-tj="${TUJUAN_BAYAR[t.m]}">Salin nomor</button>`}<p class="mu" style="font-size:12px;margin:10px 0 0">Data pembayaran ini contoh untuk tugas, bukan rekening atau QRIS asli.</p></div>`;
const gambarQR = (t) => {
  const e = $('#qr');
  if (!e) return;
  if (!window.qrcode) return void (e.textContent = 'QR belum termuat');
  const q = qrcode(0, 'M');
  q.addData('GAMEVAULT|' + kodeNota(t.id) + '|' + t.h + '|' + t.m);
  q.make();
  e.innerHTML = q.createImgTag(5, 0);
};

// request top up
let requestTertunda = null,
  formRequest = {
    k: 1,
    a: '',
  };
function hitungRequest() {
  const k = cariKategori(formRequest.k),
    a = +String(formRequest.a).replace(/\D/g, '');
  if (!a)
    return {
      e: 'Masukkan jumlah yang kamu inginkan',
    };
  if (k.hp) {
    if (a < 5000 || a > 500000 || a % 1000)
      return {
        e: 'Nominal 5.000 sampai 500.000, kelipatan 1.000',
      };
    return {
      ...hitungHarga(a, 1),
      txt: 'Request ' + k.n + ' ' + a.toLocaleString('id-ID'),
      p: db.p.find((x) => x.k === k.id).id,
    };
  }
  if (a > 20000)
    return {
      e: 'Maksimal 20.000 per request',
    };
  const P = db.p.filter((x) => x.k === k.id && x.u),
    dp = [0],
    pk = [];
  for (let i = 1; i <= a; i++) {
    let b = 1e15,
      j = -1;
    P.forEach((p, n) => {
      const c = p.h + dp[Math.max(0, i - p.u)];
      if (c < b) {
        b = c;
        j = n;
      }
    });
    dp[i] = b;
    pk[i] = j;
  }
  const m = {};
  let i = a,
    u = 0,
    d = 0,
    fee = 0,
    ppn = 0;
  while (i > 0) {
    const p = P[pk[i]];
    m[p.n] = (m[p.n] || 0) + 1;
    i -= p.u;
    u += p.u;
    d += p.d;
    fee += p.fee;
    ppn += p.ppn;
  }
  return {
    d,
    fee,
    ppn,
    h: d + fee + ppn,
    sur: u - a,
    p: P[0].id,
    txt:
      'Request ' +
      a.toLocaleString('id-ID') +
      ' ' +
      P[0].n.split(' ')[1] +
      ' = ' +
      Object.entries(m)
        .map(([n, q]) => n + (q > 1 ? ' × ' + q : ''))
        .join(' + '),
  };
}
const ringkasanRequest = (r) =>
  r.e
    ? `<p class="mu" style="margin:10px 0 0 10px">${r.e}</p>`
    : `<div class="cd" style="padding:12px 18px;margin-top:12px"><p style="margin:0;color:var(--tx)">${amankanTeks(r.txt)}${r.sur ? ' (kelebihan ' + r.sur + ' karena paket resmi berupa jumlah tetap)' : ''}</p></div>${rincianHarga(r, cariKategori(formRequest.k).hp)}`;
const halamanRequest = () => {
  const k = cariKategori(formRequest.k);
  return `<h2 class="sh">Request Top Up</h2><p class="mu ab">Butuh jumlah yang tidak ada di katalog? Tulis jumlahnya. Untuk game, publisher hanya menjual paket dengan jumlah tetap, jadi sistem menyusun kombinasi paket termurah yang jumlahnya mencukupi. Untuk pulsa, nominal bebas kelipatan Rp1.000.</p><div class="cd fm"><label>Layanan</label><select id="rk">${db.k.map((x) => `<option value="${x.id}" ${x.id === formRequest.k ? 'selected' : ''}>${x.n}</option>`).join('')}</select><label>${k.hp ? 'Nominal pulsa (Rp)' : 'Jumlah yang diinginkan'}</label><input id="ra" inputmode="numeric" value="${amankanTeks(formRequest.a)}" placeholder="${k.hp ? 'Contoh: 35000' : 'Contoh: 1000'}"><div id="rr">${ringkasanRequest(hitungRequest())}</div><label>${k.f}</label><input id="tg" autocomplete="off">${k.z ? '<label>Zone ID</label><input id="zn" inputmode="numeric" placeholder="Contoh: 2001">' : ''}<label>Metode pembayaran</label><div class="rw" style="justify-content:flex-start">${METODE_BAYAR.map((m) => `<button class="ch ${m === metodeBayar ? 'on' : ''}" data-a="pay" data-m="${m}">${m}</button>`).join('')}</div><p id="er" class="er"></p><button class="bt" style="width:100%" data-a="rkon">Lanjut Konfirmasi</button></div>`;
};
const JUDUL_ADMIN = {
  dash: 'Dasbor',
  antre: 'Antrean Pesanan',
  produk: 'Kelola Produk',
  trx: 'Kelola Transaksi',
  bantu: 'Pertanyaan Masuk (Pusat Bantuan)',
  chat: 'Chat Pembeli',
};

// pusat bantuan
const DAFTAR_FAQ = [
  [
    'Bagaimana cara memesan?',
    'Buat akun atau masuk, pilih game atau provider di katalog, isi ID game atau nomor HP, pilih metode bayar, lalu konfirmasi. Nota muncul setelah pesanan dibuat.',
  ],
  [
    'Berapa lama pesanan diproses?',
    'Pesanan diproses setelah kamu menekan Saya Sudah Bayar di nota dan admin memverifikasi pembayaran. Pantau statusnya di halaman Riwayat.',
  ],
  [
    'Saya salah mengisi ID game atau nomor HP, bagaimana?',
    'Batalkan pesanan lewat halaman Riwayat selama statusnya masih Pending. Jika sudah Diproses, kirim pertanyaan lewat form di bawah dengan menyertakan nomor nota.',
  ],
  ['Metode pembayaran apa saja yang tersedia?', 'QRIS, DANA, GoPay, OVO, dan Transfer BCA.'],
  [
    'Apa arti status pesanan?',
    'Pending: menunggu pembayaran atau verifikasi. Diproses: admin sedang mengirim item atau pulsa. Sukses: sudah masuk ke tujuan. Batal: pesanan dibatalkan.',
  ],
  [
    'Status sudah Sukses tapi item atau pulsa belum masuk?',
    'Kirim pertanyaan lewat form di bawah dengan nomor nota dan penjelasan singkat. Admin akan mengecek lalu membalas di halaman ini.',
  ],
  [
    'Bagaimana jika stok habis?',
    'Item dengan stok 0 tidak bisa dipesan. Stok diperbarui admin dan item akan bisa dipesan lagi saat stok tersedia.',
  ],
  [
    'Apakah pesanan bisa dibatalkan?',
    'Bisa, selama statusnya masih Pending lewat tombol Batalkan di halaman Riwayat. Setelah Diproses, hubungi admin lewat form di bawah.',
  ],
  [
    'Bagaimana harga dihitung dan apakah ada PPN?',
    'Harga dasar mengikuti harga referensi publisher atau operator. Toko menambah biaya layanan 5%, lalu PPN 11% dikenakan atas biaya layanan itu saja. Untuk pulsa tidak ada PPN, hanya biaya admin Rp1.000.',
  ],
  [
    'Bisa top up dengan jumlah di luar katalog?',
    'Bisa lewat menu Request. Untuk game, sistem menyusun kombinasi paket resmi termurah yang jumlahnya mencukupi. Untuk pulsa, nominal bebas kelipatan Rp1.000 mulai Rp5.000.',
  ],
  [
    'Bagaimana cara membayar?',
    'Setelah pesanan dibuat, buka nota. Di sana tampil QR atau nomor tujuan sesuai metode yang kamu pilih. Setelah membayar, tekan Saya Sudah Bayar.',
  ],
];
const TOPIK_BANTUAN = [
    'Pesanan belum masuk',
    'Salah ID atau nomor tujuan',
    'Masalah pembayaran',
    'Akun dan login',
    'Lainnya',
  ],
  kodeNota = (n) => 'GV-' + String(n).padStart(4, '0');
const kartuTiket = (x, ad) =>
  `<div class="cd"><span class="bd ${x.st === 'baru' ? 'pending' : x.st === 'dijawab' ? 'diproses' : 'sukses'}">${x.st}</span><h3>${amankanTeks(x.k)}</h3><p>${ad ? 'Dari <b>' + amankanTeks(db.u.find((u) => u.id === x.u)?.n || '-') + '</b> · ' : ''}${x.t ? kodeNota(x.t) + ' · ' : ''}${formatTanggal(x.d)}</p><p style="color:var(--tx)">${amankanTeks(x.m)}</p>${x.r && !ad ? `<p style="color:var(--tx)"><b>Balasan admin:</b> ${amankanTeks(x.r)}</p>` : ''}${ad ? `<input id="rb${x.id}" style="margin-top:10px" placeholder="Tulis balasan..." value="${amankanTeks(x.r)}"><div class="ab2" style="margin-top:10px;flex-wrap:wrap"><button class="bt sm" data-a="balas" data-id="${x.id}">Kirim Balasan</button><button class="bt gh sm" data-a="selesai" data-id="${x.id}">Tandai Selesai</button></div>` : ''}</div>`;
const halamanBantuanAdmin = () =>
  db.b.length
    ? `<div class="gd">${[...db.b]
        .sort((a, b) => (a.st === 'selesai') - (b.st === 'selesai') || b.d - a.d)
        .map((x) => kartuTiket(x, 1))
        .join('')}</div>`
    : '<p class="mu">Belum ada pertanyaan masuk.</p>';
const halamanBantuan = () => {
  const u = penggunaAktif(),
    mine = u ? db.b.filter((x) => x.u === u.id).sort((a, b) => b.d - a.d) : [];
  const form = u
    ? `<div class="cd fm" style="margin:0"><label>Topik</label><select id="bk">${TOPIK_BANTUAN.map((x) => `<option>${x}</option>`).join('')}</select><label>Nomor nota (opsional)</label><select id="bn"><option value="">Tidak terkait pesanan</option>${db.t
        .filter((t) => t.u === u.id)
        .map((t) => `<option value="${t.id}">${kodeNota(t.id)}</option>`)
        .join(
          '',
        )}</select><label>Pesan</label><textarea id="bm" maxlength="500" placeholder="Ceritakan masalahmu (minimal 10 karakter)"></textarea><p id="er" class="er"></p><button class="bt" data-a="kirim">Kirim Pertanyaan</button></div>`
    : `<div class="cd"><p>Masuk dulu untuk mengirim pertanyaan dan melihat balasan admin.</p><a class="bt" style="margin-top:12px" href="#/auth" data-t="login">Masuk</a></div>`;
  return `<section class="hero" style="padding-bottom:10px"><span class="tg">💬 Pusat Bantuan</span><h1 style="font-size:clamp(28px,5vw,44px)">Ada yang bisa <span class="gr">kami bantu?</span></h1><div style="max-width:480px;margin:18px auto 0"><input id="fq" placeholder="🔍 Cari pertanyaan, misalnya: salah ID"></div></section><h2 class="sh">Pertanyaan yang Sering Diajukan</h2><div>${DAFTAR_FAQ.map((x) => `<details class="cd fa"><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}</div><p id="fe" class="mu" hidden>Tidak ada yang cocok. Kirim pertanyaanmu lewat form di bawah.</p><div class="gd"><div class="cd"><div class="ic">🕘</div><h3>Jam layanan</h3><p>Setiap hari 09.00 sampai 21.00 WIB. Pertanyaan dibalas maksimal 1 x 24 jam.</p></div><div class="cd"><div class="ic">🤖</div><h3>Asisten AI</h3><p>Segera hadir untuk menjawab pertanyaan lebih cepat.</p></div></div><h2 class="sh">Kirim Pertanyaan ke Admin</h2>${form}${mine.length ? `<h2 class="sh">Pertanyaan Saya</h2><div class="gd">${mine.map((x) => kartuTiket(x)).join('')}</div>` : ''}`;
};

// router
function tampilkanAdmin() {
  const u = penggunaAktif(),
    nv = $('#nav'),
    ap = $('#app');
  if (!u || u.r !== 'admin') {
    nv.innerHTML =
      '<a class="lg" href="admin.html"><span>🛡️ GameVault Admin</span> <small class="uts">UTS-5E</small></a><a class="l" href="index.html">← Ke toko</a>';
    ap.innerHTML = `<div class="pg"><div class="cd fm"><div class="ic">🛡️</div><h2>Masuk Admin</h2><p class="mu">Halaman ini khusus pengelola toko.</p><label>Username</label><input id="ln" autocomplete="username"><label>Kata sandi</label><input id="lp" type="password" autocomplete="current-password"><p id="er" class="er"></p><button class="bt" style="width:100%" data-a="login">Masuk</button><p class="mu" style="font-size:12.5px;text-align:center">Akun contoh: admin / admin123</p></div></div>`;
    return;
  }
  if (tabAdmin === 'chat' && chatAktif && tandaiDibaca(chatAktif)) simpanData();
  const q = db.t.filter((x) => x.st === 'pending' || x.st === 'diproses').length,
    nb = db.b.filter((x) => x.st === 'baru').length,
    nc = jumlahBelumDibaca();
  nv.innerHTML = `<a class="lg" href="admin.html"><span>🛡️ GameVault Admin</span> <small class="uts">UTS-5E</small></a><a class="l" href="index.html">Lihat Toko ↗</a><a class="l" href="qr.html" target="_blank">QR Toko</a><span class="tg">👤 ${amankanTeks(u.n)}</span><button class="bt gh sm" data-a="out">Keluar</button>`;
  ap.innerHTML = `<div class="pg ly"><aside class="sd">${[
    ['dash', '🏠 Dasbor'],
    ['antre', '📋 Antrean (' + q + ')'],
    ['produk', '📦 Produk'],
    ['trx', '🧾 Transaksi'],
    ['bantu', '💬 Bantuan (' + nb + ')'],
    ['chat', '✉️ Chat (' + nc + ')'],
  ]
    .map(
      (s) =>
        `<button class="sb ${tabAdmin === s[0] ? 'on' : ''}" data-a="atab" data-v="${s[0]}">${s[1]}</button>`,
    )
    .join(
      '',
    )}</aside><section>${halamanAdmin()}</section></div>`;
  gulirChat();
}
function tampilkanHalaman(e) {
  db = muatData();
  const dm = $('#dm');
  if (dm) dm.textContent = modeServer ? 'Data bersama (server)' : 'Data di browser ini';
  if (MODE_HALAMAN === 'admin') return tampilkanAdmin();
  const [, r = '', a] = (location.hash || '#/').slice(1).split('/'),
    u = penggunaAktif();
  if (!u && ['order', 'status', 'chat'].includes(r)) {
    tampilToast('Silakan masuk dengan akun yang sesuai dulu ya');
    tabAuth = 'login';
    location.hash = '#/auth';
    return;
  }
  if (r === 'chat' && a && db.t.some((x) => x.id === +a && x.u === u.id) && tandaiDibaca(+a)) simpanData();
  $('#nav').innerHTML = buatNavigasi(u, r);
  const v =
    {
      '': halamanBeranda,
      katalog: halamanKatalog,
      order: () => halamanOrder(+a),
      status: halamanStatus,
      chat: () => (a ? halamanChat(+a) : halamanChatDaftar()),
      auth: halamanAuth,
      bantuan: halamanBantuan,
      request: halamanRequest,
    }[r] || halamanBeranda;
  $('#app').innerHTML = `<div class="pg">${v()}</div>`;
  if (r === 'katalog') isiGridKatalog();
  gulirChat();
  if (e && e.type === 'hashchange') scrollTo(0, 0);
}
function ubahStatus(id, v) {
  const t = db.t.find((x) => x.id === id),
    p = cariProduk(t.p);
  if (v === 'batal' && t.st !== 'batal' && !t.rq) p.s++;
  if (t.st === 'batal' && v !== 'batal' && !t.rq) {
    if (p.s < 1) {
      tampilToast('Stok habis, status tidak bisa diaktifkan lagi');
      return tampilkanHalaman();
    }
    p.s--;
  }
  t.st = v;
  pesanSistem(id, 'Status pesanan menjadi ' + v);
  simpanData();
  tampilToast('Status diperbarui ke ' + v);
  tampilkanHalaman();
}

// chat pesanan
let chatAktif = 0;
const sisiChat = () => (MODE_HALAMAN === 'admin' ? 'admin' : 'pembeli');
function kirimPesan(t, dari, isi, gb, jenis, rs) {
  db.c.push({ id: idBaru(db.c), t, dari, isi: isi || '', gb: gb || '', jenis: jenis || 'teks', rs: rs || null, d: Date.now(), r: dari === 'sistem' });
}
const pesanSistem = (t, isi) => kirimPesan(t, 'sistem', isi);
const pesanTrx = (id) => db.c.filter((m) => m.t === id);
const aktivitas = (t) => Math.max(t.d, ...pesanTrx(t.id).map((m) => m.d));
const belumBaca = (m, sisi) => !m.r && m.dari !== sisi && m.dari !== 'sistem';
const jumlahBelumDibaca = () => {
  const u = penggunaAktif(), sisi = sisiChat();
  if (!u) return 0;
  return db.c.filter((m) => belumBaca(m, sisi) && (sisi === 'admin' || (db.t.find((x) => x.id === m.t) || {}).u === u.id)).length;
};
const lencana = (n) => (n ? `<span class="bdg">${n}</span>` : '');
function tandaiDibaca(id) {
  let ubah = false;
  pesanTrx(id).forEach((m) => { if (belumBaca(m, sisiChat())) { m.r = true; ubah = true; } });
  return ubah;
}
const gambarAman = (g) => /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(g);
const kartuResi = (r) =>
  `<div class="rs"><b>Resi pesanan</b>${barisRincian('Nota', amankanTeks(r.nota))}${barisRincian('Item', amankanTeks(r.item))}${barisRincian('Tujuan', amankanTeks(r.tujuan))}${barisRincian('Pembayaran', amankanTeks(r.metode))}${barisRincian('Total', amankanTeks(r.total))}${barisRincian('Selesai', amankanTeks(r.waktu))}</div>`;
const gelembung = (m) => {
  if (m.dari === 'sistem') return `<div class="m sys">${amankanTeks(m.isi)} · ${formatTanggal(m.d)}</div>`;
  const gb = m.gb && gambarAman(m.gb) ? `<img class="gc" src="${m.gb}" data-a="gambar" alt="gambar">` : '';
  return `<div class="m ${m.dari === sisiChat() ? 'me' : ''}">${m.isi ? amankanTeks(m.isi) : ''}${gb}${m.jenis === 'resi' && m.rs ? kartuResi(m.rs) : ''}<small>${m.dari === 'admin' ? 'Admin' : 'Pembeli'} · ${formatTanggal(m.d)}</small></div>`;
};
const kartuChat = (t, ad) => {
  const p = cariProduk(t.p), baru = db.c.filter((m) => m.t === t.id && belumBaca(m, sisiChat())).length;
  const lm = pesanTrx(t.id).filter((m) => m.dari !== 'sistem').pop();
  return `<div class="cd"><span class="bd ${t.st}">${t.st}</span>${lencana(baru)}<h3>${amankanTeks(t.rq || p.n)}</h3><p>${kodeNota(t.id)} · ${amankanTeks(t.tj)}</p><p style="color:var(--tx)">${lm ? amankanTeks((lm.isi || 'Gambar').slice(0, 60)) : 'Belum ada pesan'}</p>${ad ? `<button class="bt sm" data-a="bukachat" data-id="${t.id}">Buka chat</button>` : `<a class="bt sm" href="#/chat/${t.id}">Buka chat</a>`}</div>`;
};
function halamanChatDaftar() {
  const u = penggunaAktif(), l = db.t.filter((t) => t.u === u.id).sort((a, b) => aktivitas(b) - aktivitas(a));
  return `<h2 class="sh">Chat Pesanan</h2><p class="mu ab">Pilih pesanan untuk chat dengan admin. Kirim bukti bayar atau tanyakan status di sini. Resi dikirim admin setelah pesanan sukses.</p><div class="gd">${l.map((t) => kartuChat(t, 0)).join('') || '<p class="mu">Belum ada pesanan.</p>'}</div>`;
}
function halamanChatAdmin() {
  if (chatAktif) return halamanChat(chatAktif);
  const l = db.t.filter((t) => pesanTrx(t.id).some((m) => m.dari !== 'sistem')).sort((a, b) => aktivitas(b) - aktivitas(a));
  return `<p class="mu" style="font-size:13px">Chat per pesanan. Untuk memulai chat dengan pembeli, tekan tombol Chat di kartu pesanan pada menu Antrean.</p><div class="gd">${l.map((t) => kartuChat(t, 1)).join('') || '<p class="mu">Belum ada chat dari pembeli.</p>'}</div>`;
}
const CEPAT_ADMIN = ['Pembayaran sudah diverifikasi, pesanan sedang diproses.', 'Mohon kirim bukti pembayaran ya.', 'Pesanan sudah masuk, silakan dicek.'];
const CEPAT_PEMBELI = ['Sudah saya bayar, bukti terlampir.', 'Kapan pesanan saya diproses?'];
function halamanChat(id) {
  const t = db.t.find((x) => x.id === id), u = penggunaAktif(), ad = sisiChat() === 'admin';
  if (!t || (!ad && t.u !== u.id)) return '<p class="mu">Pesanan tidak ditemukan.</p>';
  if (tandaiDibaca(id)) simpanData();
  const p = cariProduk(t.p);
  const cepat = (ad ? CEPAT_ADMIN : CEPAT_PEMBELI).map((x) => `<button class="ch" data-a="cepat" data-q="${amankanTeks(x)}">${amankanTeks(x)}</button>`).join('');
  const isi = pesanTrx(id).sort((a, b) => a.d - b.d).map(gelembung).join('') || '<p class="mu" style="margin:auto">Belum ada pesan. Tulis pesan pertama.</p>';
  return `${ad ? '<button class="bt gh sm" data-a="atab" data-v="chat">Kembali</button>' : '<a class="bt gh sm" href="#/chat">Kembali</a>'}<h2 class="sh" style="margin-top:14px">Chat ${kodeNota(id)}</h2><p class="mu">${amankanTeks(t.rq || p.n)} · ${amankanTeks(t.tj)} · <span class="bd ${t.st}">${t.st}</span></p><div class="cb" id="cb">${isi}</div><div class="rw" style="justify-content:flex-start">${cepat}${ad ? `<button class="ch" data-a="resi" data-id="${id}">Kirim resi</button>` : ''}</div><div class="cc"><input id="ci" placeholder="Tulis pesan..." autocomplete="off"><label class="bt gh sm" for="cf">Lampirkan</label><input type="file" id="cf" accept="image/*" hidden data-id="${id}"><button class="bt sm" data-a="kirimchat" data-id="${id}">Kirim</button></div>`;
}
const gulirChat = () => { const b = $('#cb'); if (b) b.scrollTop = b.scrollHeight; };
const kecilkanGambar = (file) => new Promise((ok, gagal) => {
  const fr = new FileReader();
  fr.onerror = gagal;
  fr.onload = () => {
    const im = new Image();
    im.onerror = gagal;
    im.onload = () => {
      const k = Math.min(1, 720 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      ok(c.toDataURL('image/jpeg', 0.7));
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
});

// aksi tombol
// salin teks, tetap jalan di http (HP lewat alamat IP)
const salinTeks = (teks) => {
  if (window.isSecureContext && navigator.clipboard) return navigator.clipboard.writeText(teks);
  return new Promise((ok, gagal) => {
    const t = document.createElement('textarea');
    t.value = teks;
    t.style.cssText = 'position:fixed;opacity:0';
    document.body.append(t);
    t.select();
    let berhasil = false;
    try { berhasil = document.execCommand('copy'); } catch (e) {}
    t.remove();
    berhasil ? ok() : gagal();
  });
};
const AKSI = {
  x: tutupModal,
  kirimchat(a) {
    const isi = $('#ci').value.trim();
    if (!isi) return;
    kirimPesan(+a.dataset.id, sisiChat(), isi);
    simpanData();
    tampilkanHalaman();
  },
  cepat(a) {
    const i = $('#ci');
    i.value = a.dataset.q;
    i.focus();
  },
  resi(a) {
    const t = db.t.find((x) => x.id === +a.dataset.id), p = cariProduk(t.p);
    if (t.st !== 'sukses') return tampilToast('Resi dikirim setelah status Sukses');
    kirimPesan(t.id, 'admin', 'Terima kasih sudah berbelanja. Ini resi pesananmu.', '', 'resi', { nota: kodeNota(t.id), item: t.rq || p.n, tujuan: t.tj, metode: t.m, total: rupiah(t.h), waktu: formatTanggal(Date.now()) });
    simpanData();
    tampilToast('Resi terkirim');
    tampilkanHalaman();
  },
  gambar(a) {
    bukaModal(`<img src="${a.src}" style="width:100%;border-radius:18px"><button class="bt gh" style="width:100%;margin-top:12px" data-a="x">Tutup</button>`);
  },
  bukachat(a) {
    tabAdmin = 'chat';
    chatAktif = +a.dataset.id;
    tampilkanHalaman();
  },
  out() {
    simpanSesi(0);
    simpanData();
    tampilToast('Kamu sudah keluar');
    location.hash = '#/';
    tampilkanHalaman();
  },
  beli(a) {
    if (!penggunaAktif()) {
      tampilToast('Masuk dulu supaya bisa memesan');
      tabAuth = 'login';
      return (location.hash = '#/auth');
    }
    location.hash = '#/order/' + a.dataset.id;
  },
  filt(a) {
    filterKatalog.g = +a.dataset.g;
    isiGridKatalog();
  },
  pay(a) {
    metodeBayar = a.dataset.m;
    $$('[data-a=pay]').forEach((b) => b.classList.toggle('on', b === a));
  },
  tab(a) {
    tabAuth = a.dataset.v;
    tampilkanHalaman();
  },
  sf(a) {
    filterStatus = a.dataset.s;
    tampilkanHalaman();
  },
  atab(a) {
    chatAktif = 0;
    tabAdmin = a.dataset.v;
    tampilkanHalaman();
  },
  login() {
    const n = $('#ln').value.trim(),
      u = db.u.find((x) => x.n.toLowerCase() === n.toLowerCase() && x.p === $('#lp').value);
    if (!u) return tampilError('Username atau kata sandi salah');
    if (MODE_HALAMAN === 'shop' && u.r === 'admin')
      return tampilError('Akun admin masuk lewat halaman Panel Admin (admin.html)');
    if (MODE_HALAMAN === 'admin' && u.r !== 'admin') return tampilError('Halaman ini khusus admin');
    simpanSesi(u.id);
    simpanData();
    tampilToast('Selamat datang, ' + u.n + ' 👋');
    if (MODE_HALAMAN === 'admin') tampilkanHalaman();
    else location.hash = '#/katalog';
  },
  daftar() {
    const n = $('#rn').value.trim(),
      p = $('#rp').value;
    if (!/^\w{4,20}$/.test(n)) return tampilError('Username 4 sampai 20 karakter: huruf, angka, atau _');
    if (db.u.some((x) => x.n.toLowerCase() === n.toLowerCase())) return tampilError('Username sudah dipakai');
    if (p.length < 6) return tampilError('Kata sandi minimal 6 karakter');
    if (p !== $('#rc').value) return tampilError('Ulangi kata sandi tidak sama');
    const u = {
      id: idBaru(db.u),
      n,
      p,
      r: 'pembeli',
    };
    db.u.push(u);
    simpanSesi(u.id);
    simpanData();
    tampilToast('Akun berhasil dibuat 🎉');
    location.hash = '#/katalog';
  },
  kon() {
    const p = cariProduk(+$('#sel').value),
      k = cariKategori(p.k),
      z = $('#zn') ? $('#zn').value.trim() : '';
    let t = $('#tg').value.trim();
    if (k.hp) {
      t = t.replace(/[\s-]/g, '').replace(/^\+?62/, '0');
      if (!/^08\d{8,11}$/.test(t))
        return tampilError('Nomor HP harus diawali 08 dan terdiri dari 10 sampai 13 digit');
      if (!k.px.some((x) => t.startsWith(x)))
        return tampilError(
          'Nomor ini bukan nomor ' + k.n.replace('Pulsa ', '') + '. Cek lagi atau pilih provider lain',
        );
    }
    if (t.length < 3) return tampilError('Isi ' + k.f + ' minimal 3 karakter');
    if (!/^[\w#.\- ]+$/.test(t))
      return tampilError(k.f + ' hanya boleh huruf, angka, spasi, #, titik, dan strip');
    if (k.z && !/^\d{3,5}$/.test(z)) return tampilError('Zone ID harus 3 sampai 5 angka');
    if (p.s < 1) return tampilError('Maaf, stok item ini habis');
    const tj = t + (k.z ? ' (' + z + ')' : '');
    bukaModal(
      `<h2>Konfirmasi Pesanan</h2><div style="margin:14px 0">${barisRincian('Game', k.n)}${barisRincian('Item', amankanTeks(p.n))}${barisRincian('Tujuan', amankanTeks(tj))}${barisRincian('Pembayaran', metodeBayar)}${barisRincian('Harga dasar', rupiah(p.d))}${barisRincian('Biaya layanan', rupiah(p.fee))}${barisRincian('PPN', p.ppn ? rupiah(p.ppn) : 'tidak dikenakan')}${barisRincian('Total', '<b>' + rupiah(p.h) + '</b>')}</div><p class="mu" style="font-size:13px">Pastikan data akun sudah benar. Item tidak dapat dipindah ke akun lain.</p><div class="rw"><button class="bt gh" data-a="x">Cek lagi</button><button class="bt" data-a="bayar" data-id="${p.id}" data-tj="${amankanTeks(tj)}">Pesan Sekarang</button></div>`,
    );
  },
  bayar(a) {
    const p = cariProduk(+a.dataset.id);
    if (p.s < 1) {
      tutupModal();
      return tampilToast('Stok habis');
    }
    p.s--;
    const t = {
      id: idBaru(db.t),
      u: ambilSesi(),
      p: p.id,
      tj: a.dataset.tj,
      m: metodeBayar,
      d: Date.now(),
      st: 'pending',
      h: p.h,
      dd: p.d,
      fee: p.fee,
      ppn: p.ppn,
    };
    db.t.push(t);
    pesanSistem(t.id, 'Pesanan dibuat');
    simpanData();
    tutupModal();
    tampilToast('Pesanan dibuat 🎉');
    location.hash = '#/status';
    setTimeout(
      () =>
        AKSI.nota({
          dataset: {
            id: t.id,
          },
        }),
      350,
    );
  },
  nota(a) {
    const t = db.t.find((x) => x.id == a.dataset.id),
      p = cariProduk(t.p);
    bukaModal(
      `<h2>🧾 Nota GV-${String(t.id).padStart(4, '0')}</h2><div style="margin:12px 0">${barisRincian('Tanggal', formatTanggal(t.d))}${barisRincian('Game', cariKategori(p.k).n)}${barisRincian('Item', amankanTeks(t.rq || p.n))}${barisRincian('Tujuan', amankanTeks(t.tj))}${barisRincian('Pembayaran', t.m)}${t.fee != null ? barisRincian('Harga dasar', rupiah(t.dd)) + barisRincian('Biaya layanan', rupiah(t.fee)) + barisRincian('PPN', t.ppn ? rupiah(t.ppn) : 'tidak dikenakan') : ''}${barisRincian('Total', '<b>' + rupiah(t.h) + '</b>')}${barisRincian('Status', '<span class="bd ' + t.st + '">' + t.st + '</span>')}</div>${t.st === 'pending' && !t.paid ? panelCaraBayar(t) : ''}${t.st === 'pending' && t.paid ? '<p class="mu" style="font-size:13px">Pembayaran sudah kamu konfirmasi. Admin sedang memverifikasi.</p>' : ''}${t.st === 'pending' && !t.paid && t.u === ambilSesi() ? `<button class="bt" style="width:100%;margin-bottom:8px" data-a="sudahbayar" data-id="${t.id}">Saya Sudah Bayar</button>` : ''}${MODE_HALAMAN === 'shop' ? `<a class="bt gh" style="width:100%;margin-bottom:8px" href="#/chat/${t.id}" data-a="x">Chat dengan admin</a>` : ''}<button class="bt gh" style="width:100%" data-a="x">Tutup</button>`,
    );
    gambarQR(t);
  },
  batal(a) {
    const t = db.t.find((x) => x.id == a.dataset.id);
    if (t.st !== 'pending') return;
    ubahStatus(t.id, 'batal');
  },
  pform(a) {
    const p = a.dataset.id
      ? cariProduk(+a.dataset.id)
      : {
          k: 1,
          n: '',
          d: '',
          s: '',
        };
    bukaModal(
      `<div class="fm" style="margin:0"><h2>${a.dataset.id ? 'Ubah' : 'Tambah'} Produk</h2><label>Game</label><select id="pk">${db.k.map((k) => `<option value="${k.id}" ${k.id === p.k ? 'selected' : ''}>${k.n}</option>`).join('')}</select><label>Nama item</label><input id="pn" value="${amankanTeks(p.n)}" placeholder="Contoh: 172 Diamonds"><label>Harga dasar (Rp)</label><input id="ph" type="number" min="1" value="${p.d}"><label>Stok</label><input id="ps" type="number" min="0" value="${p.s}"><p id="er" class="er"></p><div class="rw"><button class="bt gh" data-a="x">Batal</button><button class="bt" data-a="psave" data-id="${a.dataset.id || ''}">Simpan</button></div></div>`,
    );
  },
  psave(a) {
    const n = $('#pn').value.trim(),
      h = +$('#ph').value,
      s = +$('#ps').value;
    if (n.length < 2) return tampilError('Nama item wajib diisi');
    if (!(h > 0)) return tampilError('Harga harus lebih dari 0');
    if (!(s >= 0) || !Number.isInteger(s)) return tampilError('Stok harus bilangan bulat 0 atau lebih');
    const k = +$('#pk').value,
      x = {
        k,
        n,
        s,
        u: cariKategori(k).hp ? 0 : parseInt(n.replace(/\./g, '')) || 0,
        ...hitungHarga(h, cariKategori(k).hp),
      };
    if (a.dataset.id) Object.assign(cariProduk(+a.dataset.id), x);
    else
      db.p.push({
        id: idBaru(db.p),
        ...x,
      });
    simpanData();
    tutupModal();
    tampilToast('Produk disimpan');
    tampilkanHalaman();
  },
  pdel(a) {
    const p = cariProduk(+a.dataset.id);
    bukaModal(
      `<h2>Hapus produk?</h2><p class="mu">${amankanTeks(p.n)} akan dihapus dari katalog.</p><div class="rw"><button class="bt gh" data-a="x">Batal</button><button class="bt rd" data-a="pdel2" data-id="${p.id}">Ya, hapus</button></div>`,
    );
  },
  adm(a) {
    const id = +a.dataset.id,
      v = a.dataset.v;
    if (v !== 'batal') return ubahStatus(id, v);
    bukaModal(
      `<h2>Batalkan pesanan?</h2><p class="mu">GV-${String(id).padStart(4, '0')} akan dibatalkan dan stok dikembalikan.</p><div class="rw"><button class="bt gh" data-a="x">Tidak</button><button class="bt rd" data-a="adm2" data-id="${id}">Ya, batalkan</button></div>`,
    );
  },
  adm2(a) {
    tutupModal();
    ubahStatus(+a.dataset.id, 'batal');
  },
  salin(a) {
    salinTeks(a.dataset.tj).then(
      () => tampilToast('Tersalin'),
      () => tampilToast('Gagal menyalin, salin manual ya'),
    );
  },
  sudahbayar(a) {
    const t = db.t.find((x) => x.id == a.dataset.id);
    if (t && t.st === 'pending' && !t.paid) {
      t.paid = Date.now();
      pesanSistem(t.id, 'Pembeli menandai sudah membayar');
      simpanData();
      tutupModal();
      tampilToast('Terima kasih! Admin akan memverifikasi pembayaranmu');
      tampilkanHalaman();
    }
  },
  rkon() {
    if (!penggunaAktif()) {
      tampilToast('Masuk dulu supaya bisa request');
      tabAuth = 'login';
      return (location.hash = '#/auth');
    }
    const k = cariKategori(formRequest.k),
      r = hitungRequest(),
      z = $('#zn') ? $('#zn').value.trim() : '';
    let t = $('#tg').value.trim();
    if (r.e) return tampilError(r.e);
    if (k.hp) {
      t = t.replace(/[\s-]/g, '').replace(/^\+?62/, '0');
      if (!/^08\d{8,11}$/.test(t))
        return tampilError('Nomor HP harus diawali 08 dan terdiri dari 10 sampai 13 digit');
      if (!k.px.some((x) => t.startsWith(x)))
        return tampilError(
          'Nomor ini bukan nomor ' + k.n.replace('Pulsa ', '') + '. Cek lagi atau pilih provider lain',
        );
    }
    if (t.length < 3 || !/^[\w#.\- ]+$/.test(t)) return tampilError('Isi ' + k.f + ' dengan benar');
    if (k.z && !/^\d{3,5}$/.test(z)) return tampilError('Zone ID harus 3 sampai 5 angka');
    requestTertunda = {
      ...r,
      tj: t + (k.z ? ' (' + z + ')' : ''),
    };
    bukaModal(
      `<h2>Konfirmasi Request</h2><div style="margin:14px 0">${barisRincian('Layanan', k.n)}${barisRincian('Pesanan', amankanTeks(r.txt.replace('Request ', '')))}${barisRincian('Tujuan', amankanTeks(requestTertunda.tj))}${barisRincian('Pembayaran', metodeBayar)}${barisRincian('Harga dasar', rupiah(r.d))}${barisRincian('Biaya layanan', rupiah(r.fee))}${barisRincian('PPN', r.ppn ? rupiah(r.ppn) : 'tidak dikenakan')}${barisRincian('Total', '<b>' + rupiah(r.h) + '</b>')}</div><div class="rw"><button class="bt gh" data-a="x">Cek lagi</button><button class="bt" data-a="rbayar">Buat Request</button></div>`,
    );
  },
  rbayar() {
    if (!requestTertunda) return;
    const t = {
      id: idBaru(db.t),
      u: ambilSesi(),
      p: requestTertunda.p,
      tj: requestTertunda.tj,
      m: metodeBayar,
      d: Date.now(),
      st: 'pending',
      h: requestTertunda.h,
      dd: requestTertunda.d,
      fee: requestTertunda.fee,
      ppn: requestTertunda.ppn,
      rq: requestTertunda.txt,
    };
    db.t.push(t);
    pesanSistem(t.id, 'Pesanan dibuat');
    simpanData();
    requestTertunda = null;
    tutupModal();
    tampilToast('Request dibuat 🎉');
    location.hash = '#/status';
    setTimeout(
      () =>
        AKSI.nota({
          dataset: {
            id: t.id,
          },
        }),
      350,
    );
  },
  kirim() {
    const m = $('#bm').value.trim();
    if (m.length < 10) return tampilError('Tulis pesanmu minimal 10 karakter');
    db.b.push({
      id: idBaru(db.b),
      u: ambilSesi(),
      k: $('#bk').value,
      t: +$('#bn').value || 0,
      m,
      d: Date.now(),
      st: 'baru',
      r: '',
    });
    simpanData();
    tampilToast('Pertanyaan terkirim, tunggu balasan admin ya');
    tampilkanHalaman();
  },
  balas(a) {
    const t = db.b.find((x) => x.id == a.dataset.id),
      v = $('#rb' + t.id).value.trim();
    if (!v) return tampilToast('Tulis balasan dulu');
    t.r = v;
    t.st = 'dijawab';
    simpanData();
    tampilToast('Balasan terkirim');
    tampilkanHalaman();
  },
  selesai(a) {
    db.b.find((x) => x.id == a.dataset.id).st = 'selesai';
    simpanData();
    tampilToast('Ditandai selesai');
    tampilkanHalaman();
  },
  pdel2(a) {
    const id = +a.dataset.id;
    if (db.t.some((t) => t.p === id)) {
      tutupModal();
      return tampilToast('Produk punya riwayat transaksi, set stok 0 saja');
    }
    db.p = db.p.filter((p) => p.id !== id);
    simpanData();
    tutupModal();
    tampilToast('Produk dihapus');
    tampilkanHalaman();
  },
};

// event listener
document.addEventListener('click', (e) => {
  db = muatData();
  const g = document.createElement('i');
  g.className = 'rg';
  g.style.left = e.clientX + 'px';
  g.style.top = e.clientY + 'px';
  document.body.append(g);
  setTimeout(() => g.remove(), 700);
  const a = e.target.closest('[data-a],.bt,.ch,.cd');
  if (a) {
    a.classList.remove('bump');
    void a.offsetWidth;
    a.classList.add('bump');
  }
  const l = e.target.closest('[data-t]');
  if (l) {
    tabAuth = l.dataset.t;
    if (location.hash === '#/auth') tampilkanHalaman();
  }
  const b = e.target.closest('[data-a]');
  if (b && AKSI[b.dataset.a]) AKSI[b.dataset.a](b, e);
  else if (e.target.classList.contains('ov')) tutupModal();
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'ra') {
    formRequest.a = e.target.value;
    $('#rr').innerHTML = ringkasanRequest(hitungRequest());
  }
  if (e.target.id === 'q') {
    filterKatalog.q = e.target.value;
    isiGridKatalog();
  }
  if (e.target.id === 'fq') {
    const v = e.target.value.toLowerCase();
    let n = 0;
    $$('.fa').forEach((d) => {
      const h = !d.textContent.toLowerCase().includes(v);
      d.hidden = h;
      if (!h) n++;
    });
    $('#fe').hidden = n > 0;
  }
});
document.addEventListener('change', (e) => {
  db = muatData();
  if (e.target.id === 'cf' && e.target.files[0]) {
    const id = +e.target.dataset.id, f = e.target.files[0], ket = $('#ci').value.trim();
    if (!f.type.startsWith('image/')) return tampilToast('File harus berupa gambar');
    kecilkanGambar(f).then(
      (url) => { db = muatData(); kirimPesan(id, sisiChat(), ket, url, 'bukti'); simpanData(); tampilkanHalaman(); },
      () => tampilToast('Gambar tidak bisa dibaca'),
    );
  }
  if (e.target.id === 'sel') {
    const q = cariProduk(+e.target.value);
    $('#bdn').innerHTML = rincianHarga(q, cariKategori(q.k).hp);
  }
  if (e.target.id === 'rk') {
    formRequest.k = +e.target.value;
    formRequest.a = '';
    tampilkanHalaman();
  }
  if (e.target.dataset.st) ubahStatus(+e.target.dataset.st, e.target.value);
  const hg = e.target.dataset.hg,
    sk = e.target.dataset.sk;
  if (hg || sk) {
    const p = cariProduk(+(hg || sk)),
      v = +e.target.value;
    if (hg ? !(v > 0) : !(v >= 0 && Number.isInteger(v))) {
      tampilToast(hg ? 'Harga harus lebih dari 0' : 'Stok harus bilangan bulat 0 atau lebih');
      return tampilkanHalaman();
    }
    if (hg) Object.assign(p, hitungHarga(v, cariKategori(p.k).hp));
    else p.s = v;
    simpanData();
    tampilToast((hg ? 'Harga ' : 'Stok ') + p.n + ' diperbarui');
    tampilkanHalaman();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'ci') $('[data-a=kirimchat]').click();
  if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
    const b = e.target.closest('.fm')?.querySelector('.bt[data-a]:not(.gh)');
    if (b) b.click();
  }
  if (e.key === 'Escape') tutupModal();
});
addEventListener('storage', (e) => {
  if (e.key === KUNCI_DATA) {
    db = muatData();
    if (!$('.ov') && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) tampilkanHalaman();
  }
});
addEventListener('hashchange', tampilkanHalaman);
tampilkanHalaman();
cariGambar();
setInterval(() => {
  if (!modeServer || document.hidden) return;
  const s = kirimKeServer('GET');
  if (!s) return;
  let d;
  try {
    d = JSON.parse(s);
  } catch (e) {
    return;
  }
  if (d && d._v !== db._v && !$('.ov') && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))
    tampilkanHalaman();
}, 3000);
