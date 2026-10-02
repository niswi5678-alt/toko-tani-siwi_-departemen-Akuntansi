// ============================================
// CRUD TRANSAKSI KELUAR
// ============================================

async function loadTransaksiKeluar() {
  const { data, error } = await supabaseClient
    .from('transaksi_keluar')
    .select(`
      id_keluar,
      tanggal,
      jumlah,
      harga_jual,
      total,
      produk:id_produk (id_produk, kode_produk, nama_produk)
    `)
    .order('id_keluar', { ascending: false });

  if (error) {
    document.getElementById('status-keluar').textContent = 'Error: ' + error.message;
    return;
  }

  const tbody = document.getElementById('tbody-keluar');
  tbody.innerHTML = (data || []).map((t) => `
    <tr>
      <td>${t.id_keluar}</td>
      <td>${t.produk?.nama_produk ?? '-'}</td>
      <td>${t.tanggal}</td>
      <td>${t.jumlah}</td>
      <td>${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(Number(t.harga_jual || 0))}</td>
      <td>${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(Number(t.total || 0))}</td>
      <td>
        <button class="btn-danger" onclick="hapusTransaksiKeluar(${t.id_keluar})">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function simpanTransaksiKeluar() {
  const id_produk = document.getElementById('keluar-produk').value;
  const tanggal = document.getElementById('keluar-tanggal').value || new Date().toISOString().split('T')[0];
  const jumlah = Number(document.getElementById('keluar-jumlah').value || 0);
  const harga_jual = Number(document.getElementById('keluar-harga-jual').value || 0);
  const status = document.getElementById('status-keluar');

  if (!id_produk || !tanggal || jumlah <= 0 || harga_jual < 0) {
    status.textContent = 'Pilih produk, tanggal, jumlah > 0, dan harga jual valid.';
    return;
  }

  const { error } = await supabaseClient.from('transaksi_keluar').insert({
    id_produk,
    tanggal,
    jumlah,
    harga_jual
  });

  if (error) {
    status.textContent = 'Gagal: ' + error.message;
    return;
  }

  status.textContent = 'Transaksi keluar berhasil disimpan.';
  resetTransaksiKeluar();
  await loadTransaksiKeluar();
  await loadProduk();
  await loadRingkasan();
}

async function hapusTransaksiKeluar(id) {
  if (!confirm('Yakin hapus transaksi keluar ini?')) return;

  const { error } = await supabaseClient.from('transaksi_keluar').delete().eq('id_keluar', id);
  if (error) {
    alert('Gagal hapus: ' + error.message);
    return;
  }

  await loadTransaksiKeluar();
  await loadProduk();
  await loadRingkasan();
}

function resetTransaksiKeluar() {
  document.getElementById('keluar-produk').value = '';
  document.getElementById('keluar-jumlah').value = '';
  document.getElementById('keluar-harga-jual').value = '';
  document.getElementById('keluar-tanggal').value = new Date().toISOString().split('T')[0];
}
