const scriptURL = 'https://script.google.com/macros/s/AKfycbzabHmuZ27cKL3kZg_KaALA99nhIEArzrT8g1EanGtwXqgfrIzCUp72xI9huTutTpji1A/exec';
        const form = document.getElementById('regis-form');

        form.addEventListener('submit', e => {
            e.preventDefault();

            // Tampilkan loading alert
            const loadingAlert = Swal.fire({
                title: 'Sedang diproses.',
                text: 'Mohon tunggu sebentar bestiee!.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData(form);

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(result => {
                    Swal.close(); // Menutup alert loading
                    if (result.result === 'success') {
                        Swal.fire({
                            title: "Berhasil",
                            text: "Data berhasil dikirim !!",
                            icon: "success"
                        });
                        form.reset();
                    } else {
                        throw new Error(result.error);
                    }
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    Swal.close(); // Menutup alert loading
                    Swal.fire({
                        title: "Terjadi Kesalahan!",
                        text: "Pendaftaran gagal. Silakan coba lagi.",
                        icon: "error"
                    });
                });
        });