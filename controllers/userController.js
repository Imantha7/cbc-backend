import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config()

export function createUser(req,res){

  const newUserData = req.body

  if(newUserData.type == "admin"){

    if(req.user==null){
      res.json({
        message: "Please login as administrator to create admin accounts"
      })
      return
    }   
    
    if(req.user.type != "admin"){
      res.json({
        message: "Please login as administrator to create admin accounts"
      })
      return
    }
  }

  newUserData.password = bcrypt.hashSync(newUserData.password, 10)  

  const user = new User(newUserData)

  user.save().then(()=>{
    res.json({
      message: "User created"
    })
  }).catch((error)=>{
    res.json({      
      message: "User not created"
    })
  })
  
}

export function loginUser(req,res){

  User.find({email : req.body.email}).then(
    (users)=>{
      if(users.length == 0){

        res.json({
          message: "User not found"
        })

      }else{

        const user = users[0]

        const isPasswordCorrect = bcrypt.compareSync(req.body.password,user.password)

        if(isPasswordCorrect){

          const token = jwt.sign({
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            isBlocked : user.isBlocked,
            type : user.type,
            profilePicture : user.profilePicture
          } , process.env.SECRET)
          
          res.json({
            message: "User logged in",
            token: token,
            user : {
              firstName : user.firstName,
              lastName : user.lastName,
              type : user.type,
              profilePicture : user.profilePicture,
              email : user.email
            }
          })
          
        }else{
          res.json({
            message: "User not logged in (wrong password)"
          })
        }
      }
    }
  )
}

export function isAdmin(req){
  if(req.user==null){
    return false
  }

  if(req.user.type != "admin"){
    return false
  }

  return true
}

export function isCustomer(req){
  if(req.user==null){
    return false
  }

  if(req.user.type != "customer"){
    return false
  }

  return true
} 

export async function googleLogin(req,res){
  console.log(req.body);
  const token = req.body.token

  try{
    const response =  await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const email = response.data.email
    //check if user exists
    const usersList = await User.find({email: email})
    if(usersList.length >0){
      const user = usersList[0]
      const token = jwt.sign({
        email : user.email,
        firstName : user.firstName,
        lastName : user.lastName,
        isBlocked : user.isBlocked,
        type : user.type,
        profilePicture : user.profilePicture
      } , process.env.SECRET)
      
      res.json({
        message: "User logged in",
        token: token,
        user : {
          firstName : user.firstName,
          lastName : user.lastName,
          type : user.type,
          profilePicture : user.profilePicture,
          email : user.email
        }
      })
    }else{
      //create new user
      const newUserData = {
        email: email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        type: "customer",
        password: "ffffff",
        profilePicture: response.data.picture
      }
      const user = new User(newUserData)
      user.save().then(()=>{
        res.json({
          message: "User created"
        })
      }).catch((error)=>{
        res.json({      
          message: "User not created"
        })
      })

    }

  }catch(e){
    res.json({
      message: "Google login failed"
    })
  }


}

//imantha@example.com - securePassword123 - admin
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImltYW50aGFAZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJKb2huIiwibGFzdE5hbWUiOiJEb2UiLCJpc0Jsb2NrZWQiOmZhbHNlLCJ0eXBlIjoiYWRtaW4iLCJwcm9maWxlUGljdHVyZSI6Imh0dHBzOi8vaW1nLmZyZWVwaWsuY29tL2ZyZWUtdmVjdG9yL3VzZXItYmx1ZS1ncmFkaWVudF83ODM3MC00NjkyLmpwZyIsImlhdCI6MTczNTc4OTQwOH0.B6_yueN7HJVnBhOP2VrIaSTDuNdNucF8jXfCs_sq9ag
//imantha2@example.com - securePassword123 - customer
//token - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImltYW50aGEyQGV4YW1wbGUuY29tIiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiaXNCbG9ja2VkIjpmYWxzZSwidHlwZSI6ImN1c3RvbWVyIiwicHJvZmlsZVBpY3R1cmUiOiJodHRwczovL2ltZy5mcmVlcGlrLmNvbS9mcmVlLXZlY3Rvci91c2VyLWJsdWUtZ3JhZGllbnRfNzgzNzAtNDY5Mi5qcGciLCJpYXQiOjE3MzU3ODUxODh9.AdzsAgahEyYySy5O71cp1bj5ZSLbXFPwBoNJvwWInbU

//'https://www.googleapis.com/oauth2/v3/userinfo'

