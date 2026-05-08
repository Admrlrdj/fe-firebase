$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const actualId = urlParams.get('id');

    if (!actualId) {
        alert("ID tidak valid!");
        window.location.href = 'index.html';
        return;
    }

    const db = firebase.firestore();

    // === GET SINGLE DATA: Mengambil data untuk form ===
    db.collection("mahasiswa").doc(actualId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            $('#nim').val(data.nim);
            $('#nama').val(data.nama);
            $('#jenis_kelamin').val(data.jenis_kelamin);
            $('#usia').val(data.usia);

            // Mengisi dropdown prodi
            if (data.prodi) {
                $('#prodi_id').html(`<option value="${data.prodi.kode}" selected>${data.prodi.nama}</option>`);
            }
        } else {
            alert("Data tidak ditemukan!");
            window.location.href = 'index.html';
        }
    });

    // === UPDATE: Menyimpan Perubahan ===
    $('#edit-form').on('submit', function (e) {
        e.preventDefault();

        const payload = {
            nim: $('#nim').val(),
            nama: $('#nama').val(),
            jenis_kelamin: $('#jenis_kelamin').val(),
            usia: parseInt($('#usia').val()),
            prodi: {
                kode: $('#prodi_id').val(),
                nama: $('#prodi_id option:selected').text()
            }
        };

        db.collection("mahasiswa").doc(actualId).update(payload).then(() => {
            alert('Berhasil diupdate!');
            window.location.href = 'index.html';
        }).catch((err) => {
            alert('Gagal update data');
            console.error(err);
        });
    });
});