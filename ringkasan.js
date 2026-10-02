// ============================================
// RINGKASAN STOK DAN ARUS KAS
// ============================================

const formatNilaiKas = (nilai) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(Number(nilai || 0));

function transaksiSesuaiPeriode(tanggal, periode) {
  if (periode === 'all') return true;

  const nilaiTanggal = new Date(`${tanggal}T00:00:00`);
  const hariIni = new Date();

  if (periode === 'month') {
    return nilaiTanggal.getFullYear() === hariIni.getFullYear()
      && nilaiTanggal.getMonth() === hariIni.getMonth();
  }

  return nilaiTanggal.getFullYear() === hariIni.getFullYear();
}

function isiSelBaris(baris, nilai, kelas = '') {
  const sel = document.createElement('td');
  sel.textContent = nilai;
  if (kelas) sel.className = kelas;
  baris.appendChild(sel);
}

async function loadRingkasan() {
  const status = document.getElementById('status-ringkasan');
  status.textContent = 'Memuat ringkasan...';

  const [supplierResult, produkResult, masukResult, keluarResult] = await Promise.all([
    supabaseClient.from('supplier').select('id_supplier'),
    supabaseClient.from('produk').select('id_produk, stok'),
    supabaseClient
      .from('transaksi_masuk')
      .select('id_masuk, tanggal, jumlah, total, produk:id_produk (nama_produk)')
      .order('tanggal', { ascending: false }),
    supabaseClient
      .from('transaksi_keluar')
      .select('id_keluar, tanggal, jumlah, total, produk:id_produk (nama_produk)')
      .order('tanggal', { ascending: false })
  ]);

  const error = [supplierResult, produkResult, masukResult, keluarResult]
    .find((result) => result.error)?.error;

  if (error) {
    status.textContent = 'Gagal memuat ringkasan: ' + error.message;
    return;
  }

  const suppliers = supplierResult.data || [];
  const products = produkResult.data || [];
  const incoming = masukResult.data || [];
  const outgoing = keluarResult.data || [];
  const periode = document.getElementById('ringkasan-periode').value;
  const filteredIncoming = incoming.filter((item) => transaksiSesuaiPeriode(item.tanggal, periode));
  const filteredOutgoing = outgoing.filter((item) => transaksiSesuaiPeriode(item.tanggal, periode));
  const cashIn = filteredOutgoing.reduce((total, item) => total + Number(item.total || 0), 0);
  const cashOut = filteredIncoming.reduce((total, item) => total + Number(item.total || 0), 0);
  const netCash = cashIn - cashOut;
  const stockCount = products.reduce((total, product) => total + Number(product.stok || 0), 0);
  const lowStockCount = products.filter((product) => Number(product.stok || 0) <= 5).length;

  document.getElementById('ringkasan-masuk').textContent = formatNilaiKas(cashIn);
  document.getElementById('ringkasan-keluar').textContent = formatNilaiKas(cashOut);
  document.getElementById('ringkasan-bersih').textContent = `${netCash < 0 ? '- ' : ''}${formatNilaiKas(Math.abs(netCash))}`;
  document.getElementById('ringkasan-bersih').classList.toggle('cash-negative', netCash < 0);
  document.getElementById('ringkasan-keterangan').textContent = netCash >= 0
    ? 'Kas dari penjualan lebih besar daripada pembelian stok.'
    : 'Pembelian stok lebih besar daripada kas dari penjualan.';
  document.getElementById('ringkasan-masuk-label').textContent = formatNilaiKas(cashIn);
  document.getElementById('ringkasan-keluar-label').textContent = formatNilaiKas(cashOut);
  document.getElementById('ringkasan-stok').textContent = stockCount.toLocaleString('id-ID');
  document.getElementById('ringkasan-stok-rendah').textContent = lowStockCount.toLocaleString('id-ID');
  document.getElementById('ringkasan-supplier').textContent = suppliers.length.toLocaleString('id-ID');
  document.getElementById('ringkasan-produk').textContent = products.length.toLocaleString('id-ID');

  const totalFlow = cashIn + cashOut;
  const inPercent = totalFlow ? (cashIn / totalFlow) * 100 : 0;
  const outPercent = totalFlow ? (cashOut / totalFlow) * 100 : 0;
  document.getElementById('ringkasan-masuk-bar').style.width = `${inPercent}%`;
  document.getElementById('ringkasan-keluar-bar').style.width = `${outPercent}%`;

  const activities = [
    ...filteredIncoming.map((item) => ({
      tanggal: item.tanggal,
      jenis: 'Pembelian stok',
      produk: item.produk?.nama_produk || 'Produk tidak ditemukan',
      nilai: Number(item.total || 0),
      arus: 'out'
    })),
    ...filteredOutgoing.map((item) => ({
      tanggal: item.tanggal,
      jenis: 'Penjualan',
      produk: item.produk?.nama_produk || 'Produk tidak ditemukan',
      nilai: Number(item.total || 0),
      arus: 'in'
    }))
  ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 8);

  const tbody = document.getElementById('tbody-ringkasan');
  tbody.replaceChildren();

  if (!activities.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'empty-activity';
    cell.textContent = 'Belum ada transaksi pada periode ini.';
    row.appendChild(cell);
    tbody.appendChild(row);
  } else {
    activities.forEach((activity) => {
      const row = document.createElement('tr');
      const date = new Date(`${activity.tanggal}T00:00:00`).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      isiSelBaris(row, date);
      isiSelBaris(row, activity.jenis, `activity-type ${activity.arus}`);
      isiSelBaris(row, activity.produk);
      isiSelBaris(row, `${activity.arus === 'in' ? '+' : '-'} ${formatNilaiKas(activity.nilai)}`, `activity-value ${activity.arus}`);
      tbody.appendChild(row);
    });
  }

  status.textContent = `${incoming.length + outgoing.length} transaksi tercatat. Nilai mengikuti periode yang dipilih.`;
}

function pasangFilterRingkasan() {
  const filter = document.getElementById('ringkasan-periode');
  if (filter.dataset.ready) return;
  filter.dataset.ready = 'true';
  filter.addEventListener('change', loadRingkasan);
}
