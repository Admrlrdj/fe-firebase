$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (!idParam) {
        alert("ID tidak valid!");
        window.location.href = 'index.html';
        return;
    }

    const actualId = atob(decodeURIComponent(idParam));

    $.ajax({
        url: 'http://127.0.0.1:8000/api/mahasiswa/' + actualId,
        method: 'GET',
        success: function (data) {
            $('#nim').val(data.nim);
            $('#nama').val(data.nama);
            $('#jenis_kelamin').val(data.jenis_kelamin);
            $('#usia').val(data.usia);

            $('#prodi_id').html(`<option value="${data.prodi.kode}" selected>${data.prodi.nama}</option>`);
        },
        error: function () {
            alert("Data tidak ditemukan");
        }
    });

    $('#edit-form').on('submit', function (e) {
        e.preventDefault();

        const payload = {
            nim: $('#nim').val(),
            nama: $('#nama').val(),
            jenis_kelamin: $('#jenis_kelamin').val(),
            usia: $('#usia').val(),
            prodi_kode: $('#prodi_id').val()
        };

        $.ajax({
            url: 'http://127.0.0.1:8000/api/mahasiswa/' + actualId,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {
                alert('Berhasil diupdate!');
                window.location.href = 'index.html';
            },
            error: function (err) {
                alert('Gagal update data');
                console.error(err);
            }
        });
    });
});