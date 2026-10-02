// ============================================
// backend/app.js
// API helper untuk Supabase Postgres
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API = {
  // ---------- KATEGORI ----------
  kategori: {
    list:   ()        => supabaseClient.from('kategori').select('*').order('id'),
    create: (payload) => supabaseClient.from('kategori').insert(payload),
    update: (id, p)   => supabaseClient.from('kategori').update(p).eq('id', id),
    remove: (id)      => supabaseClient.from('kategori').delete().eq('id', id),
  },

  // ---------- SUPPLIER ----------
  supplier: {
    list: () => supabase.from('supplier').select('*').order('id_supplier', { ascending: true }),
    create: (payload) => supabase.from('supplier').insert(payload),
    update: (id, payload) => supabase.from('supplier').update(payload).eq('id_supplier', id),
    remove: (id) => supabase.from('supplier').delete().eq('id_supplier', id)
  },

  produk: {
    list: () => supabase
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
      .order('id_produk', { ascending: true }),
    create: (payload) => supabase.from('produk').insert(payload),
    update: (id, payload) => supabase.from('produk').update(payload).eq('id_produk', id),
    remove: (id) => supabase.from('produk').delete().eq('id_produk', id)
  },

  transaksiMasuk: {
    list: () => supabase
      .from('transaksi_masuk')
      .select(`
        id_masuk,
        tanggal,
        jumlah,
        harga_beli,
        total,
        produk:id_produk (id_produk, kode_produk, nama_produk)
      `)
      .order('id_masuk', { ascending: false }),
    create: (payload) => supabase.from('transaksi_masuk').insert(payload),
    remove: (id) => supabase.from('transaksi_masuk').delete().eq('id_masuk', id)
  },

  transaksiKeluar: {
    list: () => supabase
      .from('transaksi_keluar')
      .select(`
        id_keluar,
        tanggal,
        jumlah,
        harga_jual,
        total,
        produk:id_produk (id_produk, kode_produk, nama_produk)
      `)
      .order('id_keluar', { ascending: false }),
    create: (payload) => supabase.from('transaksi_keluar').insert(payload),
    remove: (id) => supabase.from('transaksi_keluar').delete().eq('id_keluar', id)
  }
};

module.exports = { supabase, API };