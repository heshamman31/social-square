page = document.head.getElementsByTagName('title')[0].innerHTML
setupUi()
const baseUrl = 'https://tarmeezacademy.com/api/v1'
let firstTime = true
let currentPage = 1
mainPageName = 'Social Square'
if(page == mainPageName){
  getPosts(1,true)
}

function toggleLoader(toggler){
  let loader = document.getElementById("loader")
  if(toggler){
    loader.style.visibility = "visible"
  }else{
    loader.style.visibility = "hidden"
  }
}


function getPosts(pageNamber=1,status){
  currentPage = pageNamber
  firstTime = status;
  toggleLoader(true)
  axios.get(`${baseUrl}/posts?limit=10&page=${pageNamber}`)
  .then(function (response) {
    response = response.data
    lastPage = response.meta.last_page
    const postsDiv = document.getElementById('posts')
    if(firstTime){
      postsDiv.innerHTML = '';
    }
    let user = JSON.parse(localStorage.getItem('user'))
    let editPostIcon = ''
    let deletePostIcon = ''
    let token = localStorage.getItem('token');
    for(post of response.data){
      if(user != null && token != null){
        if(post.author.id == user.id){
          editPostIcon = `<i class="fa-solid fa-pen-to-square" style="position: absolute; right: 20px; font-size: 24px; cursor: pointer;" title="Edit Post" data-bs-target="#editPostModal" data-bs-toggle="modal" onclick="getvalues('${post.body}',${post.id},'${post.image}')"></i>`
          deletePostIcon = `<i class="fa-solid fa-trash-can" style="position: absolute; right: 60px; font-size: 24px; cursor: pointer;" title="Delete Post" data-bs-target="#deletePostModal" data-bs-toggle="modal" onclick="getvalues('',${post.id})"></i>`
        }
        else{
          editPostIcon = ''
          deletePostIcon = ''
        }
      }else{
        editPostIcon = ''
        deletePostIcon = ''
      }
        postsDiv.innerHTML += `
                <div class="row row-cols-1 row-cols-md-3 g-4 col-12 col-lg-7  m-auto">
            <div class="card h-100 w-100 p-0">
              <div class="d-flex mt-1 align-items-center">
                <img style="width: 35px; height: 35px; cursor:pointer;" class="rounded-circle m-1 mx-2" src="${post.author.profile_image}" alt="" onclick="profileClicked(${post.author.id})">
              <h5 class="card-title mt-2" style="font-size: 18px;cursor:pointer;" onclick="profileClicked(${post.author.id})">${post.author.username}</h5>
              ${editPostIcon}
              ${deletePostIcon}
              </div>
              <img onclick="postClicked(${post.id})"  style="width: 100%; height: 400px; cursor: pointer;" class="rounded-top-2" src="${post.image}" class="card-img-top" alt="...">
              <div class="card-body pt-2">
                <p class="mb-2 fw-semibold" style="color: gray; font-size: 14px;">${post.created_at}</p>
                <p class="card-text fw-semibold" style="font-size: 14px;">${post.body}</p>
                <hr style="border-color: black;">
                <div class="d-flex align-items-center">
                  <i class="fa-solid fa-pen"></i>
                  <p onclick="postClicked(${post.id})" class="m-0 ms-1 fw-semibold" style="cursor: pointer"><span>(${post.comments_count})</span> comments</p>
                </div>
              </div>
            </div>
            
          </div>
        `
    }
  }).finally(()=>{
    toggleLoader(false)
  })
}

