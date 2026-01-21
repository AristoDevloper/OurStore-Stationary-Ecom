let fullName 
let phone 
let address 
const Fullname = document.getElementById('FullName')
const email = document.querySelector('.subtitle')

const editBtn = document.querySelector('.btn-save')
const errorShower = document.getElementById('error-shower')
const logoutBtn = document.querySelector('.btn-logout')

editBtn.addEventListener('click',async ()=>{
  fullName = document.getElementById('name').value;
  address = document.getElementById('address').value;
  phone = document.getElementById('number').value;

  if (phone.length === 10){
    const body = {
      fullName,
      address,
      phone,
      purpose:'Save-Changes'
    }

    await ProfileEdit(body)

  // Redirect to homepage after 3 seconds (3000 ms)
  setTimeout(() => {
    window.location.href = '/'; 
  }, 3000);
  }
  else{
    errorShower.innerHTML = 'Not Valid Number'
    errorShower.style.color = 'red'
  }
})


async function ProfileEdit(body){
  response = await fetch('/profile_edit/',{
    method:'POST',
    credentials:"same-origin",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(body)
  })
  const data = await response.json()
  const dataCopy = data
  renderProfileInfo(dataCopy)
}

async function ProfileInfoFetch(){
  response = await fetch('/profile_edit/',{
    method:'POST',
    credentials:"same-origin",
    headers:{
      'Content-Type':'application/json'
    },
    })
    const data = await response.json()
    const dataCopy = data
    renderProfileInfo(dataCopy)
  }
ProfileInfoFetch()

function renderProfileInfo(data){
  const {
    name:Name,
    phone:Phone,
    address:Address
  } = data;

  Fullname.innerHTML = Name,
  address = document.getElementById('address');
  fullName = document.getElementById('name');
  phone = document.getElementById('number');
  fullName.value = Name;
  address.value = Address;
  phone.value = Phone;
  
}

logoutBtn.addEventListener('click', async (e)=>{
  e.preventDefault();
  await fetch('/logout/',{
    method:'GET',
    credentials:"same-origin"
  }) 
  window.location.href = '/'
})