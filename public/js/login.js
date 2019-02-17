const username = document.getElementById('username');
const password = document.getElementById('password');
const button = document.getElementById('button');
const checkval = () => {
  if (username.value && password.value) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
};

username.oninput = () => checkval();
password.oninput = () => checkval();