function createPost(){
  let postDescription = document.getElementById('post-description').value;
  let postImage = document.getElementById('post-image').files[0];
  let token = localStorage.getItem('token');
  let formData = new FormData()
  formData.append('body',postDescription)
  formData.append('image',postImage)
  toggleLoader(true)
  axios.post(`${baseUrl}/posts`, formData,{headers: {
    'Content-Type': 'multipart/form-data',
    'authorization': `Bearer ${token}`
  }})
  .then((response => {
    if(page == "profile"){
      profilePosts(id)
    }else{
      getPosts(1,true)
    }
    setupUi()
    showAlert('success','post created successfully!')
  })).catch((error => {
    showAlert('error',`${error.response.data.message}`)
  })).finally(()=>{
    toggleLoader(false)
  })
  document.getElementById('create-post-close-btn').click()
}
function login(){
    let loginUsernameinp = document.getElementById('loginUsername')
    let loginPasswordinp = document.getElementById('loginPassword')
    let bodyparams = {
        "username" : loginUsernameinp.value,
        "password" : loginPasswordinp.value
    }
      toggleLoader(true)
    axios.post((`${baseUrl}/login`),bodyparams)
    .then(function (response) {
        localStorage.setItem('token',response.data.token)
        localStorage.setItem('user',JSON.stringify(response.data.user))
        document.getElementById('login-close-btn').click()
        setupUi()
        if(page == mainPageName){
          getPosts(1,true)
        }
        showAlert('success','you logged in successfully!')
      }).catch((error => {
        showAlert('error',`${error.response.data.message}`)
      })).finally(()=>{
        toggleLoader(false)
      })
}
function register(){
    let registernameinp = document.getElementById('registerName').value
    let registerUsernameinp = document.getElementById('registerUsername').value
    let registerPasswordinp = document.getElementById('registerPassword').value
    let registerImage = document.getElementById('registerImage').files[0]
    
    let formData = new FormData();
    formData.append("name",registernameinp)
    formData.append("username",registerUsernameinp)
    formData.append("password",registerPasswordinp)
    formData.append("image",registerImage)
    toggleLoader(true)
    axios.post((`${baseUrl}/register`),formData)
    .then(function (response) {
        localStorage.setItem('token',response.data.token)
        localStorage.setItem('user',JSON.stringify(response.data.user))
        document.getElementById('register-close-btn').click()
        setupUi()
        if(page == mainPageName){
          getPosts(1,true)
        }
        showAlert('success','you registerd successfully!')
      }).catch((error => {
        showAlert('error',`${error.response.data.message}`)
      })).finally(()=>{
        toggleLoader(false)
      })
}

function logout(){
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  setupUi()
  if(page == mainPageName){
    getPosts(1,true)
  }
  showAlert('success','logged out')
}
function setupUi(){
  let token = localStorage.getItem('token');
  let navRegisterBtn = document.getElementById("nav-register-btn");
  let navLoginBtn = document.getElementById("nav-login-btn");
  let navLoginInfo = document.getElementById("login-info");
  let newPostBtn = document.getElementById("new-post-btn");
  if(token == null){
    navRegisterBtn.style.setProperty('display','block','important');
    navLoginBtn.style.setProperty('display','block','important');
    navLoginInfo.style.setProperty('display','none','important');
    if(newPostBtn != null){
      newPostBtn.style.setProperty('display','none','important');
    }
  }else{
    let user = JSON.parse(localStorage.getItem('user'))
    document.getElementById("user-img").src = user.profile_image ;
    document.getElementById("user-name").innerHTML = user.username;
    navRegisterBtn.style.setProperty('display','none','important');
    navLoginBtn.style.setProperty('display','none','important');
    navLoginInfo.style.setProperty('display','flex','important');
    if(newPostBtn != null){
      newPostBtn.style.setProperty('display','block','important');
    }
  }
}

