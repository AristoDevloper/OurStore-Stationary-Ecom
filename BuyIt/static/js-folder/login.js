// Function to get CSRF token once
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }
  const csrftoken = getCookie('csrftoken');


let form = document.querySelector('.card')
form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (email.endsWith("@gmail.com") && password.length>=5){
    const body = {
      'email':email,
      'password':password
    }
    console.log("gmail.com is available");
    console.log(password)
    loginRequest(body)
  }
  else {
    console.log("missing gmil.com")
  }
});

async function loginRequest(body){
  let response = await fetch('/loggingIn/',{
    method:'POST',
    headers:{
      'Content-Type' : 'application/json',
      'X-CSRFToken':csrftoken,
    },
    body:JSON.stringify(body),
  })
  let data = await response.json();
  let datas = data;
  window.location.href = '/'
  return data
}