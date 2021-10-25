const submit = document.getElementById("submit");

submit.addEventListener("click", () => {
  let password = document.getElementById("password").value;
  let username = document.getElementById("username").value;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/connect");

  xhr.onload = () => {
    if (xhr.response == "Ok") {
      document.location.pathname = "/";
    } else {
      document.getElementById("err").innerHTML = xhr.response;
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({username, password}));
})