function showAlert(type ,message){
  switch(type){
    case 'success' :
      setTimeout(()=>{

      document.getElementById('alerts-box').innerHTML ='' 
      document.getElementById('alerts-box').innerHTML += 
      `
      <div class="alert alert-success show fade" id="alert" style="width: fit-content; position: fixed; right: 20px; bottom: 20px; z-index: 99999; display: none;" role="alert">
    <i class="fa-solid fa-circle-check me-1"></i>
    ${message}
    </div>
`
      document.getElementById('alert').style.display= 'block'
    },400) ;
    break;
    case 'error' : 
    setTimeout(()=>{
      document.getElementById('alerts-box').innerHTML ='' 
      document.getElementById('alerts-box').innerHTML += 
      `
      <div class="alert alert-danger show fade" id="alert" style="width: fit-content; position: fixed; right: 20px; bottom: 20px; z-index: 99999; display: none;" role="alert">
    <i class="fa-solid fa-xmark"></i>
    ${message}
    </div>
`
      document.getElementById('alert').style.display= 'block'
    },400) ;
    ;
    break;
    case 'warnning' :   
    setTimeout(()=>{
      document.getElementById('alerts-box').innerHTML ='' 
      document.getElementById('alerts-box').innerHTML += 
      `
      <div class="alert alert-info show fade" id="alert" style="width: fit-content; position: fixed; right: 20px; bottom: 20px; z-index: 99999; display: none;" role="alert">
    <i class="fa-solid fa-circle-exclamation"></i>
    ${message}
    </div>
`
      document.getElementById('alert').style.display= 'block'
    },400) ;
    ;
    break;
  }
  setTimeout(() => {
    document.getElementById('alert').style.display= 'none'
  },2500)
}


let lastPage = 1
window.onscroll = function ds(){
  if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight -3 && currentPage < lastPage){
    currentPage++
    if(page == mainPageName){
      getPosts(currentPage,false)
    }
  }
}

function postClicked(postId){
  location.assign(`post_details.html?postId=${postId}`)
}
let id
if(page == 'post_details'){
  let urlParams = new URLSearchParams(window.location.search) 
  id = urlParams.get("postId")
  getOnePost(id)
}

function profileClicked(postId){
  location.assign(`profile.html?postId=${postId}`)
}

