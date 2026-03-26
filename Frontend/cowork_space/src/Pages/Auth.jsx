import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Auth.module.css";  // ✅ Separate CSS import


function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = () => {


    //  Validation
    if (!formData.username || !formData.password) {
      alert("Please fill all required fields ");
      return;
    }


    if (!isLogin && !formData.email) {
      alert("Email is required ");
      return;
    }


    if (isLogin) {
      // LOGIN
      axiosInstance.post("login/", {
        username: formData.username,
        password: formData.password
      })
      .then((res) => {
        //  Store tokens
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);


        // Store admin status
        localStorage.setItem("is_admin", res.data.is_admin);


        alert("Login successful ");


        // Redirect properly
        if (res.data.is_admin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Invalid credentials ");
      });


    } else {
      //  REGISTER
      axiosInstance.post("register/", formData)
        .then(() => {
          alert("Registered successfully ");
          setIsLogin(true);
        })
        .catch((err) => {
          console.log(err);
          alert("Error in registration ");
        });
    }
  };


  return (
    <div className={styles.container}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>


      <input 
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className={styles.input}
      />


      {!isLogin && (
        <input 
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className={styles.input}
        />
      )}


      <input 
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className={styles.input}
      />


      <button onClick={handleSubmit} className={styles.button}>
        {isLogin ? "Login" : "Signup"}
      </button>


      <p 
        onClick={() => setIsLogin(!isLogin)} 
        className={styles.toggleLink}
      >
        {isLogin ? "Create account?" : "Already have account?"}
      </p>
    </div>
  );
}


export default Auth;
