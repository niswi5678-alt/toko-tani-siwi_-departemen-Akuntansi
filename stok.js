// ============================================
// CRUD STOK (transaksi masuk/keluar)
// ============================================

async function loadStok() {
  const { data, error } = await supabaseClient
    .from('stok')
    .select(`
      id, jumlah, jenis, keterangan, tanggal_update,
      produk:produk_id (id, nama_produk, satuan)
    `)
    .order('id', { ascending: false });

  if (error) {
    document.getElementById('status-stok').textContent = 'Error: ' + error.message;
    return;
  }

  const tbody = document.getElementById('tbody-stok');
  tbody.innerHTML = data.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.produk?.nama_produk ?? '-'}</td>
      <td>${s.jumlah} ${s.produk?.satuan ?? ''}</td>
      <td class="badge-${s.jenis}">${s.jenis}</td>
      <td>${s.keterangan ?? '-'}</td>
      <td>${new Date(s.tanggal_update).toLocaleString('id-ID')}</td>
    </tr>
  `).join('');
}

async function simpanStok() {
  const produk_id = document.getElementById('stok-produk').value;
  const jumlah = parseInt(document.getElementById('stok-jumlah').value);
  const jenis = document.getElementById('stok-jenis').value;
  const keterangan = document.getElementById('stok-keterangan').value.trim();
  const status = document.getElementById('status-stok');

  if (!produk_id || !jumlah || jumlah <= 0) {
    status.textContent = 'Pilih produk dan isi jumlah > 0.';
    return;
  }

  const { error } = await supabaseClient
    .from('stok')
    .insert({ produk_id, jumlah, jenis, keterangan });

  if (error) {
    status.textContent = 'Gagal: ' + error.message;
  } else {
    status.textContent = 'Berhasil disimpan.';
    document.getElementById('stok-jumlah').value = '';
    document.getElementById('stok-keterangan').value = '';
    await loadStok();
  }
}

// ============================================
// ISI DROPDOWN (dipakai di form produk & stok)
// ============================================
async function isiDropdown() {
  // Kategori
  const { data: kategori } = await supabaseClient.from('kategori').select('id, nama_kategori').order('id');
  document.getElementById('produk-kategori').innerHTML =
    '<option value="">-- Pilih Kategori --</option>' +
    (kategori ?? []).map(k => `<option value="${k.id}">${k.nama_kategori}</option>`).join('');

  // Supplier
  const { data: supplier } = await supabaseClient.from('supplier').select('id, nama_supplier').order('id');
  document.getElementById('produk-supplier').innerHTML =
    '<option value="">-- Pilih Supplier --</option>' +
    (supplier ?? []).map(s => `<option value="${s.id}">${s.nama_supplier}</option>`).join('');

  // Produk (untuk stok)
  const { data: produk } = await supabaseClient.from('produk').select('id, nama_produk').order('id');
  document.getElementById('stok-produk').innerHTML =
    '<option value="">-- Pilih Produk --</option>' +
    (produk ?? []).map(p => `<option value="${p.id}">${p.nama_produk}</option>`).join('');
}