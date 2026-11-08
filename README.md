# Website Coolio — Panduan Edit

Buka `index.html` langsung di browser (double-click). Tidak perlu install apa pun.

## Struktur file
| File | Isi |
|---|---|
| `index.html` | Semua teks & susunan section (Hero, Masalah, Solusi, Produk, Target, Pasar, Keunggulan, Bisnis, Roadmap, Investasi, Kontak) |
| `style.css` | Tampilan. **Warna utama ada di bagian `:root` paling atas** |
| `script.js` | Botol 3D, efek semprot, animasi. **Teks label botol ada di `CONFIG` paling atas** |
| `assets/coolio-mockup.jpg` | Foto mockup produk (ganti file dengan nama sama untuk update foto) |

## Yang perlu diisi sebelum pitching
Cari teks dalam kurung siku `[ ... ]` di `index.html` (ditandai garis putus-putus di website):
- Harga jual `Rp [XX].000` dan target margin `[XX]%`
- Nilai pendanaan `Rp [X] Miliar`
- Persentase penggunaan dana `[XX]%` — ubah juga `data-value="25"` di baris yang sama agar panjang bar sesuai
- Kontak: email, nomor WhatsApp, Instagram

Setelah diisi, hapus `class="edit-me"` agar garis putus-putus hilang.

## Edit cepat lainnya
- **Ganti warna**: ubah nilai di `:root` (`--sky-500`, `--pink`, `--lime`, dll.) pada `style.css`.
- **Ganti teks di label botol 3D**: ubah `CONFIG.label` di `script.js` (misal varian aroma baru).
- **Warna label botol 3D**: ubah `CONFIG.colors` di `script.js`.
- **Kecepatan putar botol**: `CONFIG.autoRotateSpeed` di `script.js`.
- **Menambah/menghapus section**: setiap section diberi komentar `<!-- ===== NAMA ===== -->` di `index.html`.

Data pasar bersumber dari The Report Cubes, *Indonesia Deodorants & Body Sprays Market Report and Forecast 2026–2034*.
