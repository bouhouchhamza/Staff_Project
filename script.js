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

