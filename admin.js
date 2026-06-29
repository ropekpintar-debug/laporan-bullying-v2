/* ================================================
   ADMIN DASHBOARD - SMKN TAKERAN MAGETAN
   admin.js — Logika utama dashboard
   ================================================ */

// -----------------------------------------------
// KONFIGURASI LOGIN ADMIN
// Ganti username dan password di sini
// -----------------------------------------------
const ADMIN_CREDENTIALS = {
  username: 'admin_osis',
  password: 'smkntakeran2026'
};

// -----------------------------------------------
// DATA LAPORAN
// Saat ini menggunakan data dummy/contoh (localStorage).
// Untuk menghubungkan ke Google Sheets, ganti fungsi
// loadLaporan() dan saveLaporan() dengan fetch ke Apps Script.
// -----------------------------------------------

// Contoh data laporan awal (akan disimpan di localStorage)
const SAMPLE_DATA = [
  {
    id: 'BLY-2026-0001',
    tanggal: '2026-06-25T08:30:00',
    nama: 'Anonim',
    kelas: '10',
    jurusan: 'Teknik Komputer Jaringan (TKJ)',
    jenis: 'Verbal',
    pembully: 'Tidak diketahui',
    kelas_pembully: '11',
    jurusan_pembully: 'Rekayasa Perangkat Lunak (RPL)',
    nomor_hp: '',
    lokasi: 'Kantin',
    kronologi: 'Saya sering diejek dan dipanggil dengan nama julukan yang merendahkan di kantin saat jam istirahat. Sudah berlangsung selama 2 minggu.',
    bantuan: 'Minta ditindaklanjuti ke guru BK',
    bukti_link: '',
    status: 'baru',
    catatan: ''
  },
  {
    id: 'BLY-2026-0002',
    tanggal: '2026-06-26T10:15:00',
    nama: 'Anonim',
    kelas: '11',
    jurusan: 'Desain Komunikasi Visual (DKV)',
    jenis: 'Cyberbullying',
    pembully: 'Akun Instagram @xxxxx',
    kelas_pembully: '',
    jurusan_pembully: '',
    nomor_hp: '08123456789',
    lokasi: 'Online / Media Sosial',
    kronologi: 'Ada akun anonim yang menyebarkan foto dan komentar buruk tentang saya di Instagram. Sudah ada beberapa teman yang ikut berkomentar negatif.',
    bantuan: 'Butuh konseling',
    bukti_link: 'https://drive.google.com/file/d/contoh',
    status: 'diproses',
    catatan: 'Sudah dihubungi BK pada 27 Juni. Sedang dalam proses penelusuran akun.'
  },
  {
    id: 'BLY-2026-0003',
    tanggal: '2026-06-27T13:00:00',
    nama: 'Anonim',
    kelas: '12',
    jurusan: 'Kuliner',
    jenis: 'Fisik',
    pembully: 'Siswa kelas 12',
    kelas_pembully: '12',
    jurusan_pembully: 'Teknik Komputer Jaringan (TKJ)',
    nomor_hp: '08987654321',
    lokasi: 'Lapangan',
    kronologi: 'Teman sekelas sering mendorong dan mencubit saat di lapangan saat pelajaran olahraga. Sudah terjadi 3 kali.',
    bantuan: 'Minta perlindungan segera',
    bukti_link: '',
    status: 'selesai',
    catatan: 'Sudah diselesaikan oleh BK dan kepala sekolah. Pelaku mendapat surat peringatan.'
  }
];

// -----------------------------------------------
// VARIABEL GLOBAL
// -----------------------------------------------
let semuaLaporan = [];  // Menyimpan semua data laporan
let laporanDipilih = null;  // Laporan yang sedang dibuka di modal

// -----------------------------------------------
// UTILITAS
// -----------------------------------------------

/**
 * Format tanggal ke format Indonesia
 * Contoh: "25 Jun 2026, 08:30"
 */
