const worker_add = document.getElementById("add-worker-unass");
const worker_bar = document.getElementById("worker-bar");
const worker_zon = document.getElementById("zone-section");
const worker_form = document.getElementById("form-add-worker");
const close_form = document.getElementById("close-formule");
const add_experience = document.getElementById("experience-button");
const exprience_list = document.getElementById("experience-list");
const add_worker_info = document.getElementById("add-worker");
const side_bar_list = document.querySelector(".employee-lis");
const worker_card_div = document.getElementById("worker-card-div");
const modal_overlay = document.getElementById("modal-overlay");

let allWorkers = [];
let nextWorkerId = 1;

document.getElementById("image-preview").addEventListener("input", function (e) {
    const preview = document.getElementById("photo-preview");
    if (e.target.value) {
        preview.src = e.target.value;
    } else {
        preview.src = "https://placehold.co/100x100/3B82F6/FFFFFF?text=WS";
    }
});

function validateExperienceDates(startInput, endInput) {
    if (startInput.value && endInput.value) {
        const startDate = new Date(startInput.value);
        const endDate = new Date(endInput.value);

        if (startDate > endDate) {
            alert("La date de fin doit être postérieure à la date de début");
            endInput.value = "";
        }
    }
}

function getDefaultPhoto() {
    return "https://placehold.co/100x100/3B82F6/FFFFFF?text=WS";
}

worker_add.addEventListener("click", () => {
    worker_bar.style.opacity = "0.1";
    worker_zon.style.opacity = "0.1";
    worker_form.style.display = "block";
});

close_form.addEventListener("click", () => {
    worker_bar.style.opacity = "1";
    worker_zon.style.opacity = "1";
    worker_form.style.display = "none";
});

add_experience.addEventListener("click", () => {
    const exp_block = document.createElement("div");
    exp_block.className = "exp-block";
    exp_block.innerHTML = `
        <input type="text" placeholder="Nom de l'entreprise" class="exp_company">
        <input type="text" placeholder="Poste occupé" class="exp_position">
        <input type="date" class="exp_start">
        <input type="date" class="exp_end">
        <textarea placeholder="Description" class="exp_desc"></textarea>
        <button class="remove-exp" type="button">X</button>
        <hr>
    `;
    exprience_list.appendChild(exp_block);

    const startInput = exp_block.querySelector(".exp_start");
    const endInput = exp_block.querySelector(".exp_end");

    startInput.addEventListener("change", () => validateExperienceDates(startInput, endInput));
    endInput.addEventListener("change", () => validateExperienceDates(startInput, endInput));

    exp_block.querySelector(".remove-exp").addEventListener("click", () => exp_block.remove());
});

function validateForm(name, email, phone) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (name.length < 2) {
        alert("Le nom doit avoir au moins 2 caractères");
        return false;
    }
    if (!emailRegex.test(email)) {
        alert("Email invalide");
        return false;
    }
    if (!phoneRegex.test(phone)) {
        alert("Numéro de téléphone invalide");
        return false;
    }
    return true;
}

function canAssignToZone(workerRole, zoneName) {
    switch (zoneName) {
        case "Réception":
            return workerRole === "Réceptionniste" || workerRole === "Manager";
        case "Salle des serveurs":
            return workerRole === "Technicien IT" || workerRole === "Manager";
        case "Salle de sécurité":
            return workerRole === "Agent de sécurité" || workerRole === "Manager";
        case "Salle d'archives":
            return workerRole !== "Nettoyage" || workerRole === "Manager";
        default:
            return true;
    }
}

function isZoneFull(zoneElement) {
    const currentWorkers = zoneElement.querySelectorAll(".employer-cards").length;
    const zoneName = zoneElement.querySelector("h3").textContent;

    const limits = {
        "Salle de conférence": 3,
        "Réception": 1,
        "Salle des serveurs": 2,
        "Salle de sécurité": 2,
        "Salle du personnel": 4,
        "Salle d'archives": 2,
    };

    return currentWorkers >= (limits[zoneName] || 3);
}

function updateZonesAppearance() {
    document.querySelectorAll(".zone").forEach((zone) => {
        const currentWorkers = zone.querySelectorAll(".employer-cards").length;
        const zoneName = zone.querySelector("h3").textContent;

        zone.classList.remove("at-capacity", "over-capacity", "required-empty");


        const requiredZones = [
            "Réception",
            "Salle des serveurs",
            "Salle de sécurité",
            "Salle d'archives",
        ];
        const isRequired = requiredZones.includes(zoneName);

        if (isRequired && currentWorkers === 0) {
            zone.classList.add("required-empty");
        }


        const limitElement = zone.querySelector(".zone-limit");
        if (limitElement) {
            const limits = {
                "Salle de conférence": 3,
                "Réception": 1,
                "Salle des serveurs": 2,
                "Salle de sécurité": 2,
                "Salle du personnel": 4,
                "Salle d'archives": 2,
            };
            const max = limits[zoneName] || 3;
            limitElement.textContent = `${currentWorkers} / ${max}`;


            if (currentWorkers >= max) {
                zone.classList.add("at-capacity");
            }
        }
    });
}

