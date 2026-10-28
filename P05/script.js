
// File: script.js

// Menjalankan kode setelah seluruh struktur HTML selesai dimuat.
document.addEventListener("DOMContentLoaded", () => {

    // 1. Mengambil elemen HTML yang dibutuhkan.
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const inputmax = document.querySelector("#inputmax");
    const todoList = document.querySelector("#todoList");

    // 2. Fungsi membaca dan menyimpan data ke LocalStorage.
    // Mengambil data tugas yang tersimpan atau mengembalikan array kosong.
    const getTasks = () =>
        JSON.parse(localStorage.getItem("todo_tasks")) || [];

    // Menyimpan daftar tugas ke LocalStorage dalam format JSON.
    const saveTasks = (tasks) =>
        localStorage.setItem("todo_tasks", JSON.stringify(tasks));

    // 3. Fungsi menampilkan daftar tugas ke layar.
    const renderTasks = () => {

        // Mengambil seluruh data tugas yang tersimpan.
        const tasks = getTasks();

        // Mengosongkan tampilan daftar sebelum menampilkan data terbaru.
        todoList.innerHTML = "";

        // Memeriksa apakah belum ada tugas yang tersimpan.
        if (tasks.length === 0) {

            // Menampilkan pesan jika daftar tugas masih kosong.
            todoList.innerHTML = `
                <p style="text-align:center; color:#64748b; font-size:13px; padding:10px;">
                    Belum ada tugas tersimpan.
                </p>
            `;

            // Menghentikan fungsi karena tidak ada tugas yang ditampilkan.
            return;
        }

        // Mengulang setiap tugas untuk membuat elemen daftar.
        tasks.forEach((task, index) => {

            // Membuat elemen <li> untuk menampung satu tugas.
            const li = document.createElement("li");

            // Menambahkan class completed jika tugas sudah selesai.
            li.className = `todo-item ${task.completed ? "completed" : ""}`;

            // Membuat tampilan tugas beserta tombol Selesai/Batal dan Hapus.
            // data-index menunjukkan posisi tugas di dalam array.
            li.innerHTML = `
                <span class="todo-text">${task.text}</span>

                <div class="todo-actions">
                    <button class="action-btn complete-btn" data-index="${index}">
                        ${task.completed ? "Batal" : "Selesai"}
                    </button>

                    <button class="action-btn delete-btn" data-index="${index}">
                        Hapus
                    </button>
                </div>
            `;

            // Memasukkan elemen tugas ke dalam daftar HTML.
            todoList.appendChild(li);
        });
    };

    // 4. Menambahkan tugas saat formulir dikirim.
    todoForm.addEventListener("submit", (e) => {

        // Mencegah halaman dimuat ulang saat formulir dikirim.
        e.preventDefault();

        // Mengambil teks tugas dan menghapus spasi di awal serta akhir.
        const taskText = taskInput.value.trim();

        // Mengambil daftar tugas yang sudah tersimpan.
        const tasks = getTasks();

        // Validasi input: teks harus memiliki minimal 3 karakter.
        if (taskText.length < 3) {

            // Menambahkan tanda error pada kolom input.
            taskInput.classList.add("error");

            // Menampilkan pesan kesalahan input.
            inputError.style.display = "block";
            inputmax.style.display = "none";

            // Menghentikan proses penambahan tugas.
            return;
        }

        // Validasi jumlah tugas: maksimal 5 tugas.
        if (tasks.length >= 5) {

            // Menambahkan tanda error pada kolom input.
            taskInput.classList.add("error");

            // Menampilkan pesan jika jumlah tugas sudah mencapai batas.
            inputmax.style.display = "block";
            inputError.style.display = "none";

            // Menghentikan proses penambahan tugas.
            return;
        }

        // Jika input valid, hapus tanda error dan sembunyikan pesan.
        taskInput.classList.remove("error");
        inputError.style.display = "none";
        inputmax.style.display = "none";

        // Menambahkan tugas baru dengan status belum selesai.
        tasks.push({
            text: taskText,
            completed: false
        });

        // Menyimpan daftar tugas terbaru ke LocalStorage.
        saveTasks(tasks);

        // Mengosongkan kolom input setelah tugas berhasil ditambahkan.
        taskInput.value = "";

        // Memperbarui tampilan agar tugas baru langsung muncul.
        renderTasks();
    });

    // 5. Menangani klik tombol Selesai/Batal dan Hapus.
    // Event listener pada todoList menangani tombol yang dibuat secara dinamis.
    todoList.addEventListener("click", (e) => {

        // Mengambil indeks tugas dari atribut data-index tombol.
        const index = e.target.dataset.index;

        // Menghentikan proses jika elemen yang diklik bukan tombol tugas.
        if (index === undefined) return;

        // Mengambil daftar tugas dari LocalStorage.
        const tasks = getTasks();

        // Memeriksa apakah tombol yang diklik adalah Selesai atau Batal.
        if (e.target.classList.contains("complete-btn")) {

            // Membalik status tugas: selesai menjadi belum selesai atau sebaliknya.
            tasks[index].completed = !tasks[index].completed;

            // Menyimpan perubahan status tugas.
            saveTasks(tasks);

            // Memperbarui tampilan daftar tugas.
            renderTasks();

        // Memeriksa apakah tombol yang diklik adalah Hapus.
        } else if (e.target.classList.contains("delete-btn")) {

            // Menghapus tugas berdasarkan indeksnya di dalam array.
            tasks.splice(index, 1);

            // Menyimpan daftar tugas setelah penghapusan.
            saveTasks(tasks);

            // Memperbarui tampilan setelah tugas dihapus.
            renderTasks();
        }
    });

    // 6. Menampilkan daftar tugas saat halaman pertama kali dibuka.
    // Data yang tersimpan di LocalStorage akan ditampilkan kembali.
    renderTasks();

});
