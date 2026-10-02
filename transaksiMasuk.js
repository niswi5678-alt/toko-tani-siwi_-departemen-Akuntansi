// ============================================
// CRUD TRANSAKSI MASUK
// ============================================

async function loadTransaksiMasuk() {
  const { data, error } = await supabaseClient
    .from('transaksi_masuk')
    .select(`
      id_masuk,
      tanggal,
      jumlah,
      harga_beli,
      total,
      produk:id_produk (id_produk, kode_produk, nama_produk)
    `)
    .order('id_masuk', { ascending: false });

  if (error) {
    document.getElementById('status-masuk').textContent = 'Error: ' + error.message;
    return;
  }

  const tbody = document.getElementById('tbody-masuk');
  tbody.innerHTML = (data || []).map((t) => `
    <tr>
      <td>${t.id_masuk}</td>
      <td>${t.produk?.nama_produk ?? '-'}</td>
      <td>${t.tanggal}</td>
      <td>${t.jumlah}</td>
      <td>${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(Number(t.harga_beli || 0))}</td>
      <td>${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(Number(t.total || 0))}</td>
      <td>
        <button class="btn-danger" onclick="hapusTransaksiMasuk(${t.id_masuk})">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function simpanTransaksiMasuk() {
  const id_produk = document.getElementById('masuk-produk').value;
  const tanggal = document.getElementById('masuk-tanggal').value || new Date().toISOString().split('T')[0];
  const jumlah = Number(document.getElementById('masuk-jumlah').value || 0);
  const harga_beli = Number(document.getElementById('masuk-harga-beli').value || 0);
  const status = document.getElementById('status-masuk');

  if (!id_produk || !tanggal || jumlah <= 0 || harga_beli < 0) {
    status.textContent = 'Pilih produk, tanggal, jumlah > 0, dan harga beli valid.';
    return;
  }

  const { error } = await supabaseClient.from('transaksi_masuk').insert({
    id_produk,
    tanggal,
    jumlah,
    harga_beli
  });

  if (error) {
    status.textContent = 'Gagal: ' + error.message;
    return;
  }

  status.textContent = 'Transaksi masuk berhasil disimpan.';
  resetTransaksiMasuk();
  await loadTransaksiMasuk();
  await loadProduk();
  await loadRingkasan();
}

async function hapusTransaksiMasuk(id) {
  if (!confirm('Yakin hapus transaksi masuk ini?')) return;

  const { error } = await supabaseClient.from('transaksi_masuk').delete().eq('id_masuk', id);
  if (error) {
    alert('Gagal hapus: ' + error.message);
    return;
  }

  await loadTransaksiMasuk();
  await loadProduk();
  await loadRingkasan();
}

function resetTransaksiMasuk() {
  document.getElementById('masuk-produk').value = '';
  document.getElementById('masuk-jumlah').value = '';
  document.getElementById('masuk-harga-beli').value = '';
  document.getElementById('masuk-tanggal').value = new Date().toISOString().split('T')[0];
}
