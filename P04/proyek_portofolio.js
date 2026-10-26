// Nama file: proyek_portofolio.js
// Fungsi: Mengelola proyek portofolio Aprilia Fauziah.

// ==========================================
// 1. DATA AWAL PROYEK
// ==========================================

// Menyimpan seluruh proyek dalam array.
// Perubahan data berlaku selama halaman masih terbuka.
const projects = [
    {
        id: 1,
        title: "Sistem Inventaris Keuangan",
        category: "Web App",
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Sistem Kasir Digital POS",
        category: "Desktop App",
        budget: 5000000,
        completed: true
    },
    {
        id: 3,
        title: "Landing Page Profil Perusahaan",
        category: "Web App",
        budget: 1500000,
        completed: false
    },
    {
        id: 4,
        title: "Aplikasi Presensi GPS Mobile",
        category: "Mobile App",
        budget: 4500000,
        completed: false
    }
];

// Daftar kategori untuk pilihan pada formulir edit.
const categories = [
    "Web App",
    "Mobile App",
    "Desktop App",
    "UI/UX Design"
];

// Menyimpan kategori filter yang sedang dipilih.
let selectedCategory = "Semua";


// ==========================================
// 2. MENGAMBIL ELEMEN HTML
// ==========================================

// Elemen formulir tambah proyek.
const projectForm = document.getElementById("project-form");
const titleInput = document.getElementById("project-title");
const categoryInput = document.getElementById("project-category");
const budgetInput = document.getElementById("project-budget");
const completedInput = document.getElementById("project-completed");

// Elemen pencarian, daftar proyek, dan tombol filter.
const searchInput = document.getElementById("project-search");
const projectList = document.getElementById("project-list");
const filterButtons = document.querySelectorAll(".btn-filter");

// Elemen pesan kesalahan dan pemberitahuan.
const formError = document.getElementById("form-error");
const actionMessage = document.getElementById("action-message");


// ==========================================
// 3. FUNGSI PEMBANTU
// ==========================================

// Mengubah angka menjadi teks mata uang rupiah.
const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 2
    }).format(angka);
};

// Membuat elemen HTML dengan class dan teks.
// textContent menjaga judul pengguna tetap ditampilkan sebagai teks.
const createElement = (tag, className = "", text = "") => {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;

    return element;
};

// Membuat tombol dan memasangkan tindakan ketika diklik.
const createButton = (text, className, onClick) => {
    const button = createElement("button", className, text);

    // Tombol biasa tidak mengirim formulir.
    button.type = "button";

    // Menjalankan fungsi yang diberikan ketika tombol diklik.
    button.addEventListener("click", onClick);

    return button;
};


// ==========================================
// 4. STATISTIK SELURUH PROYEK
// ==========================================

// Menghitung ulang statistik dari seluruh array.
const updateStats = () => {
    // Menghitung jumlah proyek.
    const totalProjects = projects.length;

    // Menghitung proyek dengan status selesai.
    const completedProjects = projects.filter((project) => {
        return project.completed;
    }).length;

    // Menjumlahkan seluruh anggaran mulai dari angka 0.
    const totalBudget = projects.reduce((total, project) => {
        return total + project.budget;
    }, 0);

    // Menampilkan hasil perhitungan ke HTML.
    document.getElementById("stat-total-projects").textContent =
        totalProjects;

    document.getElementById("stat-completed-projects").textContent =
        completedProjects;

    document.getElementById("stat-total-budget").textContent =
        formatRupiah(totalBudget);
};


// ==========================================
// 5. MENAMPILKAN KARTU PROYEK
// ==========================================

