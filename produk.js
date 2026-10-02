// ============================================
// CRUD PRODUK
// ============================================

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

async function loadProduk() {
  const { data, error } = await supabaseClient
    .from('produk')
    .select(`
      id_produk,
      kode_produk,
      nama_produk,
      kategori,
      satuan,
      harga_beli,
      harga_jual,
      stok,
      supplier:id_supplier (id_supplier, nama_supplier)
    `)
    .order('id_produk', { ascending: true });

  if (error) {
    document.getElementById('status-produk').textContent = 'Error: ' + error.message;
    return;
  }

  const tbody = document.getElementById('tbody-produk');
  tbody.innerHTML = (data || []).map((p) => `
    <tr>
      <td>${p.id_produk}</td>
      <td>${p.kode_produk}</td>
      <td>${p.nama_produk}</td>
      <td>${p.supplier?.nama_supplier ?? '-'}</td>
      <td>${p.kategori ?? '-'}</td>
      <td>${formatRupiah(p.harga_beli)}</td>
      <td>${formatRupiah(p.harga_jual)}</td>
      <td>${p.stok}</td>
      <td>
        <button class="btn-edit" onclick='editProduk(${JSON.stringify(p)})'>Edit</button>
        <button class="btn-danger" onclick="hapusProduk(${p.id_produk})">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function isiProdukDropdown() {
  const { data, error } = await supabaseClient
    .from('produk')
    .select('id_produk, nama_produk, kode_produk')
    .order('id_produk', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const produkOptions = ['<option value="">-- Pilih Produk --</option>']
    .concat((data || []).map((p) => `<option value="${p.id_produk}">${p.nama_produk} (${p.kode_produk})</option>`))
    .join('');

  document.getElementById('masuk-produk').innerHTML = produkOptions;
  document.getElementById('keluar-produk').innerHTML = produkOptions;

  const { data: supplierData } = await supabaseClient
    .from('supplier')
    .select('id_supplier, nama_supplier')
    .order('id_supplier', { ascending: true });

  const supplierOptions = ['<option value="">-- Pilih Supplier --</option>']
    .concat((supplierData || []).map((s) => `<option value="${s.id_supplier}">${s.nama_supplier}</option>`))
    .join('');

  document.getElementById('produk-supplier').innerHTML = supplierOptions;
}

async function simpanProduk() {
  const id = document.getElementById('produk-id').value;
  const kode_produk = document.getElementById('produk-kode').value.trim();
  const nama_produk = document.getElementById('produk-nama').value.trim();
  const id_supplier = document.getElementById('produk-supplier').value || null;
  const kategori = document.getElementById('produk-kategori').value.trim();
  const satuan = document.getElementById('produk-satuan').value.trim();
  const harga_beli = Number(document.getElementById('produk-harga-beli').value || 0);
  const harga_jual = Number(document.getElementById('produk-harga-jual').value || 0);
  const stok = Number(document.getElementById('produk-stok').value || 0);
  const status = document.getElementById('status-produk');

  if (!kode_produk || !nama_produk || !id_supplier || !satuan) {
    status.textContent = 'Kode, nama, supplier, dan satuan produk wajib diisi.';
    return;
  }

  const payload = {
    id_supplier,
    kode_produk,
    nama_produk,
    kategori,
    satuan,
    harga_beli,
    harga_jual,
    stok
  };

  let error;
  if (id) {
    ({ error } = await supabaseClient.from('produk').update(payload).eq('id_produk', id));
  } else {
    ({ error } = await supabaseClient.from('produk').insert(payload));
  }

  if (error) {
    status.textContent = 'Gagal: ' + error.message;
  } else {
    status.textContent = 'Berhasil disimpan.';
    resetProduk();
    await loadProduk();
    await isiProdukDropdown();
    await loadRingkasan();
  }
}

function editProduk(p) {
  document.getElementById('produk-id').value = p.id_produk;
  document.getElementById('produk-kode').value = p.kode_produk;
  document.getElementById('produk-nama').value = p.nama_produk;
  document.getElementById('produk-supplier').value = p.id_supplier ?? '';
  document.getElementById('produk-kategori').value = p.kategori ?? '';
  document.getElementById('produk-satuan').value = p.satuan ?? '';
  document.getElementById('produk-harga-beli').value = p.harga_beli ?? 0;
  document.getElementById('produk-harga-jual').value = p.harga_jual ?? 0;
  document.getElementById('produk-stok').value = p.stok ?? 0;
}

function resetProduk() {
  document.getElementById('produk-id').value = '';
  document.getElementById('produk-kode').value = '';
  document.getElementById('produk-nama').value = '';
  document.getElementById('produk-supplier').value = '';
  document.getElementById('produk-kategori').value = '';
  document.getElementById('produk-satuan').value = '';
  document.getElementById('produk-harga-beli').value = '';
  document.getElementById('produk-harga-jual').value = '';
  document.getElementById('produk-stok').value = '';
}

async function hapusProduk(id) {
  if (!confirm('Yakin hapus produk ini?')) return;

  const { error } = await supabaseClient.from('produk').delete().eq('id_produk', id);
  if (error) {
    alert('Gagal hapus: ' + error.message);
    return;
  }

  await loadProduk();
  await isiProdukDropdown();
  await loadRingkasan();
}