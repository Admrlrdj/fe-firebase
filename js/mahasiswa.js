$(document).ready(function () {
    // alert("Hello, world!");
    $.ajax({
        url: 'http://127.0.0.1:8000/api/mahasiswa/',
        method: 'GET',
        beforeSend: function () {
            $('#mahasiswa-table-body').html('<tr><td colspan="6"><i class="fas fa-spinner fa-spin"></i>Loading...</td></tr>');
        },
        success: function (data) {
            console.log(data);
            var html = '';
            $.each(data, function (index, mahasiswa) {
                html += '<tr data-id="' + encodeURIComponent(btoa(mahasiswa.id)) + '">';
                html += '<td>' + mahasiswa.nim + '</td>';
                html += '<td>' + mahasiswa.nama + '</td>';
                html += '<td>' + mahasiswa.jenis_kelamin + '</td>';
                html += '<td>' + mahasiswa.usia + '</td>';
                html += '<td>' + mahasiswa.prodi.nama + '</td>';
                html += '<td><button class="btn btn-primary edit"><i class="fas fa-edit"></i> Edit</button></td>';
                html += '<td><button class="btn btn-danger delete"><i class="fas fa-trash"></i> Delete</button></td>';
                html += '</tr>';
            });
            if (html === '') {
                html = '<tr><td colspan="6"><i class="fas fa-info-circle"></i> No data available</td></tr>';
            }
            $('#mahasiswa-table-body').html(html);
        },
        error: function (error) {
            // console.log(error);
            $('#mahasiswa-table-body').html('<tr><td colspan="6"><i class="fas fa-exclamation-triangle"></i> Error loading data</td></tr>');
        }
    });

    $('#mahasiswa-table-body').on('click', '.delete', function () {
        var id = $(this).closest('tr').data('id');
        if (confirm('Are you sure you want to delete this mahasiswa?')) {
            $.ajax({
                url: 'http://127.0.0.1:8000/api/mahasiswa/' + decodeURIComponent(atob(id)),
                method: 'DELETE',
                success: function () {
                    $('#mahasiswa-table-body').find('tr').each(function () {
                        if ($(this).data('id') === id) {
                            $(this).remove();
                        }
                    });
                },
                error: function (error) {
                    console.log(error);
                    alert('Error deleting mahasiswa');
                }
            });
        }
    });

    $('#mahasiswa-table-body').on('click', '.edit', function () {
        var id = $(this).closest('tr').data('id');
        window.location.href = 'edit.html?id=' + encodeURIComponent(id);
    });
});