if(page == 'profile'){
  let urlParams = new URLSearchParams(window.location.search) 
  id = urlParams.get("postId")
  profileDetails(id)
  profilePosts(id)
}
function getOnePost(postID){
  toggleLoader(true)
  axios.get(`${baseUrl}/posts/${postID}`)
  .then(function (response) {
    response = response.data;
    const postsDiv = document.getElementById('posts')
    postsDiv.innerHTML = '';
    commentsContent = ``;
    for(comment of response.data.comments){
      commentsContent += `
                <div id="comment-box" class="py-2 border-bottom border-1 border-opacity-25 border-dark" >
            <div id="comment-header">
              <div class="d-flex">
                <img style="width: 35px; height: 35px; cursor: pointer;" class="rounded-circle m-1 ms-0 me-2" src="${comment.author.profile_image}" alt="" onclick="profileClicked(${comment.author.id})">
                <h5 class="card-title mt-2" style="font-size: 18px; cursor: pointer;" onclick="profileClicked(${comment.author.id})">${comment.author.username}</h5>
              </div>
            </div>
            <div id="comment-body" class="pt-1" style="font-size: 14px;">
              ${comment.body}
            </div>
          </div>
      `
    }
    postsDiv.innerHTML = `
                  <div class="row row-cols-1 row-cols-md-3 g-4 col-12 col-lg-7  m-auto">
                  <h2 style="padding: 0 ;color: white;">${response.data.author.username}'s post</h2>
            <div class="card h-100 w-100 p-0">
              <div class="d-flex mt-1">
                <img style="width: 35px; height: 35px; cursor:pointer;" class="rounded-circle m-1 mx-2" src="${response.data.author.profile_image}" alt="" onclick="profileClicked(${response.data.author.id})">
              <h5 class="card-title mt-2" style="font-size: 18px;cursor:pointer;" onclick="profileClicked(${response.data.author.id})">${response.data.author.username}</h5>
              </div>
              <img style="width: 100%; height: 400px;" class="rounded-top-2" src="${response.data.image}" class="card-img-top" alt="...">
              <div class="card-body pt-2">
                <p class="mb-2 fw-semibold" style="color: gray; font-size: 14px;">${response.data.created_at}</p>
                <p class="card-text fw-semibold" style="font-size: 14px;">${response.data.body}</p>
                <hr style="border-color: black;">
                <div class="d-flex align-items-center">
                  <i class="fa-solid fa-pen"></i>
                  <p class="m-0 ms-1 fw-semibold" style="cursor: pointer"><span>(${response.data.comments_count})</span> comments</p>
                </div>
              </div>
            </div>
            <div id="comments-div"class="m-0" style="border-radius: 5px; width: 100%; background-color: rgb(158 209 233);">
              ${commentsContent}
              <div id="add-comment" class="d-flex my-2">
            <textarea class="form-control"  id="add-comment-body" placeholder="add comment here.." style="height: 30px;padding: 5px;font-size: 14px; resize: none; scrollbar-width: 0;border-radius: 10px;outline: none;"></textarea>
            <button class="btn btn-outline-primary ms-2" onclick="addComment()">Send</button>
          </div>
            </div>
            
          </div>
        `
  }).finally(()=>{
    toggleLoader(false)
  })
}
function addComment(e){
  let commentBody = document.getElementById("add-comment-body").value
  let token = localStorage.getItem('token');
  let body = {
    "body": commentBody
  }
  toggleLoader(true)
  axios.post(`${baseUrl}/posts/${id}/comments`, body, {headers: {
    'authorization': `Bearer ${token}`
  }})
  .then((response => {
    getOnePost(id)
    showAlert('success','comment added successfully!')
  })).catch((error => {
    showAlert('error',`${error.response.data.message}`)
  })).finally(()=>{
    toggleLoader(false)
  })
}
let getPostId;
let editPostDescription = document.getElementById("edit-post-description")
let editPostImage = document.getElementById('edit-post-image');
function getvalues(postBody,postId,postImage){
  editPostDescription.value = postBody
  getPostId = postId
  editPostImage.files[0] = postImage
}
function editPost(){
  let token = localStorage.getItem('token');
  let formData = new FormData()
  formData.append('body',editPostDescription.value)
  formData.append('image',editPostImage.files[0])
  formData.append('_method',"put")
  toggleLoader(true)
  axios.post(`${baseUrl}/posts/${getPostId}`,formData,{headers: {
    'authorization': `Bearer ${token}`
  }})
  .then((response => {
    if(page == "profile"){
      profilePosts(id)
    }else{
      getPosts(1,true)
    }
    setupUi()
    showAlert('success','post updated successfully!')
  })).catch((error => {
    showAlert('error',`${error.response.data.error_message}`)
  })).finally(()=>{
    toggleLoader(false)
  })
  document.getElementById('edit-post-close-btn').click()
}
function deletePost(){
  let token = localStorage.getItem('token');
  toggleLoader(true)
  axios.delete(`${baseUrl}/posts/${getPostId}`,{headers: {
    'authorization': `Bearer ${token}`
  }})
  .then((response => {
    if(page == "profile"){
      profilePosts(id)
    }else{
      getPosts(1,true)
    }
    setupUi()
    showAlert('success','post deleted successfully!')
  })).catch((error => {
    showAlert('error',`${error.response.data.error_message}`)
  })).finally(()=>{
    toggleLoader(false)
  })
  document.getElementById('delete-post-close-btn').click()
}

