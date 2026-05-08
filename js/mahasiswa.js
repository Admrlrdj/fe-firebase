// 1. Inisialisasi Firebase (Ganti config ini dengan yang ada di Firebase Console kamu!)
const firebaseConfig = {
    apiKey: "AIzaSyA_aa2YBgolnHljOL0DtN6roBoqS5UpHlU",
    authDomain: "fe-firebase-6d8d6.firebaseapp.com",
    projectId: "fe-firebase-6d8d6",
    storageBucket: "fe-firebase-6d8d6.firebasestorage.app",
    messagingSenderId: "542790608011",
    appId: "1:542790608011:web:c312155c934a398b65a08e",
    measurementId: "G-YMDL08BHJB"
};

// Pastikan firebase belum diinisialisasi sebelumnya
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

$(document).ready(function () {
    // === READ: Mengambil Data ===
    function loadMahasiswa() {
        $('#mahasiswa-table-body').html('<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>');

        db.collection("mahasiswa").get().then((querySnapshot) => {
            var html = '';
            querySnapshot.forEach((doc) => {
                const mahasiswa = doc.data();
                const id = doc.id; // ID unik dari Firestore

                html += `<tr data-id="${id}">
                    <td>${mahasiswa.nim}</td>
                    <td>${mahasiswa.nama}</td>
                    <td>${mahasiswa.jenis_kelamin}</td>
                    <td>${mahasiswa.usia}</td>
                    <td>${mahasiswa.prodi ? mahasiswa.prodi.nama : '-'}</td>
                    <td>
                        <button class="btn btn-primary edit"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger delete"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                </tr>`;
            });

            if (html === '') {
                html = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
            }
            $('#mahasiswa-table-body').html(html);
        }).catch((error) => {
            console.error("Error: ", error);
            $('#mahasiswa-table-body').html('<tr><td colspan="6" class="text-center">Error loading data</td></tr>');
        });
    }

    loadMahasiswa();

    // === CREATE: Menambah Data ===
    // Asumsi form di dalam modal index.html memiliki ID #add-mahasiswa-form
    $('#add-mahasiswa-form').on('submit', function (e) {
        e.preventDefault();
        const payload = {
            nim: $('#add-nim').val(),
            nama: $('#add-nama').val(),
            jenis_kelamin: $('#add-jk').val(),
            usia: parseInt($('#add-usia').val()),
            prodi: {
                kode: $('#add-prodi').val(),
                nama: $('#add-prodi option:selected').text()
            }
        };

        db.collection("mahasiswa").add(payload).then(() => {
            alert("Data berhasil ditambah!");
            $('#mahasiswaModal').modal('hide'); // Tutup modal
            this.reset(); // Reset form
            loadMahasiswa(); // Refresh tabel
        }).catch((error) => {
            alert("Gagal menambah data");
            console.error(error);
        });
    });

    // === DELETE: Menghapus Data ===
    $('#mahasiswa-table-body').on('click', '.delete', function () {
        const id = $(this).closest('tr').data('id');
        if (confirm('Apakah anda yakin ingin menghapus data ini?')) {
            db.collection("mahasiswa").doc(id).delete().then(() => {
                $(this).closest('tr').remove();
            }).catch((err) => {
                alert('Gagal menghapus data');
                console.error(err);
            });
        }
    });

    // === NAVIGASI EDIT ===
    $('#mahasiswa-table-body').on('click', '.edit', function () {
        const id = $(this).closest('tr').data('id');
        window.location.href = 'edit.html?id=' + id;
    });

    // ==========================================
    // EXPORT PDF DENGAN APDF.IO
    // ==========================================
    $('#pdf').on('click', function () {
        const btn = $(this);
        const originalText = btn.html();
        btn.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        btn.prop('disabled', true);

        // Ambil data baris tabel, abaikan kolom "Aksi" (tombol edit/delete)
        let tableRows = '';
        $('#mahasiswa-table-body tr').each(function () {
            // Pastikan baris ini adalah baris data yang valid (bukan loading/error)
            if ($(this).find('td').length >= 5) {
                tableRows += '<tr>';
                tableRows += '<td>' + $(this).find('td').eq(0).text() + '</td>';
                tableRows += '<td>' + $(this).find('td').eq(1).text() + '</td>';
                tableRows += '<td>' + $(this).find('td').eq(2).text() + '</td>';
                tableRows += '<td>' + $(this).find('td').eq(3).text() + '</td>';
                tableRows += '<td>' + $(this).find('td').eq(4).text() + '</td>';
                tableRows += '</tr>';
            }
        });

        // Template HTML yang akan dikirim ke aPDF
        const htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                h2 { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #333; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>Laporan Data Mahasiswa</h2>
            <table>
                <thead>
                    <tr>
                        <th>NIM</th>
                        <th>Nama</th>
                        <th>Jenis Kelamin</th>
                        <th>Usia</th>
                        <th>Program Studi</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>`;

        const formData = new FormData();
        formData.append('html', htmlContent);

        // Panggil API aPDF.io
        fetch('https://apdf.io/api/pdf/file/create', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer TOKEN_APDF_KAMU' // TODO: Masukkan API Token dari aPDF.io
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error('Gagal generate PDF dari aPDF.io');
                return response.blob();
            })
            .then(blob => {
                // Trigger download otomatis
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Data_Mahasiswa.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            })
            .catch(error => {
                console.error(error);
                alert('Gagal mengekspor PDF');
            })
            .finally(() => {
                btn.html(originalText);
                btn.prop('disabled', false);
            });
    });

    // ==========================================
    // EXPORT EXCEL DENGAN DOCUMENTERO
    // ==========================================
    $('#excel').on('click', function () {
        const btn = $(this);
        const originalText = btn.html();
        btn.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        btn.prop('disabled', true);

        // Siapkan array data untuk dikirim ke format JSON (dibaca oleh Documentero)
        const mahasiswaData = [];
        $('#mahasiswa-table-body tr').each(function () {
            if ($(this).find('td').length >= 5) {
                mahasiswaData.push({
                    nim: $(this).find('td').eq(0).text(),
                    nama: $(this).find('td').eq(1).text(),
                    jenis_kelamin: $(this).find('td').eq(2).text(),
                    usia: $(this).find('td').eq(3).text(),
                    prodi: $(this).find('td').eq(4).text()
                });
            }
        });

        // Payload yang diterima oleh Documentero API
        const payload = {
            document: "9svB1v9mDFecFdmgxj3f", // TODO: Masukkan ID Template Excel dari dashboard Documentero
            apiKey: "ELGCRTA-JKLUZGA-X5MENGQ-XQJDBFY", // TODO: Masukkan API Key dari Documentero
            format: "xlsx",
            data: {
                mahasiswa_list: mahasiswaData
            }
        };

        // Panggil API Documentero
        fetch('https://app.documentero.com/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(result => {
                // Documentero umumnya mereturn format base64
                if (result.data) {
                    const link = document.createElement('a');
                    link.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + result.data;
                    link.download = 'Data_Mahasiswa.xlsx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    throw new Error('Gagal mendapatkan respon file dari Documentero');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Gagal mengekspor Excel');
            })
            .finally(() => {
                btn.html(originalText);
                btn.prop('disabled', false);
            });
    });
});