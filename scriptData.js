const scriptURL = 'https://script.google.com/macros/s/AKfycbw26qVPCkfQOUBGK61Q2XCf0NCAYpjHzLoSfUEAeNGF9z_Z5icc7CVKaCCCd9lCjeO7/exec'; 
let fetchedData = [];

function formatTimestamp(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function fetchData() {
    Swal.fire({
        title: 'Loading Data...',
        text: 'Tunggu sebentar, sedang mengambil data!',
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(scriptURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = '';

            // Object to count total pendaftar per stasi
            const stasiCount = {};

            if (data.length === 0) {
                Swal.fire({
                    title: "Data Kosong",
                    text: "Tidak ada data yang ditemukan.",
                    icon: "info"
                });
            } else {
                fetchedData = data; // Save the fetched data for download later
                data.forEach(row => {
                    const newRow = tableBody.insertRow();
                    newRow.insertCell().textContent = formatTimestamp(row.timestamp) || ' ';
                    newRow.insertCell().textContent = row.nama || ' ';
                    newRow.insertCell().textContent = row.stasi || ' ';

                    if (row.stasi) {
                        stasiCount[row.stasi] = (stasiCount[row.stasi] || 0) + 1;
                    }
                });

                $('#data-table').DataTable(); 
                Swal.close();
                Swal.fire({
                    title: "SUKSES!!!!",
                    text: "Berhasil mengambil data !!",
                    icon: "success"
                });
                // Update stasi summary
                updateStasiSummary(stasiCount);
            }
        })
        .catch(error => {
            Swal.fire({
                title: "Error!",
                text: "Gagal mengambil data! " + error.message,
                icon: "error"
            });
        });
}

function updateStasiSummary(stasiCount) {
    const summaryDiv = document.getElementById('stasi-summary');
    summaryDiv.innerHTML = '<h3>Total Pendaftar berdasarkan Stasi:</h3>';
    const list = document.createElement('ul');
    for (const [stasi, count] of Object.entries(stasiCount)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${stasi.toUpperCase()}: ${count}`;
        list.appendChild(listItem);
    }
    summaryDiv.appendChild(list);
}

function confirmDownload() {
    if (fetchedData.length === 0) {
        Swal.fire({
            title: "Error!",
            text: "Tidak ada data untuk diunduh.",
            icon: "error"
        });
        return;
    }
    
    Swal.fire({
        title: 'Konfirmasi Unduhan',
        text: 'Apakah Anda yakin ingin mendownload data pendaftar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Download',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            downloadExcel();
        }
    });
}

function downloadExcel() {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ["Timestamp", "Nama", "Stasi"]
    ];

    fetchedData.forEach(row => {
        wsData.push([
            formatTimestamp(row.timestamp),
            row.nama || '',
            row.stasi || '',
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Data Pendaftaran");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([s2ab(wbout)], { type: "application/octet-stream" }));
    link.download = "data_pendaftaran.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}