function profileDetails(id){
  toggleLoader(true)
  axios.get(`${baseUrl}/users/${id}`)
  .then((response => {
    let user = response.data.data
    let email
    if(user.email === null){
      email = "No Email"
    }else{
      email = user.email 
    }
    let content = `
            <img class="rounded-circle" style="width: 120px; height: 95px;" src="${user.profile_image}" alt="">
          <div id="profile-emails" style="font-weight: 500;">
              <p>${email}</p>
              <p>${user.username}</p>
              <p>${user.name}</p>
          </div>
          <div id="profile-counts" class="col-8">
              <div>
                  <span style="font-size: 26px; font-weight: 400;">${user.posts_count}</span>
                  <span style="color: rgb(129, 129, 129);">Posts</span>
              </div>
              <div>
                  <span style="font-size: 26px; font-weight: 400;">${user.comments_count}</span>
                  <span style="color: rgb(129, 129, 129);">Comments</span>
              </div>
          </div>
    `
    document.getElementById("profile_details").innerHTML = content
  })).finally(()=>{
    toggleLoader(false)
  })
}
function profilePosts(id){
  toggleLoader(true)
  axios.get(`${baseUrl}/users/${id}/posts`)
  .then(function (response) {
    response = response.data
    console.log(response);
    const postsDiv = document.getElementById('posts')
      postsDiv.innerHTML = '';
    let user = JSON.parse(localStorage.getItem('user'))
    let token = localStorage.getItem('token');
    let editPostIcon = ''
    let deletePostIcon = ''
    for(post of response.data){
      if(user != null && token != null){
        if(post.author.id == user.id){
          editPostIcon = `<i class="fa-solid fa-pen-to-square" style="position: absolute; right: 20px; font-size: 24px; cursor: pointer;" title="Edit Post" data-bs-target="#editPostModal" data-bs-toggle="modal" onclick="getvalues('${post.body}',${post.id},'${post.image}')"></i>`
          deletePostIcon = `<i class="fa-solid fa-trash-can" style="position: absolute; right: 60px; font-size: 24px; cursor: pointer;" title="Delete Post" data-bs-target="#deletePostModal" data-bs-toggle="modal" onclick="getvalues('',${post.id})"></i>`
        }
        else{
          editPostIcon = ''
          deletePostIcon = ''
        }
      }else{
        editPostIcon = ''
        deletePostIcon = ''
      }
        postsDiv.innerHTML += `
                <div class="row row-cols-1 row-cols-md-3 g-4 col-12 col-lg-7  m-auto">
            <div class="card h-100 w-100 p-0">
              <div class="d-flex mt-1 align-items-center">
                <img style="width: 35px; height: 35px;" class="rounded-circle m-1 mx-2" src="${post.author.profile_image}" alt="">
              <h5 class="card-title mt-2" style="font-size: 18px;">${post.author.username}</h5>
              ${editPostIcon}
              ${deletePostIcon}
              </div>
              <img onclick="postClicked(${post.id})"  style="width: 100%; height: 400px; cursor: pointer;" class="rounded-top-2" src="${post.image}" class="card-img-top" alt="...">
              <div class="card-body pt-2">
                <p class="mb-2 fw-semibold" style="color: gray; font-size: 14px;">${post.created_at}</p>
                <p class="card-text fw-semibold" style="font-size: 14px;">${post.body}</p>
                <hr style="border-color: black;">
                <div class="d-flex align-items-center">
                  <i class="fa-solid fa-pen"></i>
                  <p onclick="postClicked(${post.id})" class="m-0 ms-1 fw-semibold" style="cursor: pointer"><span>(${post.comments_count})</span> comments</p>
                </div>
              </div>
            </div>
            
          </div>
        `
    }
  }).finally(()=>{
    toggleLoader(false)
  })
}

//comments
// register response :

// {
//   "user": {
//       "username": "hesham55",
//       "name": "hesham",
//       "email": null,
//       "id": 11607,
//       "profile_image": {},
//       "comments_count": 0,
//       "posts_count": 0
//   },
//   "token": "112720|E833QGTdo7IotlCY1PON6dChU2diXc25Iwoq35w1"
// }

// axios.post('https://httpbin.org/post', {
//   firstName: 'Fred',
//   lastName: 'Flintstone',
//   orders: [1, 2, 3],
//   photo: document.querySelector('#fileInput').files
// }, {
//   headers: {
//     'Content-Type': 'multipart/form-data'
//   }
// }
// )

// window.onscroll = function() {
//   if() {
//       console.log('bottom!');
//   }
// };

// document.head.getElementsByTagName('title')[0].innerHTML

/*
<div id="comment-box" class="py-3 border-bottom border-1 border-opacity-25 border-dark" >
<div id="comment-header">
  <div class="d-flex">
    <img style="width: 35px; height: 35px;" class="rounded-circle m-1 ms-0 me-2" src="./images/img2.jpg" alt="">
    <h5 class="card-title mt-2" style="font-size: 18px;">samer56</h5>
  </div>
</div>
<div id="comment-body" class="pt-1">
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit eveniet numquam corrupti.
</div>
</div>
*/