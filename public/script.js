document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

document.addEventListener("keydown", function (event) {
    if (
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.shiftKey && event.key === "J") || event.key === "F12"
    ) {
        event.preventDefault();
    }
});
