function submitThis() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let subject = document.getElementById("subject").value;
  let message = document.getElementById("input-message").value;

  if (name == "") {
    return alert("Please enter your name");
  } else if (email == "") {
    return alert("Fill in your email");
  } else if (phone == "") {
    return alert("Fill in your phone too");
  } else if (message == "") {
    return alert("The message sir");
  }
  let emailPenerima = "admin@mail.com";
  let anchor = document.createElement("a");

  anchor.href = `mailto:${emailPenerima}?subject=${subject}&body=Hello my name  ${name}.  ${message}. Give me a call, ${phone}`;
  anchor.click();

  console.log(name);
  console.log(email);
  console.log(phone);
  console.log(subject);
  console.log(message);
}