function showModal(worker_info, experience) {
    let experienceHTML = "";
    if (experience.length > 0) {
        experienceHTML = "<h4>Expériences:</h4><ul>";
        experience.forEach((exp) => {
            experienceHTML += `<li><strong>${exp.exp_position}</strong> chez ${exp.exp_company} (${exp.exp_start} - ${exp.exp_end})<br/>${exp.exp_desc}</li>`;
        });
        experienceHTML += "</ul>";
    }

    worker_card_div.innerHTML = `
        <img src="${worker_info.worker_img}" class="worker-card-img" />
        <p class="worker-card-name">${worker_info.Name}</p>
        <p class="worker-card-role">${worker_info.worker_role}</p>
        <p class="worker-card-mail"><strong>Email:</strong> ${worker_info.worker_mail}</p>
        <p class="worker-card-nm"><strong>Téléphone:</strong> ${worker_info.worker_nm}</p>
        ${experienceHTML}
    `;
    modal_overlay.style.display = "flex";
}

add_worker_info.addEventListener("click", (e) => {
    e.preventDefault();

    const worker_name = document.getElementById("name").value.trim();
    const worker_role_select = document.getElementById("Role");
    const worker_role = worker_role_select.options[worker_role_select.selectedIndex].text;
    const worker_img = document.getElementById("image-preview").value.trim() || getDefaultPhoto();
    const worker_mail = document.getElementById("email").value.trim();
    const worker_nm = document.getElementById("worker-num").value.trim();

    if (!validateForm(worker_name, worker_mail, worker_nm)) {
        return;
    }

    const experience = [];
    document.querySelectorAll(".exp-block").forEach((block) => {
        experience.push({
            exp_company: block.querySelector(".exp_company").value,
            exp_position: block.querySelector(".exp_position").value,
            exp_start: block.querySelector(".exp_start").value,
            exp_end: block.querySelector(".exp_end").value,
            exp_desc: block.querySelector(".exp_desc").value,
        });
    });

    const worker_info = {
        id: nextWorkerId++,
        Name: worker_name,
        worker_role: worker_role,
        worker_img: worker_img,
        worker_mail: worker_mail,
        worker_nm: worker_nm,
        experience: experience,
    };

    allWorkers.push(worker_info);

    const card = document.createElement("div");
    card.className = "employer-cards";
    card.dataset.workerId = worker_info.id;

    const img = document.createElement("img");
    img.src = worker_img;
    img.className = "worker-img";

    const info = document.createElement("div");
    info.className = "employee-cpec";

    const nameEl = document.createElement("h5");
    nameEl.className = "worker-name";
    nameEl.textContent = worker_name;

    const roleEl = document.createElement("p");
    roleEl.className = "worker-job";
    roleEl.textContent = worker_role;

    info.append(nameEl, roleEl);
    card.append(img, info);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.className = "remove-worker";
    card.appendChild(removeBtn);

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        side_bar_list.appendChild(card);
        updateZonesAppearance();
    });

    card.addEventListener("click", () => showModal(worker_info, experience));

    side_bar_list.appendChild(card);

    updateZonesAppearance();

    worker_form.reset();
    exprience_list.innerHTML = "";

    worker_bar.style.opacity = "1";
    worker_zon.style.opacity = "1";
    worker_form.style.display = "none";
});

document.querySelectorAll(".assign-worker").forEach((button) => {
    button.addEventListener("click", function () {
        const zone = this.closest(".zone");
        const zoneName = zone.querySelector("h3").textContent;

        const workersAlreadyInZone = Array.from(
            zone.querySelectorAll("[data-worker-id]")
        ).map(el => el.dataset.workerId);

        const eligibleWorkers = allWorkers.filter(
            worker =>
                canAssignToZone(worker.worker_role, zoneName) &&
                !workersAlreadyInZone.includes(worker.id)
        );

        if (eligibleWorkers.length === 0) {
            alert("Aucun employé éligible pour cette zone");
            return;
        }
        for(const worker of eligibleWorkers){
        if (isZoneFull(zone)) {
            alert("Cette zone est pleine!");
            return;
        }

        const workerCard = document.querySelector(
            `[data-worker-id="${worker.id}"]`
        );

        if (workerCard) {
            zone.appendChild(workerCard);
        }
        }
        updateZonesAppearance();
    });
});

modal_overlay.addEventListener("click", (e) => {
    if (e.target === modal_overlay) modal_overlay.style.display = "none";
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal_overlay.style.display = "none";
});

updateZonesAppearance();