function formatTanggal(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/**
 * Format tanggal singkat (untuk grafik)
 * Contoh: "25/06"
 */
function formatTanggalSingkat(isoString) {
  const d = new Date(isoString);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

/**
 * Buat label badge status dengan warna yang sesuai
 */
function badgeStatus(status) {
  const map = {
    baru:     { label: '🔵 Baru',     cls: 'badge-baru' },
    diproses: { label: '🟡 Diproses', cls: 'badge-diproses' },
    selesai:  { label: '✅ Selesai',  cls: 'badge-selesai' },
    ditolak:  { label: '❌ Ditolak',  cls: 'badge-ditolak' }
  };
  const s = map[status] || map['baru'];
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

// -----------------------------------------------
// LOAD & SAVE DATA (localStorage)
// Untuk integrasi Google Sheets, ganti bagian ini
// dengan fetch ke URL Apps Script Google kamu
// -----------------------------------------------

/**
 * Ambil laporan dari localStorage
 * (Ganti dengan fetch ke Apps Script untuk production)
 */
function loadLaporan() {
  const saved = localStorage.getItem('laporan_bullying');
  if (saved) {
    semuaLaporan = JSON.parse(saved);
  } else {
    // Pakai data contoh pertama kali
    semuaLaporan = SAMPLE_DATA;
    saveLaporan();
  }
}

/**
 * Simpan laporan ke localStorage
 * (Ganti dengan POST ke Apps Script untuk production)
 */
function saveLaporan() {
  localStorage.setItem('laporan_bullying', JSON.stringify(semuaLaporan));
}

/**
 * Generate nomor laporan otomatis
 * Format: BLY-TAHUN-NNNN
 */
function generateNomor() {
  const tahun = new Date().getFullYear();
  const terakhir = semuaLaporan.length > 0
    ? parseInt(semuaLaporan[semuaLaporan.length - 1].id.split('-')[2]) + 1
    : 1;
  return `BLY-${tahun}-${String(terakhir).padStart(4, '0')}`;
}

// -----------------------------------------------
// LOGIN
// -----------------------------------------------

/**
 * Proses login admin
 */
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('inputUsername').value.trim();
  const password = document.getElementById('inputPassword').value;
  const errorEl = document.getElementById('loginError');

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // Login berhasil — simpan sesi
    sessionStorage.setItem('admin_login', 'true');
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    initDashboard();
  } else {
    // Login gagal
    errorEl.style.display = 'block';
    errorEl.textContent = 'Username atau password salah. Coba lagi.';
    document.getElementById('inputPassword').value = '';
  }
}

/**
 * Logout admin
 */
function handleLogout() {
  sessionStorage.removeItem('admin_login');
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('inputUsername').value = '';
  document.getElementById('inputPassword').value = '';
}

// -----------------------------------------------
// INISIALISASI DASHBOARD
// -----------------------------------------------

/**
 * Jalankan semua komponen dashboard setelah login
 */
function initDashboard() {
  loadLaporan();
  updateStatistik();
  renderGrafik();
  renderTabel(semuaLaporan);
}

// -----------------------------------------------
// STATISTIK
// -----------------------------------------------

/**
 * Hitung dan tampilkan angka statistik di kartu atas
 */
function updateStatistik() {
  const total   = semuaLaporan.length;
  const hari    = new Date().toDateString();
  const hariIni = semuaLaporan.filter(l => new Date(l.tanggal).toDateString() === hari).length;
  const belum   = semuaLaporan.filter(l => l.status === 'baru').length;
  const selesai = semuaLaporan.filter(l => l.status === 'selesai').length;

  document.getElementById('statTotal').textContent   = total;
  document.getElementById('statHariIni').textContent = hariIni;
  document.getElementById('statBelum').textContent   = belum;
  document.getElementById('statSelesai').textContent = selesai;
}

// -----------------------------------------------
// GRAFIK LAPORAN (7 HARI TERAKHIR)
// -----------------------------------------------

/**
 * Render grafik batang sederhana berdasarkan jumlah laporan per hari
 */
function renderGrafik() {
  const container = document.getElementById('chartBars');
  container.innerHTML = '';

  // Kumpulkan data 7 hari terakhir
  const hari7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    const jumlah = semuaLaporan.filter(l => {
      const ld = new Date(l.tanggal);
      return ld.toDateString() === d.toDateString();
    }).length;
    hari7.push({ label, jumlah });
  }

  const maxVal = Math.max(...hari7.map(h => h.jumlah), 1);

  // Render batang
  hari7.forEach(h => {
    const tinggi = Math.round((h.jumlah / maxVal) * 100);
    const wrap = document.createElement('div');
    wrap.className = 'chart-bar-wrap';
    wrap.innerHTML = `
      <span class="chart-bar-val">${h.jumlah || ''}</span>
      <div class="chart-bar" style="height:${tinggi}%"></div>
      <span class="chart-bar-label">${h.label}</span>
    `;
    container.appendChild(wrap);
  });
}

