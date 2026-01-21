let username;
let email;
let password;
let password2;

let form =document.querySelector('.card');
form.addEventListener('submit',(e)=>{
  username = document.getElementsByName('username')[0].value;
  email = document.getElementsByName('email')[0].value;
  password = document.getElementsByName('password')[0].value;
  password2 = document.getElementsByName('password')[0].value;
  //console.log(username,email,password,password2)
  e.preventDefault();
  if(!email.endsWith('@gmail.com')){
    console.log()
  }
  else if(password!==password2){
    console.log()
  }
  else if(email.endsWith('@gmail.com') && password===password2){
    console.log("Its working");
    signUp({
      username,
      email,
      password
    })
  }
})


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


async function signUp(body){
  console.log("Function is working",body)
  response = await fetch('/signned-up/',{
    method:'POST',
    headers:{
      'Content-Type' : 'application/json',
      'X-CSRFToken':csrftoken
    },
    body:JSON.stringify(body)
  })
  window.location.href = '/myProfile/'
}