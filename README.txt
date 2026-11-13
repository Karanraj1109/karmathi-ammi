KARUMATHI — DIGITAL FAMILY INVITATION

CARA MENJALANKAN
1. Ekstrak folder/ZIP ke komputer atau HP.
2. Buka index.html menggunakan browser.
3. Website berjalan tanpa backend dan tanpa proses instalasi.

CARA MENGGANTI DETAIL UNDANGAN
Buka script.js. Di bagian paling atas ada objek CONFIG.
Ganti nilai berikut:
- deceasedName: nama mendiang
- familyName: nama keluarga yang mengundang
- eventDate: tanggal format YYYY-MM-DD (kosongkan jika belum ada)
- eventTime: jam acara
- venue: nama tempat
- address: alamat lengkap
- mapsUrl: opsional, tautan Google Maps langsung
- musicFile: opsional, lokasi file musik

FOTO MENDIANG
Letakkan foto keluarga dengan nama nenek.jpg di folder assets.
Gunakan foto yang sudah mendapat persetujuan keluarga.

MUSIK
Jika ingin musik latar, letakkan file audio yang boleh digunakan di assets/ambient.mp3.
Musik hanya dimulai setelah pengunjung menekan tombol Buka Undangan.
Jika file musik tidak tersedia, kontrol musik akan disembunyikan ketika browser mendeteksi file tidak dapat dimuat.

CATATAN
Countdown mengikuti jam acara jika eventTime diisi dengan format seperti 09.00 atau 09:00. Jika jam belum diisi, hitung mundur menuju awal tanggal acara.
Font Google akan dimuat saat perangkat terhubung ke internet; font sistem tetap menjadi fallback.