// Menggambar kartu berdasarkan daftar proyek yang diberikan.
const renderProjects = (dataList) => {
    // Menghapus tampilan lama sebelum membuat tampilan terbaru.
    projectList.replaceChildren();

    // Menampilkan pesan jika tidak ada proyek yang dapat ditampilkan.
    if (dataList.length === 0) {
        const text = projects.length === 0
            ? "Belum ada proyek. Silakan tambahkan proyek baru."
            : "Tidak ada proyek yang sesuai dengan pencarian dan kategori.";

        const emptyMessage = createElement(
            "p",
            "empty-message",
            text
        );

        projectList.append(emptyMessage);

        // Menghentikan fungsi karena daftar kosong.
        return;
    }

    // Membuat satu kartu untuk setiap proyek.
    dataList.forEach((project) => {
        const card = createElement("article", "project-card");

        // Menampilkan kategori dan judul.
        const category = createElement(
            "p",
            "project-category",
            project.category
        );

        const title = createElement("h3", "", project.title);

        // Menampilkan anggaran dengan format rupiah.
        const budget = createElement(
            "p",
            "",
            `Estimasi anggaran: ${formatRupiah(project.budget)}`
        );

        // Menentukan warna dan tulisan status.
        const statusClass = project.completed
            ? "badge badge-success"
            : "badge badge-pending";

        const statusText = project.completed
            ? "Selesai"
            : "Dalam Pengerjaan";

        const status = createElement(
            "span",
            statusClass,
            statusText
        );

        // Membuat wadah tombol pada kartu.
        const actions = createElement("div", "card-actions");

        // Membuka formulir edit di dalam kartu ini.
        const editButton = createButton(
            "Edit Proyek",
            "btn-status",
            () => editProject(project.id, card)
        );

        // Mengubah status selesai tanpa membuka formulir.
        const statusButton = createButton(
            "Ubah Status",
            "btn-status",
            () => toggleStatus(project.id)
        );

        // Menghapus proyek berdasarkan ID.
        const deleteButton = createButton(
            "Hapus Proyek",
            "btn-delete",
            () => deleteProject(project.id)
        );

        // Menyusun tombol pada kartu.
        actions.append(editButton, statusButton, deleteButton);

        // Menyusun seluruh isi kartu.
        card.append(category, title, budget, status, actions);

        // Menambahkan kartu ke halaman.
        projectList.append(card);
    });
};


// ==========================================
// 6. PENCARIAN DAN FILTER KATEGORI
// ==========================================

// Memperbarui tampilan berdasarkan pencarian dan kategori.
const refreshDisplay = () => {
    // Menyamakan teks pencarian menjadi huruf kecil.
    const keyword = searchInput.value.trim().toLowerCase();

    // Menyaring proyek menggunakan dua kondisi sekaligus.
    const filteredProjects = projects.filter((project) => {
        // Memeriksa kecocokan nama proyek.
        const matchesSearch = project.title
            .toLowerCase()
            .includes(keyword);

        // Memeriksa kecocokan kategori.
        const matchesCategory =
            selectedCategory === "Semua" ||
            project.category === selectedCategory;

        // Proyek harus memenuhi kedua kondisi.
        return matchesSearch && matchesCategory;
    });

    // Menggambar hasil pencarian dan kategori.
    renderProjects(filteredProjects);

    // Statistik tetap menghitung seluruh proyek.
    updateStats();
};


// ==========================================
// 7. MENGUBAH STATUS
// ==========================================

// Mengubah status satu proyek berdasarkan ID.
const toggleStatus = (id) => {
    // Mencari objek proyek yang sesuai.
    const project = projects.find((item) => item.id === id);

    // Berhenti jika ID tidak ditemukan.
    if (!project) return;

    // Membalik true menjadi false atau sebaliknya.
    project.completed = !project.completed;

    // Memperbarui kartu dan statistik.
    refreshDisplay();

    // Menampilkan hasil tindakan.
    actionMessage.textContent =
        `Status "${project.title}" menjadi ` +
        (project.completed ? "Selesai." : "Dalam Pengerjaan.");
};


// ==========================================
// 8. MENGHAPUS PROYEK
// ==========================================

// Menghapus satu proyek berdasarkan ID.
const deleteProject = (id) => {
    // Mencari posisi proyek di array.
    const index = projects.findIndex((item) => item.id === id);

    // -1 berarti proyek tidak ditemukan.
    if (index === -1) return;

    // Menyimpan judul sebelum proyek dihapus.
    const deletedTitle = projects[index].title;

    // Menghapus satu objek pada posisi yang ditemukan.
    projects.splice(index, 1);

    // Memperbarui kartu dan statistik.
    refreshDisplay();

    // Menampilkan pemberitahuan.
    actionMessage.textContent =
        `Proyek "${deletedTitle}" berhasil dihapus.`;
};


