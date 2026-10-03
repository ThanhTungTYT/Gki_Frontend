const input = document.querySelector(".input input");
const button = document.querySelector(".input button");
const popup = document.querySelector(".input");
const overlay = document.querySelector(".overlay");
const username = document.querySelector(".welcome h3");

button.addEventListener("click", function () {
    const name = input.value.trim();

    if (name !== "") {
        username.textContent = name;

        popup.style.display = "none";
        overlay.style.display = "none";
    }
});