// -----------------------------------------------
// TABEL LAPORAN
// -----------------------------------------------

/**
 * Render tabel laporan berdasarkan array yang diberikan
 */
function renderTabel(data) {
  const tbody = document.getElementById('tabelBody');
  const count = document.getElementById('laporanCount');
  count.textContent = `${data.length} laporan ditemukan`;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p>Tidak ada laporan yang sesuai filter.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(l => `
    <tr onclick="bukaDetail('${l.id}')">
      <td><strong>${l.id}</strong></td>
      <td>${formatTanggal(l.tanggal)}</td>
      <td>${l.nama || 'Anonim'}</td>
      <td>${l.kelas}</td>
      <td>${l.jurusan}</td>
      <td>${l.jenis}</td>
      <td>${badgeStatus(l.status)}</td>
    </tr>
  `).join('');
}

// -----------------------------------------------
// CARI & FILTER
// -----------------------------------------------

/**
 * Terapkan semua filter dan pencarian sekaligus
 */
function applyFilter() {
  const cari    = document.getElementById('searchInput').value.toLowerCase();
  const status  = document.getElementById('filterStatus').value;
  const kelas   = document.getElementById('filterKelas').value;
  const jurusan = document.getElementById('filterJurusan').value;
  const tanggal = document.getElementById('filterTanggal').value;

  const hasil = semuaLaporan.filter(l => {
    // Filter pencarian teks
    const matchCari = !cari || [l.id, l.nama, l.kelas, l.jurusan, l.jenis]
      .some(val => (val || '').toLowerCase().includes(cari));

    // Filter dropdown
    const matchStatus  = !status  || l.status === status;
    const matchKelas   = !kelas   || l.kelas === kelas;
    const matchJurusan = !jurusan || l.jurusan === jurusan;
    const matchTanggal = !tanggal || l.tanggal.startsWith(tanggal);

    return matchCari && matchStatus && matchKelas && matchJurusan && matchTanggal;
  });

  renderTabel(hasil);
}

/**
 * Reset semua filter ke kondisi awal
 */
function resetFilter() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterKelas').value = '';
  document.getElementById('filterJurusan').value = '';
  document.getElementById('filterTanggal').value = '';
  renderTabel(semuaLaporan);
}

// -----------------------------------------------
// MODAL DETAIL LAPORAN
// -----------------------------------------------

/**
 * Buka modal detail untuk laporan tertentu
 */