// ==========================================
// 9. EDIT LANGSUNG PADA KARTU
// ==========================================

// Membuka formulir edit pada kartu yang dipilih.
const editProject = (id, card) => {
    // Mencari proyek yang akan diperbaiki.
    const project = projects.find((item) => item.id === id);

    // Berhenti jika proyek tidak ditemukan.
    if (!project) return;

    // Membuat formulir edit dengan validasi JavaScript.
    const form = document.createElement("form");
    form.noValidate = true;

    // Menampilkan judul formulir edit.
    const heading = createElement("h3", "", "Edit Proyek");

    // Membungkus label dan input menjadi satu kelompok.
    const createField = (labelText, input) => {
        const group = createElement("div", "form-group");
        const label = document.createElement("label");

        // Input diletakkan di dalam label agar keduanya terhubung.
        label.append(document.createTextNode(labelText), input);
        group.append(label);

        return group;
    };

    // Membuat input judul dengan data lama.
    const titleEdit = document.createElement("input");
    titleEdit.type = "text";
    titleEdit.value = project.title;
    titleEdit.required = true;

    // Membuat pilihan kategori.
    const categoryEdit = document.createElement("select");

    // Memasukkan setiap kategori ke dropdown.
    categories.forEach((categoryName) => {
        const option = document.createElement("option");

        option.value = categoryName;
        option.textContent = categoryName;

        categoryEdit.append(option);
    });

    // Menampilkan kategori proyek saat ini sebagai pilihan awal.
    categoryEdit.value = project.category;

    // Membuat input anggaran dengan data lama.
    const budgetEdit = document.createElement("input");
    budgetEdit.type = "number";
    budgetEdit.min = "0.01";
    budgetEdit.step = "0.01";
    budgetEdit.value = project.budget;
    budgetEdit.required = true;

    // Membuat checkbox sesuai status proyek saat ini.
    const completedEdit = document.createElement("input");
    completedEdit.type = "checkbox";
    completedEdit.checked = project.completed;

    // Membungkus checkbox beserta keterangannya.
    const completedGroup = createElement(
        "label",
        "checkbox-group"
    );

    completedGroup.append(
        completedEdit,
        document.createTextNode("Sudah Selesai")
    );

    // Menyiapkan tempat pesan validasi edit.
    const error = createElement("p", "error");
    error.setAttribute("role", "alert");

    // Membuat wadah tombol formulir edit.
    const buttons = createElement("div", "card-actions");

    // Tombol Simpan mengirim formulir edit.
    const saveButton = createElement(
        "button",
        "btn-primary",
        "Simpan"
    );

    saveButton.type = "submit";

    // Batal menampilkan kembali kartu tanpa mengubah data.
    const cancelButton = createButton(
        "Batal",
        "",
        () => refreshDisplay()
    );

    // Memasukkan tombol ke wadah.
    buttons.append(saveButton, cancelButton);

    // Menyusun seluruh isi formulir edit.
    form.append(
        heading,
        createField("Judul Proyek", titleEdit),
        createField("Kategori", categoryEdit),
        createField("Estimasi Anggaran (Rp)", budgetEdit),
        completedGroup,
        error,
        buttons
    );

    // Menyimpan perubahan ketika formulir edit dikirim.
    form.addEventListener("submit", (event) => {
        // Mencegah halaman dimuat ulang.
        event.preventDefault();

        // Menghapus pesan kesalahan sebelumnya.
        error.textContent = "";

        // Membaca judul dan anggaran terbaru.
        const newTitle = titleEdit.value.trim();
        const newBudget = Number(budgetEdit.value);

        // Menolak judul kosong.
        if (newTitle === "") {
            error.textContent = "Judul proyek wajib diisi.";
            titleEdit.focus();
            return;
        }

        // Menolak anggaran yang tidak valid.
        if (!Number.isFinite(newBudget) || newBudget <= 0) {
            error.textContent =
                "Anggaran harus berupa angka lebih besar dari 0.";

            budgetEdit.focus();
            return;
        }

        // Memperbarui objek lama tanpa menambahkan proyek baru.
        // ID proyek tetap sama.
        project.title = newTitle;
        project.category = categoryEdit.value;
        project.budget = newBudget;
        project.completed = completedEdit.checked;

        // Memperbarui kartu dan statistik setelah disimpan.
        refreshDisplay();

        // Filter tetap berlaku setelah data berubah.
        actionMessage.textContent =
            `Perubahan proyek "${newTitle}" berhasil disimpan. ` +
            "Jika kartu tidak terlihat, periksa pencarian dan kategori.";
    });

    // Mengganti tampilan kartu menjadi formulir edit.
    card.replaceChildren(form);

    // Menghapus pemberitahuan tindakan sebelumnya.
    actionMessage.textContent = "";

    // Mengarahkan kursor ke kolom judul.
    titleEdit.focus();
};


