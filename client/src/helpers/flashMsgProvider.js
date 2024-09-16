function showAndHide(element) {
  if (element) {
    element.style.opacity = "1"; // Ensure initial opacity is set
    element.style.display = "block";

    setTimeout(function () {
      element.style.opacity = "0";
      setTimeout(function () {
        element.style.display = "none";
      }, 1000);
    }, 3000);
  }
}

function flashSuccess(msg) {
  let successMessage = document.getElementById("manualflashSuccess");
  // let errorMessage = document.getElementById("manualflashSuccess");

  let SuccMsg = document.getElementById("SuccMsg");
  // let errMsg = document.getElementById("errMsg");
  if (SuccMsg) {
    SuccMsg.innerText = msg;
    showAndHide(successMessage);
  }
}

function flashError(msg) {
  // let successMessage = document.getElementById("manualflashSuccess");
  let errorMessage = document.getElementById("manualflashError");

  // let SuccMsg = document.getElementById("SuccMsg");
  let errMsg = document.getElementById("errMsg");
  if (errMsg) {
    errMsg.innerText = msg;
    showAndHide(errorMessage);
  }
}

export { flashError, flashSuccess };
