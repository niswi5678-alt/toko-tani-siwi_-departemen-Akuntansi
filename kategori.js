// ============================================
// CRUD KATEGORI
// ============================================

async function loadKategori() {
  const { data, error } = await supabaseClient
    .from('kategori')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    document.getElementById('status-kategori').textContent = 'Error: ' + error.message;
    return;
  }

  const tbody = document.getElementById('tbody-kategori');
  tbody.innerHTML = data.map(k => `
    <tr>
      <td>${k.id}</td>
      <td>${k.nama_kategori}</td>
      <td>${k.deskripsi ?? '-'}</td>
      <td>
        <button class="btn-edit" onclick='editKategori(${JSON.stringify(k)})'>Edit</button>
        <button class="btn-danger" onclick="hapusKategori(${k.id})">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function simpanKategori() {
  const id = document.getElementById('kategori-id').value;
  const nama_kategori = document.getElementById('kategori-nama').value.trim();
  const deskripsi = document.getElementById('kategori-deskripsi').value.trim();
  const status = document.getElementById('status-kategori');

  if (!nama_kategori) {
    status.textContent = 'Nama kategori wajib diisi.';
    return;
  }

  let error;
  if (id) {
    ({ error } = await supabaseClient
      .from('kategori')
      .update({ nama_kategori, deskripsi })
      .eq('id', id));
  } else {
    ({ error } = await supabaseClient
      .from('kategori')
      .insert({ nama_kategori, deskripsi }));
  }

  if (error) {
    status.textContent = 'Gagal: ' + error.message;
  } else {
    status.textContent = 'Berhasil disimpan.';
    resetKategori();
    await loadKategori();
    await isiDropdown();
  }
}

function editKategori(k) {
  document.getElementById('kategori-id').value = k.id;
  document.getElementById('kategori-nama').value = k.nama_kategori;
  document.getElementById('kategori-deskripsi').value = k.deskripsi ?? '';
}

function resetKategori() {
  document.getElementById('kategori-id').value = '';
  document.getElementById('kategori-nama').value = '';
  document.getElementById('kategori-deskripsi').value = '';
}

async function hapusKategori(id) {
  if (!confirm('Yakin hapus kategori ini?')) return;
  const { error } = await supabaseClient.from('kategori').delete().eq('id', id);
  if (error) alert('Gagal hapus: ' + error.message);
  await loadKategori();
  await isiDropdown();
}