function bukaDetail(id) {
  laporanDipilih = semuaLaporan.find(l => l.id === id);
  if (!laporanDipilih) return;

  const l = laporanDipilih;

  // Isi semua field di modal
  document.getElementById('modalNomor').textContent   = l.id;
  document.getElementById('modalTanggal').textContent = formatTanggal(l.tanggal);
  document.getElementById('modalNama').textContent    = l.nama || 'Anonim';
  document.getElementById('modalKelas').textContent   = l.kelas;
  document.getElementById('modalJurusan').textContent = l.jurusan;
  document.getElementById('modalHP').textContent      = l.nomor_hp || 'Tidak diisi';
  document.getElementById('modalJenis').textContent   = l.jenis;
  document.getElementById('modalPembully').textContent  = l.pembully || '-';
  document.getElementById('modalKlsPembully').textContent  = l.kelas_pembully || '-';
  document.getElementById('modalJurPembully').textContent  = l.jurusan_pembully || '-';
  document.getElementById('modalLokasi').textContent   = l.lokasi;
  document.getElementById('modalBantuan').textContent  = l.bantuan;
  document.getElementById('modalKronologi').textContent = l.kronologi;
  document.getElementById('modalCatatan').value        = l.catatan || '';
  document.getElementById('saveSukses').style.display  = 'none';

  // Tombol buka bukti Drive
  const buktiWrap = document.getElementById('buktiWrap');
  if (l.bukti_link) {
    buktiWrap.innerHTML = `<a href="${l.bukti_link}" target="_blank" class="btn-bukti">📂 Buka Bukti di Google Drive</a>`;
  } else {
    buktiWrap.innerHTML = `<span style="color:var(--text-muted);font-size:13px;">Tidak ada lampiran bukti.</span>`;
  }

  // Tandai tombol status yang aktif
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.className = 'status-btn';
    if (btn.dataset.status === l.status) {
      btn.classList.add(`active-${l.status}`);
    }
  });

  // Tampilkan modal
  document.getElementById('modalOverlay').classList.add('active');
}

/**
 * Tutup modal
 */
function tutupModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  laporanDipilih = null;
}

/**
 * Ganti status laporan dari tombol di modal
 */
function setStatus(status) {
  if (!laporanDipilih) return;

  // Update tampilan tombol
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.className = 'status-btn';
    if (btn.dataset.status === status) {
      btn.classList.add(`active-${status}`);
    }
  });

  // Simpan sementara (belum ke storage, tunggu tombol Simpan)
  laporanDipilih._statusSementara = status;
}

/**
 * Simpan perubahan status dan catatan
 */
function simpanPerubahan() {
  if (!laporanDipilih) return;

  // Terapkan status sementara jika ada
  if (laporanDipilih._statusSementara) {
    laporanDipilih.status = laporanDipilih._statusSementara;
    delete laporanDipilih._statusSementara;
  }

  // Ambil catatan terbaru dari textarea
  laporanDipilih.catatan = document.getElementById('modalCatatan').value;

  // Update array utama
  const idx = semuaLaporan.findIndex(l => l.id === laporanDipilih.id);
  if (idx !== -1) semuaLaporan[idx] = laporanDipilih;

  // Simpan ke storage
  saveLaporan();

  // Update tampilan
  updateStatistik();
  applyFilter();

  // Tampilkan feedback berhasil
  const sukses = document.getElementById('saveSukses');
  sukses.style.display = 'block';
  setTimeout(() => { sukses.style.display = 'none'; }, 2500);
}

// -----------------------------------------------
// EVENT LISTENERS
// Dipasang saat halaman selesai dimuat
// -----------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // Cek sesi login
  if (sessionStorage.getItem('admin_login') === 'true') {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    initDashboard();
  }

  // Form login
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Tombol logout
  document.getElementById('btnLogout').addEventListener('click', handleLogout);

  // Tutup modal saat klik overlay
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) tutupModal();
  });

  // Cari & filter (realtime)
  ['searchInput', 'filterStatus', 'filterKelas', 'filterJurusan', 'filterTanggal']
    .forEach(id => {
      document.getElementById(id).addEventListener('input', applyFilter);
      document.getElementById(id).addEventListener('change', applyFilter);
    });
});