// ==========================================
// 10. MENAMBAHKAN PROYEK
// ==========================================

// Menangani pengiriman formulir tambah proyek.
projectForm.addEventListener("submit", (event) => {
    // Mencegah halaman dimuat ulang.
    event.preventDefault();

    // Membersihkan pesan sebelumnya.
    formError.textContent = "";
    actionMessage.textContent = "";

    // Membaca data dari formulir.
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const budget = Number(budgetInput.value);
    const completed = completedInput.checked;

    // Memastikan judul tidak kosong.
    if (title === "") {
        formError.textContent = "Judul proyek wajib diisi.";
        titleInput.focus();
        return;
    }

    // Memastikan anggaran berupa angka lebih besar dari nol.
    if (!Number.isFinite(budget) || budget <= 0) {
        formError.textContent =
            "Anggaran harus berupa angka lebih besar dari 0.";

        budgetInput.focus();
        return;
    }

    // Membuat ID dari waktu saat ini.
    let newId = Date.now();

    // Menghindari ID ganda jika waktu pembuatannya sama.
    while (projects.some((project) => project.id === newId)) {
        newId += 1;
    }

    // Membentuk objek proyek baru.
    const newProject = {
        id: newId,
        title: title,
        category: category,
        budget: budget,
        completed: completed
    };

    // Menambahkan proyek ke array.
    projects.push(newProject);

    // Mengosongkan formulir setelah berhasil ditambahkan.
    projectForm.reset();

    // Memperbarui daftar proyek dan statistik.
    refreshDisplay();

    // Menampilkan pemberitahuan.
    actionMessage.textContent =
        `Proyek "${title}" berhasil ditambahkan. ` +
        "Jika belum terlihat, periksa pencarian dan filter kategori.";

    // Menyiapkan kursor untuk menambah proyek berikutnya.
    titleInput.focus();
});


// ==========================================
// 11. EVENT PENCARIAN
// ==========================================

// Memperbarui daftar setiap kali isi pencarian berubah.
searchInput.addEventListener("input", () => {
    refreshDisplay();
});


// ==========================================
// 12. EVENT FILTER KATEGORI
// ==========================================

// Memasangkan tindakan klik untuk setiap tombol filter.
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        // Membaca kategori dari atribut data-category.
        selectedCategory = button.dataset.category;

        // Memperbarui penanda tombol yang dipilih.
        filterButtons.forEach((item) => {
            const isActive = item === button;

            // Menambahkan class active hanya pada tombol pilihan.
            item.classList.toggle("active", isActive);

            // Menyampaikan status pilihan kepada pembaca layar.
            item.setAttribute("aria-pressed", String(isActive));
        });

        // Menampilkan hasil kategori bersama pencarian.
        refreshDisplay();
    });
});


// ==========================================
// 13. MENAMPILKAN DATA AWAL
// ==========================================

// Dijalankan setelah seluruh fungsi dan event siap.
refreshDisplay();