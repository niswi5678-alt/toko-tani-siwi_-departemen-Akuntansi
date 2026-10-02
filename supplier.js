// ============================================
// CRUD SUPPLIER
// ============================================

async function loadSupplier() {
  const status = document.getElementById('status-supplier');
  status.textContent = 'Memuat data supplier...';

  const { data, error } = await supabaseClient
    .from('supplier')
    .select('*')
    .order('id_supplier', { ascending: true });

  if (error) {
    status.textContent = 'Gagal memuat supplier: ' + error.message;
    return;
  }

  const tbody = document.getElementById('tbody-supplier');
  tbody.innerHTML = (data || []).map((s) => `
    <tr>
      <td>${s.id_supplier}</td>
      <td>${s.nama_supplier}</td>
      <td>${s.telepon ?? '-'}</td>
      <td>${s.alamat ?? '-'}</td>
      <td>
        <button class="btn-edit" onclick='editSupplier(${JSON.stringify(s)})'>Edit</button>
        <button class="btn-danger" onclick="hapusSupplier(${s.id_supplier})">Hapus</button>
      </td>
    </tr>
  `).join('');
  status.textContent = data.length
    ? `${data.length} data supplier berhasil dimuat.`
    : 'Belum ada data pada tabel supplier di Supabase.';
}

async function simpanSupplier() {
  const id = document.getElementById('supplier-id').value;
  const nama_supplier = document.getElementById('supplier-nama').value.trim();
  const telepon = document.getElementById('supplier-telepon').value.trim();
  const alamat = document.getElementById('supplier-alamat').value.trim();
  const status = document.getElementById('status-supplier');

  if (!nama_supplier) {
    status.textContent = 'Nama supplier wajib diisi.';
    return;
  }

  const payload = { nama_supplier, telepon, alamat };

  let error;
  if (id) {
    ({ error } = await supabaseClient.from('supplier').update(payload).eq('id_supplier', id));
  } else {
    ({ error } = await supabaseClient.from('supplier').insert(payload));
  }

  if (error) {
    status.textContent = 'Gagal: ' + error.message;
  } else {
    status.textContent = 'Berhasil disimpan.';
    resetSupplier();
    await loadSupplier();
    await loadProduk();
    await isiProdukDropdown();
    await loadRingkasan();
  }
}

function editSupplier(s) {
  document.getElementById('supplier-id').value = s.id_supplier;
  document.getElementById('supplier-nama').value = s.nama_supplier;
  document.getElementById('supplier-telepon').value = s.telepon ?? '';
  document.getElementById('supplier-alamat').value = s.alamat ?? '';
}

function resetSupplier() {
  document.getElementById('supplier-id').value = '';
  document.getElementById('supplier-nama').value = '';
  document.getElementById('supplier-telepon').value = '';
  document.getElementById('supplier-alamat').value = '';
}

async function hapusSupplier(id) {
  if (!confirm('Yakin hapus supplier ini?')) return;
  const { error } = await supabaseClient.from('supplier').delete().eq('id_supplier', id);
  if (error) {
    alert('Gagal hapus: ' + error.message);
    return;
  }

  await loadSupplier();
  await loadProduk();
  await isiProdukDropdown();
  await loadRingkasan();
}